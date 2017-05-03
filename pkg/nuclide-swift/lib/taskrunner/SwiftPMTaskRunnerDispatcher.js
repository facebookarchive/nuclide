'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ActionTypes = undefined;

var _Dispatcher;

function _load_Dispatcher() {
  return _Dispatcher = _interopRequireDefault(require('../../../commons-node/Dispatcher'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ActionTypes = exports.ActionTypes = Object.freeze({
  UPDATE_PROJECT_ROOT: 'UPDATE_PROJECT_ROOT',
  UPDATE_CHDIR: 'UPDATE_CHDIR',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_COMPILE_COMMANDS: 'UPDATE_COMPILE_COMMANDS'
});

// Flow hack: Every SwiftPMTaskRunnerAction actionType must be in ActionTypes.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

'';

class SwiftPMTaskRunnerDispatcher extends (_Dispatcher || _load_Dispatcher()).default {}
exports.default = SwiftPMTaskRunnerDispatcher;