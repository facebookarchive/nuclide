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

ReactNativeServerActions.ActionType = {
  START_NODE_EXECUTOR_SERVER: 'START_NODE_EXECUTOR_SERVER',
  START_SERVER: 'START_SERVER',
  STOP_SERVER: 'STOP_SERVER',
  RESTART_SERVER: 'RESTART_SERVER'
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0lBY3FCLHdCQUF3QjtBQU1oQyxXQU5RLHdCQUF3QixDQU0vQixVQUFzQixFQUFFOzBCQU5qQix3QkFBd0I7O0FBT3pDLFFBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0dBQy9COztlQVJrQix3QkFBd0I7O1dBVXBCLG1DQUFHO0FBQ3hCLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsd0JBQXdCLENBQUMsVUFBVSxDQUFDLDBCQUEwQjtPQUMzRSxDQUFDLENBQUM7S0FDSjs7O1dBRVUscUJBQUMsV0FBd0IsRUFBRTtBQUNwQyxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxZQUFZO0FBQzVELG1CQUFXLEVBQVgsV0FBVztPQUNaLENBQUMsQ0FBQztLQUNKOzs7V0FFUyxzQkFBRztBQUNYLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUMsVUFBVSxFQUFFLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDO0tBQzFGOzs7V0FFWSx1QkFBQyxXQUF3QixFQUFFO0FBQ3RDLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsd0JBQXdCLENBQUMsVUFBVSxDQUFDLGNBQWM7QUFDOUQsbUJBQVcsRUFBWCxXQUFXO09BQ1osQ0FBQyxDQUFDO0tBQ0o7OztTQWhDa0Isd0JBQXdCOzs7cUJBQXhCLHdCQUF3Qjs7QUFtQzdDLHdCQUF3QixDQUFDLFVBQVUsR0FBRztBQUNwQyw0QkFBMEIsRUFBRSw0QkFBNEI7QUFDeEQsY0FBWSxFQUFFLGNBQWM7QUFDNUIsYUFBVyxFQUFFLGFBQWE7QUFDMUIsZ0JBQWMsRUFBRSxnQkFBZ0I7Q0FDakMsQ0FBQyIsImZpbGUiOiJSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Q29tbWFuZEluZm99IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMge1xuXG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuXG4gIHN0YXRpYyBBY3Rpb25UeXBlOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcblxuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyOiBEaXNwYXRjaGVyKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gIH1cblxuICBzdGFydE5vZGVFeGVjdXRvclNlcnZlcigpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5BY3Rpb25UeXBlLlNUQVJUX05PREVfRVhFQ1VUT1JfU0VSVkVSLFxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRTZXJ2ZXIoY29tbWFuZEluZm86IENvbW1hbmRJbmZvKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuQWN0aW9uVHlwZS5TVEFSVF9TRVJWRVIsXG4gICAgICBjb21tYW5kSW5mbyxcbiAgICB9KTtcbiAgfVxuXG4gIHN0b3BTZXJ2ZXIoKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uVHlwZTogUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zLkFjdGlvblR5cGUuU1RPUF9TRVJWRVJ9KTtcbiAgfVxuXG4gIHJlc3RhcnRTZXJ2ZXIoY29tbWFuZEluZm86IENvbW1hbmRJbmZvKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuQWN0aW9uVHlwZS5SRVNUQVJUX1NFUlZFUixcbiAgICAgIGNvbW1hbmRJbmZvLFxuICAgIH0pO1xuICB9XG59XG5cblJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5BY3Rpb25UeXBlID0ge1xuICBTVEFSVF9OT0RFX0VYRUNVVE9SX1NFUlZFUjogJ1NUQVJUX05PREVfRVhFQ1VUT1JfU0VSVkVSJyxcbiAgU1RBUlRfU0VSVkVSOiAnU1RBUlRfU0VSVkVSJyxcbiAgU1RPUF9TRVJWRVI6ICdTVE9QX1NFUlZFUicsXG4gIFJFU1RBUlRfU0VSVkVSOiAnUkVTVEFSVF9TRVJWRVInLFxufTtcbiJdfQ==