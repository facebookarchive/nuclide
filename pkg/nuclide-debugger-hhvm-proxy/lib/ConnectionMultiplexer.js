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

var _config = require('./config');

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
  function ConnectionMultiplexer(clientCallback) {
    _classCallCheck(this, ConnectionMultiplexer);

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
      return require('../../nuclide-commons').event.attachEvent(this._connectionStatusEmitter, CONNECTION_MUX_STATUS_EVENT, callback);
    }
  }, {
    key: 'listen',
    value: function listen() {
      var connector = new DbgpConnector();
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
      yield this._handleSetupForConnection(dummyConnection);

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

      if (!(0, _ConnectionUtils.isCorrectConnection)(message)) {
        (0, _ConnectionUtils.failConnection)(socket, 'Discarding connection ' + JSON.stringify(message));
        return;
      }
      if ((0, _ConnectionUtils.isDummyConnection)(message)) {
        yield this._handleDummyConnection(socket);
      } else {
        yield* (function* () {
          var connection = new _Connection.Connection(socket);
          _this2._breakpointStore.addConnection(connection);
          yield _this2._handleSetupForConnection(connection);

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
      if (this._dummyConnection != null) {
        // Global runtime evaluation on dummy connection does not care about
        // which frame it is being evaluated on so choose top frame here.
        var result = yield this._dummyConnection.runtimeEvaluate(0, expression);
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
      if (this._connections.size === 0 && (!this._connector || (0, _config.getConfig)().endDebugWhenNoRequests)) {
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
    key: '_handleSetupForConnection',
    value: _asyncToGenerator(function* (connection) {
      // Stdout/err commands.
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

      // Set features.
      var setFeatureSucceeded = yield connection.setFeature('max_depth', '5');
      if (!setFeatureSucceeded) {
        _utils2['default'].logError('HHVM returned failure for setting feature max_depth');
      }
    })
  }]);

  return ConnectionMultiplexer;
})();

exports.ConnectionMultiplexer = ConnectionMultiplexer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25NdWx0aXBsZXhlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFXbUIsU0FBUzs7OzswQkFDSCxjQUFjOztzQkFDZixVQUFVOzsrQkFNM0IsbUJBQW1COzswQkFpQm5CLGNBQWM7O3NCQUNNLFFBQVE7O3NCQUNiLFFBQVE7Ozs7OEJBQ0Qsa0JBQWtCOztlQWhCckIsT0FBTyxDQUFDLG1CQUFtQixDQUFDOztJQUEvQyxlQUFlLFlBQWYsZUFBZTs7Z0JBQ0UsT0FBTyxDQUFDLGlCQUFpQixDQUFDOztJQUEzQyxhQUFhLGFBQWIsYUFBYTs7QUFpQnBCLElBQU0sMkJBQTJCLEdBQUcsdUJBQXVCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBaUQvQyxxQkFBcUI7QUFXckIsV0FYQSxxQkFBcUIsQ0FXcEIsY0FBOEIsRUFBRTswQkFYakMscUJBQXFCOztBQVk5QixRQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztBQUN0QyxRQUFJLENBQUMsT0FBTyw4QkFBa0IsQ0FBQztBQUMvQixRQUFJLENBQUMsd0JBQXdCLEdBQUcsMEJBQWtCLENBQUM7QUFDbkQsUUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztBQUMvQixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUM5QixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUN2QixRQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO0dBQy9DOztlQXJCVSxxQkFBcUI7O1dBdUJ4QixrQkFBQyxRQUFtQyxFQUFlO0FBQ3pELGFBQU8sT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENB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QUFNLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDOzs7QUFHckMsVUFBTSxtQkFBbUIsR0FBRyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzFFLFVBQUksQ0FBQyxtQkFBbUIsRUFBRTtBQUN4QiwyQkFBTyxRQUFRLENBQUMscURBQXFELENBQUMsQ0FBQztPQUN4RTtLQUNGOzs7U0EzWFUscUJBQXFCIiwiZmlsZSI6IkNvbm5lY3Rpb25NdWx0aXBsZXhlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBsb2dnZXIgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge0Nvbm5lY3Rpb259IGZyb20gJy4vQ29ubmVjdGlvbic7XG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtcbiAgaXNEdW1teUNvbm5lY3Rpb24sXG4gIHNlbmREdW1teVJlcXVlc3QsXG4gIGlzQ29ycmVjdENvbm5lY3Rpb24sXG4gIGZhaWxDb25uZWN0aW9uLFxufSBmcm9tICcuL0Nvbm5lY3Rpb25VdGlscyc7XG5cbmltcG9ydCB0eXBlIHtTb2NrZXR9IGZyb20gJ25ldCc7XG5pbXBvcnQgdHlwZSB7RXhjZXB0aW9uU3RhdGV9IGZyb20gJy4vQnJlYWtwb2ludFN0b3JlJztcbmNvbnN0IHtCcmVha3BvaW50U3RvcmV9ID0gcmVxdWlyZSgnLi9CcmVha3BvaW50U3RvcmUnKTtcbmNvbnN0IHtEYmdwQ29ubmVjdG9yfSA9IHJlcXVpcmUoJy4vRGJncENvbm5lY3RvcicpO1xuaW1wb3J0IHtcbiAgU1RBVFVTX1NUQVJUSU5HLFxuICBTVEFUVVNfU1RPUFBJTkcsXG4gIFNUQVRVU19TVE9QUEVELFxuICBTVEFUVVNfUlVOTklORyxcbiAgU1RBVFVTX0JSRUFLLFxuICBTVEFUVVNfRVJST1IsXG4gIFNUQVRVU19FTkQsXG4gIFNUQVRVU19TVERPVVQsXG4gIFNUQVRVU19TVERFUlIsXG4gIENPTU1BTkRfUlVOLFxufSBmcm9tICcuL0RiZ3BTb2NrZXQnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NsaWVudENhbGxiYWNrfSBmcm9tICcuL0NsaWVudENhbGxiYWNrJztcblxuY29uc3QgQ09OTkVDVElPTl9NVVhfU1RBVFVTX0VWRU5UID0gJ2Nvbm5lY3Rpb24tbXV4LXN0YXR1cyc7XG5cbnR5cGUgQ29ubmVjdGlvbkluZm8gPSB7XG4gIGNvbm5lY3Rpb246IENvbm5lY3Rpb247XG4gIG9uU3RhdHVzRGlzcG9zYWJsZTogSURpc3Bvc2FibGU7XG4gIHN0YXR1czogc3RyaW5nO1xufTtcblxudHlwZSBEYmdwRXJyb3IgPSB7XG4gICQ6IHtcbiAgICBjb2RlOiBudW1iZXI7XG4gIH07XG4gIG1lc3NhZ2U6IEFycmF5PHN0cmluZz47XG59O1xuXG50eXBlIEV2YWx1YXRpb25GYWlsdXJlUmVzdWx0ID0ge1xuICBlcnJvcjogRGJncEVycm9yO1xuICB3YXNUaHJvd246IGJvb2xlYW47XG59O1xuXG4vLyBUaGUgQ29ubmVjdGlvbk11bHRpcGxleGVyIG1ha2VzIG11bHRpcGxlIGRlYnVnZ2VyIGNvbm5lY3Rpb25zIGFwcGVhciB0byBiZVxuLy8gYSBzaW5nbGUgY29ubmVjdGlvbiB0byB0aGUgZGVidWdnZXIgVUkuXG4vL1xuLy8gVGhlIGluaXRpYWxpemF0aW9uIHNlcXVlbmNlIG9jY3VycyBhcyBmb2xsb3dzOlxuLy8gIC0gdGhlIGNvbnN0cnVjdG9yIGlzIGNhbGxlZFxuLy8gIC0gb25TdGF0dXMgaXMgY2FsbGVkIHRvIGhvb2sgdXAgZXZlbnQgaGFuZGxlcnNcbi8vICAtIGluaXRpYWwgYnJlYWtwb2ludHMgbWF5IGJlIGFkZGVkIGhlcmUuXG4vLyAgLSBsaXN0ZW4oKSBpcyBjYWxsZWQgaW5kaWNhdGluZyB0aGF0IGFsbCBpbml0aWFsIEJyZWFrcG9pbnRzIGhhdmUgYmVlbiBzZXRcbi8vICAgIGFuZCBkZWJ1Z2dpbmcgbWF5IGNvbW1lbmNlLlxuLy9cbi8vIE9uY2UgaW5pdGlhbGl6ZWQsIHRoZSBDb25uZWN0aW9uTXVsdGlwbGV4ZXIgY2FuIGJlIGluIG9uZSBvZiAzIG1haW4gc3RhdGVzOlxuLy8gcnVubmluZywgYnJlYWstZGlzYWJsZWQsIGFuZCBicmVhay1lbmFibGVkLlxuLy9cbi8vIFJ1bm5pbmcgc3RhdGUgbWVhbnMgdGhhdCBhbGwgY29ubmVjdGlvbnMgYXJlIGluIHRoZSBydW5uaW5nIHN0YXRlLlxuLy8gTm90ZSB0aGF0IHJ1bm5pbmcgaW5jbHVkZXMgdGhlIHN0YXRlIHdoZXJlIHRoZXJlIGFyZSBubyBjb25uZWN0aW9ucy5cbi8vXG4vLyBCcmVhay1kaXNhYmxlZCBzdGF0ZSBoYXMgYXQgbGVhc3Qgb25lIGNvbm5lY3Rpb24gaW4gYnJlYWsgc3RhdGUuXG4vLyBBbmQgbm9uZSBvZiB0aGUgY29ubmVjdGlvbnMgaXMgZW5hYmxlZC4gT25jZSBpbiBicmVhay1kaXNhYmxlZCBzdGF0ZSxcbi8vIHRoZSBjb25uZWN0aW9uIG11eCB3aWxsIGltbWVkaWF0ZWx5IGVuYWJsZSBvbmUgb2YgdGhlIGJyb2tlbiBjb25uZWN0aW9uc1xuLy8gYW5kIG1vdmUgdG8gYnJlYWstZW5hYmxlZCBzdGF0ZS5cbi8vXG4vLyBCcmVhay1lbmFibGVkIHN0YXRlIGhhcyBhIHNpbmdsZSBjb25uZWN0aW9uIHdoaWNoIGlzIGluIGJyZWFrLWVuYWJsZWRcbi8vIHN0YXRlLiBUaGVyZSBtYXkgYmUgY29ubmVjdGlvbnMgaW4gYnJlYWstZGlzYWJsZWQgc3RhdGUgYW5kIHJ1bm5pbmcgc3RhdGVcbi8vIGFzIHdlbGwuIFRoZSBlbmFibGVkIGNvbm5lY3Rpb24gd2lsbCBiZSBzaG93biBpbiB0aGUgZGVidWdnZXIgVUkgYW5kIGFsbFxuLy8gY29tbWFuZHMgd2lsbCBnbyB0byB0aGUgZW5hYmxlZCBjb25uZWN0aW9uLlxuLy9cbi8vIFRoZSBDb25uZWN0aW9uTXVsdGlwbGV4ZXIgd2lsbCBjbG9zZSBvbmx5IGlmIHRoZXJlIGFyZSBubyBjb25uZWN0aW9uc1xuLy8gYW5kIGlmIHRoZSBEYmdwQ29ubmVjdG9yIGlzIGNsb3NlZC4gVGhlIERiZ3BDb25uZWN0b3Igd2lsbCBsaWtlbHkgb25seVxuLy8gY2xvc2UgaWYgSEhWTSBjcmFzaGVzIG9yIGlzIHN0b3BwZWQuXG5leHBvcnQgY2xhc3MgQ29ubmVjdGlvbk11bHRpcGxleGVyIHtcbiAgX2NsaWVudENhbGxiYWNrOiBDbGllbnRDYWxsYmFjaztcbiAgX2JyZWFrcG9pbnRTdG9yZTogQnJlYWtwb2ludFN0b3JlO1xuICBfY29ubmVjdGlvblN0YXR1c0VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX3N0YXR1czogc3RyaW5nO1xuICBfZW5hYmxlZENvbm5lY3Rpb246ID9Db25uZWN0aW9uO1xuICBfZHVtbXlDb25uZWN0aW9uOiA/Q29ubmVjdGlvbjtcbiAgX2Nvbm5lY3Rpb25zOiBNYXA8Q29ubmVjdGlvbiwgQ29ubmVjdGlvbkluZm8+O1xuICBfY29ubmVjdG9yOiA/RGJncENvbm5lY3RvcjtcbiAgX2R1bW15UmVxdWVzdFByb2Nlc3M6ID9jaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcztcblxuICBjb25zdHJ1Y3RvcihjbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2spIHtcbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjayA9IGNsaWVudENhbGxiYWNrO1xuICAgIHRoaXMuX3N0YXR1cyA9IFNUQVRVU19TVEFSVElORztcbiAgICB0aGlzLl9jb25uZWN0aW9uU3RhdHVzRW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fZHVtbXlDb25uZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9jb25uZWN0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9jb25uZWN0b3IgPSBudWxsO1xuICAgIHRoaXMuX2R1bW15UmVxdWVzdFByb2Nlc3MgPSBudWxsO1xuICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZSA9IG5ldyBCcmVha3BvaW50U3RvcmUoKTtcbiAgfVxuXG4gIG9uU3RhdHVzKGNhbGxiYWNrOiAoc3RhdHVzOiBzdHJpbmcpID0+IG1peGVkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKS5ldmVudC5hdHRhY2hFdmVudCh0aGlzLl9jb25uZWN0aW9uU3RhdHVzRW1pdHRlcixcbiAgICAgIENPTk5FQ1RJT05fTVVYX1NUQVRVU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgbGlzdGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbm5lY3RvciA9IG5ldyBEYmdwQ29ubmVjdG9yKCk7XG4gICAgY29ubmVjdG9yLm9uQXR0YWNoKHRoaXMuX29uQXR0YWNoLmJpbmQodGhpcykpO1xuICAgIGNvbm5lY3Rvci5vbkNsb3NlKHRoaXMuX2Rpc3Bvc2VDb25uZWN0b3IuYmluZCh0aGlzKSk7XG4gICAgY29ubmVjdG9yLm9uRXJyb3IodGhpcy5faGFuZGxlQXR0YWNoRXJyb3IuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fY29ubmVjdG9yID0gY29ubmVjdG9yO1xuICAgIHRoaXMuX3N0YXR1cyA9IFNUQVRVU19SVU5OSU5HO1xuXG4gICAgY29ubmVjdG9yLmxpc3RlbigpO1xuXG4gICAgdGhpcy5fY2xpZW50Q2FsbGJhY2suc2VuZFVzZXJNZXNzYWdlKCdjb25zb2xlJywge1xuICAgICAgbGV2ZWw6ICd3YXJuaW5nJyxcbiAgICAgIHRleHQ6ICdQcmUtbG9hZGluZywgcGxlYXNlIHdhaXQuLi4nLFxuICAgIH0pO1xuICAgIHRoaXMuX2R1bW15UmVxdWVzdFByb2Nlc3MgPSBzZW5kRHVtbXlSZXF1ZXN0KCk7XG4gIH1cblxuICBhc3luYyBfaGFuZGxlRHVtbXlDb25uZWN0aW9uKHNvY2tldDogU29ja2V0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyLmxvZygnQ29ubmVjdGlvbk11bHRpcGxleGVyIHN1Y2Nlc3NmdWxseSBnb3QgZHVtbXkgY29ubmVjdGlvbi4nKTtcbiAgICBjb25zdCBkdW1teUNvbm5lY3Rpb24gPSBuZXcgQ29ubmVjdGlvbihzb2NrZXQpO1xuICAgIGF3YWl0IHRoaXMuX2hhbmRsZVNldHVwRm9yQ29ubmVjdGlvbihkdW1teUNvbm5lY3Rpb24pO1xuXG4gICAgLy8gQ29udGludWUgZnJvbSBsb2FkZXIgYnJlYWtwb2ludCB0byBoaXQgeGRlYnVnX2JyZWFrKClcbiAgICAvLyB3aGljaCB3aWxsIGxvYWQgd2hvbGUgd3d3IHJlcG8gZm9yIGV2YWx1YXRpb24gaWYgcG9zc2libGUuXG4gICAgYXdhaXQgZHVtbXlDb25uZWN0aW9uLnNlbmRDb250aW51YXRpb25Db21tYW5kKENPTU1BTkRfUlVOKTtcbiAgICBkdW1teUNvbm5lY3Rpb24ub25TdGF0dXMoKHN0YXR1cywgbWVzc2FnZSkgPT4ge1xuICAgICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgY2FzZSBTVEFUVVNfU1RET1VUOlxuICAgICAgICAgIHRoaXMuX3NlbmRPdXRwdXQobWVzc2FnZSwgJ2xvZycpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFNUQVRVU19TVERFUlI6XG4gICAgICAgICAgdGhpcy5fc2VuZE91dHB1dChtZXNzYWdlLCAnaW5mbycpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX2R1bW15Q29ubmVjdGlvbiA9IGR1bW15Q29ubmVjdGlvbjtcblxuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnY29uc29sZScsIHtcbiAgICAgIGxldmVsOiAnd2FybmluZycsXG4gICAgICB0ZXh0OiAnUHJlLWxvYWRpbmcgaXMgZG9uZS4gWW91IGNhbiB1c2UgY29uc29sZSB3aW5kb3cgbm93LicsXG4gICAgfSk7XG4gIH1cblxuICAvLyBGb3IgdGVzdGluZyBwdXJwb3NlLlxuICBnZXREdW1teUNvbm5lY3Rpb24oKTogP0Nvbm5lY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLl9kdW1teUNvbm5lY3Rpb247XG4gIH1cblxuICBhc3luYyBfb25BdHRhY2gocGFyYW1zOiB7c29ja2V0OiBTb2NrZXQ7IG1lc3NhZ2U6IE9iamVjdH0pOiBQcm9taXNlIHtcbiAgICBjb25zdCB7c29ja2V0LCBtZXNzYWdlfSA9IHBhcmFtcztcbiAgICBpZiAoIWlzQ29ycmVjdENvbm5lY3Rpb24obWVzc2FnZSkpIHtcbiAgICAgIGZhaWxDb25uZWN0aW9uKHNvY2tldCwgJ0Rpc2NhcmRpbmcgY29ubmVjdGlvbiAnICsgSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXNEdW1teUNvbm5lY3Rpb24obWVzc2FnZSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuX2hhbmRsZUR1bW15Q29ubmVjdGlvbihzb2NrZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IENvbm5lY3Rpb24oc29ja2V0KTtcbiAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5hZGRDb25uZWN0aW9uKGNvbm5lY3Rpb24pO1xuICAgICAgYXdhaXQgdGhpcy5faGFuZGxlU2V0dXBGb3JDb25uZWN0aW9uKGNvbm5lY3Rpb24pO1xuXG4gICAgICBjb25zdCBpbmZvID0ge1xuICAgICAgICBjb25uZWN0aW9uLFxuICAgICAgICBvblN0YXR1c0Rpc3Bvc2FibGU6IGNvbm5lY3Rpb24ub25TdGF0dXMoKHN0YXR1cywgLi4uYXJncykgPT4ge1xuICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25PblN0YXR1cyhjb25uZWN0aW9uLCBzdGF0dXMsIC4uLmFyZ3MpO1xuICAgICAgICB9KSxcbiAgICAgICAgc3RhdHVzOiBTVEFUVVNfU1RBUlRJTkcsXG4gICAgICB9O1xuICAgICAgdGhpcy5fY29ubmVjdGlvbnMuc2V0KGNvbm5lY3Rpb24sIGluZm8pO1xuXG4gICAgICBsZXQgc3RhdHVzO1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3RhdHVzID0gYXdhaXQgY29ubmVjdGlvbi5nZXRTdGF0dXMoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdFcnJvciBnZXR0aW5nIGluaXRpYWwgY29ubmVjdGlvbiBzdGF0dXM6ICcgKyBlLm1lc3NhZ2UpO1xuICAgICAgICBzdGF0dXMgPSBTVEFUVVNfRVJST1I7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25uZWN0aW9uT25TdGF0dXMoY29ubmVjdGlvbiwgc3RhdHVzKTtcbiAgICB9XG4gIH1cblxuICBfY29ubmVjdGlvbk9uU3RhdHVzKGNvbm5lY3Rpb246IENvbm5lY3Rpb24sIHN0YXR1czogc3RyaW5nLCAuLi5hcmdzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZyhgTXV4IGdvdCBzdGF0dXM6ICR7c3RhdHVzfSBvbiBjb25uZWN0aW9uICR7Y29ubmVjdGlvbi5nZXRJZCgpfWApO1xuICAgIGNvbnN0IGNvbm5lY3Rpb25JbmZvID0gdGhpcy5fY29ubmVjdGlvbnMuZ2V0KGNvbm5lY3Rpb24pO1xuICAgIGludmFyaWFudChjb25uZWN0aW9uSW5mbyAhPSBudWxsKTtcblxuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICBjYXNlIFNUQVRVU19TVEFSVElORzpcbiAgICAgICAgLy8gU3RhcnRpbmcgc3RhdHVzIGhhcyBubyBzdGFjay5cbiAgICAgICAgLy8gc3RlcCBiZWZvcmUgcmVwb3J0aW5nIGluaXRpYWwgc3RhdHVzIHRvIGdldCB0byB0aGUgZmlyc3QgaW5zdHJ1Y3Rpb24uXG4gICAgICAgIC8vIFRPRE86IFVzZSBsb2FkZXIgYnJlYWtwb2ludCBjb25maWd1cmF0aW9uIHRvIGNob29zZSBiZXR3ZWVuIHN0ZXAvcnVuLlxuICAgICAgICBjb25uZWN0aW9uSW5mby5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIGNvbm5lY3Rpb24uc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9SVU4pO1xuICAgICAgICByZXR1cm47XG4gICAgICBjYXNlIFNUQVRVU19TVE9QUElORzpcbiAgICAgICAgLy8gVE9ETzogTWF5IHdhbnQgdG8gZW5hYmxlIHBvc3QtbW9ydGVtIGZlYXR1cmVzP1xuICAgICAgICBjb25uZWN0aW9uSW5mby5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIGNvbm5lY3Rpb24uc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9SVU4pO1xuICAgICAgICByZXR1cm47XG4gICAgICBjYXNlIFNUQVRVU19SVU5OSU5HOlxuICAgICAgICBjb25uZWN0aW9uSW5mby5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIGlmIChjb25uZWN0aW9uID09PSB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgICAgIHRoaXMuX2Rpc2FibGVDb25uZWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFNUQVRVU19CUkVBSzpcbiAgICAgICAgY29ubmVjdGlvbkluZm8uc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICBpZiAoY29ubmVjdGlvbiA9PT0gdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgICAgICAvLyBUaGlzIGNhbiBoYXBwZW4gd2hlbiB3ZSBzdGVwLlxuICAgICAgICAgIGxvZ2dlci5sb2coJ011eCBicmVhayBvbiBlbmFibGVkIGNvbm5lY3Rpb24nKTtcbiAgICAgICAgICB0aGlzLl9lbWl0U3RhdHVzKFNUQVRVU19CUkVBSyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTVEFUVVNfRVJST1I6XG4gICAgICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnbm90aWZpY2F0aW9uJywge1xuICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgbWVzc2FnZTogJ1RoZSBkZWJ1Z2dlciBlbmNvdW50ZXJlZCBhIHByb2JsZW0gYW5kIHRoZSBjb25uZWN0aW9uIGhhZCB0byBiZSBzaHV0IGRvd24uJyxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTVEFUVVNfU1RPUFBFRDpcbiAgICAgIGNhc2UgU1RBVFVTX0VORDpcbiAgICAgICAgY29ubmVjdGlvbkluZm8uc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLl9yZW1vdmVDb25uZWN0aW9uKGNvbm5lY3Rpb24pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX1NURE9VVDpcbiAgICAgICAgdGhpcy5fc2VuZE91dHB1dChhcmdzWzBdLCAnbG9nJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTVEFUVVNfU1RERVJSOlxuICAgICAgICB0aGlzLl9zZW5kT3V0cHV0KGFyZ3NbMF0sICdpbmZvJyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZVN0YXR1cygpO1xuICB9XG5cbiAgX3NlbmRPdXRwdXQobWVzc2FnZTogc3RyaW5nLCBsZXZlbDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fY2xpZW50Q2FsbGJhY2suc2VuZFVzZXJNZXNzYWdlKCdvdXRwdXRXaW5kb3cnLCB7XG4gICAgICBsZXZlbDogbGV2ZWwsXG4gICAgICB0ZXh0OiBtZXNzYWdlLFxuICAgIH0pO1xuICB9XG5cbiAgX3VwZGF0ZVN0YXR1cygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RhdHVzID09PSBTVEFUVVNfRU5EKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3N0YXR1cyA9PT0gU1RBVFVTX0JSRUFLKSB7XG4gICAgICBsb2dnZXIubG9nKCdNdXggYWxyZWFkeSBpbiBicmVhayBzdGF0dXMnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBub3cgY2hlY2sgaWYgd2UgY2FuIG1vdmUgZnJvbSBydW5uaW5nIHRvIGJyZWFrLi4uXG4gICAgZm9yIChjb25zdCBjb25uZWN0aW9uSW5mbyBvZiB0aGlzLl9jb25uZWN0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgaWYgKGNvbm5lY3Rpb25JbmZvLnN0YXR1cyA9PT0gU1RBVFVTX0JSRUFLKSB7XG4gICAgICAgIHRoaXMuX2VuYWJsZUNvbm5lY3Rpb24oY29ubmVjdGlvbkluZm8uY29ubmVjdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9lbmFibGVDb25uZWN0aW9uKGNvbm5lY3Rpb246IENvbm5lY3Rpb24pOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKCdNdXggZW5hYmxpbmcgY29ubmVjdGlvbicpO1xuICAgIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICB0aGlzLl9zZXRTdGF0dXMoU1RBVFVTX0JSRUFLKTtcbiAgfVxuXG4gIF9zZXRTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoc3RhdHVzICE9PSB0aGlzLl9zdGF0dXMpIHtcbiAgICAgIHRoaXMuX3N0YXR1cyA9IHN0YXR1cztcbiAgICAgIHRoaXMuX2VtaXRTdGF0dXMoc3RhdHVzKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlQXR0YWNoRXJyb3IoZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnbm90aWZpY2F0aW9uJywge1xuICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgIG1lc3NhZ2U6IGVycm9yLFxuICAgIH0pO1xuICB9XG5cbiAgX2VtaXRTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9jb25uZWN0aW9uU3RhdHVzRW1pdHRlci5lbWl0KENPTk5FQ1RJT05fTVVYX1NUQVRVU19FVkVOVCwgc3RhdHVzKTtcbiAgfVxuXG4gIGFzeW5jIHJ1bnRpbWVFdmFsdWF0ZShleHByZXNzaW9uOiBzdHJpbmcpOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIGxvZ2dlci5sb2coYHJ1bnRpbWVFdmFsdWF0ZSgpIG9uIGR1bW15IGNvbm5lY3Rpb24gZm9yOiAke2V4cHJlc3Npb259YCk7XG4gICAgaWYgKHRoaXMuX2R1bW15Q29ubmVjdGlvbiAhPSBudWxsKSB7XG4gICAgICAvLyBHbG9iYWwgcnVudGltZSBldmFsdWF0aW9uIG9uIGR1bW15IGNvbm5lY3Rpb24gZG9lcyBub3QgY2FyZSBhYm91dFxuICAgICAgLy8gd2hpY2ggZnJhbWUgaXQgaXMgYmVpbmcgZXZhbHVhdGVkIG9uIHNvIGNob29zZSB0b3AgZnJhbWUgaGVyZS5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2R1bW15Q29ubmVjdGlvbi5ydW50aW1lRXZhbHVhdGUoMCwgZXhwcmVzc2lvbik7XG4gICAgICB0aGlzLl9yZXBvcnRFdmFsdWF0aW9uRmFpbHVyZUlmTmVlZGVkKGV4cHJlc3Npb24sIHJlc3VsdCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLl9ub0Nvbm5lY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGV2YWx1YXRlT25DYWxsRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyLCBleHByZXNzaW9uOiBzdHJpbmcpOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24uZXZhbHVhdGVPbkNhbGxGcmFtZShmcmFtZUluZGV4LCBleHByZXNzaW9uKTtcbiAgICAgIHRoaXMuX3JlcG9ydEV2YWx1YXRpb25GYWlsdXJlSWZOZWVkZWQoZXhwcmVzc2lvbiwgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IHRoaXMuX25vQ29ubmVjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgX3JlcG9ydEV2YWx1YXRpb25GYWlsdXJlSWZOZWVkZWQoZXhwcmVzc2lvbjogc3RyaW5nLCByZXN1bHQ6IEV2YWx1YXRpb25GYWlsdXJlUmVzdWx0KTogdm9pZCB7XG4gICAgaWYgKHJlc3VsdC53YXNUaHJvd24pIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPVxuICAgICAgICBgRmFpbGVkIHRvIGV2YWx1YXRlIFwiJHtleHByZXNzaW9ufVwiOiAoJHtyZXN1bHQuZXJyb3IuJC5jb2RlfSkgJHtyZXN1bHQuZXJyb3IubWVzc2FnZVswXX1gO1xuICAgICAgdGhpcy5fY2xpZW50Q2FsbGJhY2suc2VuZFVzZXJNZXNzYWdlKCdjb25zb2xlJywge1xuICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNldFBhdXNlT25FeGNlcHRpb25zKHN0YXRlOiBFeGNlcHRpb25TdGF0ZSk6IFByb21pc2Uge1xuICAgIHJldHVybiB0aGlzLl9icmVha3BvaW50U3RvcmUuc2V0UGF1c2VPbkV4Y2VwdGlvbnMoc3RhdGUpO1xuICB9XG5cbiAgc2V0QnJlYWtwb2ludChmaWxlbmFtZTogc3RyaW5nLCBsaW5lTnVtYmVyOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9icmVha3BvaW50U3RvcmUuc2V0QnJlYWtwb2ludChmaWxlbmFtZSwgbGluZU51bWJlcik7XG4gIH1cblxuICByZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5yZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZCk7XG4gIH1cblxuICBnZXRTdGFja0ZyYW1lcygpOiBQcm9taXNlPHtzdGFjazogT2JqZWN0fT4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLmdldFN0YWNrRnJhbWVzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoaXMgb2NjdXJzIG9uIHN0YXJ0dXAgd2l0aCB0aGUgbG9hZGVyIGJyZWFrcG9pbnQuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtzdGFjazoge319KTtcbiAgICB9XG4gIH1cblxuICBnZXRTY29wZXNGb3JGcmFtZShmcmFtZUluZGV4OiBudW1iZXIpOiBQcm9taXNlPEFycmF5PERlYnVnZ2VyJFNjb3BlPj4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLmdldFNjb3Blc0ZvckZyYW1lKGZyYW1lSW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLl9ub0Nvbm5lY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIGdldFN0YXR1cygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdGF0dXM7XG4gIH1cblxuICBzZW5kQ29udGludWF0aW9uQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLnNlbmRDb250aW51YXRpb25Db21tYW5kKGNvbW1hbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLl9ub0Nvbm5lY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIHNlbmRCcmVha0NvbW1hbmQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24uc2VuZEJyZWFrQ29tbWFuZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBnZXRQcm9wZXJ0aWVzKHJlbW90ZUlkOiBSdW50aW1lJFJlbW90ZU9iamVjdElkKTogUHJvbWlzZTxBcnJheTxSdW50aW1lJFByb3BlcnR5RGVzY3JpcHRvcj4+IHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24gJiYgdGhpcy5fc3RhdHVzID09PSBTVEFUVVNfQlJFQUspIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbi5nZXRQcm9wZXJ0aWVzKHJlbW90ZUlkKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2R1bW15Q29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuX2R1bW15Q29ubmVjdGlvbi5nZXRQcm9wZXJ0aWVzKHJlbW90ZUlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5fbm9Db25uZWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgY29ubmVjdGlvbiBvZiB0aGlzLl9jb25uZWN0aW9ucy5rZXlzKCkpIHtcbiAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgfVxuICAgIGlmICh0aGlzLl9kdW1teVJlcXVlc3RQcm9jZXNzKSB7XG4gICAgICB0aGlzLl9kdW1teVJlcXVlc3RQcm9jZXNzLmtpbGwoJ1NJR0tJTEwnKTtcbiAgICB9XG4gICAgdGhpcy5fZGlzcG9zZUNvbm5lY3RvcigpO1xuICB9XG5cbiAgX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbjogQ29ubmVjdGlvbik6IHZvaWQge1xuICAgIGNvbnN0IGluZm8gPSB0aGlzLl9jb25uZWN0aW9ucy5nZXQoY29ubmVjdGlvbik7XG4gICAgaW52YXJpYW50KGluZm8gIT0gbnVsbCk7XG4gICAgaW5mby5vblN0YXR1c0Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIGNvbm5lY3Rpb24uZGlzcG9zZSgpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25zLmRlbGV0ZShjb25uZWN0aW9uKTtcblxuICAgIGlmIChjb25uZWN0aW9uID09PSB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgdGhpcy5fZGlzYWJsZUNvbm5lY3Rpb24oKTtcbiAgICB9XG4gICAgdGhpcy5fY2hlY2tGb3JFbmQoKTtcbiAgfVxuXG4gIF9kaXNhYmxlQ29ubmVjdGlvbigpOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKCdNdXggZGlzYWJsaW5nIGNvbm5lY3Rpb24nKTtcbiAgICB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fc2V0U3RhdHVzKFNUQVRVU19SVU5OSU5HKTtcbiAgfVxuXG4gIF9kaXNwb3NlQ29ubmVjdG9yKCk6IHZvaWQge1xuICAgIC8vIEF2b2lkIHJlY3Vyc2lvbiB3aXRoIGNvbm5lY3RvcidzIG9uQ2xvc2UgZXZlbnQuXG4gICAgY29uc3QgY29ubmVjdG9yID0gdGhpcy5fY29ubmVjdG9yO1xuICAgIGlmIChjb25uZWN0b3IpIHtcbiAgICAgIHRoaXMuX2Nvbm5lY3RvciA9IG51bGw7XG4gICAgICBjb25uZWN0b3IuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9jaGVja0ZvckVuZCgpO1xuICB9XG5cbiAgX2NoZWNrRm9yRW5kKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb25uZWN0aW9ucy5zaXplID09PSAwICYmXG4gICAgICAgKCF0aGlzLl9jb25uZWN0b3IgfHwgZ2V0Q29uZmlnKCkuZW5kRGVidWdXaGVuTm9SZXF1ZXN0cykpIHtcbiAgICAgIHRoaXMuX3NldFN0YXR1cyhTVEFUVVNfRU5EKTtcbiAgICB9XG4gIH1cblxuICBfbm9Db25uZWN0aW9uRXJyb3IoKTogRXJyb3Ige1xuICAgIC8vIFRoaXMgaXMgYW4gaW5kaWNhdGlvbiBvZiBhIGJ1ZyBpbiB0aGUgc3RhdGUgbWFjaGluZS5cbiAgICAvLyAuLiB3ZSBhcmUgc2VlaW5nIGEgcmVxdWVzdCBpbiBhIHN0YXRlIHRoYXQgc2hvdWxkIG5vdCBnZW5lcmF0ZVxuICAgIC8vIHRoYXQgcmVxdWVzdC5cbiAgICByZXR1cm4gbmV3IEVycm9yKCdObyBjb25uZWN0aW9uJyk7XG4gIH1cblxuICBhc3luYyBfaGFuZGxlU2V0dXBGb3JDb25uZWN0aW9uKGNvbm5lY3Rpb246IENvbm5lY3Rpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBTdGRvdXQvZXJyIGNvbW1hbmRzLlxuICAgIGNvbnN0IHN0ZG91dFJlcXVlc3RTdWNjZWVkZWQgPSBhd2FpdCBjb25uZWN0aW9uLnNlbmRTdGRvdXRSZXF1ZXN0KCk7XG4gICAgaWYgKCFzdGRvdXRSZXF1ZXN0U3VjY2VlZGVkKSB7XG4gICAgICBsb2dnZXIubG9nRXJyb3IoJ0hIVk0gcmV0dXJuZWQgZmFpbHVyZSBmb3IgYSBzdGRvdXQgcmVxdWVzdCcpO1xuICAgICAgdGhpcy5fY2xpZW50Q2FsbGJhY2suc2VuZFVzZXJNZXNzYWdlKCdvdXRwdXRXaW5kb3cnLCB7XG4gICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgICB0ZXh0OiAnSEhWTSBmYWlsZWQgdG8gcmVkaXJlY3Qgc3Rkb3V0LCBzbyBubyBvdXRwdXQgd2lsbCBiZSBzZW50IHRvIHRoZSBvdXRwdXQgd2luZG93LicsXG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gVE9ETzogU3RkZXJyIHJlZGlyZWN0aW9uIGlzIG5vdCBpbXBsZW1lbnRlZCBpbiBISFZNIHNvIHdlIHdvbid0IGNoZWNrIHRoaXMgcmV0dXJuIHZhbHVlLlxuICAgIGF3YWl0IGNvbm5lY3Rpb24uc2VuZFN0ZGVyclJlcXVlc3QoKTtcblxuICAgIC8vIFNldCBmZWF0dXJlcy5cbiAgICBjb25zdCBzZXRGZWF0dXJlU3VjY2VlZGVkID0gYXdhaXQgY29ubmVjdGlvbi5zZXRGZWF0dXJlKCdtYXhfZGVwdGgnLCAnNScpO1xuICAgIGlmICghc2V0RmVhdHVyZVN1Y2NlZWRlZCkge1xuICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdISFZNIHJldHVybmVkIGZhaWx1cmUgZm9yIHNldHRpbmcgZmVhdHVyZSBtYXhfZGVwdGgnKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==