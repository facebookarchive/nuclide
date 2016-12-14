'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.consumeProvider = consumeProvider;
exports.deactivate = deactivate;

var _CodeHighlightManager;

function _load_CodeHighlightManager() {
  return _CodeHighlightManager = _interopRequireDefault(require('./CodeHighlightManager'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let codeHighlightManager = null; /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  */

function activate(state) {
  codeHighlightManager = new (_CodeHighlightManager || _load_CodeHighlightManager()).default();
}

function consumeProvider(provider) {
  if (!(codeHighlightManager != null)) {
    throw new Error('Invariant violation: "codeHighlightManager != null"');
  }

  codeHighlightManager.addProvider(provider);
}

function deactivate() {
  if (!(codeHighlightManager != null)) {
    throw new Error('Invariant violation: "codeHighlightManager != null"');
  }

  codeHighlightManager.dispose();
  codeHighlightManager = null;
}