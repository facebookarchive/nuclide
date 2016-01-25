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
    this._emitter = new _events.EventEmitter();
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
      return require('../../commons').event.attachEvent(this._emitter, CONNECTION_MUX_STATUS_EVENT, callback);
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
      _utils2['default'].log('ConnectionMultiplexer successfully got dummy connection.');
      var dummyConnection = new _Connection.Connection(socket);
      // Continue from loader breakpoint to hit xdebug_break()
      // which will load whole www repo for evaluation if possible.
      yield dummyConnection.sendContinuationCommand(_DbgpSocket.COMMAND_RUN);
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
      var _this = this;

      var socket = params.socket;
      var message = params.message;

      if (!(0, _ConnectionUtils.isCorrectConnection)(this._config, message)) {
        (0, _ConnectionUtils.failConnection)(socket, 'Discarding connection ' + JSON.stringify(message));
        return;
      }

      if ((0, _ConnectionUtils.isDummyConnection)(message)) {
        this._handleDummyConnection(socket);
      } else {
        yield* (function* () {
          var connection = new _Connection.Connection(socket);
          _this._breakpointStore.addConnection(connection);

          var info = {
            connection: connection,
            onStatusDisposable: connection.onStatus(function (status) {
              _this._connectionOnStatus(connection, status);
            }),
            status: _DbgpSocket.STATUS_STARTING
          };
          _this._connections.set(connection, info);

          var status = undefined;
          try {
            status = yield connection.getStatus();
          } catch (e) {
            _utils2['default'].logError('Error getting initial connection status: ' + e.message);
            status = _DbgpSocket.STATUS_ERROR;
          }
          _this._connectionOnStatus(connection, status);
        })();
      }
    })
  }, {
    key: '_connectionOnStatus',
    value: function _connectionOnStatus(connection, status) {
      _utils2['default'].log('Mux got status: ' + status + ' on connection ' + connection.getId());
      var connectionInfo = this._connections.get(connection);
      (0, _assert2['default'])(connectionInfo != null);
      connectionInfo.status = status;

      switch (status) {
        case _DbgpSocket.STATUS_STARTING:
          // Starting status has no stack.
          // step before reporting initial status to get to the first instruction.
          // TODO: Use loader breakpoint configuration to choose between step/run.
          connection.sendContinuationCommand(_DbgpSocket.COMMAND_RUN);
          return;
        case _DbgpSocket.STATUS_STOPPING:
          // TODO: May want to enable post-mortem features?
          connection.sendContinuationCommand(_DbgpSocket.COMMAND_RUN);
          return;
        case _DbgpSocket.STATUS_RUNNING:
          if (connection === this._enabledConnection) {
            this._disableConnection();
          }
          break;
        case _DbgpSocket.STATUS_BREAK:
          if (connection === this._enabledConnection) {
            // This can happen when we step.
            _utils2['default'].log('Mux break on enabled connection');
            this._emitStatus(_DbgpSocket.STATUS_BREAK);
            return;
          }
          break;
        case _DbgpSocket.STATUS_STOPPED:
        case _DbgpSocket.STATUS_ERROR:
        case _DbgpSocket.STATUS_END:
          this._removeConnection(connection);
          break;
      }

      this._updateStatus();
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
      this._emitter.emit(CONNECTION_MUX_STATUS_EVENT, status);
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
  }]);

  return ConnectionMultiplexer;
})();

