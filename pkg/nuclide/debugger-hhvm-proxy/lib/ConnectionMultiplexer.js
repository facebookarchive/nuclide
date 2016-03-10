Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _Connection = require('./Connection');

var _ConnectionUtils = require('./ConnectionUtils');

var _DbgpSocket = require('./DbgpSocket');

var _events = require('events');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _ClientCallback = require('./ClientCallback');

var _require = require('./BreakpointStore');

var BreakpointStore = _require.BreakpointStore;

var _require2 = require('./DbgpConnector');

var DbgpConnector = _require2.DbgpConnector;

var CONNECTION_MUX_STATUS_EVENT = 'connection-mux-status';

// The ConnectionMultiplexer makes multiple debugger connections appear to be
// a single connection to the debugger UI.
//
// The initialization sequence occurs as follows:
//  - the constructor is called
//  - onStatus is called to hook up event handlers
//  - initial breakpoints may be added here.
//  - listen() is called indicating that all initial Breakpoints have been set
//    and debugging may commence.
//
// Once initialized, the ConnectionMultiplexer can be in one of 3 main states:
// running, break-disabled, and break-enabled.
//
// Running state means that all connections are in the running state.
// Note that running includes the state where there are no connections.
//
// Break-disabled state has at least one connection in break state.
// And none of the connections is enabled. Once in break-disabled state,
// the connection mux will immediately enable one of the broken connections
// and move to break-enabled state.
//
// Break-enabled state has a single connection which is in break-enabled
// state. There may be connections in break-disabled state and running state
// as well. The enabled connection will be shown in the debugger UI and all
// commands will go to the enabled connection.
//
// The ConnectionMultiplexer will close only if there are no connections
// and if the DbgpConnector is closed. The DbgpConnector will likely only
// close if HHVM crashes or is stopped.

