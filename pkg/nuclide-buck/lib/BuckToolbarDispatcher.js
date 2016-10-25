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
exports.default = exports.ActionTypes = undefined;

var _Dispatcher;

function _load_Dispatcher() {
  return _Dispatcher = _interopRequireDefault(require('../../commons-node/Dispatcher'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ActionTypes = exports.ActionTypes = Object.freeze({
  UPDATE_BUCK_ROOT: 'UPDATE_BUCK_ROOT',
  UPDATE_BUILD_TARGET: 'UPDATE_BUILD_TARGET',
  UPDATE_DEVICES: 'UPDATE_DEVICES',
  UPDATE_IS_LOADING_RULE: 'UPDATE_IS_LOADING_RULE',
  UPDATE_REACT_NATIVE_SERVER_MODE: 'UPDATE_REACT_NATIVE_SERVER_MODE',
  UPDATE_RULE_TYPE: 'UPDATE_RULE_TYPE',
  UPDATE_SIMULATOR: 'UPDATE_SIMULATOR',
  UPDATE_TASK_SETTINGS: 'UPDATE_TASK_SETTINGS'
});

// Flow hack: Every BuckToolbarAction actionType must be in ActionTypes.
'';

let BuckToolbarDispatcher = class BuckToolbarDispatcher extends (_Dispatcher || _load_Dispatcher()).default {};
exports.default = BuckToolbarDispatcher;