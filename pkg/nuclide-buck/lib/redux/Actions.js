'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Device, Platform, TaskSettings, TaskType} from '../types';

export type Action =
  {|
    type: 'SET_PROJECT_ROOT',
    projectRoot: ?string,
  |} |
  {|
    type: 'SET_BUILD_TARGET',
    buildTarget: string,
  |} |
  {|
    type: 'SET_DEVICE',
    device: Device,
  |} |
  {|
    type: 'SET_TASK_SETTINGS',
    taskType: TaskType,
    settings: TaskSettings,
  |} |
  // The actions below are meant to be used in Epics only.
  {|
    type: 'SET_BUCK_ROOT',
    buckRoot: ?string,
  |} |
  {|
    type: 'SET_RULE_TYPE',
    ruleType: ?string,
  |} |
  {|
    type: 'SET_PLATFORMS',
    platforms: ?Array<Platform>,
  |};

export const SET_PROJECT_ROOT = 'SET_PROJECT_ROOT';
export const SET_BUILD_TARGET = 'SET_BUILD_TARGET';
export const SET_DEVICE = 'SET_DEVICE';
export const SET_TASK_SETTINGS = 'SET_TASK_SETTINGS';
export const SET_BUCK_ROOT = 'SET_BUCK_ROOT';
export const SET_PLATFORMS = 'SET_PLATFORMS';
export const SET_RULE_TYPE = 'SET_RULE_TYPE';

export function setProjectRoot(projectRoot: ?string): Action {
  return {type: SET_PROJECT_ROOT, projectRoot};
}

export function setBuildTarget(buildTarget: string): Action {
  return {type: SET_BUILD_TARGET, buildTarget};
}

export function setDevice(device: Device): Action {
  return {type: SET_DEVICE, device};
}

export function setTaskSettings(taskType: TaskType, settings: TaskSettings): Action {
  return {type: SET_TASK_SETTINGS, taskType, settings};
}
