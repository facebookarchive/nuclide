"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertToFsFileStat = convertToFsFileStat;
exports.convertToFsDirectoryEntries = convertToFsDirectoryEntries;

var _fs = _interopRequireDefault(require("fs"));

function _filesystem_types() {
  const data = _interopRequireDefault(require("../../../../modules/big-dig/src/thrift-services/fs/gen-nodejs/filesystem_types"));

  _filesystem_types = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
function convertToFsFileStat(stat) {
  const fileStat = new _fs.default.Stats();
  fileStat.dev = stat.dev;
  fileStat.mode = stat.mode;
  fileStat.nlink = stat.nlink;
  fileStat.uid = stat.uid;
  fileStat.gid = stat.gid;
  fileStat.rdev = stat.rdev;
  fileStat.blksize = stat.blksize;
  fileStat.ino = stat.ino;
  fileStat.size = stat.size;
  fileStat.blocks = stat.blocks;
  fileStat.atime = new Date(stat.atime);
  fileStat.mtime = new Date(stat.mtime);
  fileStat.ctime = new Date(stat.ctime);
  fileStat.birthtime = new Date(stat.birthtime);
  return fileStat;
}

function convertToFsDirectoryEntries(entries) {
  return entries.map(entry => {
    const localName = entry.fname;

    const isFile = entry.ftype !== _filesystem_types().default.FileType.DIRECTORY;

    const isSymbolicLink = entry.isSymbolicLink;
    return [localName, isFile, isSymbolicLink];
  });
}