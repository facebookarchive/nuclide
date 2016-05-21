'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BuckProject} from '../../nuclide-buck-base';
import type {SerializedState} from './types';

import {Emitter} from 'atom';
import {Dispatcher} from 'flux';
import BuckToolbarActions from './BuckToolbarActions';

export default class BuckToolbarStore {

  _dispatcher: Dispatcher;
  _emitter: Emitter;
  _mostRecentBuckProject: ?BuckProject;
  _isLoadingRule: boolean;
  _buildTarget: string;
  _buildRuleType: string;
  _simulator: ?string;
  _isReactNativeServerMode: boolean;

  constructor(dispatcher: Dispatcher, initialState: ?SerializedState) {
    this._dispatcher = dispatcher;
    this._emitter = new Emitter();
    this._initState(initialState);
    this._setupActions();
  }

  _initState(initialState: ?SerializedState) {
    this._isLoadingRule = false;
    this._buildTarget = initialState && initialState.buildTarget || '';
    this._buildRuleType = '';
    this._isReactNativeServerMode = initialState && initialState.isReactNativeServerMode || false;
  }

  _setupActions() {
    this._dispatcher.register(action => {
      switch (action.actionType) {
        case BuckToolbarActions.ActionType.UPDATE_PROJECT:
          this._mostRecentBuckProject = action.project;
          break;
        case BuckToolbarActions.ActionType.UPDATE_BUILD_TARGET:
          this._buildTarget = action.buildTarget;
          this.emitChange();
          break;
        case BuckToolbarActions.ActionType.UPDATE_IS_LOADING_RULE:
          this._isLoadingRule = action.isLoadingRule;
          this.emitChange();
          break;
        case BuckToolbarActions.ActionType.UPDATE_RULE_TYPE:
          this._buildRuleType = action.ruleType;
          this.emitChange();
          break;
        case BuckToolbarActions.ActionType.UPDATE_SIMULATOR:
          this._simulator = action.simulator;
          break;
        case BuckToolbarActions.ActionType.UPDATE_REACT_NATIVE_SERVER_MODE:
          this._isReactNativeServerMode = action.serverMode;
          this.emitChange();
          break;
      }
    });
  }

  dispose() {
    this._emitter.dispose();
  }

  subscribe(callback: () => void): IDisposable {
    return this._emitter.on('change', callback);
  }

  emitChange(): void {
    this._emitter.emit('change');
  }

  getBuildTarget(): string {
    return this._buildTarget;
  }

  getMostRecentBuckProject(): ?BuckProject {
    return this._mostRecentBuckProject;
  }

  isLoadingRule(): boolean {
    return this._isLoadingRule;
  }

  getRuleType(): string {
    return this._buildRuleType;
  }

  canBeReactNativeApp(): boolean {
    return this._buildRuleType === 'apple_bundle' || this._buildRuleType === 'android_binary';
  }

  isReactNativeServerMode(): boolean {
    return this.canBeReactNativeApp() && this._isReactNativeServerMode;
  }

  isInstallableRule(): boolean {
    return this.canBeReactNativeApp() || this._buildRuleType === 'apk_genrule';
  }

  getSimulator(): ?string {
    return this._simulator;
  }

}
