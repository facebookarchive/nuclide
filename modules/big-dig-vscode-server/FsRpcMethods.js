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

import {Observable} from 'rxjs';
import fsPromise from 'nuclide-commons/fsPromise';
import fs from 'fs';
import pathModule from 'path';
import rimraf from 'rimraf';
import {RpcMethodError} from './RpcMethodError';
import {WatchmanClient, WatchmanSubscription} from 'nuclide-watchman-helpers';
import {getLogger} from 'log4js';

import type {RpcRegistrar} from './rpc-types';
import type {
  BufferEncoding,
  FsGetFileContentsParams,
  FsGetFileContentsResult,
  FsMkdirParams,
  FsMkdirResult,
  FsMoveParams,
  FsMoveResult,
  FsCopyParams,
  FsCopyResult,
  FsDeleteParams,
  FsDeleteResult,
  FsReadData,
  FsReadParams,
  FsReaddirParams,
  FsReaddirResult,
  FsStatParams,
  FsStatResult,
  FsWatchData,
  FsWatchEntry,
  FsWatchParams,
  FsWriteParams,
  FsWriteResult,
} from './Protocol';

const BUFFER_ENCODING: BufferEncoding = 'utf-8';
const logger = getLogger('fs-rpc');

export class FsRpcMethods {
  _watcher: WatchmanClient;

  constructor(watcher: WatchmanClient) {
    this._watcher = watcher;
  }

  register(registrar: RpcRegistrar) {
    const regFn = registrar.registerFun.bind(registrar);
    const regObs = registrar.registerObservable.bind(registrar);

    regFn('fs/get-file-contents', this._getFileContents.bind(this));

    regObs('fs/watch', this._watch.bind(this));
    regObs('fs/read', this._read.bind(this));
    regFn('fs/stat', this._stat.bind(this));
    regFn('fs/write', this._write.bind(this));
    regFn('fs/move', this._move.bind(this));
    regFn('fs/copy', this._copy.bind(this));
    regFn('fs/mkdir', this._mkdir.bind(this));
    regFn('fs/readdir', this._readdir.bind(this));
    regFn('fs/delete', this._delete.bind(this));
  }

  async _stat(params: FsStatParams): Promise<FsStatResult> {
    const stats = await fsPromise.lstat(params.path);
    const {atime, mtime, ctime, size, mode} = stats;
    if (stats.isSymbolicLink()) {
      try {
        const stats2 = await fsPromise.stat(params.path);
        return {
          atime: stats2.atime.valueOf(),
          mtime: stats2.mtime.valueOf(),
          ctime: stats2.ctime.valueOf(),
          size: stats2.size,
          mode: stats2.mode,
          isFile: stats2.isFile() ? true : undefined,
          isDirectory: stats2.isDirectory() ? true : undefined,
          isSymlink: true,
        };
      } catch (error) {}
    }
    return {
      atime: atime.valueOf(),
      mtime: mtime.valueOf(),
      ctime: ctime.valueOf(),
      size,
      mode,
      isFile: stats.isFile() ? true : undefined,
      isDirectory: stats.isDirectory() ? true : undefined,
    };
  }

  _read(params: FsReadParams): Observable<FsReadData> {
    return Observable.create(observer => {
      const end =
        params.length === -1 ? undefined : params.offset + params.length - 1;
      const stream = fs.createReadStream(params.path, {
        encoding: BUFFER_ENCODING,
        start: params.offset,
        end,
        autoClose: true,
      });
      function cleanup() {
        stream.removeAllListeners('data');
        stream.removeAllListeners('end');
        stream.removeAllListeners('error');
      }
      stream.on('data', data => {
        observer.next(data);
      });
      stream.on('end', () => {
        cleanup();
        observer.complete();
      });
      stream.on('error', error => {
        cleanup();
        observer.error(error);
      });
      return () => {
        cleanup();
        observer.error(new Error('Disposed'));
      };
    });
  }

