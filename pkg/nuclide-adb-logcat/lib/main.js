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
exports.consumeOutputService = consumeOutputService;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _Activation;

function _load_Activation() {
  return _Activation = _interopRequireDefault(require('./Activation'));
}

var activation = null;

function activate(state) {
  activation = new (_Activation || _load_Activation()).default(state);
}

function deactivate() {
  (0, (_assert || _load_assert()).default)(activation != null);
  activation.dispose();
  activation = null;
}

function consumeOutputService(api) {
  (0, (_assert || _load_assert()).default)(activation);
  activation.consumeOutputService(api);
}