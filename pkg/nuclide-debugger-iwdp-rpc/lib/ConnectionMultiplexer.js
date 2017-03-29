'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectionMultiplexer = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _BreakpointManager;

function _load_BreakpointManager() {
  return _BreakpointManager = require('./BreakpointManager');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { log, logError } = (_logger || _load_logger()).logger;

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
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class ConnectionMultiplexer {

  constructor(sendMessageToClient) {
    this._connections = new Set();
    this._sendMessageToClient = message => sendMessageToClient(message);
    this._freshConnectionId = 0;
    this._newConnections = new _rxjsBundlesRxMinJs.Subject();
    this._breakpointManager = new (_BreakpointManager || _load_BreakpointManager()).BreakpointManager(this._sendMessageToClient.bind(this));
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._newConnections.subscribe(this._handleNewConnection.bind(this)), this._breakpointManager);
  }
  // Invariant: this._enabledConnection != null, if and only if that connection is paused.


  sendCommand(message) {
    const [domain, method] = message.method.split('.');
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
          this._replyWithError(message.id, `Unhandled message: ${JSON.stringify(message)}`);
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
            const response = yield _this._breakpointManager.setBreakpointByUrl(message);
            response.id = message.id;
            _this._sendMessageToClient(response);
            break;
          }
        case 'removeBreakpoint':
          {
            const response = yield _this._breakpointManager.removeBreakpoint(message);
            response.id = message.id;
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
            const response = yield _this._breakpointManager.setPauseOnExceptions(message);
            response.id = message.id;
            _this._sendMessageToClient(response);
            break;
          }

        // Events.  Typically we will just forward these to the client.
        case 'scriptParsed':
          {
            _this._sendMessageToClient(message);
            break;
          }
        case 'paused':
          {
            // TODO: We may want to send Debugger.resumed here before the Debugger.paused event.
            // This is because we may already be paused, and wish to update the UI when we switch the
            // enabled connection.
            _this._sendMessageToClient(message);
            _this._updateThreads();
            break;
          }
        case 'resumed':
          {
            _this._sendMessageToClient(message);
            break;
          }

        default:
          {
            _this._replyWithError(message.id, `Unhandled message: ${JSON.stringify(message)}`);
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
          this._replyWithError(message.id, `Unhandled message: ${JSON.stringify(message)}`);
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
          this._replyWithError(message.id, `Unhandled message: ${JSON.stringify(message)}`);
        }
    }
  }

  _replyWithDefaultSuccess(id) {
    this._sendMessageToClient({ id, result: {} });
  }

  _replyWithError(id, message) {
    this._sendMessageToClient({ id, error: { message } });
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
        response.id = message.id;
        _this3._sendMessageToClient(response);
      } else {
        _this3._replyWithError(message.id, `${message.method} sent to running connection`);
      }
    })();
  }

  _continuationCommand(id, method) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this4._enabledConnection != null) {
        const response = yield _this4._enabledConnection.sendCommand({
          id,
          method: `Debugger.${method}`
        });
        _this4._sendMessageToClient(response);
      } else {
        _this4._replyWithError(id, `Debugger.${method} sent to running connection`);
      }
      return Promise.resolve();
    })();
  }

  add(deviceInfo) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const connection = _this5._connectToContext(deviceInfo);
      _this5._newConnections.next(connection);
    })();
  }

  _connectToContext(deviceInfo) {
    const connection = new (_DebuggerConnection || _load_DebuggerConnection()).DebuggerConnection(this._freshConnectionId++, deviceInfo);
    // While it is the CM's responsibility to create these subscriptions, their lifetimes are the
    // same as the connection, so their disposal will be handled by the connection.
    connection.onDispose(connection.getStatusChanges().subscribe(status => this._handleStatusChange(status, connection)), connection.subscribeToEvents(this.sendCommand.bind(this)));
    this._disposables.add(connection);
    this._connections.add(connection);
    return connection;
  }

  _handleNewConnection(connection) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // When a connection comes in, we need to do a few things:
      // 1. Exchange prelude messages, enabling the relevant domains, etc.
      yield _this6._sendPreludeToTarget(connection);
      // 2. Add this connection to the breakpoint manager so that will handle breakpoints.
      yield _this6._breakpointManager.addConnection(connection);
    })();
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
        const err = `A prelude message response was an error: ${JSON.stringify(responses)}`;
        logError(err);
        throw new Error(err);
      }
    })();
  }

  _handleStatusChange(status, connection) {
    switch (status) {
      case (_constants || _load_constants()).RUNNING:
        {
          this._handleRunningMode(connection);
          break;
        }
      case (_constants || _load_constants()).PAUSED:
        {
          this._handlePausedMode(connection);
          break;
        }
      case (_constants || _load_constants()).ENDED:
        {
          this._handleEndedMode(connection);
          break;
        }
      default:
        {
          if (!false) {
            throw new Error(`Unknown status: ${status}`);
          }
        }
    }
    log(`Switching status to: ${status}`);
  }

  _handleRunningMode(connection) {
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

  _handleEndedMode(connection) {
    this._breakpointManager.removeConnection(connection);
    const wasFound = this._connections.delete(connection);
    if (wasFound) {
      this._disposables.remove(connection);
      connection.dispose();
    }
  }

  _updateThreads() {
    for (const connection of this._connections.values()) {
      this._sendMessageToClient({
        method: 'Debugger.threadUpdated',
        params: {
          thread: {
            id: String(connection.getId()),
            name: connection.getName(),
            address: connection.getName(),
            location: {},
            stopReason: connection.getStatus(),
            description: connection.getName()
          }
        }
      });
    }
  }

  dispose() {
    this._disposables.dispose();
  }
}
exports.ConnectionMultiplexer = ConnectionMultiplexer;