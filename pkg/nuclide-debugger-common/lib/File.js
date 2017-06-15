'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A file in the file cache.
 */
class File {

  constructor(path) {
    this._path = path;
    this._source = null;
  }

  getSource() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const hasSource = yield _this.hasSource();
      if (!hasSource) {
        return '';
      }
      let source = _this._source;
      if (source == null) {
        source = yield (_fsPromise || _load_fsPromise()).default.readFile(_this._path, 'utf8');
        _this._source = source;
      }
      return source;
    })();
  }

  hasSource() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // t12549106 -- this is a workaround for some HHVM goofiness.
      return (yield (_fsPromise || _load_fsPromise()).default.exists(_this2._path)) && (yield (_fsPromise || _load_fsPromise()).default.lstat(_this2._path)).isFile();
    })();
  }
}
exports.default = File; /**
                         * Copyright (c) 2015-present, Facebook, Inc.
                         * All rights reserved.
                         *
                         * This source code is licensed under the license found in the LICENSE file in
                         * the root directory of this source tree.
                         *
                         * 
                         * @format
                         */