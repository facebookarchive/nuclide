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
      var responses = this._messageHandler.parseMessages(message);
      responses.forEach(function (r) {
        var response = r.response;
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
      _utils2['default'].log('Emitting status: ' + status);
      this._emitter.emit(DBGP_SOCKET_STATUS_EVENT, status);
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
        // $FlowIssue - t9258852
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
//# sourceMappingURL=data:application/json;base64,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QUFHLEVBQUUsQ0FBQzs7QUFFYixjQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDakIsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDcEIsWUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7T0FDdkI7S0FDRjs7O1NBOU9HLFVBQVU7OztBQWlQaEIsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFlBQVUsRUFBVixVQUFVO0FBQ1YsaUJBQWUsRUFBZixlQUFlO0FBQ2YsaUJBQWUsRUFBZixlQUFlO0FBQ2YsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsY0FBWSxFQUFaLFlBQVk7QUFDWixjQUFZLEVBQVosWUFBWTtBQUNaLFlBQVUsRUFBVixVQUFVO0FBQ1YsYUFBVyxFQUFYLFdBQVc7QUFDWCxtQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQixjQUFZLEVBQVosWUFBWTtBQUNaLGdCQUFjLEVBQWQsY0FBYztDQUNmLENBQUMiLCJmaWxlIjoiRGJncFNvY2tldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHtEYmdwTWVzc2FnZUhhbmRsZXIsIGdldERiZ3BNZXNzYWdlSGFuZGxlckluc3RhbmNlfSBmcm9tICcuL0RiZ3BNZXNzYWdlSGFuZGxlcic7XG5pbXBvcnQgdHlwZSB7U29ja2V0fSBmcm9tICduZXQnO1xuXG4vLyBSZXNwb25zZXMgdG8gdGhlIERCR1AgJ3N0YXR1cycgY29tbWFuZFxuY29uc3QgU1RBVFVTX1NUQVJUSU5HID0gJ3N0YXJ0aW5nJztcbmNvbnN0IFNUQVRVU19TVE9QUElORyA9ICdzdG9wcGluZyc7XG5jb25zdCBTVEFUVVNfU1RPUFBFRCA9ICdzdG9wcGVkJztcbmNvbnN0IFNUQVRVU19SVU5OSU5HID0gJ3J1bm5pbmcnO1xuY29uc3QgU1RBVFVTX0JSRUFLID0gJ2JyZWFrJztcbi8vIEVycm9yIGFuZCBFbmQgYXJlIG5vdCBkYmdwIHN0YXR1cyBjb2RlcywgdGhleSByZWxhdGUgdG8gc29ja2V0IHN0YXRlcy5cbmNvbnN0IFNUQVRVU19FUlJPUiA9ICdlcnJvcic7XG5jb25zdCBTVEFUVVNfRU5EID0gJ2VuZCc7XG5cbi8vIFZhbGlkIGNvbnRpbnVhdGlvbiBjb21tYW5kc1xuY29uc3QgQ09NTUFORF9SVU4gPSAncnVuJztcbmNvbnN0IENPTU1BTkRfU1RFUF9JTlRPID0gJ3N0ZXBfaW50byc7XG5jb25zdCBDT01NQU5EX1NURVBfT1ZFUiA9ICdzdGVwX292ZXInO1xuY29uc3QgQ09NTUFORF9TVEVQX09VVCA9ICdzdGVwX291dCc7XG5jb25zdCBDT01NQU5EX1NUT1AgPSAnc3RvcCc7XG5jb25zdCBDT01NQU5EX0RFVEFDSCA9ICdkZXRhY2gnO1xuXG5jb25zdCBEQkdQX1NPQ0tFVF9TVEFUVVNfRVZFTlQgPSAnZGJncC1zb2NrZXQtc3RhdHVzJztcblxuZXhwb3J0IHR5cGUgRGJncENvbnRleHQgPSB7XG4gIG5hbWU6IHN0cmluZztcbiAgaWQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIERiZ3BQcm9wZXJ0eSA9IHtcbiAgJDoge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBmdWxsbmFtZTogc3RyaW5nO1xuICAgIGFkZHJlc3M6IHN0cmluZztcbiAgICB0eXBlOiBzdHJpbmc7XG5cbiAgICAvLyBhcnJheSBvciBvYmplY3RcbiAgICBjbGFzc25hbWU/OiBzdHJpbmc7XG4gICAgY2hpbGRyZW4/OiBib29sZWFuO1xuICAgIG51bUNoaWxkcmVuPzogbnVtYmVyO1xuICAgIHBhZ2U/OiBudW1iZXI7XG4gICAgcGFnZXNpemU/OiBudW1iZXI7XG5cbiAgICAvLyBzdHJpbmdcbiAgICBzaXplPzogbnVtYmVyO1xuICAgIGVuY29kaW5nPzogc3RyaW5nO1xuICB9O1xuXG4gIC8vIFZhbHVlIGlmIHByZXNlbnQsIHN1YmplY3QgdG8gZW5jb2RpbmcgaWYgcHJlc2VudFxuICBfPzogc3RyaW5nO1xuXG4gIC8vIGFycmF5IG9yIG9iamVjdCBtZW1iZXJzXG4gIHByb3BlcnR5PzogQXJyYXk8RGJncFByb3BlcnR5Pjtcbn07XG5cbnR5cGUgRXZhbHVhdGlvblJlc3VsdCA9IHtcbiAgZXJyb3I/OiBPYmplY3Q7XG4gIHJlc3VsdD86ID9EYmdwUHJvcGVydHk7XG4gIHdhc1Rocm93bjogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogSGFuZGxlcyBzZW5kaW5nIGFuZCByZWNpZXZpbmcgZGJncCBtZXNzYWdlcyBvdmVyIGEgbmV0IFNvY2tldC5cbiAqIERiZ3AgZG9jdW1lbnRhdGlvbiBjYW4gYmUgZm91bmQgYXQgaHR0cDovL3hkZWJ1Zy5vcmcvZG9jcy1kYmdwLnBocFxuICovXG5jbGFzcyBEYmdwU29ja2V0IHtcbiAgX3NvY2tldDogP1NvY2tldDtcbiAgX3RyYW5zYWN0aW9uSWQ6IG51bWJlcjtcbiAgLy8gTWFwcyBmcm9tIHRyYW5zYWN0aW9uSWQgLT4gY2FsbFxuICBfY2FsbHM6IE1hcDxudW1iZXIsIHtjb21tYW5kOiBzdHJpbmc7IGNvbXBsZXRlOiAocmVzdWx0czogT2JqZWN0KSA9PiB2b2lkfT47XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF9pc0Nsb3NlZDogYm9vbGVhbjtcbiAgX21lc3NhZ2VIYW5kbGVyOiBEYmdwTWVzc2FnZUhhbmRsZXI7XG5cbiAgY29uc3RydWN0b3Ioc29ja2V0OiBTb2NrZXQpIHtcbiAgICB0aGlzLl9zb2NrZXQgPSBzb2NrZXQ7XG4gICAgdGhpcy5fdHJhbnNhY3Rpb25JZCA9IDA7XG4gICAgdGhpcy5fY2FsbHMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9pc0Nsb3NlZCA9IGZhbHNlO1xuICAgIHRoaXMuX21lc3NhZ2VIYW5kbGVyID0gZ2V0RGJncE1lc3NhZ2VIYW5kbGVySW5zdGFuY2UoKTtcblxuICAgIHNvY2tldC5vbignZW5kJywgdGhpcy5fb25FbmQuYmluZCh0aGlzKSk7XG4gICAgc29ja2V0Lm9uKCdlcnJvcicsIHRoaXMuX29uRXJyb3IuYmluZCh0aGlzKSk7XG4gICAgc29ja2V0Lm9uKCdkYXRhJywgdGhpcy5fb25EYXRhLmJpbmQodGhpcykpO1xuICB9XG5cbiAgb25TdGF0dXMoY2FsbGJhY2s6IChzdGF0dXM6IHN0cmluZykgPT4gbWl4ZWQpOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiByZXF1aXJlKCcuLi8uLi9jb21tb25zJykuZXZlbnRcbiAgICAgIC5hdHRhY2hFdmVudCh0aGlzLl9lbWl0dGVyLCBEQkdQX1NPQ0tFVF9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIF9vbkVycm9yKGVycm9yOiB7Y29kZTogbnVtYmVyfSk6IHZvaWQge1xuICAgIC8vIE5vdCBzdXJlIGlmIGhodm0gaXMgYWxpdmUgb3Igbm90XG4gICAgLy8gZG8gbm90IHNldCBfaXNDbG9zZWQgZmxhZyBzbyB0aGF0IGRldGFjaCB3aWxsIGJlIHNlbnQgYmVmb3JlIGRpc3Bvc2UoKS5cbiAgICBsb2dnZXIubG9nRXJyb3IoJ3NvY2tldCBlcnJvciAnICsgZXJyb3IuY29kZSk7XG4gICAgdGhpcy5fZW1pdFN0YXR1cyhTVEFUVVNfRVJST1IpO1xuICB9XG5cbiAgX29uRW5kKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzQ2xvc2VkID0gdHJ1ZTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9lbWl0U3RhdHVzKFNUQVRVU19FTkQpO1xuICB9XG5cbiAgX29uRGF0YShkYXRhOiBCdWZmZXIgfCBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZGF0YS50b1N0cmluZygpO1xuICAgIGxvZ2dlci5sb2coJ1JlY2lldmVkIGRhdGE6ICcgKyBtZXNzYWdlKTtcbiAgICBjb25zdCByZXNwb25zZXMgPSB0aGlzLl9tZXNzYWdlSGFuZGxlci5wYXJzZU1lc3NhZ2VzKG1lc3NhZ2UpO1xuICAgIHJlc3BvbnNlcy5mb3JFYWNoKHIgPT4ge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSByLnJlc3BvbnNlO1xuICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlQXR0cmlidXRlcyA9IHJlc3BvbnNlLiQ7XG4gICAgICAgIGNvbnN0IHtjb21tYW5kLCB0cmFuc2FjdGlvbl9pZH0gPSByZXNwb25zZUF0dHJpYnV0ZXM7XG4gICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uSWQgPSBOdW1iZXIodHJhbnNhY3Rpb25faWQpO1xuICAgICAgICBjb25zdCBjYWxsID0gdGhpcy5fY2FsbHMuZ2V0KHRyYW5zYWN0aW9uSWQpO1xuICAgICAgICBpZiAoIWNhbGwpIHtcbiAgICAgICAgICBsb2dnZXIubG9nRXJyb3IoJ01pc3NpbmcgY2FsbCBmb3IgcmVzcG9uc2U6ICcgKyBtZXNzYWdlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY2FsbHMuZGVsZXRlKHRyYW5zYWN0aW9uSWQpO1xuXG4gICAgICAgIGlmIChjYWxsLmNvbW1hbmQgIT09IGNvbW1hbmQpIHtcbiAgICAgICAgICBsb2dnZXIubG9nRXJyb3IoJ0JhZCBjb21tYW5kIGluIHJlc3BvbnNlLiBGb3VuZCAnICtcbiAgICAgICAgICAgIGNvbW1hbmQgKyAnLiBleHBlY3RlZCAnICsgY2FsbC5jb21tYW5kKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsb2dnZXIubG9nKCdDb21wbGV0aW5nIGNhbGw6ICcgKyBtZXNzYWdlKTtcbiAgICAgICAgICBjYWxsLmNvbXBsZXRlKHJlc3BvbnNlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGxvZ2dlci5sb2dFcnJvcignRXhjZXB0aW9uOiAnICsgZS50b1N0cmluZygpICsgJyBoYW5kbGluZyBjYWxsOiAnICsgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5sb2dFcnJvcignVW5leHBlY3RlZCBzb2NrZXQgbWVzc2FnZTogJyArIG1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0U3RhY2tGcmFtZXMoKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICByZXR1cm4gdGhpcy5fY2FsbERlYnVnZ2VyKCdzdGFja19nZXQnKTtcbiAgfVxuXG4gIGFzeW5jIGdldENvbnRleHRzRm9yRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyKTogUHJvbWlzZTxBcnJheTxEYmdwQ29udGV4dD4+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2NvbnRleHRfbmFtZXMnLCBgLWQgJHtmcmFtZUluZGV4fWApO1xuICAgIHJldHVybiByZXN1bHQuY29udGV4dC5tYXAoY29udGV4dCA9PiBjb250ZXh0LiQpO1xuICB9XG5cbiAgYXN5bmMgZ2V0Q29udGV4dFByb3BlcnRpZXMoZnJhbWVJbmRleDogbnVtYmVyLCBjb250ZXh0SWQ6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8RGJncFByb3BlcnR5Pj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcignY29udGV4dF9nZXQnLCBgLWQgJHtmcmFtZUluZGV4fSAtYyAke2NvbnRleHRJZH1gKTtcbiAgICAvLyAwIHJlc3VsdHMgeWllbGRzIG1pc3NpbmcgJ3Byb3BlcnR5JyBtZW1iZXJcbiAgICByZXR1cm4gcmVzdWx0LnByb3BlcnR5IHx8IFtdO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHJvcGVydGllc0J5RnVsbG5hbWUoZnJhbWVJbmRleDogbnVtYmVyLCBjb250ZXh0SWQ6IHN0cmluZywgZnVsbG5hbWU6IHN0cmluZyxcbiAgICAgIHBhZ2U6IG51bWJlcik6IFByb21pc2U8QXJyYXk8RGJncFByb3BlcnR5Pj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihcbiAgICAgICdwcm9wZXJ0eV92YWx1ZScsIGAtZCAke2ZyYW1lSW5kZXh9IC1jICR7Y29udGV4dElkfSAtbiAke2Z1bGxuYW1lfSAtcCAke3BhZ2V9YCk7XG4gICAgLy8gcHJvcGVydHlfdmFsdWUgcmV0dXJucyB0aGUgb3V0ZXIgcHJvcGVydHksIHdlIHdhbnQgdGhlIGNoaWxkcmVuIC4uLlxuICAgIC8vIDAgcmVzdWx0cyB5aWVsZHMgbWlzc2luZyAncHJvcGVydHknIG1lbWJlclxuICAgIHJldHVybiByZXN1bHQucHJvcGVydHlbMF0ucHJvcGVydHkgfHwgW107XG4gIH1cblxuICBhc3luYyBnZXRQcm9wZXJ0aWVzQnlGdWxsbmFtZUFsbENvbmV4dHMoXG4gICAgZnJhbWVJbmRleDogbnVtYmVyLFxuICAgIGZ1bGxuYW1lOiBzdHJpbmcsXG4gICAgcGFnZTogbnVtYmVyLFxuICApOiBQcm9taXNlPEFycmF5PERiZ3BQcm9wZXJ0eT4+IHtcbiAgICAvLyBQYXNzIHplcm8gYXMgY29udGV4dElkIHRvIHNlYXJjaCBhbGwgY29udGV4dHMuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0UHJvcGVydGllc0J5RnVsbG5hbWUoZnJhbWVJbmRleCwgLypjb250ZXh0SWQqLycwJywgZnVsbG5hbWUsIHBhZ2UpO1xuICB9XG5cbiAgYXN5bmMgZXZhbHVhdGVPbkNhbGxGcmFtZShmcmFtZUluZGV4OiBudW1iZXIsIGV4cHJlc3Npb246IHN0cmluZyk6IFByb21pc2U8RXZhbHVhdGlvblJlc3VsdD4ge1xuICAgIC8vIEVzY2FwZSBhbnkgZG91YmxlIHF1b3RlIGluIHRoZSBleHByZXNzaW9uLlxuICAgIGNvbnN0IGVzY2FwZWRFeHByZXNzaW9uID0gZXhwcmVzc2lvbi5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyk7XG4gICAgLy8gUXVvdGUgdGhlIGlucHV0IGV4cHJlc3Npb24gc28gdGhhdCB3ZSBjYW4gc3VwcG9ydCBleHByZXNzaW9uIHdpdGhcbiAgICAvLyBzcGFjZSBpbiBpdChlLmcuIGZ1bmN0aW9uIGV2YWx1YXRpb24pLlxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihcbiAgICAgICdwcm9wZXJ0eV92YWx1ZScsXG4gICAgICBgLWQgJHtmcmFtZUluZGV4fSAtbiBcIiR7ZXNjYXBlZEV4cHJlc3Npb259XCJgXG4gICAgKTtcbiAgICBpZiAocmVzdWx0LmVycm9yICYmIHJlc3VsdC5lcnJvci5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlcnJvcjogcmVzdWx0LmVycm9yWzBdLFxuICAgICAgICB3YXNUaHJvd246IHRydWUsXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdWx0OiByZXN1bHQucHJvcGVydHlbMF0gfHwgW10sXG4gICAgICB3YXNUaHJvd246IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICAvLyBSZXR1cm5zIG9uZSBvZjpcbiAgLy8gIHN0YXJ0aW5nLCBzdG9wcGluZywgc3RvcHBlZCwgcnVubmluZywgYnJlYWtcbiAgYXN5bmMgZ2V0U3RhdHVzKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ3N0YXR1cycpO1xuICAgIC8vIFRPRE86IERvIHdlIGV2ZXIgY2FyZSBhYm91dCByZXNwb25zZS4kLnJlYXNvbj9cbiAgICByZXR1cm4gcmVzcG9uc2UuJC5zdGF0dXM7XG4gIH1cblxuICAvLyBDb250aW51YXRpb24gY29tbWFuZHMgZ2V0IGEgcmVzcG9uc2UsIGJ1dCB0aGF0IHJlc3BvbnNlXG4gIC8vIGlzIGEgc3RhdHVzIG1lc3NhZ2Ugd2hpY2ggb2NjdXJzIGFmdGVyIGV4ZWN1dGlvbiBzdG9wcy5cbiAgYXN5bmMgc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0aGlzLl9lbWl0U3RhdHVzKFNUQVRVU19SVU5OSU5HKTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihjb21tYW5kKTtcbiAgICBjb25zdCBzdGF0dXMgPSByZXNwb25zZS4kLnN0YXR1cztcbiAgICB0aGlzLl9lbWl0U3RhdHVzKHN0YXR1cyk7XG4gICAgcmV0dXJuIHN0YXR1cztcbiAgfVxuXG4gIGFzeW5jIHNlbmRCcmVha0NvbW1hbmQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2JyZWFrJyk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuc3VjY2VzcyAhPT0gJzAnO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGV4Y2VwdGlvbiBicmVha3BvaW50IGlkLlxuICAgKi9cbiAgYXN5bmMgc2V0RXhjZXB0aW9uQnJlYWtwb2ludChleGNlcHRpb25OYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdicmVha3BvaW50X3NldCcsIGAtdCBleGNlcHRpb24gLXggJHtleGNlcHRpb25OYW1lfWApO1xuICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBmcm9tIHNldFBhdXNlZE9uRXhjZXB0aW9uczogJyArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgfVxuICAgIC8vIFRPRE86IFZhbGlkYXRlIHRoYXQgcmVzcG9uc2UuJC5zdGF0ZSA9PT0gJ2VuYWJsZWQnXG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuaWQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGJyZWFrcG9pbnQgaWRcbiAgICovXG4gIGFzeW5jIHNldEJyZWFrcG9pbnQoZmlsZW5hbWU6IHN0cmluZywgbGluZU51bWJlcjogbnVtYmVyKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihcbiAgICAgICdicmVha3BvaW50X3NldCcsXG4gICAgICBgLXQgbGluZSAtZiAke2ZpbGVuYW1lfSAtbiAke2xpbmVOdW1iZXJ9YFxuICAgICk7XG4gICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHNldHRpbmcgYnJlYWtwb2ludDogJyArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgfVxuICAgIC8vIFRPRE86IFZhbGlkYXRlIHRoYXQgcmVzcG9uc2UuJC5zdGF0ZSA9PT0gJ2VuYWJsZWQnXG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuaWQ7XG4gIH1cblxuICBhc3luYyByZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2JyZWFrcG9pbnRfcmVtb3ZlJywgYC1kICR7YnJlYWtwb2ludElkfWApO1xuICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciByZW1vdmluZyBicmVha3BvaW50OiAnICsgSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKTtcbiAgICB9XG4gIH1cblxuICAvLyBTZW5kcyBjb21tYW5kIHRvIGhodm0uXG4gIC8vIFJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHJlc3VsdGluZyBhdHRyaWJ1dGVzLlxuICBfY2FsbERlYnVnZ2VyKGNvbW1hbmQ6IHN0cmluZywgcGFyYW1zOiA/c3RyaW5nKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICBjb25zdCB0cmFuc2FjdGlvbklkID0gdGhpcy5fc2VuZENvbW1hbmQoY29tbWFuZCwgcGFyYW1zKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY2FsbHMuc2V0KHRyYW5zYWN0aW9uSWQsIHtcbiAgICAgICAgY29tbWFuZCxcbiAgICAgICAgY29tcGxldGU6IHJlc3VsdCA9PiByZXNvbHZlKHJlc3VsdCksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9zZW5kQ29tbWFuZChjb21tYW5kOiBzdHJpbmcsIHBhcmFtczogP3N0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3QgaWQgPSArK3RoaXMuX3RyYW5zYWN0aW9uSWQ7XG4gICAgbGV0IG1lc3NhZ2UgPSBgJHtjb21tYW5kfSAtaSAke2lkfWA7XG4gICAgaWYgKHBhcmFtcykge1xuICAgICAgbWVzc2FnZSArPSAnICcgKyBwYXJhbXM7XG4gICAgfVxuICAgIHRoaXMuX3NlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuXG4gIF9zZW5kTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgaWYgKHNvY2tldCAhPSBudWxsKSB7XG4gICAgICBsb2dnZXIubG9nKCdTZW5kaW5nIG1lc3NhZ2U6ICcgKyBtZXNzYWdlKTtcbiAgICAgIHNvY2tldC53cml0ZShtZXNzYWdlICsgJ1xceDAwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5sb2dFcnJvcignQXR0ZW1wdCB0byBzZW5kIG1lc3NhZ2UgYWZ0ZXIgZGlzcG9zZTogJyArIG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIF9lbWl0U3RhdHVzKHN0YXR1czogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZygnRW1pdHRpbmcgc3RhdHVzOiAnICsgc3RhdHVzKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoREJHUF9TT0NLRVRfU1RBVFVTX0VWRU5ULCBzdGF0dXMpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzQ2xvc2VkKSB7XG4gICAgICAvLyBUT0RPW2plZmZyZXl0YW5dOiB3b3JrYXJvdW5kIGEgY3Jhc2godDgxODE1MzgpIGluIGhodm1cbiAgICAgIHRoaXMuc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9ERVRBQ0gpO1xuICAgIH1cblxuICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcbiAgICBpZiAoc29ja2V0KSB7XG4gICAgICAvLyBlbmQgLSBTZW5kcyB0aGUgRklOIHBhY2tldCBhbmQgY2xvc2VzIHdyaXRpbmcuXG4gICAgICAvLyBkZXN0cm95IC0gY2xvc2VzIGZvciByZWFkaW5nIGFuZCB3cml0aW5nLlxuICAgICAgc29ja2V0LmVuZCgpO1xuICAgICAgLy8gJEZsb3dJc3N1ZSAtIHQ5MjU4ODUyXG4gICAgICBzb2NrZXQuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fc29ja2V0ID0gbnVsbDtcbiAgICAgIHRoaXMuX2lzQ2xvc2VkID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIERiZ3BTb2NrZXQsXG4gIFNUQVRVU19TVEFSVElORyxcbiAgU1RBVFVTX1NUT1BQSU5HLFxuICBTVEFUVVNfU1RPUFBFRCxcbiAgU1RBVFVTX1JVTk5JTkcsXG4gIFNUQVRVU19CUkVBSyxcbiAgU1RBVFVTX0VSUk9SLFxuICBTVEFUVVNfRU5ELFxuICBDT01NQU5EX1JVTixcbiAgQ09NTUFORF9TVEVQX0lOVE8sXG4gIENPTU1BTkRfU1RFUF9PVkVSLFxuICBDT01NQU5EX1NURVBfT1VULFxuICBDT01NQU5EX1NUT1AsXG4gIENPTU1BTkRfREVUQUNILFxufTtcbiJdfQ==