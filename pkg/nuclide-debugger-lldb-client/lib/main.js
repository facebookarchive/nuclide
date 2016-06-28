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
exports.consumeOutputService = consumeOutputService;
exports.provideNuclideDebuggerLLDB = provideNuclideDebuggerLLDB;
exports.createDebuggerProvider = createDebuggerProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var _utils4;

function _utils3() {
  return _utils4 = require('./utils');
}

var _nuclideDebuggerCommonLibOutputServiceManager2;

function _nuclideDebuggerCommonLibOutputServiceManager() {
  return _nuclideDebuggerCommonLibOutputServiceManager2 = require('../../nuclide-debugger-common/lib/OutputServiceManager');
}

function activate(state) {
  (_utils2 || _utils()).default.setLogLevel((0, (_utils4 || _utils3()).getConfig)().clientLogLevel);
}

function consumeOutputService(api) {
  (0, (_nuclideDebuggerCommonLibOutputServiceManager2 || _nuclideDebuggerCommonLibOutputServiceManager()).setOutputService)(api);
}

function provideNuclideDebuggerLLDB() {
  var Service = require('./Service');
  return Service;
}

function createDebuggerProvider() {
  return require('./DebuggerProvider');
}