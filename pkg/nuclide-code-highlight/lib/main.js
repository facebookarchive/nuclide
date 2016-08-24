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

var _CodeHighlightManager2;

function _CodeHighlightManager() {
  return _CodeHighlightManager2 = _interopRequireDefault(require('./CodeHighlightManager'));
}

var codeHighlightManager = null;

function activate(state) {
  codeHighlightManager = new (_CodeHighlightManager2 || _CodeHighlightManager()).default();
}

function consumeProvider(provider) {
  (0, (_assert2 || _assert()).default)(codeHighlightManager != null);
  codeHighlightManager.addProvider(provider);
}

function deactivate() {
  (0, (_assert2 || _assert()).default)(codeHighlightManager != null);
  codeHighlightManager.dispose();
  codeHighlightManager = null;
}