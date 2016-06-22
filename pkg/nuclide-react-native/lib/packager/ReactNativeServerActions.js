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

exports.default = ReactNativeServerActions;

ReactNativeServerActions.ActionType = Object.freeze({
  START_NODE_EXECUTOR_SERVER: 'START_NODE_EXECUTOR_SERVER',
  START_SERVER: 'START_SERVER',
  STOP_SERVER: 'STOP_SERVER',
  RESTART_SERVER: 'RESTART_SERVER'
});
module.exports = exports.default;