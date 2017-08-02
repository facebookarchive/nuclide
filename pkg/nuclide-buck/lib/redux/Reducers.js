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
      // We are nulling out the deployment target while platforms are loaded
      // Let's remember what we had selected in the last session field
      const preference = getDeploymentTargetPreference(state);
      return Object.assign({}, state, {
        buildRuleType: null,
        platformGroups: [],
        selectedDeploymentTarget: null,
        platformProviderUi: null,
        buildTarget: action.buildTarget,
        isLoadingRule: true,
        lastSessionPlatformName: preference.platformName,
        lastSessionDeviceName: preference.deviceName
      });
    case (_Actions || _load_Actions()).SET_RULE_TYPE:
      return Object.assign({}, state, {
        buildRuleType: action.ruleType,
        isLoadingRule: false,
        isLoadingPlatforms: true
      });
    case (_Actions || _load_Actions()).SET_PLATFORM_GROUPS:
      const { platformGroups } = action;
      const { platformName, deviceName } = getDeploymentTargetPreference(state);
      const selectedDeploymentTarget = selectValidDeploymentTarget(platformName, deviceName, platformGroups);
      return Object.assign({}, state, {
        platformGroups,
        selectedDeploymentTarget,
        platformProviderUi: getPlatformProviderUiForDeploymentTarget(selectedDeploymentTarget),
        isLoadingPlatforms: false
      });
    case (_Actions || _load_Actions()).SET_DEPLOYMENT_TARGET:
      return Object.assign({}, state, {
        selectedDeploymentTarget: action.deploymentTarget,
        platformProviderUi: getPlatformProviderUiForDeploymentTarget(action.deploymentTarget),
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
   * @format
   */

function getDeploymentTargetPreference(state) {
  // If a deployment target exists, that's our first choice, otherwise look at the last session
  if (state.selectedDeploymentTarget) {
    return {
      platformName: state.selectedDeploymentTarget.platform.name,
      deviceName: state.selectedDeploymentTarget.device ? state.selectedDeploymentTarget.device.name : null
    };
  } else {
    return {
      platformName: state.lastSessionPlatformName,
      deviceName: state.lastSessionDeviceName
    };
  }
}

function selectValidDeploymentTarget(preferredPlatformName, preferredDeviceName, platformGroups) {
  if (!platformGroups.length) {
    return null;
  }

  let existingDevice = null;
  let existingPlatform = null;
  if (preferredPlatformName) {
    for (const platformGroup of platformGroups) {
      for (const platform of platformGroup.platforms) {
        if (platform.isMobile && platform.name === preferredPlatformName) {
          existingPlatform = platform;
          if (preferredDeviceName) {
            for (const deviceGroup of platform.deviceGroups) {
              for (const device of deviceGroup.devices) {
                if (device.name === preferredDeviceName) {
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

  if (!existingDevice && existingPlatform.isMobile && existingPlatform.deviceGroups.length && existingPlatform.deviceGroups[0].devices.length) {
    existingDevice = existingPlatform.deviceGroups[0].devices[0];
  }

  return { platform: existingPlatform, device: existingDevice };
}

function getPlatformProviderUiForDeploymentTarget(deploymentTarget) {
  if (deploymentTarget == null || !deploymentTarget.platform.isMobile || deploymentTarget.platform.extraUiWhenSelected == null) {
    return null;
  }
  return deploymentTarget.platform.extraUiWhenSelected(deploymentTarget.device);
}