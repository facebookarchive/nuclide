'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Device} from './IosSimulator';
import type {TaskSettings, TaskType} from './types';

import Dispatcher from '../../commons-node/Dispatcher';

type BuckToolbarAction =
  {
    actionType: 'UPDATE_BUILD_TARGET',
    buildTarget: string,
  } |
  {
    actionType: 'UPDATE_IS_LOADING_RULE',
    isLoadingRule: boolean,
  } |
  {
    actionType: 'UPDATE_BUCK_ROOT',
    projectRoot: ?string,
    buckRoot: ?string,
  } |
  {
    actionType: 'UPDATE_REACT_NATIVE_SERVER_MODE',
    serverMode: boolean,
  } |
  {
    actionType: 'UPDATE_RULE_TYPE',
    ruleType: ?string
  } |
  {
    actionType: 'UPDATE_SIMULATOR',
    simulator: string,
  } |
  {
    actionType: 'UPDATE_TASK_SETTINGS',
    taskType: TaskType,
    settings: TaskSettings,
  } |
  {
    actionType: 'UPDATE_DEVICES',
    devices: Array<Device>,
  };

export default class BuckToolbarDispatcher extends Dispatcher<BuckToolbarAction> {}
