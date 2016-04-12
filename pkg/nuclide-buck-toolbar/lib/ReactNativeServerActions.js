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
    value: function startServer(serverCommand) {
      this._dispatcher.dispatch({
        actionType: ReactNativeServerActions.ActionType.START_SERVER,
        serverCommand: serverCommand
      });
    }
  }, {
    key: 'stopServer',
    value: function stopServer() {
      this._dispatcher.dispatch({ actionType: ReactNativeServerActions.ActionType.STOP_SERVER });
    }
  }, {
    key: 'restartServer',
    value: function restartServer(serverCommand) {
      this._dispatcher.dispatch({
        actionType: ReactNativeServerActions.ActionType.RESTART_SERVER,
        serverCommand: serverCommand
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0lBYXFCLHdCQUF3QjtBQU1oQyxXQU5RLHdCQUF3QixDQU0vQixVQUFzQixFQUFFOzBCQU5qQix3QkFBd0I7O0FBT3pDLFFBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0dBQy9COztlQVJrQix3QkFBd0I7O1dBVXBCLG1DQUFHO0FBQ3hCLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsd0JBQXdCLENBQUMsVUFBVSxDQUFDLDBCQUEwQjtPQUMzRSxDQUFDLENBQUM7S0FDSjs7O1dBRVUscUJBQUMsYUFBcUIsRUFBRTtBQUNqQyxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxZQUFZO0FBQzVELHFCQUFhLEVBQWIsYUFBYTtPQUNkLENBQUMsQ0FBQztLQUNKOzs7V0FFUyxzQkFBRztBQUNYLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUMsVUFBVSxFQUFFLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDO0tBQzFGOzs7V0FFWSx1QkFBQyxhQUFxQixFQUFFO0FBQ25DLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsd0JBQXdCLENBQUMsVUFBVSxDQUFDLGNBQWM7QUFDOUQscUJBQWEsRUFBYixhQUFhO09BQ2QsQ0FBQyxDQUFDO0tBQ0o7OztTQWhDa0Isd0JBQXdCOzs7cUJBQXhCLHdCQUF3Qjs7QUFtQzdDLHdCQUF3QixDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2xELDRCQUEwQixFQUFFLDRCQUE0QjtBQUN4RCxjQUFZLEVBQUUsY0FBYztBQUM1QixhQUFXLEVBQUUsYUFBYTtBQUMxQixnQkFBYyxFQUFFLGdCQUFnQjtDQUNqQyxDQUFDLENBQUMiLCJmaWxlIjoiUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMge1xuXG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuXG4gIHN0YXRpYyBBY3Rpb25UeXBlOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcblxuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyOiBEaXNwYXRjaGVyKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gIH1cblxuICBzdGFydE5vZGVFeGVjdXRvclNlcnZlcigpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5BY3Rpb25UeXBlLlNUQVJUX05PREVfRVhFQ1VUT1JfU0VSVkVSLFxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRTZXJ2ZXIoc2VydmVyQ29tbWFuZDogc3RyaW5nKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuQWN0aW9uVHlwZS5TVEFSVF9TRVJWRVIsXG4gICAgICBzZXJ2ZXJDb21tYW5kLFxuICAgIH0pO1xuICB9XG5cbiAgc3RvcFNlcnZlcigpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb25UeXBlOiBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuQWN0aW9uVHlwZS5TVE9QX1NFUlZFUn0pO1xuICB9XG5cbiAgcmVzdGFydFNlcnZlcihzZXJ2ZXJDb21tYW5kOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5BY3Rpb25UeXBlLlJFU1RBUlRfU0VSVkVSLFxuICAgICAgc2VydmVyQ29tbWFuZCxcbiAgICB9KTtcbiAgfVxufVxuXG5SZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuQWN0aW9uVHlwZSA9IE9iamVjdC5mcmVlemUoe1xuICBTVEFSVF9OT0RFX0VYRUNVVE9SX1NFUlZFUjogJ1NUQVJUX05PREVfRVhFQ1VUT1JfU0VSVkVSJyxcbiAgU1RBUlRfU0VSVkVSOiAnU1RBUlRfU0VSVkVSJyxcbiAgU1RPUF9TRVJWRVI6ICdTVE9QX1NFUlZFUicsXG4gIFJFU1RBUlRfU0VSVkVSOiAnUkVTVEFSVF9TRVJWRVInLFxufSk7XG4iXX0=