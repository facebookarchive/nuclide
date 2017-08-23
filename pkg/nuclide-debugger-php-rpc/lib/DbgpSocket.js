'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DbgpSocket = exports.COMMAND_DETACH = exports.COMMAND_STOP = exports.COMMAND_STEP_OUT = exports.COMMAND_STEP_OVER = exports.COMMAND_STEP_INTO = exports.COMMAND_RUN = exports.BREAKPOINT_RESOLVED_NOTIFICATION = exports.ConnectionStatus = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _dedent;

function _load_dedent() {
  return _dedent = _interopRequireDefault(require('dedent'));
}

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _helpers;

function _load_helpers() {
  return _helpers = require('./helpers');
}

var _events = _interopRequireDefault(require('events'));

var _DbgpMessageHandler;

function _load_DbgpMessageHandler() {
  return _DbgpMessageHandler = require('./DbgpMessageHandler');
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const ConnectionStatus = exports.ConnectionStatus = {
  // Responses to the DBGP 'status' command
  Starting: 'starting',
  Stopping: 'stopping',
  Stopped: 'stopped',
  Running: 'running',
  Break: 'break',
  // Error and End are not dbgp status codes, they relate to socket states.
  Error: 'error',
  End: 'end',
  // stdout and stderr are emitted when DBGP sends the corresponding message packets.
  Stdout: 'stdout',
  Stderr: 'stderr',
  // Break message statuses allow us to identify whether a connection stopped because of a break
  // message or a breakpoint
  BreakMessageReceived: 'status_break_message_received',
  BreakMessageSent: 'status_break_message_sent',
  // Indicates if the dummy connection should be shown in the UI.
  DummyIsViewable: 'dummy is viewable',
  DummyIsHidden: 'dummy is hidden'
};

// Notifications.
const BREAKPOINT_RESOLVED_NOTIFICATION = exports.BREAKPOINT_RESOLVED_NOTIFICATION = 'breakpoint_resolved';

// Valid continuation commands
const COMMAND_RUN = exports.COMMAND_RUN = 'run';
const COMMAND_STEP_INTO = exports.COMMAND_STEP_INTO = 'step_into';
const COMMAND_STEP_OVER = exports.COMMAND_STEP_OVER = 'step_over';
const COMMAND_STEP_OUT = exports.COMMAND_STEP_OUT = 'step_out';
const COMMAND_STOP = exports.COMMAND_STOP = 'stop';
const COMMAND_DETACH = exports.COMMAND_DETACH = 'detach';

const DBGP_SOCKET_STATUS_EVENT = 'dbgp-socket-status';
const DBGP_SOCKET_NOTIFICATION_EVENT = 'dbgp-socket-notification';

const STREAM_MESSAGE_MAX_SIZE = 1024;

const DEFAULT_DBGP_PROPERTY = {
  $: {
    type: 'undefined'
  }
};

/**
 * Handles sending and recieving dbgp messages over a net Socket.
 * Dbgp documentation can be found at http://xdebug.org/docs-dbgp.php
 */
class DbgpSocket {
  // Maps from transactionId -> call
  constructor(socket) {
    this._socket = socket;
    this._transactionId = 0;
    this._calls = new Map();
    this._emitter = new _events.default();
    this._emitter.setMaxListeners(100);
    this._isClosed = false;
    this._messageHandler = new (_DbgpMessageHandler || _load_DbgpMessageHandler()).DbgpMessageHandler();
    this._pendingEvalTransactionIds = new Set();
    this._lastContinuationCommandTransactionId = null;

    socket.on('end', this._onEnd.bind(this));
    socket.on('error', this._onError.bind(this));
    socket.on('data', this._onData.bind(this));
  }

  onStatus(callback) {
    return (0, (_event || _load_event()).attachEvent)(this._emitter, DBGP_SOCKET_STATUS_EVENT, callback);
  }

  onNotification(callback) {
    return (0, (_event || _load_event()).attachEvent)(this._emitter, DBGP_SOCKET_NOTIFICATION_EVENT, callback);
  }

  _onError(error) {
    // Not sure if hhvm is alive or not
    // do not set _isClosed flag so that detach will be sent before dispose().
    (_utils || _load_utils()).default.error('socket error ' + error.code);
    this._emitStatus(ConnectionStatus.Error, error.code);
  }

  _onEnd() {
    this._isClosed = true;
    this.dispose();
    this._emitStatus(ConnectionStatus.End);
  }

  _onData(data) {
    const message = data.toString();
    (_utils || _load_utils()).default.debug('Recieved data: ' + message);
    let responses = [];
    try {
      responses = this._messageHandler.parseMessages(message);
    } catch (e) {
      // If message parsing fails, then our contract with HHVM is violated and we need to kill the
      // connection.
      this._emitStatus(ConnectionStatus.Error, e.message);
      return;
    }
    responses.forEach(r => {
      const { response, stream, notify } = r;
      if (response) {
        this._handleResponse(response, message);
      } else if (stream != null) {
        this._handleStream(stream);
      } else if (notify != null) {
        this._handleNotification(notify);
      } else {
        (_utils || _load_utils()).default.error('Unexpected socket message: ' + message);
      }
    });
  }

  _handleResponse(response, message) {
    const responseAttributes = response.$;
    const { command, transaction_id, status } = responseAttributes;
    const transactionId = Number(transaction_id);
    const call = this._calls.get(transactionId);
    if (!call) {
      (_utils || _load_utils()).default.error('Missing call for response: ' + message);
      return;
    }
    // We handle evaluation commands specially since they can trigger breakpoints.
    if ((0, (_helpers || _load_helpers()).isEvaluationCommand)(command)) {
      if (status === ConnectionStatus.Break) {
        // The eval command's response with a `break` status is special because the backend will
        // send two responses for one xdebug eval request.  One when we hit a breakpoint in the
        // code being eval'd, and another when we finish executing the code being eval'd.
        // In this case, we are processing the first response for our eval request.  We will
        // record this response ID on our stack, so we can later identify the second response.
        // Then send a user-friendly message to the console, and trigger a UI update by moving to
        // running status briefly, and then back to break status.
        this._emitStatus(ConnectionStatus.DummyIsViewable);
        this._emitStatus(ConnectionStatus.Stdout, 'Hit breakpoint in evaluated code.');
        this._emitStatus(ConnectionStatus.Running);
        this._emitStatus(ConnectionStatus.Break);
        return; // Return early so that we don't complete any request.
      }
      this._handleEvaluationCommand(transactionId, message);
    }

    // If this is a break notification, check to see if its a file-line breakpoint, and if so,
    // confirm the bp is still installed. Since different requests are totally asynchronous to
    // the debugger (they're actually served by different processes), it's possible for a request
    // to hit a breakpoint after the frontend has removed it. When this happens, we should silently
    // just resume the connection rather than breaking at a stale breakpoint.
    if (status === ConnectionStatus.Break) {
      const xdebugMessages = response['xdebug:message'];
      if (xdebugMessages != null && xdebugMessages.length >= 1) {
        const breakDetails = xdebugMessages[0].$;
        this._emitStatus(ConnectionStatus.Break, breakDetails.filename, breakDetails.lineno, breakDetails.exception);
      }
    }

    this._completeRequest(message, response, call, command, transactionId);
  }

  _handleEvaluationCommand(transactionId, message) {
    if (!(this._pendingEvalTransactionIds.size > 0)) {
      throw new Error('No pending Eval Ids');
    }

    if (!this._pendingEvalTransactionIds.has(transactionId)) {
      throw new Error('Got evaluation response for a request that was never sent.');
    }

    this._pendingEvalTransactionIds.delete(transactionId);
    const continuationId = this._lastContinuationCommandTransactionId;
    if (continuationId == null) {
      return;
    }
    // In this case, we are processing the second response to our eval request.  So we can
    // complete the current continuation command promise, and then complete the original
    // eval command promise.
    if (this._pendingEvalTransactionIds.size === 0) {
      // This is the last eval command before returning to the dummy connection entry-point, so
      // we will signal to the CM that the dummy connection is now un-viewable.
      this._emitStatus(ConnectionStatus.DummyIsHidden);
    }
    const continuationCommandCall = this._calls.get(continuationId);

    if (!(continuationCommandCall != null)) {
      throw new Error('no pending continuation command request');
    }

    this._completeRequest(message, { $: { status: ConnectionStatus.Break } }, continuationCommandCall, continuationCommandCall.command, continuationId);
  }

  _handleStream(stream) {
    const outputType = stream.$.type;
    // The body of the `stream` XML can be omitted, e.g. `echo null`, so we defend against this.
    const outputText = stream._ != null ? (0, (_helpers || _load_helpers()).base64Decode)(stream._) : '';
    (_utils || _load_utils()).default.debug(`${outputType} message received: ${outputText}`);
    const status = outputType === 'stdout' ? ConnectionStatus.Stdout : ConnectionStatus.Stderr;
    // TODO: t13439903 -- add a way to fetch the rest of the data.
    const truncatedOutputText = outputText.slice(0, STREAM_MESSAGE_MAX_SIZE);
    this._emitStatus(status, truncatedOutputText);
  }

  _handleNotification(notify) {
    const notifyName = notify.$.name;
    if (notifyName === 'breakpoint_resolved') {
      const breakpoint = notify.breakpoint[0].$;
      if (breakpoint == null) {
        (_utils || _load_utils()).default.error(`Fail to get breakpoint from 'breakpoint_resolved' notify: ${JSON.stringify(notify)}`);
        return;
      }
      this._emitNotification(BREAKPOINT_RESOLVED_NOTIFICATION, breakpoint);
    } else {
      (_utils || _load_utils()).default.error(`Unknown notify: ${JSON.stringify(notify)}`);
    }
  }

  _completeRequest(message, response, call, command, transactionId) {
    this._calls.delete(transactionId);
    if (call.command !== command) {
      (_utils || _load_utils()).default.error('Bad command in response. Found ' + command + '. expected ' + call.command);
      return;
    }
    try {
      (_utils || _load_utils()).default.debug('Completing call: ' + message);
      call.complete(response);
    } catch (e) {
      (_utils || _load_utils()).default.error('Exception: ' + e.toString() + ' handling call: ' + message);
    }
  }

  getStackFrames() {
    return this._callDebugger('stack_get');
  }

  getContextsForFrame(frameIndex) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const result = yield _this._callDebugger('context_names', `-d ${frameIndex}`);
      return result.context.map(function (context) {
        return context.$;
      });
    })();
  }

  getContextProperties(frameIndex, contextId) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const result = yield _this2._callDebugger('context_get', `-d ${frameIndex} -c ${contextId}`);
      // 0 results yields missing 'property' member
      return result.property || [];
    })();
  }

  getPropertiesByFullname(frameIndex, contextId, fullname, page) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Escape any double quote in the expression.
      const escapedFullname = fullname.replace(/"/g, '\\"');
      const result = yield _this3._callDebugger('property_value', `-d ${frameIndex} -c ${contextId} -n "${escapedFullname}" -p ${page}`);
      // property_value returns the outer property, we want the children ...
      // 0 results yields missing 'property' member
      if (result.property == null || result.property[0] == null) {
        return [];
      }
      return result.property[0].property || [];
    })();
  }

  getPropertiesByFullnameAllConexts(frameIndex, fullname, page) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Pass zero as contextId to search all contexts.
      return _this4.getPropertiesByFullname(frameIndex,
      /* contextId */'0', fullname, page);
    })();
  }

  evaluateOnCallFrame(frameIndex, expression) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Escape any double quote in the expression.
      const escapedExpression = expression.replace(/"/g, '\\"');
      // Quote the input expression so that we can support expression with
      // space in it(e.g. function evaluation).
      const result = yield _this5._callDebugger('property_value', `-d ${frameIndex} -n "${escapedExpression}"`);
      if (result.error && result.error.length > 0) {
        return {
          error: result.error[0],
          wasThrown: true
        };
      } else if (result.property != null) {
        return {
          result: result.property[0],
          wasThrown: false
        };
      } else {
        (_utils || _load_utils()).default.debug(`Received non-error evaluateOnCallFrame response with no properties: ${expression}`);
        return {
          result: DEFAULT_DBGP_PROPERTY,
          wasThrown: false
        };
      }
    })();
  }

  // Returns one of:
  //  starting, stopping, stopped, running, break
  getStatus() {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this6._callDebugger('status');
      // TODO: Do we ever care about response.$.reason?
      return response.$.status;
    })();
  }

  // Continuation commands get a response, but that response
  // is a status message which occurs after execution stops.
  sendContinuationCommand(command) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this7._emitStatus(ConnectionStatus.Running);
      const response = yield _this7._callDebugger(command);
      const status = response.$.status;
      _this7._emitStatus(status);
      return status;
    })();
  }

  sendBreakCommand() {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this8._callDebugger('break');
      if (response.$.success !== '0') {
        _this8._emitStatus(ConnectionStatus.BreakMessageReceived);
      }
      return response.$.success !== '0';
    })();
  }

  sendStdoutRequest() {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // `-c 1` tells HHVM to send stdout to the normal destination, as well as forward it to nuclide.
      const response = yield _this9._callDebugger('stdout', '-c 1');
      return response.$.success !== '0';
    })();
  }

  /**
   * Stderr forwarding is not implemented by HHVM yet so this will always return failure.
   */
  sendStderrRequest() {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this10._callDebugger('stderr', '-c 1');
      return response.$.success !== '0';
    })();
  }

  /**
   * Sets a given config setting in the debugger to a given value.
   */
  setFeature(name, value) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this11._callDebugger('feature_set', `-n ${name} -v ${value}`);
      return response.$.success !== '0';
    })();
  }

  /**
   * Evaluate the expression in the debugger's current context.
   */
  runtimeEvaluate(expr) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this12._callDebugger('eval', `-- ${(0, (_helpers || _load_helpers()).base64Encode)(expr)}`);
      if (response.error && response.error.length > 0) {
        return {
          error: response.error[0],
          wasThrown: true
        };
      } else if (response.property != null) {
        return {
          result: response.property[0],
          wasThrown: false
        };
      } else {
        (_utils || _load_utils()).default.debug(`Received non-error runtimeEvaluate response with no properties: ${expr}`);
      }
      return {
        result: DEFAULT_DBGP_PROPERTY,
        wasThrown: false
      };
    })();
  }

  /**
   * Returns the exception breakpoint id.
   */
  setExceptionBreakpoint(exceptionName) {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this13._callDebugger('breakpoint_set', `-t exception -x ${exceptionName}`);
      if (response.error) {
        throw new Error('Error from setPausedOnExceptions: ' + JSON.stringify(response));
      }
      // TODO: Validate that response.$.state === 'enabled'
      return response.$.id;
    })();
  }

  /**
   * Set breakpoint on a source file line.
   * Returns a xdebug breakpoint id.
   */
  setFileLineBreakpoint(breakpointInfo) {
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { filename, lineNumber, conditionExpression } = breakpointInfo;
      let params = `-t line -f ${filename} -n ${lineNumber}`;
      if (conditionExpression != null) {
        params += ` -- ${(0, (_helpers || _load_helpers()).base64Encode)(conditionExpression)}`;
      }
      const response = yield _this14._callDebugger('breakpoint_set', params);
      if (response.error) {
        throw new Error((_dedent || _load_dedent()).default`
        Error setting breakpoint for command: breakpoint_set ${params}
        Got response: ${JSON.stringify(response)}
        BreakpointInfo is: ${JSON.stringify(breakpointInfo)}
      `);
      }
      // TODO: Validate that response.$.state === 'enabled'
      return response.$.id;
    })();
  }

  /**
   * Returns requested breakpoint object.
   */
  getBreakpoint(breakpointId) {
    var _this15 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this15._callDebugger('breakpoint_get', `-d ${breakpointId}`);
      if (response.error != null || response.breakpoint == null || response.breakpoint[0] == null || response.breakpoint[0].$ == null) {
        throw new Error('Error getting breakpoint: ' + JSON.stringify(response));
      }
      return response.breakpoint[0].$;
    })();
  }

  removeBreakpoint(breakpointId) {
    var _this16 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this16._callDebugger('breakpoint_remove', `-d ${breakpointId}`);
      if (response.error) {
        throw new Error('Error removing breakpoint: ' + JSON.stringify(response));
      }
    })();
  }

  // Sends command to hhvm.
  // Returns an object containing the resulting attributes.
  _callDebugger(command, params) {
    const transactionId = this._sendCommand(command, params);
    if ((0, (_helpers || _load_helpers()).isEvaluationCommand)(command)) {
      this._pendingEvalTransactionIds.add(transactionId);
    }
    const isContinuation = (0, (_helpers || _load_helpers()).isContinuationCommand)(command);
    if (isContinuation) {
      // Continuation commands can sometimes only be completed by an evaluation response.
      this._lastContinuationCommandTransactionId = transactionId;
    }
    return new Promise((resolve, reject) => {
      this._calls.set(transactionId, {
        command,
        complete: result => {
          if (isContinuation) {
            this._lastContinuationCommandTransactionId = null;
          }
          resolve(result);
        }
      });
    });
  }

  _sendCommand(command, params) {
    const id = ++this._transactionId;
    let message = `${command} -i ${id}`;
    // flowlint-next-line sketchy-null-string:off
    if (params) {
      message += ' ' + params;
    }
    this._sendMessage(message);
    return id;
  }

  _sendMessage(message) {
    const socket = this._socket;
    if (socket != null) {
      (_utils || _load_utils()).default.debug('Sending message: ' + message);
      socket.write(message + '\x00');
    } else {
      (_utils || _load_utils()).default.error('Attempt to send message after dispose: ' + message);
    }
  }

  _emitStatus(status, ...args) {
    (_utils || _load_utils()).default.debug('Emitting status: ' + status);
    this._emitter.emit(DBGP_SOCKET_STATUS_EVENT, status, ...args);
  }

  _emitNotification(notifyName, notify) {
    (_utils || _load_utils()).default.debug(`Emitting notification: ${notifyName}`);
    this._emitter.emit(DBGP_SOCKET_NOTIFICATION_EVENT, notifyName, notify);
  }

  dispose() {
    if (!this._isClosed) {
      // TODO[jeffreytan]: workaround a crash(t8181538) in hhvm
      this.sendContinuationCommand(COMMAND_DETACH);
    }

    const socket = this._socket;
    if (socket) {
      // end - Sends the FIN packet and closes writing.
      // destroy - closes for reading and writing.
      socket.end();
      socket.destroy();
      this._socket = null;
      this._isClosed = true;
    }
  }
}
exports.DbgpSocket = DbgpSocket;