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

/**
 * Create a service handler class to manage server methods
 */
export class RemoteFileSystemServiceHandler {
  _fileChangeEvents: Array<filesystem_types.FileChangeEvent>;
  _fileChangeWatcher: any;
  _logger: log4js$Logger;

  constructor() {
    this._fileChangeEvents = [];
    this._logger = getLogger('fs-thrift-server-handler');
  }

  watch(uri: string, options: filesystem_types.WatchOpt): void {
    this._logger.info('--------- start to watch: %s', uri);
    this._logger.info(options);
    try {
      this._fileChangeWatcher = fs.watch(uri, options, (eventType, fname) => {
        const event = new filesystem_types.FileChangeEvent();
        if (eventType === 'change') {
          event.eventType = filesystem_types.FileChangeEventType.CHANGE;
        } else if (eventType === 'rename') {
          event.eventType = filesystem_types.FileChangeEventType.RENAME;
        } else {
          event.eventType = filesystem_types.FileChangeEventType.UNKNOWN;
        }
        event.fname = fname;
        this._fileChangeEvents.push(event);
      });
    } catch (err) {
      throw this._createThriftError(err);
    }
  }

  pollFileChanges(): Array<filesystem_types.FileChangeEvent> {
    let count = this._fileChangeEvents.length;
    const retEventChangeList = [];
    try {
      while (count--) {
        retEventChangeList.push(this._fileChangeEvents.shift());
      }
      return retEventChangeList;
    } catch (err) {
      throw this._createThriftError(err);
    }
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
