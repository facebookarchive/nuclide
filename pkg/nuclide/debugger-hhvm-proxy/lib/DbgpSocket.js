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
//# sourceMappingURL=data:application/json;base64,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QUcsRUFBRSxDQUFDOztBQUViLGNBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNqQixZQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUNwQixZQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztPQUN2QjtLQUNGOzs7U0E5T0csVUFBVTs7O0FBaVBoQixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsWUFBVSxFQUFWLFVBQVU7QUFDVixpQkFBZSxFQUFmLGVBQWU7QUFDZixpQkFBZSxFQUFmLGVBQWU7QUFDZixnQkFBYyxFQUFkLGNBQWM7QUFDZCxnQkFBYyxFQUFkLGNBQWM7QUFDZCxjQUFZLEVBQVosWUFBWTtBQUNaLGNBQVksRUFBWixZQUFZO0FBQ1osWUFBVSxFQUFWLFVBQVU7QUFDVixhQUFXLEVBQVgsV0FBVztBQUNYLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQixrQkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLGNBQVksRUFBWixZQUFZO0FBQ1osZ0JBQWMsRUFBZCxjQUFjO0NBQ2YsQ0FBQyIsImZpbGUiOiJEYmdwU29ja2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuXG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQge0RiZ3BNZXNzYWdlSGFuZGxlciwgZ2V0RGJncE1lc3NhZ2VIYW5kbGVySW5zdGFuY2V9IGZyb20gJy4vRGJncE1lc3NhZ2VIYW5kbGVyJztcbmltcG9ydCB0eXBlIHtTb2NrZXR9IGZyb20gJ25ldCc7XG5cbi8vIFJlc3BvbnNlcyB0byB0aGUgREJHUCAnc3RhdHVzJyBjb21tYW5kXG5jb25zdCBTVEFUVVNfU1RBUlRJTkcgPSAnc3RhcnRpbmcnO1xuY29uc3QgU1RBVFVTX1NUT1BQSU5HID0gJ3N0b3BwaW5nJztcbmNvbnN0IFNUQVRVU19TVE9QUEVEID0gJ3N0b3BwZWQnO1xuY29uc3QgU1RBVFVTX1JVTk5JTkcgPSAncnVubmluZyc7XG5jb25zdCBTVEFUVVNfQlJFQUsgPSAnYnJlYWsnO1xuLy8gRXJyb3IgYW5kIEVuZCBhcmUgbm90IGRiZ3Agc3RhdHVzIGNvZGVzLCB0aGV5IHJlbGF0ZSB0byBzb2NrZXQgc3RhdGVzLlxuY29uc3QgU1RBVFVTX0VSUk9SID0gJ2Vycm9yJztcbmNvbnN0IFNUQVRVU19FTkQgPSAnZW5kJztcblxuLy8gVmFsaWQgY29udGludWF0aW9uIGNvbW1hbmRzXG5jb25zdCBDT01NQU5EX1JVTiA9ICdydW4nO1xuY29uc3QgQ09NTUFORF9TVEVQX0lOVE8gPSAnc3RlcF9pbnRvJztcbmNvbnN0IENPTU1BTkRfU1RFUF9PVkVSID0gJ3N0ZXBfb3Zlcic7XG5jb25zdCBDT01NQU5EX1NURVBfT1VUID0gJ3N0ZXBfb3V0JztcbmNvbnN0IENPTU1BTkRfU1RPUCA9ICdzdG9wJztcbmNvbnN0IENPTU1BTkRfREVUQUNIID0gJ2RldGFjaCc7XG5cbmNvbnN0IERCR1BfU09DS0VUX1NUQVRVU19FVkVOVCA9ICdkYmdwLXNvY2tldC1zdGF0dXMnO1xuXG5leHBvcnQgdHlwZSBEYmdwQ29udGV4dCA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICBpZDogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgRGJncFByb3BlcnR5ID0ge1xuICAkOiB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGZ1bGxuYW1lOiBzdHJpbmc7XG4gICAgYWRkcmVzczogc3RyaW5nO1xuICAgIHR5cGU6IHN0cmluZztcblxuICAgIC8vIGFycmF5IG9yIG9iamVjdFxuICAgIGNsYXNzbmFtZT86IHN0cmluZztcbiAgICBjaGlsZHJlbj86IGJvb2xlYW47XG4gICAgbnVtQ2hpbGRyZW4/OiBudW1iZXI7XG4gICAgcGFnZT86IG51bWJlcjtcbiAgICBwYWdlc2l6ZT86IG51bWJlcjtcblxuICAgIC8vIHN0cmluZ1xuICAgIHNpemU/OiBudW1iZXI7XG4gICAgZW5jb2Rpbmc/OiBzdHJpbmc7XG4gIH07XG5cbiAgLy8gVmFsdWUgaWYgcHJlc2VudCwgc3ViamVjdCB0byBlbmNvZGluZyBpZiBwcmVzZW50XG4gIF8/OiBzdHJpbmc7XG5cbiAgLy8gYXJyYXkgb3Igb2JqZWN0IG1lbWJlcnNcbiAgcHJvcGVydHk/OiBBcnJheTxEYmdwUHJvcGVydHk+O1xufTtcblxudHlwZSBFdmFsdWF0aW9uUmVzdWx0ID0ge1xuICBlcnJvcj86IE9iamVjdDtcbiAgcmVzdWx0PzogP0RiZ3BQcm9wZXJ0eTtcbiAgd2FzVGhyb3duOiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBIYW5kbGVzIHNlbmRpbmcgYW5kIHJlY2lldmluZyBkYmdwIG1lc3NhZ2VzIG92ZXIgYSBuZXQgU29ja2V0LlxuICogRGJncCBkb2N1bWVudGF0aW9uIGNhbiBiZSBmb3VuZCBhdCBodHRwOi8veGRlYnVnLm9yZy9kb2NzLWRiZ3AucGhwXG4gKi9cbmNsYXNzIERiZ3BTb2NrZXQge1xuICBfc29ja2V0OiA/U29ja2V0O1xuICBfdHJhbnNhY3Rpb25JZDogbnVtYmVyO1xuICAvLyBNYXBzIGZyb20gdHJhbnNhY3Rpb25JZCAtPiBjYWxsXG4gIF9jYWxsczogTWFwPG51bWJlciwge2NvbW1hbmQ6IHN0cmluZzsgY29tcGxldGU6IChyZXN1bHRzOiBPYmplY3QpID0+IHZvaWR9PjtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX2lzQ2xvc2VkOiBib29sZWFuO1xuICBfbWVzc2FnZUhhbmRsZXI6IERiZ3BNZXNzYWdlSGFuZGxlcjtcblxuICBjb25zdHJ1Y3Rvcihzb2NrZXQ6IFNvY2tldCkge1xuICAgIHRoaXMuX3NvY2tldCA9IHNvY2tldDtcbiAgICB0aGlzLl90cmFuc2FjdGlvbklkID0gMDtcbiAgICB0aGlzLl9jYWxscyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX2lzQ2xvc2VkID0gZmFsc2U7XG4gICAgdGhpcy5fbWVzc2FnZUhhbmRsZXIgPSBnZXREYmdwTWVzc2FnZUhhbmRsZXJJbnN0YW5jZSgpO1xuXG4gICAgc29ja2V0Lm9uKCdlbmQnLCB0aGlzLl9vbkVuZC5iaW5kKHRoaXMpKTtcbiAgICBzb2NrZXQub24oJ2Vycm9yJywgdGhpcy5fb25FcnJvci5iaW5kKHRoaXMpKTtcbiAgICBzb2NrZXQub24oJ2RhdGEnLCB0aGlzLl9vbkRhdGEuYmluZCh0aGlzKSk7XG4gIH1cblxuICBvblN0YXR1cyhjYWxsYmFjazogKHN0YXR1czogc3RyaW5nKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpLmV2ZW50XG4gICAgICAuYXR0YWNoRXZlbnQodGhpcy5fZW1pdHRlciwgREJHUF9TT0NLRVRfU1RBVFVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBfb25FcnJvcihlcnJvcjoge2NvZGU6IG51bWJlcn0pOiB2b2lkIHtcbiAgICAvLyBOb3Qgc3VyZSBpZiBoaHZtIGlzIGFsaXZlIG9yIG5vdFxuICAgIC8vIGRvIG5vdCBzZXQgX2lzQ2xvc2VkIGZsYWcgc28gdGhhdCBkZXRhY2ggd2lsbCBiZSBzZW50IGJlZm9yZSBkaXNwb3NlKCkuXG4gICAgbG9nZ2VyLmxvZ0Vycm9yKCdzb2NrZXQgZXJyb3IgJyArIGVycm9yLmNvZGUpO1xuICAgIHRoaXMuX2VtaXRTdGF0dXMoU1RBVFVTX0VSUk9SKTtcbiAgfVxuXG4gIF9vbkVuZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0Nsb3NlZCA9IHRydWU7XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fZW1pdFN0YXR1cyhTVEFUVVNfRU5EKTtcbiAgfVxuXG4gIF9vbkRhdGEoZGF0YTogQnVmZmVyIHwgc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICBsb2dnZXIubG9nKCdSZWNpZXZlZCBkYXRhOiAnICsgbWVzc2FnZSk7XG4gICAgY29uc3QgcmVzcG9uc2VzID0gdGhpcy5fbWVzc2FnZUhhbmRsZXIucGFyc2VNZXNzYWdlcyhtZXNzYWdlKTtcbiAgICByZXNwb25zZXMuZm9yRWFjaChyID0+IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gci5yZXNwb25zZTtcbiAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICBjb25zdCByZXNwb25zZUF0dHJpYnV0ZXMgPSByZXNwb25zZS4kO1xuICAgICAgICBjb25zdCB7Y29tbWFuZCwgdHJhbnNhY3Rpb25faWR9ID0gcmVzcG9uc2VBdHRyaWJ1dGVzO1xuICAgICAgICBjb25zdCB0cmFuc2FjdGlvbklkID0gTnVtYmVyKHRyYW5zYWN0aW9uX2lkKTtcbiAgICAgICAgY29uc3QgY2FsbCA9IHRoaXMuX2NhbGxzLmdldCh0cmFuc2FjdGlvbklkKTtcbiAgICAgICAgaWYgKCFjYWxsKSB7XG4gICAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdNaXNzaW5nIGNhbGwgZm9yIHJlc3BvbnNlOiAnICsgbWVzc2FnZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NhbGxzLmRlbGV0ZSh0cmFuc2FjdGlvbklkKTtcblxuICAgICAgICBpZiAoY2FsbC5jb21tYW5kICE9PSBjb21tYW5kKSB7XG4gICAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yKCdCYWQgY29tbWFuZCBpbiByZXNwb25zZS4gRm91bmQgJyArXG4gICAgICAgICAgICBjb21tYW5kICsgJy4gZXhwZWN0ZWQgJyArIGNhbGwuY29tbWFuZCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbG9nZ2VyLmxvZygnQ29tcGxldGluZyBjYWxsOiAnICsgbWVzc2FnZSk7XG4gICAgICAgICAgY2FsbC5jb21wbGV0ZShyZXNwb25zZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBsb2dnZXIubG9nRXJyb3IoJ0V4Y2VwdGlvbjogJyArIGUudG9TdHJpbmcoKSArICcgaGFuZGxpbmcgY2FsbDogJyArIG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2dnZXIubG9nRXJyb3IoJ1VuZXhwZWN0ZWQgc29ja2V0IG1lc3NhZ2U6ICcgKyBtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldFN0YWNrRnJhbWVzKCk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgcmV0dXJuIHRoaXMuX2NhbGxEZWJ1Z2dlcignc3RhY2tfZ2V0Jyk7XG4gIH1cblxuICBhc3luYyBnZXRDb250ZXh0c0ZvckZyYW1lKGZyYW1lSW5kZXg6IG51bWJlcik6IFByb21pc2U8QXJyYXk8RGJncENvbnRleHQ+PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdjb250ZXh0X25hbWVzJywgYC1kICR7ZnJhbWVJbmRleH1gKTtcbiAgICByZXR1cm4gcmVzdWx0LmNvbnRleHQubWFwKGNvbnRleHQgPT4gY29udGV4dC4kKTtcbiAgfVxuXG4gIGFzeW5jIGdldENvbnRleHRQcm9wZXJ0aWVzKGZyYW1lSW5kZXg6IG51bWJlciwgY29udGV4dElkOiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PERiZ3BQcm9wZXJ0eT4+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2NvbnRleHRfZ2V0JywgYC1kICR7ZnJhbWVJbmRleH0gLWMgJHtjb250ZXh0SWR9YCk7XG4gICAgLy8gMCByZXN1bHRzIHlpZWxkcyBtaXNzaW5nICdwcm9wZXJ0eScgbWVtYmVyXG4gICAgcmV0dXJuIHJlc3VsdC5wcm9wZXJ0eSB8fCBbXTtcbiAgfVxuXG4gIGFzeW5jIGdldFByb3BlcnRpZXNCeUZ1bGxuYW1lKGZyYW1lSW5kZXg6IG51bWJlciwgY29udGV4dElkOiBzdHJpbmcsIGZ1bGxuYW1lOiBzdHJpbmcsXG4gICAgICBwYWdlOiBudW1iZXIpOiBQcm9taXNlPEFycmF5PERiZ3BQcm9wZXJ0eT4+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoXG4gICAgICAncHJvcGVydHlfdmFsdWUnLCBgLWQgJHtmcmFtZUluZGV4fSAtYyAke2NvbnRleHRJZH0gLW4gJHtmdWxsbmFtZX0gLXAgJHtwYWdlfWApO1xuICAgIC8vIHByb3BlcnR5X3ZhbHVlIHJldHVybnMgdGhlIG91dGVyIHByb3BlcnR5LCB3ZSB3YW50IHRoZSBjaGlsZHJlbiAuLi5cbiAgICAvLyAwIHJlc3VsdHMgeWllbGRzIG1pc3NpbmcgJ3Byb3BlcnR5JyBtZW1iZXJcbiAgICByZXR1cm4gcmVzdWx0LnByb3BlcnR5WzBdLnByb3BlcnR5IHx8IFtdO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHJvcGVydGllc0J5RnVsbG5hbWVBbGxDb25leHRzKFxuICAgIGZyYW1lSW5kZXg6IG51bWJlcixcbiAgICBmdWxsbmFtZTogc3RyaW5nLFxuICAgIHBhZ2U6IG51bWJlcixcbiAgKTogUHJvbWlzZTxBcnJheTxEYmdwUHJvcGVydHk+PiB7XG4gICAgLy8gUGFzcyB6ZXJvIGFzIGNvbnRleHRJZCB0byBzZWFyY2ggYWxsIGNvbnRleHRzLlxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFByb3BlcnRpZXNCeUZ1bGxuYW1lKGZyYW1lSW5kZXgsIC8qY29udGV4dElkKi8nMCcsIGZ1bGxuYW1lLCBwYWdlKTtcbiAgfVxuXG4gIGFzeW5jIGV2YWx1YXRlT25DYWxsRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyLCBleHByZXNzaW9uOiBzdHJpbmcpOiBQcm9taXNlPEV2YWx1YXRpb25SZXN1bHQ+IHtcbiAgICAvLyBFc2NhcGUgYW55IGRvdWJsZSBxdW90ZSBpbiB0aGUgZXhwcmVzc2lvbi5cbiAgICBjb25zdCBlc2NhcGVkRXhwcmVzc2lvbiA9IGV4cHJlc3Npb24ucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpO1xuICAgIC8vIFF1b3RlIHRoZSBpbnB1dCBleHByZXNzaW9uIHNvIHRoYXQgd2UgY2FuIHN1cHBvcnQgZXhwcmVzc2lvbiB3aXRoXG4gICAgLy8gc3BhY2UgaW4gaXQoZS5nLiBmdW5jdGlvbiBldmFsdWF0aW9uKS5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoXG4gICAgICAncHJvcGVydHlfdmFsdWUnLFxuICAgICAgYC1kICR7ZnJhbWVJbmRleH0gLW4gXCIke2VzY2FwZWRFeHByZXNzaW9ufVwiYFxuICAgICk7XG4gICAgaWYgKHJlc3VsdC5lcnJvciAmJiByZXN1bHQuZXJyb3IubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZXJyb3I6IHJlc3VsdC5lcnJvclswXSxcbiAgICAgICAgd2FzVGhyb3duOiB0cnVlLFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3VsdDogcmVzdWx0LnByb3BlcnR5WzBdIHx8IFtdLFxuICAgICAgd2FzVGhyb3duOiBmYWxzZSxcbiAgICB9O1xuICB9XG5cbiAgLy8gUmV0dXJucyBvbmUgb2Y6XG4gIC8vICBzdGFydGluZywgc3RvcHBpbmcsIHN0b3BwZWQsIHJ1bm5pbmcsIGJyZWFrXG4gIGFzeW5jIGdldFN0YXR1cygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdzdGF0dXMnKTtcbiAgICAvLyBUT0RPOiBEbyB3ZSBldmVyIGNhcmUgYWJvdXQgcmVzcG9uc2UuJC5yZWFzb24/XG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuc3RhdHVzO1xuICB9XG5cbiAgLy8gQ29udGludWF0aW9uIGNvbW1hbmRzIGdldCBhIHJlc3BvbnNlLCBidXQgdGhhdCByZXNwb25zZVxuICAvLyBpcyBhIHN0YXR1cyBtZXNzYWdlIHdoaWNoIG9jY3VycyBhZnRlciBleGVjdXRpb24gc3RvcHMuXG4gIGFzeW5jIHNlbmRDb250aW51YXRpb25Db21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgdGhpcy5fZW1pdFN0YXR1cyhTVEFUVVNfUlVOTklORyk7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoY29tbWFuZCk7XG4gICAgY29uc3Qgc3RhdHVzID0gcmVzcG9uc2UuJC5zdGF0dXM7XG4gICAgdGhpcy5fZW1pdFN0YXR1cyhzdGF0dXMpO1xuICAgIHJldHVybiBzdGF0dXM7XG4gIH1cblxuICBhc3luYyBzZW5kQnJlYWtDb21tYW5kKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdicmVhaycpO1xuICAgIHJldHVybiByZXNwb25zZS4kLnN1Y2Nlc3MgIT09ICcwJztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBleGNlcHRpb24gYnJlYWtwb2ludCBpZC5cbiAgICovXG4gIGFzeW5jIHNldEV4Y2VwdGlvbkJyZWFrcG9pbnQoZXhjZXB0aW9uTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcignYnJlYWtwb2ludF9zZXQnLCBgLXQgZXhjZXB0aW9uIC14ICR7ZXhjZXB0aW9uTmFtZX1gKTtcbiAgICBpZiAocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgZnJvbSBzZXRQYXVzZWRPbkV4Y2VwdGlvbnM6ICcgKyBKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpO1xuICAgIH1cbiAgICAvLyBUT0RPOiBWYWxpZGF0ZSB0aGF0IHJlc3BvbnNlLiQuc3RhdGUgPT09ICdlbmFibGVkJ1xuICAgIHJldHVybiByZXNwb25zZS4kLmlkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBicmVha3BvaW50IGlkXG4gICAqL1xuICBhc3luYyBzZXRCcmVha3BvaW50KGZpbGVuYW1lOiBzdHJpbmcsIGxpbmVOdW1iZXI6IG51bWJlcik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoXG4gICAgICAnYnJlYWtwb2ludF9zZXQnLFxuICAgICAgYC10IGxpbmUgLWYgJHtmaWxlbmFtZX0gLW4gJHtsaW5lTnVtYmVyfWBcbiAgICApO1xuICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBzZXR0aW5nIGJyZWFrcG9pbnQ6ICcgKyBKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpO1xuICAgIH1cbiAgICAvLyBUT0RPOiBWYWxpZGF0ZSB0aGF0IHJlc3BvbnNlLiQuc3RhdGUgPT09ICdlbmFibGVkJ1xuICAgIHJldHVybiByZXNwb25zZS4kLmlkO1xuICB9XG5cbiAgYXN5bmMgcmVtb3ZlQnJlYWtwb2ludChicmVha3BvaW50SWQ6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdicmVha3BvaW50X3JlbW92ZScsIGAtZCAke2JyZWFrcG9pbnRJZH1gKTtcbiAgICBpZiAocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgcmVtb3ZpbmcgYnJlYWtwb2ludDogJyArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gU2VuZHMgY29tbWFuZCB0byBoaHZtLlxuICAvLyBSZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSByZXN1bHRpbmcgYXR0cmlidXRlcy5cbiAgX2NhbGxEZWJ1Z2dlcihjb21tYW5kOiBzdHJpbmcsIHBhcmFtczogP3N0cmluZyk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgY29uc3QgdHJhbnNhY3Rpb25JZCA9IHRoaXMuX3NlbmRDb21tYW5kKGNvbW1hbmQsIHBhcmFtcyk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2NhbGxzLnNldCh0cmFuc2FjdGlvbklkLCB7XG4gICAgICAgIGNvbW1hbmQsXG4gICAgICAgIGNvbXBsZXRlOiByZXN1bHQgPT4gcmVzb2x2ZShyZXN1bHQpLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBfc2VuZENvbW1hbmQoY29tbWFuZDogc3RyaW5nLCBwYXJhbXM6ID9zdHJpbmcpOiBudW1iZXIge1xuICAgIGNvbnN0IGlkID0gKyt0aGlzLl90cmFuc2FjdGlvbklkO1xuICAgIGxldCBtZXNzYWdlID0gYCR7Y29tbWFuZH0gLWkgJHtpZH1gO1xuICAgIGlmIChwYXJhbXMpIHtcbiAgICAgIG1lc3NhZ2UgKz0gJyAnICsgcGFyYW1zO1xuICAgIH1cbiAgICB0aGlzLl9zZW5kTWVzc2FnZShtZXNzYWdlKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cblxuICBfc2VuZE1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xuICAgIGlmIChzb2NrZXQgIT0gbnVsbCkge1xuICAgICAgbG9nZ2VyLmxvZygnU2VuZGluZyBtZXNzYWdlOiAnICsgbWVzc2FnZSk7XG4gICAgICBzb2NrZXQud3JpdGUobWVzc2FnZSArICdcXHgwMCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIubG9nRXJyb3IoJ0F0dGVtcHQgdG8gc2VuZCBtZXNzYWdlIGFmdGVyIGRpc3Bvc2U6ICcgKyBtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBfZW1pdFN0YXR1cyhzdGF0dXM6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZ2dlci5sb2coJ0VtaXR0aW5nIHN0YXR1czogJyArIHN0YXR1cyk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KERCR1BfU09DS0VUX1NUQVRVU19FVkVOVCwgc3RhdHVzKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pc0Nsb3NlZCkge1xuICAgICAgLy8gVE9ET1tqZWZmcmV5dGFuXTogd29ya2Fyb3VuZCBhIGNyYXNoKHQ4MTgxNTM4KSBpbiBoaHZtXG4gICAgICB0aGlzLnNlbmRDb250aW51YXRpb25Db21tYW5kKENPTU1BTkRfREVUQUNIKTtcbiAgICB9XG5cbiAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgaWYgKHNvY2tldCkge1xuICAgICAgLy8gZW5kIC0gU2VuZHMgdGhlIEZJTiBwYWNrZXQgYW5kIGNsb3NlcyB3cml0aW5nLlxuICAgICAgLy8gZGVzdHJveSAtIGNsb3NlcyBmb3IgcmVhZGluZyBhbmQgd3JpdGluZy5cbiAgICAgIHNvY2tldC5lbmQoKTtcbiAgICAgIC8vICRGbG93SXNzdWUgLSB0OTI1ODg1MlxuICAgICAgc29ja2V0LmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3NvY2tldCA9IG51bGw7XG4gICAgICB0aGlzLl9pc0Nsb3NlZCA9IHRydWU7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBEYmdwU29ja2V0LFxuICBTVEFUVVNfU1RBUlRJTkcsXG4gIFNUQVRVU19TVE9QUElORyxcbiAgU1RBVFVTX1NUT1BQRUQsXG4gIFNUQVRVU19SVU5OSU5HLFxuICBTVEFUVVNfQlJFQUssXG4gIFNUQVRVU19FUlJPUixcbiAgU1RBVFVTX0VORCxcbiAgQ09NTUFORF9SVU4sXG4gIENPTU1BTkRfU1RFUF9JTlRPLFxuICBDT01NQU5EX1NURVBfT1ZFUixcbiAgQ09NTUFORF9TVEVQX09VVCxcbiAgQ09NTUFORF9TVE9QLFxuICBDT01NQU5EX0RFVEFDSCxcbn07XG4iXX0=