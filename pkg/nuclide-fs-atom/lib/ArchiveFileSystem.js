'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArchiveFileSystem = undefined;

var _fs = _interopRequireDefault(require('fs'));

var _nuclideFs;

function _load_nuclideFs() {
  return _nuclideFs = require('../../nuclide-fs');
}

var _ArchiveFile;

function _load_ArchiveFile() {
  return _ArchiveFile = require('./ArchiveFile');
}

var _ArchiveFileAsDirectory;

function _load_ArchiveFileAsDirectory() {
  return _ArchiveFileAsDirectory = require('./ArchiveFileAsDirectory');
}

var _ArchiveDirectory;

function _load_ArchiveDirectory() {
  return _ArchiveDirectory = require('./ArchiveDirectory');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

// This exists to break the cycle between ArchiveFile,
// ArchiveDirectory, and ArchiveFileAsDirectory

class ArchiveFileSystem {

  constructor(fileSystem) {
    this._fs = fileSystem;
  }

  newArchiveFile(path) {
    return new (_ArchiveFile || _load_ArchiveFile()).ArchiveFile(path, this);
  }

  newArchiveFileAsDirectory(path) {
    return new (_ArchiveFileAsDirectory || _load_ArchiveFileAsDirectory()).ArchiveFileAsDirectory(path, this);
  }

  newArchiveDirectory(path) {
    return new (_ArchiveDirectory || _load_ArchiveDirectory()).ArchiveDirectory(path, this);
  }

  exists(path) {
    return this._fs.exists(path);
  }

  findNearestFile(name, directory) {
    return this._fs.findNearestFile(name, directory);
  }

  stat(path) {
    return this._fs.stat(path);
  }

  lstat(path) {
    return this._fs.lstat(path);
  }

  mkdir(path) {
    return this._fs.mkdir(path);
  }

  mkdirp(path) {
    return this._fs.mkdirp(path);
  }

  chmod(path, mode) {
    return this._fs.chmod(path, mode);
  }

  chown(path, uid, gid) {
    return this._fs.chown(path, uid, gid);
  }

  newFile(path) {
    return this._fs.newFile(path);
  }

  readdir(path) {
    return this._fs.readdir(path);
  }

  realpath(path) {
    return this._fs.realpath(path);
  }

  move(from, to) {
    return this._fs.move(from, to);
  }

  copy(from, to) {
    return this._fs.copy(from, to);
  }

  rimraf(path) {
    return this._fs.rimraf(path);
  }

  unlink(path) {
    return this._fs.unlink(path);
  }

  readFile(path, options) {
    return this._fs.readFile(path, options);
  }

  createReadStream(path, options) {
    return this._fs.createReadStream(path, options);
  }

  writeFile(path, data, options) {
    return this._fs.writeFile(path, data, options);
  }

  isNfs(path) {
    return this._fs.isNfs(path);
  }

  isFuse(path) {
    return this._fs.isFuse(path);
  }

  openArchive(path) {
    return this._fs.openArchive(path);
  }
}
exports.ArchiveFileSystem = ArchiveFileSystem;