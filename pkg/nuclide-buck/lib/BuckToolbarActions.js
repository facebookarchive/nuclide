'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type BuckToolbarStore from './BuckToolbarStore';
import type {TaskSettings, TaskType} from './types';
import type BuckToolbarDispatcher from './BuckToolbarDispatcher';

import {ActionTypes} from './BuckToolbarDispatcher';
import {getBuckProjectRoot, getBuckService} from '../../nuclide-buck-base';
import * as IosSimulator from '../../nuclide-ios-common';

export default class BuckToolbarActions {

  _devicesSubscription: rxjs$ISubscription;
  _dispatcher: BuckToolbarDispatcher;
  _store: BuckToolbarStore;
  // TODO(hansonw): Will be obsolete when this is an observable stream.
  _loadingRules: number;

  constructor(
    dispatcher: BuckToolbarDispatcher,
    store: BuckToolbarStore,
  ) {
    this._dispatcher = dispatcher;
    this._store = store;
    this._loadingRules = 0;
  }

  async updateProjectRoot(path: ?string): Promise<void> {
    this._dispatcher.dispatch({
      actionType: ActionTypes.UPDATE_PROJECT_ROOT,
      projectRoot: path,
    });
    // Get the Buck root for this project. Technically we have a race here since we're using
    // uncancellable promises but, in practice, we're probably fine.
    const buckRoot = path == null ? null : await getBuckProjectRoot(path);
    this._dispatcher.dispatch({
      actionType: ActionTypes.UPDATE_BUCK_ROOT,
      buckRoot,
    });
    // Update the build target information as well.
    this.updateBuildTarget(this._store.getBuildTarget());
  }

  async updateBuildTarget(buildTarget: string): Promise<void> {
    this._dispatcher.dispatch({
      actionType: ActionTypes.UPDATE_BUILD_TARGET,
      buildTarget,
    });

    // Find the rule type, if applicable.
    const buckRoot = this._store.getCurrentBuckRoot();
    if (buckRoot != null) {
      if (this._loadingRules++ === 0) {
        this._dispatcher.dispatch({
          actionType: ActionTypes.UPDATE_IS_LOADING_RULE,
          isLoadingRule: true,
        });
      }
      const buckService = getBuckService(buckRoot);
      const buildRuleType = buckService == null || buildTarget === '' ? null :
        await buckService.buildRuleTypeFor(buckRoot, buildTarget)
          // Most likely, this is an invalid target, so do nothing.
          .catch(e => null);
      this._dispatcher.dispatch({
        actionType: ActionTypes.UPDATE_RULE_TYPE,
        ruleType: buildRuleType,
      });
      if (--this._loadingRules === 0) {
        this._dispatcher.dispatch({
          actionType: ActionTypes.UPDATE_IS_LOADING_RULE,
          isLoadingRule: false,
        });
      }
    }
  }

  fetchDevices(): void {
    if (this._devicesSubscription != null) {
      this._devicesSubscription.unsubscribe();
    }
    this._dispatcher.dispatch({
      actionType: ActionTypes.UPDATE_DEVICES,
      devices: [],
    });
    this._devicesSubscription = IosSimulator.getDevices().subscribe(devices => {
      this._dispatcher.dispatch({
        actionType: ActionTypes.UPDATE_DEVICES,
        devices,
      });
    });
  }

  updateSimulator(simulator: string): void {
    this._dispatcher.dispatch({
      actionType: ActionTypes.UPDATE_SIMULATOR,
      simulator,
    });
  }

  updateTaskSettings(taskType: TaskType, settings: TaskSettings): void {
    this._dispatcher.dispatch({
      actionType: ActionTypes.UPDATE_TASK_SETTINGS,
      taskType,
      settings,
    });
  }

}
