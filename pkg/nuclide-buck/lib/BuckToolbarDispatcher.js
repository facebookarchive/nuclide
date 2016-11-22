'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Device} from '../../nuclide-ios-common';
import type {TaskSettings, TaskType} from './types';

import Dispatcher from '../../commons-node/Dispatcher';

type BuckToolbarAction =
  {
    actionType: 'UPDATE_BUCK_ROOT',
    buckRoot: ?string,
  } |
  {
    actionType: 'UPDATE_PROJECT_ROOT',
    projectRoot: ?string,
  } |
  {
    actionType: 'UPDATE_BUILD_TARGET',
    buildTarget: string,
  } |
  {
    actionType: 'UPDATE_DEVICES',
    devices: Array<Device>,
  } |
  {
    actionType: 'UPDATE_IS_LOADING_RULE',
    isLoadingRule: boolean,
  } |
  {
    actionType: 'UPDATE_RULE_TYPE',
    ruleType: ?string,
  } |
  {
    actionType: 'UPDATE_SIMULATOR',
    simulator: string,
  } |
  {
    actionType: 'UPDATE_TASK_SETTINGS',
    taskType: TaskType,
    settings: TaskSettings,
  };

export const ActionTypes = Object.freeze({
  UPDATE_BUCK_ROOT: 'UPDATE_BUCK_ROOT',
  UPDATE_PROJECT_ROOT: 'UPDATE_PROJECT_ROOT',
  UPDATE_BUILD_TARGET: 'UPDATE_BUILD_TARGET',
  UPDATE_DEVICES: 'UPDATE_DEVICES',
  UPDATE_IS_LOADING_RULE: 'UPDATE_IS_LOADING_RULE',
  UPDATE_RULE_TYPE: 'UPDATE_RULE_TYPE',
  UPDATE_SIMULATOR: 'UPDATE_SIMULATOR',
  UPDATE_TASK_SETTINGS: 'UPDATE_TASK_SETTINGS',
});

// Flow hack: Every BuckToolbarAction actionType must be in ActionTypes.
(('': $PropertyType<BuckToolbarAction, 'actionType'>): $Keys<typeof ActionTypes>);

export default class BuckToolbarDispatcher extends Dispatcher<BuckToolbarAction> {}
