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

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _debuggingReactNativeLaunchAttachProvider2;

function _debuggingReactNativeLaunchAttachProvider() {
  return _debuggingReactNativeLaunchAttachProvider2 = require('./debugging/ReactNativeLaunchAttachProvider');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _Activation2;

function _Activation() {
  return _Activation2 = _interopRequireDefault(require('./Activation'));
}

var activation = null;

function activate(state) {
  (0, (_assert2 || _assert()).default)(activation == null);
  activation = new (_Activation2 || _Activation()).default(state);
}

function deactivate() {
  (0, (_assert2 || _assert()).default)(activation != null);
  activation.dispose();
  activation = null;
}

function createDebuggerProvider() {
  return {
    name: 'react-native',
    getLaunchAttachProvider: function getLaunchAttachProvider(connection) {
      if ((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isLocal(connection)) {
        return new (_debuggingReactNativeLaunchAttachProvider2 || _debuggingReactNativeLaunchAttachProvider()).ReactNativeLaunchAttachProvider('React Native', connection);
      }
      return null;
    }
  };
}

function consumeOutputService(api) {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.consumeOutputService(api);
}

function consumeCwdApi(api) {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.consumeCwdApi(api);
}