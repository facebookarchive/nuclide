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
exports.default = accumulateState;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function accumulateState(state, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_PROJECT_ROOT:
      return Object.assign({}, state, {
        projectRoot: action.projectRoot,
        isLoadingBuckProject: true
      });
    case (_Actions || _load_Actions()).SET_BUCK_ROOT:
      return Object.assign({}, state, {
        buckRoot: action.buckRoot,
        isLoadingBuckProject: false
      });
    case (_Actions || _load_Actions()).SET_BUILD_TARGET:
      return Object.assign({}, state, {
        buildTarget: action.buildTarget,
        isLoadingRule: true
      });
    case (_Actions || _load_Actions()).SET_RULE_TYPE:
      return Object.assign({}, state, {
        buildRuleType: action.ruleType,
        isLoadingRule: false
      });
    case (_Actions || _load_Actions()).SET_DEVICES:
      let { simulator } = state;
      const isInvalidSimulator = simulator == null || !action.devices.some(device => device.udid === simulator);
      if (isInvalidSimulator && action.devices.length) {
        simulator = action.devices[0].udid;
      }
      return Object.assign({}, state, {
        devices: action.devices,
        simulator
      });
    case (_Actions || _load_Actions()).SET_SIMULATOR:
      return Object.assign({}, state, {
        simulator: action.simulator
      });
    case (_Actions || _load_Actions()).SET_TASK_SETTINGS:
      return Object.assign({}, state, {
        taskSettings: Object.assign({}, state.taskSettings, {
          [action.taskType]: action.settings
        })
      });
  }
  return state;
}module.exports = exports['default'];