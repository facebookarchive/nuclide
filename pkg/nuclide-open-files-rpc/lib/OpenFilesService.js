'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialize = undefined;

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

let initialize = exports.initialize = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    return new (_FileCache || _load_FileCache()).FileCache();
  });

  return function initialize() {
    return _ref.apply(this, arguments);
  };
})();

var _FileCache;

function _load_FileCache() {
  return _FileCache = require('./FileCache');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }