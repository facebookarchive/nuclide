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
import type {TaskSettings} from './types';

import {Dispatcher} from 'flux';
import {keyMirror} from '../../commons-node/collection';
import {getBuckProjectRoot, createBuckProject} from '../../nuclide-buck-base';

export default class BuckToolbarActions {

  _dispatcher: Dispatcher;
  _store: BuckToolbarStore;
  // TODO(hansonw): Will be obsolete when this is an observable stream.
  _loadingRules: number;

  static ActionType = Object.freeze(keyMirror({
    UPDATE_BUILD_TARGET: null,
    UPDATE_IS_LOADING_RULE: null,
    UPDATE_RULE_TYPE: null,
    UPDATE_PANEL_VISIBILITY: null,
    UPDATE_BUCK_ROOT: null,
    UPDATE_REACT_NATIVE_SERVER_MODE: null,
    UPDATE_SIMULATOR: null,
    UPDATE_TASK_SETTINGS: null,
  }));

  constructor(
    dispatcher: Dispatcher,
    store: BuckToolbarStore,
  ) {
    this._dispatcher = dispatcher;
    this._store = store;
    this._loadingRules = 0;
  }

  async updateProjectPath(path: string): Promise<void> {
    const buckRoot = await getBuckProjectRoot(path);
    if (buckRoot != null && buckRoot !== this._store.getCurrentBuckRoot()) {
      this._dispatcher.dispatch({
        actionType: BuckToolbarActions.ActionType.UPDATE_BUCK_ROOT,
        buckRoot,
      });
      // Update the build target information as well.
      this.updateBuildTarget(this._store.getBuildTarget());
    }
  }

  async updateBuildTarget(buildTarget: string): Promise<void> {
    this._dispatcher.dispatch({
      actionType: BuckToolbarActions.ActionType.UPDATE_BUILD_TARGET,
      buildTarget,
    });

    // Find the rule type, if applicable.
    const buckRoot = this._store.getCurrentBuckRoot();
    if (buckRoot != null) {
      if (this._loadingRules++ === 0) {
        this._dispatcher.dispatch({
          actionType: BuckToolbarActions.ActionType.UPDATE_IS_LOADING_RULE,
          isLoadingRule: true,
        });
      }
      const buckProject = createBuckProject(buckRoot);
      const buildRuleType = buildTarget === '' ? null :
        await buckProject.buildRuleTypeFor(buildTarget)
          // Most likely, this is an invalid target, so do nothing.
          .catch(e => null);
      buckProject.dispose();
      this._dispatcher.dispatch({
        actionType: BuckToolbarActions.ActionType.UPDATE_RULE_TYPE,
        ruleType: buildRuleType,
      });
      if (--this._loadingRules === 0) {
        this._dispatcher.dispatch({
          actionType: BuckToolbarActions.ActionType.UPDATE_IS_LOADING_RULE,
          isLoadingRule: false,
        });
      }
    }
  }

  updateSimulator(simulator: string): void {
    this._dispatcher.dispatch({
      actionType: BuckToolbarActions.ActionType.UPDATE_SIMULATOR,
      simulator,
    });
  }

  updateReactNativeServerMode(serverMode: boolean): void {
    this._dispatcher.dispatch({
      actionType: BuckToolbarActions.ActionType.UPDATE_REACT_NATIVE_SERVER_MODE,
      serverMode,
    });
  }

  updateTaskSettings(taskType: string, settings: TaskSettings): void {
    this._dispatcher.dispatch({
      actionType: BuckToolbarActions.ActionType.UPDATE_TASK_SETTINGS,
      taskType,
      settings,
    });
  }

}
