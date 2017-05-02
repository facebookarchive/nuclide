'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeOutputService = consumeOutputService;

var _Activation;

function _load_Activation() {
  return _Activation = _interopRequireDefault(require('./Activation'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let activation = null; /**
                        * Copyright (c) 2015-present, Facebook, Inc.
                        * All rights reserved.
                        *
                        * This source code is licensed under the license found in the LICENSE file in
                        * the root directory of this source tree.
                        *
                        * 
                        * @format
                        */

function activate(state) {
  if (!(activation == null)) {
    throw new Error('Invariant violation: "activation == null"');
  }

  activation = new (_Activation || _load_Activation()).default(state);
}

function deactivate() {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  activation.dispose();
  activation = null;
}

function consumeOutputService(api) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  activation.consumeOutputService(api);
}