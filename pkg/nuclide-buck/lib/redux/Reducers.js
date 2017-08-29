'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = accumulateState;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _DeploymentTarget;

function _load_DeploymentTarget() {
  return _DeploymentTarget = require('../DeploymentTarget');
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
      // Let's remember what we had selected in the last session fields
      const preference = (0, (_DeploymentTarget || _load_DeploymentTarget()).getDeploymentTargetPreference)(state);
      return Object.assign({}, state, {
        buildRuleType: null,
        platformGroups: [],
        selectedDeploymentTarget: null,
        platformProviderUi: null,
        buildTarget: action.buildTarget,
        isLoadingRule: true,
        lastSessionPlatformGroupName: preference.platformGroupName,
        lastSessionPlatformName: preference.platformName,
        lastSessionDeviceGroupName: preference.deviceGroupName,
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
      const selectedDeploymentTarget = (0, (_DeploymentTarget || _load_DeploymentTarget()).selectValidDeploymentTarget)((0, (_DeploymentTarget || _load_DeploymentTarget()).getDeploymentTargetPreference)(state), platformGroups);
      return Object.assign({}, state, {
        platformGroups,
        selectedDeploymentTarget,
        platformProviderUi: (0, (_DeploymentTarget || _load_DeploymentTarget()).getPlatformProviderUiForDeploymentTarget)(selectedDeploymentTarget),
        isLoadingPlatforms: false
      });
    case (_Actions || _load_Actions()).SET_DEPLOYMENT_TARGET:
      return Object.assign({}, state, {
        selectedDeploymentTarget: action.deploymentTarget,
        platformProviderUi: (0, (_DeploymentTarget || _load_DeploymentTarget()).getPlatformProviderUiForDeploymentTarget)(action.deploymentTarget),
        lastSessionPlatformGroupName: null,
        lastSessionPlatformName: null,
        lastSessionDeviceGroupName: null,
        lastSessionDeviceName: null
      });
    case (_Actions || _load_Actions()).SET_TASK_SETTINGS:
      return Object.assign({}, state, {
        taskSettings: action.settings
      });
  }
  return state;
}