"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = accumulateState;

function Actions() {
  const data = _interopRequireWildcard(require("./Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _DeploymentTarget() {
  const data = require("../DeploymentTarget");

  _DeploymentTarget = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function accumulateState(state, action) {
  switch (action.type) {
    case Actions().SET_PROJECT_ROOT:
      return Object.assign({}, state, {
        projectRoot: action.projectRoot,
        buckversionFileContents: null,
        isLoadingBuckProject: true
      });

    case Actions().SET_BUCK_ROOT:
      return Object.assign({}, state, {
        buckRoot: action.buckRoot,
        isLoadingBuckProject: false
      });

    case Actions().SET_BUCKVERSION_FILE_CONTENTS:
      return Object.assign({}, state, {
        buckversionFileContents: action.contents
      });

    case Actions().SET_BUILD_TARGET:
      // We are nulling out the deployment target while platforms are loaded
      // Let's remember what we had selected in the last session fields
      const preference = (0, _DeploymentTarget().getDeploymentTargetPreference)(state);
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

    case Actions().SET_RULE_TYPE:
      return Object.assign({}, state, {
        buildRuleType: action.ruleType,
        isLoadingRule: false,
        isLoadingPlatforms: true
      });

    case Actions().SET_PLATFORM_GROUPS:
      const {
        platformGroups
      } = action;
      const selectedDeploymentTarget = (0, _DeploymentTarget().selectValidDeploymentTarget)((0, _DeploymentTarget().getDeploymentTargetPreference)(state), platformGroups);
      return Object.assign({}, state, {
        platformGroups,
        selectedDeploymentTarget,
        platformProviderUi: (0, _DeploymentTarget().getPlatformProviderUiForDeploymentTarget)(selectedDeploymentTarget),
        isLoadingPlatforms: false
      });

    case Actions().SET_DEPLOYMENT_TARGET:
      return Object.assign({}, state, {
        selectedDeploymentTarget: action.deploymentTarget,
        userSelectedDeploymentTarget: action.deploymentTarget,
        platformProviderUi: (0, _DeploymentTarget().getPlatformProviderUiForDeploymentTarget)(action.deploymentTarget),
        lastSessionPlatformGroupName: null,
        lastSessionPlatformName: null,
        lastSessionDeviceGroupName: null,
        lastSessionDeviceName: null
      });

    case Actions().SET_TASK_SETTINGS:
      return Object.assign({}, state, {
        taskSettings: action.settings
      });
  }

  return state;
}