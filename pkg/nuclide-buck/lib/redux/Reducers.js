'use strict';

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
        buildRuleType: null,
        platformGroups: [],
        selectedDeploymentTarget: null,
        buildTarget: action.buildTarget,
        isLoadingRule: true
      });
    case (_Actions || _load_Actions()).SET_RULE_TYPE:
      return Object.assign({}, state, {
        buildRuleType: action.ruleType,
        isLoadingRule: false,
        isLoadingPlatforms: true
      });
    case (_Actions || _load_Actions()).SET_PLATFORM_GROUPS:
      const { platformGroups } = action;
      const previouslySelected = state.selectedDeploymentTarget;
      const selectedDeploymentTarget = selectValidDeploymentTarget(previouslySelected, platformGroups);
      return Object.assign({}, state, {
        platformGroups,
        selectedDeploymentTarget,
        isLoadingPlatforms: false
      });
    case (_Actions || _load_Actions()).SET_DEPLOYMENT_TARGET:
      return Object.assign({}, state, {
        selectedDeploymentTarget: action.deploymentTarget
      });
    case (_Actions || _load_Actions()).SET_TASK_SETTINGS:
      return Object.assign({}, state, {
        taskSettings: Object.assign({}, state.taskSettings, {
          [action.taskType]: action.settings
        })
      });
  }
  return state;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function selectValidDeploymentTarget(previouslySelected, platformGroups) {
  if (!platformGroups.length) {
    return null;
  }

  let existingDevice = null;
  let existingPlatform = null;
  if (previouslySelected) {
    const previousPlatform = previouslySelected.platform;
    const previousDevice = previouslySelected.device;
    for (const platformGroup of platformGroups) {
      for (const platform of platformGroup.platforms) {
        if (platform.flavor === previousPlatform.flavor) {
          existingPlatform = platform;
          if (previousDevice) {
            for (const device of platform.devices) {
              if (device.udid === previousDevice.udid) {
                existingDevice = device;
              }
            }
          }
          break;
        }
      }

      if (existingPlatform) {
        break;
      }
    }
  }

  if (!existingPlatform) {
    existingPlatform = platformGroups[0].platforms[0];
  }

  if (!existingDevice && existingPlatform.devices.length) {
    existingDevice = existingPlatform.devices[0];
  }

  return { platform: existingPlatform, device: existingDevice };
}
module.exports = exports['default'];