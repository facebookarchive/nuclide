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
    value: {
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
    },
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
//# sourceMappingURL=data:application/json;base64,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QUM7S0FDOUU7OztTQTVFRyxrQkFBa0I7OztBQStFeEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJCdWNrVG9vbGJhckFjdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7RGlzcGF0Y2hlcn0gPSByZXF1aXJlKCdmbHV4Jyk7XG5cbmNsYXNzIEJ1Y2tUb29sYmFyQWN0aW9ucyB7XG5cbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG5cbiAgc3RhdGljIEFjdGlvblR5cGUgPSB7XG4gICAgQlVJTEQ6ICdCVUlMRCcsXG4gICAgREVCVUc6ICdERUJVRycsXG4gICAgUlVOOiAnUlVOJyxcbiAgICBURVNUOiAnVEVTVCcsXG4gICAgVE9HR0xFX1BBTkVMX1ZJU0lCSUxJVFk6ICdUT0dHTEVfUEFORUxfVklTSUJJTElUWScsXG4gICAgVVBEQVRFX0JVSUxEX1RBUkdFVDogJ1VQREFURV9CVUlMRF9UQVJHRVQnLFxuICAgIFVQREFURV9QQU5FTF9WSVNJQklMSVRZOiAnVVBEQVRFX1BBTkVMX1ZJU0lCSUxJVFknLFxuICAgIFVQREFURV9QUk9KRUNUOiAnVVBEQVRFX1BST0pFQ1QnLFxuICAgIFVQREFURV9SRUFDVF9OQVRJVkVfU0VSVkVSX01PREU6ICdVUERBVEVfUkVBQ1RfTkFUSVZFX1NFUlZFUl9NT0RFJyxcbiAgICBVUERBVEVfU0lNVUxBVE9SOiAnVVBEQVRFX1NJTVVMQVRPUicsXG4gIH07XG5cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICB9XG5cbiAgdG9nZ2xlUGFuZWxWaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVE9HR0xFX1BBTkVMX1ZJU0lCSUxJVFksXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVJc1BhbmVsVmlzaWJsZShpc1BhbmVsVmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX1BBTkVMX1ZJU0lCSUxJVFksXG4gICAgICBpc1BhbmVsVmlzaWJsZSxcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVByb2plY3RGb3IoZWRpdG9yOiBUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfUFJPSkVDVCxcbiAgICAgIGVkaXRvcixcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZUJ1aWxkVGFyZ2V0KGJ1aWxkVGFyZ2V0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlVQREFURV9CVUlMRF9UQVJHRVQsXG4gICAgICBidWlsZFRhcmdldCxcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVNpbXVsYXRvcihzaW11bGF0b3I6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX1NJTVVMQVRPUixcbiAgICAgIHNpbXVsYXRvcixcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVJlYWN0TmF0aXZlU2VydmVyTW9kZShzZXJ2ZXJNb2RlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfUkVBQ1RfTkFUSVZFX1NFUlZFUl9NT0RFLFxuICAgICAgc2VydmVyTW9kZSxcbiAgICB9KTtcbiAgfVxuXG4gIGJ1aWxkKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLkJVSUxEfSk7XG4gIH1cblxuICBydW4oKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuUlVOfSk7XG4gIH1cblxuICB0ZXN0KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlRFU1R9KTtcbiAgfVxuXG4gIGRlYnVnKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLkRFQlVHfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCdWNrVG9vbGJhckFjdGlvbnM7XG4iXX0=