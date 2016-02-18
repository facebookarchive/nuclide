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
//# sourceMappingURL=data:application/json;base64,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QUcsRUFBRSxDQUFDO0FBQ2IsY0FBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2pCLFlBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO09BQ3ZCO0tBQ0Y7OztTQTdPRyxVQUFVOzs7QUFnUGhCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixZQUFVLEVBQVYsVUFBVTtBQUNWLGlCQUFlLEVBQWYsZUFBZTtBQUNmLGlCQUFlLEVBQWYsZUFBZTtBQUNmLGdCQUFjLEVBQWQsY0FBYztBQUNkLGdCQUFjLEVBQWQsY0FBYztBQUNkLGNBQVksRUFBWixZQUFZO0FBQ1osY0FBWSxFQUFaLFlBQVk7QUFDWixZQUFVLEVBQVYsVUFBVTtBQUNWLGFBQVcsRUFBWCxXQUFXO0FBQ1gsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQixtQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsY0FBWSxFQUFaLFlBQVk7QUFDWixnQkFBYyxFQUFkLGNBQWM7Q0FDZixDQUFDIiwiZmlsZSI6IkRiZ3BTb2NrZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cbmltcG9ydCBsb2dnZXIgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7RGJncE1lc3NhZ2VIYW5kbGVyLCBnZXREYmdwTWVzc2FnZUhhbmRsZXJJbnN0YW5jZX0gZnJvbSAnLi9EYmdwTWVzc2FnZUhhbmRsZXInO1xuaW1wb3J0IHR5cGUge1NvY2tldH0gZnJvbSAnbmV0JztcblxuLy8gUmVzcG9uc2VzIHRvIHRoZSBEQkdQICdzdGF0dXMnIGNvbW1hbmRcbmNvbnN0IFNUQVRVU19TVEFSVElORyA9ICdzdGFydGluZyc7XG5jb25zdCBTVEFUVVNfU1RPUFBJTkcgPSAnc3RvcHBpbmcnO1xuY29uc3QgU1RBVFVTX1NUT1BQRUQgPSAnc3RvcHBlZCc7XG5jb25zdCBTVEFUVVNfUlVOTklORyA9ICdydW5uaW5nJztcbmNvbnN0IFNUQVRVU19CUkVBSyA9ICdicmVhayc7XG4vLyBFcnJvciBhbmQgRW5kIGFyZSBub3QgZGJncCBzdGF0dXMgY29kZXMsIHRoZXkgcmVsYXRlIHRvIHNvY2tldCBzdGF0ZXMuXG5jb25zdCBTVEFUVVNfRVJST1IgPSAnZXJyb3InO1xuY29uc3QgU1RBVFVTX0VORCA9ICdlbmQnO1xuXG4vLyBWYWxpZCBjb250aW51YXRpb24gY29tbWFuZHNcbmNvbnN0IENPTU1BTkRfUlVOID0gJ3J1bic7XG5jb25zdCBDT01NQU5EX1NURVBfSU5UTyA9ICdzdGVwX2ludG8nO1xuY29uc3QgQ09NTUFORF9TVEVQX09WRVIgPSAnc3RlcF9vdmVyJztcbmNvbnN0IENPTU1BTkRfU1RFUF9PVVQgPSAnc3RlcF9vdXQnO1xuY29uc3QgQ09NTUFORF9TVE9QID0gJ3N0b3AnO1xuY29uc3QgQ09NTUFORF9ERVRBQ0ggPSAnZGV0YWNoJztcblxuY29uc3QgREJHUF9TT0NLRVRfU1RBVFVTX0VWRU5UID0gJ2RiZ3Atc29ja2V0LXN0YXR1cyc7XG5cbmV4cG9ydCB0eXBlIERiZ3BDb250ZXh0ID0ge1xuICBuYW1lOiBzdHJpbmcsXG4gIGlkOiBzdHJpbmcsXG59O1xuXG5leHBvcnQgdHlwZSBEYmdwUHJvcGVydHkgPSB7XG4gICQ6IHtcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgZnVsbG5hbWU6IHN0cmluZyxcbiAgICBhZGRyZXNzOiBzdHJpbmcsXG4gICAgdHlwZTogc3RyaW5nLFxuXG4gICAgLy8gYXJyYXkgb3Igb2JqZWN0XG4gICAgY2xhc3NuYW1lPzogc3RyaW5nLFxuICAgIGNoaWxkcmVuPzogYm9vbGVhbixcbiAgICBudW1DaGlsZHJlbj86IG51bWJlcixcbiAgICBwYWdlPzogbnVtYmVyLFxuICAgIHBhZ2VzaXplPzogbnVtYmVyLFxuXG4gICAgLy8gc3RyaW5nXG4gICAgc2l6ZT86IG51bWJlcixcbiAgICBlbmNvZGluZz86IHN0cmluZyxcbiAgfSxcblxuICAvLyBWYWx1ZSBpZiBwcmVzZW50LCBzdWJqZWN0IHRvIGVuY29kaW5nIGlmIHByZXNlbnRcbiAgXz86IHN0cmluZyxcblxuICAvLyBhcnJheSBvciBvYmplY3QgbWVtYmVyc1xuICBwcm9wZXJ0eT86IEFycmF5PERiZ3BQcm9wZXJ0eT4sXG59O1xuXG50eXBlIEV2YWx1YXRpb25SZXN1bHQgPSB7XG4gIGVycm9yPzogT2JqZWN0LFxuICByZXN1bHQ/OiA/RGJncFByb3BlcnR5LFxuICB3YXNUaHJvd246IGJvb2xlYW4sXG59O1xuXG4vKipcbiAqIEhhbmRsZXMgc2VuZGluZyBhbmQgcmVjaWV2aW5nIGRiZ3AgbWVzc2FnZXMgb3ZlciBhIG5ldCBTb2NrZXQuXG4gKiBEYmdwIGRvY3VtZW50YXRpb24gY2FuIGJlIGZvdW5kIGF0IGh0dHA6Ly94ZGVidWcub3JnL2RvY3MtZGJncC5waHBcbiAqL1xuY2xhc3MgRGJncFNvY2tldCB7XG4gIF9zb2NrZXQ6ID9Tb2NrZXQ7XG4gIF90cmFuc2FjdGlvbklkOiBudW1iZXI7XG4gIC8vIE1hcHMgZnJvbSB0cmFuc2FjdGlvbklkIC0+IGNhbGxcbiAgX2NhbGxzOiBNYXA8bnVtYmVyLCB7Y29tbWFuZDogc3RyaW5nLCBjb21wbGV0ZTogKHJlc3VsdHM6IE9iamVjdCkgPT4gdm9pZH0+O1xuICBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfaXNDbG9zZWQ6IGJvb2xlYW47XG4gIF9tZXNzYWdlSGFuZGxlcjogRGJncE1lc3NhZ2VIYW5kbGVyO1xuXG4gIGNvbnN0cnVjdG9yKHNvY2tldDogU29ja2V0KSB7XG4gICAgdGhpcy5fc29ja2V0ID0gc29ja2V0O1xuICAgIHRoaXMuX3RyYW5zYWN0aW9uSWQgPSAwO1xuICAgIHRoaXMuX2NhbGxzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5faXNDbG9zZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9tZXNzYWdlSGFuZGxlciA9IGdldERiZ3BNZXNzYWdlSGFuZGxlckluc3RhbmNlKCk7XG5cbiAgICBzb2NrZXQub24oJ2VuZCcsIHRoaXMuX29uRW5kLmJpbmQodGhpcykpO1xuICAgIHNvY2tldC5vbignZXJyb3InLCB0aGlzLl9vbkVycm9yLmJpbmQodGhpcykpO1xuICAgIHNvY2tldC5vbignZGF0YScsIHRoaXMuX29uRGF0YS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIG9uU3RhdHVzKGNhbGxiYWNrOiAoc3RhdHVzOiBzdHJpbmcpID0+IG1peGVkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiByZXF1aXJlKCcuLi8uLi9jb21tb25zJykuZXZlbnRcbiAgICAgIC5hdHRhY2hFdmVudCh0aGlzLl9lbWl0dGVyLCBEQkdQX1NPQ0tFVF9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIF9vbkVycm9yKGVycm9yOiB7Y29kZTogbnVtYmVyfSk6IHZvaWQge1xuICAgIC8vIE5vdCBzdXJlIGlmIGhodm0gaXMgYWxpdmUgb3Igbm90XG4gICAgLy8gZG8gbm90IHNldCBfaXNDbG9zZWQgZmxhZyBzbyB0aGF0IGRldGFjaCB3aWxsIGJlIHNlbnQgYmVmb3JlIGRpc3Bvc2UoKS5cbiAgICBsb2dnZXIubG9nRXJyb3IoJ3NvY2tldCBlcnJvciAnICsgZXJyb3IuY29kZSk7XG4gICAgdGhpcy5fZW1pdFN0YXR1cyhTVEFUVVNfRVJST1IpO1xuICB9XG5cbiAgX29uRW5kKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzQ2xvc2VkID0gdHJ1ZTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9lbWl0U3RhdHVzKFNUQVRVU19FTkQpO1xuICB9XG5cbiAgX29uRGF0YShkYXRhOiBCdWZmZXIgfCBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZGF0YS50b1N0cmluZygpO1xuICAgIGxvZ2dlci5sb2coJ1JlY2lldmVkIGRhdGE6ICcgKyBtZXNzYWdlKTtcbiAgICBjb25zdCByZXNwb25zZXMgPSB0aGlzLl9tZXNzYWdlSGFuZGxlci5wYXJzZU1lc3NhZ2VzKG1lc3NhZ2UpO1xuICAgIHJlc3BvbnNlcy5mb3JFYWNoKHIgPT4ge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSByLnJlc3BvbnNlO1xuICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlQXR0cmlidXRlcyA9IHJlc3BvbnNlLiQ7XG4gICAgICAgIGNvbnN0IHtjb21tYW5kLCB0cmFuc2FjdGlvbl9pZH0gPSByZXNwb25zZUF0dHJpYnV0ZXM7XG4gICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uSWQgPSBOdW1iZXIodHJhbnNhY3Rpb25faWQpO1xuICAgICAgICBjb25zdCBjYWxsID0gdGhpcy5fY2FsbHMuZ2V0KHRyYW5zYWN0aW9uSWQpO1xuICAgICAgICBpZiAoIWNhbGwpIHtcbiAgICAgICAgICBsb2dnZXIubG9nRXJyb3IoJ01pc3NpbmcgY2FsbCBmb3IgcmVzcG9uc2U6ICcgKyBtZXNzYWdlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY2FsbHMuZGVsZXRlKHRyYW5zYWN0aW9uSWQpO1xuXG4gICAgICAgIGlmIChjYWxsLmNvbW1hbmQgIT09IGNvbW1hbmQpIHtcbiAgICAgICAgICBsb2dnZXIubG9nRXJyb3IoJ0JhZCBjb21tYW5kIGluIHJlc3BvbnNlLiBGb3VuZCAnICtcbiAgICAgICAgICAgIGNvbW1hbmQgKyAnLiBleHBlY3RlZCAnICsgY2FsbC5jb21tYW5kKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsb2dnZXIubG9nKCdDb21wbGV0aW5nIGNhbGw6ICcgKyBtZXNzYWdlKTtcbiAgICAgICAgICBjYWxsLmNvbXBsZXRlKHJlc3BvbnNlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGxvZ2dlci5sb2dFcnJvcignRXhjZXB0aW9uOiAnICsgZS50b1N0cmluZygpICsgJyBoYW5kbGluZyBjYWxsOiAnICsgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5sb2dFcnJvcignVW5leHBlY3RlZCBzb2NrZXQgbWVzc2FnZTogJyArIG1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0U3RhY2tGcmFtZXMoKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICByZXR1cm4gdGhpcy5fY2FsbERlYnVnZ2VyKCdzdGFja19nZXQnKTtcbiAgfVxuXG4gIGFzeW5jIGdldENvbnRleHRzRm9yRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyKTogUHJvbWlzZTxBcnJheTxEYmdwQ29udGV4dD4+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2NvbnRleHRfbmFtZXMnLCBgLWQgJHtmcmFtZUluZGV4fWApO1xuICAgIHJldHVybiByZXN1bHQuY29udGV4dC5tYXAoY29udGV4dCA9PiBjb250ZXh0LiQpO1xuICB9XG5cbiAgYXN5bmMgZ2V0Q29udGV4dFByb3BlcnRpZXMoZnJhbWVJbmRleDogbnVtYmVyLCBjb250ZXh0SWQ6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8RGJncFByb3BlcnR5Pj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcignY29udGV4dF9nZXQnLCBgLWQgJHtmcmFtZUluZGV4fSAtYyAke2NvbnRleHRJZH1gKTtcbiAgICAvLyAwIHJlc3VsdHMgeWllbGRzIG1pc3NpbmcgJ3Byb3BlcnR5JyBtZW1iZXJcbiAgICByZXR1cm4gcmVzdWx0LnByb3BlcnR5IHx8IFtdO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHJvcGVydGllc0J5RnVsbG5hbWUoZnJhbWVJbmRleDogbnVtYmVyLCBjb250ZXh0SWQ6IHN0cmluZywgZnVsbG5hbWU6IHN0cmluZyxcbiAgICAgIHBhZ2U6IG51bWJlcik6IFByb21pc2U8QXJyYXk8RGJncFByb3BlcnR5Pj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihcbiAgICAgICdwcm9wZXJ0eV92YWx1ZScsIGAtZCAke2ZyYW1lSW5kZXh9IC1jICR7Y29udGV4dElkfSAtbiAke2Z1bGxuYW1lfSAtcCAke3BhZ2V9YCk7XG4gICAgLy8gcHJvcGVydHlfdmFsdWUgcmV0dXJucyB0aGUgb3V0ZXIgcHJvcGVydHksIHdlIHdhbnQgdGhlIGNoaWxkcmVuIC4uLlxuICAgIC8vIDAgcmVzdWx0cyB5aWVsZHMgbWlzc2luZyAncHJvcGVydHknIG1lbWJlclxuICAgIHJldHVybiByZXN1bHQucHJvcGVydHlbMF0ucHJvcGVydHkgfHwgW107XG4gIH1cblxuICBhc3luYyBnZXRQcm9wZXJ0aWVzQnlGdWxsbmFtZUFsbENvbmV4dHMoXG4gICAgZnJhbWVJbmRleDogbnVtYmVyLFxuICAgIGZ1bGxuYW1lOiBzdHJpbmcsXG4gICAgcGFnZTogbnVtYmVyLFxuICApOiBQcm9taXNlPEFycmF5PERiZ3BQcm9wZXJ0eT4+IHtcbiAgICAvLyBQYXNzIHplcm8gYXMgY29udGV4dElkIHRvIHNlYXJjaCBhbGwgY29udGV4dHMuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0UHJvcGVydGllc0J5RnVsbG5hbWUoZnJhbWVJbmRleCwgLypjb250ZXh0SWQqLycwJywgZnVsbG5hbWUsIHBhZ2UpO1xuICB9XG5cbiAgYXN5bmMgZXZhbHVhdGVPbkNhbGxGcmFtZShmcmFtZUluZGV4OiBudW1iZXIsIGV4cHJlc3Npb246IHN0cmluZyk6IFByb21pc2U8RXZhbHVhdGlvblJlc3VsdD4ge1xuICAgIC8vIEVzY2FwZSBhbnkgZG91YmxlIHF1b3RlIGluIHRoZSBleHByZXNzaW9uLlxuICAgIGNvbnN0IGVzY2FwZWRFeHByZXNzaW9uID0gZXhwcmVzc2lvbi5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyk7XG4gICAgLy8gUXVvdGUgdGhlIGlucHV0IGV4cHJlc3Npb24gc28gdGhhdCB3ZSBjYW4gc3VwcG9ydCBleHByZXNzaW9uIHdpdGhcbiAgICAvLyBzcGFjZSBpbiBpdChlLmcuIGZ1bmN0aW9uIGV2YWx1YXRpb24pLlxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihcbiAgICAgICdwcm9wZXJ0eV92YWx1ZScsXG4gICAgICBgLWQgJHtmcmFtZUluZGV4fSAtbiBcIiR7ZXNjYXBlZEV4cHJlc3Npb259XCJgXG4gICAgKTtcbiAgICBpZiAocmVzdWx0LmVycm9yICYmIHJlc3VsdC5lcnJvci5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlcnJvcjogcmVzdWx0LmVycm9yWzBdLFxuICAgICAgICB3YXNUaHJvd246IHRydWUsXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdWx0OiByZXN1bHQucHJvcGVydHlbMF0gfHwgW10sXG4gICAgICB3YXNUaHJvd246IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICAvLyBSZXR1cm5zIG9uZSBvZjpcbiAgLy8gIHN0YXJ0aW5nLCBzdG9wcGluZywgc3RvcHBlZCwgcnVubmluZywgYnJlYWtcbiAgYXN5bmMgZ2V0U3RhdHVzKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ3N0YXR1cycpO1xuICAgIC8vIFRPRE86IERvIHdlIGV2ZXIgY2FyZSBhYm91dCByZXNwb25zZS4kLnJlYXNvbj9cbiAgICByZXR1cm4gcmVzcG9uc2UuJC5zdGF0dXM7XG4gIH1cblxuICAvLyBDb250aW51YXRpb24gY29tbWFuZHMgZ2V0IGEgcmVzcG9uc2UsIGJ1dCB0aGF0IHJlc3BvbnNlXG4gIC8vIGlzIGEgc3RhdHVzIG1lc3NhZ2Ugd2hpY2ggb2NjdXJzIGFmdGVyIGV4ZWN1dGlvbiBzdG9wcy5cbiAgYXN5bmMgc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0aGlzLl9lbWl0U3RhdHVzKFNUQVRVU19SVU5OSU5HKTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihjb21tYW5kKTtcbiAgICBjb25zdCBzdGF0dXMgPSByZXNwb25zZS4kLnN0YXR1cztcbiAgICB0aGlzLl9lbWl0U3RhdHVzKHN0YXR1cyk7XG4gICAgcmV0dXJuIHN0YXR1cztcbiAgfVxuXG4gIGFzeW5jIHNlbmRCcmVha0NvbW1hbmQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2JyZWFrJyk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuc3VjY2VzcyAhPT0gJzAnO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGV4Y2VwdGlvbiBicmVha3BvaW50IGlkLlxuICAgKi9cbiAgYXN5bmMgc2V0RXhjZXB0aW9uQnJlYWtwb2ludChleGNlcHRpb25OYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY2FsbERlYnVnZ2VyKCdicmVha3BvaW50X3NldCcsIGAtdCBleGNlcHRpb24gLXggJHtleGNlcHRpb25OYW1lfWApO1xuICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBmcm9tIHNldFBhdXNlZE9uRXhjZXB0aW9uczogJyArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgfVxuICAgIC8vIFRPRE86IFZhbGlkYXRlIHRoYXQgcmVzcG9uc2UuJC5zdGF0ZSA9PT0gJ2VuYWJsZWQnXG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuaWQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGJyZWFrcG9pbnQgaWRcbiAgICovXG4gIGFzeW5jIHNldEJyZWFrcG9pbnQoZmlsZW5hbWU6IHN0cmluZywgbGluZU51bWJlcjogbnVtYmVyKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NhbGxEZWJ1Z2dlcihcbiAgICAgICdicmVha3BvaW50X3NldCcsXG4gICAgICBgLXQgbGluZSAtZiAke2ZpbGVuYW1lfSAtbiAke2xpbmVOdW1iZXJ9YFxuICAgICk7XG4gICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHNldHRpbmcgYnJlYWtwb2ludDogJyArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgfVxuICAgIC8vIFRPRE86IFZhbGlkYXRlIHRoYXQgcmVzcG9uc2UuJC5zdGF0ZSA9PT0gJ2VuYWJsZWQnXG4gICAgcmV0dXJuIHJlc3BvbnNlLiQuaWQ7XG4gIH1cblxuICBhc3luYyByZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsRGVidWdnZXIoJ2JyZWFrcG9pbnRfcmVtb3ZlJywgYC1kICR7YnJlYWtwb2ludElkfWApO1xuICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciByZW1vdmluZyBicmVha3BvaW50OiAnICsgSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKTtcbiAgICB9XG4gIH1cblxuICAvLyBTZW5kcyBjb21tYW5kIHRvIGhodm0uXG4gIC8vIFJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHJlc3VsdGluZyBhdHRyaWJ1dGVzLlxuICBfY2FsbERlYnVnZ2VyKGNvbW1hbmQ6IHN0cmluZywgcGFyYW1zOiA/c3RyaW5nKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICBjb25zdCB0cmFuc2FjdGlvbklkID0gdGhpcy5fc2VuZENvbW1hbmQoY29tbWFuZCwgcGFyYW1zKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY2FsbHMuc2V0KHRyYW5zYWN0aW9uSWQsIHtcbiAgICAgICAgY29tbWFuZCxcbiAgICAgICAgY29tcGxldGU6IHJlc3VsdCA9PiByZXNvbHZlKHJlc3VsdCksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9zZW5kQ29tbWFuZChjb21tYW5kOiBzdHJpbmcsIHBhcmFtczogP3N0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3QgaWQgPSArK3RoaXMuX3RyYW5zYWN0aW9uSWQ7XG4gICAgbGV0IG1lc3NhZ2UgPSBgJHtjb21tYW5kfSAtaSAke2lkfWA7XG4gICAgaWYgKHBhcmFtcykge1xuICAgICAgbWVzc2FnZSArPSAnICcgKyBwYXJhbXM7XG4gICAgfVxuICAgIHRoaXMuX3NlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuXG4gIF9zZW5kTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgaWYgKHNvY2tldCAhPSBudWxsKSB7XG4gICAgICBsb2dnZXIubG9nKCdTZW5kaW5nIG1lc3NhZ2U6ICcgKyBtZXNzYWdlKTtcbiAgICAgIHNvY2tldC53cml0ZShtZXNzYWdlICsgJ1xceDAwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5sb2dFcnJvcignQXR0ZW1wdCB0byBzZW5kIG1lc3NhZ2UgYWZ0ZXIgZGlzcG9zZTogJyArIG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIF9lbWl0U3RhdHVzKHN0YXR1czogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZygnRW1pdHRpbmcgc3RhdHVzOiAnICsgc3RhdHVzKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoREJHUF9TT0NLRVRfU1RBVFVTX0VWRU5ULCBzdGF0dXMpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzQ2xvc2VkKSB7XG4gICAgICAvLyBUT0RPW2plZmZyZXl0YW5dOiB3b3JrYXJvdW5kIGEgY3Jhc2godDgxODE1MzgpIGluIGhodm1cbiAgICAgIHRoaXMuc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9ERVRBQ0gpO1xuICAgIH1cblxuICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcbiAgICBpZiAoc29ja2V0KSB7XG4gICAgICAvLyBlbmQgLSBTZW5kcyB0aGUgRklOIHBhY2tldCBhbmQgY2xvc2VzIHdyaXRpbmcuXG4gICAgICAvLyBkZXN0cm95IC0gY2xvc2VzIGZvciByZWFkaW5nIGFuZCB3cml0aW5nLlxuICAgICAgc29ja2V0LmVuZCgpO1xuICAgICAgc29ja2V0LmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3NvY2tldCA9IG51bGw7XG4gICAgICB0aGlzLl9pc0Nsb3NlZCA9IHRydWU7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBEYmdwU29ja2V0LFxuICBTVEFUVVNfU1RBUlRJTkcsXG4gIFNUQVRVU19TVE9QUElORyxcbiAgU1RBVFVTX1NUT1BQRUQsXG4gIFNUQVRVU19SVU5OSU5HLFxuICBTVEFUVVNfQlJFQUssXG4gIFNUQVRVU19FUlJPUixcbiAgU1RBVFVTX0VORCxcbiAgQ09NTUFORF9SVU4sXG4gIENPTU1BTkRfU1RFUF9JTlRPLFxuICBDT01NQU5EX1NURVBfT1ZFUixcbiAgQ09NTUFORF9TVEVQX09VVCxcbiAgQ09NTUFORF9TVE9QLFxuICBDT01NQU5EX0RFVEFDSCxcbn07XG4iXX0=