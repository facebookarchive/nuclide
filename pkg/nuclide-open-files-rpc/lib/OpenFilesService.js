'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialize = initialize;

var _FileCache;

function _load_FileCache() {
  return _FileCache = require('./FileCache');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

async function initialize() {
  return new (_FileCache || _load_FileCache()).FileCache();
}