exports.ConnectionMultiplexer = ConnectionMultiplexer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25NdWx0aXBsZXhlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFXbUIsU0FBUzs7OzswQkFDSCxjQUFjOzsrQkFNaEMsbUJBQW1COzswQkFtQm5CLGNBQWM7O3NCQUNNLFFBQVE7O3NCQUNiLFFBQVE7Ozs7OEJBQ0Qsa0JBQWtCOztlQWZyQixPQUFPLENBQUMsbUJBQW1CLENBQUM7O0lBQS9DLGVBQWUsWUFBZixlQUFlOztnQkFDRSxPQUFPLENBQUMsaUJBQWlCLENBQUM7O0lBQTNDLGFBQWEsYUFBYixhQUFhOztBQWdCcEIsSUFBTSwyQkFBMkIsR0FBRyx1QkFBdUIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFpRC9DLHFCQUFxQjtBQVlyQixXQVpBLHFCQUFxQixDQVlwQixNQUF3QixFQUFFLGNBQThCLEVBQUU7MEJBWjNELHFCQUFxQjs7QUFhOUIsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdEIsUUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7QUFDdEMsUUFBSSxDQUFDLE9BQU8sOEJBQWtCLENBQUM7QUFDL0IsUUFBSSxDQUFDLFFBQVEsR0FBRywwQkFBa0IsQ0FBQztBQUNuQyxRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDN0IsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzlCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7O0FBRWpDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO0dBQy9DOztlQXhCVSxxQkFBcUI7O1dBMEJ4QixrQkFBQyxRQUFtQyxFQUFtQjtBQUM3RCxhQUFPLE9BQU8sQ0FBQyxlQUFlLENBQUMs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O0FBQzFDLFlBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO09BQzNCO0FBQ0QsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQ3JCOzs7V0FFaUIsOEJBQVM7QUFDekIseUJBQU8sR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDdkMsVUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztBQUMvQixVQUFJLENBQUMsVUFBVSw0QkFBZ0IsQ0FBQztLQUNqQzs7O1dBRWdCLDZCQUFTOztBQUV4QixVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0FBQ2xDLFVBQUksU0FBUyxFQUFFO0FBQ2IsWUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsaUJBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNyQjtBQUNELFVBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztLQUNyQjs7O1dBRVcsd0JBQVM7QUFDbkIsVUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQzVCLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFBLEFBQUMsRUFBRTtBQUM1RCxZQUFJLENBQUMsVUFBVSx3QkFBWSxDQUFDO09BQzdCO0tBQ0Y7OztXQUVpQiw4QkFBVTs7OztBQUkxQixhQUFPLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQ25DOzs7U0F2VVUscUJBQXFCIiwiZmlsZSI6IkNvbm5lY3Rpb25NdWx0aXBsZXhlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBsb2dnZXIgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge0Nvbm5lY3Rpb259IGZyb20gJy4vQ29ubmVjdGlvbic7XG5pbXBvcnQge1xuICBpc0R1bW15Q29ubmVjdGlvbixcbiAgc2VuZER1bW15UmVxdWVzdCxcbiAgaXNDb3JyZWN0Q29ubmVjdGlvbixcbiAgZmFpbENvbm5lY3Rpb24sXG59IGZyb20gJy4vQ29ubmVjdGlvblV0aWxzJztcblxuaW1wb3J0IHR5cGUge1NvY2tldH0gZnJvbSAnbmV0JztcbmltcG9ydCB0eXBlIHtTY29wZX1mcm9tICcuL0RhdGFDYWNoZSc7XG5pbXBvcnQgdHlwZSB7UHJvcGVydHlEZXNjcmlwdG9yfSBmcm9tICcuL0RhdGFDYWNoZSc7XG5pbXBvcnQgdHlwZSB7UmVtb3RlT2JqZWN0SWR9IGZyb20gJy4vRGF0YUNhY2hlJztcbmltcG9ydCB0eXBlIHtFeGNlcHRpb25TdGF0ZX0gZnJvbSAnLi9CcmVha3BvaW50U3RvcmUnO1xuY29uc3Qge0JyZWFrcG9pbnRTdG9yZX0gPSByZXF1aXJlKCcuL0JyZWFrcG9pbnRTdG9yZScpO1xuY29uc3Qge0RiZ3BDb25uZWN0b3J9ID0gcmVxdWlyZSgnLi9EYmdwQ29ubmVjdG9yJyk7XG5pbXBvcnQgdHlwZSB7Q29ubmVjdGlvbkNvbmZpZ30gZnJvbSAnLi9IaHZtRGVidWdnZXJQcm94eVNlcnZpY2UnO1xuaW1wb3J0IHtcbiAgU1RBVFVTX1NUQVJUSU5HLFxuICBTVEFUVVNfU1RPUFBJTkcsXG4gIFNUQVRVU19TVE9QUEVELFxuICBTVEFUVVNfUlVOTklORyxcbiAgU1RBVFVTX0JSRUFLLFxuICBTVEFUVVNfRVJST1IsXG4gIFNUQVRVU19FTkQsXG4gIENPTU1BTkRfUlVOLFxufSBmcm9tICcuL0RiZ3BTb2NrZXQnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NsaWVudENhbGxiYWNrfSBmcm9tICcuL0NsaWVudENhbGxiYWNrJztcblxuY29uc3QgQ09OTkVDVElPTl9NVVhfU1RBVFVTX0VWRU5UID0gJ2Nvbm5lY3Rpb24tbXV4LXN0YXR1cyc7XG5cbnR5cGUgQ29ubmVjdGlvbkluZm8gPSB7XG4gIGNvbm5lY3Rpb246IENvbm5lY3Rpb247XG4gIG9uU3RhdHVzRGlzcG9zYWJsZTogYXRvbSREaXNwb3NhYmxlO1xuICBzdGF0dXM6IHN0cmluZztcbn07XG5cbnR5cGUgRGJncEVycm9yID0ge1xuICAkOiB7XG4gICAgY29kZTogbnVtYmVyLFxuICB9O1xuICBtZXNzYWdlOiBBcnJheTxzdHJpbmc+O1xufTtcblxudHlwZSBFdmFsdWF0aW9uRmFpbHVyZVJlc3VsdCA9IHtcbiAgZXJyb3I6IERiZ3BFcnJvcjtcbiAgd2FzVGhyb3duOiBib29sZWFuO1xufTtcblxuLy8gVGhlIENvbm5lY3Rpb25NdWx0aXBsZXhlciBtYWtlcyBtdWx0aXBsZSBkZWJ1Z2dlciBjb25uZWN0aW9ucyBhcHBlYXIgdG8gYmVcbi8vIGEgc2luZ2xlIGNvbm5lY3Rpb24gdG8gdGhlIGRlYnVnZ2VyIFVJLlxuLy9cbi8vIFRoZSBpbml0aWFsaXphdGlvbiBzZXF1ZW5jZSBvY2N1cnMgYXMgZm9sbG93czpcbi8vICAtIHRoZSBjb25zdHJ1Y3RvciBpcyBjYWxsZWRcbi8vICAtIG9uU3RhdHVzIGlzIGNhbGxlZCB0byBob29rIHVwIGV2ZW50IGhhbmRsZXJzXG4vLyAgLSBpbml0aWFsIGJyZWFrcG9pbnRzIG1heSBiZSBhZGRlZCBoZXJlLlxuLy8gIC0gbGlzdGVuKCkgaXMgY2FsbGVkIGluZGljYXRpbmcgdGhhdCBhbGwgaW5pdGlhbCBCcmVha3BvaW50cyBoYXZlIGJlZW4gc2V0XG4vLyAgICBhbmQgZGVidWdnaW5nIG1heSBjb21tZW5jZS5cbi8vXG4vLyBPbmNlIGluaXRpYWxpemVkLCB0aGUgQ29ubmVjdGlvbk11bHRpcGxleGVyIGNhbiBiZSBpbiBvbmUgb2YgMyBtYWluIHN0YXRlczpcbi8vIHJ1bm5pbmcsIGJyZWFrLWRpc2FibGVkLCBhbmQgYnJlYWstZW5hYmxlZC5cbi8vXG4vLyBSdW5uaW5nIHN0YXRlIG1lYW5zIHRoYXQgYWxsIGNvbm5lY3Rpb25zIGFyZSBpbiB0aGUgcnVubmluZyBzdGF0ZS5cbi8vIE5vdGUgdGhhdCBydW5uaW5nIGluY2x1ZGVzIHRoZSBzdGF0ZSB3aGVyZSB0aGVyZSBhcmUgbm8gY29ubmVjdGlvbnMuXG4vL1xuLy8gQnJlYWstZGlzYWJsZWQgc3RhdGUgaGFzIGF0IGxlYXN0IG9uZSBjb25uZWN0aW9uIGluIGJyZWFrIHN0YXRlLlxuLy8gQW5kIG5vbmUgb2YgdGhlIGNvbm5lY3Rpb25zIGlzIGVuYWJsZWQuIE9uY2UgaW4gYnJlYWstZGlzYWJsZWQgc3RhdGUsXG4vLyB0aGUgY29ubmVjdGlvbiBtdXggd2lsbCBpbW1lZGlhdGVseSBlbmFibGUgb25lIG9mIHRoZSBicm9rZW4gY29ubmVjdGlvbnNcbi8vIGFuZCBtb3ZlIHRvIGJyZWFrLWVuYWJsZWQgc3RhdGUuXG4vL1xuLy8gQnJlYWstZW5hYmxlZCBzdGF0ZSBoYXMgYSBzaW5nbGUgY29ubmVjdGlvbiB3aGljaCBpcyBpbiBicmVhay1lbmFibGVkXG4vLyBzdGF0ZS4gVGhlcmUgbWF5IGJlIGNvbm5lY3Rpb25zIGluIGJyZWFrLWRpc2FibGVkIHN0YXRlIGFuZCBydW5uaW5nIHN0YXRlXG4vLyBhcyB3ZWxsLiBUaGUgZW5hYmxlZCBjb25uZWN0aW9uIHdpbGwgYmUgc2hvd24gaW4gdGhlIGRlYnVnZ2VyIFVJIGFuZCBhbGxcbi8vIGNvbW1hbmRzIHdpbGwgZ28gdG8gdGhlIGVuYWJsZWQgY29ubmVjdGlvbi5cbi8vXG4vLyBUaGUgQ29ubmVjdGlvbk11bHRpcGxleGVyIHdpbGwgY2xvc2Ugb25seSBpZiB0aGVyZSBhcmUgbm8gY29ubmVjdGlvbnNcbi8vIGFuZCBpZiB0aGUgRGJncENvbm5lY3RvciBpcyBjbG9zZWQuIFRoZSBEYmdwQ29ubmVjdG9yIHdpbGwgbGlrZWx5IG9ubHlcbi8vIGNsb3NlIGlmIEhIVk0gY3Jhc2hlcyBvciBpcyBzdG9wcGVkLlxuZXhwb3J0IGNsYXNzIENvbm5lY3Rpb25NdWx0aXBsZXhlciB7XG4gIF9jb25maWc6IENvbm5lY3Rpb25Db25maWc7XG4gIF9jbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2s7XG4gIF9icmVha3BvaW50U3RvcmU6IEJyZWFrcG9pbnRTdG9yZTtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX3N0YXR1czogc3RyaW5nO1xuICBfZW5hYmxlZENvbm5lY3Rpb246ID9Db25uZWN0aW9uO1xuICBfZHVtbXlDb25uZWN0aW9uOiA/Q29ubmVjdGlvbjtcbiAgX2Nvbm5lY3Rpb25zOiBNYXA8Q29ubmVjdGlvbiwgQ29ubmVjdGlvbkluZm8+O1xuICBfY29ubmVjdG9yOiA/RGJncENvbm5lY3RvcjtcbiAgX2R1bW15UmVxdWVzdFByb2Nlc3M6ID9jaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbm5lY3Rpb25Db25maWcsIGNsaWVudENhbGxiYWNrOiBDbGllbnRDYWxsYmFjaykge1xuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjayA9IGNsaWVudENhbGxiYWNrO1xuICAgIHRoaXMuX3N0YXR1cyA9IFNUQVRVU19TVEFSVElORztcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9kdW1teUNvbm5lY3Rpb24gPSBudWxsO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25zID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG51bGw7XG4gICAgdGhpcy5fZHVtbXlSZXF1ZXN0UHJvY2VzcyA9IG51bGw7XG5cbiAgICB0aGlzLl9icmVha3BvaW50U3RvcmUgPSBuZXcgQnJlYWtwb2ludFN0b3JlKCk7XG4gIH1cblxuICBvblN0YXR1cyhjYWxsYmFjazogKHN0YXR1czogc3RyaW5nKSA9PiBtaXhlZCk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKS5ldmVudC5hdHRhY2hFdmVudCh0aGlzLl9lbWl0dGVyLFxuICAgICAgQ09OTkVDVElPTl9NVVhfU1RBVFVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBsaXN0ZW4oKTogdm9pZCB7XG4gICAgY29uc3QgY29ubmVjdG9yID0gbmV3IERiZ3BDb25uZWN0b3IodGhpcy5fY29uZmlnKTtcbiAgICBjb25uZWN0b3Iub25BdHRhY2godGhpcy5fb25BdHRhY2guYmluZCh0aGlzKSk7XG4gICAgY29ubmVjdG9yLm9uQ2xvc2UodGhpcy5fZGlzcG9zZUNvbm5lY3Rvci5iaW5kKHRoaXMpKTtcbiAgICBjb25uZWN0b3Iub25FcnJvcih0aGlzLl9oYW5kbGVBdHRhY2hFcnJvci5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBjb25uZWN0b3I7XG4gICAgdGhpcy5fc3RhdHVzID0gU1RBVFVTX1JVTk5JTkc7XG5cbiAgICBjb25uZWN0b3IubGlzdGVuKCk7XG5cbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck1lc3NhZ2UoJ2NvbnNvbGUnLCB7XG4gICAgICBsZXZlbDogJ3dhcm5pbmcnLFxuICAgICAgdGV4dDogJ1ByZS1sb2FkaW5nLCBwbGVhc2Ugd2FpdC4uLicsXG4gICAgfSk7XG4gICAgdGhpcy5fZHVtbXlSZXF1ZXN0UHJvY2VzcyA9IHNlbmREdW1teVJlcXVlc3QoKTtcbiAgfVxuXG4gIGFzeW5jIF9oYW5kbGVEdW1teUNvbm5lY3Rpb24oc29ja2V0OiBTb2NrZXQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2dnZXIubG9nKCdDb25uZWN0aW9uTXVsdGlwbGV4ZXIgc3VjY2Vzc2Z1bGx5IGdvdCBkdW1teSBjb25uZWN0aW9uLicpO1xuICAgIGNvbnN0IGR1bW15Q29ubmVjdGlvbiA9IG5ldyBDb25uZWN0aW9uKHNvY2tldCk7XG4gICAgLy8gQ29udGludWUgZnJvbSBsb2FkZXIgYnJlYWtwb2ludCB0byBoaXQgeGRlYnVnX2JyZWFrKClcbiAgICAvLyB3aGljaCB3aWxsIGxvYWQgd2hvbGUgd3d3IHJlcG8gZm9yIGV2YWx1YXRpb24gaWYgcG9zc2libGUuXG4gICAgYXdhaXQgZHVtbXlDb25uZWN0aW9uLnNlbmRDb250aW51YXRpb25Db21tYW5kKENPTU1BTkRfUlVOKTtcbiAgICB0aGlzLl9kdW1teUNvbm5lY3Rpb24gPSBkdW1teUNvbm5lY3Rpb247XG5cbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck1lc3NhZ2UoJ2NvbnNvbGUnLCB7XG4gICAgICBsZXZlbDogJ3dhcm5pbmcnLFxuICAgICAgdGV4dDogJ1ByZS1sb2FkaW5nIGlzIGRvbmUuIFlvdSBjYW4gdXNlIGNvbnNvbGUgd2luZG93IG5vdy4nLFxuICAgIH0pO1xuICB9XG5cbiAgLy8gRm9yIHRlc3RpbmcgcHVycG9zZS5cbiAgZ2V0RHVtbXlDb25uZWN0aW9uKCk6ID9Db25uZWN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fZHVtbXlDb25uZWN0aW9uO1xuICB9XG5cbiAgYXN5bmMgX29uQXR0YWNoKHBhcmFtczoge3NvY2tldDogU29ja2V0LCBtZXNzYWdlOiBPYmplY3R9KTogUHJvbWlzZSB7XG4gICAgY29uc3Qge3NvY2tldCwgbWVzc2FnZX0gPSBwYXJhbXM7XG4gICAgaWYgKCFpc0NvcnJlY3RDb25uZWN0aW9uKHRoaXMuX2NvbmZpZywgbWVzc2FnZSkpIHtcbiAgICAgIGZhaWxDb25uZWN0aW9uKHNvY2tldCwgJ0Rpc2NhcmRpbmcgY29ubmVjdGlvbiAnICsgSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChpc0R1bW15Q29ubmVjdGlvbihtZXNzYWdlKSkge1xuICAgICAgdGhpcy5faGFuZGxlRHVtbXlDb25uZWN0aW9uKHNvY2tldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgQ29ubmVjdGlvbihzb2NrZXQpO1xuICAgICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlLmFkZENvbm5lY3Rpb24oY29ubmVjdGlvbik7XG5cbiAgICAgIGNvbnN0IGluZm8gPSB7XG4gICAgICAgIGNvbm5lY3Rpb24sXG4gICAgICAgIG9uU3RhdHVzRGlzcG9zYWJsZTogY29ubmVjdGlvbi5vblN0YXR1cyhzdGF0dXMgPT4ge1xuICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25PblN0YXR1cyhjb25uZWN0aW9uLCBzdGF0dXMpO1xuICAgICAgICB9KSxcbiAgICAgICAgc3RhdHVzOiBTVEFUVVNfU1RBUlRJTkcsXG4gICAgICB9O1xuICAgICAgdGhpcy5fY29ubmVjdGlvbnMuc2V0KGNvbm5lY3Rpb24sIGluZm8pO1xuXG4gICAgICBsZXQgc3RhdHVzO1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3RhdHVzID0gYXdhaXQgY29ubmVjdGlvbi5nZXRTdGF0dXMoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdFcnJvciBnZXR0aW5nIGluaXRpYWwgY29ubmVjdGlvbiBzdGF0dXM6ICcgKyBlLm1lc3NhZ2UpO1xuICAgICAgICBzdGF0dXMgPSBTVEFUVVNfRVJST1I7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25uZWN0aW9uT25TdGF0dXMoY29ubmVjdGlvbiwgc3RhdHVzKTtcbiAgICB9XG4gIH1cblxuICBfY29ubmVjdGlvbk9uU3RhdHVzKGNvbm5lY3Rpb246IENvbm5lY3Rpb24sIHN0YXR1czogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZyhgTXV4IGdvdCBzdGF0dXM6ICR7c3RhdHVzfSBvbiBjb25uZWN0aW9uICR7Y29ubmVjdGlvbi5nZXRJZCgpfWApO1xuICAgIGNvbnN0IGNvbm5lY3Rpb25JbmZvID0gdGhpcy5fY29ubmVjdGlvbnMuZ2V0KGNvbm5lY3Rpb24pO1xuICAgIGludmFyaWFudChjb25uZWN0aW9uSW5mbyAhPSBudWxsKTtcbiAgICBjb25uZWN0aW9uSW5mby5zdGF0dXMgPSBzdGF0dXM7XG5cbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgY2FzZSBTVEFUVVNfU1RBUlRJTkc6XG4gICAgICAgIC8vIFN0YXJ0aW5nIHN0YXR1cyBoYXMgbm8gc3RhY2suXG4gICAgICAgIC8vIHN0ZXAgYmVmb3JlIHJlcG9ydGluZyBpbml0aWFsIHN0YXR1cyB0byBnZXQgdG8gdGhlIGZpcnN0IGluc3RydWN0aW9uLlxuICAgICAgICAvLyBUT0RPOiBVc2UgbG9hZGVyIGJyZWFrcG9pbnQgY29uZmlndXJhdGlvbiB0byBjaG9vc2UgYmV0d2VlbiBzdGVwL3J1bi5cbiAgICAgICAgY29ubmVjdGlvbi5zZW5kQ29udGludWF0aW9uQ29tbWFuZChDT01NQU5EX1JVTik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIGNhc2UgU1RBVFVTX1NUT1BQSU5HOlxuICAgICAgICAvLyBUT0RPOiBNYXkgd2FudCB0byBlbmFibGUgcG9zdC1tb3J0ZW0gZmVhdHVyZXM/XG4gICAgICAgIGNvbm5lY3Rpb24uc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9SVU4pO1xuICAgICAgICByZXR1cm47XG4gICAgICBjYXNlIFNUQVRVU19SVU5OSU5HOlxuICAgICAgICBpZiAoY29ubmVjdGlvbiA9PT0gdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgICAgICB0aGlzLl9kaXNhYmxlQ29ubmVjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTVEFUVVNfQlJFQUs6XG4gICAgICAgIGlmIChjb25uZWN0aW9uID09PSB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgICAgIC8vIFRoaXMgY2FuIGhhcHBlbiB3aGVuIHdlIHN0ZXAuXG4gICAgICAgICAgbG9nZ2VyLmxvZygnTXV4IGJyZWFrIG9uIGVuYWJsZWQgY29ubmVjdGlvbicpO1xuICAgICAgICAgIHRoaXMuX2VtaXRTdGF0dXMoU1RBVFVTX0JSRUFLKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFNUQVRVU19TVE9QUEVEOlxuICAgICAgY2FzZSBTVEFUVVNfRVJST1I6XG4gICAgICBjYXNlIFNUQVRVU19FTkQ6XG4gICAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZVN0YXR1cygpO1xuICB9XG5cbiAgX3VwZGF0ZVN0YXR1cygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RhdHVzID09PSBTVEFUVVNfRU5EKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3N0YXR1cyA9PT0gU1RBVFVTX0JSRUFLKSB7XG4gICAgICBsb2dnZXIubG9nKCdNdXggYWxyZWFkeSBpbiBicmVhayBzdGF0dXMnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBub3cgY2hlY2sgaWYgd2UgY2FuIG1vdmUgZnJvbSBydW5uaW5nIHRvIGJyZWFrLi4uXG4gICAgZm9yIChjb25zdCBjb25uZWN0aW9uSW5mbyBvZiB0aGlzLl9jb25uZWN0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgaWYgKGNvbm5lY3Rpb25JbmZvLnN0YXR1cyA9PT0gU1RBVFVTX0JSRUFLKSB7XG4gICAgICAgIHRoaXMuX2VuYWJsZUNvbm5lY3Rpb24oY29ubmVjdGlvbkluZm8uY29ubmVjdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9lbmFibGVDb25uZWN0aW9uKGNvbm5lY3Rpb246IENvbm5lY3Rpb24pOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKCdNdXggZW5hYmxpbmcgY29ubmVjdGlvbicpO1xuICAgIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICB0aGlzLl9zZXRTdGF0dXMoU1RBVFVTX0JSRUFLKTtcbiAgfVxuXG4gIF9zZXRTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoc3RhdHVzICE9PSB0aGlzLl9zdGF0dXMpIHtcbiAgICAgIHRoaXMuX3N0YXR1cyA9IHN0YXR1cztcbiAgICAgIHRoaXMuX2VtaXRTdGF0dXMoc3RhdHVzKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlQXR0YWNoRXJyb3IoZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnbm90aWZpY2F0aW9uJywge1xuICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgIG1lc3NhZ2U6IGVycm9yLFxuICAgIH0pO1xuICB9XG5cbiAgX2VtaXRTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ09OTkVDVElPTl9NVVhfU1RBVFVTX0VWRU5ULCBzdGF0dXMpO1xuICB9XG5cbiAgYXN5bmMgcnVudGltZUV2YWx1YXRlKGV4cHJlc3Npb246IHN0cmluZyk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgbG9nZ2VyLmxvZyhgcnVudGltZUV2YWx1YXRlKCkgb24gZHVtbXkgY29ubmVjdGlvbiBmb3I6ICR7ZXhwcmVzc2lvbn1gKTtcbiAgICBpZiAodGhpcy5fZHVtbXlDb25uZWN0aW9uKSB7XG4gICAgICAvLyBHbG9iYWwgcnVudGltZSBldmFsdWF0aW9uIG9uIGR1bW15IGNvbm5lY3Rpb24gZG9lcyBub3QgY2FyZSBhYm91dFxuICAgICAgLy8gd2hpY2ggZnJhbWUgaXQgaXMgYmVpbmcgZXZhbHVhdGVkIG9uIHNvIGNob29zZSB0b3AgZnJhbWUgaGVyZS5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2R1bW15Q29ubmVjdGlvbi5ldmFsdWF0ZU9uQ2FsbEZyYW1lKDAsIGV4cHJlc3Npb24pO1xuICAgICAgdGhpcy5fcmVwb3J0RXZhbHVhdGlvbkZhaWx1cmVJZk5lZWRlZChleHByZXNzaW9uLCByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5fbm9Db25uZWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBldmFsdWF0ZU9uQ2FsbEZyYW1lKGZyYW1lSW5kZXg6IG51bWJlciwgZXhwcmVzc2lvbjogc3RyaW5nKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLmV2YWx1YXRlT25DYWxsRnJhbWUoZnJhbWVJbmRleCwgZXhwcmVzc2lvbik7XG4gICAgICB0aGlzLl9yZXBvcnRFdmFsdWF0aW9uRmFpbHVyZUlmTmVlZGVkKGV4cHJlc3Npb24sIHJlc3VsdCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLl9ub0Nvbm5lY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIF9yZXBvcnRFdmFsdWF0aW9uRmFpbHVyZUlmTmVlZGVkKGV4cHJlc3Npb246IHN0cmluZywgcmVzdWx0OiBFdmFsdWF0aW9uRmFpbHVyZVJlc3VsdCk6IHZvaWQge1xuICAgIGlmIChyZXN1bHQud2FzVGhyb3duKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID1cbiAgICAgICAgYEZhaWxlZCB0byBldmFsdWF0ZSBcIiR7ZXhwcmVzc2lvbn1cIjogKCR7cmVzdWx0LmVycm9yLiQuY29kZX0pICR7cmVzdWx0LmVycm9yLm1lc3NhZ2VbMF19YDtcbiAgICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnY29uc29sZScsIHtcbiAgICAgICAgbGV2ZWw6ICdlcnJvcicsXG4gICAgICAgIHRleHQ6IG1lc3NhZ2UsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBzZXRQYXVzZU9uRXhjZXB0aW9ucyhzdGF0ZTogRXhjZXB0aW9uU3RhdGUpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gdGhpcy5fYnJlYWtwb2ludFN0b3JlLnNldFBhdXNlT25FeGNlcHRpb25zKHN0YXRlKTtcbiAgfVxuXG4gIHNldEJyZWFrcG9pbnQoZmlsZW5hbWU6IHN0cmluZywgbGluZU51bWJlcjogbnVtYmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fYnJlYWtwb2ludFN0b3JlLnNldEJyZWFrcG9pbnQoZmlsZW5hbWUsIGxpbmVOdW1iZXIpO1xuICB9XG5cbiAgcmVtb3ZlQnJlYWtwb2ludChicmVha3BvaW50SWQ6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIHJldHVybiB0aGlzLl9icmVha3BvaW50U3RvcmUucmVtb3ZlQnJlYWtwb2ludChicmVha3BvaW50SWQpO1xuICB9XG5cbiAgZ2V0U3RhY2tGcmFtZXMoKTogUHJvbWlzZTx7c3RhY2s6IE9iamVjdH0+IHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbi5nZXRTdGFja0ZyYW1lcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIG9jY3VycyBvbiBzdGFydHVwIHdpdGggdGhlIGxvYWRlciBicmVha3BvaW50LlxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7c3RhY2s6IHt9fSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0U2NvcGVzRm9yRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyKTogUHJvbWlzZTxBcnJheTxTY29wZT4+IHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbi5nZXRTY29wZXNGb3JGcmFtZShmcmFtZUluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5fbm9Db25uZWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICBnZXRTdGF0dXMoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhdHVzO1xuICB9XG5cbiAgc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uKSB7XG4gICAgICB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbi5zZW5kQ29udGludWF0aW9uQ29tbWFuZChjb21tYW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5fbm9Db25uZWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICBzZW5kQnJlYWtDb21tYW5kKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLnNlbmRCcmVha0NvbW1hbmQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UHJvcGVydGllcyhyZW1vdGVJZDogUmVtb3RlT2JqZWN0SWQpOiBQcm9taXNlPEFycmF5PFByb3BlcnR5RGVzY3JpcHRvcj4+IHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24gJiYgdGhpcy5fc3RhdHVzID09PSBTVEFUVVNfQlJFQUspIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbi5nZXRQcm9wZXJ0aWVzKHJlbW90ZUlkKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2R1bW15Q29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuX2R1bW15Q29ubmVjdGlvbi5nZXRQcm9wZXJ0aWVzKHJlbW90ZUlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5fbm9Db25uZWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgY29ubmVjdGlvbiBvZiB0aGlzLl9jb25uZWN0aW9ucy5rZXlzKCkpIHtcbiAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgfVxuICAgIGlmICh0aGlzLl9kdW1teVJlcXVlc3RQcm9jZXNzKSB7XG4gICAgICB0aGlzLl9kdW1teVJlcXVlc3RQcm9jZXNzLmtpbGwoJ1NJR0tJTEwnKTtcbiAgICB9XG4gICAgdGhpcy5fZGlzcG9zZUNvbm5lY3RvcigpO1xuICB9XG5cbiAgX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbjogQ29ubmVjdGlvbik6IHZvaWQge1xuICAgIGNvbnN0IGluZm8gPSB0aGlzLl9jb25uZWN0aW9ucy5nZXQoY29ubmVjdGlvbik7XG4gICAgaW52YXJpYW50KGluZm8gIT0gbnVsbCk7XG4gICAgaW5mby5vblN0YXR1c0Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIGNvbm5lY3Rpb24uZGlzcG9zZSgpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25zLmRlbGV0ZShjb25uZWN0aW9uKTtcblxuICAgIGlmIChjb25uZWN0aW9uID09PSB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgdGhpcy5fZGlzYWJsZUNvbm5lY3Rpb24oKTtcbiAgICB9XG4gICAgdGhpcy5fY2hlY2tGb3JFbmQoKTtcbiAgfVxuXG4gIF9kaXNhYmxlQ29ubmVjdGlvbigpOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKCdNdXggZGlzYWJsaW5nIGNvbm5lY3Rpb24nKTtcbiAgICB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fc2V0U3RhdHVzKFNUQVRVU19SVU5OSU5HKTtcbiAgfVxuXG4gIF9kaXNwb3NlQ29ubmVjdG9yKCk6IHZvaWQge1xuICAgIC8vIEF2b2lkIHJlY3Vyc2lvbiB3aXRoIGNvbm5lY3RvcidzIG9uQ2xvc2UgZXZlbnQuXG4gICAgY29uc3QgY29ubmVjdG9yID0gdGhpcy5fY29ubmVjdG9yO1xuICAgIGlmIChjb25uZWN0b3IpIHtcbiAgICAgIHRoaXMuX2Nvbm5lY3RvciA9IG51bGw7XG4gICAgICBjb25uZWN0b3IuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9jaGVja0ZvckVuZCgpO1xuICB9XG5cbiAgX2NoZWNrRm9yRW5kKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb25uZWN0aW9ucy5zaXplID09PSAwICYmXG4gICAgICAgKCF0aGlzLl9jb25uZWN0b3IgfHwgdGhpcy5fY29uZmlnLmVuZERlYnVnV2hlbk5vUmVxdWVzdHMpKSB7XG4gICAgICB0aGlzLl9zZXRTdGF0dXMoU1RBVFVTX0VORCk7XG4gICAgfVxuICB9XG5cbiAgX25vQ29ubmVjdGlvbkVycm9yKCk6IEVycm9yIHtcbiAgICAvLyBUaGlzIGlzIGFuIGluZGljYXRpb24gb2YgYSBidWcgaW4gdGhlIHN0YXRlIG1hY2hpbmUuXG4gICAgLy8gLi4gd2UgYXJlIHNlZWluZyBhIHJlcXVlc3QgaW4gYSBzdGF0ZSB0aGF0IHNob3VsZCBub3QgZ2VuZXJhdGVcbiAgICAvLyB0aGF0IHJlcXVlc3QuXG4gICAgcmV0dXJuIG5ldyBFcnJvcignTm8gY29ubmVjdGlvbicpO1xuICB9XG59XG4iXX0=