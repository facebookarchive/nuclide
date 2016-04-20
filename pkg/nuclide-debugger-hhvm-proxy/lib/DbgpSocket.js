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

var _events = require('events');

var _DbgpMessageHandler = require('./DbgpMessageHandler');

// Responses to the DBGP 'status' command
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
    this._emitter = new _events.EventEmitter();
    this._isClosed = false;
    this._messageHandler = (0, _DbgpMessageHandler.getDbgpMessageHandlerInstance)();

    socket.on('end', this._onEnd.bind(this));
    socket.on('error', this._onError.bind(this));
    socket.on('data', this._onData.bind(this));
  }

  _createClass(DbgpSocket, [{
    key: 'onStatus',
    value: function onStatus(callback) {
      return require('../../nuclide-commons').event.attachEvent(this._emitter, DBGP_SOCKET_STATUS_EVENT, callback);
    }
  }, {
    key: '_onError',
    value: function _onError(error) {
      // Not sure if hhvm is alive or not
      // do not set _isClosed flag so that detach will be sent before dispose().
      _utils2['default'].logError('socket error ' + error.code);
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
      _utils2['default'].log('Recieved data: ' + message);
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
            _utils2['default'].logError('Missing call for response: ' + message);
            return;
          }
          _this._calls['delete'](transactionId);

          if (call.command !== _command) {
            _utils2['default'].logError('Bad command in response. Found ' + _command + '. expected ' + call.command);
            return;
          }
          try {
            _utils2['default'].log('Completing call: ' + message);
            call.complete(response);
          } catch (e) {
            _utils2['default'].logError('Exception: ' + e.toString() + ' handling call: ' + message);
          }
        } else if (stream != null) {
          var outputType = stream.$.type;
          var outputText = (0, _helpers.base64Decode)(stream._);
          _utils2['default'].log(outputType + ' message received: ' + outputText);
          var _status = outputType === 'stdout' ? STATUS_STDOUT : STATUS_STDERR;
          _this._emitStatus(_status, outputText);
        } else {
          _utils2['default'].logError('Unexpected socket message: ' + message);
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
      var result = yield this._callDebugger('property_value', '-d ' + frameIndex + ' -c ' + contextId + ' -n ' + fullname + ' -p ' + page);
      // property_value returns the outer property, we want the children ...
      // 0 results yields missing 'property' member
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
      }
      return {
        result: result.property[0] || [],
        wasThrown: false
      };
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
      var response = yield this._callDebugger('eval', '-- ' + (0, _helpers.base64Encode)(expr));
      if (response.error && response.error.length > 0) {
        return {
          error: response.error[0],
          wasThrown: true
        };
      }
      return {
        result: response.property[0] || [],
        wasThrown: false
      };
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
        _utils2['default'].log('Sending message: ' + message);
        socket.write(message + '\x00');
      } else {
        _utils2['default'].logError('Attempt to send message after dispose: ' + message);
      }
    }
  }, {
    key: '_emitStatus',
    value: function _emitStatus(status) {
      var _emitter;

      _utils2['default'].log('Emitting status: ' + status);

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
//# sourceMappingURL=data:application/json;base64,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O0FBQ1YsZUFBYSxFQUFiLGFBQWE7QUFDYixlQUFhLEVBQWIsYUFBYTtBQUNiLGFBQVcsRUFBWCxXQUFXO0FBQ1gsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQixtQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsY0FBWSxFQUFaLFlBQVk7QUFDWixnQkFBYyxFQUFkLGNBQWM7Q0FDZixDQUFDIiwiZmlsZSI6IkRiZ3BTb2NrZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cbmltcG9ydCBsb2dnZXIgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2Jhc2U2NERlY29kZSwgYmFzZTY0RW5jb2RlfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQge0RiZ3BNZXNzYWdlSGFuZGxlciwgZ2V0RGJncE1lc3NhZ2VIYW5kbGVySW5zdGFuY2V9IGZyb20gJy4vRGJncE1lc3NhZ2VIYW5kbGVyJztcbmltcG9ydCB0eXBlIHtTb2NrZXR9IGZyb20gJ25ldCc7XG5cbi8vIFJlc3BvbnNlcyB0byB0aGUgREJHUCAnc3RhdHVzJyBjb21tYW5kXG5jb25zdCBTVEFUVVNfU1RBUlRJTkcgPSAnc3RhcnRpbmcnO1xuY29uc3QgU1RBVFVTX1NUT1BQSU5HID0gJ3N0b3BwaW5nJztcbmNvbnN0IFNUQVRVU19TVE9QUEVEID0gJ3N0b3BwZWQnO1xuY29uc3QgU1RBVFVTX1JVTk5JTkcgPSAncnVubmluZyc7XG5jb25zdCBTVEFUVVNfQlJFQUsgPSAnYnJlYWsnO1xuLy8gRXJyb3IgYW5kIEVuZCBhcmUgbm90IGRiZ3Agc3RhdHVzIGNvZGVzLCB0aGV5IHJlbGF0ZSB0byBzb2NrZXQgc3RhdGVzLlxuY29uc3QgU1RBVFVTX0VSUk9SID0gJ2Vycm9yJztcbmNvbnN0IFNUQVRVU19FTkQgPSAnZW5kJztcbi8vIHN0ZG91dCBhbmQgc3RkZXJyIGFyZSBlbWl0dGVkIHdoZW4gREJHUCBzZW5kcyB0aGUgY29ycmVzcG9uZGluZyBtZXNzYWdlIHBhY2tldHMuXG5jb25zdCBTVEFUVVNfU1RET1VUID0gJ3N0ZG91dCc7XG5jb25zdCBTVEFUVVNfU1RERVJSID0gJ3N0ZGVycic7XG5cbi8vIFZhbGlkIGNvbnRpbnVhdGlvbiBjb21tYW5kc1xuY29uc3QgQ09NTUFORF9SVU4gPSAncnVuJztcbmNvbnN0IENPTU1BTkRfU1RFUF9JTlRPID0gJ3N0ZXBfaW50byc7XG5jb25zdCBDT01NQU5EX1NURVBfT1ZFUiA9ICdzdGVwX292ZXInO1xuY29uc3QgQ09NTUFORF9TVEVQX09VVCA9ICdzdGVwX291dCc7XG5jb25zdCBDT01NQU5EX1NUT1AgPSAnc3RvcCc7XG5jb25zdCBDT01NQU5EX0RFVEFDSCA9ICdkZXRhY2gnO1xuXG5jb25zdCBEQkdQX1NPQ0tFVF9TVEFUVVNfRVZFTlQgPSAnZGJncC1zb2NrZXQtc3RhdHVzJztcblxuZXhwb3J0IHR5cGUgRGJncENvbnRleHQgPSB7XG4gIG5hbWU6IHN0cmluZztcbiAgaWQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIERiZ3BQcm9wZXJ0eSA9IHtcbiAgJDoge1xuICAgIG5hbWU/OiBzdHJpbmc7IC8vIG5hbWUgYW5kIGZ1bGxuYW1lIGFyZSBvbWl0dGVkIHdoZW4gd2UgZ2V0IGRhdGEgYmFjayBmcm9tIHRoZSBgZXZhbGAgY29tbWFuZC5cbiAgICBmdWxsbmFtZT86IHN0cmluZztcbiAgICBhZGRyZXNzOiBzdHJpbmc7XG4gICAgdHlwZTogc3RyaW5nO1xuXG4gICAgLy8gYXJyYXkgb3Igb2JqZWN0XG4gICAgY2xhc3NuYW1lPzogc3RyaW5nO1xuICAgIGNoaWxkcmVuPzogYm9vbGVhbjtcbiAgICBudW1DaGlsZHJlbj86IG51bWJlcjtcbiAgICBwYWdlPzogbnVtYmVyO1xuICAgIHBhZ2VzaXplPzogbnVtYmVyO1xuICAgIHJlY3Vyc2l2ZT86IG51bWJlcjtcblxuICAgIC8vIHN0cmluZ1xuICAgIHNpemU/OiBudW1iZXI7XG4gICAgZW5jb2Rpbmc/OiBzdHJpbmc7XG4gIH07XG5cbiAgLy8gVmFsdWUgaWYgcHJlc2VudCwgc3ViamVjdCB0byBlbmNvZGluZyBpZiBwcmVzZW50XG4gIF8/OiBzdHJpbmc7XG5cbiAgLy8gYXJyYXkgb3Igb2JqZWN0IG1lbWJlcnNcbiAgcHJvcGVydHk/OiBBcnJheTxEYmdwUHJvcGVydHk+O1xufTtcblxudHlwZSBFdmFsdWF0aW9uUmVzdWx0ID0ge1xuICBlcnJvcj86IE9iamVjdDtcbiAgcmVzdWx0PzogP0RiZ3BQcm9wZXJ0eTtcbiAgd2FzVGhyb3duOiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBIYW5kbGVzIHNlbmRpbmcgYW5kIHJlY2lldmluZyBkYmdwIG1lc3NhZ2VzIG92ZXIgYSBuZXQgU29ja2V0LlxuICogRGJncCBkb2N1bWVudGF0aW9uIGNhbiBiZSBmb3VuZCBhdCBodHRwOi8veGRlYnVnLm9yZy9kb2NzLWRiZ3AucGhwXG4gKi9cbmNsYXNzIERiZ3BTb2NrZXQge1xuICBfc29ja2V0OiA/U29ja2V0O1xuICBfdHJhbnNhY3Rpb25JZDogbnVtYmVyO1xuICAvLyBNYXBzIGZyb20gdHJhbnNhY3Rpb25JZCAtPiBjYWxsXG4gIF9jYWxsczogTWFwPG51bWJlciwge2NvbW1hbmQ6IHN0cmluZzsgY29tcGxldGU6IChyZXN1bHRzOiBPYmplY3QpID0+IHZvaWR9PjtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX2lzQ2xvc2VkOiBib29sZWFuO1xuICBfbWVzc2FnZUhhbmRsZXI6IERiZ3BNZXNzYWdlSGFuZGxlcjtcblxuICBjb25zdHJ1Y3Rvcihzb2NrZXQ6IFNvY2tldCkge1xuICAgIHRoaXMuX3NvY2tldCA9IHNvY2tldDtcbiAgICB0aGlzLl90cmFuc2FjdGlvbklkID0gMDtcbiAgICB0aGlzLl9jYWxscyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX2lzQ2xvc2VkID0gZmFsc2U7XG4gICAgdGhpcy5fbWVzc2FnZUhhbmRsZXIgPSBnZXREYmdwTWVzc2FnZUhhbmRsZXJJbnN0YW5jZSgpO1xuXG4gICAgc29ja2V0Lm9uKCdlbmQnLCB0aGlzLl9vbkVuZC5iaW5kKHRoaXMpKTtcbiAgICBzb2NrZXQub24oJ2Vycm9yJywgdGhpcy5fb25FcnJvci5iaW5kKHRoaXMpKTtcbiAgICBzb2NrZXQub24oJ2RhdGEnLCB0aGlzLl9vbkRhdGEuYmluZCh0aGlzKSk7XG4gIH1cblxuICBvblN0YXR1cyhjYWxsYmFjazogKHN0YXR1czogc3RyaW5nKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJykuZXZlbnRcbiAgICAgIC5hdHRhY2hFdmVudCh0aGlzLl9lbWl0dGVyLCBEQkdQX1NPQ0tFVF9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIF9vbkVycm9yKGVycm9yOiB7Y29kZTogc3RyaW5nfSk6IHZvaWQge1xuICAgIC8vIE5vdCBzdXJlIGlmIGhodm0gaXMgYWxpdmUgb3Igbm90XG4gICAgLy8gZG8gbm90IHNldCBfaXNDbG9zZWQgZmxhZyBzbyB0aGF0IGRldGFjaCB3aWxsIGJlIHNlbnQgYmVmb3JlIGRpc3Bvc2UoKS5cbiAgICBsb2dnZXIubG9nRXJyb3IoJ3NvY2tldCBlcnJvciAnICsgZXJyb3IuY29kZSk7XG4gICAgdGhpcy5fZW1pdFN0YXR1cyhTVEFUVVNfRVJST1IsIGVycm9yLmNvZGUpO1xuICB9XG5cbiAgX29uRW5kKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzQ2xvc2VkID0gdHJ1ZTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9lbWl0U3RhdHVzKFNUQVRVU19FTkQpO1xuICB9XG5cbiAgX29uRGF0YShkYXRhOiBCdWZmZXIgfCBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZGF0YS50b1N0cmluZygpO1xuICAgIGxvZ2dlci5sb2coJ1JlY2lldmVkIGRhdGE6ICcgKyBtZXNzYWdlKTtcbiAgICBsZXQgcmVzcG9uc2VzID0gW107XG4gICAgdHJ5IHtcbiAgICAgIHJlc3BvbnNlcyA9IHRoaXMuX21lc3NhZ2VIYW5kbGVyLnBhcnNlTWVzc2FnZXMobWVzc2FnZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gSWYgbWVzc2FnZSBwYXJzaW5nIGZhaWxzLCB0aGVuIG91ciBjb250cmFjdCB3aXRoIEhIVk0gaXMgdmlvbGF0ZWQgYW5kIHdlIG5lZWQgdG8ga2lsbCB0aGVcbiAgICAgIC8vIGNvbm5lY3Rpb24uXG4gICAgICB0aGlzLl9lbWl0U3RhdHVzKFNUQVRVU19FUlJPUiwgZS5tZXNzYWdlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzcG9uc2VzLmZvckVhY2gociA9PiB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IHIucmVzcG9uc2U7XG4gICAgICBjb25zdCBzdHJlYW0gPSByLnN0cmVhbTtcbiAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICBjb25zdCByZXNwb25zZUF0dHJpYnV0ZXMgPSByZXNwb25zZS4kO1xuICAgICAgICBjb25zdCB7Y29tbWFuZCwgdHJhbnNhY3Rpb25faWR9ID0gcmVzcG9uc2VBdHRyaWJ1dGVzO1xuICAgICAgICBjb25zdCB0cmFuc2FjdGlvbklkID0gTnVtYmVyKHRyYW5zYWN0aW9uX2lkKTtcbiAgICAgICAgY29uc3QgY2FsbCA9IHRoaXMuX2NhbGxzLmdldCh0cmFuc2FjdGlvbklkKTtcbiAgICAgICAgaWYgKCFjYWxsKSB7XG4gICAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdNaXNzaW5nIGNhbGwgZm9yIHJlc3BvbnNlOiAnICsgbWVzc2FnZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NhbGxzLmRlbGV0ZSh0cmFuc2FjdGlvbklkKTtcblxuICAgICAgICBpZiAoY2FsbC5jb21tYW5kICE9PSBjb21tYW5kKSB7XG4gICAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdCYWQgY29tbWFuZCBpbiByZXNwb25zZS4gRm91bmQgJyArXG4gICAgICAgICAgICBjb21tYW5kICsgJy4gZXhwZWN0ZWQgJyArIGNhbGwuY29tbWFuZCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbG9nZ2VyLmxvZygnQ29tcGxldGluZyBjYWxsOiAnICsgbWVzc2FnZSk7XG4gICAgICAgICAgY2FsbC5jb21wbGV0ZShyZXNwb25zZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBsb2dnZXIubG9nRXJyb3IoJ0V4Y2VwdGlvbjogJyArIGUudG9TdHJpbmcoKSArICcgaGFuZGxpbmcgY2FsbDogJyArIG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHN0cmVhbSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IG91dHB1dFR5cGUgPSBzdHJlYW0uJC50eXBlO1xuICAgICAgICBjb25zdCBvdXRwdXRUZXh0ID0gYmFzZTY0RGVjb2RlKHN0cmVhbS5fKTtcbiAgICAgICAgbG9nZ2VyLmxvZyhgJHtvdXRwdXRUeXBlfSBtZXNzYWdlIHJlY2VpdmVkOiAke291dHB1dFRleHR9YCk7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG91dHB1dFR5cGUgPT09ICdzdGRvdXQnID8gU1RBVFVTX1NURE9VVCA6IFNUQVRVU19TVERFUlI7XG4gICAgICAgIHRoaXMuX2VtaXRTdGF0dXMoc3RhdHVzLCBvdXRwdXRUZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5sb2dFcnJvcignVW5leHBlY3RlZCBzb2NrZXQgbWVzc2FnZTogJyArIG1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0U3RhY2tGcmFtZXMoKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICByZXR1cm4gdGhpcy5fY2FsbERlYnVnZ2VyKCdzdGFja19nZXQnKTtcbiAgfVxuXG4gIGFzeW5jIGdldENvbnRleHRzRm9yRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyKTogUHJvbWlzZTxBcnJheTxEYmdwQ29udGV4dD4+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2NvbnRleHRfbmFtZXMnLCBgLWQgJHtmcmFtZUluZGV4fWApO1xuICAgIHJldHVybiByZXN1bHQuY29udGV4dC5tYXAoY29udGV4dCA9PiBjb250ZXh0LiQpO1xuICB9XG5cbiAgYXN5bmMgZ2V0Q29udGV4dFByb3BlcnRpZXMoZnJhbWVJbmRleDogbnVtYmVyLCBjb250ZXh0SWQ6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8RGJncFByb3BlcnR5Pj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcignY29udGV4dF9nZXQnLCBgLWQgJHtmcmFtZUluZGV4fSAtYyAke2NvbnRleHRJZH1gKTtcbiAgICAvLyAwIHJlc3VsdHMgeWllbGRzIG1pc3NpbmcgJ3Byb3BlcnR5JyBtZW1iZXJcbiAgICByZXR1cm4gcmVzdWx0LnByb3BlcnR5IHx8IFtdO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHJvcGVydGllc0J5RnVsbG5hbWUoZnJhbWVJbmRleDogbnVtYmVyLCBjb250ZXh0SWQ6IHN0cmluZywgZnVsbG5hbWU6IHN0cmluZyxcbiAgICAgIHBhZ2U6IG51bWJlcik6IFByb21pc2U8QXJyYXk8RGJncFByb3BlcnR5Pj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihcbiAgICAgICdwcm9wZXJ0eV92YWx1ZScsIGAtZCAke2ZyYW1lSW5kZXh9IC1jICR7Y29udGV4dElkfSAtbiAke2Z1bGxuYW1lfSAtcCAke3BhZ2V9YCk7XG4gICAgLy8gcHJvcGVydHlfdmFsdWUgcmV0dXJucyB0aGUgb3V0ZXIgcHJvcGVydHksIHdlIHdhbnQgdGhlIGNoaWxkcmVuIC4uLlxuICAgIC8vIDAgcmVzdWx0cyB5aWVsZHMgbWlzc2luZyAncHJvcGVydHknIG1lbWJlclxuICAgIHJldHVybiByZXN1bHQucHJvcGVydHlbMF0ucHJvcGVydHkgfHwgW107XG4gIH1cblxuICBhc3luYyBnZXRQcm9wZXJ0aWVzQnlGdWxsbmFtZUFsbENvbmV4dHMoXG4gICAgZnJhbWVJbmRleDogbnVtYmVyLFxuICAgIGZ1bGxuYW1lOiBzdHJpbmcsXG4gICAgcGFnZTogbnVtYmVyLFxuICApOiBQcm9taXNlPEFycmF5PERiZ3BQcm9wZXJ0eT4+IHtcbiAgICAvLyBQYXNzIHplcm8gYXMgY29udGV4dElkIHRvIHNlYXJjaCBhbGwgY29udGV4dHMuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0UHJvcGVydGllc0J5RnVsbG5hbWUoZnJhbWVJbmRleCwgLypjb250ZXh0SWQqLycwJywgZnVsbG5hbWUsIHBhZ2UpO1xuICB9XG5cbiAgYXN5bmMgZXZhbHVhdGVPbkNhbGxGcmFtZShmcmFtZUluZGV4OiBudW1iZXIsIGV4cHJlc3Npb246IHN0cmluZyk6IFByb21pc2U8RXZhbHVhdGlvblJlc3VsdD4ge1xuICAgIC8vIEVzY2FwZSBhbnkgZG91YmxlIHF1b3RlIGluIHRoZSBleHByZXNzaW9uLlxuICAgIGNvbnN0IGVzY2FwZWRFeHByZXNzaW9uID0gZXhwcmVzc2lvbi5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyk7XG4gICAgLy8gUXVvdGUgdGhlIGlucHV0IGV4cHJlc3Npb24gc28gdGhhdCB3ZSBjYW4gc3VwcG9ydCBleHByZXNzaW9uIHdpdGhcbiAgICAvLyBzcGFjZSBpbiBpdChlLmcuIGZ1bmN0aW9uIGV2YWx1YXRpb24pLlxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihcbiAgICAgICdwcm9wZXJ0eV92YWx1ZScsXG4gICAgICBgLWQgJHtmcmFtZUluZGV4fSAtbiBcIiR7ZXNjYXBlZEV4cHJlc3Npb259XCJgXG4gICAgKTtcbiAgICBpZiAocmVzdWx0LmVycm9yICYmIHJlc3VsdC5lcnJvci5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlcnJvcjogcmVzdWx0LmVycm9yWzBdLFxuICAgICAgICB3YXNUaHJvd246IHRydWUsXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdWx0OiByZXN1bHQucHJvcGVydHlbMF0gfHwgW10sXG4gICAgICB3YXNUaHJvd246IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICAvLyBSZXR1cm5zIG9uZSBvZjpcbiAgLy8gIHN0YXJ0aW5nLCBzdG9wcGluZywgc3RvcHBlZCwgcnVubmluZywgYnJlYWtcbiAgYXN5bmMgZ2V0U3RhdHVzKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ3N0YXR1cycpO1xuICAgIC8vIFRPRE86IERvIHdlIGV2ZXIgY2FyZSBhYm91dCByZXNwb25zZS4kLnJlYXNvbj9cbiAgICByZXR1cm4gcmVzcG9uc2UuJC5zdGF0dXM7XG4gIH1cblxuICAvLyBDb250aW51YXRpb24gY29tbWFuZHMgZ2V0IGEgcmVzcG9uc2UsIGJ1dCB0aGF0IHJlc3BvbnNlXG4gIC8vIGlzIGEgc3RhdHVzIG1lc3NhZ2Ugd2hpY2ggb2NjdXJzIGFmdGVyIGV4ZWN1dGlvbiBzdG9wcy5cbiAgYXN5bmMgc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0aGlzLl9lbWl0U3RhdHVzKFNUQVRVU19SVU5OSU5HKTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihjb21tYW5kKTtcbiAgICBjb25zdCBzdGF0dXMgPSByZXNwb25zZS4kLnN0YXR1cztcbiAgICB0aGlzLl9lbWl0U3RhdHVzKHN0YXR1cyk7XG4gICAgcmV0dXJuIHN0YXR1cztcbiAgfVxuXG4gIGFzeW5jIHNlbmRCcmVha0NvbW1hbmQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2JyZWFrJyk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuc3VjY2VzcyAhPT0gJzAnO1xuICB9XG5cbiAgYXN5bmMgc2VuZFN0ZG91dFJlcXVlc3QoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgLy8gYC1jIDFgIHRlbGxzIEhIVk0gdG8gc2VuZCBzdGRvdXQgdG8gdGhlIG5vcm1hbCBkZXN0aW5hdGlvbiwgYXMgd2VsbCBhcyBmb3J3YXJkIGl0IHRvIG51Y2xpZGUuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ3N0ZG91dCcsICctYyAxJyk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuc3VjY2VzcyAhPT0gJzAnO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0ZGVyciBmb3J3YXJkaW5nIGlzIG5vdCBpbXBsZW1lbnRlZCBieSBISFZNIHlldCBzbyB0aGlzIHdpbGwgYWx3YXlzIHJldHVybiBmYWlsdXJlLlxuICAgKi9cbiAgYXN5bmMgc2VuZFN0ZGVyclJlcXVlc3QoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ3N0ZGVycicsICctYyAxJyk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuc3VjY2VzcyAhPT0gJzAnO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSBnaXZlbiBjb25maWcgc2V0dGluZyBpbiB0aGUgZGVidWdnZXIgdG8gYSBnaXZlbiB2YWx1ZS5cbiAgICovXG4gIGFzeW5jIHNldEZlYXR1cmUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2ZlYXR1cmVfc2V0JywgYC1uICR7bmFtZX0gLXYgJHt2YWx1ZX1gKTtcbiAgICByZXR1cm4gcmVzcG9uc2UuJC5zdWNjZXNzICE9PSAnMCc7XG4gIH1cblxuICAvKipcbiAgICogRXZhbHVhdGUgdGhlIGV4cHJlc3Npb24gaW4gdGhlIGRlYnVnZ2VyJ3MgY3VycmVudCBjb250ZXh0LlxuICAgKi9cbiAgYXN5bmMgcnVudGltZUV2YWx1YXRlKGV4cHI6IHN0cmluZyk6IFByb21pc2U8RXZhbHVhdGlvblJlc3VsdD4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdldmFsJywgYC0tICR7YmFzZTY0RW5jb2RlKGV4cHIpfWApO1xuICAgIGlmIChyZXNwb25zZS5lcnJvciAmJiByZXNwb25zZS5lcnJvci5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlcnJvcjogcmVzcG9uc2UuZXJyb3JbMF0sXG4gICAgICAgIHdhc1Rocm93bjogdHJ1ZSxcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXN1bHQ6IHJlc3BvbnNlLnByb3BlcnR5WzBdIHx8IFtdLFxuICAgICAgd2FzVGhyb3duOiBmYWxzZSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGV4Y2VwdGlvbiBicmVha3BvaW50IGlkLlxuICAgKi9cbiAgYXN5bmMgc2V0RXhjZXB0aW9uQnJlYWtwb2ludChleGNlcHRpb25OYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdicmVha3BvaW50X3NldCcsIGAtdCBleGNlcHRpb24gLXggJHtleGNlcHRpb25OYW1lfWApO1xuICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBmcm9tIHNldFBhdXNlZE9uRXhjZXB0aW9uczogJyArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgfVxuICAgIC8vIFRPRE86IFZhbGlkYXRlIHRoYXQgcmVzcG9uc2UuJC5zdGF0ZSA9PT0gJ2VuYWJsZWQnXG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuaWQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGJyZWFrcG9pbnQgaWRcbiAgICovXG4gIGFzeW5jIHNldEJyZWFrcG9pbnQoZmlsZW5hbWU6IHN0cmluZywgbGluZU51bWJlcjogbnVtYmVyKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihcbiAgICAgICdicmVha3BvaW50X3NldCcsXG4gICAgICBgLXQgbGluZSAtZiAke2ZpbGVuYW1lfSAtbiAke2xpbmVOdW1iZXJ9YFxuICAgICk7XG4gICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHNldHRpbmcgYnJlYWtwb2ludDogJyArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgfVxuICAgIC8vIFRPRE86IFZhbGlkYXRlIHRoYXQgcmVzcG9uc2UuJC5zdGF0ZSA9PT0gJ2VuYWJsZWQnXG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuaWQ7XG4gIH1cblxuICBhc3luYyByZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2JyZWFrcG9pbnRfcmVtb3ZlJywgYC1kICR7YnJlYWtwb2ludElkfWApO1xuICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciByZW1vdmluZyBicmVha3BvaW50OiAnICsgSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKTtcbiAgICB9XG4gIH1cblxuICAvLyBTZW5kcyBjb21tYW5kIHRvIGhodm0uXG4gIC8vIFJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHJlc3VsdGluZyBhdHRyaWJ1dGVzLlxuICBfY2FsbERlYnVnZ2VyKGNvbW1hbmQ6IHN0cmluZywgcGFyYW1zOiA/c3RyaW5nKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICBjb25zdCB0cmFuc2FjdGlvbklkID0gdGhpcy5fc2VuZENvbW1hbmQoY29tbWFuZCwgcGFyYW1zKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY2FsbHMuc2V0KHRyYW5zYWN0aW9uSWQsIHtcbiAgICAgICAgY29tbWFuZCxcbiAgICAgICAgY29tcGxldGU6IHJlc3VsdCA9PiByZXNvbHZlKHJlc3VsdCksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9zZW5kQ29tbWFuZChjb21tYW5kOiBzdHJpbmcsIHBhcmFtczogP3N0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3QgaWQgPSArK3RoaXMuX3RyYW5zYWN0aW9uSWQ7XG4gICAgbGV0IG1lc3NhZ2UgPSBgJHtjb21tYW5kfSAtaSAke2lkfWA7XG4gICAgaWYgKHBhcmFtcykge1xuICAgICAgbWVzc2FnZSArPSAnICcgKyBwYXJhbXM7XG4gICAgfVxuICAgIHRoaXMuX3NlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuXG4gIF9zZW5kTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgaWYgKHNvY2tldCAhPSBudWxsKSB7XG4gICAgICBsb2dnZXIubG9nKCdTZW5kaW5nIG1lc3NhZ2U6ICcgKyBtZXNzYWdlKTtcbiAgICAgIHNvY2tldC53cml0ZShtZXNzYWdlICsgJ1xceDAwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5sb2dFcnJvcignQXR0ZW1wdCB0byBzZW5kIG1lc3NhZ2UgYWZ0ZXIgZGlzcG9zZTogJyArIG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIF9lbWl0U3RhdHVzKHN0YXR1czogc3RyaW5nLCAuLi5hcmdzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZygnRW1pdHRpbmcgc3RhdHVzOiAnICsgc3RhdHVzKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoREJHUF9TT0NLRVRfU1RBVFVTX0VWRU5ULCBzdGF0dXMsIC4uLmFyZ3MpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzQ2xvc2VkKSB7XG4gICAgICAvLyBUT0RPW2plZmZyZXl0YW5dOiB3b3JrYXJvdW5kIGEgY3Jhc2godDgxODE1MzgpIGluIGhodm1cbiAgICAgIHRoaXMuc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9ERVRBQ0gpO1xuICAgIH1cblxuICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcbiAgICBpZiAoc29ja2V0KSB7XG4gICAgICAvLyBlbmQgLSBTZW5kcyB0aGUgRklOIHBhY2tldCBhbmQgY2xvc2VzIHdyaXRpbmcuXG4gICAgICAvLyBkZXN0cm95IC0gY2xvc2VzIGZvciByZWFkaW5nIGFuZCB3cml0aW5nLlxuICAgICAgc29ja2V0LmVuZCgpO1xuICAgICAgc29ja2V0LmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3NvY2tldCA9IG51bGw7XG4gICAgICB0aGlzLl9pc0Nsb3NlZCA9IHRydWU7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBEYmdwU29ja2V0LFxuICBTVEFUVVNfU1RBUlRJTkcsXG4gIFNUQVRVU19TVE9QUElORyxcbiAgU1RBVFVTX1NUT1BQRUQsXG4gIFNUQVRVU19SVU5OSU5HLFxuICBTVEFUVVNfQlJFQUssXG4gIFNUQVRVU19FUlJPUixcbiAgU1RBVFVTX0VORCxcbiAgU1RBVFVTX1NURE9VVCxcbiAgU1RBVFVTX1NUREVSUixcbiAgQ09NTUFORF9SVU4sXG4gIENPTU1BTkRfU1RFUF9JTlRPLFxuICBDT01NQU5EX1NURVBfT1ZFUixcbiAgQ09NTUFORF9TVEVQX09VVCxcbiAgQ09NTUFORF9TVE9QLFxuICBDT01NQU5EX0RFVEFDSCxcbn07XG4iXX0=