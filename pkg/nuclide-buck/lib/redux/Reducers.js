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
      let currentPlatformName;
      let currentDeviceName;
      if (state.selectedDeploymentTarget) {
        currentPlatformName = state.selectedDeploymentTarget.platform.name;
        currentDeviceName = state.selectedDeploymentTarget.device ? state.selectedDeploymentTarget.device.name : null;
      } else {
        currentPlatformName = state.lastSessionPlatformName;
        currentDeviceName = state.lastSessionDeviceName;
      }
      const selectedDeploymentTarget = selectValidDeploymentTarget(currentPlatformName, currentDeviceName, platformGroups);
      return Object.assign({}, state, {
        platformGroups,
        selectedDeploymentTarget,
        isLoadingPlatforms: false
      });
    case (_Actions || _load_Actions()).SET_DEPLOYMENT_TARGET:
      return Object.assign({}, state, {
        selectedDeploymentTarget: action.deploymentTarget,
        lastSessionPlatformName: null,
        lastSessionDeviceName: null
      });
    case (_Actions || _load_Actions()).SET_TASK_SETTINGS:
      return Object.assign({}, state, {
        taskSettings: action.settings
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

function selectValidDeploymentTarget(currentPlatformName, currentDeviceName, platformGroups) {
  if (!platformGroups.length) {
    return null;
  }

  let existingDevice = null;
  let existingPlatform = null;
  if (currentPlatformName) {
    for (const platformGroup of platformGroups) {
      for (const platform of platformGroup.platforms) {
        if (platform.name === currentPlatformName) {
          existingPlatform = platform;
          if (currentDeviceName) {
            for (const deviceGroup of platform.deviceGroups) {
              for (const device of deviceGroup.devices) {
                if (device.name === currentDeviceName) {
                  existingDevice = device;
                  break;
                }
              }

              if (existingDevice) {
                break;
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

  if (!existingDevice && existingPlatform.deviceGroups.length && existingPlatform.deviceGroups[0].devices.length) {
    existingDevice = existingPlatform.deviceGroups[0].devices[0];
  }

  return { platform: existingPlatform, device: existingDevice };
}
module.exports = exports['default'];