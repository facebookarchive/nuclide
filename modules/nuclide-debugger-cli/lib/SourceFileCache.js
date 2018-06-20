'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lineByLine;

function _load_lineByLine() {
  return _lineByLine = _interopRequireDefault(require('line-by-line'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SourceFileCache {

  constructor(getSourceByReference) {
    this._files = new Map();

    this._getSourceByReference = getSourceByReference;
  }

  async getFileDataBySourceReference(sourceReference) {
    const path = `sourceref://${sourceReference}`;
    let data = this._files.get(path);

    if (data == null) {
      data = await this._fillCacheWithSourceReference(sourceReference);
      this._files.set(path, data);
    }

    return data;
  }

  async getFileDataByPath(path) {
    let data = this._files.get(path);

    if (data == null) {
      data = await this._fillCacheFromLocalFileSystem(path);
      this._files.set(path, data);
    }

    return data;
  }

  flush() {
    this._files = new Map();
  }

  async _fillCacheFromLocalFileSystem(path) {
    return new Promise((resolve, reject) => {
      const lines = [];

      // LineByLineReader splits the file on the fly so we don't
      // have to read into memory first
      new (_lineByLine || _load_lineByLine()).default(path).on('line', line => lines.push(line)).on('end', () => resolve(lines)).on('error', e => reject(e));
    });
  }

  async _fillCacheWithSourceReference(sourceReference) {
    const data = await this._getSourceByReference(sourceReference);
    return data.split(/\n|\r\n|\r/);
  }
}
exports.default = SourceFileCache; /**
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