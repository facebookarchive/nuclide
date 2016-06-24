Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

// Responses to the DBGP 'status' command

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

var _events2;

function _events() {
  return _events2 = require('events');
}

var _DbgpMessageHandler2;

function _DbgpMessageHandler() {
  return _DbgpMessageHandler2 = require('./DbgpMessageHandler');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var STATUS_STARTING = 'starting';
var STATUS_STOPPING = 'stopping';
var STATUS_STOPPED = 'stopped';
var STATUS_RUNNING = 'running';
var STATUS_BREAK = 'break';
// Error and End are not dbgp status codes, they relate to socket states.
var STATUS_ERROR = 'error';
var STATUS_END = 'end';
// stdout and stderr are emitted when DBGP sends the corresponding message packets.
var STATUS_STDOUT = 'stdout';
var STATUS_STDERR = 'stderr';

// Valid continuation commands
var COMMAND_RUN = 'run';
var COMMAND_STEP_INTO = 'step_into';
var COMMAND_STEP_OVER = 'step_over';
var COMMAND_STEP_OUT = 'step_out';
var COMMAND_STOP = 'stop';
var COMMAND_DETACH = 'detach';

var DBGP_SOCKET_STATUS_EVENT = 'dbgp-socket-status';

var DEFAULT_DBGP_PROPERTY = {
  $: {
    type: 'undefined'
  }
};

/**
 * Handles sending and recieving dbgp messages over a net Socket.
 * Dbgp documentation can be found at http://xdebug.org/docs-dbgp.php
 */

var DbgpSocket = (function () {
  function DbgpSocket(socket) {
    _classCallCheck(this, DbgpSocket);

    this._socket = socket;
    this._transactionId = 0;
    this._calls = new Map();
    this._emitter = new (_events2 || _events()).EventEmitter();
    this._isClosed = false;
    this._messageHandler = (0, (_DbgpMessageHandler2 || _DbgpMessageHandler()).getDbgpMessageHandlerInstance)();

    socket.on('end', this._onEnd.bind(this));
    socket.on('error', this._onError.bind(this));
    socket.on('data', this._onData.bind(this));
  }

  _createClass(DbgpSocket, [{
    key: 'onStatus',
    value: function onStatus(callback) {
      return (0, (_commonsNodeEvent2 || _commonsNodeEvent()).attachEvent)(this._emitter, DBGP_SOCKET_STATUS_EVENT, callback);
    }
  }, {
    key: '_onError',
    value: function _onError(error) {
      // Not sure if hhvm is alive or not
      // do not set _isClosed flag so that detach will be sent before dispose().
      (_utils2 || _utils()).default.logError('socket error ' + error.code);
      this._emitStatus(STATUS_ERROR, error.code);
    }
  }, {
    key: '_onEnd',
    value: function _onEnd() {
      this._isClosed = true;
      this.dispose();
      this._emitStatus(STATUS_END);
    }
  }, {
    key: '_onData',
    value: function _onData(data) {
      var _this = this;

      var message = data.toString();
      (_utils2 || _utils()).default.log('Recieved data: ' + message);
      var responses = [];
      try {
        responses = this._messageHandler.parseMessages(message);
      } catch (e) {
        // If message parsing fails, then our contract with HHVM is violated and we need to kill the
        // connection.
        this._emitStatus(STATUS_ERROR, e.message);
        return;
      }
      responses.forEach(function (r) {
        var response = r.response;
        var stream = r.stream;
        if (response) {
          var responseAttributes = response.$;
          var _command = responseAttributes.command;
          var transaction_id = responseAttributes.transaction_id;

          var transactionId = Number(transaction_id);
          var call = _this._calls.get(transactionId);
          if (!call) {
            (_utils2 || _utils()).default.logError('Missing call for response: ' + message);
            return;
          }
          _this._calls.delete(transactionId);

          if (call.command !== _command) {
            (_utils2 || _utils()).default.logError('Bad command in response. Found ' + _command + '. expected ' + call.command);
            return;
          }
          try {
            (_utils2 || _utils()).default.log('Completing call: ' + message);
            call.complete(response);
          } catch (e) {
            (_utils2 || _utils()).default.logError('Exception: ' + e.toString() + ' handling call: ' + message);
          }
        } else if (stream != null) {
          var outputType = stream.$.type;
          // The body of the `stream` XML can be omitted, e.g. `echo null`, so we defend against this.
          var outputText = stream._ != null ? (0, (_helpers2 || _helpers()).base64Decode)(stream._) : '';
          (_utils2 || _utils()).default.log(outputType + ' message received: ' + outputText);
          var _status = outputType === 'stdout' ? STATUS_STDOUT : STATUS_STDERR;
          _this._emitStatus(_status, outputText);
        } else {
          (_utils2 || _utils()).default.logError('Unexpected socket message: ' + message);
        }
      });
    }
  }, {
    key: 'getStackFrames',
    value: function getStackFrames() {
      return this._callDebugger('stack_get');
    }
  }, {
    key: 'getContextsForFrame',
    value: _asyncToGenerator(function* (frameIndex) {
      var result = yield this._callDebugger('context_names', '-d ' + frameIndex);
      return result.context.map(function (context) {
        return context.$;
      });
    })
  }, {
    key: 'getContextProperties',
    value: _asyncToGenerator(function* (frameIndex, contextId) {
      var result = yield this._callDebugger('context_get', '-d ' + frameIndex + ' -c ' + contextId);
      // 0 results yields missing 'property' member
      return result.property || [];
    })
  }, {
    key: 'getPropertiesByFullname',
    value: _asyncToGenerator(function* (frameIndex, contextId, fullname, page) {
      // Escape any double quote in the expression.
      var escapedFullname = fullname.replace(/"/g, '\\"');
      var result = yield this._callDebugger('property_value', '-d ' + frameIndex + ' -c ' + contextId + ' -n "' + escapedFullname + '" -p ' + page);
      // property_value returns the outer property, we want the children ...
      // 0 results yields missing 'property' member
      if (result.property == null || result.property[0] == null) {
        return [];
      }
      return result.property[0].property || [];
    })
  }, {
    key: 'getPropertiesByFullnameAllConexts',
    value: _asyncToGenerator(function* (frameIndex, fullname, page) {
      // Pass zero as contextId to search all contexts.
      return yield this.getPropertiesByFullname(frameIndex, /*contextId*/'0', fullname, page);
    })
  }, {
    key: 'evaluateOnCallFrame',
    value: _asyncToGenerator(function* (frameIndex, expression) {
      // Escape any double quote in the expression.
      var escapedExpression = expression.replace(/"/g, '\\"');
      // Quote the input expression so that we can support expression with
      // space in it(e.g. function evaluation).
      var result = yield this._callDebugger('property_value', '-d ' + frameIndex + ' -n "' + escapedExpression + '"');
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
        (_utils2 || _utils()).default.log('Received non-error evaluateOnCallFrame response with no properties: ' + expression);
        return {
          result: DEFAULT_DBGP_PROPERTY,
          wasThrown: false
        };
      }
    })

    // Returns one of:
    //  starting, stopping, stopped, running, break
  }, {
    key: 'getStatus',
    value: _asyncToGenerator(function* () {
      var response = yield this._callDebugger('status');
      // TODO: Do we ever care about response.$.reason?
      return response.$.status;
    })

    // Continuation commands get a response, but that response
    // is a status message which occurs after execution stops.
  }, {
    key: 'sendContinuationCommand',
    value: _asyncToGenerator(function* (command) {
      this._emitStatus(STATUS_RUNNING);
      var response = yield this._callDebugger(command);
      var status = response.$.status;
      this._emitStatus(status);
      return status;
    })
  }, {
    key: 'sendBreakCommand',
    value: _asyncToGenerator(function* () {
      var response = yield this._callDebugger('break');
      return response.$.success !== '0';
    })
  }, {
    key: 'sendStdoutRequest',
    value: _asyncToGenerator(function* () {
      // `-c 1` tells HHVM to send stdout to the normal destination, as well as forward it to nuclide.
      var response = yield this._callDebugger('stdout', '-c 1');
      return response.$.success !== '0';
    })

    /**
     * Stderr forwarding is not implemented by HHVM yet so this will always return failure.
     */
  }, {
    key: 'sendStderrRequest',
    value: _asyncToGenerator(function* () {
      var response = yield this._callDebugger('stderr', '-c 1');
      return response.$.success !== '0';
    })

    /**
     * Sets a given config setting in the debugger to a given value.
     */
  }, {
    key: 'setFeature',
    value: _asyncToGenerator(function* (name, value) {
      var response = yield this._callDebugger('feature_set', '-n ' + name + ' -v ' + value);
      return response.$.success !== '0';
    })

    /**
     * Evaluate the expression in the debugger's current context.
     */
  }, {
    key: 'runtimeEvaluate',
    value: _asyncToGenerator(function* (expr) {
      var response = yield this._callDebugger('eval', '-- ' + (0, (_helpers2 || _helpers()).base64Encode)(expr));
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
        (_utils2 || _utils()).default.log('Received non-error runtimeEvaluate response with no properties: ' + expr);
        return {
          result: DEFAULT_DBGP_PROPERTY,
          wasThrown: false
        };
      }
    })

    /**
     * Returns the exception breakpoint id.
     */
  }, {
    key: 'setExceptionBreakpoint',
    value: _asyncToGenerator(function* (exceptionName) {
      var response = yield this._callDebugger('breakpoint_set', '-t exception -x ' + exceptionName);
      if (response.error) {
        throw new Error('Error from setPausedOnExceptions: ' + JSON.stringify(response));
      }
      // TODO: Validate that response.$.state === 'enabled'
      return response.$.id;
    })

    /**
     * Returns a breakpoint id
     */
  }, {
    key: 'setBreakpoint',
    value: _asyncToGenerator(function* (filename, lineNumber) {
      var response = yield this._callDebugger('breakpoint_set', '-t line -f ' + filename + ' -n ' + lineNumber);
      if (response.error) {
        throw new Error('Error setting breakpoint: ' + JSON.stringify(response));
      }
      // TODO: Validate that response.$.state === 'enabled'
      return response.$.id;
    })
  }, {
    key: 'removeBreakpoint',
    value: _asyncToGenerator(function* (breakpointId) {
      var response = yield this._callDebugger('breakpoint_remove', '-d ' + breakpointId);
      if (response.error) {
        throw new Error('Error removing breakpoint: ' + JSON.stringify(response));
      }
    })

    // Sends command to hhvm.
    // Returns an object containing the resulting attributes.
  }, {
    key: '_callDebugger',
    value: function _callDebugger(command, params) {
      var _this2 = this;

      var transactionId = this._sendCommand(command, params);
      return new Promise(function (resolve, reject) {
        _this2._calls.set(transactionId, {
          command: command,
          complete: function complete(result) {
            return resolve(result);
          }
        });
      });
    }
  }, {
    key: '_sendCommand',
    value: function _sendCommand(command, params) {
      var id = ++this._transactionId;
      var message = command + ' -i ' + id;
      if (params) {
        message += ' ' + params;
      }
      this._sendMessage(message);
      return id;
    }
  }, {
    key: '_sendMessage',
    value: function _sendMessage(message) {
      var socket = this._socket;
      if (socket != null) {
        (_utils2 || _utils()).default.log('Sending message: ' + message);
        socket.write(message + '\x00');
      } else {
        (_utils2 || _utils()).default.logError('Attempt to send message after dispose: ' + message);
      }
    }
  }, {
    key: '_emitStatus',
    value: function _emitStatus(status) {
      var _emitter;

      (_utils2 || _utils()).default.log('Emitting status: ' + status);

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      (_emitter = this._emitter).emit.apply(_emitter, [DBGP_SOCKET_STATUS_EVENT, status].concat(args));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (!this._isClosed) {
        // TODO[jeffreytan]: workaround a crash(t8181538) in hhvm
        this.sendContinuationCommand(COMMAND_DETACH);
      }

      var socket = this._socket;
      if (socket) {
        // end - Sends the FIN packet and closes writing.
        // destroy - closes for reading and writing.
        socket.end();
        socket.destroy();
        this._socket = null;
        this._isClosed = true;
      }
    }
  }]);

  return DbgpSocket;
})();

module.exports = {
  DbgpSocket: DbgpSocket,
  STATUS_STARTING: STATUS_STARTING,
  STATUS_STOPPING: STATUS_STOPPING,
  STATUS_STOPPED: STATUS_STOPPED,
  STATUS_RUNNING: STATUS_RUNNING,
  STATUS_BREAK: STATUS_BREAK,
  STATUS_ERROR: STATUS_ERROR,
  STATUS_END: STATUS_END,
  STATUS_STDOUT: STATUS_STDOUT,
  STATUS_STDERR: STATUS_STDERR,
  COMMAND_RUN: COMMAND_RUN,
  COMMAND_STEP_INTO: COMMAND_STEP_INTO,
  COMMAND_STEP_OVER: COMMAND_STEP_OVER,
  COMMAND_STEP_OUT: COMMAND_STEP_OUT,
  COMMAND_STOP: COMMAND_STOP,
  COMMAND_DETACH: COMMAND_DETACH
};
// name and fullname are omitted when we get data back from the `eval` command.

// array or object

// string

// Value if present, subject to encoding if present

// array or object members

// Maps from transactionId -> call