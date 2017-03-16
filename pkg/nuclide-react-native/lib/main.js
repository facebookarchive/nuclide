'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.createDebuggerProvider = createDebuggerProvider;
exports.consumeOutputService = consumeOutputService;
exports.consumeCwdApi = consumeCwdApi;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _ReactNativeLaunchAttachProvider;

function _load_ReactNativeLaunchAttachProvider() {
  return _ReactNativeLaunchAttachProvider = require('./debugging/ReactNativeLaunchAttachProvider');
}

var _Activation;

function _load_Activation() {
  return _Activation = _interopRequireDefault(require('./Activation'));
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

let activation = null;

function activate(state) {
  if (!(activation == null)) {
    throw new Error('Invariant violation: "activation == null"');
  }

  activation = new (_Activation || _load_Activation()).default(state);
}

function deactivate() {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  activation.dispose();
  activation = null;
}

function createDebuggerProvider() {
  return {
    name: 'react-native',
    getLaunchAttachProvider(connection) {
      if ((_nuclideUri || _load_nuclideUri()).default.isLocal(connection)) {
        return new (_ReactNativeLaunchAttachProvider || _load_ReactNativeLaunchAttachProvider()).ReactNativeLaunchAttachProvider('React Native', connection);
      }
      return null;
    }
  };
}

function consumeOutputService(api) {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  return activation.consumeOutputService(api);
}

function consumeCwdApi(api) {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  return activation.consumeCwdApi(api);
}