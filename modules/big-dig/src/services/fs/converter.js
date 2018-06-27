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
import {getLogger} from 'log4js';

const logger = getLogger('fs-thrift-server-handler');

export function convertToThriftFileStat(
  statData: fs.Stats,
): filesystem_types.FileStat {
  const {size, atime, mtime, ctime} = statData;
  const fileStat = new filesystem_types.FileStat();
  fileStat.fsize = size;
  fileStat.atime = atime.toString();
  fileStat.mtime = mtime.toString();
  fileStat.ctime = ctime.toString();
  fileStat.ftype = toThriftFileType(statData);
  return fileStat;
}

function toThriftFileType(statData: fs.Stats): filesystem_types.FileType {
  if (statData.isFile() && statData.isDirectory()) {
    logger.warn('Encountered a path that is both a file and directory.');
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

export function genWatchExcludedExpressions(
  excludes: Array<string>,
): Array<mixed> {
  return excludes.map(patternToIgnore => {
    return [
      'not',
      ['match', patternToIgnore, 'wholename', {includedotfiles: true}],
    ];
  });
}

/**
 * Create Thrift Error based on raw error object and more `details` (optional
 * argument, default is empty object)
 */
export function createThriftError(
  err: Object,
  details: Object = {},
): filesystem_types.Error {
  const error = new filesystem_types.Error();
  error.code = err.code;
  error.message =
    filesystem_types.ERROR_MAP[filesystem_types.ErrorCode[err.code]];
  error.details = JSON.stringify(details);
  return error;
}

/**
 * Create Thrift Error based on given known Thrift ErrorCode and details
 */
export function createThriftErrorWithCode(
  errorCode: filesystem_types.ErrorCode,
  details: Object = {},
): filesystem_types.Error {
  const error = new filesystem_types.Error();
  error.code = errorCode;
  error.message = filesystem_types.ERROR_MAP[errorCode];
  error.details = JSON.stringify(details);
  return error;
}
