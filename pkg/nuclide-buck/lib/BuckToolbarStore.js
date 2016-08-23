'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {SerializedState, TaskSettings, TaskType} from './types';
import type {Device} from './IosSimulator';

import {Emitter} from 'atom';
import {Dispatcher} from 'flux';
import BuckToolbarActions from './BuckToolbarActions';

export default class BuckToolbarStore {

  _devices: Array<Device>;
  _dispatcher: Dispatcher;
  _emitter: Emitter;
  _currentProjectRoot: ?string;
  _currentBuckRoot: ?string;
  _isLoadingRule: boolean;
  _buildTarget: string;
  _buildRuleType: ?string;
  _simulator: ?string;
  _isReactNativeServerMode: boolean;
  _taskSettings: {[key: TaskType]: TaskSettings};

  constructor(dispatcher: Dispatcher, initialState: ?SerializedState) {
    this._dispatcher = dispatcher;
    this._emitter = new Emitter();
    this._initState(initialState);
    this._setupActions();
  }

  _initState(initialState: ?SerializedState) {
    this._devices = [];
    this._isLoadingRule = false;
    this._buildTarget = initialState && initialState.buildTarget || '';
    this._buildRuleType = null;
    this._isReactNativeServerMode = initialState && initialState.isReactNativeServerMode || false;
    this._taskSettings = initialState && initialState.taskSettings || {};
    this._simulator = initialState && initialState.simulator || null;
  }

  _setupActions() {
    this._dispatcher.register(action => {
      switch (action.actionType) {
        case BuckToolbarActions.ActionType.UPDATE_BUCK_ROOT:
          this._currentProjectRoot = action.projectRoot;
          this._currentBuckRoot = action.buckRoot;
          break;
        case BuckToolbarActions.ActionType.UPDATE_BUILD_TARGET:
          this._buildTarget = action.buildTarget;
          break;
        case BuckToolbarActions.ActionType.UPDATE_IS_LOADING_RULE:
          this._isLoadingRule = action.isLoadingRule;
          break;
        case BuckToolbarActions.ActionType.UPDATE_RULE_TYPE:
          this._buildRuleType = action.ruleType;
          break;
        case BuckToolbarActions.ActionType.UPDATE_SIMULATOR:
          this._simulator = action.simulator;
          break;
        case BuckToolbarActions.ActionType.UPDATE_REACT_NATIVE_SERVER_MODE:
          this._isReactNativeServerMode = action.serverMode;
          break;
        case BuckToolbarActions.ActionType.UPDATE_TASK_SETTINGS:
          this._taskSettings = {
            ...this._taskSettings,
            [action.taskType]: action.settings,
          };
          break;
        case BuckToolbarActions.ActionType.UPDATE_DEVICES:
          this._devices = action.devices;
          const currentDeviceId = this._simulator;
          const isInvalidSimulator = currentDeviceId == null
            || !this._devices.some(device => device.udid === currentDeviceId);
          if (isInvalidSimulator && this._devices.length) {
            this._simulator = this._devices[0].udid;
          }
          break;
      }
      this.emitChange();
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

  getCurrentProjectRoot(): ?string {
    return this._currentProjectRoot;
  }

  getCurrentBuckRoot(): ?string {
    return this._currentBuckRoot;
  }

  getDevices(): Array<Device> {
    return this._devices;
  }

  isLoadingRule(): boolean {
    return this._isLoadingRule;
  }

  getRuleType(): ?string {
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

  isDebuggableRule(): boolean {
    return this.isInstallableRule() || this._buildRuleType === 'cxx_test';
  }

  getSimulator(): ?string {
    return this._simulator;
  }

  getTaskSettings(): {[key: TaskType]: TaskSettings} {
    return this._taskSettings;
  }

}
