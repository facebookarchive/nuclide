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
import type {Device} from '../../nuclide-ios-common';
import type BuckToolbarDispatcher from './BuckToolbarDispatcher';

import {ActionTypes} from './BuckToolbarDispatcher';
import {Emitter} from 'atom';

export default class BuckToolbarStore {

  _devices: Array<Device>;
  _dispatcher: BuckToolbarDispatcher;
  _emitter: Emitter;
  _currentProjectRoot: ?string;
  _currentBuckRoot: ?string;
  _isLoadingBuckProject: boolean;
  _isLoadingRule: boolean;
  _buildTarget: string;
  _buildRuleType: ?string;
  _simulator: ?string;
  _isReactNativeServerMode: boolean;
  _taskSettings: {[key: TaskType]: TaskSettings};

  constructor(dispatcher: BuckToolbarDispatcher, initialState: ?SerializedState) {
    this._dispatcher = dispatcher;
    this._emitter = new Emitter();
    this._initState(initialState);
    this._setupActions();
  }

  _initState(initialState: ?SerializedState) {
    this._devices = [];
    this._isLoadingBuckProject = true;
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
        case ActionTypes.UPDATE_BUCK_ROOT:
          this._currentBuckRoot = action.buckRoot;
          this._isLoadingBuckProject = false;
          break;
        case ActionTypes.UPDATE_PROJECT_ROOT:
          this._currentProjectRoot = action.projectRoot;
          // Null the Buck root since we don't know what it is yet.
          this._currentBuckRoot = null;
          this._isLoadingBuckProject = true;
          break;
        case ActionTypes.UPDATE_BUILD_TARGET:
          this._buildTarget = action.buildTarget;
          break;
        case ActionTypes.UPDATE_IS_LOADING_RULE:
          this._isLoadingRule = action.isLoadingRule;
          break;
        case ActionTypes.UPDATE_RULE_TYPE:
          this._buildRuleType = action.ruleType;
          break;
        case ActionTypes.UPDATE_SIMULATOR:
          this._simulator = action.simulator;
          break;
        case ActionTypes.UPDATE_REACT_NATIVE_SERVER_MODE:
          this._isReactNativeServerMode = action.serverMode;
          break;
        case ActionTypes.UPDATE_TASK_SETTINGS:
          this._taskSettings = {
            ...this._taskSettings,
            [action.taskType]: action.settings,
          };
          break;
        case ActionTypes.UPDATE_DEVICES:
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

  isLoadingBuckProject(): boolean {
    return this._isLoadingBuckProject;
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
    return this.isInstallableRule() || this._buildRuleType === 'cxx_test' ||
      this._buildRuleType === 'cxx_binary';
  }

  getSimulator(): ?string {
    return this._simulator;
  }

  getTaskSettings(): {[key: TaskType]: TaskSettings} {
    return this._taskSettings;
  }

}
