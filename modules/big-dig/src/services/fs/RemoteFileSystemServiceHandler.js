/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import fs from 'fs';
import path from 'path';
import uuid from 'uuid';
import rimraf from 'rimraf';
import filesystem_types from './gen-nodejs/filesystem_types';
import fsPromise from 'nuclide-commons/fsPromise';
import {getLogger} from 'log4js';
import {WatchmanClient} from 'nuclide-watchman-helpers';
import {
  convertToThriftFileStat,
  genWatchExcludedExpressions,
  createThriftError,
  createThriftErrorWithCode,
  convertToThriftFileEntry,
} from './converter';

const commonWatchIgnoredExpressions = [
  ['not', ['dirname', '.hg']],
  ['not', ['match', 'hg-checkexec-*', 'wholename']],
  ['not', ['match', 'hg-checklink-*', 'wholename']],
  ['not', ['dirname', '.buckd']],
  ['not', ['dirname', '.idea']],
  ['not', ['dirname', '_build']],
  ['not', ['dirname', 'buck-cache']],
  ['not', ['dirname', 'buck-out']],
  ['not', ['dirname', '.fbbuild/generated']],
  ['not', ['match', '.fbbuild/generated*', 'wholename']],
  ['not', ['match', '_build-junk*', 'wholename']],
];

/**
 * Create a service handler class to manage server methods
 */
export class RemoteFileSystemServiceHandler {
  _fileChangeEvents: Array<filesystem_types.FileChangeEvent>;
  _logger: log4js$Logger;
  _watcher: WatchmanClient;
  _watchIdToChangeList: Map<string, Array<filesystem_types.FileChangeEvent>>;

  constructor(watcher: WatchmanClient) {
    this._fileChangeEvents = [];
    this._watcher = watcher;
    this._logger = getLogger('fs-thrift-server-handler');
    this._watchIdToChangeList = new Map();
  }

  async watch(
    uri: string,
    options: filesystem_types.WatchOpt,
  ): Promise<string> {
    const {recursive, excludes} = options;

    const excludeExpr = genWatchExcludedExpressions(excludes);
    if (!recursive) {
      // Do not match files in subdirectories:
      excludeExpr.push(['not', ['dirname', '', ['depth', 'ge', 2]]]);
    }
    const opts = {
      expression: ['allof', ...commonWatchIgnoredExpressions, ...excludeExpr],
    };

    this._logger.info(`Watching ${uri} ${JSON.stringify(opts)}`);
    const watchId = `big-dig-thrift-filewatcher-${uuid.v4()}`;
    try {
      const sub = await this._watcher.watchDirectoryRecursive(
        uri,
        watchId,
        opts,
      );

      sub.on('error', error => {
        this._logger.error(
          `Watchman Subscription Error: big-dig-thrift-filewatcher-${uri}`,
        );
        this._logger.error(error);
      });
      sub.on('change', entries => {
        const changes = entries.map(
          (entry): filesystem_types.FileChangeEvent => {
            if (!entry.exists) {
              return {
                fname: entry.name,
                eventType: filesystem_types.FileChangeEventType.DELETE,
              };
            } else if (entry.new) {
              return {
                fname: entry.name,
                eventType: filesystem_types.FileChangeEventType.ADD,
              };
            } else {
              return {
                fname: entry.name,
                eventType: filesystem_types.FileChangeEventType.UPDATE,
              };
            }
          },
        );
        // Add new changes into the list of file changes
        const fileChangeList = this._watchIdToChangeList.get(watchId) || [];
        fileChangeList.push(...changes);
        this._watchIdToChangeList.set(watchId, fileChangeList);
      });
    } catch (err) {
      this._logger.error(
        'BigDig Thrift FS Server Watchman Subscription Creation Error',
      );
      this._logger.error(err);
    }
    return watchId;
  }

  async unwatch(watchId: string): Promise<void> {
    try {
      await this._watcher.unwatch(watchId);
    } catch (err) {
      throw createThriftError(err);
    }
  }

