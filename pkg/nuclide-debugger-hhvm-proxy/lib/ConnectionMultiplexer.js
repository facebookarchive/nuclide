Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var _helpers2;

function _helpers() {
  return _helpers2 = require('./helpers');
}

var _Connection2;

function _Connection() {
  return _Connection2 = require('./Connection');
}

var _config2;

function _config() {
  return _config2 = require('./config');
}

var _ConnectionUtils2;

function _ConnectionUtils() {
  return _ConnectionUtils2 = require('./ConnectionUtils');
}

var _BreakpointStore2;

function _BreakpointStore() {
  return _BreakpointStore2 = require('./BreakpointStore');
}

var _DbgpConnector2;

function _DbgpConnector() {
  return _DbgpConnector2 = require('./DbgpConnector');
}

var _DbgpSocket2;

function _DbgpSocket() {
  return _DbgpSocket2 = require('./DbgpSocket');
}

var _events2;

function _events() {
  return _events2 = require('events');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _ClientCallback2;

function _ClientCallback() {
  return _ClientCallback2 = require('./ClientCallback');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

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
    this._status = (_DbgpSocket2 || _DbgpSocket()).STATUS_STARTING;
    this._connectionStatusEmitter = new (_events2 || _events()).EventEmitter();
    this._enabledConnection = null;
    this._dummyConnection = null;
    this._connections = new Map();
    this._attachConnector = null;
    this._launchConnector = null;
    this._dummyRequestProcess = null;
    this._breakpointStore = new (_BreakpointStore2 || _BreakpointStore()).BreakpointStore();
    this._launchedScriptProcess = null;
    this._launchedScriptProcessPromise = null;
  }

  _createClass(ConnectionMultiplexer, [{
    key: 'onStatus',
    value: function onStatus(callback) {
      return (0, (_commonsNodeEvent2 || _commonsNodeEvent()).attachEvent)(this._connectionStatusEmitter, CONNECTION_MUX_STATUS_EVENT, callback);
    }
  }, {
    key: 'listen',
    value: function listen() {
      var _this = this;

      var _ref = (0, (_config2 || _config()).getConfig)();

      var xdebugAttachPort = _ref.xdebugAttachPort;
      var xdebugLaunchingPort = _ref.xdebugLaunchingPort;
      var launchScriptPath = _ref.launchScriptPath;

      if (launchScriptPath == null) {
        // When in attach mode we are guaranteed that the two ports are not equal.
        (0, (_assert2 || _assert()).default)(xdebugAttachPort !== xdebugLaunchingPort, 'xdebug ports are equal in attach mode');
        // In this case we need to listen for incoming connections to attach to, as well as on the
        // port that the dummy connection will use.
        this._attachConnector = this._setupConnector(xdebugAttachPort, this._disposeAttachConnector.bind(this));
      }

      // If we are only doing script debugging, then the dummy connection listener's port can also be
      // used to listen for the script's xdebug requests.
      this._launchConnector = this._setupConnector(xdebugLaunchingPort, this._disposeLaunchConnector.bind(this));

      this._status = (_DbgpSocket2 || _DbgpSocket()).STATUS_RUNNING;

      this._clientCallback.sendUserMessage('console', {
        level: 'warning',
        text: 'Pre-loading, please wait...'
      });
      this._dummyRequestProcess = (0, (_ConnectionUtils2 || _ConnectionUtils()).sendDummyRequest)();

      if (launchScriptPath != null) {
        this._launchedScriptProcessPromise = new Promise(function (resolve) {
          _this._launchedScriptProcess = (0, (_helpers2 || _helpers()).launchPhpScriptWithXDebugEnabled)(launchScriptPath, function (text) {
            _this._clientCallback.sendUserMessage('outputWindow', { level: 'info', text: text });
            resolve();
          });
        });
      }
    }
  }, {
    key: '_setupConnector',
    value: function _setupConnector(port, disposeConnector) {
      var connector = new (_DbgpConnector2 || _DbgpConnector()).DbgpConnector(port);
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

      (_utils2 || _utils()).default.log('ConnectionMultiplexer successfully got dummy connection.');
      var dummyConnection = new (_Connection2 || _Connection()).Connection(socket);
      yield this._handleSetupForConnection(dummyConnection);

      // Continue from loader breakpoint to hit xdebug_break()
      // which will load whole www repo for evaluation if possible.
      yield dummyConnection.sendContinuationCommand((_DbgpSocket2 || _DbgpSocket()).COMMAND_RUN);
      dummyConnection.onStatus(function (status, message) {
        switch (status) {
          case (_DbgpSocket2 || _DbgpSocket()).STATUS_STDOUT:
            _this2._sendOutput(message, 'log');
            break;
          case (_DbgpSocket2 || _DbgpSocket()).STATUS_STDERR:
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

      if (!(0, (_ConnectionUtils2 || _ConnectionUtils()).isCorrectConnection)(message)) {
        (0, (_ConnectionUtils2 || _ConnectionUtils()).failConnection)(socket, 'Discarding connection ' + JSON.stringify(message));
        return;
      }
      if ((0, (_ConnectionUtils2 || _ConnectionUtils()).isDummyConnection)(message)) {
        yield this._handleDummyConnection(socket);
      } else {
        yield* (function* () {
          var connection = new (_Connection2 || _Connection()).Connection(socket);
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
            status: (_DbgpSocket2 || _DbgpSocket()).STATUS_STARTING
          };
          _this3._connections.set(connection, info);

          var status = undefined;
          try {
            status = yield connection.getStatus();
          } catch (e) {
            (_utils2 || _utils()).default.logError('Error getting initial connection status: ' + e.message);
            status = (_DbgpSocket2 || _DbgpSocket()).STATUS_ERROR;
          }
          _this3._connectionOnStatus(connection, status);
        })();
      }
    })
  }, {
    key: '_connectionOnStatus',
    value: function _connectionOnStatus(connection, status) {
      (_utils2 || _utils()).default.log('Mux got status: ' + status + ' on connection ' + connection.getId());
      var connectionInfo = this._connections.get(connection);
      (0, (_assert2 || _assert()).default)(connectionInfo != null);

      switch (status) {
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_STARTING:
          // Starting status has no stack.
          // step before reporting initial status to get to the first instruction.
          // TODO: Use loader breakpoint configuration to choose between step/run.
          connectionInfo.status = status;
          connection.sendContinuationCommand((_DbgpSocket2 || _DbgpSocket()).COMMAND_RUN);
          return;
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_STOPPING:
          // TODO: May want to enable post-mortem features?
          connectionInfo.status = status;
          connection.sendContinuationCommand((_DbgpSocket2 || _DbgpSocket()).COMMAND_RUN);
          return;
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_RUNNING:
          connectionInfo.status = status;
          if (connection === this._enabledConnection) {
            this._disableConnection();
          }
          break;
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_BREAK:
          connectionInfo.status = status;
          if (connection === this._enabledConnection) {
            // This can happen when we step.
            (_utils2 || _utils()).default.log('Mux break on enabled connection');
            this._emitStatus((_DbgpSocket2 || _DbgpSocket()).STATUS_BREAK);
            return;
          }
          break;
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_ERROR:
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
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_STOPPED:
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_END:
          connectionInfo.status = status;
          this._removeConnection(connection);
          break;
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_STDOUT:
          this._sendOutput(arguments[2], 'log');
          break;
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_STDERR:
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
      if (this._status === (_DbgpSocket2 || _DbgpSocket()).STATUS_END) {
        return;
      }

      if (this._status === (_DbgpSocket2 || _DbgpSocket()).STATUS_BREAK) {
        (_utils2 || _utils()).default.log('Mux already in break status');
        return;
      }

      // now check if we can move from running to break...
      for (var connectionInfo of this._connections.values()) {
        if (connectionInfo.status === (_DbgpSocket2 || _DbgpSocket()).STATUS_BREAK) {
          this._enableConnection(connectionInfo.connection);
          break;
        }
      }
    }
  }, {
    key: '_enableConnection',
    value: function _enableConnection(connection) {
      (_utils2 || _utils()).default.log('Mux enabling connection');
      this._enabledConnection = connection;
      this._setStatus((_DbgpSocket2 || _DbgpSocket()).STATUS_BREAK);
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
      (_utils2 || _utils()).default.log('runtimeEvaluate() on dummy connection for: ' + expression);
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
      if (this._enabledConnection && this._status === (_DbgpSocket2 || _DbgpSocket()).STATUS_BREAK) {
        return this._enabledConnection.getProperties(remoteId);
      } else if (this._dummyConnection) {
        return this._dummyConnection.getProperties(remoteId);
      } else {
        throw this._noConnectionError();
      }
    }
  }, {
    key: '_removeConnection',
    value: function _removeConnection(connection) {
      var info = this._connections.get(connection);
      (0, (_assert2 || _assert()).default)(info != null);
      info.onStatusDisposable.dispose();
      connection.dispose();
      this._connections.delete(connection);

      if (connection === this._enabledConnection) {
        this._disableConnection();
      }
      this._checkForEnd();
    }
  }, {
    key: '_disableConnection',
    value: function _disableConnection() {
      (_utils2 || _utils()).default.log('Mux disabling connection');
      this._enabledConnection = null;
      this._setStatus((_DbgpSocket2 || _DbgpSocket()).STATUS_RUNNING);
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
    value: _asyncToGenerator(function* () {
      if (this._connections.size === 0 && (this._attachConnector == null || this._launchConnector == null || (0, (_config2 || _config()).getConfig)().endDebugWhenNoRequests)) {

        if (this._launchedScriptProcessPromise != null) {
          yield this._launchedScriptProcessPromise;
          this._launchedScriptProcessPromise = null;
        }

        this._setStatus((_DbgpSocket2 || _DbgpSocket()).STATUS_END);
      }
    })
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
        (_utils2 || _utils()).default.logError('HHVM returned failure for a stdout request');
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
        (_utils2 || _utils()).default.logError('HHVM returned failure for setting feature max_depth');
      }
      // show_hidden allows the client to request data from private class members.
      setFeatureSucceeded = yield connection.setFeature('show_hidden', '1');
      if (!setFeatureSucceeded) {
        (_utils2 || _utils()).default.logError('HHVM returned failure for setting feature show_hidden');
      }
    })
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._launchedScriptProcess != null) {
        this._launchedScriptProcessPromise = null;
        this._launchedScriptProcess.kill('SIGKILL');
        this._launchedScriptProcess = null;
      }
      for (var _connection of this._connections.keys()) {
        this._removeConnection(_connection);
      }
      if (this._dummyRequestProcess) {
        this._dummyRequestProcess.kill('SIGKILL');
      }
      this._disposeLaunchConnector();
      this._disposeAttachConnector();
    }
  }]);

  return ConnectionMultiplexer;
})();

exports.ConnectionMultiplexer = ConnectionMultiplexer;