var ConnectionMultiplexer = (function () {
  function ConnectionMultiplexer(config, clientCallback) {
    _classCallCheck(this, ConnectionMultiplexer);

    this._config = config;
    this._clientCallback = clientCallback;
    this._status = _DbgpSocket.STATUS_STARTING;
    this._connectionStatusEmitter = new _events.EventEmitter();
    this._enabledConnection = null;
    this._dummyConnection = null;
    this._connections = new Map();
    this._connector = null;
    this._dummyRequestProcess = null;
    this._breakpointStore = new BreakpointStore();
  }

  _createClass(ConnectionMultiplexer, [{
    key: 'onStatus',
    value: function onStatus(callback) {
      return require('../../commons').event.attachEvent(this._connectionStatusEmitter, CONNECTION_MUX_STATUS_EVENT, callback);
    }
  }, {
    key: 'listen',
    value: function listen() {
      var connector = new DbgpConnector(this._config);
      connector.onAttach(this._onAttach.bind(this));
      connector.onClose(this._disposeConnector.bind(this));
      connector.onError(this._handleAttachError.bind(this));
      this._connector = connector;
      this._status = _DbgpSocket.STATUS_RUNNING;

      connector.listen();

      this._clientCallback.sendUserMessage('console', {
        level: 'warning',
        text: 'Pre-loading, please wait...'
      });
      this._dummyRequestProcess = (0, _ConnectionUtils.sendDummyRequest)();
    }
  }, {
    key: '_handleDummyConnection',
    value: _asyncToGenerator(function* (socket) {
      var _this = this;

      _utils2['default'].log('ConnectionMultiplexer successfully got dummy connection.');
      var dummyConnection = new _Connection.Connection(socket);
      yield this._handleOutputSetupForConnection(dummyConnection);

      // Continue from loader breakpoint to hit xdebug_break()
      // which will load whole www repo for evaluation if possible.
      yield dummyConnection.sendContinuationCommand(_DbgpSocket.COMMAND_RUN);
      dummyConnection.onStatus(function (status, message) {
        switch (status) {
          case _DbgpSocket.STATUS_STDOUT:
            _this._sendOutput(message, 'log');
            break;
          case _DbgpSocket.STATUS_STDERR:
            _this._sendOutput(message, 'info');
            break;
        }
      });
      this._dummyConnection = dummyConnection;

      this._clientCallback.sendUserMessage('console', {
        level: 'warning',
        text: 'Pre-loading is done. You can use console window now.'
      });
    })

    // For testing purpose.
  }, {
    key: 'getDummyConnection',
    value: function getDummyConnection() {
      return this._dummyConnection;
    }
  }, {
    key: '_onAttach',
    value: _asyncToGenerator(function* (params) {
      var _this2 = this;

      var socket = params.socket;
      var message = params.message;

      if (!(0, _ConnectionUtils.isCorrectConnection)(this._config, message)) {
        (0, _ConnectionUtils.failConnection)(socket, 'Discarding connection ' + JSON.stringify(message));
        return;
      }
      if ((0, _ConnectionUtils.isDummyConnection)(message)) {
        yield this._handleDummyConnection(socket);
      } else {
        yield* (function* () {
          var connection = new _Connection.Connection(socket);
          _this2._breakpointStore.addConnection(connection);
          yield _this2._handleOutputSetupForConnection(connection);

          var info = {
            connection: connection,
            onStatusDisposable: connection.onStatus(function (status) {
              for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }

              _this2._connectionOnStatus.apply(_this2, [connection, status].concat(args));
            }),
            status: _DbgpSocket.STATUS_STARTING
          };
          _this2._connections.set(connection, info);

          var status = undefined;
          try {
            status = yield connection.getStatus();
          } catch (e) {
            _utils2['default'].logError('Error getting initial connection status: ' + e.message);
            status = _DbgpSocket.STATUS_ERROR;
          }
          _this2._connectionOnStatus(connection, status);
        })();
      }
    })
  }, {
    key: '_connectionOnStatus',
    value: function _connectionOnStatus(connection, status) {
      _utils2['default'].log('Mux got status: ' + status + ' on connection ' + connection.getId());
      var connectionInfo = this._connections.get(connection);
      (0, _assert2['default'])(connectionInfo != null);

      switch (status) {
        case _DbgpSocket.STATUS_STARTING:
          // Starting status has no stack.
          // step before reporting initial status to get to the first instruction.
          // TODO: Use loader breakpoint configuration to choose between step/run.
          connectionInfo.status = status;
          connection.sendContinuationCommand(_DbgpSocket.COMMAND_RUN);
          return;
        case _DbgpSocket.STATUS_STOPPING:
          // TODO: May want to enable post-mortem features?
          connectionInfo.status = status;
          connection.sendContinuationCommand(_DbgpSocket.COMMAND_RUN);
          return;
        case _DbgpSocket.STATUS_RUNNING:
          connectionInfo.status = status;
          if (connection === this._enabledConnection) {
            this._disableConnection();
          }
          break;
        case _DbgpSocket.STATUS_BREAK:
          connectionInfo.status = status;
          if (connection === this._enabledConnection) {
            // This can happen when we step.
            _utils2['default'].log('Mux break on enabled connection');
            this._emitStatus(_DbgpSocket.STATUS_BREAK);
            return;
          }
          break;
        case _DbgpSocket.STATUS_ERROR:
          this._clientCallback.sendUserMessage('notification', {
            type: 'error',
            message: 'The debugger encountered a problem and the connection had to be shut down.'
          });
          this._removeConnection(connection);
          break;
        case _DbgpSocket.STATUS_STOPPED:
        case _DbgpSocket.STATUS_END:
          connectionInfo.status = status;
          this._removeConnection(connection);
          break;
        case _DbgpSocket.STATUS_STDOUT:
          this._sendOutput(arguments[2], 'log');
          break;
        case _DbgpSocket.STATUS_STDERR:
          this._sendOutput(arguments[2], 'info');
          break;
      }

      this._updateStatus();
    }
  }, {
    key: '_sendOutput',
    value: function _sendOutput(message, level) {
      this._clientCallback.sendUserMessage('outputWindow', {
        level: level,
        text: message
      });
    }
  }, {
    key: '_updateStatus',
    value: function _updateStatus() {
      if (this._status === _DbgpSocket.STATUS_END) {
        return;
      }

      if (this._status === _DbgpSocket.STATUS_BREAK) {
        _utils2['default'].log('Mux already in break status');
        return;
      }

      // now check if we can move from running to break...
      for (var connectionInfo of this._connections.values()) {
        if (connectionInfo.status === _DbgpSocket.STATUS_BREAK) {
          this._enableConnection(connectionInfo.connection);
          break;
        }
      }
    }
  }, {
    key: '_enableConnection',
    value: function _enableConnection(connection) {
      _utils2['default'].log('Mux enabling connection');
      this._enabledConnection = connection;
      this._setStatus(_DbgpSocket.STATUS_BREAK);
    }
  }, {
    key: '_setStatus',
    value: function _setStatus(status) {
      if (status !== this._status) {
        this._status = status;
        this._emitStatus(status);
      }
    }
  }, {
    key: '_handleAttachError',
    value: function _handleAttachError(error) {
      this._clientCallback.sendUserMessage('notification', {
        type: 'error',
        message: error
      });
    }
  }, {
    key: '_emitStatus',
    value: function _emitStatus(status) {
      this._connectionStatusEmitter.emit(CONNECTION_MUX_STATUS_EVENT, status);
    }
  }, {
    key: 'runtimeEvaluate',
    value: _asyncToGenerator(function* (expression) {
      _utils2['default'].log('runtimeEvaluate() on dummy connection for: ' + expression);
      if (this._dummyConnection) {
        // Global runtime evaluation on dummy connection does not care about
        // which frame it is being evaluated on so choose top frame here.
        var result = yield this._dummyConnection.evaluateOnCallFrame(0, expression);
        this._reportEvaluationFailureIfNeeded(expression, result);
        return result;
      } else {
        throw this._noConnectionError();
      }
    })
  }, {
    key: 'evaluateOnCallFrame',
    value: _asyncToGenerator(function* (frameIndex, expression) {
      if (this._enabledConnection) {
        var result = yield this._enabledConnection.evaluateOnCallFrame(frameIndex, expression);
        this._reportEvaluationFailureIfNeeded(expression, result);
        return result;
      } else {
        throw this._noConnectionError();
      }
    })
  }, {
    key: '_reportEvaluationFailureIfNeeded',
    value: function _reportEvaluationFailureIfNeeded(expression, result) {
      if (result.wasThrown) {
        var _message = 'Failed to evaluate "' + expression + '": (' + result.error.$.code + ') ' + result.error.message[0];
        this._clientCallback.sendUserMessage('console', {
          level: 'error',
          text: _message
        });
      }
    }
  }, {
    key: 'setPauseOnExceptions',
    value: function setPauseOnExceptions(state) {
      return this._breakpointStore.setPauseOnExceptions(state);
    }
  }, {
    key: 'setBreakpoint',
    value: function setBreakpoint(filename, lineNumber) {
      return this._breakpointStore.setBreakpoint(filename, lineNumber);
    }
  }, {
    key: 'removeBreakpoint',
    value: function removeBreakpoint(breakpointId) {
      return this._breakpointStore.removeBreakpoint(breakpointId);
    }
  }, {
    key: 'getStackFrames',
    value: function getStackFrames() {
      if (this._enabledConnection) {
        return this._enabledConnection.getStackFrames();
      } else {
        // This occurs on startup with the loader breakpoint.
        return Promise.resolve({ stack: {} });
      }
    }
  }, {
    key: 'getScopesForFrame',
    value: function getScopesForFrame(frameIndex) {
      if (this._enabledConnection) {
        return this._enabledConnection.getScopesForFrame(frameIndex);
      } else {
        throw this._noConnectionError();
      }
    }
  }, {
    key: 'getStatus',
    value: function getStatus() {
      return this._status;
    }
  }, {
    key: 'sendContinuationCommand',
    value: function sendContinuationCommand(command) {
      if (this._enabledConnection) {
        this._enabledConnection.sendContinuationCommand(command);
      } else {
        throw this._noConnectionError();
      }
    }
  }, {
    key: 'sendBreakCommand',
    value: function sendBreakCommand() {
      if (this._enabledConnection) {
        return this._enabledConnection.sendBreakCommand();
      } else {
        return Promise.resolve(false);
      }
    }
  }, {
    key: 'getProperties',
    value: function getProperties(remoteId) {
      if (this._enabledConnection && this._status === _DbgpSocket.STATUS_BREAK) {
        return this._enabledConnection.getProperties(remoteId);
      } else if (this._dummyConnection) {
        return this._dummyConnection.getProperties(remoteId);
      } else {
        throw this._noConnectionError();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      for (var _connection of this._connections.keys()) {
        this._removeConnection(_connection);
      }
      if (this._dummyRequestProcess) {
        this._dummyRequestProcess.kill('SIGKILL');
      }
      this._disposeConnector();
    }
  }, {
    key: '_removeConnection',
    value: function _removeConnection(connection) {
      var info = this._connections.get(connection);
      (0, _assert2['default'])(info != null);
      info.onStatusDisposable.dispose();
      connection.dispose();
      this._connections['delete'](connection);

      if (connection === this._enabledConnection) {
        this._disableConnection();
      }
      this._checkForEnd();
    }
  }, {
    key: '_disableConnection',
    value: function _disableConnection() {
      _utils2['default'].log('Mux disabling connection');
      this._enabledConnection = null;
      this._setStatus(_DbgpSocket.STATUS_RUNNING);
    }
  }, {
    key: '_disposeConnector',
    value: function _disposeConnector() {
      // Avoid recursion with connector's onClose event.
      var connector = this._connector;
      if (connector) {
        this._connector = null;
        connector.dispose();
      }
      this._checkForEnd();
    }
  }, {
    key: '_checkForEnd',
    value: function _checkForEnd() {
      if (this._connections.size === 0 && (!this._connector || this._config.endDebugWhenNoRequests)) {
        this._setStatus(_DbgpSocket.STATUS_END);
      }
    }
  }, {
    key: '_noConnectionError',
    value: function _noConnectionError() {
      // This is an indication of a bug in the state machine.
      // .. we are seeing a request in a state that should not generate
      // that request.
      return new Error('No connection');
    }
  }, {
    key: '_handleOutputSetupForConnection',
    value: _asyncToGenerator(function* (connection) {
      var stdoutRequestSucceeded = yield connection.sendStdoutRequest();
      if (!stdoutRequestSucceeded) {
        _utils2['default'].logError('HHVM returned failure for a stdout request');
        this._clientCallback.sendUserMessage('outputWindow', {
          level: 'error',
          text: 'HHVM failed to redirect stdout, so no output will be sent to the output window.'
        });
      }
      // TODO: Stderr redirection is not implemented in HHVM so we won't check this return value.
      yield connection.sendStderrRequest();
    })
  }]);

  return ConnectionMultiplexer;
})();