  async _write(params: FsWriteParams): Promise<FsWriteResult> {
    const data = Buffer.from(params.content, BUFFER_ENCODING);
    const flags = [
      fs.constants.O_WRONLY,
      fs.constants.O_TRUNC,
      params.create ? fs.constants.O_CREAT : 0,
      params.overwrite || !params.create ? 0 : fs.constants.O_EXCL,
    ] // eslint-disable-next-line no-bitwise
      .reduce((acc, f) => acc | f, 0);

    await fsPromise.writeFile(params.path, data, {flags});
    return {};
  }

  async _move(params: FsMoveParams): Promise<FsMoveResult> {
    await fsPromise.mv(params.source, params.destination, {
      clobber: params.overwrite,
    });
    return {};
  }

  async _copy(params: FsCopyParams): Promise<FsCopyResult> {
    const {overwrite, source, destination} = params;
    if (!overwrite && (await fsPromise.exists(destination))) {
      throw new RpcMethodError(
        `Cannot copy ${source} to ${destination}; ` +
          'destination file already exists',
        {code: 'EEXIST'},
      );
    }
    await fsPromise.copy(source, destination);
    return {};
  }

  async _mkdir(params: FsMkdirParams): Promise<FsMkdirResult> {
    await fsPromise.mkdirp(params.path);
    return {};
  }

  async _readdir(params: FsReaddirParams): Promise<FsReaddirResult> {
    const files: Array<string> = await fsPromise.readdir(params.path);
    return Promise.all(
      files.map(async file => {
        const stat = await this._stat({
          path: pathModule.join(params.path, file),
        });
        return ([file, stat]: [string, FsStatResult]);
      }),
    );
  }

  async _delete(params: FsDeleteParams): Promise<FsDeleteResult> {
    if (params.recursive) {
      return new Promise((resolve, reject) => {
        rimraf(params.path, {disableGlobs: true}, (err, result) => {
          if (err == null) {
            resolve({});
          } else {
            reject(err);
          }
        });
      });
    } else {
      const stats = await fsPromise.lstat(params.path);
      if (stats.isDirectory()) {
        await fsPromise.rmdir(params.path);
      } else {
        await fsPromise.unlink(params.path);
      }
    }
    return {};
  }

  _watch(params: FsWatchParams): Observable<FsWatchData> {
    return Observable.create(observer => {
      const {recursive, exclude} = params;

      const excludeExpr = exclude.map(x => ['match', x, 'wholename']);
      if (!recursive) {
        // Do not match files in subdirectories:
        excludeExpr.push(['dirname', '', ['depth', 'ge', 2]]);
      }
      const opts =
        excludeExpr.length > 0
          ? {expression: ['not', ['anyof', ...excludeExpr]]}
          : undefined;

      logger.info(`Watching ${params.path} ${JSON.stringify(opts)}`);
      const subName = `big-dig-filewatcher-${params.path}`;
      const doSub = this._watcher.watchDirectoryRecursive(
        params.path,
        subName,
        opts,
      );

      doSub.then(
        (sub: WatchmanSubscription) => {
          sub.on('error', error => observer.error(error));
          sub.on('change', entries => {
            const changes = entries.map(
              (entry): FsWatchEntry => {
                if (!entry.exists) {
                  return {path: entry.name, type: 'd'};
                } else if (entry.new) {
                  return {path: entry.name, type: 'a'};
                } else {
                  return {path: entry.name, type: 'u'};
                }
              },
            );
            observer.next(changes);
          });
        },
        error => observer.error(error),
      );

      return async () => {
        try {
          await doSub;
        } catch (error) {
          // Ignore error because it has already been handled by `observer`.
          return;
        }

        try {
          this._watcher.unwatch(subName);
          logger.info(
            `Stopped watching ${params.path} ${JSON.stringify(opts)}`,
          );
        } catch (error) {
          logger.error('Error when unsubscribing from watch:\n', error);
        }
      };
    });
  }

  async _getFileContents(
    params: FsGetFileContentsParams,
  ): Promise<FsGetFileContentsResult> {
    const {path} = params;
    const contents = await fsPromise.readFile(path, 'utf8');
    return {contents};
  }
}
