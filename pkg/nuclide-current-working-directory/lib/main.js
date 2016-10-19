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
exports.provideApi = provideApi;
exports.serialize = serialize;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Activation;

function _load_Activation() {
  return _Activation = require('./Activation');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var activation = null;

function activate(state) {
  (0, (_assert || _load_assert()).default)(activation == null);
  activation = new (_Activation || _load_Activation()).Activation(state);
}

function deactivate() {
  (0, (_assert || _load_assert()).default)(activation != null);
  activation.dispose();
  activation = null;
}

function provideApi() {
  (0, (_assert || _load_assert()).default)(activation != null);
  return activation.provideApi();
}

function serialize() {
  (0, (_assert || _load_assert()).default)(activation != null);
  return activation.serialize();
}