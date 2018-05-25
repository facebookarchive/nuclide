'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findNearestCompilationDbDir = findNearestCompilationDbDir;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _CqueryProjectManager;

function _load_CqueryProjectManager() {
  return _CqueryProjectManager = require('./CqueryProjectManager');
}

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

async function findNearestCompilationDbDir(source) {
  return (_fsPromise || _load_fsPromise()).default.findNearestFile((_CqueryProjectManager || _load_CqueryProjectManager()).COMPILATION_DATABASE_FILE, (_nuclideUri || _load_nuclideUri()).default.dirname(source));
}