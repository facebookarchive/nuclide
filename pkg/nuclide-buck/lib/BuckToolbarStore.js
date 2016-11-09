'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _BuckToolbarDispatcher;

function _load_BuckToolbarDispatcher() {
  return _BuckToolbarDispatcher = require('./BuckToolbarDispatcher');
}

var _atom = require('atom');

let BuckToolbarStore = class BuckToolbarStore {

  constructor(dispatcher, initialState) {
    this._dispatcher = dispatcher;
    this._emitter = new _atom.Emitter();
    this._initState(initialState);
    this._setupActions();
  }

  _initState(initialState) {
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
        case (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_BUCK_ROOT:
          this._currentProjectRoot = action.projectRoot;
          this._currentBuckRoot = action.buckRoot;
          break;
        case (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_BUILD_TARGET:
          this._buildTarget = action.buildTarget;
          break;
        case (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_IS_LOADING_RULE:
          this._isLoadingRule = action.isLoadingRule;
          break;
        case (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_RULE_TYPE:
          this._buildRuleType = action.ruleType;
          break;
        case (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_SIMULATOR:
          this._simulator = action.simulator;
          break;
        case (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_REACT_NATIVE_SERVER_MODE:
          this._isReactNativeServerMode = action.serverMode;
          break;
        case (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_TASK_SETTINGS:
          this._taskSettings = Object.assign({}, this._taskSettings, {
            [action.taskType]: action.settings
          });
          break;
        case (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_DEVICES:
          this._devices = action.devices;
          const currentDeviceId = this._simulator;
          const isInvalidSimulator = currentDeviceId == null || !this._devices.some(device => device.udid === currentDeviceId);
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

  subscribe(callback) {
    return this._emitter.on('change', callback);
  }

  emitChange() {
    this._emitter.emit('change');
  }

  getBuildTarget() {
    return this._buildTarget;
  }

  getCurrentProjectRoot() {
    return this._currentProjectRoot;
  }

  getCurrentBuckRoot() {
    return this._currentBuckRoot;
  }

  getDevices() {
    return this._devices;
  }

  isLoadingRule() {
    return this._isLoadingRule;
  }

  getRuleType() {
    return this._buildRuleType;
  }

  canBeReactNativeApp() {
    return this._buildRuleType === 'apple_bundle' || this._buildRuleType === 'android_binary';
  }

  isReactNativeServerMode() {
    return this.canBeReactNativeApp() && this._isReactNativeServerMode;
  }

  isInstallableRule() {
    return this.canBeReactNativeApp() || this._buildRuleType === 'apk_genrule';
  }

  isDebuggableRule() {
    return this.isInstallableRule() || this._buildRuleType === 'cxx_test' || this._buildRuleType === 'cxx_binary';
  }

  getSimulator() {
    return this._simulator;
  }

  getTaskSettings() {
    return this._taskSettings;
  }

};
exports.default = BuckToolbarStore;
module.exports = exports['default'];