exports.ConnectionMultiplexer = ConnectionMultiplexer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25NdWx0aXBsZXhlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFXbUIsU0FBUzs7OzswQkFDSCxjQUFjOzsrQkFNaEMsbUJBQW1COzswQkFxQm5CLGNBQWM7O3NCQUNNLFFBQVE7O3NCQUNiLFFBQVE7Ozs7OEJBQ0Qsa0JBQWtCOztlQWpCckIsT0FBTyxDQUFDLG1CQUFtQixDQUFDOztJQUEvQyxlQUFlLFlBQWYsZUFBZTs7Z0JBQ0UsT0FBTyxDQUFDLGlCQUFpQixDQUFDOztJQUEzQyxhQUFhLGFBQWIsYUFBYTs7QUFrQnBCLElBQU0sMkJBQTJCLEdBQUcsdUJBQXVCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBaUQvQyxxQkFBcUI7QUFZckIsV0FaQSxxQkFBcUIsQ0FZcEIsTUFBd0IsRUFBRSxjQUE4QixFQUFFOzBCQVozRCxxQkFBcUI7O0FBYTlCLFFBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0FBQ3RDLFFBQUksQ0FBQyxPQUFPLDhCQUFrQixDQUFDO0FBQy9CLFFBQUksQ0FBQyx3QkFBd0IsR0FBRywwQkFBa0IsQ0FBQztBQUNuRCxRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDN0IsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzlCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7QUFDakMsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7R0FDL0M7O2VBdkJVLHFCQUFxQjs7V0F5QnhCLGtCQUFDLFFBQW1DLEVBQWU7QUFDekQsYUFBTyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQzdFLDJCQUEyQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzFDOzs7V0FFSyxrQkFBUztBQUNiLFVBQU0sU0FBUyxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsRCxlQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDOUMsZUFBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDckQsZUFBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdEQsVUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDNUIsVUFBSSxDQUFDLE9BQU8sNkJBQWlCLENBQUM7O0FBRTlCLGVBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7QUFFbkIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFO0FBQzlDLGFBQUssRUFBRSxTQUFTO0FBQ2hCLFlBQUksRUFBRSw2QkFBNkI7T0FDcEMsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLG9CQUFvQixHQUFHLHdDQUFrQixDQUFDO0tBQ2hEOzs7NkJBRTJCLFdBQUMsTUFBYyxFQUFpQjs7O0FBQzFELHlCQUFPLEdBQUcsQ0FBQywwREFBMEQsQ0FBQyxDQUFDO0FBQ3ZFLFVBQU0sZUFBZSxHQUFHLDJCQUFlLE1BQU0sQ0FBQyxDQUFDO0FBQy9DLFlBQU0sSUFBSSxDQUFDLCtCQUErQixDQUFDLGVBQWUsQ0FBQyxDQUFDOzs7O0FBSTVELFlBQU0sZUFBZSxDQUFDLHVCQUF1Qix5QkFBYSxDQUFDO0FBQzNELHFCQUFlLENBQUMsUUFBUSxDQUFDLFVBQUMsTUFBTSxFQUFFLE9BQU8sRUFBSztBQUM1QyxnQkFBUSxNQUFNO0FBQ1o7QUFDRSxrQkFBSyxXQUFXLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLGtCQUFNO0FBQUEsQUFDUjtBQUNFLGtCQUFLLFdBQVcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbEMsa0JBQU07QUFBQSxTQUNUO09BQ0YsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQzs7QUFFeEMsVUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFO0FBQzlDLGFBQUssRUFBRSxTQUFTO0FBQ2hCLFlBQUksRUFBRSxzREFBc0Q7T0FDN0QsQ0FBQyxDQUFDO0tBQ0o7Ozs7O1dBR2lCLDhCQUFnQjtBQUNoQyxhQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztLQUM5Qjs7OzZCQUVjLFdBQUMsTUFBeUMsRUFBVzs7O1VBQzNELE1BQU0sR0FBYSxNQUFNLENBQXpCLE1BQU07VUFBRSxPQUFPLEdBQUksTUFBTSxDQUFqQixPQUFPOztBQUN0QixVQUFJLENBQUMsMENBQW9CLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFDL0MsNkNBQWUsTUFBTSxFQUFFLHdCQUF3QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMzRSxlQUFPO09BQ1I7QUFDRCxVQUFJLHdDQUFrQixPQUFPLENBQUMsRUFBRTtBQUM5QixjQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUMzQyxNQUFNOztBQUNMLGNBQU0sVUFBVSxHQUFHLDJCQUFlLE1BQU0sQ0FBQyxDQUFDO0FBQzFDLGlCQUFLLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoRCxnQkFBTSxPQUFLLCtCQUErQixDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUV2RCxjQUFNLElBQUksR0FBRztBQUNYLHNCQUFVLEVBQVYsVUFBVTtBQUNWLDhCQUFrQixFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsVUFBQyxNQUFNLEVBQWM7Z0RBQVQsSUFBSTtBQUFKLG9CQUFJOzs7QUFDdEQscUJBQUssbUJBQW1CLE1BQUEsVUFBQyxVQUFVLEVBQUUsTUFBTSxTQUFLLElBQUksRUFBQyxDQUFDO2FBQ3ZELENBQUM7QUFDRixrQkFBTSw2QkFBaUI7V0FDeEIsQ0FBQztBQUNGLGlCQUFLLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUV4QyxjQUFJLE1BQU0sWUFBQSxDQUFDO0FBQ1gsY0FBSTtBQUNGLGtCQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7V0FDdkMsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLCtCQUFPLFFBQVEsQ0FBQywyQ0FBMkMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekUsa0JBQU0sMkJBQWUsQ0FBQztXQUN2QjtBQUNELGlCQUFLLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQzs7T0FDOUM7S0FDRjs7O1dBRWtCLDZCQUFDLFVBQXNCLEVBQUUsTUFBYyxFQUFnQztBQUN4Rix5QkFBTyxHQUFHLHNCQUFvQixNQUFNLHVCQUFrQixVQUFVLENBQUMsS0FBSyxFQUFFLENBQUcsQ0FBQztBQUM1RSxVQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN6RCwrQkFBVSxjQUFjLElBQUksSUFBSSxDQUFDLENBQUM7O0FBRWxDLGNBQVEsTUFBTTtBQUNaOzs7O0FBSUUsd0JBQWMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQy9CLG9CQUFVLENBQUMsdUJBQXVCLHlCQUFhLENBQUM7QUFDaEQsaUJBQU87QUFBQSxBQUNUOztBQUVFLHdCQUFjLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUMvQixvQkFBVSxDQUFDLHVCQUF1Qix5QkFBYSxDQUFDO0FBQ2hELGlCQUFPO0FBQUEsQUFDVDtBQUNFLHdCQUFjLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUMvQixjQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7QUFDMUMsZ0JBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1dBQzNCO0FBQ0QsZ0JBQU07QUFBQSxBQUNSO0FBQ0Usd0JBQWMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQy9CLGNBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxrQkFBa0IsRUFBRTs7QUFFMUMsK0JBQU8sR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7QUFDOUMsZ0JBQUksQ0FBQyxXQUFXLDBCQUFjLENBQUM7QUFDL0IsbUJBQU87V0FDUjtBQUNELGdCQUFNO0FBQUEsQUFDUjtBQUNFLGNBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRTtBQUNuRCxnQkFBSSxFQUFFLE9BQU87QUFDYixtQkFBTyxFQUFFLDRFQUE0RTtXQUN0RixDQUFDLENBQUM7QUFDSCxjQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbkMsZ0JBQU07QUFBQSxBQUNSLHdDQUFvQjtBQUNwQjtBQUNFLHdCQUFjLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUMvQixjQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbkMsZ0JBQU07QUFBQSxBQUNSO0FBQ0UsY0FBSSxDQUFDLFdBQVcsQ0FBQyxVQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLGdCQUFNO0FBQUEsQUFDUjtBQUNFLGNBQUksQ0FBQyxXQUFXLENBQUMsVUFBSyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNsQyxnQkFBTTtBQUFBLE9BQ1Q7O0FBRUQsVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQ3RCOzs7V0FFVSxxQkFBQyxPQUFlLEVBQUUsS0FBYSxFQUFRO0FBQ2hELFVBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRTtBQUNuRCxhQUFLLEVBQUUsS0FBSztBQUNaLFlBQUksRUFBRSxPQUFPO09BQ2QsQ0FBQyxDQUFDO0tBQ0o7OztXQUVZLHlCQUFTO0FBQ3BCLFVBQUksSUFBSSxDQUFDLE9BQU8sMkJBQWUsRUFBRTtBQUMvQixlQUFPO09BQ1I7O0FBRUQsVUFBSSxJQUFJLENBQUMsT0FBTyw2QkFBaUIsRUFBRTtBQUNqQywyQkFBTyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztBQUMxQyxlQUFPO09BQ1I7OztBQUdELFdBQUssSUFBTSxjQUFjLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsRUFBRTtBQUN2RCxZQUFJLGNBQWMsQ0FBQyxNQUFNLDZCQUFpQixFQUFFO0FBQzFDLGNBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbEQsZ0JBQU07U0FDUDtPQUNGO0tBQ0Y7OztXQUVnQiwyQkFBQyxVQUFzQixFQUFRO0FBQzlDLHlCQUFPLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxrQkFBa0IsR0FBRyxVQUFVLENBQUM7QUFDckMsVUFBSSxDQUFDLFVBQVUsMEJBQWMsQ0FBQztLQUMvQjs7O1dBRVMsb0JBQUMsTUFBYyxFQUFRO0FBQy9CLFVBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDM0IsWUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdEIsWUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUMxQjtLQUNGOzs7V0FFaUIsNEJBQUMsS0FBYSxFQUFRO0FBQ3RDLFVBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRTtBQUNuRCxZQUFJLEVBQUUsT0FBTztBQUNiLGVBQU8sRUFBRSxLQUFLO09BQ2YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVVLHFCQUFDLE1BQWMsRUFBUTtBQUNoQyxVQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3pFOzs7NkJBRW9CLFdBQUMsVUFBa0IsRUFBbUI7QUFDekQseUJBQU8sR0FBRyxpREFBK0MsVUFBVSxDQUFHLENBQUM7QUFDdkUsVUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7OztBQUd6QixZQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDOUUsWUFBSSxDQUFDLGdDQUFnQyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMxRCxlQUFPLE1BQU0sQ0FBQztPQUNmLE1BQU07QUFDTCxjQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO09BQ2pDO0tBQ0Y7Ozs2QkFFd0IsV0FBQyxVQUFrQixFQUFFLFVBQWtCLEVBQW1CO0FBQ2pGLFVBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQzNCLFlBQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN6RixZQUFJLENBQUMsZ0NBQWdDLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzFELGVBQU8sTUFBTSxDQUFDO09BQ2YsTUFBTTtBQUNMLGNBQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7T0FDakM7S0FDRjs7O1dBRStCLDBDQUFDLFVBQWtCLEVBQUUsTUFBK0IsRUFBUTtBQUMxRixVQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUU7QUFDcEIsWUFBTSxRQUFPLDRCQUNZLFVBQVUsWUFBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQUssTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEFBQUUsQ0FBQztBQUM1RixZQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUU7QUFDOUMsZUFBSyxFQUFFLE9BQU87QUFDZCxjQUFJLEVBQUUsUUFBTztTQUNkLENBQUMsQ0FBQztPQUNKO0tBQ0Y7OztXQUVtQiw4QkFBQyxLQUFxQixFQUFXO0FBQ25ELGFBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzFEOzs7V0FFWSx1QkFBQyxRQUFnQixFQUFFLFVBQWtCLEVBQVU7QUFDMUQsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUNsRTs7O1dBRWUsMEJBQUMsWUFBb0IsRUFBVztBQUM5QyxhQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUM3RDs7O1dBRWEsMEJBQTZCO0FBQ3pDLFVBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQzNCLGVBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDO09BQ2pELE1BQU07O0FBRUwsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUM7T0FDckM7S0FDRjs7O1dBRWdCLDJCQUFDLFVBQWtCLEVBQXlCO0FBQzNELFVBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQzNCLGVBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQzlELE1BQU07QUFDTCxjQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO09BQ2pDO0tBQ0Y7OztXQUVRLHFCQUFXO0FBQ2xCLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztLQUNyQjs7O1dBRXNCLGlDQUFDLE9BQWUsRUFBUTtBQUM3QyxVQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtBQUMzQixZQUFJLENBQUMsa0JBQWtCLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDMUQsTUFBTTtBQUNMLGNBQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7T0FDakM7S0FDRjs7O1dBRWUsNEJBQXFCO0FBQ25DLFVBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQzNCLGVBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixFQUFFLENBQUM7T0FDbkQsTUFBTTtBQUNMLGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUMvQjtLQUNGOzs7V0FFWSx1QkFBQyxRQUF3QixFQUFzQztBQUMxRSxVQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsT0FBTyw2QkFBaUIsRUFBRTtBQUM1RCxlQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDeEQsTUFBTSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtBQUNoQyxlQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDdEQsTUFBTTtBQUNMLGNBQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7T0FDakM7S0FDRjs7O1dBRU0sbUJBQVM7QUFDZCxXQUFLLElBQU0sV0FBVSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDakQsWUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVUsQ0FBQyxDQUFDO09BQ3BDO0FBQ0QsVUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7QUFDN0IsWUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUMzQztBQUNELFVBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0tBQzFCOzs7V0FFZ0IsMkJBQUMsVUFBc0IsRUFBUTtBQUM5QyxVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMvQywrQkFBVSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7QUFDeEIsVUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xDLGdCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsVUFBSSxDQUFDLFlBQVksVUFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVyQyxVQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7QUFDMUMsWUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7T0FDM0I7QUFDRCxVQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDckI7OztXQUVpQiw4QkFBUztBQUN6Qix5QkFBTyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUN2QyxVQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFVBQUksQ0FBQyxVQUFVLDRCQUFnQixDQUFDO0tBQ2pDOzs7V0FFZ0IsNkJBQVM7O0FBRXhCLFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDbEMsVUFBSSxTQUFTLEVBQUU7QUFDYixZQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUN2QixpQkFBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3JCO0FBQ0QsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQ3JCOzs7V0FFVyx3QkFBUztBQUNuQixVQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsS0FDNUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUEsQUFBQyxFQUFFO0FBQzVELFlBQUksQ0FBQyxVQUFVLHdCQUFZLENBQUM7T0FDN0I7S0FDRjs7O1dBRWlCLDhCQUFVOzs7O0FBSTFCLGFBQU8sSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDbkM7Ozs2QkFFb0MsV0FBQyxVQUFzQixFQUFpQjtBQUMzRSxVQUFNLHNCQUFzQixHQUFHLE1BQU0sVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDcEUsVUFBSSxDQUFDLHNCQUFzQixFQUFFO0FBQzNCLDJCQUFPLFFBQVEsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0FBQzlELFlBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRTtBQUNuRCxlQUFLLEVBQUUsT0FBTztBQUNkLGNBQUksRUFBRSxpRkFBaUY7U0FDeEYsQ0FBQyxDQUFDO09BQ0o7O0FBRUQsWUFBTSxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztLQUN0Qzs7O1NBdFhVLHFCQUFxQiIsImZpbGUiOiJDb25uZWN0aW9uTXVsdGlwbGV4ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtDb25uZWN0aW9ufSBmcm9tICcuL0Nvbm5lY3Rpb24nO1xuaW1wb3J0IHtcbiAgaXNEdW1teUNvbm5lY3Rpb24sXG4gIHNlbmREdW1teVJlcXVlc3QsXG4gIGlzQ29ycmVjdENvbm5lY3Rpb24sXG4gIGZhaWxDb25uZWN0aW9uLFxufSBmcm9tICcuL0Nvbm5lY3Rpb25VdGlscyc7XG5cbmltcG9ydCB0eXBlIHtTb2NrZXR9IGZyb20gJ25ldCc7XG5pbXBvcnQgdHlwZSB7U2NvcGV9ZnJvbSAnLi9EYXRhQ2FjaGUnO1xuaW1wb3J0IHR5cGUge1Byb3BlcnR5RGVzY3JpcHRvcn0gZnJvbSAnLi9EYXRhQ2FjaGUnO1xuaW1wb3J0IHR5cGUge1JlbW90ZU9iamVjdElkfSBmcm9tICcuL0RhdGFDYWNoZSc7XG5pbXBvcnQgdHlwZSB7RXhjZXB0aW9uU3RhdGV9IGZyb20gJy4vQnJlYWtwb2ludFN0b3JlJztcbmNvbnN0IHtCcmVha3BvaW50U3RvcmV9ID0gcmVxdWlyZSgnLi9CcmVha3BvaW50U3RvcmUnKTtcbmNvbnN0IHtEYmdwQ29ubmVjdG9yfSA9IHJlcXVpcmUoJy4vRGJncENvbm5lY3RvcicpO1xuaW1wb3J0IHR5cGUge0Nvbm5lY3Rpb25Db25maWd9IGZyb20gJy4vSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlJztcbmltcG9ydCB7XG4gIFNUQVRVU19TVEFSVElORyxcbiAgU1RBVFVTX1NUT1BQSU5HLFxuICBTVEFUVVNfU1RPUFBFRCxcbiAgU1RBVFVTX1JVTk5JTkcsXG4gIFNUQVRVU19CUkVBSyxcbiAgU1RBVFVTX0VSUk9SLFxuICBTVEFUVVNfRU5ELFxuICBTVEFUVVNfU1RET1VULFxuICBTVEFUVVNfU1RERVJSLFxuICBDT01NQU5EX1JVTixcbn0gZnJvbSAnLi9EYmdwU29ja2V0JztcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDbGllbnRDYWxsYmFja30gZnJvbSAnLi9DbGllbnRDYWxsYmFjayc7XG5cbmNvbnN0IENPTk5FQ1RJT05fTVVYX1NUQVRVU19FVkVOVCA9ICdjb25uZWN0aW9uLW11eC1zdGF0dXMnO1xuXG50eXBlIENvbm5lY3Rpb25JbmZvID0ge1xuICBjb25uZWN0aW9uOiBDb25uZWN0aW9uO1xuICBvblN0YXR1c0Rpc3Bvc2FibGU6IElEaXNwb3NhYmxlO1xuICBzdGF0dXM6IHN0cmluZztcbn07XG5cbnR5cGUgRGJncEVycm9yID0ge1xuICAkOiB7XG4gICAgY29kZTogbnVtYmVyO1xuICB9O1xuICBtZXNzYWdlOiBBcnJheTxzdHJpbmc+O1xufTtcblxudHlwZSBFdmFsdWF0aW9uRmFpbHVyZVJlc3VsdCA9IHtcbiAgZXJyb3I6IERiZ3BFcnJvcjtcbiAgd2FzVGhyb3duOiBib29sZWFuO1xufTtcblxuLy8gVGhlIENvbm5lY3Rpb25NdWx0aXBsZXhlciBtYWtlcyBtdWx0aXBsZSBkZWJ1Z2dlciBjb25uZWN0aW9ucyBhcHBlYXIgdG8gYmVcbi8vIGEgc2luZ2xlIGNvbm5lY3Rpb24gdG8gdGhlIGRlYnVnZ2VyIFVJLlxuLy9cbi8vIFRoZSBpbml0aWFsaXphdGlvbiBzZXF1ZW5jZSBvY2N1cnMgYXMgZm9sbG93czpcbi8vICAtIHRoZSBjb25zdHJ1Y3RvciBpcyBjYWxsZWRcbi8vICAtIG9uU3RhdHVzIGlzIGNhbGxlZCB0byBob29rIHVwIGV2ZW50IGhhbmRsZXJzXG4vLyAgLSBpbml0aWFsIGJyZWFrcG9pbnRzIG1heSBiZSBhZGRlZCBoZXJlLlxuLy8gIC0gbGlzdGVuKCkgaXMgY2FsbGVkIGluZGljYXRpbmcgdGhhdCBhbGwgaW5pdGlhbCBCcmVha3BvaW50cyBoYXZlIGJlZW4gc2V0XG4vLyAgICBhbmQgZGVidWdnaW5nIG1heSBjb21tZW5jZS5cbi8vXG4vLyBPbmNlIGluaXRpYWxpemVkLCB0aGUgQ29ubmVjdGlvbk11bHRpcGxleGVyIGNhbiBiZSBpbiBvbmUgb2YgMyBtYWluIHN0YXRlczpcbi8vIHJ1bm5pbmcsIGJyZWFrLWRpc2FibGVkLCBhbmQgYnJlYWstZW5hYmxlZC5cbi8vXG4vLyBSdW5uaW5nIHN0YXRlIG1lYW5zIHRoYXQgYWxsIGNvbm5lY3Rpb25zIGFyZSBpbiB0aGUgcnVubmluZyBzdGF0ZS5cbi8vIE5vdGUgdGhhdCBydW5uaW5nIGluY2x1ZGVzIHRoZSBzdGF0ZSB3aGVyZSB0aGVyZSBhcmUgbm8gY29ubmVjdGlvbnMuXG4vL1xuLy8gQnJlYWstZGlzYWJsZWQgc3RhdGUgaGFzIGF0IGxlYXN0IG9uZSBjb25uZWN0aW9uIGluIGJyZWFrIHN0YXRlLlxuLy8gQW5kIG5vbmUgb2YgdGhlIGNvbm5lY3Rpb25zIGlzIGVuYWJsZWQuIE9uY2UgaW4gYnJlYWstZGlzYWJsZWQgc3RhdGUsXG4vLyB0aGUgY29ubmVjdGlvbiBtdXggd2lsbCBpbW1lZGlhdGVseSBlbmFibGUgb25lIG9mIHRoZSBicm9rZW4gY29ubmVjdGlvbnNcbi8vIGFuZCBtb3ZlIHRvIGJyZWFrLWVuYWJsZWQgc3RhdGUuXG4vL1xuLy8gQnJlYWstZW5hYmxlZCBzdGF0ZSBoYXMgYSBzaW5nbGUgY29ubmVjdGlvbiB3aGljaCBpcyBpbiBicmVhay1lbmFibGVkXG4vLyBzdGF0ZS4gVGhlcmUgbWF5IGJlIGNvbm5lY3Rpb25zIGluIGJyZWFrLWRpc2FibGVkIHN0YXRlIGFuZCBydW5uaW5nIHN0YXRlXG4vLyBhcyB3ZWxsLiBUaGUgZW5hYmxlZCBjb25uZWN0aW9uIHdpbGwgYmUgc2hvd24gaW4gdGhlIGRlYnVnZ2VyIFVJIGFuZCBhbGxcbi8vIGNvbW1hbmRzIHdpbGwgZ28gdG8gdGhlIGVuYWJsZWQgY29ubmVjdGlvbi5cbi8vXG4vLyBUaGUgQ29ubmVjdGlvbk11bHRpcGxleGVyIHdpbGwgY2xvc2Ugb25seSBpZiB0aGVyZSBhcmUgbm8gY29ubmVjdGlvbnNcbi8vIGFuZCBpZiB0aGUgRGJncENvbm5lY3RvciBpcyBjbG9zZWQuIFRoZSBEYmdwQ29ubmVjdG9yIHdpbGwgbGlrZWx5IG9ubHlcbi8vIGNsb3NlIGlmIEhIVk0gY3Jhc2hlcyBvciBpcyBzdG9wcGVkLlxuZXhwb3J0IGNsYXNzIENvbm5lY3Rpb25NdWx0aXBsZXhlciB7XG4gIF9jb25maWc6IENvbm5lY3Rpb25Db25maWc7XG4gIF9jbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2s7XG4gIF9icmVha3BvaW50U3RvcmU6IEJyZWFrcG9pbnRTdG9yZTtcbiAgX2Nvbm5lY3Rpb25TdGF0dXNFbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF9zdGF0dXM6IHN0cmluZztcbiAgX2VuYWJsZWRDb25uZWN0aW9uOiA/Q29ubmVjdGlvbjtcbiAgX2R1bW15Q29ubmVjdGlvbjogP0Nvbm5lY3Rpb247XG4gIF9jb25uZWN0aW9uczogTWFwPENvbm5lY3Rpb24sIENvbm5lY3Rpb25JbmZvPjtcbiAgX2Nvbm5lY3RvcjogP0RiZ3BDb25uZWN0b3I7XG4gIF9kdW1teVJlcXVlc3RQcm9jZXNzOiA/Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBDb25uZWN0aW9uQ29uZmlnLCBjbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2spIHtcbiAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5fY2xpZW50Q2FsbGJhY2sgPSBjbGllbnRDYWxsYmFjaztcbiAgICB0aGlzLl9zdGF0dXMgPSBTVEFUVVNfU1RBUlRJTkc7XG4gICAgdGhpcy5fY29ubmVjdGlvblN0YXR1c0VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24gPSBudWxsO1xuICAgIHRoaXMuX2R1bW15Q29ubmVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fY29ubmVjdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fY29ubmVjdG9yID0gbnVsbDtcbiAgICB0aGlzLl9kdW1teVJlcXVlc3RQcm9jZXNzID0gbnVsbDtcbiAgICB0aGlzLl9icmVha3BvaW50U3RvcmUgPSBuZXcgQnJlYWtwb2ludFN0b3JlKCk7XG4gIH1cblxuICBvblN0YXR1cyhjYWxsYmFjazogKHN0YXR1czogc3RyaW5nKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpLmV2ZW50LmF0dGFjaEV2ZW50KHRoaXMuX2Nvbm5lY3Rpb25TdGF0dXNFbWl0dGVyLFxuICAgICAgQ09OTkVDVElPTl9NVVhfU1RBVFVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBsaXN0ZW4oKTogdm9pZCB7XG4gICAgY29uc3QgY29ubmVjdG9yID0gbmV3IERiZ3BDb25uZWN0b3IodGhpcy5fY29uZmlnKTtcbiAgICBjb25uZWN0b3Iub25BdHRhY2godGhpcy5fb25BdHRhY2guYmluZCh0aGlzKSk7XG4gICAgY29ubmVjdG9yLm9uQ2xvc2UodGhpcy5fZGlzcG9zZUNvbm5lY3Rvci5iaW5kKHRoaXMpKTtcbiAgICBjb25uZWN0b3Iub25FcnJvcih0aGlzLl9oYW5kbGVBdHRhY2hFcnJvci5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBjb25uZWN0b3I7XG4gICAgdGhpcy5fc3RhdHVzID0gU1RBVFVTX1JVTk5JTkc7XG5cbiAgICBjb25uZWN0b3IubGlzdGVuKCk7XG5cbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck1lc3NhZ2UoJ2NvbnNvbGUnLCB7XG4gICAgICBsZXZlbDogJ3dhcm5pbmcnLFxuICAgICAgdGV4dDogJ1ByZS1sb2FkaW5nLCBwbGVhc2Ugd2FpdC4uLicsXG4gICAgfSk7XG4gICAgdGhpcy5fZHVtbXlSZXF1ZXN0UHJvY2VzcyA9IHNlbmREdW1teVJlcXVlc3QoKTtcbiAgfVxuXG4gIGFzeW5jIF9oYW5kbGVEdW1teUNvbm5lY3Rpb24oc29ja2V0OiBTb2NrZXQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2dnZXIubG9nKCdDb25uZWN0aW9uTXVsdGlwbGV4ZXIgc3VjY2Vzc2Z1bGx5IGdvdCBkdW1teSBjb25uZWN0aW9uLicpO1xuICAgIGNvbnN0IGR1bW15Q29ubmVjdGlvbiA9IG5ldyBDb25uZWN0aW9uKHNvY2tldCk7XG4gICAgYXdhaXQgdGhpcy5faGFuZGxlT3V0cHV0U2V0dXBGb3JDb25uZWN0aW9uKGR1bW15Q29ubmVjdGlvbik7XG5cbiAgICAvLyBDb250aW51ZSBmcm9tIGxvYWRlciBicmVha3BvaW50IHRvIGhpdCB4ZGVidWdfYnJlYWsoKVxuICAgIC8vIHdoaWNoIHdpbGwgbG9hZCB3aG9sZSB3d3cgcmVwbyBmb3IgZXZhbHVhdGlvbiBpZiBwb3NzaWJsZS5cbiAgICBhd2FpdCBkdW1teUNvbm5lY3Rpb24uc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9SVU4pO1xuICAgIGR1bW15Q29ubmVjdGlvbi5vblN0YXR1cygoc3RhdHVzLCBtZXNzYWdlKSA9PiB7XG4gICAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgICBjYXNlIFNUQVRVU19TVERPVVQ6XG4gICAgICAgICAgdGhpcy5fc2VuZE91dHB1dChtZXNzYWdlLCAnbG9nJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU1RBVFVTX1NUREVSUjpcbiAgICAgICAgICB0aGlzLl9zZW5kT3V0cHV0KG1lc3NhZ2UsICdpbmZvJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5fZHVtbXlDb25uZWN0aW9uID0gZHVtbXlDb25uZWN0aW9uO1xuXG4gICAgdGhpcy5fY2xpZW50Q2FsbGJhY2suc2VuZFVzZXJNZXNzYWdlKCdjb25zb2xlJywge1xuICAgICAgbGV2ZWw6ICd3YXJuaW5nJyxcbiAgICAgIHRleHQ6ICdQcmUtbG9hZGluZyBpcyBkb25lLiBZb3UgY2FuIHVzZSBjb25zb2xlIHdpbmRvdyBub3cuJyxcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEZvciB0ZXN0aW5nIHB1cnBvc2UuXG4gIGdldER1bW15Q29ubmVjdGlvbigpOiA/Q29ubmVjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2R1bW15Q29ubmVjdGlvbjtcbiAgfVxuXG4gIGFzeW5jIF9vbkF0dGFjaChwYXJhbXM6IHtzb2NrZXQ6IFNvY2tldDsgbWVzc2FnZTogT2JqZWN0fSk6IFByb21pc2Uge1xuICAgIGNvbnN0IHtzb2NrZXQsIG1lc3NhZ2V9ID0gcGFyYW1zO1xuICAgIGlmICghaXNDb3JyZWN0Q29ubmVjdGlvbih0aGlzLl9jb25maWcsIG1lc3NhZ2UpKSB7XG4gICAgICBmYWlsQ29ubmVjdGlvbihzb2NrZXQsICdEaXNjYXJkaW5nIGNvbm5lY3Rpb24gJyArIEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGlzRHVtbXlDb25uZWN0aW9uKG1lc3NhZ2UpKSB7XG4gICAgICBhd2FpdCB0aGlzLl9oYW5kbGVEdW1teUNvbm5lY3Rpb24oc29ja2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY29ubmVjdGlvbiA9IG5ldyBDb25uZWN0aW9uKHNvY2tldCk7XG4gICAgICB0aGlzLl9icmVha3BvaW50U3RvcmUuYWRkQ29ubmVjdGlvbihjb25uZWN0aW9uKTtcbiAgICAgIGF3YWl0IHRoaXMuX2hhbmRsZU91dHB1dFNldHVwRm9yQ29ubmVjdGlvbihjb25uZWN0aW9uKTtcblxuICAgICAgY29uc3QgaW5mbyA9IHtcbiAgICAgICAgY29ubmVjdGlvbixcbiAgICAgICAgb25TdGF0dXNEaXNwb3NhYmxlOiBjb25uZWN0aW9uLm9uU3RhdHVzKChzdGF0dXMsIC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uT25TdGF0dXMoY29ubmVjdGlvbiwgc3RhdHVzLCAuLi5hcmdzKTtcbiAgICAgICAgfSksXG4gICAgICAgIHN0YXR1czogU1RBVFVTX1NUQVJUSU5HLFxuICAgICAgfTtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zLnNldChjb25uZWN0aW9uLCBpbmZvKTtcblxuICAgICAgbGV0IHN0YXR1cztcbiAgICAgIHRyeSB7XG4gICAgICAgIHN0YXR1cyA9IGF3YWl0IGNvbm5lY3Rpb24uZ2V0U3RhdHVzKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGxvZ2dlci5sb2dFcnJvcignRXJyb3IgZ2V0dGluZyBpbml0aWFsIGNvbm5lY3Rpb24gc3RhdHVzOiAnICsgZS5tZXNzYWdlKTtcbiAgICAgICAgc3RhdHVzID0gU1RBVFVTX0VSUk9SO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29ubmVjdGlvbk9uU3RhdHVzKGNvbm5lY3Rpb24sIHN0YXR1cyk7XG4gICAgfVxuICB9XG5cbiAgX2Nvbm5lY3Rpb25PblN0YXR1cyhjb25uZWN0aW9uOiBDb25uZWN0aW9uLCBzdGF0dXM6IHN0cmluZywgLi4uYXJnczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIGxvZ2dlci5sb2coYE11eCBnb3Qgc3RhdHVzOiAke3N0YXR1c30gb24gY29ubmVjdGlvbiAke2Nvbm5lY3Rpb24uZ2V0SWQoKX1gKTtcbiAgICBjb25zdCBjb25uZWN0aW9uSW5mbyA9IHRoaXMuX2Nvbm5lY3Rpb25zLmdldChjb25uZWN0aW9uKTtcbiAgICBpbnZhcmlhbnQoY29ubmVjdGlvbkluZm8gIT0gbnVsbCk7XG5cbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgY2FzZSBTVEFUVVNfU1RBUlRJTkc6XG4gICAgICAgIC8vIFN0YXJ0aW5nIHN0YXR1cyBoYXMgbm8gc3RhY2suXG4gICAgICAgIC8vIHN0ZXAgYmVmb3JlIHJlcG9ydGluZyBpbml0aWFsIHN0YXR1cyB0byBnZXQgdG8gdGhlIGZpcnN0IGluc3RydWN0aW9uLlxuICAgICAgICAvLyBUT0RPOiBVc2UgbG9hZGVyIGJyZWFrcG9pbnQgY29uZmlndXJhdGlvbiB0byBjaG9vc2UgYmV0d2VlbiBzdGVwL3J1bi5cbiAgICAgICAgY29ubmVjdGlvbkluZm8uc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICBjb25uZWN0aW9uLnNlbmRDb250aW51YXRpb25Db21tYW5kKENPTU1BTkRfUlVOKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgY2FzZSBTVEFUVVNfU1RPUFBJTkc6XG4gICAgICAgIC8vIFRPRE86IE1heSB3YW50IHRvIGVuYWJsZSBwb3N0LW1vcnRlbSBmZWF0dXJlcz9cbiAgICAgICAgY29ubmVjdGlvbkluZm8uc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICBjb25uZWN0aW9uLnNlbmRDb250aW51YXRpb25Db21tYW5kKENPTU1BTkRfUlVOKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgY2FzZSBTVEFUVVNfUlVOTklORzpcbiAgICAgICAgY29ubmVjdGlvbkluZm8uc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICBpZiAoY29ubmVjdGlvbiA9PT0gdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgICAgICB0aGlzLl9kaXNhYmxlQ29ubmVjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTVEFUVVNfQlJFQUs6XG4gICAgICAgIGNvbm5lY3Rpb25JbmZvLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgaWYgKGNvbm5lY3Rpb24gPT09IHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uKSB7XG4gICAgICAgICAgLy8gVGhpcyBjYW4gaGFwcGVuIHdoZW4gd2Ugc3RlcC5cbiAgICAgICAgICBsb2dnZXIubG9nKCdNdXggYnJlYWsgb24gZW5hYmxlZCBjb25uZWN0aW9uJyk7XG4gICAgICAgICAgdGhpcy5fZW1pdFN0YXR1cyhTVEFUVVNfQlJFQUspO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX0VSUk9SOlxuICAgICAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck1lc3NhZ2UoJ25vdGlmaWNhdGlvbicsIHtcbiAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgZGVidWdnZXIgZW5jb3VudGVyZWQgYSBwcm9ibGVtIGFuZCB0aGUgY29ubmVjdGlvbiBoYWQgdG8gYmUgc2h1dCBkb3duLicsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9yZW1vdmVDb25uZWN0aW9uKGNvbm5lY3Rpb24pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX1NUT1BQRUQ6XG4gICAgICBjYXNlIFNUQVRVU19FTkQ6XG4gICAgICAgIGNvbm5lY3Rpb25JbmZvLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdGhpcy5fcmVtb3ZlQ29ubmVjdGlvbihjb25uZWN0aW9uKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFNUQVRVU19TVERPVVQ6XG4gICAgICAgIHRoaXMuX3NlbmRPdXRwdXQoYXJnc1swXSwgJ2xvZycpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX1NUREVSUjpcbiAgICAgICAgdGhpcy5fc2VuZE91dHB1dChhcmdzWzBdLCAnaW5mbycpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVTdGF0dXMoKTtcbiAgfVxuXG4gIF9zZW5kT3V0cHV0KG1lc3NhZ2U6IHN0cmluZywgbGV2ZWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnb3V0cHV0V2luZG93Jywge1xuICAgICAgbGV2ZWw6IGxldmVsLFxuICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICB9KTtcbiAgfVxuXG4gIF91cGRhdGVTdGF0dXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0YXR1cyA9PT0gU1RBVFVTX0VORCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9zdGF0dXMgPT09IFNUQVRVU19CUkVBSykge1xuICAgICAgbG9nZ2VyLmxvZygnTXV4IGFscmVhZHkgaW4gYnJlYWsgc3RhdHVzJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gbm93IGNoZWNrIGlmIHdlIGNhbiBtb3ZlIGZyb20gcnVubmluZyB0byBicmVhay4uLlxuICAgIGZvciAoY29uc3QgY29ubmVjdGlvbkluZm8gb2YgdGhpcy5fY29ubmVjdGlvbnMudmFsdWVzKCkpIHtcbiAgICAgIGlmIChjb25uZWN0aW9uSW5mby5zdGF0dXMgPT09IFNUQVRVU19CUkVBSykge1xuICAgICAgICB0aGlzLl9lbmFibGVDb25uZWN0aW9uKGNvbm5lY3Rpb25JbmZvLmNvbm5lY3Rpb24pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfZW5hYmxlQ29ubmVjdGlvbihjb25uZWN0aW9uOiBDb25uZWN0aW9uKTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZygnTXV4IGVuYWJsaW5nIGNvbm5lY3Rpb24nKTtcbiAgICB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbiA9IGNvbm5lY3Rpb247XG4gICAgdGhpcy5fc2V0U3RhdHVzKFNUQVRVU19CUkVBSyk7XG4gIH1cblxuICBfc2V0U3RhdHVzKHN0YXR1czogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHN0YXR1cyAhPT0gdGhpcy5fc3RhdHVzKSB7XG4gICAgICB0aGlzLl9zdGF0dXMgPSBzdGF0dXM7XG4gICAgICB0aGlzLl9lbWl0U3RhdHVzKHN0YXR1cyk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUF0dGFjaEVycm9yKGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck1lc3NhZ2UoJ25vdGlmaWNhdGlvbicsIHtcbiAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICBtZXNzYWdlOiBlcnJvcixcbiAgICB9KTtcbiAgfVxuXG4gIF9lbWl0U3RhdHVzKHN0YXR1czogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fY29ubmVjdGlvblN0YXR1c0VtaXR0ZXIuZW1pdChDT05ORUNUSU9OX01VWF9TVEFUVVNfRVZFTlQsIHN0YXR1cyk7XG4gIH1cblxuICBhc3luYyBydW50aW1lRXZhbHVhdGUoZXhwcmVzc2lvbjogc3RyaW5nKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICBsb2dnZXIubG9nKGBydW50aW1lRXZhbHVhdGUoKSBvbiBkdW1teSBjb25uZWN0aW9uIGZvcjogJHtleHByZXNzaW9ufWApO1xuICAgIGlmICh0aGlzLl9kdW1teUNvbm5lY3Rpb24pIHtcbiAgICAgIC8vIEdsb2JhbCBydW50aW1lIGV2YWx1YXRpb24gb24gZHVtbXkgY29ubmVjdGlvbiBkb2VzIG5vdCBjYXJlIGFib3V0XG4gICAgICAvLyB3aGljaCBmcmFtZSBpdCBpcyBiZWluZyBldmFsdWF0ZWQgb24gc28gY2hvb3NlIHRvcCBmcmFtZSBoZXJlLlxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fZHVtbXlDb25uZWN0aW9uLmV2YWx1YXRlT25DYWxsRnJhbWUoMCwgZXhwcmVzc2lvbik7XG4gICAgICB0aGlzLl9yZXBvcnRFdmFsdWF0aW9uRmFpbHVyZUlmTmVlZGVkKGV4cHJlc3Npb24sIHJlc3VsdCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLl9ub0Nvbm5lY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGV2YWx1YXRlT25DYWxsRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyLCBleHByZXNzaW9uOiBzdHJpbmcpOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24uZXZhbHVhdGVPbkNhbGxGcmFtZShmcmFtZUluZGV4LCBleHByZXNzaW9uKTtcbiAgICAgIHRoaXMuX3JlcG9ydEV2YWx1YXRpb25GYWlsdXJlSWZOZWVkZWQoZXhwcmVzc2lvbiwgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IHRoaXMuX25vQ29ubmVjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgX3JlcG9ydEV2YWx1YXRpb25GYWlsdXJlSWZOZWVkZWQoZXhwcmVzc2lvbjogc3RyaW5nLCByZXN1bHQ6IEV2YWx1YXRpb25GYWlsdXJlUmVzdWx0KTogdm9pZCB7XG4gICAgaWYgKHJlc3VsdC53YXNUaHJvd24pIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPVxuICAgICAgICBgRmFpbGVkIHRvIGV2YWx1YXRlIFwiJHtleHByZXNzaW9ufVwiOiAoJHtyZXN1bHQuZXJyb3IuJC5jb2RlfSkgJHtyZXN1bHQuZXJyb3IubWVzc2FnZVswXX1gO1xuICAgICAgdGhpcy5fY2xpZW50Q2FsbGJhY2suc2VuZFVzZXJNZXNzYWdlKCdjb25zb2xlJywge1xuICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNldFBhdXNlT25FeGNlcHRpb25zKHN0YXRlOiBFeGNlcHRpb25TdGF0ZSk6IFByb21pc2Uge1xuICAgIHJldHVybiB0aGlzLl9icmVha3BvaW50U3RvcmUuc2V0UGF1c2VPbkV4Y2VwdGlvbnMoc3RhdGUpO1xuICB9XG5cbiAgc2V0QnJlYWtwb2ludChmaWxlbmFtZTogc3RyaW5nLCBsaW5lTnVtYmVyOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9icmVha3BvaW50U3RvcmUuc2V0QnJlYWtwb2ludChmaWxlbmFtZSwgbGluZU51bWJlcik7XG4gIH1cblxuICByZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5yZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZCk7XG4gIH1cblxuICBnZXRTdGFja0ZyYW1lcygpOiBQcm9taXNlPHtzdGFjazogT2JqZWN0fT4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLmdldFN0YWNrRnJhbWVzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoaXMgb2NjdXJzIG9uIHN0YXJ0dXAgd2l0aCB0aGUgbG9hZGVyIGJyZWFrcG9pbnQuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtzdGFjazoge319KTtcbiAgICB9XG4gIH1cblxuICBnZXRTY29wZXNGb3JGcmFtZShmcmFtZUluZGV4OiBudW1iZXIpOiBQcm9taXNlPEFycmF5PFNjb3BlPj4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLmdldFNjb3Blc0ZvckZyYW1lKGZyYW1lSW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLl9ub0Nvbm5lY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIGdldFN0YXR1cygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdGF0dXM7XG4gIH1cblxuICBzZW5kQ29udGludWF0aW9uQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLnNlbmRDb250aW51YXRpb25Db21tYW5kKGNvbW1hbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLl9ub0Nvbm5lY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIHNlbmRCcmVha0NvbW1hbmQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24uc2VuZEJyZWFrQ29tbWFuZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBnZXRQcm9wZXJ0aWVzKHJlbW90ZUlkOiBSZW1vdGVPYmplY3RJZCk6IFByb21pc2U8QXJyYXk8UHJvcGVydHlEZXNjcmlwdG9yPj4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbiAmJiB0aGlzLl9zdGF0dXMgPT09IFNUQVRVU19CUkVBSykge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLmdldFByb3BlcnRpZXMocmVtb3RlSWQpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fZHVtbXlDb25uZWN0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZHVtbXlDb25uZWN0aW9uLmdldFByb3BlcnRpZXMocmVtb3RlSWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLl9ub0Nvbm5lY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBjb25uZWN0aW9uIG9mIHRoaXMuX2Nvbm5lY3Rpb25zLmtleXMoKSkge1xuICAgICAgdGhpcy5fcmVtb3ZlQ29ubmVjdGlvbihjb25uZWN0aW9uKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2R1bW15UmVxdWVzdFByb2Nlc3MpIHtcbiAgICAgIHRoaXMuX2R1bW15UmVxdWVzdFByb2Nlc3Mua2lsbCgnU0lHS0lMTCcpO1xuICAgIH1cbiAgICB0aGlzLl9kaXNwb3NlQ29ubmVjdG9yKCk7XG4gIH1cblxuICBfcmVtb3ZlQ29ubmVjdGlvbihjb25uZWN0aW9uOiBDb25uZWN0aW9uKTogdm9pZCB7XG4gICAgY29uc3QgaW5mbyA9IHRoaXMuX2Nvbm5lY3Rpb25zLmdldChjb25uZWN0aW9uKTtcbiAgICBpbnZhcmlhbnQoaW5mbyAhPSBudWxsKTtcbiAgICBpbmZvLm9uU3RhdHVzRGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgY29ubmVjdGlvbi5kaXNwb3NlKCk7XG4gICAgdGhpcy5fY29ubmVjdGlvbnMuZGVsZXRlKGNvbm5lY3Rpb24pO1xuXG4gICAgaWYgKGNvbm5lY3Rpb24gPT09IHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uKSB7XG4gICAgICB0aGlzLl9kaXNhYmxlQ29ubmVjdGlvbigpO1xuICAgIH1cbiAgICB0aGlzLl9jaGVja0ZvckVuZCgpO1xuICB9XG5cbiAgX2Rpc2FibGVDb25uZWN0aW9uKCk6IHZvaWQge1xuICAgIGxvZ2dlci5sb2coJ011eCBkaXNhYmxpbmcgY29ubmVjdGlvbicpO1xuICAgIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9zZXRTdGF0dXMoU1RBVFVTX1JVTk5JTkcpO1xuICB9XG5cbiAgX2Rpc3Bvc2VDb25uZWN0b3IoKTogdm9pZCB7XG4gICAgLy8gQXZvaWQgcmVjdXJzaW9uIHdpdGggY29ubmVjdG9yJ3Mgb25DbG9zZSBldmVudC5cbiAgICBjb25zdCBjb25uZWN0b3IgPSB0aGlzLl9jb25uZWN0b3I7XG4gICAgaWYgKGNvbm5lY3Rvcikge1xuICAgICAgdGhpcy5fY29ubmVjdG9yID0gbnVsbDtcbiAgICAgIGNvbm5lY3Rvci5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX2NoZWNrRm9yRW5kKCk7XG4gIH1cblxuICBfY2hlY2tGb3JFbmQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb25zLnNpemUgPT09IDAgJiZcbiAgICAgICAoIXRoaXMuX2Nvbm5lY3RvciB8fCB0aGlzLl9jb25maWcuZW5kRGVidWdXaGVuTm9SZXF1ZXN0cykpIHtcbiAgICAgIHRoaXMuX3NldFN0YXR1cyhTVEFUVVNfRU5EKTtcbiAgICB9XG4gIH1cblxuICBfbm9Db25uZWN0aW9uRXJyb3IoKTogRXJyb3Ige1xuICAgIC8vIFRoaXMgaXMgYW4gaW5kaWNhdGlvbiBvZiBhIGJ1ZyBpbiB0aGUgc3RhdGUgbWFjaGluZS5cbiAgICAvLyAuLiB3ZSBhcmUgc2VlaW5nIGEgcmVxdWVzdCBpbiBhIHN0YXRlIHRoYXQgc2hvdWxkIG5vdCBnZW5lcmF0ZVxuICAgIC8vIHRoYXQgcmVxdWVzdC5cbiAgICByZXR1cm4gbmV3IEVycm9yKCdObyBjb25uZWN0aW9uJyk7XG4gIH1cblxuICBhc3luYyBfaGFuZGxlT3V0cHV0U2V0dXBGb3JDb25uZWN0aW9uKGNvbm5lY3Rpb246IENvbm5lY3Rpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzdGRvdXRSZXF1ZXN0U3VjY2VlZGVkID0gYXdhaXQgY29ubmVjdGlvbi5zZW5kU3Rkb3V0UmVxdWVzdCgpO1xuICAgIGlmICghc3Rkb3V0UmVxdWVzdFN1Y2NlZWRlZCkge1xuICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdISFZNIHJldHVybmVkIGZhaWx1cmUgZm9yIGEgc3Rkb3V0IHJlcXVlc3QnKTtcbiAgICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnb3V0cHV0V2luZG93Jywge1xuICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgICAgdGV4dDogJ0hIVk0gZmFpbGVkIHRvIHJlZGlyZWN0IHN0ZG91dCwgc28gbm8gb3V0cHV0IHdpbGwgYmUgc2VudCB0byB0aGUgb3V0cHV0IHdpbmRvdy4nLFxuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFRPRE86IFN0ZGVyciByZWRpcmVjdGlvbiBpcyBub3QgaW1wbGVtZW50ZWQgaW4gSEhWTSBzbyB3ZSB3b24ndCBjaGVjayB0aGlzIHJldHVybiB2YWx1ZS5cbiAgICBhd2FpdCBjb25uZWN0aW9uLnNlbmRTdGRlcnJSZXF1ZXN0KCk7XG4gIH1cbn1cbiJdfQ==