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
exports.createDebuggerProvider = createDebuggerProvider;
exports.consumeOutputService = consumeOutputService;
exports.consumeCwdApi = consumeCwdApi;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _debuggingReactNativeLaunchAttachProvider;

function _load_debuggingReactNativeLaunchAttachProvider() {
  return _debuggingReactNativeLaunchAttachProvider = require('./debugging/ReactNativeLaunchAttachProvider');
}

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
  (0, (_assert || _load_assert()).default)(activation == null);
  activation = new (_Activation || _load_Activation()).default(state);
}

function deactivate() {
  (0, (_assert || _load_assert()).default)(activation != null);
  activation.dispose();
  activation = null;
}

function createDebuggerProvider() {
  return {
    name: 'react-native',
    getLaunchAttachProvider: function getLaunchAttachProvider(connection) {
      if ((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isLocal(connection)) {
        return new (_debuggingReactNativeLaunchAttachProvider || _load_debuggingReactNativeLaunchAttachProvider()).ReactNativeLaunchAttachProvider('React Native', connection);
      }
      return null;
    }
  };
}

function consumeOutputService(api) {
  (0, (_assert || _load_assert()).default)(activation != null);
  return activation.consumeOutputService(api);
}

function consumeCwdApi(api) {
  (0, (_assert || _load_assert()).default)(activation != null);
  return activation.consumeCwdApi(api);
}