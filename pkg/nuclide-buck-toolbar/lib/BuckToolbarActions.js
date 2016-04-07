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
//# sourceMappingURL=data:application/json;base64,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QVUsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDO0tBQzlFOzs7U0E1RUcsa0JBQWtCOzs7QUErRXhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiQnVja1Rvb2xiYXJBY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0Rpc3BhdGNoZXJ9ID0gcmVxdWlyZSgnZmx1eCcpO1xuXG5jbGFzcyBCdWNrVG9vbGJhckFjdGlvbnMge1xuXG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuXG4gIHN0YXRpYyBBY3Rpb25UeXBlID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgQlVJTEQ6ICdCVUlMRCcsXG4gICAgREVCVUc6ICdERUJVRycsXG4gICAgUlVOOiAnUlVOJyxcbiAgICBURVNUOiAnVEVTVCcsXG4gICAgVE9HR0xFX1BBTkVMX1ZJU0lCSUxJVFk6ICdUT0dHTEVfUEFORUxfVklTSUJJTElUWScsXG4gICAgVVBEQVRFX0JVSUxEX1RBUkdFVDogJ1VQREFURV9CVUlMRF9UQVJHRVQnLFxuICAgIFVQREFURV9QQU5FTF9WSVNJQklMSVRZOiAnVVBEQVRFX1BBTkVMX1ZJU0lCSUxJVFknLFxuICAgIFVQREFURV9QUk9KRUNUOiAnVVBEQVRFX1BST0pFQ1QnLFxuICAgIFVQREFURV9SRUFDVF9OQVRJVkVfU0VSVkVSX01PREU6ICdVUERBVEVfUkVBQ1RfTkFUSVZFX1NFUlZFUl9NT0RFJyxcbiAgICBVUERBVEVfU0lNVUxBVE9SOiAnVVBEQVRFX1NJTVVMQVRPUicsXG4gIH0pO1xuXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgfVxuXG4gIHRvZ2dsZVBhbmVsVmlzaWJpbGl0eSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlRPR0dMRV9QQU5FTF9WSVNJQklMSVRZLFxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlSXNQYW5lbFZpc2libGUoaXNQYW5lbFZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlVQREFURV9QQU5FTF9WSVNJQklMSVRZLFxuICAgICAgaXNQYW5lbFZpc2libGUsXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVQcm9qZWN0Rm9yKGVkaXRvcjogVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX1BST0pFQ1QsXG4gICAgICBlZGl0b3IsXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVCdWlsZFRhcmdldChidWlsZFRhcmdldDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfQlVJTERfVEFSR0VULFxuICAgICAgYnVpbGRUYXJnZXQsXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVTaW11bGF0b3Ioc2ltdWxhdG9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlVQREFURV9TSU1VTEFUT1IsXG4gICAgICBzaW11bGF0b3IsXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVSZWFjdE5hdGl2ZVNlcnZlck1vZGUoc2VydmVyTW9kZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX1JFQUNUX05BVElWRV9TRVJWRVJfTU9ERSxcbiAgICAgIHNlcnZlck1vZGUsXG4gICAgfSk7XG4gIH1cblxuICBidWlsZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5CVUlMRH0pO1xuICB9XG5cbiAgcnVuKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlJVTn0pO1xuICB9XG5cbiAgdGVzdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5URVNUfSk7XG4gIH1cblxuICBkZWJ1ZygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5ERUJVR30pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnVja1Rvb2xiYXJBY3Rpb25zO1xuIl19