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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _DatatipManager2;

function _DatatipManager() {
  return _DatatipManager2 = require('./DatatipManager');
}

var datatipManager = null;

function activate(state) {
  if (datatipManager == null) {
    datatipManager = new (_DatatipManager2 || _DatatipManager()).DatatipManager();
  }
}

function provideDatatipService() {
  (0, (_assert2 || _assert()).default)(datatipManager);
  return datatipManager;
}

function deactivate() {
  if (datatipManager != null) {
    datatipManager.dispose();
    datatipManager = null;
  }
}