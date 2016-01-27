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

ReactNativeServerActions.ActionType = {
  START_NODE_EXECUTOR_SERVER: 'START_NODE_EXECUTOR_SERVER',
  START_SERVER: 'START_SERVER',
  STOP_SERVER: 'STOP_SERVER',
  RESTART_SERVER: 'RESTART_SERVER'
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0lBYXFCLHdCQUF3QjtBQU1oQyxXQU5RLHdCQUF3QixDQU0vQixVQUFzQixFQUFFOzBCQU5qQix3QkFBd0I7O0FBT3pDLFFBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0dBQy9COztlQVJrQix3QkFBd0I7O1dBVXBCLG1DQUFHO0FBQ3hCLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsd0JBQXdCLENBQUMsVUFBVSxDQUFDLDBCQUEwQjtPQUMzRSxDQUFDLENBQUM7S0FDSjs7O1dBRVUscUJBQUMsYUFBcUIsRUFBRTtBQUNqQyxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxZQUFZO0FBQzVELHFCQUFhLEVBQWIsYUFBYTtPQUNkLENBQUMsQ0FBQztLQUNKOzs7V0FFUyxzQkFBRztBQUNYLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUMsVUFBVSxFQUFFLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDO0tBQzFGOzs7V0FFWSx1QkFBQyxhQUFxQixFQUFFO0FBQ25DLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsd0JBQXdCLENBQUMsVUFBVSxDQUFDLGNBQWM7QUFDOUQscUJBQWEsRUFBYixhQUFhO09BQ2QsQ0FBQyxDQUFDO0tBQ0o7OztTQWhDa0Isd0JBQXdCOzs7cUJBQXhCLHdCQUF3Qjs7QUFtQzdDLHdCQUF3QixDQUFDLFVBQVUsR0FBRztBQUNwQyw0QkFBMEIsRUFBRSw0QkFBNEI7QUFDeEQsY0FBWSxFQUFFLGNBQWM7QUFDNUIsYUFBVyxFQUFFLGFBQWE7QUFDMUIsZ0JBQWMsRUFBRSxnQkFBZ0I7Q0FDakMsQ0FBQyIsImZpbGUiOiJSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyB7XG5cbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG5cbiAgc3RhdGljIEFjdGlvblR5cGU6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgfVxuXG4gIHN0YXJ0Tm9kZUV4ZWN1dG9yU2VydmVyKCkge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zLkFjdGlvblR5cGUuU1RBUlRfTk9ERV9FWEVDVVRPUl9TRVJWRVIsXG4gICAgfSk7XG4gIH1cblxuICBzdGFydFNlcnZlcihzZXJ2ZXJDb21tYW5kOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5BY3Rpb25UeXBlLlNUQVJUX1NFUlZFUixcbiAgICAgIHNlcnZlckNvbW1hbmQsXG4gICAgfSk7XG4gIH1cblxuICBzdG9wU2VydmVyKCkge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvblR5cGU6IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5BY3Rpb25UeXBlLlNUT1BfU0VSVkVSfSk7XG4gIH1cblxuICByZXN0YXJ0U2VydmVyKHNlcnZlckNvbW1hbmQ6IHN0cmluZykge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zLkFjdGlvblR5cGUuUkVTVEFSVF9TRVJWRVIsXG4gICAgICBzZXJ2ZXJDb21tYW5kLFxuICAgIH0pO1xuICB9XG59XG5cblJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5BY3Rpb25UeXBlID0ge1xuICBTVEFSVF9OT0RFX0VYRUNVVE9SX1NFUlZFUjogJ1NUQVJUX05PREVfRVhFQ1VUT1JfU0VSVkVSJyxcbiAgU1RBUlRfU0VSVkVSOiAnU1RBUlRfU0VSVkVSJyxcbiAgU1RPUF9TRVJWRVI6ICdTVE9QX1NFUlZFUicsXG4gIFJFU1RBUlRfU0VSVkVSOiAnUkVTVEFSVF9TRVJWRVInLFxufTtcbiJdfQ==