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
  _logger: log4js$Logger;

  // We need to initialize necessary server handler state later
  constructor() {
    this._logger = getLogger('fs-thrift-server-handler');
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
}
