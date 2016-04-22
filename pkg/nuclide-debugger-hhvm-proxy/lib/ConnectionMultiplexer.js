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
// and if either the attach or launch DbgpConnectors are closed. The DbgpConnectors will likely only
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
    this._attachConnector = null;
    this._launchConnector = null;
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

      var _getConfig = (0, _config.getConfig)();

      var xdebugAttachPort = _getConfig.xdebugAttachPort;
      var xdebugLaunchingPort = _getConfig.xdebugLaunchingPort;
      var launchScriptPath = _getConfig.launchScriptPath;

      if (launchScriptPath == null) {
        // When in attach mode we are guaranteed that the two ports are not equal.
        (0, _assert2['default'])(xdebugAttachPort !== xdebugLaunchingPort, 'xdebug ports are equal in attach mode');
        // In this case we need to listen for incoming connections to attach to, as well as on the
        // port that the dummy connection will use.
        this._attachConnector = this._setupConnector(xdebugAttachPort, this._disposeAttachConnector.bind(this));
      }

      // If we are only doing script debugging, then the dummy connection listener's port can also be
      // used to listen for the script's xdebug requests.
      this._launchConnector = this._setupConnector(xdebugLaunchingPort, this._disposeLaunchConnector.bind(this));

      this._status = _DbgpSocket.STATUS_RUNNING;

      this._clientCallback.sendUserMessage('console', {
        level: 'warning',
        text: 'Pre-loading, please wait...'
      });
      this._dummyRequestProcess = (0, _ConnectionUtils.sendDummyRequest)();

      if (launchScriptPath != null) {
        this._launchedScriptProcess = (0, _helpers.launchScriptToDebug)(launchScriptPath, function (text) {
          return _this._clientCallback.sendUserMessage('outputWindow', { level: 'info', text: text });
        });
      }
    }
  }, {
    key: '_setupConnector',
    value: function _setupConnector(port, disposeConnector) {
      var connector = new DbgpConnector(port);
      connector.onAttach(this._onAttach.bind(this));
      connector.onClose(disposeConnector);
      connector.onError(this._handleAttachError.bind(this));
      connector.listen();
      return connector;
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
          connection.sendContinuationCommand(_DbgpSocket.COMMAND_RUN); // TODO: Change to COMMAND_STOP: t10862085
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
          var message = 'The debugger encountered a problem and the connection had to be shut down.';
          if (arguments[2] != null) {
            message = message + '  Error message: ' + arguments[2];
          }
          this._clientCallback.sendUserMessage('notification', {
            type: 'error',
            message: message
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
      this._disposeLaunchConnector();
      this._disposeAttachConnector();
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
    key: '_disposeAttachConnector',
    value: function _disposeAttachConnector() {
      // Avoid recursion with connector's onClose event.
      var connector = this._attachConnector;
      if (connector != null) {
        this._attachConnector = null;
        connector.dispose();
      }
      this._checkForEnd();
    }
  }, {
    key: '_disposeLaunchConnector',
    value: function _disposeLaunchConnector() {
      // Avoid recursion with connector's onClose event.
      var connector = this._launchConnector;
      if (connector != null) {
        this._launchConnector = null;
        connector.dispose();
      }
      this._checkForEnd();
    }
  }, {
    key: '_checkForEnd',
    value: function _checkForEnd() {
      if (this._connections.size === 0 && (this._attachConnector == null || this._launchConnector == null || (0, _config.getConfig)().endDebugWhenNoRequests)) {
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
      // max_depth sets the depth that the debugger engine respects when
      // returning hierarchical data.
      var setFeatureSucceeded = yield connection.setFeature('max_depth', '5');
      if (!setFeatureSucceeded) {
        _utils2['default'].logError('HHVM returned failure for setting feature max_depth');
      }
      // show_hidden allows the client to request data from private class members.
      setFeatureSucceeded = yield connection.setFeature('show_hidden', '1');
      if (!setFeatureSucceeded) {
        _utils2['default'].logError('HHVM returned failure for setting feature show_hidden');
      }
    })
  }]);

  return ConnectionMultiplexer;
})();

