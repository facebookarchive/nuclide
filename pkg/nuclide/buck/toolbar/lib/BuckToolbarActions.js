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
  UPDATE_BUILD_TARGET: 'UPDATE_BUILD_TARGET',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  UPDATE_REACT_NATIVE_SERVER_MODE: 'UPDATE_REACT_NATIVE_SERVER_MODE',
  UPDATE_SIMULATOR: 'UPDATE_SIMULATOR'
};

module.exports = BuckToolbarActions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1Y2tUb29sYmFyQWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7ZUFXcUIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBN0IsVUFBVSxZQUFWLFVBQVU7O0lBRVgsa0JBQWtCO0FBTVgsV0FOUCxrQkFBa0IsQ0FNVixVQUFzQixFQUFFOzBCQU5oQyxrQkFBa0I7O0FBT3BCLFFBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0dBQy9COztlQVJHLGtCQUFrQjs7V0FVTiwwQkFBQyxNQUFrQixFQUFRO0FBQ3pDLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsa0JBQWtCLENBQUMsVUFBVSxDQUFDLGNBQWM7QUFDeEQsY0FBTSxFQUFOLE1BQU07T0FDUCxDQUFDLENBQUM7S0FDSjs7O1dBRWdCLDJCQUFDLFdBQW1CLEVBQVE7QUFDM0MsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsbUJBQW1CO0FBQzdELG1CQUFXLEVBQVgsV0FBVztPQUNaLENBQUMsQ0FBQztLQUNKOzs7V0FFYyx5QkFBQyxTQUFpQixFQUFRO0FBQ3ZDLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUFnQjtBQUMxRCxpQkFBUyxFQUFULFNBQVM7T0FDVixDQUFDLENBQUM7S0FDSjs7O1dBRTBCLHFDQUFDLFVBQW1CLEVBQVE7QUFDckQsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsK0JBQStCO0FBQ3pFLGtCQUFVLEVBQVYsVUFBVTtPQUNYLENBQUMsQ0FBQztLQUNKOzs7V0FFSSxpQkFBUztBQUNaLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUMsVUFBVSxFQUFFLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDO0tBQzlFOzs7V0FFRSxlQUFTO0FBQ1YsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBQyxVQUFVLEVBQUUsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBQyxDQUFDLENBQUM7S0FDNUU7OztXQUVJLGlCQUFTO0FBQ1osVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBQyxVQUFVLEVBQUUsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7S0FDOUU7OztTQWhERyxrQkFBa0I7OztBQW1EeEIsa0JBQWtCLENBQUMsVUFBVSxHQUFHO0FBQzlCLE9BQUssRUFBRSxPQUFPO0FBQ2QsT0FBSyxFQUFFLE9BQU87QUFDZCxLQUFHLEVBQUUsS0FBSztBQUNWLHFCQUFtQixFQUFFLHFCQUFxQjtBQUMxQyxnQkFBYyxFQUFFLGdCQUFnQjtBQUNoQyxpQ0FBK0IsRUFBRSxpQ0FBaUM7QUFDbEUsa0JBQWdCLEVBQUUsa0JBQWtCO0NBQ3JDLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJCdWNrVG9vbGJhckFjdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7RGlzcGF0Y2hlcn0gPSByZXF1aXJlKCdmbHV4Jyk7XG5cbmNsYXNzIEJ1Y2tUb29sYmFyQWN0aW9ucyB7XG5cbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG5cbiAgc3RhdGljIEFjdGlvblR5cGU6IHtba2V5OnN0cmluZ106IHN0cmluZ307XG5cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICB9XG5cbiAgdXBkYXRlUHJvamVjdEZvcihlZGl0b3I6IFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlVQREFURV9QUk9KRUNULFxuICAgICAgZWRpdG9yLFxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlQnVpbGRUYXJnZXQoYnVpbGRUYXJnZXQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX0JVSUxEX1RBUkdFVCxcbiAgICAgIGJ1aWxkVGFyZ2V0LFxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlU2ltdWxhdG9yKHNpbXVsYXRvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfU0lNVUxBVE9SLFxuICAgICAgc2ltdWxhdG9yLFxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlKHNlcnZlck1vZGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlVQREFURV9SRUFDVF9OQVRJVkVfU0VSVkVSX01PREUsXG4gICAgICBzZXJ2ZXJNb2RlLFxuICAgIH0pO1xuICB9XG5cbiAgYnVpbGQoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uVHlwZTogQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuQlVJTER9KTtcbiAgfVxuXG4gIHJ1bigpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb25UeXBlOiBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5SVU59KTtcbiAgfVxuXG4gIGRlYnVnKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvblR5cGU6IEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLkRFQlVHfSk7XG4gIH1cbn1cblxuQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUgPSB7XG4gIEJVSUxEOiAnQlVJTEQnLFxuICBERUJVRzogJ0RFQlVHJyxcbiAgUlVOOiAnUlVOJyxcbiAgVVBEQVRFX0JVSUxEX1RBUkdFVDogJ1VQREFURV9CVUlMRF9UQVJHRVQnLFxuICBVUERBVEVfUFJPSkVDVDogJ1VQREFURV9QUk9KRUNUJyxcbiAgVVBEQVRFX1JFQUNUX05BVElWRV9TRVJWRVJfTU9ERTogJ1VQREFURV9SRUFDVF9OQVRJVkVfU0VSVkVSX01PREUnLFxuICBVUERBVEVfU0lNVUxBVE9SOiAnVVBEQVRFX1NJTVVMQVRPUicsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1Y2tUb29sYmFyQWN0aW9ucztcbiJdfQ==