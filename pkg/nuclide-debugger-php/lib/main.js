'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.consumeOutputService = consumeOutputService;
exports.createDebuggerProvider = createDebuggerProvider;
exports.getHomeFragments = getHomeFragments;

var _DebuggerProvider;

function _load_DebuggerProvider() {
  return _DebuggerProvider = _interopRequireDefault(require('./DebuggerProvider'));
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function consumeOutputService(api) {
  (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).setOutputService)(api);
}function createDebuggerProvider() {
  return (_DebuggerProvider || _load_DebuggerProvider()).default;
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