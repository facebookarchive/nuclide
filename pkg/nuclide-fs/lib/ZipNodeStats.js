"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ZipNodeStats = void 0;

var _fs = _interopRequireDefault(require("fs"));

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
class ZipNodeStats extends _fs.default.Stats {
  constructor(outer, entry) {
    super();
    const header = entry.header;
    this.dev = outer.dev;
    this.ino = outer.ino;
    this.mode = modeFromZipAttr(header.attr);
    this.nlink = 1; // TODO: figure out directory link count?

    this.uid = outer.uid;
    this.gid = outer.gid;
    this.rdev = outer.rdev;
    this.size = header.size;
    this.blksize = outer.blksize;
    this.blocks = Math.floor((header.compressedSize - 1) / outer.blksize) + 1;
    this.atime = header.time;
    this.mtime = header.time;
    this.ctime = outer.ctime;
    this._isDirectory = entry.isDirectory;
    this._isSymbolicLink = isSymbolicLinkAttr(header.attr);
  }

  isFile() {
    return !this.isDirectory() && !this.isSymbolicLink();
  }

  isDirectory() {
    return this._isDirectory;
  }

  isBlockDevice() {
    return false;
  }

  isCharacterDevice() {
    return false;
  }

  isSymbolicLink() {
    return this._isSymbolicLink;
  }

  isFIFO() {
    return false;
  }

  isSocket() {
    return false;
  }

}

exports.ZipNodeStats = ZipNodeStats;

function modeFromZipAttr(attr) {
  // eslint-disable-next-line no-bitwise
  return attr >>> 16;
} // eslint-disable-next-line no-bitwise


const ATTR_FILETYPE_MASK = 0xf << 28; // eslint-disable-next-line no-bitwise

const ATTR_FILETYPE_SYMLINK = 0xa << 28;

function isSymbolicLinkAttr(attr) {
  // eslint-disable-next-line no-bitwise
  return (attr & ATTR_FILETYPE_MASK) === ATTR_FILETYPE_SYMLINK;
}