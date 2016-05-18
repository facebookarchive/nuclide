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

import {Dispatcher} from 'flux';
import {keyMirror} from '../../commons-node/collection';
import {getBuckProject} from '../../nuclide-buck-base';

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
    UPDATE_PROJECT: null,
    UPDATE_REACT_NATIVE_SERVER_MODE: null,
    UPDATE_SIMULATOR: null,
  }));

  constructor(
    dispatcher: Dispatcher,
    store: BuckToolbarStore,
  ) {
    this._dispatcher = dispatcher;
    this._store = store;
    this._loadingRules = 0;
  }

  async updateProjectFor(editor: TextEditor): Promise<void> {
    const nuclideUri = editor.getPath();
    if (!nuclideUri) {
      return;
    }

    const buckProject = await getBuckProject(nuclideUri);
    if (buckProject != null && buckProject !== this._store.getMostRecentBuckProject()) {
      this._dispatcher.dispatch({
        actionType: BuckToolbarActions.ActionType.UPDATE_PROJECT,
        project: buckProject,
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
    const buckProject = this._store.getMostRecentBuckProject();
    if (buckProject != null) {
      if (this._loadingRules++ === 0) {
        this._dispatcher.dispatch({
          actionType: BuckToolbarActions.ActionType.UPDATE_IS_LOADING_RULE,
          isLoadingRule: true,
        });
      }
      const buildRuleType = buildTarget === '' ? null :
        await buckProject.buildRuleTypeFor(buildTarget)
          // Most likely, this is an invalid target, so do nothing.
          .catch(e => null);
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

}