  pollFileChanges(watchId: string): Array<filesystem_types.FileChangeEvent> {
    const fileChangeList = this._watchIdToChangeList.get(watchId) || [];
    this._watchIdToChangeList.set(watchId, []);
    return fileChangeList;
  }

  async createDirectory(uri: string): Promise<void> {
    try {
      return await fsPromise.mkdir(uri);
    } catch (err) {
      throw createThriftError(err);
    }
  }

  async stat(uri: string): Promise<filesystem_types.FileStat> {
    try {
      const statData = await fsPromise.stat(uri);
      return convertToThriftFileStat(statData);
    } catch (err) {
      throw createThriftError(err);
    }
  }

  async lstat(uri: string): Promise<filesystem_types.FileStat> {
    try {
      const statData = await fsPromise.lstat(uri);
      return convertToThriftFileStat(statData);
    } catch (err) {
      throw createThriftError(err);
    }
  }

  // Always returns a Buffer
  async readFile(uri: string): Promise<Buffer> {
    try {
      const contents = await fsPromise.readFile(uri);
      return contents;
    } catch (err) {
      throw createThriftError(err);
    }
  }

  async writeFile(
    uri: string,
    content: Buffer,
    options: filesystem_types.WriteFileOpt,
  ): Promise<void> {
    try {
      let writeOptions = {};
      if (
        options.encoding != null ||
        options.mode != null ||
        options.flag != null
      ) {
        // used in Nuclide
        writeOptions.encoding = options.encoding;
        writeOptions.mode = options.mode;
        writeOptions.flag = options.flag;
      } else {
        // used in VSCode
        const flags = [
          fs.constants.O_WRONLY,
          fs.constants.O_TRUNC,
          options.create ? fs.constants.O_CREAT : 0,
          options.overwrite || !options.create ? 0 : fs.constants.O_EXCL,
        ] // eslint-disable-next-line no-bitwise
          .reduce((acc, f) => acc | f, 0);
        writeOptions = {flags};
      }

      await fsPromise.writeFile(uri, content, writeOptions);
    } catch (err) {
      throw createThriftError(err);
    }
  }

  async rename(
    oldUri: string,
    newUri: string,
    options: filesystem_types.RenameOpt,
  ): Promise<void> {
    try {
      await fsPromise.mv(oldUri, newUri, {clobber: options.overwrite});
    } catch (err) {
      throw createThriftError(err);
    }
  }

  async copy(
    source: string,
    destination: string,
    options: filesystem_types.CopyOpt,
  ): Promise<void> {
    try {
      const {overwrite} = options;
      if (!overwrite && (await fsPromise.exists(destination))) {
        throw createThriftErrorWithCode(filesystem_types.ErrorCode.EEXIST, {
          source,
          destination,
        });
      }
      await fsPromise.copy(source, destination);
    } catch (err) {
      throw createThriftError(err);
    }
  }

  async deletePath(
    uri: string,
    options: filesystem_types.DeleteOpt,
  ): Promise<void> {
    try {
      if (options.recursive) {
        return new Promise((resolve, reject) => {
          rimraf(uri, {disableGlobs: true}, (err, result) => {
            if (err == null) {
              resolve();
            } else {
              reject(createThriftError(err));
            }
          });
        });
      } else {
        const stats = await fsPromise.lstat(uri);
        if (stats.isDirectory()) {
          await fsPromise.rmdir(uri);
        } else {
          await fsPromise.unlink(uri);
        }
      }
    } catch (err) {
      throw createThriftError(err);
    }
  }

  async readDirectory(uri: string): Promise<Array<filesystem_types.FileEntry>> {
    try {
      const files: Array<string> = await fsPromise.readdir(uri);
      // Promise.all either resolves with an array of all resolved promises, or
      // it rejects with a single error
      return Promise.all(
        files.map(async file => {
          const statData = await this.stat(path.join(uri, file));
          return convertToThriftFileEntry(file, statData);
        }),
      );
    } catch (err) {
      throw createThriftError(err);
    }
  }

  dispose(): void {
    for (const watchId of this._watchIdToChangeList.keys()) {
      this._watcher.unwatch(watchId);
    }
    this._watchIdToChangeList.clear();
  }
}
