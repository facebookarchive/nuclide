Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.consumeProvider = consumeProvider;
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

var codeFormatManager = null;

function activate(state) {
  var CodeFormatManager = require('./CodeFormatManager');
  codeFormatManager = new CodeFormatManager();
}

function consumeProvider(provider) {
  (0, (_assert2 || _assert()).default)(codeFormatManager);
  codeFormatManager.addProvider(provider);
}

function deactivate() {
  if (codeFormatManager) {
    codeFormatManager.dispose();
    codeFormatManager = null;
  }
}