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
//# sourceMappingURL=data:application/json;base64,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QUFPLEVBQUUsQ0FBQztBQUNqQixZQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUNwQixZQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztPQUN2QjtLQUNGOzs7U0ExUUcsVUFBVTs7O0FBNlFoQixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsWUFBVSxFQUFWLFVBQVU7QUFDVixpQkFBZSxFQUFmLGVBQWU7QUFDZixpQkFBZSxFQUFmLGVBQWU7QUFDZixnQkFBYyxFQUFkLGNBQWM7QUFDZCxnQkFBYyxFQUFkLGNBQWM7QUFDZCxjQUFZLEVBQVosWUFBWTtBQUNaLGNBQVksRUFBWixZQUFZO0FBQ1osWUFBVSxFQUFWLFVBQVU7QUFDVixlQUFhLEVBQWIsYUFBYTtBQUNiLGVBQWEsRUFBYixhQUFhO0FBQ2IsYUFBVyxFQUFYLFdBQVc7QUFDWCxtQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQixjQUFZLEVBQVosWUFBWTtBQUNaLGdCQUFjLEVBQWQsY0FBYztDQUNmLENBQUMiLCJmaWxlIjoiRGJncFNvY2tldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7YmFzZTY0RGVjb2RlfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQge0RiZ3BNZXNzYWdlSGFuZGxlciwgZ2V0RGJncE1lc3NhZ2VIYW5kbGVySW5zdGFuY2V9IGZyb20gJy4vRGJncE1lc3NhZ2VIYW5kbGVyJztcbmltcG9ydCB0eXBlIHtTb2NrZXR9IGZyb20gJ25ldCc7XG5cbi8vIFJlc3BvbnNlcyB0byB0aGUgREJHUCAnc3RhdHVzJyBjb21tYW5kXG5jb25zdCBTVEFUVVNfU1RBUlRJTkcgPSAnc3RhcnRpbmcnO1xuY29uc3QgU1RBVFVTX1NUT1BQSU5HID0gJ3N0b3BwaW5nJztcbmNvbnN0IFNUQVRVU19TVE9QUEVEID0gJ3N0b3BwZWQnO1xuY29uc3QgU1RBVFVTX1JVTk5JTkcgPSAncnVubmluZyc7XG5jb25zdCBTVEFUVVNfQlJFQUsgPSAnYnJlYWsnO1xuLy8gRXJyb3IgYW5kIEVuZCBhcmUgbm90IGRiZ3Agc3RhdHVzIGNvZGVzLCB0aGV5IHJlbGF0ZSB0byBzb2NrZXQgc3RhdGVzLlxuY29uc3QgU1RBVFVTX0VSUk9SID0gJ2Vycm9yJztcbmNvbnN0IFNUQVRVU19FTkQgPSAnZW5kJztcbi8vIHN0ZG91dCBhbmQgc3RkZXJyIGFyZSBlbWl0dGVkIHdoZW4gREJHUCBzZW5kcyB0aGUgY29ycmVzcG9uZGluZyBtZXNzYWdlIHBhY2tldHMuXG5jb25zdCBTVEFUVVNfU1RET1VUID0gJ3N0ZG91dCc7XG5jb25zdCBTVEFUVVNfU1RERVJSID0gJ3N0ZGVycic7XG5cbi8vIFZhbGlkIGNvbnRpbnVhdGlvbiBjb21tYW5kc1xuY29uc3QgQ09NTUFORF9SVU4gPSAncnVuJztcbmNvbnN0IENPTU1BTkRfU1RFUF9JTlRPID0gJ3N0ZXBfaW50byc7XG5jb25zdCBDT01NQU5EX1NURVBfT1ZFUiA9ICdzdGVwX292ZXInO1xuY29uc3QgQ09NTUFORF9TVEVQX09VVCA9ICdzdGVwX291dCc7XG5jb25zdCBDT01NQU5EX1NUT1AgPSAnc3RvcCc7XG5jb25zdCBDT01NQU5EX0RFVEFDSCA9ICdkZXRhY2gnO1xuXG5jb25zdCBEQkdQX1NPQ0tFVF9TVEFUVVNfRVZFTlQgPSAnZGJncC1zb2NrZXQtc3RhdHVzJztcblxuZXhwb3J0IHR5cGUgRGJncENvbnRleHQgPSB7XG4gIG5hbWU6IHN0cmluZztcbiAgaWQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIERiZ3BQcm9wZXJ0eSA9IHtcbiAgJDoge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBmdWxsbmFtZTogc3RyaW5nO1xuICAgIGFkZHJlc3M6IHN0cmluZztcbiAgICB0eXBlOiBzdHJpbmc7XG5cbiAgICAvLyBhcnJheSBvciBvYmplY3RcbiAgICBjbGFzc25hbWU/OiBzdHJpbmc7XG4gICAgY2hpbGRyZW4/OiBib29sZWFuO1xuICAgIG51bUNoaWxkcmVuPzogbnVtYmVyO1xuICAgIHBhZ2U/OiBudW1iZXI7XG4gICAgcGFnZXNpemU/OiBudW1iZXI7XG5cbiAgICAvLyBzdHJpbmdcbiAgICBzaXplPzogbnVtYmVyO1xuICAgIGVuY29kaW5nPzogc3RyaW5nO1xuICB9O1xuXG4gIC8vIFZhbHVlIGlmIHByZXNlbnQsIHN1YmplY3QgdG8gZW5jb2RpbmcgaWYgcHJlc2VudFxuICBfPzogc3RyaW5nO1xuXG4gIC8vIGFycmF5IG9yIG9iamVjdCBtZW1iZXJzXG4gIHByb3BlcnR5PzogQXJyYXk8RGJncFByb3BlcnR5Pjtcbn07XG5cbnR5cGUgRXZhbHVhdGlvblJlc3VsdCA9IHtcbiAgZXJyb3I/OiBPYmplY3Q7XG4gIHJlc3VsdD86ID9EYmdwUHJvcGVydHk7XG4gIHdhc1Rocm93bjogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogSGFuZGxlcyBzZW5kaW5nIGFuZCByZWNpZXZpbmcgZGJncCBtZXNzYWdlcyBvdmVyIGEgbmV0IFNvY2tldC5cbiAqIERiZ3AgZG9jdW1lbnRhdGlvbiBjYW4gYmUgZm91bmQgYXQgaHR0cDovL3hkZWJ1Zy5vcmcvZG9jcy1kYmdwLnBocFxuICovXG5jbGFzcyBEYmdwU29ja2V0IHtcbiAgX3NvY2tldDogP1NvY2tldDtcbiAgX3RyYW5zYWN0aW9uSWQ6IG51bWJlcjtcbiAgLy8gTWFwcyBmcm9tIHRyYW5zYWN0aW9uSWQgLT4gY2FsbFxuICBfY2FsbHM6IE1hcDxudW1iZXIsIHtjb21tYW5kOiBzdHJpbmc7IGNvbXBsZXRlOiAocmVzdWx0czogT2JqZWN0KSA9PiB2b2lkfT47XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF9pc0Nsb3NlZDogYm9vbGVhbjtcbiAgX21lc3NhZ2VIYW5kbGVyOiBEYmdwTWVzc2FnZUhhbmRsZXI7XG5cbiAgY29uc3RydWN0b3Ioc29ja2V0OiBTb2NrZXQpIHtcbiAgICB0aGlzLl9zb2NrZXQgPSBzb2NrZXQ7XG4gICAgdGhpcy5fdHJhbnNhY3Rpb25JZCA9IDA7XG4gICAgdGhpcy5fY2FsbHMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9pc0Nsb3NlZCA9IGZhbHNlO1xuICAgIHRoaXMuX21lc3NhZ2VIYW5kbGVyID0gZ2V0RGJncE1lc3NhZ2VIYW5kbGVySW5zdGFuY2UoKTtcblxuICAgIHNvY2tldC5vbignZW5kJywgdGhpcy5fb25FbmQuYmluZCh0aGlzKSk7XG4gICAgc29ja2V0Lm9uKCdlcnJvcicsIHRoaXMuX29uRXJyb3IuYmluZCh0aGlzKSk7XG4gICAgc29ja2V0Lm9uKCdkYXRhJywgdGhpcy5fb25EYXRhLmJpbmQodGhpcykpO1xuICB9XG5cbiAgb25TdGF0dXMoY2FsbGJhY2s6IChzdGF0dXM6IHN0cmluZykgPT4gbWl4ZWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKS5ldmVudFxuICAgICAgLmF0dGFjaEV2ZW50KHRoaXMuX2VtaXR0ZXIsIERCR1BfU09DS0VUX1NUQVRVU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgX29uRXJyb3IoZXJyb3I6IHtjb2RlOiBudW1iZXJ9KTogdm9pZCB7XG4gICAgLy8gTm90IHN1cmUgaWYgaGh2bSBpcyBhbGl2ZSBvciBub3RcbiAgICAvLyBkbyBub3Qgc2V0IF9pc0Nsb3NlZCBmbGFnIHNvIHRoYXQgZGV0YWNoIHdpbGwgYmUgc2VudCBiZWZvcmUgZGlzcG9zZSgpLlxuICAgIGxvZ2dlci5sb2dFcnJvcignc29ja2V0IGVycm9yICcgKyBlcnJvci5jb2RlKTtcbiAgICB0aGlzLl9lbWl0U3RhdHVzKFNUQVRVU19FUlJPUik7XG4gIH1cblxuICBfb25FbmQoKTogdm9pZCB7XG4gICAgdGhpcy5faXNDbG9zZWQgPSB0cnVlO1xuICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgIHRoaXMuX2VtaXRTdGF0dXMoU1RBVFVTX0VORCk7XG4gIH1cblxuICBfb25EYXRhKGRhdGE6IEJ1ZmZlciB8IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgbG9nZ2VyLmxvZygnUmVjaWV2ZWQgZGF0YTogJyArIG1lc3NhZ2UpO1xuICAgIGxldCByZXNwb25zZXMgPSBbXTtcbiAgICB0cnkge1xuICAgICAgcmVzcG9uc2VzID0gdGhpcy5fbWVzc2FnZUhhbmRsZXIucGFyc2VNZXNzYWdlcyhtZXNzYWdlKTtcbiAgICB9IGNhdGNoIChfKSB7XG4gICAgICAvLyBJZiBtZXNzYWdlIHBhcnNpbmcgZmFpbHMsIHRoZW4gb3VyIGNvbnRyYWN0IHdpdGggSEhWTSBpcyB2aW9sYXRlZCBhbmQgd2UgbmVlZCB0byBraWxsIHRoZVxuICAgICAgLy8gY29ubmVjdGlvbi5cbiAgICAgIHRoaXMuX2VtaXRTdGF0dXMoU1RBVFVTX0VSUk9SKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzcG9uc2VzLmZvckVhY2gociA9PiB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IHIucmVzcG9uc2U7XG4gICAgICBjb25zdCBzdHJlYW0gPSByLnN0cmVhbTtcbiAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICBjb25zdCByZXNwb25zZUF0dHJpYnV0ZXMgPSByZXNwb25zZS4kO1xuICAgICAgICBjb25zdCB7Y29tbWFuZCwgdHJhbnNhY3Rpb25faWR9ID0gcmVzcG9uc2VBdHRyaWJ1dGVzO1xuICAgICAgICBjb25zdCB0cmFuc2FjdGlvbklkID0gTnVtYmVyKHRyYW5zYWN0aW9uX2lkKTtcbiAgICAgICAgY29uc3QgY2FsbCA9IHRoaXMuX2NhbGxzLmdldCh0cmFuc2FjdGlvbklkKTtcbiAgICAgICAgaWYgKCFjYWxsKSB7XG4gICAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdNaXNzaW5nIGNhbGwgZm9yIHJlc3BvbnNlOiAnICsgbWVzc2FnZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NhbGxzLmRlbGV0ZSh0cmFuc2FjdGlvbklkKTtcblxuICAgICAgICBpZiAoY2FsbC5jb21tYW5kICE9PSBjb21tYW5kKSB7XG4gICAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdCYWQgY29tbWFuZCBpbiByZXNwb25zZS4gRm91bmQgJyArXG4gICAgICAgICAgICBjb21tYW5kICsgJy4gZXhwZWN0ZWQgJyArIGNhbGwuY29tbWFuZCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbG9nZ2VyLmxvZygnQ29tcGxldGluZyBjYWxsOiAnICsgbWVzc2FnZSk7XG4gICAgICAgICAgY2FsbC5jb21wbGV0ZShyZXNwb25zZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBsb2dnZXIubG9nRXJyb3IoJ0V4Y2VwdGlvbjogJyArIGUudG9TdHJpbmcoKSArICcgaGFuZGxpbmcgY2FsbDogJyArIG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHN0cmVhbSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IG91dHB1dFR5cGUgPSBzdHJlYW0uJC50eXBlO1xuICAgICAgICBjb25zdCBvdXRwdXRUZXh0ID0gYmFzZTY0RGVjb2RlKHN0cmVhbS5fKTtcbiAgICAgICAgbG9nZ2VyLmxvZyhgJHtvdXRwdXRUeXBlfSBtZXNzYWdlIHJlY2VpdmVkOiAke291dHB1dFRleHR9YCk7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG91dHB1dFR5cGUgPT09ICdzdGRvdXQnID8gU1RBVFVTX1NURE9VVCA6IFNUQVRVU19TVERFUlI7XG4gICAgICAgIHRoaXMuX2VtaXRTdGF0dXMoc3RhdHVzLCBvdXRwdXRUZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5sb2dFcnJvcignVW5leHBlY3RlZCBzb2NrZXQgbWVzc2FnZTogJyArIG1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0U3RhY2tGcmFtZXMoKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICByZXR1cm4gdGhpcy5fY2FsbERlYnVnZ2VyKCdzdGFja19nZXQnKTtcbiAgfVxuXG4gIGFzeW5jIGdldENvbnRleHRzRm9yRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyKTogUHJvbWlzZTxBcnJheTxEYmdwQ29udGV4dD4+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2NvbnRleHRfbmFtZXMnLCBgLWQgJHtmcmFtZUluZGV4fWApO1xuICAgIHJldHVybiByZXN1bHQuY29udGV4dC5tYXAoY29udGV4dCA9PiBjb250ZXh0LiQpO1xuICB9XG5cbiAgYXN5bmMgZ2V0Q29udGV4dFByb3BlcnRpZXMoZnJhbWVJbmRleDogbnVtYmVyLCBjb250ZXh0SWQ6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8RGJncFByb3BlcnR5Pj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcignY29udGV4dF9nZXQnLCBgLWQgJHtmcmFtZUluZGV4fSAtYyAke2NvbnRleHRJZH1gKTtcbiAgICAvLyAwIHJlc3VsdHMgeWllbGRzIG1pc3NpbmcgJ3Byb3BlcnR5JyBtZW1iZXJcbiAgICByZXR1cm4gcmVzdWx0LnByb3BlcnR5IHx8IFtdO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHJvcGVydGllc0J5RnVsbG5hbWUoZnJhbWVJbmRleDogbnVtYmVyLCBjb250ZXh0SWQ6IHN0cmluZywgZnVsbG5hbWU6IHN0cmluZyxcbiAgICAgIHBhZ2U6IG51bWJlcik6IFByb21pc2U8QXJyYXk8RGJncFByb3BlcnR5Pj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihcbiAgICAgICdwcm9wZXJ0eV92YWx1ZScsIGAtZCAke2ZyYW1lSW5kZXh9IC1jICR7Y29udGV4dElkfSAtbiAke2Z1bGxuYW1lfSAtcCAke3BhZ2V9YCk7XG4gICAgLy8gcHJvcGVydHlfdmFsdWUgcmV0dXJucyB0aGUgb3V0ZXIgcHJvcGVydHksIHdlIHdhbnQgdGhlIGNoaWxkcmVuIC4uLlxuICAgIC8vIDAgcmVzdWx0cyB5aWVsZHMgbWlzc2luZyAncHJvcGVydHknIG1lbWJlclxuICAgIHJldHVybiByZXN1bHQucHJvcGVydHlbMF0ucHJvcGVydHkgfHwgW107XG4gIH1cblxuICBhc3luYyBnZXRQcm9wZXJ0aWVzQnlGdWxsbmFtZUFsbENvbmV4dHMoXG4gICAgZnJhbWVJbmRleDogbnVtYmVyLFxuICAgIGZ1bGxuYW1lOiBzdHJpbmcsXG4gICAgcGFnZTogbnVtYmVyLFxuICApOiBQcm9taXNlPEFycmF5PERiZ3BQcm9wZXJ0eT4+IHtcbiAgICAvLyBQYXNzIHplcm8gYXMgY29udGV4dElkIHRvIHNlYXJjaCBhbGwgY29udGV4dHMuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0UHJvcGVydGllc0J5RnVsbG5hbWUoZnJhbWVJbmRleCwgLypjb250ZXh0SWQqLycwJywgZnVsbG5hbWUsIHBhZ2UpO1xuICB9XG5cbiAgYXN5bmMgZXZhbHVhdGVPbkNhbGxGcmFtZShmcmFtZUluZGV4OiBudW1iZXIsIGV4cHJlc3Npb246IHN0cmluZyk6IFByb21pc2U8RXZhbHVhdGlvblJlc3VsdD4ge1xuICAgIC8vIEVzY2FwZSBhbnkgZG91YmxlIHF1b3RlIGluIHRoZSBleHByZXNzaW9uLlxuICAgIGNvbnN0IGVzY2FwZWRFeHByZXNzaW9uID0gZXhwcmVzc2lvbi5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyk7XG4gICAgLy8gUXVvdGUgdGhlIGlucHV0IGV4cHJlc3Npb24gc28gdGhhdCB3ZSBjYW4gc3VwcG9ydCBleHByZXNzaW9uIHdpdGhcbiAgICAvLyBzcGFjZSBpbiBpdChlLmcuIGZ1bmN0aW9uIGV2YWx1YXRpb24pLlxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihcbiAgICAgICdwcm9wZXJ0eV92YWx1ZScsXG4gICAgICBgLWQgJHtmcmFtZUluZGV4fSAtbiBcIiR7ZXNjYXBlZEV4cHJlc3Npb259XCJgXG4gICAgKTtcbiAgICBpZiAocmVzdWx0LmVycm9yICYmIHJlc3VsdC5lcnJvci5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlcnJvcjogcmVzdWx0LmVycm9yWzBdLFxuICAgICAgICB3YXNUaHJvd246IHRydWUsXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdWx0OiByZXN1bHQucHJvcGVydHlbMF0gfHwgW10sXG4gICAgICB3YXNUaHJvd246IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICAvLyBSZXR1cm5zIG9uZSBvZjpcbiAgLy8gIHN0YXJ0aW5nLCBzdG9wcGluZywgc3RvcHBlZCwgcnVubmluZywgYnJlYWtcbiAgYXN5bmMgZ2V0U3RhdHVzKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ3N0YXR1cycpO1xuICAgIC8vIFRPRE86IERvIHdlIGV2ZXIgY2FyZSBhYm91dCByZXNwb25zZS4kLnJlYXNvbj9cbiAgICByZXR1cm4gcmVzcG9uc2UuJC5zdGF0dXM7XG4gIH1cblxuICAvLyBDb250aW51YXRpb24gY29tbWFuZHMgZ2V0IGEgcmVzcG9uc2UsIGJ1dCB0aGF0IHJlc3BvbnNlXG4gIC8vIGlzIGEgc3RhdHVzIG1lc3NhZ2Ugd2hpY2ggb2NjdXJzIGFmdGVyIGV4ZWN1dGlvbiBzdG9wcy5cbiAgYXN5bmMgc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0aGlzLl9lbWl0U3RhdHVzKFNUQVRVU19SVU5OSU5HKTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihjb21tYW5kKTtcbiAgICBjb25zdCBzdGF0dXMgPSByZXNwb25zZS4kLnN0YXR1cztcbiAgICB0aGlzLl9lbWl0U3RhdHVzKHN0YXR1cyk7XG4gICAgcmV0dXJuIHN0YXR1cztcbiAgfVxuXG4gIGFzeW5jIHNlbmRCcmVha0NvbW1hbmQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2JyZWFrJyk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuc3VjY2VzcyAhPT0gJzAnO1xuICB9XG5cbiAgYXN5bmMgc2VuZFN0ZG91dFJlcXVlc3QoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgLy8gYC1jIDFgIHRlbGxzIEhIVk0gdG8gc2VuZCBzdGRvdXQgdG8gdGhlIG5vcm1hbCBkZXN0aW5hdGlvbiwgYXMgd2VsbCBhcyBmb3J3YXJkIGl0IHRvIG51Y2xpZGUuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ3N0ZG91dCcsICctYyAxJyk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuc3VjY2VzcyAhPT0gJzAnO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0ZGVyciBmb3J3YXJkaW5nIGlzIG5vdCBpbXBsZW1lbnRlZCBieSBISFZNIHlldCBzbyB0aGlzIHdpbGwgYWx3YXlzIHJldHVybiBmYWlsdXJlLlxuICAgKi9cbiAgYXN5bmMgc2VuZFN0ZGVyclJlcXVlc3QoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ3N0ZGVycicsICctYyAxJyk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuc3VjY2VzcyAhPT0gJzAnO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGV4Y2VwdGlvbiBicmVha3BvaW50IGlkLlxuICAgKi9cbiAgYXN5bmMgc2V0RXhjZXB0aW9uQnJlYWtwb2ludChleGNlcHRpb25OYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdicmVha3BvaW50X3NldCcsIGAtdCBleGNlcHRpb24gLXggJHtleGNlcHRpb25OYW1lfWApO1xuICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBmcm9tIHNldFBhdXNlZE9uRXhjZXB0aW9uczogJyArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgfVxuICAgIC8vIFRPRE86IFZhbGlkYXRlIHRoYXQgcmVzcG9uc2UuJC5zdGF0ZSA9PT0gJ2VuYWJsZWQnXG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuaWQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGJyZWFrcG9pbnQgaWRcbiAgICovXG4gIGFzeW5jIHNldEJyZWFrcG9pbnQoZmlsZW5hbWU6IHN0cmluZywgbGluZU51bWJlcjogbnVtYmVyKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihcbiAgICAgICdicmVha3BvaW50X3NldCcsXG4gICAgICBgLXQgbGluZSAtZiAke2ZpbGVuYW1lfSAtbiAke2xpbmVOdW1iZXJ9YFxuICAgICk7XG4gICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHNldHRpbmcgYnJlYWtwb2ludDogJyArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgfVxuICAgIC8vIFRPRE86IFZhbGlkYXRlIHRoYXQgcmVzcG9uc2UuJC5zdGF0ZSA9PT0gJ2VuYWJsZWQnXG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuaWQ7XG4gIH1cblxuICBhc3luYyByZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2JyZWFrcG9pbnRfcmVtb3ZlJywgYC1kICR7YnJlYWtwb2ludElkfWApO1xuICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciByZW1vdmluZyBicmVha3BvaW50OiAnICsgSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKTtcbiAgICB9XG4gIH1cblxuICAvLyBTZW5kcyBjb21tYW5kIHRvIGhodm0uXG4gIC8vIFJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHJlc3VsdGluZyBhdHRyaWJ1dGVzLlxuICBfY2FsbERlYnVnZ2VyKGNvbW1hbmQ6IHN0cmluZywgcGFyYW1zOiA/c3RyaW5nKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICBjb25zdCB0cmFuc2FjdGlvbklkID0gdGhpcy5fc2VuZENvbW1hbmQoY29tbWFuZCwgcGFyYW1zKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY2FsbHMuc2V0KHRyYW5zYWN0aW9uSWQsIHtcbiAgICAgICAgY29tbWFuZCxcbiAgICAgICAgY29tcGxldGU6IHJlc3VsdCA9PiByZXNvbHZlKHJlc3VsdCksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9zZW5kQ29tbWFuZChjb21tYW5kOiBzdHJpbmcsIHBhcmFtczogP3N0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3QgaWQgPSArK3RoaXMuX3RyYW5zYWN0aW9uSWQ7XG4gICAgbGV0IG1lc3NhZ2UgPSBgJHtjb21tYW5kfSAtaSAke2lkfWA7XG4gICAgaWYgKHBhcmFtcykge1xuICAgICAgbWVzc2FnZSArPSAnICcgKyBwYXJhbXM7XG4gICAgfVxuICAgIHRoaXMuX3NlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuXG4gIF9zZW5kTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgaWYgKHNvY2tldCAhPSBudWxsKSB7XG4gICAgICBsb2dnZXIubG9nKCdTZW5kaW5nIG1lc3NhZ2U6ICcgKyBtZXNzYWdlKTtcbiAgICAgIHNvY2tldC53cml0ZShtZXNzYWdlICsgJ1xceDAwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5sb2dFcnJvcignQXR0ZW1wdCB0byBzZW5kIG1lc3NhZ2UgYWZ0ZXIgZGlzcG9zZTogJyArIG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIF9lbWl0U3RhdHVzKHN0YXR1czogc3RyaW5nLCAuLi5hcmdzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZygnRW1pdHRpbmcgc3RhdHVzOiAnICsgc3RhdHVzKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoREJHUF9TT0NLRVRfU1RBVFVTX0VWRU5ULCBzdGF0dXMsIC4uLmFyZ3MpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzQ2xvc2VkKSB7XG4gICAgICAvLyBUT0RPW2plZmZyZXl0YW5dOiB3b3JrYXJvdW5kIGEgY3Jhc2godDgxODE1MzgpIGluIGhodm1cbiAgICAgIHRoaXMuc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9ERVRBQ0gpO1xuICAgIH1cblxuICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcbiAgICBpZiAoc29ja2V0KSB7XG4gICAgICAvLyBlbmQgLSBTZW5kcyB0aGUgRklOIHBhY2tldCBhbmQgY2xvc2VzIHdyaXRpbmcuXG4gICAgICAvLyBkZXN0cm95IC0gY2xvc2VzIGZvciByZWFkaW5nIGFuZCB3cml0aW5nLlxuICAgICAgc29ja2V0LmVuZCgpO1xuICAgICAgc29ja2V0LmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3NvY2tldCA9IG51bGw7XG4gICAgICB0aGlzLl9pc0Nsb3NlZCA9IHRydWU7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBEYmdwU29ja2V0LFxuICBTVEFUVVNfU1RBUlRJTkcsXG4gIFNUQVRVU19TVE9QUElORyxcbiAgU1RBVFVTX1NUT1BQRUQsXG4gIFNUQVRVU19SVU5OSU5HLFxuICBTVEFUVVNfQlJFQUssXG4gIFNUQVRVU19FUlJPUixcbiAgU1RBVFVTX0VORCxcbiAgU1RBVFVTX1NURE9VVCxcbiAgU1RBVFVTX1NUREVSUixcbiAgQ09NTUFORF9SVU4sXG4gIENPTU1BTkRfU1RFUF9JTlRPLFxuICBDT01NQU5EX1NURVBfT1ZFUixcbiAgQ09NTUFORF9TVEVQX09VVCxcbiAgQ09NTUFORF9TVE9QLFxuICBDT01NQU5EX0RFVEFDSCxcbn07XG4iXX0=