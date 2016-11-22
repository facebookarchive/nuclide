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
exports.DbgpSocket = exports.COMMAND_DETACH = exports.COMMAND_STOP = exports.COMMAND_STEP_OUT = exports.COMMAND_STEP_OVER = exports.COMMAND_STEP_INTO = exports.COMMAND_RUN = exports.BREAKPOINT_RESOLVED_NOTIFICATION = exports.CONNECTION_STATUS = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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
  return _event = require('../../commons-node/event');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CONNECTION_STATUS = exports.CONNECTION_STATUS = {
  // Responses to the DBGP 'status' command
  STARTING: 'starting',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
  RUNNING: 'running',
  BREAK: 'break',
  // Error and End are not dbgp status codes, they relate to socket states.
  ERROR: 'error',
  END: 'end',
  // stdout and stderr are emitted when DBGP sends the corresponding message packets.
  STDOUT: 'stdout',
  STDERR: 'stderr',
  // Break message statuses allow us to identify whether a connection stopped because of a break
  // message or a breakpoint
  BREAK_MESSAGE_RECEIVED: 'status_break_message_received',
  BREAK_MESSAGE_SENT: 'status_break_message_sent',
  // Indicates if the dummy connection should be shown in the UI.
  DUMMY_IS_VIEWABLE: 'dummy is viewable',
  DUMMY_IS_HIDDEN: 'dummy is hidden'
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
let DbgpSocket = exports.DbgpSocket = class DbgpSocket {
  // Maps from transactionId -> call
  constructor(socket) {
    this._socket = socket;
    this._transactionId = 0;
    this._calls = new Map();
    this._emitter = new _events.default();
    this._isClosed = false;
    this._messageHandler = (0, (_DbgpMessageHandler || _load_DbgpMessageHandler()).getDbgpMessageHandlerInstance)();
    this._pendingEvalTransactionIdStack = [];
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
    (_utils || _load_utils()).default.logError('socket error ' + error.code);
    this._emitStatus(CONNECTION_STATUS.ERROR, error.code);
  }

  _onEnd() {
    this._isClosed = true;
    this.dispose();
    this._emitStatus(CONNECTION_STATUS.END);
  }

  _onData(data) {
    const message = data.toString();
    (_utils || _load_utils()).default.log('Recieved data: ' + message);
    let responses = [];
    try {
      responses = this._messageHandler.parseMessages(message);
    } catch (e) {
      // If message parsing fails, then our contract with HHVM is violated and we need to kill the
      // connection.
      this._emitStatus(CONNECTION_STATUS.ERROR, e.message);
      return;
    }
    responses.forEach(r => {
      const response = r.response,
            stream = r.stream,
            notify = r.notify;

      if (response) {
        this._handleResponse(response, message);
      } else if (stream != null) {
        this._handleStream(stream);
      } else if (notify != null) {
        this._handleNotification(notify);
      } else {
        (_utils || _load_utils()).default.logError('Unexpected socket message: ' + message);
      }
    });
  }

  _handleResponse(response, message) {
    const responseAttributes = response.$;
    const command = responseAttributes.command,
          transaction_id = responseAttributes.transaction_id,
          status = responseAttributes.status;

    const transactionId = Number(transaction_id);
    const call = this._calls.get(transactionId);
    if (!call) {
      (_utils || _load_utils()).default.logError('Missing call for response: ' + message);
      return;
    }
    // We handle evaluation commands specially since they can trigger breakpoints.
    if ((0, (_helpers || _load_helpers()).isEvaluationCommand)(command)) {
      if (status === CONNECTION_STATUS.BREAK) {
        // The eval command's response with a `break` status is special because the backend will
        // send two responses for one xdebug eval request.  One when we hit a breakpoint in the
        // code being eval'd, and another when we finish executing the code being eval'd.
        // In this case, we are processing the first response for our eval request.  We will
        // record this response ID on our stack, so we can later identify the second response.
        // Then send a user-friendly message to the console, and trigger a UI update by moving to
        // running status briefly, and then back to break status.
        this._emitStatus(CONNECTION_STATUS.DUMMY_IS_VIEWABLE);
        this._emitStatus(CONNECTION_STATUS.STDOUT, 'Hit breakpoint in evaluated code.');
        this._emitStatus(CONNECTION_STATUS.RUNNING);
        this._emitStatus(CONNECTION_STATUS.BREAK);
        return; // Return early so that we don't complete any request.
      }
      this._handleEvaluationCommand(transactionId, message);
    }
    this._completeRequest(message, response, call, command, transactionId);
  }

  _handleEvaluationCommand(transactionId, message) {
    if (!(this._pendingEvalTransactionIdStack.length > 0)) {
      throw new Error('No pending Eval Ids');
    }

    const lastEvalId = this._pendingEvalTransactionIdStack.pop();
    const continuationId = this._lastContinuationCommandTransactionId;
    if (continuationId == null) {
      return;
    }
    // In this case, we are processing the second response to our eval request.  So we can
    // complete the current continuation command promise, and then complete the original
    // eval command promise.

    if (!(lastEvalId === transactionId)) {
      throw new Error('Evaluation requests are being processed out of order.');
    }

    if (this._pendingEvalTransactionIdStack.length === 0) {
      // This is the last eval command before returning to the dummy connection entry-point, so
      // we will signal to the CM that the dummy connection is now un-viewable.
      this._emitStatus(CONNECTION_STATUS.DUMMY_IS_HIDDEN);
    }
    const continuationCommandCall = this._calls.get(continuationId);

    if (!(continuationCommandCall != null)) {
      throw new Error('no pending continuation command request');
    }

    this._completeRequest(message, { $: { status: CONNECTION_STATUS.BREAK } }, continuationCommandCall, continuationCommandCall.command, continuationId);
  }

  _handleStream(stream) {
    const outputType = stream.$.type;
    // The body of the `stream` XML can be omitted, e.g. `echo null`, so we defend against this.
    const outputText = stream._ != null ? (0, (_helpers || _load_helpers()).base64Decode)(stream._) : '';
    (_utils || _load_utils()).default.log(`${ outputType } message received: ${ outputText }`);
    const status = outputType === 'stdout' ? CONNECTION_STATUS.STDOUT : CONNECTION_STATUS.STDERR;
    // TODO: t13439903 -- add a way to fetch the rest of the data.
    const truncatedOutputText = outputText.slice(0, STREAM_MESSAGE_MAX_SIZE);
    this._emitStatus(status, truncatedOutputText);
  }

  _handleNotification(notify) {
    const notifyName = notify.$.name;
    if (notifyName === 'breakpoint_resolved') {
      const breakpoint = notify.breakpoint[0].$;
      if (breakpoint == null) {
        (_utils || _load_utils()).default.logError(`Fail to get breakpoint from 'breakpoint_resolved' notify: ${ JSON.stringify(notify) }`);
        return;
      }
      this._emitNotification(BREAKPOINT_RESOLVED_NOTIFICATION, breakpoint);
    } else {
      (_utils || _load_utils()).default.logError(`Unknown notify: ${ JSON.stringify(notify) }`);
    }
  }

  _completeRequest(message, response, call, command, transactionId) {
    this._calls.delete(transactionId);
    if (call.command !== command) {
      (_utils || _load_utils()).default.logError('Bad command in response. Found ' + command + '. expected ' + call.command);
      return;
    }
    try {
      (_utils || _load_utils()).default.log('Completing call: ' + message);
      call.complete(response);
    } catch (e) {
      (_utils || _load_utils()).default.logError('Exception: ' + e.toString() + ' handling call: ' + message);
    }
  }

  getStackFrames() {
    return this._callDebugger('stack_get');
  }

  getContextsForFrame(frameIndex) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const result = yield _this._callDebugger('context_names', `-d ${ frameIndex }`);
      return result.context.map(function (context) {
        return context.$;
      });
    })();
  }

  getContextProperties(frameIndex, contextId) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const result = yield _this2._callDebugger('context_get', `-d ${ frameIndex } -c ${ contextId }`);
      // 0 results yields missing 'property' member
      return result.property || [];
    })();
  }

  getPropertiesByFullname(frameIndex, contextId, fullname, page) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Escape any double quote in the expression.
      const escapedFullname = fullname.replace(/"/g, '\\"');
      const result = yield _this3._callDebugger('property_value', `-d ${ frameIndex } -c ${ contextId } -n "${ escapedFullname }" -p ${ page }`);
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
      return yield _this4.getPropertiesByFullname(frameIndex, /* contextId */'0', fullname, page);
    })();
  }

  evaluateOnCallFrame(frameIndex, expression) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Escape any double quote in the expression.
      const escapedExpression = expression.replace(/"/g, '\\"');
      // Quote the input expression so that we can support expression with
      // space in it(e.g. function evaluation).
      const result = yield _this5._callDebugger('property_value', `-d ${ frameIndex } -n "${ escapedExpression }"`);
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
        (_utils || _load_utils()).default.log(`Received non-error evaluateOnCallFrame response with no properties: ${ expression }`);
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
      _this7._emitStatus(CONNECTION_STATUS.RUNNING);
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
        _this8._emitStatus(CONNECTION_STATUS.BREAK_MESSAGE_RECEIVED);
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
      const response = yield _this11._callDebugger('feature_set', `-n ${ name } -v ${ value }`);
      return response.$.success !== '0';
    })();
  }

  /**
   * Evaluate the expression in the debugger's current context.
   */
  runtimeEvaluate(expr) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this12._callDebugger('eval', `-- ${ (0, (_helpers || _load_helpers()).base64Encode)(expr) }`);
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
        (_utils || _load_utils()).default.log(`Received non-error runtimeEvaluate response with no properties: ${ expr }`);
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
      const response = yield _this13._callDebugger('breakpoint_set', `-t exception -x ${ exceptionName }`);
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
      const filename = breakpointInfo.filename,
            lineNumber = breakpointInfo.lineNumber,
            conditionExpression = breakpointInfo.conditionExpression;

      let params = `-t line -f ${ filename } -n ${ lineNumber }`;
      if (conditionExpression != null) {
        params += ` -- ${ (0, (_helpers || _load_helpers()).base64Encode)(conditionExpression) }`;
      }
      const response = yield _this14._callDebugger('breakpoint_set', params);
      if (response.error) {
        throw new Error('Error setting breakpoint: ' + JSON.stringify(response));
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
      const response = yield _this15._callDebugger('breakpoint_get', `-d ${ breakpointId }`);
      if (response.error != null || response.breakpoint == null || response.breakpoint[0] == null || response.breakpoint[0].$ == null) {
        throw new Error('Error getting breakpoint: ' + JSON.stringify(response));
      }
      return response.breakpoint[0].$;
    })();
  }

  removeBreakpoint(breakpointId) {
    var _this16 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this16._callDebugger('breakpoint_remove', `-d ${ breakpointId }`);
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
      this._pendingEvalTransactionIdStack.push(transactionId);
    }
    const isContinuation = (0, (_helpers || _load_helpers()).isContinuationCommand)(command);
    if (isContinuation) {
      // Continuation commands can sometimes only be completed by an evaluation response.
      this._lastContinuationCommandTransactionId = transactionId;
    }
    return new Promise((resolve, reject) => {
      this._calls.set(transactionId, {
        command: command,
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
    let message = `${ command } -i ${ id }`;
    if (params) {
      message += ' ' + params;
    }
    this._sendMessage(message);
    return id;
  }

  _sendMessage(message) {
    const socket = this._socket;
    if (socket != null) {
      (_utils || _load_utils()).default.log('Sending message: ' + message);
      socket.write(message + '\x00');
    } else {
      (_utils || _load_utils()).default.logError('Attempt to send message after dispose: ' + message);
    }
  }

  _emitStatus(status) {
    (_utils || _load_utils()).default.log('Emitting status: ' + status);

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    this._emitter.emit(DBGP_SOCKET_STATUS_EVENT, status, ...args);
  }

  _emitNotification(notifyName, notify) {
    (_utils || _load_utils()).default.log(`Emitting notification: ${ notifyName }`);
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
};