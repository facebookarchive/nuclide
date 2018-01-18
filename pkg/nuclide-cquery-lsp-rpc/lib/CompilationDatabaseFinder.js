'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findNearestCompilationDbDir = undefined;

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

let findNearestCompilationDbDir = exports.findNearestCompilationDbDir = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (source) {
    return (_fsPromise || _load_fsPromise()).default.findNearestFile((_CqueryLanguageServer || _load_CqueryLanguageServer()).COMPILATION_DATABASE_FILE, (_nuclideUri || _load_nuclideUri()).default.dirname(source));
  });

  return function findNearestCompilationDbDir(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _CqueryLanguageServer;

function _load_CqueryLanguageServer() {
  return _CqueryLanguageServer = require('./CqueryLanguageServer');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }