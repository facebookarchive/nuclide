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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ReactNativeServerActions = (function () {
  function ReactNativeServerActions(dispatcher) {
    _classCallCheck(this, ReactNativeServerActions);

    this._dispatcher = dispatcher;
  }

  _createClass(ReactNativeServerActions, [{
    key: 'startNodeExecutorServer',
    value: function startNodeExecutorServer() {
      this._dispatcher.dispatch({
        actionType: ReactNativeServerActions.ActionType.START_NODE_EXECUTOR_SERVER
      });
    }
  }, {
    key: 'startServer',
    value: function startServer(commandInfo) {
      this._dispatcher.dispatch({
        actionType: ReactNativeServerActions.ActionType.START_SERVER,
        commandInfo: commandInfo
      });
    }
  }, {
    key: 'stopServer',
    value: function stopServer() {
      this._dispatcher.dispatch({ actionType: ReactNativeServerActions.ActionType.STOP_SERVER });
    }
  }, {
    key: 'restartServer',
    value: function restartServer(commandInfo) {
      this._dispatcher.dispatch({
        actionType: ReactNativeServerActions.ActionType.RESTART_SERVER,
        commandInfo: commandInfo
      });
    }
  }]);

  return ReactNativeServerActions;
})();

exports['default'] = ReactNativeServerActions;

ReactNativeServerActions.ActionType = Object.freeze({
  START_NODE_EXECUTOR_SERVER: 'START_NODE_EXECUTOR_SERVER',
  START_SERVER: 'START_SERVER',
  STOP_SERVER: 'STOP_SERVER',
  RESTART_SERVER: 'RESTART_SERVER'
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0lBY3FCLHdCQUF3QjtBQU1oQyxXQU5RLHdCQUF3QixDQU0vQixVQUFzQixFQUFFOzBCQU5qQix3QkFBd0I7O0FBT3pDLFFBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0dBQy9COztlQVJrQix3QkFBd0I7O1dBVXBCLG1DQUFHO0FBQ3hCLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsd0JBQXdCLENBQUMsVUFBVSxDQUFDLDBCQUEwQjtPQUMzRSxDQUFDLENBQUM7S0FDSjs7O1dBRVUscUJBQUMsV0FBd0IsRUFBRTtBQUNwQyxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxZQUFZO0FBQzVELG1CQUFXLEVBQVgsV0FBVztPQUNaLENBQUMsQ0FBQztLQUNKOzs7V0FFUyxzQkFBRztBQUNYLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUMsVUFBVSxFQUFFLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDO0tBQzFGOzs7V0FFWSx1QkFBQyxXQUF3QixFQUFFO0FBQ3RDLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsd0JBQXdCLENBQUMsVUFBVSxDQUFDLGNBQWM7QUFDOUQsbUJBQVcsRUFBWCxXQUFXO09BQ1osQ0FBQyxDQUFDO0tBQ0o7OztTQWhDa0Isd0JBQXdCOzs7cUJBQXhCLHdCQUF3Qjs7QUFtQzdDLHdCQUF3QixDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2xELDRCQUEwQixFQUFFLDRCQUE0QjtBQUN4RCxjQUFZLEVBQUUsY0FBYztBQUM1QixhQUFXLEVBQUUsYUFBYTtBQUMxQixnQkFBYyxFQUFFLGdCQUFnQjtDQUNqQyxDQUFDLENBQUMiLCJmaWxlIjoiUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0NvbW1hbmRJbmZvfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zIHtcblxuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcblxuICBzdGF0aWMgQWN0aW9uVHlwZToge1trZXk6IHN0cmluZ106IHN0cmluZ307XG5cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICB9XG5cbiAgc3RhcnROb2RlRXhlY3V0b3JTZXJ2ZXIoKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuQWN0aW9uVHlwZS5TVEFSVF9OT0RFX0VYRUNVVE9SX1NFUlZFUixcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0U2VydmVyKGNvbW1hbmRJbmZvOiBDb21tYW5kSW5mbykge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zLkFjdGlvblR5cGUuU1RBUlRfU0VSVkVSLFxuICAgICAgY29tbWFuZEluZm8sXG4gICAgfSk7XG4gIH1cblxuICBzdG9wU2VydmVyKCkge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvblR5cGU6IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5BY3Rpb25UeXBlLlNUT1BfU0VSVkVSfSk7XG4gIH1cblxuICByZXN0YXJ0U2VydmVyKGNvbW1hbmRJbmZvOiBDb21tYW5kSW5mbykge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zLkFjdGlvblR5cGUuUkVTVEFSVF9TRVJWRVIsXG4gICAgICBjb21tYW5kSW5mbyxcbiAgICB9KTtcbiAgfVxufVxuXG5SZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuQWN0aW9uVHlwZSA9IE9iamVjdC5mcmVlemUoe1xuICBTVEFSVF9OT0RFX0VYRUNVVE9SX1NFUlZFUjogJ1NUQVJUX05PREVfRVhFQ1VUT1JfU0VSVkVSJyxcbiAgU1RBUlRfU0VSVkVSOiAnU1RBUlRfU0VSVkVSJyxcbiAgU1RPUF9TRVJWRVI6ICdTVE9QX1NFUlZFUicsXG4gIFJFU1RBUlRfU0VSVkVSOiAnUkVTVEFSVF9TRVJWRVInLFxufSk7XG4iXX0=