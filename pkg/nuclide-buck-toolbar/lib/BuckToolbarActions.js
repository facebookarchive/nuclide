var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('flux');

var Dispatcher = _require.Dispatcher;

var BuckToolbarActions = (function () {
  _createClass(BuckToolbarActions, null, [{
    key: 'ActionType',
    value: Object.freeze({
      BUILD: 'BUILD',
      DEBUG: 'DEBUG',
      RUN: 'RUN',
      TEST: 'TEST',
      TOGGLE_PANEL_VISIBILITY: 'TOGGLE_PANEL_VISIBILITY',
      UPDATE_BUILD_TARGET: 'UPDATE_BUILD_TARGET',
      UPDATE_PANEL_VISIBILITY: 'UPDATE_PANEL_VISIBILITY',
      UPDATE_PROJECT: 'UPDATE_PROJECT',
      UPDATE_REACT_NATIVE_SERVER_MODE: 'UPDATE_REACT_NATIVE_SERVER_MODE',
      UPDATE_SIMULATOR: 'UPDATE_SIMULATOR'
    }),
    enumerable: true
  }]);

  function BuckToolbarActions(dispatcher) {
    _classCallCheck(this, BuckToolbarActions);

    this._dispatcher = dispatcher;
  }

  _createClass(BuckToolbarActions, [{
    key: 'togglePanelVisibility',
    value: function togglePanelVisibility() {
      this._dispatcher.dispatch({
        actionType: BuckToolbarActions.ActionType.TOGGLE_PANEL_VISIBILITY
      });
    }
  }, {
    key: 'updateIsPanelVisible',
    value: function updateIsPanelVisible(isPanelVisible) {
      this._dispatcher.dispatch({
        actionType: BuckToolbarActions.ActionType.UPDATE_PANEL_VISIBILITY,
        isPanelVisible: isPanelVisible
      });
    }
  }, {
    key: 'updateProjectFor',
    value: function updateProjectFor(editor) {
      this._dispatcher.dispatch({
        actionType: BuckToolbarActions.ActionType.UPDATE_PROJECT,
        editor: editor
      });
    }
  }, {
    key: 'updateBuildTarget',
    value: function updateBuildTarget(buildTarget) {
      this._dispatcher.dispatch({
        actionType: BuckToolbarActions.ActionType.UPDATE_BUILD_TARGET,
        buildTarget: buildTarget
      });
    }
  }, {
    key: 'updateSimulator',
    value: function updateSimulator(simulator) {
      this._dispatcher.dispatch({
        actionType: BuckToolbarActions.ActionType.UPDATE_SIMULATOR,
        simulator: simulator
      });
    }
  }, {
    key: 'updateReactNativeServerMode',
    value: function updateReactNativeServerMode(serverMode) {
      this._dispatcher.dispatch({
        actionType: BuckToolbarActions.ActionType.UPDATE_REACT_NATIVE_SERVER_MODE,
        serverMode: serverMode
      });
    }
  }, {
    key: 'build',
    value: function build() {
      this._dispatcher.dispatch({ actionType: BuckToolbarActions.ActionType.BUILD });
    }
  }, {
    key: 'run',
    value: function run() {
      this._dispatcher.dispatch({ actionType: BuckToolbarActions.ActionType.RUN });
    }
  }, {
    key: 'test',
    value: function test() {
      this._dispatcher.dispatch({ actionType: BuckToolbarActions.ActionType.TEST });
    }
  }, {
    key: 'debug',
    value: function debug() {
      this._dispatcher.dispatch({ actionType: BuckToolbarActions.ActionType.DEBUG });
    }
  }]);

  return BuckToolbarActions;
})();

module.exports = BuckToolbarActions;