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

var _helpers = require('./helpers');

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
    this._launchedScriptProcess = null;
  }

  _createClass(ConnectionMultiplexer, [{
    key: 'onStatus',
    value: function onStatus(callback) {
      return require('../../nuclide-commons').event.attachEvent(this._connectionStatusEmitter, CONNECTION_MUX_STATUS_EVENT, callback);
    }
  }, {
    key: 'listen',
    value: function listen() {
      var _this = this;

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

      var _getConfig = (0, _config.getConfig)();

      var launchScriptPath = _getConfig.launchScriptPath;

      if (launchScriptPath != null) {
        this._launchedScriptProcess = (0, _helpers.launchScriptToDebug)(launchScriptPath, function (text) {
          return _this._clientCallback.sendUserMessage('outputWindow', { level: 'info', text: text });
        });
      }
    }
  }, {
    key: '_handleDummyConnection',
    value: _asyncToGenerator(function* (socket) {
      var _this2 = this;

      _utils2['default'].log('ConnectionMultiplexer successfully got dummy connection.');
      var dummyConnection = new _Connection.Connection(socket);
      yield this._handleSetupForConnection(dummyConnection);

      // Continue from loader breakpoint to hit xdebug_break()
      // which will load whole www repo for evaluation if possible.
      yield dummyConnection.sendContinuationCommand(_DbgpSocket.COMMAND_RUN);
      dummyConnection.onStatus(function (status, message) {
        switch (status) {
          case _DbgpSocket.STATUS_STDOUT:
            _this2._sendOutput(message, 'log');
            break;
          case _DbgpSocket.STATUS_STDERR:
            _this2._sendOutput(message, 'info');
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
      var _this3 = this;

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
          _this3._breakpointStore.addConnection(connection);
          yield _this3._handleSetupForConnection(connection);

          var info = {
            connection: connection,
            onStatusDisposable: connection.onStatus(function (status) {
              for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }

              _this3._connectionOnStatus.apply(_this3, [connection, status].concat(args));
            }),
            status: _DbgpSocket.STATUS_STARTING
          };
          _this3._connections.set(connection, info);

          var status = undefined;
          try {
            status = yield connection.getStatus();
          } catch (e) {
            _utils2['default'].logError('Error getting initial connection status: ' + e.message);
            status = _DbgpSocket.STATUS_ERROR;
          }
          _this3._connectionOnStatus(connection, status);
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
    value: _asyncToGenerator(function* () {
      for (var _connection of this._connections.keys()) {
        this._removeConnection(_connection);
      }
      if (this._launchedScriptProcess != null && this._status === _DbgpSocket.STATUS_END) {
        yield this._launchedScriptProcess;
      }
      if (this._dummyRequestProcess) {
        this._dummyRequestProcess.kill('SIGKILL');
      }
      this._disposeConnector();
    })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25NdWx0aXBsZXhlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFXbUIsU0FBUzs7Ozt1QkFDTSxXQUFXOzswQkFDcEIsY0FBYzs7c0JBQ2YsVUFBVTs7K0JBTTNCLG1CQUFtQjs7MEJBaUJuQixjQUFjOztzQkFDTSxRQUFROztzQkFDYixRQUFROzs7OzhCQUNELGtCQUFrQjs7ZUFoQnJCLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQzs7SUFBL0MsZUFBZSxZQUFmLGVBQWU7O2dCQUNFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQzs7SUFBM0MsYUFBYSxhQUFiLGFBQWE7O0FBaUJwQixJQUFNLDJCQUEyQixHQUFHLHVCQUF1QixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWlEL0MscUJBQXFCO0FBWXJCLFdBWkEscUJBQXFCLENBWXBCLGNBQThCLEVBQUU7MEJBWmpDLHFCQUFxQjs7QUFhOUIsUUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7QUFDdEMsUUFBSSxDQUFDLE9BQU8sOEJBQWtCLENBQUM7QUFDL0IsUUFBSSxDQUFDLHdCQUF3QixHQUFHLDBCQUFrQixDQUFDO0FBQ25ELFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7QUFDL0IsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM3QixRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDOUIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsUUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztBQUNqQyxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztBQUM5QyxRQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO0dBQ3BDOztlQXZCVSxxQkFBcUI7O1dBeUJ4QixrQkFBQyxRQUFtQyxFQUFlO0FBQ3pELGFBQU8sT0FB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d0JBQVcsQ0FBQyxzQkFBc0IsQ0FBQSxBQUFDLEVBQUU7QUFDM0QsWUFBSSxDQUFDLFVBQVUsd0JBQVksQ0FBQztPQUM3QjtLQUNGOzs7V0FFaUIsOEJBQVU7Ozs7QUFJMUIsYUFBTyxJQUFJLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUNuQzs7OzZCQUU4QixXQUFDLFVBQXNCLEVBQWlCOztBQUVyRSxVQUFNLHNCQUFzQixHQUFHLE1BQU0sVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDcEUsVUFBSSxDQUFDLHNCQUFzQixFQUFFO0FBQzNCLDJCQUFPLFFBQVEsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0FBQzlELFlBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRTtBQUNuRCxlQUFLLEVBQUUsT0FBTztBQUNkLGNBQUksRUFBRSxpRkFBaUY7U0FDeEYsQ0FBQyxDQUFDO09BQ0o7O0FBRUQsWUFBTSxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzs7O0FBR3JDLFVBQU0sbUJBQW1CLEdBQUcsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMxRSxVQUFJLENBQUMsbUJBQW1CLEVBQUU7QUFDeEIsMkJBQU8sUUFBUSxDQUFDLHFEQUFxRCxDQUFDLENBQUM7T0FDeEU7S0FDRjs7O1NBeFlVLHFCQUFxQiIsImZpbGUiOiJDb25uZWN0aW9uTXVsdGlwbGV4ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtsYXVuY2hTY3JpcHRUb0RlYnVnfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHtDb25uZWN0aW9ufSBmcm9tICcuL0Nvbm5lY3Rpb24nO1xuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7XG4gIGlzRHVtbXlDb25uZWN0aW9uLFxuICBzZW5kRHVtbXlSZXF1ZXN0LFxuICBpc0NvcnJlY3RDb25uZWN0aW9uLFxuICBmYWlsQ29ubmVjdGlvbixcbn0gZnJvbSAnLi9Db25uZWN0aW9uVXRpbHMnO1xuXG5pbXBvcnQgdHlwZSB7U29ja2V0fSBmcm9tICduZXQnO1xuaW1wb3J0IHR5cGUge0V4Y2VwdGlvblN0YXRlfSBmcm9tICcuL0JyZWFrcG9pbnRTdG9yZSc7XG5jb25zdCB7QnJlYWtwb2ludFN0b3JlfSA9IHJlcXVpcmUoJy4vQnJlYWtwb2ludFN0b3JlJyk7XG5jb25zdCB7RGJncENvbm5lY3Rvcn0gPSByZXF1aXJlKCcuL0RiZ3BDb25uZWN0b3InKTtcbmltcG9ydCB7XG4gIFNUQVRVU19TVEFSVElORyxcbiAgU1RBVFVTX1NUT1BQSU5HLFxuICBTVEFUVVNfU1RPUFBFRCxcbiAgU1RBVFVTX1JVTk5JTkcsXG4gIFNUQVRVU19CUkVBSyxcbiAgU1RBVFVTX0VSUk9SLFxuICBTVEFUVVNfRU5ELFxuICBTVEFUVVNfU1RET1VULFxuICBTVEFUVVNfU1RERVJSLFxuICBDT01NQU5EX1JVTixcbn0gZnJvbSAnLi9EYmdwU29ja2V0JztcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDbGllbnRDYWxsYmFja30gZnJvbSAnLi9DbGllbnRDYWxsYmFjayc7XG5cbmNvbnN0IENPTk5FQ1RJT05fTVVYX1NUQVRVU19FVkVOVCA9ICdjb25uZWN0aW9uLW11eC1zdGF0dXMnO1xuXG50eXBlIENvbm5lY3Rpb25JbmZvID0ge1xuICBjb25uZWN0aW9uOiBDb25uZWN0aW9uO1xuICBvblN0YXR1c0Rpc3Bvc2FibGU6IElEaXNwb3NhYmxlO1xuICBzdGF0dXM6IHN0cmluZztcbn07XG5cbnR5cGUgRGJncEVycm9yID0ge1xuICAkOiB7XG4gICAgY29kZTogbnVtYmVyO1xuICB9O1xuICBtZXNzYWdlOiBBcnJheTxzdHJpbmc+O1xufTtcblxudHlwZSBFdmFsdWF0aW9uRmFpbHVyZVJlc3VsdCA9IHtcbiAgZXJyb3I6IERiZ3BFcnJvcjtcbiAgd2FzVGhyb3duOiBib29sZWFuO1xufTtcblxuLy8gVGhlIENvbm5lY3Rpb25NdWx0aXBsZXhlciBtYWtlcyBtdWx0aXBsZSBkZWJ1Z2dlciBjb25uZWN0aW9ucyBhcHBlYXIgdG8gYmVcbi8vIGEgc2luZ2xlIGNvbm5lY3Rpb24gdG8gdGhlIGRlYnVnZ2VyIFVJLlxuLy9cbi8vIFRoZSBpbml0aWFsaXphdGlvbiBzZXF1ZW5jZSBvY2N1cnMgYXMgZm9sbG93czpcbi8vICAtIHRoZSBjb25zdHJ1Y3RvciBpcyBjYWxsZWRcbi8vICAtIG9uU3RhdHVzIGlzIGNhbGxlZCB0byBob29rIHVwIGV2ZW50IGhhbmRsZXJzXG4vLyAgLSBpbml0aWFsIGJyZWFrcG9pbnRzIG1heSBiZSBhZGRlZCBoZXJlLlxuLy8gIC0gbGlzdGVuKCkgaXMgY2FsbGVkIGluZGljYXRpbmcgdGhhdCBhbGwgaW5pdGlhbCBCcmVha3BvaW50cyBoYXZlIGJlZW4gc2V0XG4vLyAgICBhbmQgZGVidWdnaW5nIG1heSBjb21tZW5jZS5cbi8vXG4vLyBPbmNlIGluaXRpYWxpemVkLCB0aGUgQ29ubmVjdGlvbk11bHRpcGxleGVyIGNhbiBiZSBpbiBvbmUgb2YgMyBtYWluIHN0YXRlczpcbi8vIHJ1bm5pbmcsIGJyZWFrLWRpc2FibGVkLCBhbmQgYnJlYWstZW5hYmxlZC5cbi8vXG4vLyBSdW5uaW5nIHN0YXRlIG1lYW5zIHRoYXQgYWxsIGNvbm5lY3Rpb25zIGFyZSBpbiB0aGUgcnVubmluZyBzdGF0ZS5cbi8vIE5vdGUgdGhhdCBydW5uaW5nIGluY2x1ZGVzIHRoZSBzdGF0ZSB3aGVyZSB0aGVyZSBhcmUgbm8gY29ubmVjdGlvbnMuXG4vL1xuLy8gQnJlYWstZGlzYWJsZWQgc3RhdGUgaGFzIGF0IGxlYXN0IG9uZSBjb25uZWN0aW9uIGluIGJyZWFrIHN0YXRlLlxuLy8gQW5kIG5vbmUgb2YgdGhlIGNvbm5lY3Rpb25zIGlzIGVuYWJsZWQuIE9uY2UgaW4gYnJlYWstZGlzYWJsZWQgc3RhdGUsXG4vLyB0aGUgY29ubmVjdGlvbiBtdXggd2lsbCBpbW1lZGlhdGVseSBlbmFibGUgb25lIG9mIHRoZSBicm9rZW4gY29ubmVjdGlvbnNcbi8vIGFuZCBtb3ZlIHRvIGJyZWFrLWVuYWJsZWQgc3RhdGUuXG4vL1xuLy8gQnJlYWstZW5hYmxlZCBzdGF0ZSBoYXMgYSBzaW5nbGUgY29ubmVjdGlvbiB3aGljaCBpcyBpbiBicmVhay1lbmFibGVkXG4vLyBzdGF0ZS4gVGhlcmUgbWF5IGJlIGNvbm5lY3Rpb25zIGluIGJyZWFrLWRpc2FibGVkIHN0YXRlIGFuZCBydW5uaW5nIHN0YXRlXG4vLyBhcyB3ZWxsLiBUaGUgZW5hYmxlZCBjb25uZWN0aW9uIHdpbGwgYmUgc2hvd24gaW4gdGhlIGRlYnVnZ2VyIFVJIGFuZCBhbGxcbi8vIGNvbW1hbmRzIHdpbGwgZ28gdG8gdGhlIGVuYWJsZWQgY29ubmVjdGlvbi5cbi8vXG4vLyBUaGUgQ29ubmVjdGlvbk11bHRpcGxleGVyIHdpbGwgY2xvc2Ugb25seSBpZiB0aGVyZSBhcmUgbm8gY29ubmVjdGlvbnNcbi8vIGFuZCBpZiB0aGUgRGJncENvbm5lY3RvciBpcyBjbG9zZWQuIFRoZSBEYmdwQ29ubmVjdG9yIHdpbGwgbGlrZWx5IG9ubHlcbi8vIGNsb3NlIGlmIEhIVk0gY3Jhc2hlcyBvciBpcyBzdG9wcGVkLlxuZXhwb3J0IGNsYXNzIENvbm5lY3Rpb25NdWx0aXBsZXhlciB7XG4gIF9jbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2s7XG4gIF9icmVha3BvaW50U3RvcmU6IEJyZWFrcG9pbnRTdG9yZTtcbiAgX2Nvbm5lY3Rpb25TdGF0dXNFbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF9zdGF0dXM6IHN0cmluZztcbiAgX2VuYWJsZWRDb25uZWN0aW9uOiA/Q29ubmVjdGlvbjtcbiAgX2R1bW15Q29ubmVjdGlvbjogP0Nvbm5lY3Rpb247XG4gIF9jb25uZWN0aW9uczogTWFwPENvbm5lY3Rpb24sIENvbm5lY3Rpb25JbmZvPjtcbiAgX2Nvbm5lY3RvcjogP0RiZ3BDb25uZWN0b3I7XG4gIF9kdW1teVJlcXVlc3RQcm9jZXNzOiA/Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XG4gIF9sYXVuY2hlZFNjcmlwdFByb2Nlc3M6ID9Qcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKGNsaWVudENhbGxiYWNrOiBDbGllbnRDYWxsYmFjaykge1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrID0gY2xpZW50Q2FsbGJhY2s7XG4gICAgdGhpcy5fc3RhdHVzID0gU1RBVFVTX1NUQVJUSU5HO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25TdGF0dXNFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9kdW1teUNvbm5lY3Rpb24gPSBudWxsO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25zID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IG51bGw7XG4gICAgdGhpcy5fZHVtbXlSZXF1ZXN0UHJvY2VzcyA9IG51bGw7XG4gICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlID0gbmV3IEJyZWFrcG9pbnRTdG9yZSgpO1xuICAgIHRoaXMuX2xhdW5jaGVkU2NyaXB0UHJvY2VzcyA9IG51bGw7XG4gIH1cblxuICBvblN0YXR1cyhjYWxsYmFjazogKHN0YXR1czogc3RyaW5nKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJykuZXZlbnQuYXR0YWNoRXZlbnQodGhpcy5fY29ubmVjdGlvblN0YXR1c0VtaXR0ZXIsXG4gICAgICBDT05ORUNUSU9OX01VWF9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGxpc3RlbigpOiB2b2lkIHtcbiAgICBjb25zdCBjb25uZWN0b3IgPSBuZXcgRGJncENvbm5lY3RvcigpO1xuICAgIGNvbm5lY3Rvci5vbkF0dGFjaCh0aGlzLl9vbkF0dGFjaC5iaW5kKHRoaXMpKTtcbiAgICBjb25uZWN0b3Iub25DbG9zZSh0aGlzLl9kaXNwb3NlQ29ubmVjdG9yLmJpbmQodGhpcykpO1xuICAgIGNvbm5lY3Rvci5vbkVycm9yKHRoaXMuX2hhbmRsZUF0dGFjaEVycm9yLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2Nvbm5lY3RvciA9IGNvbm5lY3RvcjtcbiAgICB0aGlzLl9zdGF0dXMgPSBTVEFUVVNfUlVOTklORztcblxuICAgIGNvbm5lY3Rvci5saXN0ZW4oKTtcblxuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnY29uc29sZScsIHtcbiAgICAgIGxldmVsOiAnd2FybmluZycsXG4gICAgICB0ZXh0OiAnUHJlLWxvYWRpbmcsIHBsZWFzZSB3YWl0Li4uJyxcbiAgICB9KTtcbiAgICB0aGlzLl9kdW1teVJlcXVlc3RQcm9jZXNzID0gc2VuZER1bW15UmVxdWVzdCgpO1xuXG4gICAgY29uc3Qge2xhdW5jaFNjcmlwdFBhdGh9ID0gZ2V0Q29uZmlnKCk7XG4gICAgaWYgKGxhdW5jaFNjcmlwdFBhdGggIT0gbnVsbCkge1xuICAgICAgdGhpcy5fbGF1bmNoZWRTY3JpcHRQcm9jZXNzID0gbGF1bmNoU2NyaXB0VG9EZWJ1ZyhcbiAgICAgICAgbGF1bmNoU2NyaXB0UGF0aCxcbiAgICAgICAgdGV4dCA9PiB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck1lc3NhZ2UoJ291dHB1dFdpbmRvdycsIHtsZXZlbDogJ2luZm8nLCB0ZXh0fSksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9oYW5kbGVEdW1teUNvbm5lY3Rpb24oc29ja2V0OiBTb2NrZXQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2dnZXIubG9nKCdDb25uZWN0aW9uTXVsdGlwbGV4ZXIgc3VjY2Vzc2Z1bGx5IGdvdCBkdW1teSBjb25uZWN0aW9uLicpO1xuICAgIGNvbnN0IGR1bW15Q29ubmVjdGlvbiA9IG5ldyBDb25uZWN0aW9uKHNvY2tldCk7XG4gICAgYXdhaXQgdGhpcy5faGFuZGxlU2V0dXBGb3JDb25uZWN0aW9uKGR1bW15Q29ubmVjdGlvbik7XG5cbiAgICAvLyBDb250aW51ZSBmcm9tIGxvYWRlciBicmVha3BvaW50IHRvIGhpdCB4ZGVidWdfYnJlYWsoKVxuICAgIC8vIHdoaWNoIHdpbGwgbG9hZCB3aG9sZSB3d3cgcmVwbyBmb3IgZXZhbHVhdGlvbiBpZiBwb3NzaWJsZS5cbiAgICBhd2FpdCBkdW1teUNvbm5lY3Rpb24uc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9SVU4pO1xuICAgIGR1bW15Q29ubmVjdGlvbi5vblN0YXR1cygoc3RhdHVzLCBtZXNzYWdlKSA9PiB7XG4gICAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgICBjYXNlIFNUQVRVU19TVERPVVQ6XG4gICAgICAgICAgdGhpcy5fc2VuZE91dHB1dChtZXNzYWdlLCAnbG9nJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU1RBVFVTX1NUREVSUjpcbiAgICAgICAgICB0aGlzLl9zZW5kT3V0cHV0KG1lc3NhZ2UsICdpbmZvJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5fZHVtbXlDb25uZWN0aW9uID0gZHVtbXlDb25uZWN0aW9uO1xuXG4gICAgdGhpcy5fY2xpZW50Q2FsbGJhY2suc2VuZFVzZXJNZXNzYWdlKCdjb25zb2xlJywge1xuICAgICAgbGV2ZWw6ICd3YXJuaW5nJyxcbiAgICAgIHRleHQ6ICdQcmUtbG9hZGluZyBpcyBkb25lLiBZb3UgY2FuIHVzZSBjb25zb2xlIHdpbmRvdyBub3cuJyxcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEZvciB0ZXN0aW5nIHB1cnBvc2UuXG4gIGdldER1bW15Q29ubmVjdGlvbigpOiA/Q29ubmVjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2R1bW15Q29ubmVjdGlvbjtcbiAgfVxuXG4gIGFzeW5jIF9vbkF0dGFjaChwYXJhbXM6IHtzb2NrZXQ6IFNvY2tldDsgbWVzc2FnZTogT2JqZWN0fSk6IFByb21pc2Uge1xuICAgIGNvbnN0IHtzb2NrZXQsIG1lc3NhZ2V9ID0gcGFyYW1zO1xuICAgIGlmICghaXNDb3JyZWN0Q29ubmVjdGlvbihtZXNzYWdlKSkge1xuICAgICAgZmFpbENvbm5lY3Rpb24oc29ja2V0LCAnRGlzY2FyZGluZyBjb25uZWN0aW9uICcgKyBKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpc0R1bW15Q29ubmVjdGlvbihtZXNzYWdlKSkge1xuICAgICAgYXdhaXQgdGhpcy5faGFuZGxlRHVtbXlDb25uZWN0aW9uKHNvY2tldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgQ29ubmVjdGlvbihzb2NrZXQpO1xuICAgICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlLmFkZENvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgICBhd2FpdCB0aGlzLl9oYW5kbGVTZXR1cEZvckNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG5cbiAgICAgIGNvbnN0IGluZm8gPSB7XG4gICAgICAgIGNvbm5lY3Rpb24sXG4gICAgICAgIG9uU3RhdHVzRGlzcG9zYWJsZTogY29ubmVjdGlvbi5vblN0YXR1cygoc3RhdHVzLCAuLi5hcmdzKSA9PiB7XG4gICAgICAgICAgdGhpcy5fY29ubmVjdGlvbk9uU3RhdHVzKGNvbm5lY3Rpb24sIHN0YXR1cywgLi4uYXJncyk7XG4gICAgICAgIH0pLFxuICAgICAgICBzdGF0dXM6IFNUQVRVU19TVEFSVElORyxcbiAgICAgIH07XG4gICAgICB0aGlzLl9jb25uZWN0aW9ucy5zZXQoY29ubmVjdGlvbiwgaW5mbyk7XG5cbiAgICAgIGxldCBzdGF0dXM7XG4gICAgICB0cnkge1xuICAgICAgICBzdGF0dXMgPSBhd2FpdCBjb25uZWN0aW9uLmdldFN0YXR1cygpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsb2dnZXIubG9nRXJyb3IoJ0Vycm9yIGdldHRpbmcgaW5pdGlhbCBjb25uZWN0aW9uIHN0YXR1czogJyArIGUubWVzc2FnZSk7XG4gICAgICAgIHN0YXR1cyA9IFNUQVRVU19FUlJPUjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb25PblN0YXR1cyhjb25uZWN0aW9uLCBzdGF0dXMpO1xuICAgIH1cbiAgfVxuXG4gIF9jb25uZWN0aW9uT25TdGF0dXMoY29ubmVjdGlvbjogQ29ubmVjdGlvbiwgc3RhdHVzOiBzdHJpbmcsIC4uLmFyZ3M6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKGBNdXggZ290IHN0YXR1czogJHtzdGF0dXN9IG9uIGNvbm5lY3Rpb24gJHtjb25uZWN0aW9uLmdldElkKCl9YCk7XG4gICAgY29uc3QgY29ubmVjdGlvbkluZm8gPSB0aGlzLl9jb25uZWN0aW9ucy5nZXQoY29ubmVjdGlvbik7XG4gICAgaW52YXJpYW50KGNvbm5lY3Rpb25JbmZvICE9IG51bGwpO1xuXG4gICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgIGNhc2UgU1RBVFVTX1NUQVJUSU5HOlxuICAgICAgICAvLyBTdGFydGluZyBzdGF0dXMgaGFzIG5vIHN0YWNrLlxuICAgICAgICAvLyBzdGVwIGJlZm9yZSByZXBvcnRpbmcgaW5pdGlhbCBzdGF0dXMgdG8gZ2V0IHRvIHRoZSBmaXJzdCBpbnN0cnVjdGlvbi5cbiAgICAgICAgLy8gVE9ETzogVXNlIGxvYWRlciBicmVha3BvaW50IGNvbmZpZ3VyYXRpb24gdG8gY2hvb3NlIGJldHdlZW4gc3RlcC9ydW4uXG4gICAgICAgIGNvbm5lY3Rpb25JbmZvLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgY29ubmVjdGlvbi5zZW5kQ29udGludWF0aW9uQ29tbWFuZChDT01NQU5EX1JVTik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIGNhc2UgU1RBVFVTX1NUT1BQSU5HOlxuICAgICAgICAvLyBUT0RPOiBNYXkgd2FudCB0byBlbmFibGUgcG9zdC1tb3J0ZW0gZmVhdHVyZXM/XG4gICAgICAgIGNvbm5lY3Rpb25JbmZvLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgY29ubmVjdGlvbi5zZW5kQ29udGludWF0aW9uQ29tbWFuZChDT01NQU5EX1JVTik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIGNhc2UgU1RBVFVTX1JVTk5JTkc6XG4gICAgICAgIGNvbm5lY3Rpb25JbmZvLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgaWYgKGNvbm5lY3Rpb24gPT09IHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uKSB7XG4gICAgICAgICAgdGhpcy5fZGlzYWJsZUNvbm5lY3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX0JSRUFLOlxuICAgICAgICBjb25uZWN0aW9uSW5mby5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIGlmIChjb25uZWN0aW9uID09PSB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgICAgIC8vIFRoaXMgY2FuIGhhcHBlbiB3aGVuIHdlIHN0ZXAuXG4gICAgICAgICAgbG9nZ2VyLmxvZygnTXV4IGJyZWFrIG9uIGVuYWJsZWQgY29ubmVjdGlvbicpO1xuICAgICAgICAgIHRoaXMuX2VtaXRTdGF0dXMoU1RBVFVTX0JSRUFLKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFNUQVRVU19FUlJPUjpcbiAgICAgICAgdGhpcy5fY2xpZW50Q2FsbGJhY2suc2VuZFVzZXJNZXNzYWdlKCdub3RpZmljYXRpb24nLCB7XG4gICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICBtZXNzYWdlOiAnVGhlIGRlYnVnZ2VyIGVuY291bnRlcmVkIGEgcHJvYmxlbSBhbmQgdGhlIGNvbm5lY3Rpb24gaGFkIHRvIGJlIHNodXQgZG93bi4nLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fcmVtb3ZlQ29ubmVjdGlvbihjb25uZWN0aW9uKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFNUQVRVU19TVE9QUEVEOlxuICAgICAgY2FzZSBTVEFUVVNfRU5EOlxuICAgICAgICBjb25uZWN0aW9uSW5mby5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTVEFUVVNfU1RET1VUOlxuICAgICAgICB0aGlzLl9zZW5kT3V0cHV0KGFyZ3NbMF0sICdsb2cnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFNUQVRVU19TVERFUlI6XG4gICAgICAgIHRoaXMuX3NlbmRPdXRwdXQoYXJnc1swXSwgJ2luZm8nKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlU3RhdHVzKCk7XG4gIH1cblxuICBfc2VuZE91dHB1dChtZXNzYWdlOiBzdHJpbmcsIGxldmVsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck1lc3NhZ2UoJ291dHB1dFdpbmRvdycsIHtcbiAgICAgIGxldmVsOiBsZXZlbCxcbiAgICAgIHRleHQ6IG1lc3NhZ2UsXG4gICAgfSk7XG4gIH1cblxuICBfdXBkYXRlU3RhdHVzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdGF0dXMgPT09IFNUQVRVU19FTkQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fc3RhdHVzID09PSBTVEFUVVNfQlJFQUspIHtcbiAgICAgIGxvZ2dlci5sb2coJ011eCBhbHJlYWR5IGluIGJyZWFrIHN0YXR1cycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIG5vdyBjaGVjayBpZiB3ZSBjYW4gbW92ZSBmcm9tIHJ1bm5pbmcgdG8gYnJlYWsuLi5cbiAgICBmb3IgKGNvbnN0IGNvbm5lY3Rpb25JbmZvIG9mIHRoaXMuX2Nvbm5lY3Rpb25zLnZhbHVlcygpKSB7XG4gICAgICBpZiAoY29ubmVjdGlvbkluZm8uc3RhdHVzID09PSBTVEFUVVNfQlJFQUspIHtcbiAgICAgICAgdGhpcy5fZW5hYmxlQ29ubmVjdGlvbihjb25uZWN0aW9uSW5mby5jb25uZWN0aW9uKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2VuYWJsZUNvbm5lY3Rpb24oY29ubmVjdGlvbjogQ29ubmVjdGlvbik6IHZvaWQge1xuICAgIGxvZ2dlci5sb2coJ011eCBlbmFibGluZyBjb25uZWN0aW9uJyk7XG4gICAgdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24gPSBjb25uZWN0aW9uO1xuICAgIHRoaXMuX3NldFN0YXR1cyhTVEFUVVNfQlJFQUspO1xuICB9XG5cbiAgX3NldFN0YXR1cyhzdGF0dXM6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChzdGF0dXMgIT09IHRoaXMuX3N0YXR1cykge1xuICAgICAgdGhpcy5fc3RhdHVzID0gc3RhdHVzO1xuICAgICAgdGhpcy5fZW1pdFN0YXR1cyhzdGF0dXMpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVBdHRhY2hFcnJvcihlcnJvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fY2xpZW50Q2FsbGJhY2suc2VuZFVzZXJNZXNzYWdlKCdub3RpZmljYXRpb24nLCB7XG4gICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgbWVzc2FnZTogZXJyb3IsXG4gICAgfSk7XG4gIH1cblxuICBfZW1pdFN0YXR1cyhzdGF0dXM6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25TdGF0dXNFbWl0dGVyLmVtaXQoQ09OTkVDVElPTl9NVVhfU1RBVFVTX0VWRU5ULCBzdGF0dXMpO1xuICB9XG5cbiAgYXN5bmMgcnVudGltZUV2YWx1YXRlKGV4cHJlc3Npb246IHN0cmluZyk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgbG9nZ2VyLmxvZyhgcnVudGltZUV2YWx1YXRlKCkgb24gZHVtbXkgY29ubmVjdGlvbiBmb3I6ICR7ZXhwcmVzc2lvbn1gKTtcbiAgICBpZiAodGhpcy5fZHVtbXlDb25uZWN0aW9uICE9IG51bGwpIHtcbiAgICAgIC8vIEdsb2JhbCBydW50aW1lIGV2YWx1YXRpb24gb24gZHVtbXkgY29ubmVjdGlvbiBkb2VzIG5vdCBjYXJlIGFib3V0XG4gICAgICAvLyB3aGljaCBmcmFtZSBpdCBpcyBiZWluZyBldmFsdWF0ZWQgb24gc28gY2hvb3NlIHRvcCBmcmFtZSBoZXJlLlxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fZHVtbXlDb25uZWN0aW9uLnJ1bnRpbWVFdmFsdWF0ZSgwLCBleHByZXNzaW9uKTtcbiAgICAgIHRoaXMuX3JlcG9ydEV2YWx1YXRpb25GYWlsdXJlSWZOZWVkZWQoZXhwcmVzc2lvbiwgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IHRoaXMuX25vQ29ubmVjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZXZhbHVhdGVPbkNhbGxGcmFtZShmcmFtZUluZGV4OiBudW1iZXIsIGV4cHJlc3Npb246IHN0cmluZyk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgaWYgKHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbi5ldmFsdWF0ZU9uQ2FsbEZyYW1lKGZyYW1lSW5kZXgsIGV4cHJlc3Npb24pO1xuICAgICAgdGhpcy5fcmVwb3J0RXZhbHVhdGlvbkZhaWx1cmVJZk5lZWRlZChleHByZXNzaW9uLCByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5fbm9Db25uZWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICBfcmVwb3J0RXZhbHVhdGlvbkZhaWx1cmVJZk5lZWRlZChleHByZXNzaW9uOiBzdHJpbmcsIHJlc3VsdDogRXZhbHVhdGlvbkZhaWx1cmVSZXN1bHQpOiB2b2lkIHtcbiAgICBpZiAocmVzdWx0Lndhc1Rocm93bikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9XG4gICAgICAgIGBGYWlsZWQgdG8gZXZhbHVhdGUgXCIke2V4cHJlc3Npb259XCI6ICgke3Jlc3VsdC5lcnJvci4kLmNvZGV9KSAke3Jlc3VsdC5lcnJvci5tZXNzYWdlWzBdfWA7XG4gICAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck1lc3NhZ2UoJ2NvbnNvbGUnLCB7XG4gICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgICB0ZXh0OiBtZXNzYWdlLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgc2V0UGF1c2VPbkV4Y2VwdGlvbnMoc3RhdGU6IEV4Y2VwdGlvblN0YXRlKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5zZXRQYXVzZU9uRXhjZXB0aW9ucyhzdGF0ZSk7XG4gIH1cblxuICBzZXRCcmVha3BvaW50KGZpbGVuYW1lOiBzdHJpbmcsIGxpbmVOdW1iZXI6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5zZXRCcmVha3BvaW50KGZpbGVuYW1lLCBsaW5lTnVtYmVyKTtcbiAgfVxuXG4gIHJlbW92ZUJyZWFrcG9pbnQoYnJlYWtwb2ludElkOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gdGhpcy5fYnJlYWtwb2ludFN0b3JlLnJlbW92ZUJyZWFrcG9pbnQoYnJlYWtwb2ludElkKTtcbiAgfVxuXG4gIGdldFN0YWNrRnJhbWVzKCk6IFByb21pc2U8e3N0YWNrOiBPYmplY3R9PiB7XG4gICAgaWYgKHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24uZ2V0U3RhY2tGcmFtZXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhpcyBvY2N1cnMgb24gc3RhcnR1cCB3aXRoIHRoZSBsb2FkZXIgYnJlYWtwb2ludC5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe3N0YWNrOiB7fX0pO1xuICAgIH1cbiAgfVxuXG4gIGdldFNjb3Blc0ZvckZyYW1lKGZyYW1lSW5kZXg6IG51bWJlcik6IFByb21pc2U8QXJyYXk8RGVidWdnZXIkU2NvcGU+PiB7XG4gICAgaWYgKHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24uZ2V0U2NvcGVzRm9yRnJhbWUoZnJhbWVJbmRleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IHRoaXMuX25vQ29ubmVjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0U3RhdHVzKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXR1cztcbiAgfVxuXG4gIHNlbmRDb250aW51YXRpb25Db21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24uc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoY29tbWFuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IHRoaXMuX25vQ29ubmVjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgc2VuZEJyZWFrQ29tbWFuZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbi5zZW5kQnJlYWtDb21tYW5kKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIGdldFByb3BlcnRpZXMocmVtb3RlSWQ6IFJ1bnRpbWUkUmVtb3RlT2JqZWN0SWQpOiBQcm9taXNlPEFycmF5PFJ1bnRpbWUkUHJvcGVydHlEZXNjcmlwdG9yPj4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbiAmJiB0aGlzLl9zdGF0dXMgPT09IFNUQVRVU19CUkVBSykge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLmdldFByb3BlcnRpZXMocmVtb3RlSWQpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fZHVtbXlDb25uZWN0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZHVtbXlDb25uZWN0aW9uLmdldFByb3BlcnRpZXMocmVtb3RlSWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLl9ub0Nvbm5lY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgZm9yIChjb25zdCBjb25uZWN0aW9uIG9mIHRoaXMuX2Nvbm5lY3Rpb25zLmtleXMoKSkge1xuICAgICAgdGhpcy5fcmVtb3ZlQ29ubmVjdGlvbihjb25uZWN0aW9uKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xhdW5jaGVkU2NyaXB0UHJvY2VzcyAhPSBudWxsICYmIHRoaXMuX3N0YXR1cyA9PT0gU1RBVFVTX0VORCkge1xuICAgICAgYXdhaXQgdGhpcy5fbGF1bmNoZWRTY3JpcHRQcm9jZXNzO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZHVtbXlSZXF1ZXN0UHJvY2Vzcykge1xuICAgICAgdGhpcy5fZHVtbXlSZXF1ZXN0UHJvY2Vzcy5raWxsKCdTSUdLSUxMJyk7XG4gICAgfVxuICAgIHRoaXMuX2Rpc3Bvc2VDb25uZWN0b3IoKTtcbiAgfVxuXG4gIF9yZW1vdmVDb25uZWN0aW9uKGNvbm5lY3Rpb246IENvbm5lY3Rpb24pOiB2b2lkIHtcbiAgICBjb25zdCBpbmZvID0gdGhpcy5fY29ubmVjdGlvbnMuZ2V0KGNvbm5lY3Rpb24pO1xuICAgIGludmFyaWFudChpbmZvICE9IG51bGwpO1xuICAgIGluZm8ub25TdGF0dXNEaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICBjb25uZWN0aW9uLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9jb25uZWN0aW9ucy5kZWxldGUoY29ubmVjdGlvbik7XG5cbiAgICBpZiAoY29ubmVjdGlvbiA9PT0gdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgIHRoaXMuX2Rpc2FibGVDb25uZWN0aW9uKCk7XG4gICAgfVxuICAgIHRoaXMuX2NoZWNrRm9yRW5kKCk7XG4gIH1cblxuICBfZGlzYWJsZUNvbm5lY3Rpb24oKTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZygnTXV4IGRpc2FibGluZyBjb25uZWN0aW9uJyk7XG4gICAgdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24gPSBudWxsO1xuICAgIHRoaXMuX3NldFN0YXR1cyhTVEFUVVNfUlVOTklORyk7XG4gIH1cblxuICBfZGlzcG9zZUNvbm5lY3RvcigpOiB2b2lkIHtcbiAgICAvLyBBdm9pZCByZWN1cnNpb24gd2l0aCBjb25uZWN0b3IncyBvbkNsb3NlIGV2ZW50LlxuICAgIGNvbnN0IGNvbm5lY3RvciA9IHRoaXMuX2Nvbm5lY3RvcjtcbiAgICBpZiAoY29ubmVjdG9yKSB7XG4gICAgICB0aGlzLl9jb25uZWN0b3IgPSBudWxsO1xuICAgICAgY29ubmVjdG9yLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fY2hlY2tGb3JFbmQoKTtcbiAgfVxuXG4gIF9jaGVja0ZvckVuZCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29ubmVjdGlvbnMuc2l6ZSA9PT0gMCAmJlxuICAgICAgICghdGhpcy5fY29ubmVjdG9yIHx8IGdldENvbmZpZygpLmVuZERlYnVnV2hlbk5vUmVxdWVzdHMpKSB7XG4gICAgICB0aGlzLl9zZXRTdGF0dXMoU1RBVFVTX0VORCk7XG4gICAgfVxuICB9XG5cbiAgX25vQ29ubmVjdGlvbkVycm9yKCk6IEVycm9yIHtcbiAgICAvLyBUaGlzIGlzIGFuIGluZGljYXRpb24gb2YgYSBidWcgaW4gdGhlIHN0YXRlIG1hY2hpbmUuXG4gICAgLy8gLi4gd2UgYXJlIHNlZWluZyBhIHJlcXVlc3QgaW4gYSBzdGF0ZSB0aGF0IHNob3VsZCBub3QgZ2VuZXJhdGVcbiAgICAvLyB0aGF0IHJlcXVlc3QuXG4gICAgcmV0dXJuIG5ldyBFcnJvcignTm8gY29ubmVjdGlvbicpO1xuICB9XG5cbiAgYXN5bmMgX2hhbmRsZVNldHVwRm9yQ29ubmVjdGlvbihjb25uZWN0aW9uOiBDb25uZWN0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gU3Rkb3V0L2VyciBjb21tYW5kcy5cbiAgICBjb25zdCBzdGRvdXRSZXF1ZXN0U3VjY2VlZGVkID0gYXdhaXQgY29ubmVjdGlvbi5zZW5kU3Rkb3V0UmVxdWVzdCgpO1xuICAgIGlmICghc3Rkb3V0UmVxdWVzdFN1Y2NlZWRlZCkge1xuICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdISFZNIHJldHVybmVkIGZhaWx1cmUgZm9yIGEgc3Rkb3V0IHJlcXVlc3QnKTtcbiAgICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnb3V0cHV0V2luZG93Jywge1xuICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgICAgdGV4dDogJ0hIVk0gZmFpbGVkIHRvIHJlZGlyZWN0IHN0ZG91dCwgc28gbm8gb3V0cHV0IHdpbGwgYmUgc2VudCB0byB0aGUgb3V0cHV0IHdpbmRvdy4nLFxuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFRPRE86IFN0ZGVyciByZWRpcmVjdGlvbiBpcyBub3QgaW1wbGVtZW50ZWQgaW4gSEhWTSBzbyB3ZSB3b24ndCBjaGVjayB0aGlzIHJldHVybiB2YWx1ZS5cbiAgICBhd2FpdCBjb25uZWN0aW9uLnNlbmRTdGRlcnJSZXF1ZXN0KCk7XG5cbiAgICAvLyBTZXQgZmVhdHVyZXMuXG4gICAgY29uc3Qgc2V0RmVhdHVyZVN1Y2NlZWRlZCA9IGF3YWl0IGNvbm5lY3Rpb24uc2V0RmVhdHVyZSgnbWF4X2RlcHRoJywgJzUnKTtcbiAgICBpZiAoIXNldEZlYXR1cmVTdWNjZWVkZWQpIHtcbiAgICAgIGxvZ2dlci5sb2dFcnJvcignSEhWTSByZXR1cm5lZCBmYWlsdXJlIGZvciBzZXR0aW5nIGZlYXR1cmUgbWF4X2RlcHRoJyk7XG4gICAgfVxuICB9XG59XG4iXX0=