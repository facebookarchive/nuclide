/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {AppState, DeploymentTarget, PlatformGroup} from '../types';
import type {Action} from './Actions';

import * as Actions from './Actions';

export default function accumulateState(state: AppState, action: Action): AppState {
  switch (action.type) {
    case Actions.SET_PROJECT_ROOT:
      return {
        ...state,
        projectRoot: action.projectRoot,
        isLoadingBuckProject: true,
      };
    case Actions.SET_BUCK_ROOT:
      return {
        ...state,
        buckRoot: action.buckRoot,
        isLoadingBuckProject: false,
      };
    case Actions.SET_BUILD_TARGET:
      return {
        ...state,
        buildRuleType: null,
        platformGroups: [],
        selectedDeploymentTarget: null,
        buildTarget: action.buildTarget,
        isLoadingRule: true,
      };
    case Actions.SET_RULE_TYPE:
      return {
        ...state,
        buildRuleType: action.ruleType,
        isLoadingRule: false,
        isLoadingPlatforms: true,
      };
    case Actions.SET_PLATFORM_GROUPS:
      const {platformGroups} = action;
      const previouslySelected = state.selectedDeploymentTarget;
      const selectedDeploymentTarget
        = selectValidDeploymentTarget(previouslySelected, platformGroups);
      return {
        ...state,
        platformGroups,
        selectedDeploymentTarget,
        isLoadingPlatforms: false,
      };
    case Actions.SET_DEPLOYMENT_TARGET:
      return {
        ...state,
        selectedDeploymentTarget: action.deploymentTarget,
      };
    case Actions.SET_TASK_SETTINGS:
      return {
        ...state,
        taskSettings: {
          ...state.taskSettings,
          [action.taskType]: action.settings,
        },
      };
  }
  return state;
}

function selectValidDeploymentTarget(
  previouslySelected: ?DeploymentTarget,
  platformGroups: Array<PlatformGroup>): ?DeploymentTarget {
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

  return {platform: existingPlatform, device: existingDevice};
}
