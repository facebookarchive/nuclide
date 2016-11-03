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
exports.activate = activate;
exports.createDebuggerProvider = createDebuggerProvider;

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _utils2;

function _load_utils2() {
  return _utils2 = require('./utils');
}

var _DebuggerProvider;

function _load_DebuggerProvider() {
  return _DebuggerProvider = _interopRequireDefault(require('./DebuggerProvider'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function activate(state) {
  (_utils || _load_utils()).default.setLogLevel((0, (_utils2 || _load_utils2()).getConfig)().clientLogLevel);
}

function createDebuggerProvider() {
  return (_DebuggerProvider || _load_DebuggerProvider()).default;
}