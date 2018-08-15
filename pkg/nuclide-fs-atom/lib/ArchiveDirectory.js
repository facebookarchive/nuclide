"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArchiveDirectory = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _common() {
  const data = require("./common");

  _common = function () {
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
 *  strict-local
 * @format
 */
class ArchiveDirectory {
  constructor(path, fs) {
    this._fs = fs;
    this._path = path;
  }

  create(mode) {
    return (0, _common().rejectWrite)();
  }

  onDidChange(callback) {
    return new (_UniversalDisposable().default)();
  }

  isFile() {
    return false;
  }

  isDirectory() {
    return true;
  }

  exists() {
    return this._fs.exists(this._path);
  }

  getPath() {
    return this._path;
  }

  getBaseName() {
    return _nuclideUri().default.basename(this._path);
  }

  relativize(fullPath) {
    return _nuclideUri().default.relative(this._path, fullPath);
  }

  onDidRename(callback) {
    return new (_UniversalDisposable().default)();
  }

  onDidDelete(callback) {
    return new (_UniversalDisposable().default)();
  }

  getParent() {
    return (0, _common().getParentDir)(this._fs, this._path);
  }

  getFile(name) {
    const path = _nuclideUri().default.join(this._path, name);

    return this._fs.newArchiveFile(path);
  }

  getSubdirectory(name) {
    const path = _nuclideUri().default.join(this._path, name);

    return this._fs.newArchiveDirectory(path);
  }

  getEntries(callback) {
    this._fs.readdir(this._path).then(entries => entries.map(x => (0, _common().fromEntry)(this._fs, this._path, true, x))).then(entries => callback(null, entries)).catch(error => callback(error, null));
  }

  contains(path) {
    const seps = [_nuclideUri().default.ARCHIVE_SEPARATOR, _nuclideUri().default.pathSeparatorFor(path)];
    return path.startsWith(this._path) && path.length > this._path.length && seps.includes(path.charAt(this._path.length));
  }

}

exports.ArchiveDirectory = ArchiveDirectory;