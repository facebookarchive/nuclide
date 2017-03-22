'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.consumeProvider = consumeProvider;
exports.deactivate = deactivate;

var _CodeFormatManager;

function _load_CodeFormatManager() {
  return _CodeFormatManager = _interopRequireDefault(require('./CodeFormatManager'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

let codeFormatManager = null;

function activate(state) {
  codeFormatManager = new (_CodeFormatManager || _load_CodeFormatManager()).default();
}

function consumeProvider(provider) {
  if (!(codeFormatManager != null)) {
    throw new Error('Invariant violation: "codeFormatManager != null"');
  }

  codeFormatManager.addProvider(provider);
}

function deactivate() {
  if (!(codeFormatManager != null)) {
    throw new Error('Invariant violation: "codeFormatManager != null"');
  }

  codeFormatManager.dispose();
  codeFormatManager = null;
}