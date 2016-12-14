'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = accumulateState;

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
        isLoadingRule: false,
        isLoadingPlatforms: true
      });
    case (_Actions || _load_Actions()).SET_PLATFORMS:
      const { platforms } = action;
      const previouslySelected = state.selectedDevice;
      const selectedDevice = selectValidDevice(previouslySelected, platforms);
      return Object.assign({}, state, {
        platforms,
        selectedDevice,
        isLoadingPlatforms: false
      });
    case (_Actions || _load_Actions()).SET_DEVICE:
      return Object.assign({}, state, {
        selectedDevice: action.device
      });
    case (_Actions || _load_Actions()).SET_TASK_SETTINGS:
      return Object.assign({}, state, {
        taskSettings: Object.assign({}, state.taskSettings, {
          [action.taskType]: action.settings
        })
      });
  }
  return state;
}

function selectValidDevice(previouslySelected, platforms) {
  if (!platforms.length) {
    return null;
  }

  let selectedDevice = null;
  if (previouslySelected) {
    // Reassign selectedDevice to an instance from new platforms,
    // to guarantee === matches (important for dropdown selection).
    platforms.some(platform => {
      selectedDevice = platform.devices.find(device => (0, (_shallowequal || _load_shallowequal()).default)(device, previouslySelected));
      return selectedDevice != null;
    });
  }
  if (!selectedDevice) {
    selectedDevice = platforms[0].devices[0];
  }

  return selectedDevice;
}
module.exports = exports['default'];