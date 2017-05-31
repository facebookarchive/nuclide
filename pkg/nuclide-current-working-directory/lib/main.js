'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.provideApi = provideApi;
exports.serialize = serialize;

var _Activation;

function _load_Activation() {
  return _Activation = require('./Activation');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

let activation = null;

function activate(state) {
  if (!(activation == null)) {
    throw new Error('Invariant violation: "activation == null"');
  }

  activation = new (_Activation || _load_Activation()).Activation(state);
}

function deactivate() {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  activation.dispose();
  activation = null;
}

function provideApi() {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  return activation.provideApi();
}

function serialize() {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  return activation.serialize();
}