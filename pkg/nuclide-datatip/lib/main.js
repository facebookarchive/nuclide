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

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _DatatipManager;

function _load_DatatipManager() {
  return _DatatipManager = require('./DatatipManager');
}

var datatipManager = null;

function activate(state) {
  if (datatipManager == null) {
    datatipManager = new (_DatatipManager || _load_DatatipManager()).DatatipManager();
  }
}

function provideDatatipService() {
  (0, (_assert || _load_assert()).default)(datatipManager);
  return datatipManager;
}

function deactivate() {
  if (datatipManager != null) {
    datatipManager.dispose();
    datatipManager = null;
  }
}