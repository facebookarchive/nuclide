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

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _nuclideDebuggerCommonLibOutputServiceManager = require('../../nuclide-debugger-common/lib/OutputServiceManager');

function activate(state) {
  _utils2['default'].setLogLevel((0, _utils.getConfig)().clientLogLevel);
}

function consumeOutputService(api) {
  (0, _nuclideDebuggerCommonLibOutputServiceManager.setOutputService)(api);
}

function provideNuclideDebuggerLLDB() {
  var Service = require('./Service');
  return Service;
}

function createDebuggerProvider() {
  return require('./DebuggerProvider');
}