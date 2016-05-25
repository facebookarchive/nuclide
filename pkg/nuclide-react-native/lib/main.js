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
exports.provideNuclideDebugger = provideNuclideDebugger;
exports.createDebuggerProvider = createDebuggerProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _debuggingReactNativeLaunchAttachProvider2;

function _debuggingReactNativeLaunchAttachProvider() {
  return _debuggingReactNativeLaunchAttachProvider2 = require('./debugging/ReactNativeLaunchAttachProvider');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var activation = null;

function activate(state) {
  (0, (_assert2 || _assert()).default)(activation == null);

  var _require = require('./Activation');

  var Activation = _require.Activation;

  activation = new Activation(state);
}

function deactivate() {
  (0, (_assert2 || _assert()).default)(activation != null);
  activation.dispose();
  activation = null;
}

function provideNuclideDebugger() {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.provideNuclideDebugger();
}

function createDebuggerProvider() {
  return {
    name: 'react-native',
    getLaunchAttachProvider: function getLaunchAttachProvider(connection) {
      if ((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isLocal(connection)) {
        return new (_debuggingReactNativeLaunchAttachProvider2 || _debuggingReactNativeLaunchAttachProvider()).ReactNativeLaunchAttachProvider('React Native', connection);
      }
      return null;
    }
  };
}