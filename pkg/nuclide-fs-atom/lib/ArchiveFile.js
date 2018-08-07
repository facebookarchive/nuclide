"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArchiveFile = void 0;

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
class ArchiveFile {
  constructor(path, fs) {
    this._fs = fs;
    this._path = path;
    this._encoding = 'utf8';
  }

  create() {
    return (0, _common().rejectWrite)();
  }

  isFile() {
    return true;
  }

  isDirectory() {
    return false;
  }

  exists() {
    return this._fs.exists(this._path);
  }

  existsSync() {
    return true;
  }

  setEncoding(encoding) {
    this._encoding = encoding;
  }

  getEncoding() {
    return this._encoding;
  }

  onDidRename(callback) {
    return new (_UniversalDisposable().default)();
  }

  onDidDelete(callback) {
    return new (_UniversalDisposable().default)();
  }

  onDidChange(callback) {
    return new (_UniversalDisposable().default)();
  }

  onWillThrowWatchError(callback) {
    return new (_UniversalDisposable().default)();
  }

  getPath() {
    return this._path;
  }

  getBaseName() {
    return _nuclideUri().default.basename(this._path);
  }

  getParent() {
    return (0, _common().getParentDir)(this._fs, this._path);
  }

  createReadStream() {
    let started = false;

    const createStream = () => this._fs.createReadStream(this._path);

    const stream = new _stream.default.Readable({
      read(size) {
        if (!started) {
          started = true;
          const disposer = new (_UniversalDisposable().default)();
          const inner = createStream();
          disposer.add(inner.subscribe(buffer => {
            stream.push(buffer);
          }, err => {
            stream.emit('error', err);
            disposer.dispose();
          }, () => {
            stream.push(null);
            disposer.dispose();
          }), inner.connect());
        }
      }

    });
    return stream;
  }

  createWriteStream() {
    throw new Error('Archive files do not support writing.');
  }

  read(flushCache) {
    const encoding = this._encoding;
    return this._fs.readFile(this._path).then(buffer => buffer.toString(encoding));
  }

  write(text) {
    return (0, _common().rejectWrite)();
  }

  writeSync(text) {
    (0, _common().rejectWriteSync)();
  }

}

exports.ArchiveFile = ArchiveFile;