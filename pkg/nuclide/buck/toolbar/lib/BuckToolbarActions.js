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
    key: 'debug',
    value: function debug() {
      this._dispatcher.dispatch({ actionType: BuckToolbarActions.ActionType.DEBUG });
    }
  }]);

  return BuckToolbarActions;
})();

BuckToolbarActions.ActionType = {
  BUILD: 'BUILD',
  DEBUG: 'DEBUG',
  RUN: 'RUN',
  TOGGLE_PANEL_VISIBILITY: 'TOGGLE_PANEL_VISIBILITY',
  UPDATE_BUILD_TARGET: 'UPDATE_BUILD_TARGET',
  UPDATE_PANEL_VISIBILITY: 'UPDATE_PANEL_VISIBILITY',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  UPDATE_REACT_NATIVE_SERVER_MODE: 'UPDATE_REACT_NATIVE_SERVER_MODE',
  UPDATE_SIMULATOR: 'UPDATE_SIMULATOR'
};

module.exports = BuckToolbarActions;
//# sourceMappingURL=data:application/json;base64,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Jztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7RGlzcGF0Y2hlcn0gPSByZXF1aXJlKCdmbHV4Jyk7XG5cbmNsYXNzIEJ1Y2tUb29sYmFyQWN0aW9ucyB7XG5cbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG5cbiAgc3RhdGljIEFjdGlvblR5cGU6IHtba2V5OnN0cmluZ106IHN0cmluZ307XG5cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICB9XG5cbiAgdG9nZ2xlUGFuZWxWaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVE9HR0xFX1BBTkVMX1ZJU0lCSUxJVFksXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVJc1BhbmVsVmlzaWJsZShpc1BhbmVsVmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX1BBTkVMX1ZJU0lCSUxJVFksXG4gICAgICBpc1BhbmVsVmlzaWJsZSxcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVByb2plY3RGb3IoZWRpdG9yOiBUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfUFJPSkVDVCxcbiAgICAgIGVkaXRvcixcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZUJ1aWxkVGFyZ2V0KGJ1aWxkVGFyZ2V0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlVQREFURV9CVUlMRF9UQVJHRVQsXG4gICAgICBidWlsZFRhcmdldCxcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVNpbXVsYXRvcihzaW11bGF0b3I6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX1NJTVVMQVRPUixcbiAgICAgIHNpbXVsYXRvcixcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVJlYWN0TmF0aXZlU2VydmVyTW9kZShzZXJ2ZXJNb2RlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfUkVBQ1RfTkFUSVZFX1NFUlZFUl9NT0RFLFxuICAgICAgc2VydmVyTW9kZSxcbiAgICB9KTtcbiAgfVxuXG4gIGJ1aWxkKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLkJVSUxEfSk7XG4gIH1cblxuICBydW4oKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuUlVOfSk7XG4gIH1cblxuICBkZWJ1ZygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5ERUJVR30pO1xuICB9XG59XG5cbkJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlID0ge1xuICBCVUlMRDogJ0JVSUxEJyxcbiAgREVCVUc6ICdERUJVRycsXG4gIFJVTjogJ1JVTicsXG4gIFRPR0dMRV9QQU5FTF9WSVNJQklMSVRZOiAnVE9HR0xFX1BBTkVMX1ZJU0lCSUxJVFknLFxuICBVUERBVEVfQlVJTERfVEFSR0VUOiAnVVBEQVRFX0JVSUxEX1RBUkdFVCcsXG4gIFVQREFURV9QQU5FTF9WSVNJQklMSVRZOiAnVVBEQVRFX1BBTkVMX1ZJU0lCSUxJVFknLFxuICBVUERBVEVfUFJPSkVDVDogJ1VQREFURV9QUk9KRUNUJyxcbiAgVVBEQVRFX1JFQUNUX05BVElWRV9TRVJWRVJfTU9ERTogJ1VQREFURV9SRUFDVF9OQVRJVkVfU0VSVkVSX01PREUnLFxuICBVUERBVEVfU0lNVUxBVE9SOiAnVVBEQVRFX1NJTVVMQVRPUicsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1Y2tUb29sYmFyQWN0aW9ucztcbiJdfQ==