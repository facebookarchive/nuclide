'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _DebuggingActivation;

function _load_DebuggingActivation() {
  return _DebuggingActivation = require('./debugging/DebuggingActivation');
}

var _PackagerActivation;

function _load_PackagerActivation() {
  return _PackagerActivation = require('./packager/PackagerActivation');
}

var _ShellActivation;

function _load_ShellActivation() {
  return _ShellActivation = require('./shell/ShellActivation');
}

var _atom = require('atom');

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class Activation {

  constructor(state) {
    this._disposables = new _atom.CompositeDisposable(this._debuggingActivation = new (_DebuggingActivation || _load_DebuggingActivation()).DebuggingActivation(), this._packagerActivation = new (_PackagerActivation || _load_PackagerActivation()).PackagerActivation(), new (_ShellActivation || _load_ShellActivation()).ShellActivation());
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeOutputService(api) {
    return this._packagerActivation.consumeOutputService(api);
  }

  consumeCwdApi(api) {
    return this._packagerActivation.consumeCwdApi(api);
  }
}
exports.default = Activation;