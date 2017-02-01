'use strict';

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

var _NodeLaunchAttachProvider;

function _load_NodeLaunchAttachProvider() {
  return _NodeLaunchAttachProvider = require('./NodeLaunchAttachProvider');
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

function activate(state) {
  (_utils || _load_utils()).default.setLogLevel((0, (_utils2 || _load_utils2()).getConfig)().clientLogLevel);
}

function createDebuggerProvider() {
  return {
    name: 'Node',
    getLaunchAttachProvider(connection) {
      return new (_NodeLaunchAttachProvider || _load_NodeLaunchAttachProvider()).NodeLaunchAttachProvider('NodeJS', connection);
    }
  };
}