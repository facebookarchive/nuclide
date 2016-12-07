'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AppState, Device, Platform} from '../types';
import type {Action} from './Actions';
import shallowequal from 'shallowequal';

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
    case Actions.SET_PLATFORMS:
      const {platforms} = action;
      const previouslySelected = state.selectedDevice;
      const selectedDevice = selectValidDevice(previouslySelected, platforms);
      return {
        ...state,
        platforms,
        selectedDevice,
        isLoadingPlatforms: false,
      };
    case Actions.SET_DEVICE:
      return {
        ...state,
        selectedDevice: action.device,
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

function selectValidDevice(previouslySelected: ?Device, platforms: Array<Platform>): ?Device {
  if (!platforms.length) {
    return null;
  }

  let selectedDevice = null;
  if (previouslySelected) {
    // Reassign selectedDevice to an instance from new platforms,
    // to guarantee === matches (important for dropdown selection).
    platforms.some(platform => {
      selectedDevice = platform.devices.find(device => shallowequal(device, previouslySelected));
      return selectedDevice != null;
    });
  }
  if (!selectedDevice) {
    selectedDevice = platforms[0].devices[0];
  }

  return selectedDevice;
}
