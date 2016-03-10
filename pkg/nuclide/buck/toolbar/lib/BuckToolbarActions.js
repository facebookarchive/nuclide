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
    key: 'debug',
    value: function debug() {
      this._dispatcher.dispatch({ actionType: BuckToolbarActions.ActionType.DEBUG });
    }
  }]);

  return BuckToolbarActions;
})();

module.exports = BuckToolbarActions;
//# sourceMappingURL=data:application/json;base64,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KiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0Rpc3BhdGNoZXJ9ID0gcmVxdWlyZSgnZmx1eCcpO1xuXG5jbGFzcyBCdWNrVG9vbGJhckFjdGlvbnMge1xuXG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuXG4gIHN0YXRpYyBBY3Rpb25UeXBlID0ge1xuICAgIEJVSUxEOiAnQlVJTEQnLFxuICAgIERFQlVHOiAnREVCVUcnLFxuICAgIFJVTjogJ1JVTicsXG4gICAgVE9HR0xFX1BBTkVMX1ZJU0lCSUxJVFk6ICdUT0dHTEVfUEFORUxfVklTSUJJTElUWScsXG4gICAgVVBEQVRFX0JVSUxEX1RBUkdFVDogJ1VQREFURV9CVUlMRF9UQVJHRVQnLFxuICAgIFVQREFURV9QQU5FTF9WSVNJQklMSVRZOiAnVVBEQVRFX1BBTkVMX1ZJU0lCSUxJVFknLFxuICAgIFVQREFURV9QUk9KRUNUOiAnVVBEQVRFX1BST0pFQ1QnLFxuICAgIFVQREFURV9SRUFDVF9OQVRJVkVfU0VSVkVSX01PREU6ICdVUERBVEVfUkVBQ1RfTkFUSVZFX1NFUlZFUl9NT0RFJyxcbiAgICBVUERBVEVfU0lNVUxBVE9SOiAnVVBEQVRFX1NJTVVMQVRPUicsXG4gIH07XG5cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICB9XG5cbiAgdG9nZ2xlUGFuZWxWaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVE9HR0xFX1BBTkVMX1ZJU0lCSUxJVFksXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVJc1BhbmVsVmlzaWJsZShpc1BhbmVsVmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX1BBTkVMX1ZJU0lCSUxJVFksXG4gICAgICBpc1BhbmVsVmlzaWJsZSxcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVByb2plY3RGb3IoZWRpdG9yOiBUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfUFJPSkVDVCxcbiAgICAgIGVkaXRvcixcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZUJ1aWxkVGFyZ2V0KGJ1aWxkVGFyZ2V0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlVQREFURV9CVUlMRF9UQVJHRVQsXG4gICAgICBidWlsZFRhcmdldCxcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVNpbXVsYXRvcihzaW11bGF0b3I6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX1NJTVVMQVRPUixcbiAgICAgIHNpbXVsYXRvcixcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVJlYWN0TmF0aXZlU2VydmVyTW9kZShzZXJ2ZXJNb2RlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfUkVBQ1RfTkFUSVZFX1NFUlZFUl9NT0RFLFxuICAgICAgc2VydmVyTW9kZSxcbiAgICB9KTtcbiAgfVxuXG4gIGJ1aWxkKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLkJVSUxEfSk7XG4gIH1cblxuICBydW4oKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuUlVOfSk7XG4gIH1cblxuICBkZWJ1ZygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5ERUJVR30pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnVja1Rvb2xiYXJBY3Rpb25zO1xuIl19