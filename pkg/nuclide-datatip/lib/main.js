Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.provideDatatipService = provideDatatipService;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _DatatipManager = require('./DatatipManager');

var datatipManager = null;

function activate(state) {
  if (datatipManager == null) {
    datatipManager = new _DatatipManager.DatatipManager();
  }
}

function provideDatatipService() {
  (0, _assert2['default'])(datatipManager);
  return datatipManager;
}

function deactivate() {
  if (datatipManager != null) {
    datatipManager.dispose();
    datatipManager = null;
  }
}