"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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

var _stream = _interopRequireDefault(require("stream"));

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

/**
 * A Directory object that returns the bare minimum that's required by Atom.
 * It always exists, to satisfy Atom's existence checks.
 * Should be removed ASAP once the remote connection is restored.
 */
class RemoteDirectoryPlaceholder {
  constructor(uri) {
    this.symlink = false;
    this._uri = uri;

    const {
      hostname,
      path
    } = _nuclideUri().default.parse(uri);

    this._hostname = hostname;
    this._path = path;
  }

  create(mode) {
    return Promise.resolve(true);
  }

  onDidChange(callback) {
    return new (_UniversalDisposable().default)();
  }

  onDidChangeFiles(callback) {
    return new (_UniversalDisposable().default)();
  }

  isFile() {
    return false;
  }

  isDirectory() {
    return true;
  }

  isRoot() {
    return this._path === '/';
  }

  exists() {
    return Promise.resolve(true);
  }

  existsSync() {
    return true;
  }

  getPath() {
    return this._uri;
  }

  getBaseName() {
    return _nuclideUri().default.basename(this._uri);
  }

  relativize(uri) {
    if (!uri) {
      return uri;
    }

    const parsedUrl = _nuclideUri().default.parse(uri);

    if (parsedUrl.hostname !== this._hostname) {
      return uri;
    }

    return _nuclideUri().default.relative(this._path, parsedUrl.path);
  }

  onDidRename(callback) {
    return new (_UniversalDisposable().default)();
  }

  onDidDelete(callback) {
    return new (_UniversalDisposable().default)();
  }

  getParent() {
    return new RemoteDirectoryPlaceholder(_nuclideUri().default.dirname(this._uri));
  }

  getFile(filename) {
    return new RemoteFilePlaceholder(_nuclideUri().default.join(this._uri, filename));
  }

  getSubdirectory(dirname) {
    return new RemoteDirectoryPlaceholder(_nuclideUri().default.join(this._uri, dirname));
  }

  getEntries(callback) {
    callback(null, []);
  }

  contains(path) {
    if (path == null) {
      return false;
    }

    return _nuclideUri().default.contains(this._uri, path);
  }

}
/**
 * In contrast to the directory placeholders, the file placeholders never exist.
 * Atom's Git integration, for example, checks for the existence of .git files.
 */


exports.default = RemoteDirectoryPlaceholder;

class RemoteFilePlaceholder {
  constructor(uri) {
    this._uri = uri;
  }

  onDidChange(callback) {
    return new (_UniversalDisposable().default)();
  }

  onDidRename(callback) {
    return new (_UniversalDisposable().default)();
  }

  onDidDelete(callback) {
    return new (_UniversalDisposable().default)();
  }

  onWillThrowWatchError(callback) {
    return new (_UniversalDisposable().default)();
  }

  isFile() {
    return true;
  }

  isDirectory() {
    return false;
  }

  exists() {
    return Promise.resolve(false);
  }

  existsSync() {
    return false;
  }

  getDigestSync() {
    return '';
  }

  async getDigest() {
    return Promise.resolve('');
  }

  setEncoding(encoding) {}

  getEncoding() {
    return null;
  }

  setPath(uri) {
    this._uri = uri;
  }

  getPath() {
    return this._uri;
  }

  getRealPathSync() {
    return this._uri;
  }

  getRealPath() {
    return Promise.resolve(this._uri);
  }

  getBaseName() {
    return _nuclideUri().default.basename(this._uri);
  }

  create() {
    return Promise.resolve(true);
  }

  delete() {
    return Promise.resolve();
  }

  copy(newPath) {
    return Promise.resolve(true);
  }

  read(flushCache) {
    return Promise.resolve('');
  }

  readSync(flushCache) {
    return '';
  }

  write(text) {
    return Promise.resolve();
  }

  getParent() {
    return new RemoteDirectoryPlaceholder(_nuclideUri().default.dirname(this._uri));
  }

  isSymbolicLink() {
    return false;
  }

  createReadStream() {
    const stream = new _stream.default.Readable({
      read(size) {
        stream.push(null);
      }

    });
    return stream;
  }

  createWriteStream() {
    throw new Error('Cannot write to a RemoteFilePlaceholder');
  }

}