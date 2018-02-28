'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

  getFileDataBySourceReference(sourceReference) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const path = `sourceref://${sourceReference}`;
      let data = _this._files.get(path);

      if (data == null) {
        data = yield _this._fillCacheWithSourceReference(sourceReference);
        _this._files.set(path, data);
      }

      return data;
    })();
  }

  getFileDataByPath(path) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let data = _this2._files.get(path);

      if (data == null) {
        data = yield _this2._fillCacheFromLocalFileSystem(path);
        _this2._files.set(path, data);
      }

      return data;
    })();
  }

  flush() {
    this._files = new Map();
  }

  _fillCacheFromLocalFileSystem(path) {
    return (0, _asyncToGenerator.default)(function* () {
      return new Promise(function (resolve, reject) {
        const lines = [];

        // LineByLineReader splits the file on the fly so we don't
        // have to read into memory first
        new (_lineByLine || _load_lineByLine()).default(path).on('line', function (line) {
          return lines.push(line);
        }).on('end', function () {
          return resolve(lines);
        }).on('error', function (e) {
          return reject(e);
        });
      });
    })();
  }

  _fillCacheWithSourceReference(sourceReference) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const data = yield _this3._getSourceByReference(sourceReference);
      return data.split(/\n|\r\n|\r/);
    })();
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