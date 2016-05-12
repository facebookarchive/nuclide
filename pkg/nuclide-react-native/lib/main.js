Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.activate = activate;
exports.deactivate = deactivate;
exports.provideNuclideDebugger = provideNuclideDebugger;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var activation = null;

function activate(state) {
  (0, (_assert2 || _assert()).default)(activation == null);

  var _require = require('./Activation');

  var Activation = _require.Activation;

  activation = new Activation(state);
}

function deactivate() {
  (0, (_assert2 || _assert()).default)(activation != null);
  activation.dispose();
  activation = null;
}

function provideNuclideDebugger() {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.provideNuclideDebugger();
}