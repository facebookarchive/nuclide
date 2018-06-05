'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArchiveFile = undefined;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _common;

function _load_common() {
  return _common = require('./common');
}

var _stream = _interopRequireDefault(require('stream'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ArchiveFile {

  constructor(path, fs) {
    this._fs = fs;
    this._path = path;
    this._encoding = 'utf8';
  }

  create() {
    return (0, (_common || _load_common()).rejectWrite)();
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
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  onDidDelete(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  onDidChange(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  onWillThrowWatchError(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  getPath() {
    return this._path;
  }

  getBaseName() {
    return (_nuclideUri || _load_nuclideUri()).default.basename(this._path);
  }

  getParent() {
    return (0, (_common || _load_common()).getParentDir)(this._fs, this._path);
  }

  createReadStream() {
    let started = false;
    const createStream = () => this._fs.createReadStream(this._path);
    const stream = new _stream.default.Readable({
      read(size) {
        if (!started) {
          started = true;
          const disposer = new (_UniversalDisposable || _load_UniversalDisposable()).default();
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
    return (0, (_common || _load_common()).rejectWrite)();
  }

  writeSync(text) {
    (0, (_common || _load_common()).rejectWriteSync)();
  }
}
exports.ArchiveFile = ArchiveFile; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    * @format
                                    */