exports.ConnectionMultiplexer = ConnectionMultiplexer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25NdWx0aXBsZXhlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFXbUIsU0FBUzs7Ozt1QkFDTSxXQUFXOzswQkFDcEIsY0FBYzs7c0JBQ2YsVUFBVTs7K0JBTTNCLG1CQUFtQjs7MEJBaUJuQixjQUFjOztzQkFDTSxRQUFROztzQkFDYixRQUFROzs7OzhCQUNELGtCQUFrQjs7ZUFoQnJCLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQzs7SUFBL0MsZUFBZSxZQUFmLGVBQWU7O2dCQUNFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQzs7SUFBM0MsYUFBYSxhQUFiLGFBQWE7O0FBaUJwQixJQUFNLDJCQUEyQixHQUFHLHVCQUF1QixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWlEL0MscUJBQXFCO0FBYXJCLFdBYkEscUJBQXFCLENBYXBCLGNBQThCLEVBQUU7MEJBYmpDLHFCQUFxQjs7QUFjOUIsUUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7QUFDdEMsUUFBSSxDQUFDLE9BQU8sOEJBQWtCLENBQUM7QUFDL0IsUUFBSSxDQUFDLHdCQUF3QixHQUFHLDBCQUFrQixDQUFDO0FBQ25ELFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7QUFDL0IsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM3QixRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDOUIsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM3QixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7QUFDakMsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7QUFDOUMsUUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztHQUNwQzs7ZUF6QlUscUJBQXFCOztXQTJCeEIsa0JBQUMsUUFBbUMsRUFBZTtBQUN6RCxhQUFPLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUNyRiwyQkFBMkIsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUMxQzs7O1dBRUssa0JBQVM7Ozt1QkFDcUQsd0JBQVc7O1VBQXRFLGdCQUFnQixjQUFoQixnQkFBZ0I7VUFBRSxtQkFBbUIsY0FBbkIsbUJBQW1CO1VBQUUsZ0JBQWdCLGNBQWhCLGdCQUFnQjs7QUFDOUQsVUFBSSxnQkFBZ0IsSUFBSSxJQUFJLEVBQUU7O0FBRTVCLGlDQUFVLGdCQUFnQixLQUFLLG1CQUFtQixFQUFFLHVDQUF1QyxDQUFDLENBQUM7OztBQUc3RixZQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FDMUMsZ0JBQWdCLEVBQ2hCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQ3hDLENBQUM7T0FDSDs7OztBQUlELFVBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUMxQyxtQkFBbUIsRUFDbkIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDeEMsQ0FBQzs7QUFFRixVQUFJLENBQUMsT0FBTyw2QkFBaUIsQ0FBQzs7QUFFOUIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFO0FBQzlDLGFBQUssRUFBRSxTQUFTO0FBQ2hCLFlBQUksRUFBRSw2QkFBNkI7T0FDcEMsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLG9CQUFvQixHQUFHLHdDQUFrQixDQUFDOztBQUUvQyxVQUFJLGdCQUFnQixJQUFJLElBQUksRUFBRTtBQUM1QixZQUFJLENBQUMsc0JBQXNCLEdBQUcsa0NBQzVCLGdCQUFnQixFQUNoQixVQUFBLElBQUk7aUJBQUksTUFBSyxlQUFlLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBQyxDQUFDO1NBQUEsQ0FDcEYsQ0FBQztPQUNIO0tBQ0Y7OztXQUVjLHlCQUFDLElBQVksRUFBRSxnQkFBNEIsRUFBaUI7QUFDekUsVUFBTSxTQUFTLEdBQUcsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUMsZUFBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzlDLGVBQVMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNwQyxlQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN0RCxlQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDbkIsYUFBTyxTQUFTLENBQUM7S0FDbEI7Ozs2QkFFMkIsV0FBQyxNQUFjLEVBQWlCOzs7QUFDMUQseUJBQU8sR0FBRyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7QUFDdkUsVUFBTSxlQUFlLEdBQUcsMkJBQWUsTUFBTSxDQUFDLENBQUM7QUFDL0MsWUFBTSxJQUFJLENBQUMseUJBQXlCLENBQUMsZUFBZSxDQUFDLENBQUM7Ozs7QUFJdEQsWUFBTSxlQUFlLENBQUMsdUJBQXVCLHlCQUFhLENBQUM7QUFDM0QscUJBQWUsQ0FBQyxRQUFRLENBQUMsVUFBQyxNQUFNLEVBQUUsT0FBTyxFQUFLO0FBQzVDLGdCQUFRLE1BQU07QUFDWjtBQUNFLG1CQUFLLFdBQVcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDakMsa0JBQU07QUFBQSxBQUNSO0FBQ0UsbUJBQUssV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNsQyxrQkFBTTtBQUFBLFNBQ1Q7T0FDRixDQUFDLENBQUM7QUFDSCxVQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDOztBQUV4QyxVQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUU7QUFDOUMsYUFBSyxFQUFFLFNBQVM7QUFDaEIsWUFBSSxFQUFFLHNEQUFzRDtPQUM3RCxDQUFDLENBQUM7S0FDSjs7Ozs7V0FHaUIsOEJBQWdCO0FBQ2hDLGFBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0tBQzlCOzs7NkJBRWMsV0FBQyxNQUF5QyxFQUFXOzs7VUFDM0QsTUFBTSxHQUFhLE1BQU0sQ0FBekIsTUFBTTtVQUFFLE9BQU8sR0FBSSxNQUFNLENBQWpCLE9BQU87O0FBQ3RCLFVBQUksQ0FBQywwQ0FBb0IsT0FBTyxDQUFDLEVBQUU7QUFDakMsNkNBQWUsTUFBTSxFQUFFLHdCQUF3QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMzRSxlQUFPO09BQ1I7QUFDRCxVQUFJLHdDQUFrQixPQUFPLENBQUMsRUFBRTtBQUM5QixjQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUMzQyxNQUFNOztBQUNMLGNBQU0sVUFBVSxHQUFHLDJCQUFlLE1BQU0sQ0FBQyxDQUFDO0FBQzFDLGlCQUFLLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoRCxnQkFBTSxPQUFLLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVqRCxjQUFNLElBQUksR0FBRztBQUNYLHNCQUFVLEVBQVYsVUFBVTtBQUNWLDhCQUFrQixFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsVUFBQyxNQUFNLEVBQWM7Z0RBQVQsSUFBSTtBQUFKLG9CQUFJOzs7QUFDdEQscUJBQUssbUJBQW1CLE1BQUEsVUFBQyxVQUFVLEVBQUUsTUFBTSxTQUFLLElBQUksRUFBQyxDQUFDO2FBQ3ZELENBQUM7QUFDRixrQkFBTSw2QkFBaUI7V0FDeEIsQ0FBQztBQUNGLGlCQUFLLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUV4QyxjQUFJLE1BQU0sWUFBQSxDQUFDO0FBQ1gsY0FBSTtBQUNGLGtCQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7V0FDdkMsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLCtCQUFPLFFBQVEsQ0FBQywyQ0FBMkMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekUsa0JBQU0sMkJBQWUsQ0FBQztXQUN2QjtBQUNELGlCQUFLLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQzs7T0FDOUM7S0FDRjs7O1dBRWtCLDZCQUFDLFVBQXNCLEVBQUUsTUFBYyxFQUFnQztBQUN4Rix5QkFBTyxHQUFHLHNCQUFvQixNQUFNLHVCQUFrQixVQUFVLENBQUMsS0FBSyxFQUFFLENBQUcsQ0FBQztBQUM1RSxVQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN6RCwrQkFBVSxjQUFjLElBQUksSUFBSSxDQUFDLENBQUM7O0FBRWxDLGNBQVEsTUFBTTtBQUNaOzs7O0FBSUUsd0JBQWMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQy9CLG9CQUFVLENBQUMsdUJBQXVCLHlCQUFhLENBQUM7QUFDaEQsaUJBQU87QUFBQSxBQUNUOztBQUVFLHdCQUFjLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUMvQixvQkFBVSxDQUFDLHVCQUF1Qix5QkFBYSxDQUFDO0FBQ2hELGlCQUFPO0FBQUEsQUFDVDtBQUNFLHdCQUFjLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUMvQixjQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7QUFDMUMsZ0JBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1dBQzNCO0FBQ0QsZ0JBQU07QUFBQSxBQUNSO0FBQ0Usd0JBQWMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQy9CLGNBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxrQkFBa0IsRUFBRTs7QUFFMUMsK0JBQU8sR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7QUFDOUMsZ0JBQUksQ0FBQyxXQUFXLDBCQUFjLENBQUM7QUFDL0IsbUJBQU87V0FDUjtBQUNELGdCQUFNO0FBQUEsQUFDUjtBQUNFLGNBQUksT0FBTyxHQUFHLDRFQUE0RSxDQUFDO0FBQzNGLGNBQUksVUFBSyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUU7QUFDbkIsbUJBQU8sR0FBTSxPQUFPLHlCQUFvQixVQUFLLENBQUMsQ0FBQyxBQUFFLENBQUM7V0FDbkQ7QUFDRCxjQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUU7QUFDbkQsZ0JBQUksRUFBRSxPQUFPO0FBQ2IsbUJBQU8sRUFBUCxPQUFPO1dBQ1IsQ0FBQyxDQUFDO0FBQ0gsY0FBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLGdCQUFNO0FBQUEsQUFDUix3Q0FBb0I7QUFDcEI7QUFDRSx3QkFBYyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDL0IsY0FBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLGdCQUFNO0FBQUEsQUFDUjtBQUNFLGNBQUksQ0FBQyxXQUFXLENBQUMsVUFBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNqQyxnQkFBTTtBQUFBLEFBQ1I7QUFDRSxjQUFJLENBQUMsV0FBVyxDQUFDLFVBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbEMsZ0JBQU07QUFBQSxPQUNUOztBQUVELFVBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUN0Qjs7O1dBRVUscUJBQUMsT0FBZSxFQUFFLEtBQWEsRUFBUTtBQUNoRCxVQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUU7QUFDbkQsYUFBSyxFQUFFLEtBQUs7QUFDWixZQUFJLEVBQUUsT0FBTztPQUNkLENBQUMsQ0FBQztLQUNKOzs7V0FFWSx5QkFBUztBQUNwQixVQUFJLElBQUksQ0FBQyxPQUFPLDJCQUFlLEVBQUU7QUFDL0IsZUFBTztPQUNSOztBQUVELFVBQUksSUFBSSxDQUFDLE9BQU8sNkJBQWlCLEVBQUU7QUFDakMsMkJBQU8sR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDMUMsZUFBTztPQUNSOzs7QUFHRCxXQUFLLElBQU0sY0FBYyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDdkQsWUFBSSxjQUFjLENBQUMsTUFBTSw2QkFBaUIsRUFBRTtBQUMxQyxjQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2xELGdCQUFNO1NBQ1A7T0FDRjtLQUNGOzs7V0FFZ0IsMkJBQUMsVUFBc0IsRUFBUTtBQUM5Qyx5QkFBTyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUN0QyxVQUFJLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxDQUFDO0FBQ3JDLFVBQUksQ0FBQyxVQUFVLDBCQUFjLENBQUM7S0FDL0I7OztXQUVTLG9CQUFDLE1BQWMsRUFBUTtBQUMvQixVQUFJLE1BQU0sS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQzNCLFlBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDMUI7S0FDRjs7O1dBRWlCLDRCQUFDLEtBQWEsRUFBUTtBQUN0QyxVQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUU7QUFDbkQsWUFBSSxFQUFFLE9BQU87QUFDYixlQUFPLEVBQUUsS0FBSztPQUNmLENBQUMsQ0FBQztLQUNKOzs7V0FFVSxxQkFBQyxNQUFjLEVBQVE7QUFDaEMsVUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUN6RTs7OzZCQUVvQixXQUFDLFVBQWtCLEVBQW1CO0FBQ3pELHlCQUFPLEdBQUcsaURBQStDLFVBQVUsQ0FBRyxDQUFDO0FBQ3ZFLFVBQUksSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksRUFBRTs7O0FBR2pDLFlBQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDMUUsWUFBSSxDQUFDLGdDQUFnQyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMxRCxlQUFPLE1BQU0sQ0FBQztPQUNmLE1BQU07QUFDTCxjQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO09BQ2pDO0tBQ0Y7Ozs2QkFFd0IsV0FBQyxVQUFrQixFQUFFLFVBQWtCLEVBQW1CO0FBQ2pGLFVBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQzNCLFlBQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN6RixZQUFJLENBQUMsZ0NBQWdDLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzFELGVBQU8sTUFBTSxDQUFDO09BQ2YsTUFBTTtBQUNMLGNBQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7T0FDakM7S0FDRjs7O1dBRStCLDBDQUFDLFVBQWtCLEVBQUUsTUFBK0IsRUFBUTtBQUMxRixVQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUU7QUFDcEIsWUFBTSxRQUFPLDRCQUNZLFVBQVUsWUFBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQUssTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEFBQUUsQ0FBQztBQUM1RixZQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUU7QUFDOUMsZUFBSyxFQUFFLE9BQU87QUFDZCxjQUFJLEVBQUUsUUFBTztTQUNkLENBQUMsQ0FBQztPQUNKO0tBQ0Y7OztXQUVtQiw4QkFBQyxLQUFxQixFQUFXO0FBQ25ELGFBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzFEOzs7V0FFWSx1QkFBQyxRQUFnQixFQUFFLFVBQWtCLEVBQVU7QUFDMUQsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUNsRTs7O1dBRWUsMEJBQUMsWUFBb0IsRUFBVztBQUM5QyxhQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUM3RDs7O1dBRWEsMEJBQTZCO0FBQ3pDLFVBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQzNCLGVBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDO09BQ2pELE1BQU07O0FBRUwsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUM7T0FDckM7S0FDRjs7O1dBRWdCLDJCQUFDLFVBQWtCLEVBQWtDO0FBQ3BFLFVBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQzNCLGVBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQzlELE1BQU07QUFDTCxjQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO09BQ2pDO0tBQ0Y7OztXQUVRLHFCQUFXO0FBQ2xCLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztLQUNyQjs7O1dBRXNCLGlDQUFDLE9BQWUsRUFBUTtBQUM3QyxVQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtBQUMzQixZQUFJLENBQUMsa0JBQWtCLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDMUQsTUFBTTtBQUNMLGNBQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7T0FDakM7S0FDRjs7O1dBRWUsNEJBQXFCO0FBQ25DLFVBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQzNCLGVBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixFQUFFLENBQUM7T0FDbkQsTUFBTTtBQUNMLGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUMvQjtLQUNGOzs7V0FFWSx1QkFBQyxRQUFnQyxFQUE4QztBQUMxRixVQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsT0FBTyw2QkFBaUIsRUFBRTtBQUM1RCxlQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDeEQsTUFBTSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtBQUNoQyxlQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDdEQsTUFBTTtBQUNMLGNBQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7T0FDakM7S0FDRjs7OzZCQUVZLGFBQWtCO0FBQzdCLFdBQUssSUFBTSxXQUFVLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRTtBQUNqRCxZQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVSxDQUFDLENBQUM7T0FDcEM7QUFDRCxVQUFJLElBQUksQ0FBQyxzQkFBc0IsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sMkJBQWUsRUFBRTtBQUN0RSxjQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztPQUNuQztBQUNELFVBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO0FBQzdCLFlBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDM0M7QUFDRCxVQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztBQUMvQixVQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztLQUNoQzs7O1dBRWdCLDJCQUFDLFVBQXNCLEVBQVE7QUFDOUMsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDL0MsK0JBQVUsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxnQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxZQUFZLFVBQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFckMsVUFBSSxVQUFVLEtBQUssSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQzFDLFlBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO09BQzNCO0FBQ0QsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQ3JCOzs7V0FFaUIsOEJBQVM7QUFDekIseUJBQU8sR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDdkMsVUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztBQUMvQixVQUFJLENBQUMsVUFBVSw0QkFBZ0IsQ0FBQztLQUNqQzs7O1dBRXNCLG1DQUFTOztBQUU5QixVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7QUFDeEMsVUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDN0IsaUJBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNyQjtBQUNELFVBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztLQUNyQjs7O1dBRXNCLG1DQUFTOztBQUU5QixVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7QUFDeEMsVUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDN0IsaUJBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNyQjtBQUNELFVBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztLQUNyQjs7O1dBRVcsd0JBQVM7QUFDbkIsVUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQzdCLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLElBQzVCLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLElBQzdCLHdCQUFXLENBQUMsc0JBQXNCLENBQUEsQUFBQyxFQUFFO0FBQ3ZDLFlBQUksQ0FBQyxVQUFVLHdCQUFZLENBQUM7T0FDN0I7S0FDRjs7O1dBRWlCLDhCQUFVOzs7O0FBSTFCLGFBQU8sSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDbkM7Ozs2QkFFOEIsV0FBQyxVQUFzQixFQUFpQjs7QUFFckUsVUFBTSxzQkFBc0IsR0FBRyxNQUFNLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQ3BFLFVBQUksQ0FBQyxzQkFBc0IsRUFBRTtBQUMzQiwyQkFBTyxRQUFRLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUM5RCxZQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUU7QUFDbkQsZUFBSyxFQUFFLE9BQU87QUFDZCxjQUFJLEVBQUUsaUZBQWlGO1NBQ3hGLENBQUMsQ0FBQztPQUNKOztBQUVELFlBQU0sVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Ozs7O0FBS3JDLFVBQUksbUJBQW1CLEdBQUcsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN4RSxVQUFJLENBQUMsbUJBQW1CLEVBQUU7QUFDeEIsMkJBQU8sUUFBUSxDQUFDLHFEQUFxRCxDQUFDLENBQUM7T0FDeEU7O0FBRUQseUJBQW1CLEdBQUcsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN0RSxVQUFJLENBQUMsbUJBQW1CLEVBQUU7QUFDeEIsMkJBQU8sUUFBUSxDQUFDLHVEQUF1RCxDQUFDLENBQUM7T0FDMUU7S0FDRjs7O1NBdGJVLHFCQUFxQiIsImZpbGUiOiJDb25uZWN0aW9uTXVsdGlwbGV4ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtsYXVuY2hTY3JpcHRUb0RlYnVnfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHtDb25uZWN0aW9ufSBmcm9tICcuL0Nvbm5lY3Rpb24nO1xuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7XG4gIGlzRHVtbXlDb25uZWN0aW9uLFxuICBzZW5kRHVtbXlSZXF1ZXN0LFxuICBpc0NvcnJlY3RDb25uZWN0aW9uLFxuICBmYWlsQ29ubmVjdGlvbixcbn0gZnJvbSAnLi9Db25uZWN0aW9uVXRpbHMnO1xuXG5pbXBvcnQgdHlwZSB7U29ja2V0fSBmcm9tICduZXQnO1xuaW1wb3J0IHR5cGUge0V4Y2VwdGlvblN0YXRlfSBmcm9tICcuL0JyZWFrcG9pbnRTdG9yZSc7XG5jb25zdCB7QnJlYWtwb2ludFN0b3JlfSA9IHJlcXVpcmUoJy4vQnJlYWtwb2ludFN0b3JlJyk7XG5jb25zdCB7RGJncENvbm5lY3Rvcn0gPSByZXF1aXJlKCcuL0RiZ3BDb25uZWN0b3InKTtcbmltcG9ydCB7XG4gIFNUQVRVU19TVEFSVElORyxcbiAgU1RBVFVTX1NUT1BQSU5HLFxuICBTVEFUVVNfU1RPUFBFRCxcbiAgU1RBVFVTX1JVTk5JTkcsXG4gIFNUQVRVU19CUkVBSyxcbiAgU1RBVFVTX0VSUk9SLFxuICBTVEFUVVNfRU5ELFxuICBTVEFUVVNfU1RET1VULFxuICBTVEFUVVNfU1RERVJSLFxuICBDT01NQU5EX1JVTixcbn0gZnJvbSAnLi9EYmdwU29ja2V0JztcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDbGllbnRDYWxsYmFja30gZnJvbSAnLi9DbGllbnRDYWxsYmFjayc7XG5cbmNvbnN0IENPTk5FQ1RJT05fTVVYX1NUQVRVU19FVkVOVCA9ICdjb25uZWN0aW9uLW11eC1zdGF0dXMnO1xuXG50eXBlIENvbm5lY3Rpb25JbmZvID0ge1xuICBjb25uZWN0aW9uOiBDb25uZWN0aW9uO1xuICBvblN0YXR1c0Rpc3Bvc2FibGU6IElEaXNwb3NhYmxlO1xuICBzdGF0dXM6IHN0cmluZztcbn07XG5cbnR5cGUgRGJncEVycm9yID0ge1xuICAkOiB7XG4gICAgY29kZTogbnVtYmVyO1xuICB9O1xuICBtZXNzYWdlOiBBcnJheTxzdHJpbmc+O1xufTtcblxudHlwZSBFdmFsdWF0aW9uRmFpbHVyZVJlc3VsdCA9IHtcbiAgZXJyb3I6IERiZ3BFcnJvcjtcbiAgd2FzVGhyb3duOiBib29sZWFuO1xufTtcblxuLy8gVGhlIENvbm5lY3Rpb25NdWx0aXBsZXhlciBtYWtlcyBtdWx0aXBsZSBkZWJ1Z2dlciBjb25uZWN0aW9ucyBhcHBlYXIgdG8gYmVcbi8vIGEgc2luZ2xlIGNvbm5lY3Rpb24gdG8gdGhlIGRlYnVnZ2VyIFVJLlxuLy9cbi8vIFRoZSBpbml0aWFsaXphdGlvbiBzZXF1ZW5jZSBvY2N1cnMgYXMgZm9sbG93czpcbi8vICAtIHRoZSBjb25zdHJ1Y3RvciBpcyBjYWxsZWRcbi8vICAtIG9uU3RhdHVzIGlzIGNhbGxlZCB0byBob29rIHVwIGV2ZW50IGhhbmRsZXJzXG4vLyAgLSBpbml0aWFsIGJyZWFrcG9pbnRzIG1heSBiZSBhZGRlZCBoZXJlLlxuLy8gIC0gbGlzdGVuKCkgaXMgY2FsbGVkIGluZGljYXRpbmcgdGhhdCBhbGwgaW5pdGlhbCBCcmVha3BvaW50cyBoYXZlIGJlZW4gc2V0XG4vLyAgICBhbmQgZGVidWdnaW5nIG1heSBjb21tZW5jZS5cbi8vXG4vLyBPbmNlIGluaXRpYWxpemVkLCB0aGUgQ29ubmVjdGlvbk11bHRpcGxleGVyIGNhbiBiZSBpbiBvbmUgb2YgMyBtYWluIHN0YXRlczpcbi8vIHJ1bm5pbmcsIGJyZWFrLWRpc2FibGVkLCBhbmQgYnJlYWstZW5hYmxlZC5cbi8vXG4vLyBSdW5uaW5nIHN0YXRlIG1lYW5zIHRoYXQgYWxsIGNvbm5lY3Rpb25zIGFyZSBpbiB0aGUgcnVubmluZyBzdGF0ZS5cbi8vIE5vdGUgdGhhdCBydW5uaW5nIGluY2x1ZGVzIHRoZSBzdGF0ZSB3aGVyZSB0aGVyZSBhcmUgbm8gY29ubmVjdGlvbnMuXG4vL1xuLy8gQnJlYWstZGlzYWJsZWQgc3RhdGUgaGFzIGF0IGxlYXN0IG9uZSBjb25uZWN0aW9uIGluIGJyZWFrIHN0YXRlLlxuLy8gQW5kIG5vbmUgb2YgdGhlIGNvbm5lY3Rpb25zIGlzIGVuYWJsZWQuIE9uY2UgaW4gYnJlYWstZGlzYWJsZWQgc3RhdGUsXG4vLyB0aGUgY29ubmVjdGlvbiBtdXggd2lsbCBpbW1lZGlhdGVseSBlbmFibGUgb25lIG9mIHRoZSBicm9rZW4gY29ubmVjdGlvbnNcbi8vIGFuZCBtb3ZlIHRvIGJyZWFrLWVuYWJsZWQgc3RhdGUuXG4vL1xuLy8gQnJlYWstZW5hYmxlZCBzdGF0ZSBoYXMgYSBzaW5nbGUgY29ubmVjdGlvbiB3aGljaCBpcyBpbiBicmVhay1lbmFibGVkXG4vLyBzdGF0ZS4gVGhlcmUgbWF5IGJlIGNvbm5lY3Rpb25zIGluIGJyZWFrLWRpc2FibGVkIHN0YXRlIGFuZCBydW5uaW5nIHN0YXRlXG4vLyBhcyB3ZWxsLiBUaGUgZW5hYmxlZCBjb25uZWN0aW9uIHdpbGwgYmUgc2hvd24gaW4gdGhlIGRlYnVnZ2VyIFVJIGFuZCBhbGxcbi8vIGNvbW1hbmRzIHdpbGwgZ28gdG8gdGhlIGVuYWJsZWQgY29ubmVjdGlvbi5cbi8vXG4vLyBUaGUgQ29ubmVjdGlvbk11bHRpcGxleGVyIHdpbGwgY2xvc2Ugb25seSBpZiB0aGVyZSBhcmUgbm8gY29ubmVjdGlvbnNcbi8vIGFuZCBpZiBlaXRoZXIgdGhlIGF0dGFjaCBvciBsYXVuY2ggRGJncENvbm5lY3RvcnMgYXJlIGNsb3NlZC4gVGhlIERiZ3BDb25uZWN0b3JzIHdpbGwgbGlrZWx5IG9ubHlcbi8vIGNsb3NlIGlmIEhIVk0gY3Jhc2hlcyBvciBpcyBzdG9wcGVkLlxuZXhwb3J0IGNsYXNzIENvbm5lY3Rpb25NdWx0aXBsZXhlciB7XG4gIF9jbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2s7XG4gIF9icmVha3BvaW50U3RvcmU6IEJyZWFrcG9pbnRTdG9yZTtcbiAgX2Nvbm5lY3Rpb25TdGF0dXNFbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF9zdGF0dXM6IHN0cmluZztcbiAgX2VuYWJsZWRDb25uZWN0aW9uOiA/Q29ubmVjdGlvbjtcbiAgX2R1bW15Q29ubmVjdGlvbjogP0Nvbm5lY3Rpb247XG4gIF9jb25uZWN0aW9uczogTWFwPENvbm5lY3Rpb24sIENvbm5lY3Rpb25JbmZvPjtcbiAgX2F0dGFjaENvbm5lY3RvcjogP0RiZ3BDb25uZWN0b3I7XG4gIF9sYXVuY2hDb25uZWN0b3I6ID9EYmdwQ29ubmVjdG9yO1xuICBfZHVtbXlSZXF1ZXN0UHJvY2VzczogP2NoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICBfbGF1bmNoZWRTY3JpcHRQcm9jZXNzOiA/UHJvbWlzZTx2b2lkPjtcblxuICBjb25zdHJ1Y3RvcihjbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2spIHtcbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjayA9IGNsaWVudENhbGxiYWNrO1xuICAgIHRoaXMuX3N0YXR1cyA9IFNUQVRVU19TVEFSVElORztcbiAgICB0aGlzLl9jb25uZWN0aW9uU3RhdHVzRW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fZHVtbXlDb25uZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9jb25uZWN0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9hdHRhY2hDb25uZWN0b3IgPSBudWxsO1xuICAgIHRoaXMuX2xhdW5jaENvbm5lY3RvciA9IG51bGw7XG4gICAgdGhpcy5fZHVtbXlSZXF1ZXN0UHJvY2VzcyA9IG51bGw7XG4gICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlID0gbmV3IEJyZWFrcG9pbnRTdG9yZSgpO1xuICAgIHRoaXMuX2xhdW5jaGVkU2NyaXB0UHJvY2VzcyA9IG51bGw7XG4gIH1cblxuICBvblN0YXR1cyhjYWxsYmFjazogKHN0YXR1czogc3RyaW5nKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJykuZXZlbnQuYXR0YWNoRXZlbnQodGhpcy5fY29ubmVjdGlvblN0YXR1c0VtaXR0ZXIsXG4gICAgICBDT05ORUNUSU9OX01VWF9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGxpc3RlbigpOiB2b2lkIHtcbiAgICBjb25zdCB7eGRlYnVnQXR0YWNoUG9ydCwgeGRlYnVnTGF1bmNoaW5nUG9ydCwgbGF1bmNoU2NyaXB0UGF0aH0gPSBnZXRDb25maWcoKTtcbiAgICBpZiAobGF1bmNoU2NyaXB0UGF0aCA9PSBudWxsKSB7XG4gICAgICAvLyBXaGVuIGluIGF0dGFjaCBtb2RlIHdlIGFyZSBndWFyYW50ZWVkIHRoYXQgdGhlIHR3byBwb3J0cyBhcmUgbm90IGVxdWFsLlxuICAgICAgaW52YXJpYW50KHhkZWJ1Z0F0dGFjaFBvcnQgIT09IHhkZWJ1Z0xhdW5jaGluZ1BvcnQsICd4ZGVidWcgcG9ydHMgYXJlIGVxdWFsIGluIGF0dGFjaCBtb2RlJyk7XG4gICAgICAvLyBJbiB0aGlzIGNhc2Ugd2UgbmVlZCB0byBsaXN0ZW4gZm9yIGluY29taW5nIGNvbm5lY3Rpb25zIHRvIGF0dGFjaCB0bywgYXMgd2VsbCBhcyBvbiB0aGVcbiAgICAgIC8vIHBvcnQgdGhhdCB0aGUgZHVtbXkgY29ubmVjdGlvbiB3aWxsIHVzZS5cbiAgICAgIHRoaXMuX2F0dGFjaENvbm5lY3RvciA9IHRoaXMuX3NldHVwQ29ubmVjdG9yKFxuICAgICAgICB4ZGVidWdBdHRhY2hQb3J0LFxuICAgICAgICB0aGlzLl9kaXNwb3NlQXR0YWNoQ29ubmVjdG9yLmJpbmQodGhpcyksXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGFyZSBvbmx5IGRvaW5nIHNjcmlwdCBkZWJ1Z2dpbmcsIHRoZW4gdGhlIGR1bW15IGNvbm5lY3Rpb24gbGlzdGVuZXIncyBwb3J0IGNhbiBhbHNvIGJlXG4gICAgLy8gdXNlZCB0byBsaXN0ZW4gZm9yIHRoZSBzY3JpcHQncyB4ZGVidWcgcmVxdWVzdHMuXG4gICAgdGhpcy5fbGF1bmNoQ29ubmVjdG9yID0gdGhpcy5fc2V0dXBDb25uZWN0b3IoXG4gICAgICB4ZGVidWdMYXVuY2hpbmdQb3J0LFxuICAgICAgdGhpcy5fZGlzcG9zZUxhdW5jaENvbm5lY3Rvci5iaW5kKHRoaXMpLFxuICAgICk7XG5cbiAgICB0aGlzLl9zdGF0dXMgPSBTVEFUVVNfUlVOTklORztcblxuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnY29uc29sZScsIHtcbiAgICAgIGxldmVsOiAnd2FybmluZycsXG4gICAgICB0ZXh0OiAnUHJlLWxvYWRpbmcsIHBsZWFzZSB3YWl0Li4uJyxcbiAgICB9KTtcbiAgICB0aGlzLl9kdW1teVJlcXVlc3RQcm9jZXNzID0gc2VuZER1bW15UmVxdWVzdCgpO1xuXG4gICAgaWYgKGxhdW5jaFNjcmlwdFBhdGggIT0gbnVsbCkge1xuICAgICAgdGhpcy5fbGF1bmNoZWRTY3JpcHRQcm9jZXNzID0gbGF1bmNoU2NyaXB0VG9EZWJ1ZyhcbiAgICAgICAgbGF1bmNoU2NyaXB0UGF0aCxcbiAgICAgICAgdGV4dCA9PiB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck1lc3NhZ2UoJ291dHB1dFdpbmRvdycsIHtsZXZlbDogJ2luZm8nLCB0ZXh0fSksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIF9zZXR1cENvbm5lY3Rvcihwb3J0OiBudW1iZXIsIGRpc3Bvc2VDb25uZWN0b3I6ICgpID0+IHZvaWQpOiBEYmdwQ29ubmVjdG9yIHtcbiAgICBjb25zdCBjb25uZWN0b3IgPSBuZXcgRGJncENvbm5lY3Rvcihwb3J0KTtcbiAgICBjb25uZWN0b3Iub25BdHRhY2godGhpcy5fb25BdHRhY2guYmluZCh0aGlzKSk7XG4gICAgY29ubmVjdG9yLm9uQ2xvc2UoZGlzcG9zZUNvbm5lY3Rvcik7XG4gICAgY29ubmVjdG9yLm9uRXJyb3IodGhpcy5faGFuZGxlQXR0YWNoRXJyb3IuYmluZCh0aGlzKSk7XG4gICAgY29ubmVjdG9yLmxpc3RlbigpO1xuICAgIHJldHVybiBjb25uZWN0b3I7XG4gIH1cblxuICBhc3luYyBfaGFuZGxlRHVtbXlDb25uZWN0aW9uKHNvY2tldDogU29ja2V0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyLmxvZygnQ29ubmVjdGlvbk11bHRpcGxleGVyIHN1Y2Nlc3NmdWxseSBnb3QgZHVtbXkgY29ubmVjdGlvbi4nKTtcbiAgICBjb25zdCBkdW1teUNvbm5lY3Rpb24gPSBuZXcgQ29ubmVjdGlvbihzb2NrZXQpO1xuICAgIGF3YWl0IHRoaXMuX2hhbmRsZVNldHVwRm9yQ29ubmVjdGlvbihkdW1teUNvbm5lY3Rpb24pO1xuXG4gICAgLy8gQ29udGludWUgZnJvbSBsb2FkZXIgYnJlYWtwb2ludCB0byBoaXQgeGRlYnVnX2JyZWFrKClcbiAgICAvLyB3aGljaCB3aWxsIGxvYWQgd2hvbGUgd3d3IHJlcG8gZm9yIGV2YWx1YXRpb24gaWYgcG9zc2libGUuXG4gICAgYXdhaXQgZHVtbXlDb25uZWN0aW9uLnNlbmRDb250aW51YXRpb25Db21tYW5kKENPTU1BTkRfUlVOKTtcbiAgICBkdW1teUNvbm5lY3Rpb24ub25TdGF0dXMoKHN0YXR1cywgbWVzc2FnZSkgPT4ge1xuICAgICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgY2FzZSBTVEFUVVNfU1RET1VUOlxuICAgICAgICAgIHRoaXMuX3NlbmRPdXRwdXQobWVzc2FnZSwgJ2xvZycpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFNUQVRVU19TVERFUlI6XG4gICAgICAgICAgdGhpcy5fc2VuZE91dHB1dChtZXNzYWdlLCAnaW5mbycpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX2R1bW15Q29ubmVjdGlvbiA9IGR1bW15Q29ubmVjdGlvbjtcblxuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnY29uc29sZScsIHtcbiAgICAgIGxldmVsOiAnd2FybmluZycsXG4gICAgICB0ZXh0OiAnUHJlLWxvYWRpbmcgaXMgZG9uZS4gWW91IGNhbiB1c2UgY29uc29sZSB3aW5kb3cgbm93LicsXG4gICAgfSk7XG4gIH1cblxuICAvLyBGb3IgdGVzdGluZyBwdXJwb3NlLlxuICBnZXREdW1teUNvbm5lY3Rpb24oKTogP0Nvbm5lY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLl9kdW1teUNvbm5lY3Rpb247XG4gIH1cblxuICBhc3luYyBfb25BdHRhY2gocGFyYW1zOiB7c29ja2V0OiBTb2NrZXQ7IG1lc3NhZ2U6IE9iamVjdH0pOiBQcm9taXNlIHtcbiAgICBjb25zdCB7c29ja2V0LCBtZXNzYWdlfSA9IHBhcmFtcztcbiAgICBpZiAoIWlzQ29ycmVjdENvbm5lY3Rpb24obWVzc2FnZSkpIHtcbiAgICAgIGZhaWxDb25uZWN0aW9uKHNvY2tldCwgJ0Rpc2NhcmRpbmcgY29ubmVjdGlvbiAnICsgSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXNEdW1teUNvbm5lY3Rpb24obWVzc2FnZSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuX2hhbmRsZUR1bW15Q29ubmVjdGlvbihzb2NrZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IENvbm5lY3Rpb24oc29ja2V0KTtcbiAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5hZGRDb25uZWN0aW9uKGNvbm5lY3Rpb24pO1xuICAgICAgYXdhaXQgdGhpcy5faGFuZGxlU2V0dXBGb3JDb25uZWN0aW9uKGNvbm5lY3Rpb24pO1xuXG4gICAgICBjb25zdCBpbmZvID0ge1xuICAgICAgICBjb25uZWN0aW9uLFxuICAgICAgICBvblN0YXR1c0Rpc3Bvc2FibGU6IGNvbm5lY3Rpb24ub25TdGF0dXMoKHN0YXR1cywgLi4uYXJncykgPT4ge1xuICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25PblN0YXR1cyhjb25uZWN0aW9uLCBzdGF0dXMsIC4uLmFyZ3MpO1xuICAgICAgICB9KSxcbiAgICAgICAgc3RhdHVzOiBTVEFUVVNfU1RBUlRJTkcsXG4gICAgICB9O1xuICAgICAgdGhpcy5fY29ubmVjdGlvbnMuc2V0KGNvbm5lY3Rpb24sIGluZm8pO1xuXG4gICAgICBsZXQgc3RhdHVzO1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3RhdHVzID0gYXdhaXQgY29ubmVjdGlvbi5nZXRTdGF0dXMoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdFcnJvciBnZXR0aW5nIGluaXRpYWwgY29ubmVjdGlvbiBzdGF0dXM6ICcgKyBlLm1lc3NhZ2UpO1xuICAgICAgICBzdGF0dXMgPSBTVEFUVVNfRVJST1I7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25uZWN0aW9uT25TdGF0dXMoY29ubmVjdGlvbiwgc3RhdHVzKTtcbiAgICB9XG4gIH1cblxuICBfY29ubmVjdGlvbk9uU3RhdHVzKGNvbm5lY3Rpb246IENvbm5lY3Rpb24sIHN0YXR1czogc3RyaW5nLCAuLi5hcmdzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZyhgTXV4IGdvdCBzdGF0dXM6ICR7c3RhdHVzfSBvbiBjb25uZWN0aW9uICR7Y29ubmVjdGlvbi5nZXRJZCgpfWApO1xuICAgIGNvbnN0IGNvbm5lY3Rpb25JbmZvID0gdGhpcy5fY29ubmVjdGlvbnMuZ2V0KGNvbm5lY3Rpb24pO1xuICAgIGludmFyaWFudChjb25uZWN0aW9uSW5mbyAhPSBudWxsKTtcblxuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICBjYXNlIFNUQVRVU19TVEFSVElORzpcbiAgICAgICAgLy8gU3RhcnRpbmcgc3RhdHVzIGhhcyBubyBzdGFjay5cbiAgICAgICAgLy8gc3RlcCBiZWZvcmUgcmVwb3J0aW5nIGluaXRpYWwgc3RhdHVzIHRvIGdldCB0byB0aGUgZmlyc3QgaW5zdHJ1Y3Rpb24uXG4gICAgICAgIC8vIFRPRE86IFVzZSBsb2FkZXIgYnJlYWtwb2ludCBjb25maWd1cmF0aW9uIHRvIGNob29zZSBiZXR3ZWVuIHN0ZXAvcnVuLlxuICAgICAgICBjb25uZWN0aW9uSW5mby5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIGNvbm5lY3Rpb24uc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9SVU4pO1xuICAgICAgICByZXR1cm47XG4gICAgICBjYXNlIFNUQVRVU19TVE9QUElORzpcbiAgICAgICAgLy8gVE9ETzogTWF5IHdhbnQgdG8gZW5hYmxlIHBvc3QtbW9ydGVtIGZlYXR1cmVzP1xuICAgICAgICBjb25uZWN0aW9uSW5mby5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIGNvbm5lY3Rpb24uc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9SVU4pOyAvLyBUT0RPOiBDaGFuZ2UgdG8gQ09NTUFORF9TVE9QOiB0MTA4NjIwODVcbiAgICAgICAgcmV0dXJuO1xuICAgICAgY2FzZSBTVEFUVVNfUlVOTklORzpcbiAgICAgICAgY29ubmVjdGlvbkluZm8uc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICBpZiAoY29ubmVjdGlvbiA9PT0gdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgICAgICB0aGlzLl9kaXNhYmxlQ29ubmVjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTVEFUVVNfQlJFQUs6XG4gICAgICAgIGNvbm5lY3Rpb25JbmZvLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgaWYgKGNvbm5lY3Rpb24gPT09IHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uKSB7XG4gICAgICAgICAgLy8gVGhpcyBjYW4gaGFwcGVuIHdoZW4gd2Ugc3RlcC5cbiAgICAgICAgICBsb2dnZXIubG9nKCdNdXggYnJlYWsgb24gZW5hYmxlZCBjb25uZWN0aW9uJyk7XG4gICAgICAgICAgdGhpcy5fZW1pdFN0YXR1cyhTVEFUVVNfQlJFQUspO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX0VSUk9SOlxuICAgICAgICBsZXQgbWVzc2FnZSA9ICdUaGUgZGVidWdnZXIgZW5jb3VudGVyZWQgYSBwcm9ibGVtIGFuZCB0aGUgY29ubmVjdGlvbiBoYWQgdG8gYmUgc2h1dCBkb3duLic7XG4gICAgICAgIGlmIChhcmdzWzBdICE9IG51bGwpIHtcbiAgICAgICAgICBtZXNzYWdlID0gYCR7bWVzc2FnZX0gIEVycm9yIG1lc3NhZ2U6ICR7YXJnc1swXX1gO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnbm90aWZpY2F0aW9uJywge1xuICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTVEFUVVNfU1RPUFBFRDpcbiAgICAgIGNhc2UgU1RBVFVTX0VORDpcbiAgICAgICAgY29ubmVjdGlvbkluZm8uc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLl9yZW1vdmVDb25uZWN0aW9uKGNvbm5lY3Rpb24pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX1NURE9VVDpcbiAgICAgICAgdGhpcy5fc2VuZE91dHB1dChhcmdzWzBdLCAnbG9nJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBTVEFUVVNfU1RERVJSOlxuICAgICAgICB0aGlzLl9zZW5kT3V0cHV0KGFyZ3NbMF0sICdpbmZvJyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZVN0YXR1cygpO1xuICB9XG5cbiAgX3NlbmRPdXRwdXQobWVzc2FnZTogc3RyaW5nLCBsZXZlbDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fY2xpZW50Q2FsbGJhY2suc2VuZFVzZXJNZXNzYWdlKCdvdXRwdXRXaW5kb3cnLCB7XG4gICAgICBsZXZlbDogbGV2ZWwsXG4gICAgICB0ZXh0OiBtZXNzYWdlLFxuICAgIH0pO1xuICB9XG5cbiAgX3VwZGF0ZVN0YXR1cygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RhdHVzID09PSBTVEFUVVNfRU5EKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3N0YXR1cyA9PT0gU1RBVFVTX0JSRUFLKSB7XG4gICAgICBsb2dnZXIubG9nKCdNdXggYWxyZWFkeSBpbiBicmVhayBzdGF0dXMnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBub3cgY2hlY2sgaWYgd2UgY2FuIG1vdmUgZnJvbSBydW5uaW5nIHRvIGJyZWFrLi4uXG4gICAgZm9yIChjb25zdCBjb25uZWN0aW9uSW5mbyBvZiB0aGlzLl9jb25uZWN0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgaWYgKGNvbm5lY3Rpb25JbmZvLnN0YXR1cyA9PT0gU1RBVFVTX0JSRUFLKSB7XG4gICAgICAgIHRoaXMuX2VuYWJsZUNvbm5lY3Rpb24oY29ubmVjdGlvbkluZm8uY29ubmVjdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9lbmFibGVDb25uZWN0aW9uKGNvbm5lY3Rpb246IENvbm5lY3Rpb24pOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKCdNdXggZW5hYmxpbmcgY29ubmVjdGlvbicpO1xuICAgIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICB0aGlzLl9zZXRTdGF0dXMoU1RBVFVTX0JSRUFLKTtcbiAgfVxuXG4gIF9zZXRTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoc3RhdHVzICE9PSB0aGlzLl9zdGF0dXMpIHtcbiAgICAgIHRoaXMuX3N0YXR1cyA9IHN0YXR1cztcbiAgICAgIHRoaXMuX2VtaXRTdGF0dXMoc3RhdHVzKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlQXR0YWNoRXJyb3IoZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSgnbm90aWZpY2F0aW9uJywge1xuICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgIG1lc3NhZ2U6IGVycm9yLFxuICAgIH0pO1xuICB9XG5cbiAgX2VtaXRTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9jb25uZWN0aW9uU3RhdHVzRW1pdHRlci5lbWl0KENPTk5FQ1RJT05fTVVYX1NUQVRVU19FVkVOVCwgc3RhdHVzKTtcbiAgfVxuXG4gIGFzeW5jIHJ1bnRpbWVFdmFsdWF0ZShleHByZXNzaW9uOiBzdHJpbmcpOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIGxvZ2dlci5sb2coYHJ1bnRpbWVFdmFsdWF0ZSgpIG9uIGR1bW15IGNvbm5lY3Rpb24gZm9yOiAke2V4cHJlc3Npb259YCk7XG4gICAgaWYgKHRoaXMuX2R1bW15Q29ubmVjdGlvbiAhPSBudWxsKSB7XG4gICAgICAvLyBHbG9iYWwgcnVudGltZSBldmFsdWF0aW9uIG9uIGR1bW15IGNvbm5lY3Rpb24gZG9lcyBub3QgY2FyZSBhYm91dFxuICAgICAgLy8gd2hpY2ggZnJhbWUgaXQgaXMgYmVpbmcgZXZhbHVhdGVkIG9uIHNvIGNob29zZSB0b3AgZnJhbWUgaGVyZS5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2R1bW15Q29ubmVjdGlvbi5ydW50aW1lRXZhbHVhdGUoMCwgZXhwcmVzc2lvbik7XG4gICAgICB0aGlzLl9yZXBvcnRFdmFsdWF0aW9uRmFpbHVyZUlmTmVlZGVkKGV4cHJlc3Npb24sIHJlc3VsdCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLl9ub0Nvbm5lY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGV2YWx1YXRlT25DYWxsRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyLCBleHByZXNzaW9uOiBzdHJpbmcpOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24uZXZhbHVhdGVPbkNhbGxGcmFtZShmcmFtZUluZGV4LCBleHByZXNzaW9uKTtcbiAgICAgIHRoaXMuX3JlcG9ydEV2YWx1YXRpb25GYWlsdXJlSWZOZWVkZWQoZXhwcmVzc2lvbiwgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IHRoaXMuX25vQ29ubmVjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgX3JlcG9ydEV2YWx1YXRpb25GYWlsdXJlSWZOZWVkZWQoZXhwcmVzc2lvbjogc3RyaW5nLCByZXN1bHQ6IEV2YWx1YXRpb25GYWlsdXJlUmVzdWx0KTogdm9pZCB7XG4gICAgaWYgKHJlc3VsdC53YXNUaHJvd24pIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPVxuICAgICAgICBgRmFpbGVkIHRvIGV2YWx1YXRlIFwiJHtleHByZXNzaW9ufVwiOiAoJHtyZXN1bHQuZXJyb3IuJC5jb2RlfSkgJHtyZXN1bHQuZXJyb3IubWVzc2FnZVswXX1gO1xuICAgICAgdGhpcy5fY2xpZW50Q2FsbGJhY2suc2VuZFVzZXJNZXNzYWdlKCdjb25zb2xlJywge1xuICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNldFBhdXNlT25FeGNlcHRpb25zKHN0YXRlOiBFeGNlcHRpb25TdGF0ZSk6IFByb21pc2Uge1xuICAgIHJldHVybiB0aGlzLl9icmVha3BvaW50U3RvcmUuc2V0UGF1c2VPbkV4Y2VwdGlvbnMoc3RhdGUpO1xuICB9XG5cbiAgc2V0QnJlYWtwb2ludChmaWxlbmFtZTogc3RyaW5nLCBsaW5lTnVtYmVyOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9icmVha3BvaW50U3RvcmUuc2V0QnJlYWtwb2ludChmaWxlbmFtZSwgbGluZU51bWJlcik7XG4gIH1cblxuICByZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5yZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZCk7XG4gIH1cblxuICBnZXRTdGFja0ZyYW1lcygpOiBQcm9taXNlPHtzdGFjazogT2JqZWN0fT4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLmdldFN0YWNrRnJhbWVzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoaXMgb2NjdXJzIG9uIHN0YXJ0dXAgd2l0aCB0aGUgbG9hZGVyIGJyZWFrcG9pbnQuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtzdGFjazoge319KTtcbiAgICB9XG4gIH1cblxuICBnZXRTY29wZXNGb3JGcmFtZShmcmFtZUluZGV4OiBudW1iZXIpOiBQcm9taXNlPEFycmF5PERlYnVnZ2VyJFNjb3BlPj4ge1xuICAgIGlmICh0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLmdldFNjb3Blc0ZvckZyYW1lKGZyYW1lSW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLl9ub0Nvbm5lY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIGdldFN0YXR1cygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdGF0dXM7XG4gIH1cblxuICBzZW5kQ29udGludWF0aW9uQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24pIHtcbiAgICAgIHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uLnNlbmRDb250aW51YXRpb25Db21tYW5kKGNvbW1hbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLl9ub0Nvbm5lY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIHNlbmRCcmVha0NvbW1hbmQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuX2VuYWJsZWRDb25uZWN0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW5hYmxlZENvbm5lY3Rpb24uc2VuZEJyZWFrQ29tbWFuZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBnZXRQcm9wZXJ0aWVzKHJlbW90ZUlkOiBSdW50aW1lJFJlbW90ZU9iamVjdElkKTogUHJvbWlzZTxBcnJheTxSdW50aW1lJFByb3BlcnR5RGVzY3JpcHRvcj4+IHtcbiAgICBpZiAodGhpcy5fZW5hYmxlZENvbm5lY3Rpb24gJiYgdGhpcy5fc3RhdHVzID09PSBTVEFUVVNfQlJFQUspIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbi5nZXRQcm9wZXJ0aWVzKHJlbW90ZUlkKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2R1bW15Q29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuX2R1bW15Q29ubmVjdGlvbi5nZXRQcm9wZXJ0aWVzKHJlbW90ZUlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5fbm9Db25uZWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGZvciAoY29uc3QgY29ubmVjdGlvbiBvZiB0aGlzLl9jb25uZWN0aW9ucy5rZXlzKCkpIHtcbiAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgfVxuICAgIGlmICh0aGlzLl9sYXVuY2hlZFNjcmlwdFByb2Nlc3MgIT0gbnVsbCAmJiB0aGlzLl9zdGF0dXMgPT09IFNUQVRVU19FTkQpIHtcbiAgICAgIGF3YWl0IHRoaXMuX2xhdW5jaGVkU2NyaXB0UHJvY2VzcztcbiAgICB9XG4gICAgaWYgKHRoaXMuX2R1bW15UmVxdWVzdFByb2Nlc3MpIHtcbiAgICAgIHRoaXMuX2R1bW15UmVxdWVzdFByb2Nlc3Mua2lsbCgnU0lHS0lMTCcpO1xuICAgIH1cbiAgICB0aGlzLl9kaXNwb3NlTGF1bmNoQ29ubmVjdG9yKCk7XG4gICAgdGhpcy5fZGlzcG9zZUF0dGFjaENvbm5lY3RvcigpO1xuICB9XG5cbiAgX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbjogQ29ubmVjdGlvbik6IHZvaWQge1xuICAgIGNvbnN0IGluZm8gPSB0aGlzLl9jb25uZWN0aW9ucy5nZXQoY29ubmVjdGlvbik7XG4gICAgaW52YXJpYW50KGluZm8gIT0gbnVsbCk7XG4gICAgaW5mby5vblN0YXR1c0Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIGNvbm5lY3Rpb24uZGlzcG9zZSgpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25zLmRlbGV0ZShjb25uZWN0aW9uKTtcblxuICAgIGlmIChjb25uZWN0aW9uID09PSB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbikge1xuICAgICAgdGhpcy5fZGlzYWJsZUNvbm5lY3Rpb24oKTtcbiAgICB9XG4gICAgdGhpcy5fY2hlY2tGb3JFbmQoKTtcbiAgfVxuXG4gIF9kaXNhYmxlQ29ubmVjdGlvbigpOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKCdNdXggZGlzYWJsaW5nIGNvbm5lY3Rpb24nKTtcbiAgICB0aGlzLl9lbmFibGVkQ29ubmVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fc2V0U3RhdHVzKFNUQVRVU19SVU5OSU5HKTtcbiAgfVxuXG4gIF9kaXNwb3NlQXR0YWNoQ29ubmVjdG9yKCk6IHZvaWQge1xuICAgIC8vIEF2b2lkIHJlY3Vyc2lvbiB3aXRoIGNvbm5lY3RvcidzIG9uQ2xvc2UgZXZlbnQuXG4gICAgY29uc3QgY29ubmVjdG9yID0gdGhpcy5fYXR0YWNoQ29ubmVjdG9yO1xuICAgIGlmIChjb25uZWN0b3IgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYXR0YWNoQ29ubmVjdG9yID0gbnVsbDtcbiAgICAgIGNvbm5lY3Rvci5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX2NoZWNrRm9yRW5kKCk7XG4gIH1cblxuICBfZGlzcG9zZUxhdW5jaENvbm5lY3RvcigpOiB2b2lkIHtcbiAgICAvLyBBdm9pZCByZWN1cnNpb24gd2l0aCBjb25uZWN0b3IncyBvbkNsb3NlIGV2ZW50LlxuICAgIGNvbnN0IGNvbm5lY3RvciA9IHRoaXMuX2xhdW5jaENvbm5lY3RvcjtcbiAgICBpZiAoY29ubmVjdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2xhdW5jaENvbm5lY3RvciA9IG51bGw7XG4gICAgICBjb25uZWN0b3IuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9jaGVja0ZvckVuZCgpO1xuICB9XG5cbiAgX2NoZWNrRm9yRW5kKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb25uZWN0aW9ucy5zaXplID09PSAwICYmXG4gICAgICAodGhpcy5fYXR0YWNoQ29ubmVjdG9yID09IG51bGwgfHxcbiAgICAgICAgdGhpcy5fbGF1bmNoQ29ubmVjdG9yID09IG51bGwgfHxcbiAgICAgICAgZ2V0Q29uZmlnKCkuZW5kRGVidWdXaGVuTm9SZXF1ZXN0cykpIHtcbiAgICAgIHRoaXMuX3NldFN0YXR1cyhTVEFUVVNfRU5EKTtcbiAgICB9XG4gIH1cblxuICBfbm9Db25uZWN0aW9uRXJyb3IoKTogRXJyb3Ige1xuICAgIC8vIFRoaXMgaXMgYW4gaW5kaWNhdGlvbiBvZiBhIGJ1ZyBpbiB0aGUgc3RhdGUgbWFjaGluZS5cbiAgICAvLyAuLiB3ZSBhcmUgc2VlaW5nIGEgcmVxdWVzdCBpbiBhIHN0YXRlIHRoYXQgc2hvdWxkIG5vdCBnZW5lcmF0ZVxuICAgIC8vIHRoYXQgcmVxdWVzdC5cbiAgICByZXR1cm4gbmV3IEVycm9yKCdObyBjb25uZWN0aW9uJyk7XG4gIH1cblxuICBhc3luYyBfaGFuZGxlU2V0dXBGb3JDb25uZWN0aW9uKGNvbm5lY3Rpb246IENvbm5lY3Rpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBTdGRvdXQvZXJyIGNvbW1hbmRzLlxuICAgIGNvbnN0IHN0ZG91dFJlcXVlc3RTdWNjZWVkZWQgPSBhd2FpdCBjb25uZWN0aW9uLnNlbmRTdGRvdXRSZXF1ZXN0KCk7XG4gICAgaWYgKCFzdGRvdXRSZXF1ZXN0U3VjY2VlZGVkKSB7XG4gICAgICBsb2dnZXIubG9nRXJyb3IoJ0hIVk0gcmV0dXJuZWQgZmFpbHVyZSBmb3IgYSBzdGRvdXQgcmVxdWVzdCcpO1xuICAgICAgdGhpcy5fY2xpZW50Q2FsbGJhY2suc2VuZFVzZXJNZXNzYWdlKCdvdXRwdXRXaW5kb3cnLCB7XG4gICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgICB0ZXh0OiAnSEhWTSBmYWlsZWQgdG8gcmVkaXJlY3Qgc3Rkb3V0LCBzbyBubyBvdXRwdXQgd2lsbCBiZSBzZW50IHRvIHRoZSBvdXRwdXQgd2luZG93LicsXG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gVE9ETzogU3RkZXJyIHJlZGlyZWN0aW9uIGlzIG5vdCBpbXBsZW1lbnRlZCBpbiBISFZNIHNvIHdlIHdvbid0IGNoZWNrIHRoaXMgcmV0dXJuIHZhbHVlLlxuICAgIGF3YWl0IGNvbm5lY3Rpb24uc2VuZFN0ZGVyclJlcXVlc3QoKTtcblxuICAgIC8vIFNldCBmZWF0dXJlcy5cbiAgICAvLyBtYXhfZGVwdGggc2V0cyB0aGUgZGVwdGggdGhhdCB0aGUgZGVidWdnZXIgZW5naW5lIHJlc3BlY3RzIHdoZW5cbiAgICAvLyByZXR1cm5pbmcgaGllcmFyY2hpY2FsIGRhdGEuXG4gICAgbGV0IHNldEZlYXR1cmVTdWNjZWVkZWQgPSBhd2FpdCBjb25uZWN0aW9uLnNldEZlYXR1cmUoJ21heF9kZXB0aCcsICc1Jyk7XG4gICAgaWYgKCFzZXRGZWF0dXJlU3VjY2VlZGVkKSB7XG4gICAgICBsb2dnZXIubG9nRXJyb3IoJ0hIVk0gcmV0dXJuZWQgZmFpbHVyZSBmb3Igc2V0dGluZyBmZWF0dXJlIG1heF9kZXB0aCcpO1xuICAgIH1cbiAgICAvLyBzaG93X2hpZGRlbiBhbGxvd3MgdGhlIGNsaWVudCB0byByZXF1ZXN0IGRhdGEgZnJvbSBwcml2YXRlIGNsYXNzIG1lbWJlcnMuXG4gICAgc2V0RmVhdHVyZVN1Y2NlZWRlZCA9IGF3YWl0IGNvbm5lY3Rpb24uc2V0RmVhdHVyZSgnc2hvd19oaWRkZW4nLCAnMScpO1xuICAgIGlmICghc2V0RmVhdHVyZVN1Y2NlZWRlZCkge1xuICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdISFZNIHJldHVybmVkIGZhaWx1cmUgZm9yIHNldHRpbmcgZmVhdHVyZSBzaG93X2hpZGRlbicpO1xuICAgIH1cbiAgfVxufVxuIl19