"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertToThriftFileStat = convertToThriftFileStat;
exports.genWatchExcludedExpressions = genWatchExcludedExpressions;
exports.createThriftError = createThriftError;
exports.createThriftErrorWithCode = createThriftErrorWithCode;
exports.convertToThriftFileEntry = convertToThriftFileEntry;

var _fs = _interopRequireDefault(require("fs"));

function _filesystem_types() {
  const data = _interopRequireDefault(require("./gen-nodejs/filesystem_types"));

  _filesystem_types = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('fs-thrift-server-handler');

function convertToThriftFileStat(statData) {
  const fileStat = new (_filesystem_types().default.FileStat)();
  fileStat.dev = statData.dev;
  fileStat.mode = statData.mode;
  fileStat.nlink = statData.nlink;
  fileStat.uid = statData.uid;
  fileStat.gid = statData.gid;
  fileStat.rdev = statData.rdev;
  fileStat.blksize = statData.blksize;
  fileStat.ino = statData.ino;
  fileStat.size = statData.size;
  fileStat.blocks = statData.blocks;
  fileStat.atime = statData.atime.toString();
  fileStat.mtime = statData.mtime.toString();
  fileStat.ctime = statData.ctime.toString();
  fileStat.birthtime = statData.birthtime.toString();
  fileStat.ftype = toThriftFileType(statData);
  return fileStat;
}

function toThriftFileType(statData) {
  if (statData.isFile() && statData.isDirectory()) {
    logger.warn('Encountered a path that is both a file and directory.');
  }

  if (statData.isFile()) {
    return _filesystem_types().default.FileType.FILE;
  } else if (statData.isDirectory()) {
    return _filesystem_types().default.FileType.DIRECTORY;
  } else if (statData.isSymbolicLink()) {
    return _filesystem_types().default.FileType.SYMLINK;
  } else {
    return _filesystem_types().default.FileType.UNKNOWN;
  }
}

function genWatchExcludedExpressions(excludes) {
  return excludes.map(patternToIgnore => {
    return ['not', ['match', patternToIgnore, 'wholename', {
      includedotfiles: true
    }]];
  });
}
/**
 * Create Thrift Error based on raw error object and more `details` (optional
 * argument, default is empty object)
 */


function createThriftError(err, details = {}) {
  const error = new (_filesystem_types().default.Error)();
  const rawErrorCode = err.code;

  const thriftErrorCode = _filesystem_types().default.ErrorCode[rawErrorCode];

  error.details = JSON.stringify(details);

  if (rawErrorCode != null && thriftErrorCode != null) {
    error.code = thriftErrorCode;
    error.message = _filesystem_types().default.ERROR_MAP[thriftErrorCode];
    return error;
  }

  error.code = _filesystem_types().default.ErrorCode.EUNKNOWN;
  error.message = err.message || 'Unknow error type';
  return error;
}
/**
 * Create Thrift Error based on given known Thrift ErrorCode and details
 */


function createThriftErrorWithCode(errorCode, details = {}) {
  const error = new (_filesystem_types().default.Error)();
  error.code = errorCode;
  error.message = _filesystem_types().default.ERROR_MAP[errorCode];
  error.details = JSON.stringify(details);
  return error;
}

function convertToThriftFileEntry(fname, statData) {
  return {
    fname,
    ftype: statData.ftype,
    fstat: statData
  };
}