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

exports.consumeOutputService = consumeOutputService;
exports.provideNuclideDebuggerHhvm = provideNuclideDebuggerHhvm;
exports.createDebuggerProvider = createDebuggerProvider;
exports.getHomeFragments = getHomeFragments;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _DebuggerProvider2;

function _DebuggerProvider() {
  return _DebuggerProvider2 = _interopRequireDefault(require('./DebuggerProvider'));
}

var _nuclideDebuggerCommonLibOutputServiceManager2;

function _nuclideDebuggerCommonLibOutputServiceManager() {
  return _nuclideDebuggerCommonLibOutputServiceManager2 = require('../../nuclide-debugger-common/lib/OutputServiceManager');
}

function consumeOutputService(api) {
  (0, (_nuclideDebuggerCommonLibOutputServiceManager2 || _nuclideDebuggerCommonLibOutputServiceManager()).setOutputService)(api);
}

function provideNuclideDebuggerHhvm() {
  return require('./Service');
}

function createDebuggerProvider() {
  return (_DebuggerProvider2 || _DebuggerProvider()).default;
}

function getHomeFragments() {
  return {
    feature: {
      title: 'HHVM Debugger',
      icon: 'plug',
      description: 'Connect to a HHVM server process and debug Hack code from within Nuclide.',
      command: 'nuclide-debugger:toggle'
    },
    priority: 6
  };
}