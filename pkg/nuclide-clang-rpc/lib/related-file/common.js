'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchFileWithBasename = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

let searchFileWithBasename = exports.searchFileWithBasename = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (dir, basename, condition) {
    const files = yield (_fsPromise || _load_fsPromise()).default.readdir(dir).catch(function () {
      return [];
    });
    for (const file of files) {
      if (condition(file) && (0, (_utils || _load_utils()).getFileBasename)(file) === basename) {
        return (_nuclideUri || _load_nuclideUri()).default.join(dir, file);
      }
    }
    return null;
  });

  return function searchFileWithBasename(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

exports.findSubArrayIndex = findSubArrayIndex;

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function findSubArrayIndex(arr, subarr) {
  for (let offset = 0; offset + subarr.length <= arr.length; offset++) {
    if ((0, (_collection || _load_collection()).arrayEqual)(arr.slice(offset, offset + subarr.length), subarr)) {
      return offset;
    }
  }
  return -1;
}