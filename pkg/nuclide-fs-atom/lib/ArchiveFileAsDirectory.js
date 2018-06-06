'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArchiveFileAsDirectory = undefined;

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _common;

function _load_common() {
  return _common = require('./common');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This class represents the node that transitions via getParent() from inside an
 * archive file out to the root file system.  This way getParent() always returns
 * something that looks like a Directory.  However, once you getParent() on this,
 * you are out in an environment where this just looks like a file.
 */
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

class ArchiveFileAsDirectory {

  constructor(path, fs) {
    this._fs = fs;
    this._path = path;
    this._file = (_nuclideUri || _load_nuclideUri()).default.isInArchive(path) ? fs.newArchiveFile(path) : new _atom.File(path);
  }

  create(mode) {
    return (0, (_common || _load_common()).rejectWrite)();
  }

  isFile() {
    return false;
  }

  isDirectory() {
    return true;
  }

  exists() {
    return this._file.exists();
  }

  getPath() {
    return this._file.getPath();
  }

  getBaseName() {
    return this._file.getBaseName();
  }

  relativize(fullPath) {
    return (_nuclideUri || _load_nuclideUri()).default.relative(this._path, fullPath);
  }

  onDidChange(callback) {
    return this._file.onDidChange(callback);
  }

  onDidRename(callback) {
    return this._file.onDidRename(callback);
  }

  onDidDelete(callback) {
    return this._file.onDidDelete(callback);
  }

  getParent() {
    return this._file.getParent();
  }

  getFile(name) {
    const path = (_nuclideUri || _load_nuclideUri()).default.archiveJoin(this._path, name);
    return this._fs.newArchiveFile(path);
  }

  getSubdirectory(name) {
    const path = (_nuclideUri || _load_nuclideUri()).default.archiveJoin(this._path, name);
    return this._fs.newArchiveDirectory(path);
  }

  getEntries(callback) {
    this._fs.readdir(this._path).then(entries => entries.map(x => (0, (_common || _load_common()).fromEntry)(this._fs, this._path, false, x))).then(entries => callback(null, entries)).catch(error => callback(error, null));
  }

  contains(path) {
    return path.startsWith(this._path) && path.length > this._path.length && path.charAt(this._path.length) === (_nuclideUri || _load_nuclideUri()).default.ARCHIVE_SEPARATOR;
  }
}
exports.ArchiveFileAsDirectory = ArchiveFileAsDirectory;