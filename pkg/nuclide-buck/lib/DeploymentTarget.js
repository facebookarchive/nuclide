'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDeploymentTargetPreference = getDeploymentTargetPreference;
exports.selectValidDeploymentTarget = selectValidDeploymentTarget;
exports.getPlatformProviderUiForDeploymentTarget = getPlatformProviderUiForDeploymentTarget;
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

function getDeploymentTargetPreference(state) {
  const target = state.selectedDeploymentTarget;
  // If a deployment target exists, that's our first choice, otherwise look at the last session
  if (target != null) {
    return {
      platformGroupName: target.platformGroup.name,
      platformName: target.platform.name,
      deviceGroupName: target.deviceGroup ? target.deviceGroup.name : null,
      deviceName: target.device ? target.device.name : null
    };
  } else {
    return {
      platformGroupName: state.lastSessionPlatformGroupName,
      platformName: state.lastSessionPlatformName,
      deviceGroupName: state.lastSessionDeviceGroupName,
      deviceName: state.lastSessionDeviceName
    };
  }
}

function selectValidDeploymentTarget(preferred, platformGroups) {
  if (platformGroups.length === 0) {
    return null;
  }

  let result;
  result = getPreferred(platformGroups, preferred.platformGroupName, false);
  const platformGroup = result.value;

  if (!platformGroup) {
    throw new Error('Invariant violation: "platformGroup"');
  }

  result = getPreferred(platformGroup.platforms, preferred.platformName, result.skipRest);
  const platform = result.value;

  if (!platform) {
    throw new Error('Invariant violation: "platform"');
  }

  result = platform.isMobile ? getPreferred(platform.deviceGroups, preferred.deviceGroupName, result.skipRest) : null;
  const deviceGroup = result != null ? result.value : null;
  result = result != null && deviceGroup != null ? getPreferred(deviceGroup.devices, preferred.deviceName, result.skipRest) : null;
  const device = result && result.value;

  return {
    platformGroup,
    platform,
    deviceGroup,
    device
  };
}

function getPreferred(groups, name, chooseFirst) {
  if (groups.length === 0) {
    return { value: null, skipRest: true };
  }
  let match;
  // We want === in case of an empty string
  if (name === null || chooseFirst) {
    match = null;
  } else {
    match = groups.find(group => group.name === name);
  }
  let skipRest;
  if (match == null) {
    match = groups[0];
    skipRest = true;
  } else {
    skipRest = false;
  }
  return { value: match, skipRest };
}

function getPlatformProviderUiForDeploymentTarget(deploymentTarget) {
  if (deploymentTarget == null || !deploymentTarget.platform.isMobile || deploymentTarget.platform.extraUiWhenSelected == null) {
    return null;
  }
  return deploymentTarget.platform.extraUiWhenSelected(deploymentTarget.device);
}