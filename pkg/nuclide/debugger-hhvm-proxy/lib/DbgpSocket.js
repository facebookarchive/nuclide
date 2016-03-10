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
      return require('../../commons').event.attachEvent(this._emitter, DBGP_SOCKET_STATUS_EVENT, callback);
    }
  }, {
    key: '_onError',
    value: function _onError(error) {
      // Not sure if hhvm is alive or not
      // do not set _isClosed flag so that detach will be sent before dispose().
      _utils2['default'].logError('socket error ' + error.code);
      this._emitStatus(STATUS_ERROR);
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
      } catch (_) {
        // If message parsing fails, then our contract with HHVM is violated and we need to kill the
        // connection.
        this._emitStatus(STATUS_ERROR);
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

// array or object

// string

// Value if present, subject to encoding if present

// array or object members

// Maps from transactionId -> call
//# sourceMappingURL=data:application/json;base64,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QUFPLEVBQUUsQ0FBQztBQUNqQixZQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUNwQixZQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztPQUN2QjtLQUNGOzs7U0ExUUcsVUFBVTs7O0FBNlFoQixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsWUFBVSxFQUFWLFVBQVU7QUFDVixpQkFBZSxFQUFmLGVBQWU7QUFDZixpQkFBZSxFQUFmLGVBQWU7QUFDZixnQkFBYyxFQUFkLGNBQWM7QUFDZCxnQkFBYyxFQUFkLGNBQWM7QUFDZCxjQUFZLEVBQVosWUFBWTtBQUNaLGNBQVksRUFBWixZQUFZO0FBQ1osWUFBVSxFQUFWLFVBQVU7QUFDVixlQUFhLEVBQWIsYUFBYTtBQUNiLGVBQWEsRUFBYixhQUFhO0FBQ2IsYUFBVyxFQUFYLFdBQVc7QUFDWCxtQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQixjQUFZLEVBQVosWUFBWTtBQUNaLGdCQUFjLEVBQWQsY0FBYztDQUNmLENBQUMiLCJmaWxlIjoiRGJncFNvY2tldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7YmFzZTY0RGVjb2RlfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQge0RiZ3BNZXNzYWdlSGFuZGxlciwgZ2V0RGJncE1lc3NhZ2VIYW5kbGVySW5zdGFuY2V9IGZyb20gJy4vRGJncE1lc3NhZ2VIYW5kbGVyJztcbmltcG9ydCB0eXBlIHtTb2NrZXR9IGZyb20gJ25ldCc7XG5cbi8vIFJlc3BvbnNlcyB0byB0aGUgREJHUCAnc3RhdHVzJyBjb21tYW5kXG5jb25zdCBTVEFUVVNfU1RBUlRJTkcgPSAnc3RhcnRpbmcnO1xuY29uc3QgU1RBVFVTX1NUT1BQSU5HID0gJ3N0b3BwaW5nJztcbmNvbnN0IFNUQVRVU19TVE9QUEVEID0gJ3N0b3BwZWQnO1xuY29uc3QgU1RBVFVTX1JVTk5JTkcgPSAncnVubmluZyc7XG5jb25zdCBTVEFUVVNfQlJFQUsgPSAnYnJlYWsnO1xuLy8gRXJyb3IgYW5kIEVuZCBhcmUgbm90IGRiZ3Agc3RhdHVzIGNvZGVzLCB0aGV5IHJlbGF0ZSB0byBzb2NrZXQgc3RhdGVzLlxuY29uc3QgU1RBVFVTX0VSUk9SID0gJ2Vycm9yJztcbmNvbnN0IFNUQVRVU19FTkQgPSAnZW5kJztcbi8vIHN0ZG91dCBhbmQgc3RkZXJyIGFyZSBlbWl0dGVkIHdoZW4gREJHUCBzZW5kcyB0aGUgY29ycmVzcG9uZGluZyBtZXNzYWdlIHBhY2tldHMuXG5jb25zdCBTVEFUVVNfU1RET1VUID0gJ3N0ZG91dCc7XG5jb25zdCBTVEFUVVNfU1RERVJSID0gJ3N0ZGVycic7XG5cbi8vIFZhbGlkIGNvbnRpbnVhdGlvbiBjb21tYW5kc1xuY29uc3QgQ09NTUFORF9SVU4gPSAncnVuJztcbmNvbnN0IENPTU1BTkRfU1RFUF9JTlRPID0gJ3N0ZXBfaW50byc7XG5jb25zdCBDT01NQU5EX1NURVBfT1ZFUiA9ICdzdGVwX292ZXInO1xuY29uc3QgQ09NTUFORF9TVEVQX09VVCA9ICdzdGVwX291dCc7XG5jb25zdCBDT01NQU5EX1NUT1AgPSAnc3RvcCc7XG5jb25zdCBDT01NQU5EX0RFVEFDSCA9ICdkZXRhY2gnO1xuXG5jb25zdCBEQkdQX1NPQ0tFVF9TVEFUVVNfRVZFTlQgPSAnZGJncC1zb2NrZXQtc3RhdHVzJztcblxuZXhwb3J0IHR5cGUgRGJncENvbnRleHQgPSB7XG4gIG5hbWU6IHN0cmluZztcbiAgaWQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIERiZ3BQcm9wZXJ0eSA9IHtcbiAgJDoge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBmdWxsbmFtZTogc3RyaW5nO1xuICAgIGFkZHJlc3M6IHN0cmluZztcbiAgICB0eXBlOiBzdHJpbmc7XG5cbiAgICAvLyBhcnJheSBvciBvYmplY3RcbiAgICBjbGFzc25hbWU/OiBzdHJpbmc7XG4gICAgY2hpbGRyZW4/OiBib29sZWFuO1xuICAgIG51bUNoaWxkcmVuPzogbnVtYmVyO1xuICAgIHBhZ2U/OiBudW1iZXI7XG4gICAgcGFnZXNpemU/OiBudW1iZXI7XG4gICAgcmVjdXJzaXZlPzogbnVtYmVyO1xuXG4gICAgLy8gc3RyaW5nXG4gICAgc2l6ZT86IG51bWJlcjtcbiAgICBlbmNvZGluZz86IHN0cmluZztcbiAgfTtcblxuICAvLyBWYWx1ZSBpZiBwcmVzZW50LCBzdWJqZWN0IHRvIGVuY29kaW5nIGlmIHByZXNlbnRcbiAgXz86IHN0cmluZztcblxuICAvLyBhcnJheSBvciBvYmplY3QgbWVtYmVyc1xuICBwcm9wZXJ0eT86IEFycmF5PERiZ3BQcm9wZXJ0eT47XG59O1xuXG50eXBlIEV2YWx1YXRpb25SZXN1bHQgPSB7XG4gIGVycm9yPzogT2JqZWN0O1xuICByZXN1bHQ/OiA/RGJncFByb3BlcnR5O1xuICB3YXNUaHJvd246IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgc2VuZGluZyBhbmQgcmVjaWV2aW5nIGRiZ3AgbWVzc2FnZXMgb3ZlciBhIG5ldCBTb2NrZXQuXG4gKiBEYmdwIGRvY3VtZW50YXRpb24gY2FuIGJlIGZvdW5kIGF0IGh0dHA6Ly94ZGVidWcub3JnL2RvY3MtZGJncC5waHBcbiAqL1xuY2xhc3MgRGJncFNvY2tldCB7XG4gIF9zb2NrZXQ6ID9Tb2NrZXQ7XG4gIF90cmFuc2FjdGlvbklkOiBudW1iZXI7XG4gIC8vIE1hcHMgZnJvbSB0cmFuc2FjdGlvbklkIC0+IGNhbGxcbiAgX2NhbGxzOiBNYXA8bnVtYmVyLCB7Y29tbWFuZDogc3RyaW5nOyBjb21wbGV0ZTogKHJlc3VsdHM6IE9iamVjdCkgPT4gdm9pZH0+O1xuICBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfaXNDbG9zZWQ6IGJvb2xlYW47XG4gIF9tZXNzYWdlSGFuZGxlcjogRGJncE1lc3NhZ2VIYW5kbGVyO1xuXG4gIGNvbnN0cnVjdG9yKHNvY2tldDogU29ja2V0KSB7XG4gICAgdGhpcy5fc29ja2V0ID0gc29ja2V0O1xuICAgIHRoaXMuX3RyYW5zYWN0aW9uSWQgPSAwO1xuICAgIHRoaXMuX2NhbGxzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5faXNDbG9zZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9tZXNzYWdlSGFuZGxlciA9IGdldERiZ3BNZXNzYWdlSGFuZGxlckluc3RhbmNlKCk7XG5cbiAgICBzb2NrZXQub24oJ2VuZCcsIHRoaXMuX29uRW5kLmJpbmQodGhpcykpO1xuICAgIHNvY2tldC5vbignZXJyb3InLCB0aGlzLl9vbkVycm9yLmJpbmQodGhpcykpO1xuICAgIHNvY2tldC5vbignZGF0YScsIHRoaXMuX29uRGF0YS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIG9uU3RhdHVzKGNhbGxiYWNrOiAoc3RhdHVzOiBzdHJpbmcpID0+IG1peGVkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiByZXF1aXJlKCcuLi8uLi9jb21tb25zJykuZXZlbnRcbiAgICAgIC5hdHRhY2hFdmVudCh0aGlzLl9lbWl0dGVyLCBEQkdQX1NPQ0tFVF9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIF9vbkVycm9yKGVycm9yOiB7Y29kZTogbnVtYmVyfSk6IHZvaWQge1xuICAgIC8vIE5vdCBzdXJlIGlmIGhodm0gaXMgYWxpdmUgb3Igbm90XG4gICAgLy8gZG8gbm90IHNldCBfaXNDbG9zZWQgZmxhZyBzbyB0aGF0IGRldGFjaCB3aWxsIGJlIHNlbnQgYmVmb3JlIGRpc3Bvc2UoKS5cbiAgICBsb2dnZXIubG9nRXJyb3IoJ3NvY2tldCBlcnJvciAnICsgZXJyb3IuY29kZSk7XG4gICAgdGhpcy5fZW1pdFN0YXR1cyhTVEFUVVNfRVJST1IpO1xuICB9XG5cbiAgX29uRW5kKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzQ2xvc2VkID0gdHJ1ZTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9lbWl0U3RhdHVzKFNUQVRVU19FTkQpO1xuICB9XG5cbiAgX29uRGF0YShkYXRhOiBCdWZmZXIgfCBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZGF0YS50b1N0cmluZygpO1xuICAgIGxvZ2dlci5sb2coJ1JlY2lldmVkIGRhdGE6ICcgKyBtZXNzYWdlKTtcbiAgICBsZXQgcmVzcG9uc2VzID0gW107XG4gICAgdHJ5IHtcbiAgICAgIHJlc3BvbnNlcyA9IHRoaXMuX21lc3NhZ2VIYW5kbGVyLnBhcnNlTWVzc2FnZXMobWVzc2FnZSk7XG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgLy8gSWYgbWVzc2FnZSBwYXJzaW5nIGZhaWxzLCB0aGVuIG91ciBjb250cmFjdCB3aXRoIEhIVk0gaXMgdmlvbGF0ZWQgYW5kIHdlIG5lZWQgdG8ga2lsbCB0aGVcbiAgICAgIC8vIGNvbm5lY3Rpb24uXG4gICAgICB0aGlzLl9lbWl0U3RhdHVzKFNUQVRVU19FUlJPUik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlc3BvbnNlcy5mb3JFYWNoKHIgPT4ge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSByLnJlc3BvbnNlO1xuICAgICAgY29uc3Qgc3RyZWFtID0gci5zdHJlYW07XG4gICAgICBpZiAocmVzcG9uc2UpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2VBdHRyaWJ1dGVzID0gcmVzcG9uc2UuJDtcbiAgICAgICAgY29uc3Qge2NvbW1hbmQsIHRyYW5zYWN0aW9uX2lkfSA9IHJlc3BvbnNlQXR0cmlidXRlcztcbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25JZCA9IE51bWJlcih0cmFuc2FjdGlvbl9pZCk7XG4gICAgICAgIGNvbnN0IGNhbGwgPSB0aGlzLl9jYWxscy5nZXQodHJhbnNhY3Rpb25JZCk7XG4gICAgICAgIGlmICghY2FsbCkge1xuICAgICAgICAgIGxvZ2dlci5sb2dFcnJvcignTWlzc2luZyBjYWxsIGZvciByZXNwb25zZTogJyArIG1lc3NhZ2UpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jYWxscy5kZWxldGUodHJhbnNhY3Rpb25JZCk7XG5cbiAgICAgICAgaWYgKGNhbGwuY29tbWFuZCAhPT0gY29tbWFuZCkge1xuICAgICAgICAgIGxvZ2dlci5sb2dFcnJvcignQmFkIGNvbW1hbmQgaW4gcmVzcG9uc2UuIEZvdW5kICcgK1xuICAgICAgICAgICAgY29tbWFuZCArICcuIGV4cGVjdGVkICcgKyBjYWxsLmNvbW1hbmQpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGxvZ2dlci5sb2coJ0NvbXBsZXRpbmcgY2FsbDogJyArIG1lc3NhZ2UpO1xuICAgICAgICAgIGNhbGwuY29tcGxldGUocmVzcG9uc2UpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdFeGNlcHRpb246ICcgKyBlLnRvU3RyaW5nKCkgKyAnIGhhbmRsaW5nIGNhbGw6ICcgKyBtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzdHJlYW0gIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBvdXRwdXRUeXBlID0gc3RyZWFtLiQudHlwZTtcbiAgICAgICAgY29uc3Qgb3V0cHV0VGV4dCA9IGJhc2U2NERlY29kZShzdHJlYW0uXyk7XG4gICAgICAgIGxvZ2dlci5sb2coYCR7b3V0cHV0VHlwZX0gbWVzc2FnZSByZWNlaXZlZDogJHtvdXRwdXRUZXh0fWApO1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBvdXRwdXRUeXBlID09PSAnc3Rkb3V0JyA/IFNUQVRVU19TVERPVVQgOiBTVEFUVVNfU1RERVJSO1xuICAgICAgICB0aGlzLl9lbWl0U3RhdHVzKHN0YXR1cywgb3V0cHV0VGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2dnZXIubG9nRXJyb3IoJ1VuZXhwZWN0ZWQgc29ja2V0IG1lc3NhZ2U6ICcgKyBtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldFN0YWNrRnJhbWVzKCk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgcmV0dXJuIHRoaXMuX2NhbGxEZWJ1Z2dlcignc3RhY2tfZ2V0Jyk7XG4gIH1cblxuICBhc3luYyBnZXRDb250ZXh0c0ZvckZyYW1lKGZyYW1lSW5kZXg6IG51bWJlcik6IFByb21pc2U8QXJyYXk8RGJncENvbnRleHQ+PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdjb250ZXh0X25hbWVzJywgYC1kICR7ZnJhbWVJbmRleH1gKTtcbiAgICByZXR1cm4gcmVzdWx0LmNvbnRleHQubWFwKGNvbnRleHQgPT4gY29udGV4dC4kKTtcbiAgfVxuXG4gIGFzeW5jIGdldENvbnRleHRQcm9wZXJ0aWVzKGZyYW1lSW5kZXg6IG51bWJlciwgY29udGV4dElkOiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PERiZ3BQcm9wZXJ0eT4+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2NvbnRleHRfZ2V0JywgYC1kICR7ZnJhbWVJbmRleH0gLWMgJHtjb250ZXh0SWR9YCk7XG4gICAgLy8gMCByZXN1bHRzIHlpZWxkcyBtaXNzaW5nICdwcm9wZXJ0eScgbWVtYmVyXG4gICAgcmV0dXJuIHJlc3VsdC5wcm9wZXJ0eSB8fCBbXTtcbiAgfVxuXG4gIGFzeW5jIGdldFByb3BlcnRpZXNCeUZ1bGxuYW1lKGZyYW1lSW5kZXg6IG51bWJlciwgY29udGV4dElkOiBzdHJpbmcsIGZ1bGxuYW1lOiBzdHJpbmcsXG4gICAgICBwYWdlOiBudW1iZXIpOiBQcm9taXNlPEFycmF5PERiZ3BQcm9wZXJ0eT4+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoXG4gICAgICAncHJvcGVydHlfdmFsdWUnLCBgLWQgJHtmcmFtZUluZGV4fSAtYyAke2NvbnRleHRJZH0gLW4gJHtmdWxsbmFtZX0gLXAgJHtwYWdlfWApO1xuICAgIC8vIHByb3BlcnR5X3ZhbHVlIHJldHVybnMgdGhlIG91dGVyIHByb3BlcnR5LCB3ZSB3YW50IHRoZSBjaGlsZHJlbiAuLi5cbiAgICAvLyAwIHJlc3VsdHMgeWllbGRzIG1pc3NpbmcgJ3Byb3BlcnR5JyBtZW1iZXJcbiAgICByZXR1cm4gcmVzdWx0LnByb3BlcnR5WzBdLnByb3BlcnR5IHx8IFtdO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHJvcGVydGllc0J5RnVsbG5hbWVBbGxDb25leHRzKFxuICAgIGZyYW1lSW5kZXg6IG51bWJlcixcbiAgICBmdWxsbmFtZTogc3RyaW5nLFxuICAgIHBhZ2U6IG51bWJlcixcbiAgKTogUHJvbWlzZTxBcnJheTxEYmdwUHJvcGVydHk+PiB7XG4gICAgLy8gUGFzcyB6ZXJvIGFzIGNvbnRleHRJZCB0byBzZWFyY2ggYWxsIGNvbnRleHRzLlxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFByb3BlcnRpZXNCeUZ1bGxuYW1lKGZyYW1lSW5kZXgsIC8qY29udGV4dElkKi8nMCcsIGZ1bGxuYW1lLCBwYWdlKTtcbiAgfVxuXG4gIGFzeW5jIGV2YWx1YXRlT25DYWxsRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyLCBleHByZXNzaW9uOiBzdHJpbmcpOiBQcm9taXNlPEV2YWx1YXRpb25SZXN1bHQ+IHtcbiAgICAvLyBFc2NhcGUgYW55IGRvdWJsZSBxdW90ZSBpbiB0aGUgZXhwcmVzc2lvbi5cbiAgICBjb25zdCBlc2NhcGVkRXhwcmVzc2lvbiA9IGV4cHJlc3Npb24ucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpO1xuICAgIC8vIFF1b3RlIHRoZSBpbnB1dCBleHByZXNzaW9uIHNvIHRoYXQgd2UgY2FuIHN1cHBvcnQgZXhwcmVzc2lvbiB3aXRoXG4gICAgLy8gc3BhY2UgaW4gaXQoZS5nLiBmdW5jdGlvbiBldmFsdWF0aW9uKS5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoXG4gICAgICAncHJvcGVydHlfdmFsdWUnLFxuICAgICAgYC1kICR7ZnJhbWVJbmRleH0gLW4gXCIke2VzY2FwZWRFeHByZXNzaW9ufVwiYFxuICAgICk7XG4gICAgaWYgKHJlc3VsdC5lcnJvciAmJiByZXN1bHQuZXJyb3IubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZXJyb3I6IHJlc3VsdC5lcnJvclswXSxcbiAgICAgICAgd2FzVGhyb3duOiB0cnVlLFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3VsdDogcmVzdWx0LnByb3BlcnR5WzBdIHx8IFtdLFxuICAgICAgd2FzVGhyb3duOiBmYWxzZSxcbiAgICB9O1xuICB9XG5cbiAgLy8gUmV0dXJucyBvbmUgb2Y6XG4gIC8vICBzdGFydGluZywgc3RvcHBpbmcsIHN0b3BwZWQsIHJ1bm5pbmcsIGJyZWFrXG4gIGFzeW5jIGdldFN0YXR1cygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdzdGF0dXMnKTtcbiAgICAvLyBUT0RPOiBEbyB3ZSBldmVyIGNhcmUgYWJvdXQgcmVzcG9uc2UuJC5yZWFzb24/XG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuc3RhdHVzO1xuICB9XG5cbiAgLy8gQ29udGludWF0aW9uIGNvbW1hbmRzIGdldCBhIHJlc3BvbnNlLCBidXQgdGhhdCByZXNwb25zZVxuICAvLyBpcyBhIHN0YXR1cyBtZXNzYWdlIHdoaWNoIG9jY3VycyBhZnRlciBleGVjdXRpb24gc3RvcHMuXG4gIGFzeW5jIHNlbmRDb250aW51YXRpb25Db21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgdGhpcy5fZW1pdFN0YXR1cyhTVEFUVVNfUlVOTklORyk7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoY29tbWFuZCk7XG4gICAgY29uc3Qgc3RhdHVzID0gcmVzcG9uc2UuJC5zdGF0dXM7XG4gICAgdGhpcy5fZW1pdFN0YXR1cyhzdGF0dXMpO1xuICAgIHJldHVybiBzdGF0dXM7XG4gIH1cblxuICBhc3luYyBzZW5kQnJlYWtDb21tYW5kKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdicmVhaycpO1xuICAgIHJldHVybiByZXNwb25zZS4kLnN1Y2Nlc3MgIT09ICcwJztcbiAgfVxuXG4gIGFzeW5jIHNlbmRTdGRvdXRSZXF1ZXN0KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIC8vIGAtYyAxYCB0ZWxscyBISFZNIHRvIHNlbmQgc3Rkb3V0IHRvIHRoZSBub3JtYWwgZGVzdGluYXRpb24sIGFzIHdlbGwgYXMgZm9yd2FyZCBpdCB0byBudWNsaWRlLlxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdzdGRvdXQnLCAnLWMgMScpO1xuICAgIHJldHVybiByZXNwb25zZS4kLnN1Y2Nlc3MgIT09ICcwJztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGRlcnIgZm9yd2FyZGluZyBpcyBub3QgaW1wbGVtZW50ZWQgYnkgSEhWTSB5ZXQgc28gdGhpcyB3aWxsIGFsd2F5cyByZXR1cm4gZmFpbHVyZS5cbiAgICovXG4gIGFzeW5jIHNlbmRTdGRlcnJSZXF1ZXN0KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdzdGRlcnInLCAnLWMgMScpO1xuICAgIHJldHVybiByZXNwb25zZS4kLnN1Y2Nlc3MgIT09ICcwJztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBleGNlcHRpb24gYnJlYWtwb2ludCBpZC5cbiAgICovXG4gIGFzeW5jIHNldEV4Y2VwdGlvbkJyZWFrcG9pbnQoZXhjZXB0aW9uTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcignYnJlYWtwb2ludF9zZXQnLCBgLXQgZXhjZXB0aW9uIC14ICR7ZXhjZXB0aW9uTmFtZX1gKTtcbiAgICBpZiAocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgZnJvbSBzZXRQYXVzZWRPbkV4Y2VwdGlvbnM6ICcgKyBKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpO1xuICAgIH1cbiAgICAvLyBUT0RPOiBWYWxpZGF0ZSB0aGF0IHJlc3BvbnNlLiQuc3RhdGUgPT09ICdlbmFibGVkJ1xuICAgIHJldHVybiByZXNwb25zZS4kLmlkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBicmVha3BvaW50IGlkXG4gICAqL1xuICBhc3luYyBzZXRCcmVha3BvaW50KGZpbGVuYW1lOiBzdHJpbmcsIGxpbmVOdW1iZXI6IG51bWJlcik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoXG4gICAgICAnYnJlYWtwb2ludF9zZXQnLFxuICAgICAgYC10IGxpbmUgLWYgJHtmaWxlbmFtZX0gLW4gJHtsaW5lTnVtYmVyfWBcbiAgICApO1xuICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBzZXR0aW5nIGJyZWFrcG9pbnQ6ICcgKyBKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpO1xuICAgIH1cbiAgICAvLyBUT0RPOiBWYWxpZGF0ZSB0aGF0IHJlc3BvbnNlLiQuc3RhdGUgPT09ICdlbmFibGVkJ1xuICAgIHJldHVybiByZXNwb25zZS4kLmlkO1xuICB9XG5cbiAgYXN5bmMgcmVtb3ZlQnJlYWtwb2ludChicmVha3BvaW50SWQ6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdicmVha3BvaW50X3JlbW92ZScsIGAtZCAke2JyZWFrcG9pbnRJZH1gKTtcbiAgICBpZiAocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgcmVtb3ZpbmcgYnJlYWtwb2ludDogJyArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gU2VuZHMgY29tbWFuZCB0byBoaHZtLlxuICAvLyBSZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSByZXN1bHRpbmcgYXR0cmlidXRlcy5cbiAgX2NhbGxEZWJ1Z2dlcihjb21tYW5kOiBzdHJpbmcsIHBhcmFtczogP3N0cmluZyk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgY29uc3QgdHJhbnNhY3Rpb25JZCA9IHRoaXMuX3NlbmRDb21tYW5kKGNvbW1hbmQsIHBhcmFtcyk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2NhbGxzLnNldCh0cmFuc2FjdGlvbklkLCB7XG4gICAgICAgIGNvbW1hbmQsXG4gICAgICAgIGNvbXBsZXRlOiByZXN1bHQgPT4gcmVzb2x2ZShyZXN1bHQpLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBfc2VuZENvbW1hbmQoY29tbWFuZDogc3RyaW5nLCBwYXJhbXM6ID9zdHJpbmcpOiBudW1iZXIge1xuICAgIGNvbnN0IGlkID0gKyt0aGlzLl90cmFuc2FjdGlvbklkO1xuICAgIGxldCBtZXNzYWdlID0gYCR7Y29tbWFuZH0gLWkgJHtpZH1gO1xuICAgIGlmIChwYXJhbXMpIHtcbiAgICAgIG1lc3NhZ2UgKz0gJyAnICsgcGFyYW1zO1xuICAgIH1cbiAgICB0aGlzLl9zZW5kTWVzc2FnZShtZXNzYWdlKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cblxuICBfc2VuZE1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xuICAgIGlmIChzb2NrZXQgIT0gbnVsbCkge1xuICAgICAgbG9nZ2VyLmxvZygnU2VuZGluZyBtZXNzYWdlOiAnICsgbWVzc2FnZSk7XG4gICAgICBzb2NrZXQud3JpdGUobWVzc2FnZSArICdcXHgwMCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIubG9nRXJyb3IoJ0F0dGVtcHQgdG8gc2VuZCBtZXNzYWdlIGFmdGVyIGRpc3Bvc2U6ICcgKyBtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBfZW1pdFN0YXR1cyhzdGF0dXM6IHN0cmluZywgLi4uYXJnczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIGxvZ2dlci5sb2coJ0VtaXR0aW5nIHN0YXR1czogJyArIHN0YXR1cyk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KERCR1BfU09DS0VUX1NUQVRVU19FVkVOVCwgc3RhdHVzLCAuLi5hcmdzKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pc0Nsb3NlZCkge1xuICAgICAgLy8gVE9ET1tqZWZmcmV5dGFuXTogd29ya2Fyb3VuZCBhIGNyYXNoKHQ4MTgxNTM4KSBpbiBoaHZtXG4gICAgICB0aGlzLnNlbmRDb250aW51YXRpb25Db21tYW5kKENPTU1BTkRfREVUQUNIKTtcbiAgICB9XG5cbiAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgaWYgKHNvY2tldCkge1xuICAgICAgLy8gZW5kIC0gU2VuZHMgdGhlIEZJTiBwYWNrZXQgYW5kIGNsb3NlcyB3cml0aW5nLlxuICAgICAgLy8gZGVzdHJveSAtIGNsb3NlcyBmb3IgcmVhZGluZyBhbmQgd3JpdGluZy5cbiAgICAgIHNvY2tldC5lbmQoKTtcbiAgICAgIHNvY2tldC5kZXN0cm95KCk7XG4gICAgICB0aGlzLl9zb2NrZXQgPSBudWxsO1xuICAgICAgdGhpcy5faXNDbG9zZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgRGJncFNvY2tldCxcbiAgU1RBVFVTX1NUQVJUSU5HLFxuICBTVEFUVVNfU1RPUFBJTkcsXG4gIFNUQVRVU19TVE9QUEVELFxuICBTVEFUVVNfUlVOTklORyxcbiAgU1RBVFVTX0JSRUFLLFxuICBTVEFUVVNfRVJST1IsXG4gIFNUQVRVU19FTkQsXG4gIFNUQVRVU19TVERPVVQsXG4gIFNUQVRVU19TVERFUlIsXG4gIENPTU1BTkRfUlVOLFxuICBDT01NQU5EX1NURVBfSU5UTyxcbiAgQ09NTUFORF9TVEVQX09WRVIsXG4gIENPTU1BTkRfU1RFUF9PVVQsXG4gIENPTU1BTkRfU1RPUCxcbiAgQ09NTUFORF9ERVRBQ0gsXG59O1xuIl19