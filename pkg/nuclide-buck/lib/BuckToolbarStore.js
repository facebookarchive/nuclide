Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _BuckToolbarDispatcher2;

function _BuckToolbarDispatcher() {
  return _BuckToolbarDispatcher2 = require('./BuckToolbarDispatcher');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var BuckToolbarStore = (function () {
  function BuckToolbarStore(dispatcher, initialState) {
    _classCallCheck(this, BuckToolbarStore);

    this._dispatcher = dispatcher;
    this._emitter = new (_atom2 || _atom()).Emitter();
    this._initState(initialState);
    this._setupActions();
  }

  _createClass(BuckToolbarStore, [{
    key: '_initState',
    value: function _initState(initialState) {
      this._devices = [];
      this._isLoadingRule = false;
      this._buildTarget = initialState && initialState.buildTarget || '';
      this._buildRuleType = null;
      this._isReactNativeServerMode = initialState && initialState.isReactNativeServerMode || false;
      this._taskSettings = initialState && initialState.taskSettings || {};
      this._simulator = initialState && initialState.simulator || null;
    }
  }, {
    key: '_setupActions',
    value: function _setupActions() {
      var _this = this;

      this._dispatcher.register(function (action) {
        switch (action.actionType) {
          case (_BuckToolbarDispatcher2 || _BuckToolbarDispatcher()).ActionTypes.UPDATE_BUCK_ROOT:
            _this._currentProjectRoot = action.projectRoot;
            _this._currentBuckRoot = action.buckRoot;
            break;
          case (_BuckToolbarDispatcher2 || _BuckToolbarDispatcher()).ActionTypes.UPDATE_BUILD_TARGET:
            _this._buildTarget = action.buildTarget;
            break;
          case (_BuckToolbarDispatcher2 || _BuckToolbarDispatcher()).ActionTypes.UPDATE_IS_LOADING_RULE:
            _this._isLoadingRule = action.isLoadingRule;
            break;
          case (_BuckToolbarDispatcher2 || _BuckToolbarDispatcher()).ActionTypes.UPDATE_RULE_TYPE:
            _this._buildRuleType = action.ruleType;
            break;
          case (_BuckToolbarDispatcher2 || _BuckToolbarDispatcher()).ActionTypes.UPDATE_SIMULATOR:
            _this._simulator = action.simulator;
            break;
          case (_BuckToolbarDispatcher2 || _BuckToolbarDispatcher()).ActionTypes.UPDATE_REACT_NATIVE_SERVER_MODE:
            _this._isReactNativeServerMode = action.serverMode;
            break;
          case (_BuckToolbarDispatcher2 || _BuckToolbarDispatcher()).ActionTypes.UPDATE_TASK_SETTINGS:
            _this._taskSettings = _extends({}, _this._taskSettings, _defineProperty({}, action.taskType, action.settings));
            break;
          case (_BuckToolbarDispatcher2 || _BuckToolbarDispatcher()).ActionTypes.UPDATE_DEVICES:
            _this._devices = action.devices;
            var currentDeviceId = _this._simulator;
            var isInvalidSimulator = currentDeviceId == null || !_this._devices.some(function (device) {
              return device.udid === currentDeviceId;
            });
            if (isInvalidSimulator && _this._devices.length) {
              _this._simulator = _this._devices[0].udid;
            }
            break;
        }
        _this.emitChange();
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._emitter.dispose();
    }
  }, {
    key: 'subscribe',
    value: function subscribe(callback) {
      return this._emitter.on('change', callback);
    }
  }, {
    key: 'emitChange',
    value: function emitChange() {
      this._emitter.emit('change');
    }
  }, {
    key: 'getBuildTarget',
    value: function getBuildTarget() {
      return this._buildTarget;
    }
  }, {
    key: 'getCurrentProjectRoot',
    value: function getCurrentProjectRoot() {
      return this._currentProjectRoot;
    }
  }, {
    key: 'getCurrentBuckRoot',
    value: function getCurrentBuckRoot() {
      return this._currentBuckRoot;
    }
  }, {
    key: 'getDevices',
    value: function getDevices() {
      return this._devices;
    }
  }, {
    key: 'isLoadingRule',
    value: function isLoadingRule() {
      return this._isLoadingRule;
    }
  }, {
    key: 'getRuleType',
    value: function getRuleType() {
      return this._buildRuleType;
    }
  }, {
    key: 'canBeReactNativeApp',
    value: function canBeReactNativeApp() {
      return this._buildRuleType === 'apple_bundle' || this._buildRuleType === 'android_binary';
    }
  }, {
    key: 'isReactNativeServerMode',
    value: function isReactNativeServerMode() {
      return this.canBeReactNativeApp() && this._isReactNativeServerMode;
    }
  }, {
    key: 'isInstallableRule',
    value: function isInstallableRule() {
      return this.canBeReactNativeApp() || this._buildRuleType === 'apk_genrule';
    }
  }, {
    key: 'isDebuggableRule',
    value: function isDebuggableRule() {
      return this.isInstallableRule() || this._buildRuleType === 'cxx_test' || this._buildRuleType === 'cxx_binary';
    }
  }, {
    key: 'getSimulator',
    value: function getSimulator() {
      return this._simulator;
    }
  }, {
    key: 'getTaskSettings',
    value: function getTaskSettings() {
      return this._taskSettings;
    }
  }]);

  return BuckToolbarStore;
})();

exports.default = BuckToolbarStore;
module.exports = exports.default;