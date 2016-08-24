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
exports.createDebuggerProvider = createDebuggerProvider;
exports.getHomeFragments = getHomeFragments;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _DebuggerProvider2;

function _DebuggerProvider() {
  return _DebuggerProvider2 = _interopRequireDefault(require('./DebuggerProvider'));
}

var _nuclideDebuggerBase2;

function _nuclideDebuggerBase() {
  return _nuclideDebuggerBase2 = require('../../nuclide-debugger-base');
}

function consumeOutputService(api) {
  (0, (_nuclideDebuggerBase2 || _nuclideDebuggerBase()).setOutputService)(api);
}

function createDebuggerProvider() {
  return (_DebuggerProvider2 || _DebuggerProvider()).default;
}

function getHomeFragments() {
  return {
    feature: {
      title: 'PHP Debugger',
      icon: 'plug',
      description: 'Connect to a PHP server process and debug Hack code from within Nuclide.',
      command: 'nuclide-debugger:toggle'
    },
    priority: 6
  };
}