Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.createHgRepositoryProvider = createHgRepositoryProvider;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function activate(state) {
  // TODO(mbolin): Add activation code here.
}

function createHgRepositoryProvider() {
  var _require = require('./HgRepositoryProvider');

  var HgRepositoryProvider = _require.HgRepositoryProvider;

  return new HgRepositoryProvider();
}