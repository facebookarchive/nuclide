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
import filesystem_types from './gen-nodejs/filesystem_types';
import fsPromise from 'nuclide-commons/fsPromise';
import {getLogger} from 'log4js';
import {WatchmanClient} from 'nuclide-watchman-helpers';

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
  _fileChangeWatcher: any;
  _logger: log4js$Logger;
  _watcher: WatchmanClient;

  constructor(watcher: WatchmanClient) {
    this._fileChangeEvents = [];
    this._watcher = watcher;
    this._logger = getLogger('fs-thrift-server-handler');
  }

  async watch(uri: string, options: filesystem_types.WatchOpt): Promise<void> {
    const {recursive, excludes} = options;

    const excludeExpr = this._genWatchExcludedExpressions(excludes);
    if (!recursive) {
      // Do not match files in subdirectories:
      excludeExpr.push(['not', ['dirname', '', ['depth', 'ge', 2]]]);
    }
    const opts = {
      expression: ['allof', ...commonWatchIgnoredExpressions, ...excludeExpr],
    };

    this._logger.info(`Watching ${uri} ${JSON.stringify(opts)}`);
    const subName = `big-dig-thrift-filewatcher-${uri}`;
    try {
      const sub = await this._watcher.watchDirectoryRecursive(
        uri,
        subName,
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
        this._fileChangeEvents.push(...changes);
      });
    } catch (err) {
      this._logger.error(
        'BigDig Thrift FS Server Watchman Subscription Creation Error',
      );
      this._logger.error(err);
    }
    return;
  }

  pollFileChanges(): Array<filesystem_types.FileChangeEvent> {
    const retEventChangeList = this._fileChangeEvents;
    this._fileChangeEvents = [];
    return retEventChangeList;
  }

  async createDirectory(uri: string): Promise<void> {
    try {
      return await fsPromise.mkdir(uri);
    } catch (err) {
      throw this._createThriftError(err);
    }
  }

  async stat(uri: string): Promise<filesystem_types.FileStat> {
    try {
      const statData = await fsPromise.lstat(uri);
      const fileStat = this._toFileStat(statData);
      return fileStat;
    } catch (err) {
      throw this._createThriftError(err);
    }
  }

  // Always returns a Buffer
  async readFile(uri: string): Promise<Buffer> {
    try {
      const contents = await fsPromise.readFile(uri);
      return contents;
    } catch (err) {
      throw this._createThriftError(err);
    }
  }

  async writeFile(
    uri: string,
    content: Buffer,
    options: filesystem_types.WriteFileOpt,
  ): Promise<void> {
    try {
      const flags = [
        fs.constants.O_WRONLY,
        fs.constants.O_TRUNC,
        options.create ? fs.constants.O_CREAT : 0,
        options.overwrite || !options.create ? 0 : fs.constants.O_EXCL,
      ] // eslint-disable-next-line no-bitwise
        .reduce((acc, f) => acc | f, 0);

      await fsPromise.writeFile(uri, content, {flags});
    } catch (err) {
      throw this._createThriftError(err);
    }
  }

  _toFileStat(statData: fs.Stats): filesystem_types.FileStat {
    const {size, atime, mtime, ctime} = statData;
    const fileStat = new filesystem_types.FileStat();
    fileStat.fsize = size;
    fileStat.atime = atime.toString();
    fileStat.mtime = mtime.toString();
    fileStat.ctime = ctime.toString();
    fileStat.ftype = this._toFileType(statData);
    return fileStat;
  }

  _toFileType(statData: fs.Stats): filesystem_types.FileType {
    if (statData.isFile() && statData.isDirectory()) {
      this._logger.warn(
        'Encountered a path that is both a file and directory.',
      );
    }
    if (statData.isFile()) {
      return filesystem_types.FileType.FILE;
    } else if (statData.isDirectory()) {
      return filesystem_types.FileType.DIRECTORY;
    } else if (statData.isSymbolicLink()) {
      return filesystem_types.FileType.SYMLINK;
    } else {
      return filesystem_types.FileType.UNKNOWN;
    }
  }

  _genWatchExcludedExpressions(excludes: Array<string>): Array<mixed> {
    return excludes.map(patternToIgnore => {
      return [
        'not',
        ['match', patternToIgnore, 'wholename', {includedotfiles: true}],
      ];
    });
  }

  _createThriftError(err: Object): filesystem_types.Error {
    const error = new filesystem_types.Error();
    error.code = err.code;
    error.message =
      filesystem_types.ERROR_MAP[filesystem_types.ErrorCode[err.code]];
    return error;
  }

  dispose() {
    this._fileChangeWatcher.close();
  }
}
