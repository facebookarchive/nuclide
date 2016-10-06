Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _HgRepositoryClient2;

function _HgRepositoryClient() {
  return _HgRepositoryClient2 = require('./HgRepositoryClient');
}

var _HgRepositoryClientAsync2;

function _HgRepositoryClientAsync() {
  return _HgRepositoryClientAsync2 = _interopRequireDefault(require('./HgRepositoryClientAsync'));
}

exports.HgRepositoryClient = (_HgRepositoryClient2 || _HgRepositoryClient()).HgRepositoryClient;
exports.HgRepositoryClientAsync = (_HgRepositoryClientAsync2 || _HgRepositoryClientAsync()).default;