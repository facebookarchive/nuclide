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

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _BuckToolbarDispatcher;

function _load_BuckToolbarDispatcher() {
  return _BuckToolbarDispatcher = require('./BuckToolbarDispatcher');
}

var _nuclideBuckBase;

function _load_nuclideBuckBase() {
  return _nuclideBuckBase = require('../../nuclide-buck-base');
}

var _nuclideIosCommon;

function _load_nuclideIosCommon() {
  return _nuclideIosCommon = _interopRequireWildcard(require('../../nuclide-ios-common'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let BuckToolbarActions = class BuckToolbarActions {

  constructor(dispatcher, store) {
    this._dispatcher = dispatcher;
    this._store = store;
    this._loadingRules = 0;
  }
  // TODO(hansonw): Will be obsolete when this is an observable stream.


  updateProjectRoot(path) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const buckRoot = path == null ? null : yield (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckProjectRoot)(path);
      _this._dispatcher.dispatch({
        actionType: (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_BUCK_ROOT,
        projectRoot: path,
        buckRoot: buckRoot
      });
      // Update the build target information as well.
      _this.updateBuildTarget(_this._store.getBuildTarget());
    })();
  }

  updateBuildTarget(buildTarget) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this2._dispatcher.dispatch({
        actionType: (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_BUILD_TARGET,
        buildTarget: buildTarget
      });

      // Find the rule type, if applicable.
      const buckRoot = _this2._store.getCurrentBuckRoot();
      if (buckRoot != null) {
        if (_this2._loadingRules++ === 0) {
          _this2._dispatcher.dispatch({
            actionType: (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_IS_LOADING_RULE,
            isLoadingRule: true
          });
        }
        const buckService = (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckService)(buckRoot);
        const buildRuleType = buckService == null || buildTarget === '' ? null : yield buckService.buildRuleTypeFor(buckRoot, buildTarget)
        // Most likely, this is an invalid target, so do nothing.
        .catch(function (e) {
          return null;
        });
        _this2._dispatcher.dispatch({
          actionType: (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_RULE_TYPE,
          ruleType: buildRuleType
        });
        if (--_this2._loadingRules === 0) {
          _this2._dispatcher.dispatch({
            actionType: (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_IS_LOADING_RULE,
            isLoadingRule: false
          });
        }
      }
    })();
  }

  fetchDevices() {
    if (this._devicesSubscription != null) {
      this._devicesSubscription.unsubscribe();
    }
    this._dispatcher.dispatch({
      actionType: (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_DEVICES,
      devices: []
    });
    this._devicesSubscription = (_nuclideIosCommon || _load_nuclideIosCommon()).getDevices().subscribe(devices => {
      this._dispatcher.dispatch({
        actionType: (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_DEVICES,
        devices: devices
      });
    });
  }

  updateSimulator(simulator) {
    this._dispatcher.dispatch({
      actionType: (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_SIMULATOR,
      simulator: simulator
    });
  }

  updateReactNativeServerMode(serverMode) {
    this._dispatcher.dispatch({
      actionType: (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_REACT_NATIVE_SERVER_MODE,
      serverMode: serverMode
    });
  }

  updateTaskSettings(taskType, settings) {
    this._dispatcher.dispatch({
      actionType: (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).ActionTypes.UPDATE_TASK_SETTINGS,
      taskType: taskType,
      settings: settings
    });
  }

};
exports.default = BuckToolbarActions;
module.exports = exports['default'];