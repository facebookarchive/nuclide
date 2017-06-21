'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = app;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function app(state, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_CUSTOM_ADB_PATH:
      const customAdbPaths = new Map(state.customAdbPaths);
      customAdbPaths.set(action.payload.host, action.payload.path);
      return Object.assign({}, state, {
        customAdbPaths
      });

    case (_Actions || _load_Actions()).SET_CUSTOM_SDB_PATH:
      const customSdbPaths = new Map(state.customSdbPaths);
      customSdbPaths.set(action.payload.host, action.payload.path);
      return Object.assign({}, state, {
        customSdbPaths
      });

    case (_Actions || _load_Actions()).SET_ADB_PORT:
      const adbPorts = new Map(state.adbPorts);
      adbPorts.set(action.payload.host, action.payload.port);
      return Object.assign({}, state, {
        adbPorts
      });
    default:
      return state;
  }
}