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
exports.consumeProvider = consumeProvider;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _CodeFormatManager2;

function _CodeFormatManager() {
  return _CodeFormatManager2 = _interopRequireDefault(require('./CodeFormatManager'));
}

var codeFormatManager = null;

function activate(state) {
  codeFormatManager = new (_CodeFormatManager2 || _CodeFormatManager()).default();
}

function consumeProvider(provider) {
  (0, (_assert2 || _assert()).default)(codeFormatManager != null);
  codeFormatManager.addProvider(provider);
}

function deactivate() {
  (0, (_assert2 || _assert()).default)(codeFormatManager != null);
  codeFormatManager.dispose();
  codeFormatManager = null;
}