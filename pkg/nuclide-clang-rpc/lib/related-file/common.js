'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchFileWithBasename = searchFileWithBasename;

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function searchFileWithBasename(dir, basename, condition) {
  const files = await (_fsPromise || _load_fsPromise()).default.readdir(dir).catch(() => []);
  for (const file of files) {
    if (condition(file) && (0, (_utils || _load_utils()).getFileBasename)(file) === basename) {
      return (_nuclideUri || _load_nuclideUri()).default.join(dir, file);
    }
  }
  return null;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */