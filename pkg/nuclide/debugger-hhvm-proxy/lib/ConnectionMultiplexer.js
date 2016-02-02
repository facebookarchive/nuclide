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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25NdWx0aXBsZXhlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFXbUIsU0FBUzs7OzswQkFDSCxjQUFjOzsrQkFNaEMsbUJBQW1COzswQkFtQm5CLGNBQWM7O3NCQUNNLFFBQVE7O3NCQUNiLFFBQVE7Ozs7OEJBQ0Qsa0JBQWtCOztlQWZyQixPQUFPLENBQUMsbUJBQW1CLENBQUM7O0lBQS9DLGVBQWUsWUFBZixlQUFlOztnQkFDRSxPQUFPLENBQUMsaUJBQWlCLENBQUM7O0lBQTNDLGFBQWEsYUFBYixhQUFhOztBQWdCcEIsSUFBTSwyQkFBMkIsR0FBRyx1QkFBdUIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFpRC9DLHFCQUFxQjtBQVlyQixXQVpBLHFCQUFxQixDQVlwQixNQUF3QixFQUFFLGNBQThCLEVBQUU7MEJBWjNELHFCQUFxQjs7QUFhOUIsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdEIsUUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7QUFDdEMsUUFBSSxDQUFDLE9BQU8sOEJBQWtCLENBQUM7QUFDL0IsUUFBSSxDQUFDLFFBQVEsR0FBRywwQkFBa0IsQ0FBQztBQUNuQyxRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDN0IsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzlCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7O0FBRWpDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO0dBQy9DOztlQXhCVSxxQkFBcUI7O1dBMEJ4QixrQkFBQyxRQUFtQyxFQUFlO0FBQ3pELGFBQU8sT0FBTyxDQUFDLGVBQWUsQ0FBQyxD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QUFDMUMsWUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7T0FDM0I7QUFDRCxVQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDckI7OztXQUVpQiw4QkFBUztBQUN6Qix5QkFBTyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUN2QyxVQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFVBQUksQ0FBQyxVQUFVLDRCQUFnQixDQUFDO0tBQ2pDOzs7V0FFZ0IsNkJBQVM7O0FBRXhCLFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDbEMsVUFBSSxTQUFTLEVBQUU7QUFDYixZQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUN2QixpQkFBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3JCO0FBQ0QsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQ3JCOzs7V0FFVyx3QkFBUztBQUNuQixVQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsS0FDNUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUEsQUFBQyxFQUFFO0FBQzVELFlBQUksQ0FBQyxVQUFVLHdCQUFZLENBQUM7T0FDN0I7S0FDRjs7O1dBRWlCLDhCQUFVOzs7O0FBSTFCLGFBQU8sSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDbkM7OztTQXZVVSxxQkFBcUIiLCJmaWxlIjoiQ29ubmVjdGlvbk11bHRpcGxleGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7Q29ubmVjdGlvbn0gZnJvbSAnLi9Db25uZWN0aW9uJztcbmltcG9ydCB7XG4gIGlzRHVtbXlDb25uZWN0aW9uLFxuICBzZW5kRHVtbXlSZXF1ZXN0LFxuICBpc0NvcnJlY3RDb25uZWN0aW9uLFxuICBmYWlsQ29ubmVjdGlvbixcbn0gZnJvbSAnLi9Db25uZWN0aW9uVXRpbHMnO1xuXG5pbXBvcnQgdHlwZSB7U29ja2V0fSBmcm9tICduZXQnO1xuaW1wb3J0IHR5cGUge1Njb3BlfWZyb20gJy4vRGF0YUNhY2hlJztcbmltcG9ydCB0eXBlIHtQcm9wZXJ0eURlc2NyaXB0b3J9IGZyb20gJy4vRGF0YUNhY2hlJztcbmltcG9ydCB0eXBlIHtSZW1vdGVPYmplY3RJZH0gZnJvbSAnLi9EYXRhQ2FjaGUnO1xuaW1wb3J0IHR5cGUge0V4Y2VwdGlvblN0YXRlfSBmcm9tICcuL0JyZWFrcG9pbnRTdG9yZSc7XG5jb25zdCB7QnJlYWtwb2ludFN0b3JlfSA9IHJlcXVpcmUoJy4vQnJlYWtwb2ludFN0b3JlJyk7XG5jb25zdCB7RGJncENvbm5lY3Rvcn0gPSByZXF1aXJlKCcuL0RiZ3BDb25uZWN0b3InKTtcbmltcG9ydCB0eXBlIHtDb25uZWN0aW9uQ29uZmlnfSBmcm9tICcuL0hodm1EZWJ1Z2dlclByb3h5U2VydmljZSc7XG5pbXBvcnQge1xuICBTVEFUVVNfU1RBUlRJTkcsXG4gIFNUQVRVU19TVE9QUElORyxcbiAgU1RBVFVTX1NUT1BQRUQsXG4gIFNUQVRVU19SVU5OSU5HLFxuICBTVEFUVVNfQlJFQUssXG4gIFNUQVRVU19FUlJPUixcbiAgU1RBVFVTX0VORCxcbiAgQ09NTUFORF9SVU4sXG59IGZyb20gJy4vRGJncFNvY2tldCc7XG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Q2xpZW50Q2FsbGJhY2t9IGZyb20gJy4vQ2xpZW50Q2FsbGJhY2snO1xuXG5jb25zdCBDT05ORUNUSU9OX01VWF9TVEFUVVNfRVZFTlQgPSAnY29ubmVjdGlvbi1tdXgtc3RhdHVzJztcblxudHlwZSBDb25uZWN0aW9uSW5mbyA9IHtcbiAgY29ubmVjdGlvbjogQ29ubmVjdGlvbjtcbiAgb25TdGF0dXNEaXNwb3NhYmxlOiBJRGlzcG9zYWJsZTtcbiAgc3RhdHVzOiBzdHJpbmc7XG59O1xuXG50eXBlIERiZ3BFcnJvciA9IHtcbiAgJDoge1xuICAgIGNvZGU6IG51bWJlcixcbiAgfTtcbiAgbWVzc2FnZTogQXJyYXk8c3RyaW5nPjtcbn07XG5cbnR5cGUgRXZhbHVhdGlvbkZhaWx1cmVSZXN1bHQgPSB7XG4gIGVycm9yOiBEYmdwRXJyb3I7XG4gIHdhc1Rocm93bjogYm9vbGVhbjtcbn07XG5cbi8vIFRoZSBDb25uZWN0aW9uTXVsdGlwbGV4ZXIgbWFrZXMgbXVsdGlwbGUgZGVidWdnZXIgY29ubmVjdGlvbnMgYXBwZWFyIHRvIGJlXG4vLyBhIHNpbmdsZSBjb25uZWN0aW9uIHRvIHRoZSBkZWJ1Z2dlciBVSS5cbi8vXG4vLyBUaGUgaW5pdGlhbGl6YXRpb24gc2VxdWVuY2Ugb2NjdXJzIGFzIGZvbGxvd3M6XG4vLyAgLSB0aGUgY29uc3RydWN0b3IgaXMgY2FsbGVkXG4vLyAgLSBvblN0YXR1cyBpcyBjYWxsZWQgdG8gaG9vayB1cCBldmVudCBoYW5kbGVyc1xuLy8gIC0gaW5pdGlhbCBicmVha3BvaW50cyBtYXkgYmUgYWRkZWQgaGVyZS5cbi8vICAtIGxpc3RlbigpIGlzIGNhbGxlZCBpbmRpY2F0aW5nIHRoYXQgYWxsIGluaXRpYWwgQnJlYWtwb2ludHMgaGF2ZSBiZWVuIHNldFxuLy8gICAgYW5kIGRlYnVnZ2luZyBtYXkgY29tbWVuY2UuXG4vL1xuLy8gT25jZSBpbml0aWFsaXplZCwgdGhlIENvbm5lY3Rpb25NdWx0aXBsZXhlciBjYW4gYmUgaW4gb25lIG9mIDMgbWFpbiBzdGF0ZXM6XG4vLyBydW5uaW5nLCBicmVhay1kaXNhYmxlZCwgYW5kIGJyZWFrLWVuYWJsZWQuXG4vL1xuLy8gUnVubmluZyBzdGF0ZSBtZWFucyB0aGF0IGFsbCBjb25uZWN0aW9ucyBhcmUgaW4gdGhlIHJ1bm5pbmcgc3RhdGUuXG4vLyBOb3RlIHRoYXQgcnVubmluZyBpbmNsdWRlcyB0aGUgc3RhdGUgd2hlcmUgdGhlcmUgYXJlIG5vIGNvbm5lY3Rpb25zLlxuLy9cbi8vIEJyZWFrLWRpc2FibGVkIHN0YXRlIGhhcyBhdCBsZWFzdCBvbmUgY29ubmVjdGlvbiBpbiBicmVhayBzdGF0ZS5cbi8vIEFuZCBub25lIG9mIHRoZSBjb25uZWN0aW9ucyBpcyBlbmFibGVkLiBPbmNlIGluIGJyZWFrLWRpc2FibGVkIHN0YXRlLFxuLy8gdGhlIGNvbm5lY3Rpb24gbXV4IHdpbGwgaW1tZWRpYXRlbHkgZW5hYmxlIG9uZSBvZiB0aGUgYnJva2VuIGNvbm5lY3Rpb25zXG4vLyBhbmQgbW92ZSB0byBicmVhay1lbmFibGVkIHN0YXRlLlxuLy9cbi8vIEJyZWFrLWVuYWJsZWQgc3RhdGUgaGFzIGEgc2luZ2xlIGNvbm5lY3Rpb24gd2hpY2ggaXMgaW4gYnJlYWstZW5hYmxlZFxuLy8gc3RhdGUuIFRoZXJlIG1heSBiZSBjb25uZWN0aW9ucyBpbiBicmVhay1kaXNhYmxlZCBzdGF0ZSBhbmQgcnVubmluZyBzdGF0ZVxuLy8gYXMgd2VsbC4gVGhlIGVuYWJsZWQgY29ubmVjdGlvbiB3aWxsIGJlIHNob3duIGluIHRoZSBkZWJ1Z2dlciBVSSBhbmQgYWxsXG4vLyBjb21tYW5kcyB3aWxsIGdvIHRvIHRoZSBlbmFibGVkIGNvbm5lY3Rpb24uXG4vL1xuLy8gVGhlIENvbm5lY3Rpb25NdWx0aXBsZXhlciB3aWxsIGNsb3NlIG9ubHkgaWYgdGhlcmUgYXJlIG5vIGNvbm5lY3Rpb25zXG4vLyBhbmQgaWYgdGhlIERiZ3BDb25uZWN0b3IgaXMgY2xvc2VkLiBUaGUgRGJncENvbm5lY3RvciB3aWxsIGxpa2VseSBvbmx5XG4vLyBjbG9zZSBpZiBISFZNIGNyYXNoZXMgb3IgaXMgc3RvcHBlZC5cbmV4cG9ydCBjbGFzcyBDb25uZWN0aW9uTXVsdGlwbGV4ZXIge1xuICBfY29uZmlnOiBDb25uZWN0aW9uQ29uZmlnO1xuICBfY2xpZW50Q2FsbGJhY2s6IENsaWVudENhbGxiYWNrO1xuICBfYnJlYWtwb2ludFN0b3JlOiBCcmVha3BvaW50U3RvcmU7XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF9zdGF0dXM6IHN0cmluZztcbiAgX2VuYWJsZWRDb25uZWN0aW9uOiA/Q29ubmVjdGlvbjtcbiAgX2R1bW15Q29ubmVjdGlvbjogP0Nvbm5lY3Rpb247XG4gIF9jb25uZWN0aW9uczogTWFwPENvbm5lY3Rpb24sIENvbm5lY3Rpb25JbmZvPjtcbiAgX2Nvbm5lY3RvcjogP0RiZ3BDb25uZWN0b3I7XG4gIF9kdW1teVJlcXVlc3RQcm9jZXNzOiA/Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBDb25uZWN0aW9uQ29uZmlnLCBjbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2spIHtcbiAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5fY2xpZW50Q2FsbGJhY2sgPSBjbGllbnRDYWxsYmFjaztcbiAgICB0aGlzLl9zdGF0dXMgPSBTVEFUVVNfU1RBUlRJTkc7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fZHVtbXlDb25uZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9jb25uZWN0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBudWxsO1xuICAgIHRoaXMuX2R1bW15UmVxdWVzdFByb2Nlc3MgPSBudWxsO1xuXG4gICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlID0gbmV3IEJyZWFrcG9pbnRTdG9yZSgpO1xuICB9XG5cbiAgb25TdGF0dXMoY2FsbGJhY2s6IChzdGF0dXM6IHN0cmluZykgPT4gbWl4ZWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKS5ldmVudC5hdHRhY2hFdmVudCh0aGlzLl9lbWl0dGVyLFxuICAgICAgQ09OTkVDVElPTl9NVVhfU1RBVFVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBsaXN0ZW4oKTogdm9pZCB7XG4gICAgY29uc3QgY29ubmVjdG9yID0gbmV3IERiZ3BDb25uZWN0b3IodGhpcy5fY29uZmlnKTtcbiAgICBjb25uZWN0b3Iub25BdHRhY2godGhpcy5fb25BdHRhY2guYmluZCh0aGlzKSk7XG4gICAgY29ubmVjdG9yLm9uQ2xvc2UodGhpcy5fZGlzcG9zZUNvbm5lY3Rvci5iaW5kKHRoaXMpKTtcbiAgICBjb25uZWN0b3Iub25FcnJvcih0aGlzLl9oYW5kbGVBdHRhY2hFcnJvci5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBjb25uZWN0b3I7XG4gICAgdGhpcy5fc3RhdHVzID0gU1RBVFVTX1JVTk5JTkc7XG5cbiAgICBjb25uZWN0b3IubGlzdGVuKCk7XG5cbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck1lc3NhZ2UoJ2NvbnNvbGUnLCB7XG4gICAgICBsZXZlbDogJ3dhcm5pbmcnLFxuICAgICAgdGV4dDogJ1ByZS1sb2FkaW5nLCBwbGVhc2Ugd2FpdC4uLicsXG4gICAgfSk7XG4gICAgdGhpcy5fZHVtbXlSZXF1ZXN0UHJvY2VzcyA9IHNlbmREdW1teVJlcXVlc3QoKTtcbiAgfVxuXG4gIGFzeW5jIF9oYW5kbGVEdW1teUNvbm5lY3Rpb24oc29ja2V0OiBTb2NrZXQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2dnZXIubG9nKCdDb25uZWN0aW9uTXVsdGlwbGV4ZXIgc3VjY2Vzc2Z1bGx5IGdvdCBkdW1teSBjb25uZWN0aW9uLicpO1xuICAgIGNvbnN0IGR1bW15Q29ubmVjdGlvbiA9IG5ldyBDb25uZWN0aW9uKHNvY2tldCk7XG4gICAgLy8gQ29udGludWUgZnJvbSBsb2FkZXIgYnJlYWtwb2ludCB0byBoaXQgeGRlYnVnX2JyZWFrKClcbiAgICAvLyB3aGljaCB3aWxsIGxvYWQgd2hvbGUgd3d3IHJlcG8gZm9yIGV2YWx1YXRpb24gaWYgcG9zc2libGUuXG4gICAgYXdhaXQgZHVtbXlDb25uZWN0aW9uLnNlbmRDb250aW51YXRpb25Db21tYW5kKENPTU1BTkRfUlVOKTtcbiAgICB0aGlzLl9kdW1teUNvbm5lY3Rpb24gPSBkdW1teUNvbm5lY3Rpb247XG5cbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck1lc3NhZ2UoJ2NvbnNvbGUnLCB7XG4gICAgICBsZXZlbDogJ3dhcm5pbmcnLFxuICAgICAgdGV4dDogJ1ByZS1sb2FkaW5nIGlzIGRvbmUuIFlvdSBjYW4gdXNlIGNvbnNvbGUgd2luZG93IG5vdy4nLFxuICAgIH0pO1xuICB9XG5cbiAgLy8gRm9yIHRlc3RpbmcgcHVycG9zZS5cbiAgZ2V0RHVtbXlDb25uZWN0aW9uKCk6ID9Db25uZWN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fZHVtbXlDb25uZWN0aW9uO1xuICB9XG5cbiAgYXN5bmMgX29uQXR0YWNoKHBhcmFtczoge3NvY2tldDogU29ja2V0LCBtZXNzYWdlOiBPYmplY3R9KTogUHJvbWlzZSB7XG4gICAgY29uc3Qge3NvY2tldCwgbWVzc2FnZX0gPSBwYXJhbXM7XG4gICAgaWYgKCFpc0NvcnJlY3RDb25uZWN0aW9uKHRoaXMuX2NvbmZpZywgbWVzc2FnZSkpIHtcbiAgICAgIGZhaWxDb25uZWN0aW9uKHNvY2tldCwgJ0Rpc2NhcmRpbmcgY29ubmVjdGlvbiAnICsgSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChpc0R1bW15Q29ubmVjdGlvbihtZXNzYWdlKSkge1xuICAgICAgdGhpcy5faGFuZGxlRHVtbXlDb25uZWN0aW9uKHNvY2tldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgQ29ubmVjdGlvbihzb2NrZXQpO1xuICAgICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlLmFkZENvbm5lY3Rpb24oY29ubmVjdGlvbik7XG5cbiAgICAgIGNvbnN0IGluZm8gPSB7XG4gICAgICAgIGNvbm5lY3Rpb24sXG4gICAgICAgIG9uU3RhdHVzRGlzcG9zYWJsZTogY29ubmVjdGlvbi5vblN0YXR1cyhzdGF0dXMgPT4ge1xuICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25PblN0YXR1cyhjb25uZWN0aW9uLCBzdGF0dXMpO1xuICAgICAgICB9KSxcbiAgICAgICAgc3RhdHVzOiBTVEFUVVNfU1RBUlRJTkcsXG4gICAgICB9O1xuICAgICAgdGhpcy5fY29ubmVjdGlvbnMuc2V0KGNvbm5lY3Rpb24sIGluZm8pO1xuXG4gICAgICBsZXQgc3RhdHVzO1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3RhdHVzID0gYXdhaXQgY29ubmVjdGlvbi5nZXRTdGF0dXMoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdFcnJvciBnZXR0aW5nIGluaXRpYWwgY29ubmVjdGlvbiBzdGF0dXM6ICcgKyBlLm1lc3NhZ2UpO1xuICAgICAgICBzdGF0dXMgPSBTVEFUVVNfRVJST1I7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25uZWN0aW9uT25TdGF0dXMoY29ubmVjdGlvbiwgc3RhdHVzKTtcbiAgICB9XG4gIH1cblxuICBfY29ubmVjdGlvbk9uU3RhdHVzKGNvbm5lY3Rpb246IENvbm5lY3Rpb24sIHN0YXR1czogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZyhgTXV4IGdvdCBzdGF0dXM6ICR7c3RhdHVzfSBvbiBjb25uZWN0aW9uICR7Y29ubmVjdGlvbi5nZXRJZCgpfWApO1xuICAgIGNvbnN0IGNvbm5lY3Rpb25JbmZvID0gdGhpcy5fY29ubmVjdGlvbnMuZ2V0KGNvbm5lY3Rpb24pO1xuICAgIGludmFyaWFudChjb25uZWN0aW9uSW5mbyAhPSBudWxsKTtcbiAgICBjb25uZWN0aW9uSW5mby5zdGF0dXMgPSBzdGF0dXM7XG5cbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgY2FzZSBTVEFUVVNfU1RBUlRJTkc6XG4gICAgICAgIC8vIFN0YXJ0aW5nIHN0YXR1cyBoYXMgbm8gc3RhY2suXG4gICAgICAgIC8vIHN0ZXAgYmVmb3JlIHJlcG9ydGluZyBpbml0aWFsIHN0YXR1cyB0byBnZXQgdG8gdGhlIGZpcnN0IGluc3RydWN0aW9uLlxuICAgICAgICAvLyBUT0RPOiBVc2UgbG9hZGVyIGJyZWFrcG9pbnQgY29uZmlndXJhdGlvbiB0byBjaG9vc2UgYmV0d2VlbiBzdGVwL3J1bi5cbiAgICAgICAgY29ubmVjdGlvbi5zZW5kQ29udGludWF0aW9uQ29tbWFuZChDT01NQU5EX1JVTik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIGNhc2UgU1RBVFVTX1NUT1BQSU5HOlxuICAgICAgICAvLyBUT0RPOiBNYXkgd2FudCB0byBlbmFibGUgcG9zdC1tb3J0ZW0gZmVhdHVyZXM/XG4gICAgICAgIGNvbm5lY3Rpb24uc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9SVU4pO1xuICAgICAgICByZXR1cm47XG4gICAgICBjYXNlIFNUQVRVU19SVU5OSU5HOlxuICAgICAgICBpZiAoY29ubmVjdGlvbiA9PT0gdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgICAgICB0aGlzLl9kaXNhYmxlQ29ubmVjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTVEFUVVNfQlJFQUs6XG4gICAgICAgIGlmIChjb25uZWN0aW9uID09PSB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgICAgIC8vIFRoaXMgY2FuIGhhcHBlbiB3aGVuIHdlIHN0ZXAuXG4gICAgICAgICAgbG9nZ2VyLmxvZygnTXV4IGJyZWFrIG9uIGVuYWJsZWQgY29ubmVjdGlvbicpO1xuICAgICAgICAgIHRoaXMuX2VtaXRTdGF0dXMoU1RBVFVTX0JSRUFLKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFNUQVRVU19TVE9QUEVEOlxuICAgICAgY2FzZSBTVEFUVVNfRVJST1I6XG4gICAgICBjYXNlIFNUQVRVU19FTkQ6XG4gICAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZVN0YXR1cygpO1xuICB9XG5cbiAgX3VwZGF0ZVN0YXR1cygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RhdHVzID09PSBTVEFUVVNfRU5EKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3N0YXR1cyA9PT0gU1RBVFVTX0JSRUFLKSB7XG4gICAgICBsb2dnZXIubG9nKCdNdXggYWxyZWFkeSBpbiBicmVhayBzdGF0dXMnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBub3cgY2hlY2sgaWYgd2UgY2FuIG1vdmUgZnJvbSBydW5uaW5nIHRvIGJyZWFrLi4uXG4gICAgZm9yIChjb25zdCBjb25uZWN0aW9uSW5mbyBvZiB0aGlzLl9jb25uZWN0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgaWYgKGNvbm5lY3Rpb25JbmZvLnN0YXR1cyA9PT0gU1RBVFVTX0JSRUFLKSB7XG4gICAgICAgIHRoaXMuX2VuYWJsZUNvbm5lY3Rpb24oY29ubmVjdGlvbkluZm8uY29ubmVjdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9lbmFibGVDb25uZWN0aW9uKGNvbm5lY3Rpb246IENvbm5lY3Rpb24pOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKCdNdXggZW5hYmxpbmcgY29ubmVjdGlvbicpO1xuICAgIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICB0aGlzLl9zZXRTdGF0dXMoU1RBVFVTX0JSRUFLKTtcbiAgfVxuXG4gIF9zZXRTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoc3RhdHVzICE9PSB0aGlzLl9zdGF0dXMpIHtcbiAgICAgIHRoaXMuX3N0YXR1cyA9IHN0YXR1cztcbiAgICAgIHRoaXMuX2VtaXRTdGF0dXMoc3RhdHVzKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlQXR0YWNoRXJyb3IoZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnbm90aWZpY2F0aW9uJywge1xuICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgIG1lc3NhZ2U6IGVycm9yLFxuICAgIH0pO1xuICB9XG5cbiAgX2VtaXRTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ09OTkVDVElPTl9NVVhfU1RBVFVTX0VWRU5ULCBzdGF0dXMpO1xuICB9XG5cbiAgYXN5bmMgcnVudGltZUV2YWx1YXRlKGV4cHJlc3Npb246IHN0cmluZyk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgbG9nZ2VyLmxvZyhgcnVudGltZUV2YWx1YXRlKCkgb24gZHVtbXkgY29ubmVjdGlvbiBmb3I6ICR7ZXhwcmVzc2lvbn1gKTtcbiAgICBpZiAodGhpcy5fZHVtbXlDb25uZWN0aW9uKSB7XG4gICAgICAvLyBHbG9iYWwgcnVudGltZSBldmFsdWF0aW9uIG9uIGR1bW15IGNvbm5lY3Rpb24gZG9lcyBub3QgY2FyZSBhYm91dFxuICAgICAgLy8gd2hpY2ggZnJhbWUgaXQgaXMgYmVpbmcgZXZhbHVhdGVkIG9uIHNvIGNob29zZSB0b3AgZnJhbWUgaGVyZS5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2R1bW15Q29ubmVjdGlvbi5ldmFsdWF0ZU9uQ2FsbEZyYW1lKDAsIGV4cHJlc3Npb24pO1xuICAgICAgdGhpcy5fcmVwb3J0RXZhbHVhdGlvbkZhaWx1cmVJZk5lZWRlZChleHByZXNzaW9uLCByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5fbm9Db25uZWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBldmFsdWF0ZU9uQ2FsbEZyYW1lKGZyYW1lSW5kZXg6IG51bWJlciwgZXhwcmVzc2lvbjogc3RyaW5nKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLmV2YWx1YXRlT25DYWxsRnJhbWUoZnJhbWVJbmRleCwgZXhwcmVzc2lvbik7XG4gICAgICB0aGlzLl9yZXBvcnRFdmFsdWF0aW9uRmFpbHVyZUlmTmVlZGVkKGV4cHJlc3Npb24sIHJlc3VsdCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLl9ub0Nvbm5lY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIF9yZXBvcnRFdmFsdWF0aW9uRmFpbHVyZUlmTmVlZGVkKGV4cHJlc3Npb246IHN0cmluZywgcmVzdWx0OiBFdmFsdWF0aW9uRmFpbHVyZVJlc3VsdCk6IHZvaWQge1xuICAgIGlmIChyZXN1bHQud2FzVGhyb3duKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID1cbiAgICAgICAgYEZhaWxlZCB0byBldmFsdWF0ZSBcIiR7ZXhwcmVzc2lvbn1cIjogKCR7cmVzdWx0LmVycm9yLiQuY29kZX0pICR7cmVzdWx0LmVycm9yLm1lc3NhZ2VbMF19YDtcbiAgICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnY29uc29sZScsIHtcbiAgICAgICAgbGV2ZWw6ICdlcnJvcicsXG4gICAgICAgIHRleHQ6IG1lc3NhZ2UsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBzZXRQYXVzZU9uRXhjZXB0aW9ucyhzdGF0ZTogRXhjZXB0aW9uU3RhdGUpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gdGhpcy5fYnJlYWtwb2ludFN0b3JlLnNldFBhdXNlT25FeGNlcHRpb25zKHN0YXRlKTtcbiAgfVxuXG4gIHNldEJyZWFrcG9pbnQoZmlsZW5hbWU6IHN0cmluZywgbGluZU51bWJlcjogbnVtYmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fYnJlYWtwb2ludFN0b3JlLnNldEJyZWFrcG9pbnQoZmlsZW5hbWUsIGxpbmVOdW1iZXIpO1xuICB9XG5cbiAgcmVtb3ZlQnJlYWtwb2ludChicmVha3BvaW50SWQ6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIHJldHVybiB0aGlzLl9icmVha3BvaW50U3RvcmUucmVtb3ZlQnJlYWtwb2ludChicmVha3BvaW50SWQpO1xuICB9XG5cbiAgZ2V0U3RhY2tGcmFtZXMoKTogUHJvbWlzZTx7c3RhY2s6IE9iamVjdH0+IHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbi5nZXRTdGFja0ZyYW1lcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIG9jY3VycyBvbiBzdGFydHVwIHdpdGggdGhlIGxvYWRlciBicmVha3BvaW50LlxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7c3RhY2s6IHt9fSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0U2NvcGVzRm9yRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyKTogUHJvbWlzZTxBcnJheTxTY29wZT4+IHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbi5nZXRTY29wZXNGb3JGcmFtZShmcmFtZUluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5fbm9Db25uZWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICBnZXRTdGF0dXMoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhdHVzO1xuICB9XG5cbiAgc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uKSB7XG4gICAgICB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbi5zZW5kQ29udGludWF0aW9uQ29tbWFuZChjb21tYW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5fbm9Db25uZWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICBzZW5kQnJlYWtDb21tYW5kKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLnNlbmRCcmVha0NvbW1hbmQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UHJvcGVydGllcyhyZW1vdGVJZDogUmVtb3RlT2JqZWN0SWQpOiBQcm9taXNlPEFycmF5PFByb3BlcnR5RGVzY3JpcHRvcj4+IHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24gJiYgdGhpcy5fc3RhdHVzID09PSBTVEFUVVNfQlJFQUspIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbi5nZXRQcm9wZXJ0aWVzKHJlbW90ZUlkKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2R1bW15Q29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuX2R1bW15Q29ubmVjdGlvbi5nZXRQcm9wZXJ0aWVzKHJlbW90ZUlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5fbm9Db25uZWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgY29ubmVjdGlvbiBvZiB0aGlzLl9jb25uZWN0aW9ucy5rZXlzKCkpIHtcbiAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgfVxuICAgIGlmICh0aGlzLl9kdW1teVJlcXVlc3RQcm9jZXNzKSB7XG4gICAgICB0aGlzLl9kdW1teVJlcXVlc3RQcm9jZXNzLmtpbGwoJ1NJR0tJTEwnKTtcbiAgICB9XG4gICAgdGhpcy5fZGlzcG9zZUNvbm5lY3RvcigpO1xuICB9XG5cbiAgX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbjogQ29ubmVjdGlvbik6IHZvaWQge1xuICAgIGNvbnN0IGluZm8gPSB0aGlzLl9jb25uZWN0aW9ucy5nZXQoY29ubmVjdGlvbik7XG4gICAgaW52YXJpYW50KGluZm8gIT0gbnVsbCk7XG4gICAgaW5mby5vblN0YXR1c0Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIGNvbm5lY3Rpb24uZGlzcG9zZSgpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25zLmRlbGV0ZShjb25uZWN0aW9uKTtcblxuICAgIGlmIChjb25uZWN0aW9uID09PSB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgdGhpcy5fZGlzYWJsZUNvbm5lY3Rpb24oKTtcbiAgICB9XG4gICAgdGhpcy5fY2hlY2tGb3JFbmQoKTtcbiAgfVxuXG4gIF9kaXNhYmxlQ29ubmVjdGlvbigpOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKCdNdXggZGlzYWJsaW5nIGNvbm5lY3Rpb24nKTtcbiAgICB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fc2V0U3RhdHVzKFNUQVRVU19SVU5OSU5HKTtcbiAgfVxuXG4gIF9kaXNwb3NlQ29ubmVjdG9yKCk6IHZvaWQge1xuICAgIC8vIEF2b2lkIHJlY3Vyc2lvbiB3aXRoIGNvbm5lY3RvcidzIG9uQ2xvc2UgZXZlbnQuXG4gICAgY29uc3QgY29ubmVjdG9yID0gdGhpcy5fY29ubmVjdG9yO1xuICAgIGlmIChjb25uZWN0b3IpIHtcbiAgICAgIHRoaXMuX2Nvbm5lY3RvciA9IG51bGw7XG4gICAgICBjb25uZWN0b3IuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9jaGVja0ZvckVuZCgpO1xuICB9XG5cbiAgX2NoZWNrRm9yRW5kKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb25uZWN0aW9ucy5zaXplID09PSAwICYmXG4gICAgICAgKCF0aGlzLl9jb25uZWN0b3IgfHwgdGhpcy5fY29uZmlnLmVuZERlYnVnV2hlbk5vUmVxdWVzdHMpKSB7XG4gICAgICB0aGlzLl9zZXRTdGF0dXMoU1RBVFVTX0VORCk7XG4gICAgfVxuICB9XG5cbiAgX25vQ29ubmVjdGlvbkVycm9yKCk6IEVycm9yIHtcbiAgICAvLyBUaGlzIGlzIGFuIGluZGljYXRpb24gb2YgYSBidWcgaW4gdGhlIHN0YXRlIG1hY2hpbmUuXG4gICAgLy8gLi4gd2UgYXJlIHNlZWluZyBhIHJlcXVlc3QgaW4gYSBzdGF0ZSB0aGF0IHNob3VsZCBub3QgZ2VuZXJhdGVcbiAgICAvLyB0aGF0IHJlcXVlc3QuXG4gICAgcmV0dXJuIG5ldyBFcnJvcignTm8gY29ubmVjdGlvbicpO1xuICB9XG59XG4iXX0=