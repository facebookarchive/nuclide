'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectionMultiplexer = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _logger;

function _load_logger() {
  return _logger = require('./logger');
}

var _DebuggerConnection;

function _load_DebuggerConnection() {
  return _DebuggerConnection = require('./DebuggerConnection');
}

var _prelude;

function _load_prelude() {
  return _prelude = require('./prelude');
}

var _FileCache;

function _load_FileCache() {
  return _FileCache = require('./FileCache');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (_logger || _load_logger()).logger.log,
      logError = (_logger || _load_logger()).logger.logError;

/**
 * The ConnectionMultiplexer (CM) abstracts the many DebuggerConnections for each JSContext as one
 * single connection.  The frontend Nuclide client only has to be aware of this single connection.
 * There are three important APIs for this class:
 *
 * 1. When the CM is constructed, it must be passed a callback which will be called whenever the
 * target has a message to send to the frontend client.
 * 2. The `sendCommand` method can be called when the frontend client has a message to send to the
 * target.
 * 3. The `add` method can be called to add an additonal connection to be managed by the CM.
 */


let ConnectionMultiplexer = exports.ConnectionMultiplexer = class ConnectionMultiplexer {

  constructor(sendMessageToClient) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._connections = new Set();
    this._sendMessageToClient = message => sendMessageToClient(message);
    this._fileCache = new (_FileCache || _load_FileCache()).FileCache();
    this._breakpoints = new Map();
    this._setPauseOnExceptionsState = 'none';
  }
  // Invariant: this._enabledConnection != null, if and only if that connection is paused.


  sendCommand(message) {
    var _message$method$split = message.method.split('.'),
        _message$method$split2 = _slicedToArray(_message$method$split, 2);

    const domain = _message$method$split2[0],
          method = _message$method$split2[1];

    switch (domain) {
      case 'Debugger':
        {
          this._handleDebuggerMethod(method, message);
          break;
        }
      case 'Runtime':
        {
          this._handleRuntimeMethod(method, message);
          break;
        }
      case 'Console':
        {
          this._handleConsoleMethod(method, message);
          break;
        }
      default:
        {
          this._replyWithError(message.id, `Unhandled message: ${ JSON.stringify(message) }`);
        }
    }
  }

  _handleDebuggerMethod(method, message) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      switch (method) {
        // Methods.
        case 'enable':
          {
            _this._replyWithDefaultSuccess(message.id);
            // Nuclide's debugger will auto-resume the first pause event, so we send a dummy pause
            // when the debugger initially attaches.
            _this._sendFakeLoaderBreakpointPause();
            break;
          }
        case 'setBreakpointByUrl':
          {
            const response = yield _this._setBreakpointByUrl(message);
            _this._sendMessageToClient(response);
            break;
          }
        case 'removeBreakpoint':
          {
            const response = yield _this._removeBreakpoint(message);
            _this._sendMessageToClient(response);
            break;
          }
        case 'resume':
          {
            _this._continuationCommand(message.id, method);
            break;
          }
        case 'stepOver':
          {
            _this._continuationCommand(message.id, method);
            break;
          }
        case 'stepInto':
          {
            _this._continuationCommand(message.id, method);
            break;
          }
        case 'stepOut':
          {
            _this._continuationCommand(message.id, method);
            break;
          }
        case 'evaluateOnCallFrame':
          {
            _this._evaluateOnCallFrame(message);
            break;
          }
        case 'setPauseOnExceptions':
          {
            const response = yield _this._setPauseOnExceptions(message);
            _this._sendMessageToClient(response);
            break;
          }

        // Events.  Typically we will just forward these to the client.
        case 'scriptParsed':
          {
            const clientMessage = yield _this._fileCache.scriptParsed(message);
            _this._sendMessageToClient(clientMessage);
            break;
          }
        case 'paused':
          {
            // TODO: We may want to send Debugger.resumed here before the Debugger.paused event.
            // This is because we may already be paused, and wish to update the UI when we switch the
            // enabled connection.
            _this._sendMessageToClient(message);
            break;
          }
        case 'resumed':
          {
            _this._sendMessageToClient(message);
            break;
          }

        default:
          {
            _this._replyWithError(message.id, `Unhandled message: ${ JSON.stringify(message) }`);
          }
      }
    })();
  }

  _handleRuntimeMethod(method, message) {
    switch (method) {
      case 'enable':
        {
          this._replyWithDefaultSuccess(message.id);
          break;
        }
      case 'getProperties':
        {
          this._getProperties(message);
          break;
        }
      default:
        {
          this._replyWithError(message.id, `Unhandled message: ${ JSON.stringify(message) }`);
        }
    }
  }

  _handleConsoleMethod(method, message) {
    switch (method) {
      case 'enable':
        {
          this._replyWithDefaultSuccess(message.id);
          break;
        }
      default:
        {
          this._replyWithError(message.id, `Unhandled message: ${ JSON.stringify(message) }`);
        }
    }
  }

  _replyWithDefaultSuccess(id) {
    this._sendMessageToClient({ id: id, result: {} });
  }

  _replyWithError(id, message) {
    this._sendMessageToClient({ id: id, error: { message: message } });
  }

  _sendFakeLoaderBreakpointPause() {
    const debuggerPausedMessage = {
      method: 'Debugger.paused',
      params: {
        callFrames: [],
        reason: 'breakpoint',
        data: {}
      }
    };
    this._sendMessageToClient(debuggerPausedMessage);
  }

  _getProperties(message) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this2._enabledConnection != null) {
        const response = yield _this2._enabledConnection.sendCommand(message);
        _this2._sendMessageToClient(response);
      } else if (_this2._connections.size > 0) {
        const connection = _this2._connections.values().next().value;

        if (!(connection != null)) {
          throw new Error('Invariant violation: "connection != null"');
        }

        const response = yield connection.sendCommand(message);
        _this2._sendMessageToClient(response);
      } else {
        _this2._replyWithError(message.id, 'Runtime.getProperties sent but we have no connections');
      }
    })();
  }

  _evaluateOnCallFrame(message) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this3._enabledConnection != null) {
        const response = yield _this3._enabledConnection.sendCommand(message);
        _this3._sendMessageToClient(response);
      } else {
        _this3._replyWithError(message.id, `${ message.method } sent to running connection`);
      }
    })();
  }

  _continuationCommand(id, method) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this4._enabledConnection != null) {
        const response = yield _this4._enabledConnection.sendCommand({
          id: id,
          method: `Debugger.${ method }`
        });
        _this4._sendMessageToClient(response);
      } else {
        _this4._replyWithError(id, `Debugger.${ method } sent to running connection`);
      }
      return Promise.resolve();
    })();
  }

  _setPauseOnExceptions(message) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this5._connections.size === 0) {
        return { id: message.id, error: { message: 'setPauseOnExceptions sent with no connections.' } };
      }
      _this5._setPauseOnExceptionsState = message.params.state;
      const responsePromises = [];
      for (const connection of _this5._connections) {
        responsePromises.push(connection.sendCommand(message));
      }
      const responses = yield Promise.all(responsePromises);
      log(`setPauseOnExceptions yielded: ${ JSON.stringify(responses) }`);
      for (const response of responses) {
        // We can receive multiple responses, so just send the first non-error one.
        if (response.result != null && response.error == null) {
          return response;
        }
      }
      return responses[0];
    })();
  }

  /**
   * setBreakpointByUrl must send this breakpoint to each connection managed by the multiplexer.
   */
  _setBreakpointByUrl(message) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this6._connections.size === 0) {
        return { id: message.id, error: { message: 'setBreakpointByUrl sent with no connections.' } };
      }
      const params = message.params;

      const targetMessage = Object.assign({}, message, {
        params: Object.assign({}, message.params, {
          url: _this6._fileCache.getUrlFromFilePath(message.params.url)
        })
      });
      const responsePromises = Array.from(_this6._connections.values()).map(function (connection) {
        return connection.sendCommand(targetMessage);
      });
      const responses = yield Promise.all(responsePromises);
      log(`setBreakpointByUrl yielded: ${ JSON.stringify(responses) }`);
      for (const response of responses) {
        // We will receive multiple responses, so just send the first non-error one.
        if (response.result != null && response.error == null) {
          _this6._breakpoints.set(response.result.breakpointId, params);
          return response;
        }
      }
      return responses[0];
    })();
  }

  /**
   * removeBreakpoint must send this message to each connection managed by the multiplexer.
   */
  _removeBreakpoint(message) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this7._connections.size === 0) {
        return { id: message.id, error: { message: 'removeBreakpoint sent with no connections.' } };
      }
      const responsePromises = Array.from(_this7._connections.values()).map(function (connection) {
        return connection.sendCommand(message);
      });
      const responses = yield Promise.all(responsePromises);
      log(`removeBreakpoint yielded: ${ JSON.stringify(responses) }`);
      for (const response of responses) {
        // We will receive multiple responses, so just send the first non-error one.
        if (response.result != null && response.error == null) {
          _this7._breakpoints.delete(response.result.breakpointId);
          return response;
        }
      }
      return responses[0];
    })();
  }

  add(deviceInfo) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Adding a new JS Context involves a few steps:
      // 1. Set up the connection to the device.
      const connection = _this8._connectToContext(deviceInfo);
      // 2. Exchange prelude messages, enabling the relevant domains, etc.
      yield _this8._sendPreludeToTarget(connection);
      yield Promise.all([
      // 3. Once this is done, set all of the breakpoints we currently have.
      _this8._sendBreakpointsToTarget(connection),
      // 4. Set the pause on exception state.
      _this8._sendSetPauseOnExceptionToTarget(connection)]);
    })();
  }

  _connectToContext(deviceInfo) {
    const connection = new (_DebuggerConnection || _load_DebuggerConnection()).DebuggerConnection(deviceInfo);
    this._disposables.add(connection.getStatusChanges().subscribe(status => this._handleStatusChange(status, connection)), connection.subscribeToEvents(this.sendCommand.bind(this)));
    this._connections.add(connection);
    return connection;
  }

  _sendPreludeToTarget(connection) {
    return (0, _asyncToGenerator.default)(function* () {
      const responsePromises = [];
      for (const message of (_prelude || _load_prelude()).PRELUDE_MESSAGES) {
        responsePromises.push(connection.sendCommand(message));
      }
      const responses = yield Promise.all(responsePromises);
      if (!responses.every(function (response) {
        return response.result != null && response.error == null;
      })) {
        const err = `A prelude message response was an error: ${ JSON.stringify(responses) }`;
        logError(err);
        throw new Error(err);
      }
    })();
  }

  _sendBreakpointsToTarget(connection) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const responsePromises = [];
      for (const breakpointParams of _this9._breakpoints.values()) {
        responsePromises.push(connection.sendCommand({
          method: 'Debugger.setBreakpointByUrl',
          params: Object.assign({}, breakpointParams, {
            url: _this9._fileCache.getUrlFromFilePath(breakpointParams.url)
          })
        }));
      }
      // Drop the responses on the floor, since setting initial bp's is handled by CM.
      yield Promise.all(responsePromises);
    })();
  }

  _sendSetPauseOnExceptionToTarget(connection) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Drop the responses on the floor, since setting initial pauseOnException is handled by CM.
      yield connection.sendCommand({
        method: 'Debugger.setPauseOnExceptions',
        params: _this10._setPauseOnExceptionsState
      });
    })();
  }

  _handleStatusChange(status, connection) {
    switch (status) {
      case (_constants || _load_constants()).RUNNING:
        {
          this._handleRunningMode();
          break;
        }
      case (_constants || _load_constants()).PAUSED:
        {
          this._handlePausedMode(connection);
          break;
        }
      default:
        {
          if (!false) {
            throw new Error(`Unknown status: ${ status }`);
          }
        }
    }
    log(`Switching status to: ${ status }`);
  }

  _handleRunningMode() {
    // We will enable another paused connection if one exists.
    for (const candidate of this._connections) {
      if (candidate.isPaused()) {
        this._enabledConnection = candidate;
        return;
      }
    }
    this._enabledConnection = null;
  }

  _handlePausedMode(connection) {
    if (this._enabledConnection == null) {
      this._enabledConnection = connection;
    }
  }

  dispose() {
    this._disposables.dispose();
  }
};