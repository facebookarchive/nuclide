Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var _Handler2 = require('./Handler');

var _Handler3 = _interopRequireDefault(_Handler2);

var _DbgpSocket = require('./DbgpSocket');

var _FileCache = require('./FileCache');

var _FileCache2 = _interopRequireDefault(_FileCache);

var _events = require('events');

var SESSION_END_EVENT = 'session-end-event';

// Handles all 'Debug.*' Chrome dev tools messages

var DebuggerHandler = (function (_Handler) {
  _inherits(DebuggerHandler, _Handler);

  function DebuggerHandler(clientCallback, connectionMultiplexer) {
    _classCallCheck(this, DebuggerHandler);

    _get(Object.getPrototypeOf(DebuggerHandler.prototype), 'constructor', this).call(this, 'Debugger', clientCallback);

    this._hadFirstContinuationCommand = false;
    this._connectionMultiplexer = connectionMultiplexer;
    this._files = new _FileCache2['default'](clientCallback);
    this._emitter = new _events.EventEmitter();
    this._statusSubscription = this._connectionMultiplexer.onStatus(this._onStatusChanged.bind(this));
  }

  _createClass(DebuggerHandler, [{
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      _utils2['default'].log('onSessionEnd');
      this._emitter.on(SESSION_END_EVENT, callback);
    }
  }, {
    key: 'handleMethod',
    value: _asyncToGenerator(function* (id, method, params) {

      switch (method) {

        // TODO: Add Console (aka logging) support
        case 'enable':
          this._debuggerEnable(id);
          break;

        case 'pause':
          yield this._sendBreakCommand(id);
          break;

        case 'stepInto':
          this._sendContinuationCommand(_DbgpSocket.COMMAND_STEP_INTO);
          break;

        case 'stepOut':
          this._sendContinuationCommand(_DbgpSocket.COMMAND_STEP_OUT);
          break;

        case 'stepOver':
          this._sendContinuationCommand(_DbgpSocket.COMMAND_STEP_OVER);
          break;

        case 'resume':
          this._sendContinuationCommand(_DbgpSocket.COMMAND_RUN);
          break;

        case 'setPauseOnExceptions':
          yield this._setPauseOnExceptions(id, params);
          break;

        case 'setAsyncCallStackDepth':
        case 'skipStackFrames':
          this.replyWithError(id, 'Not implemented');
          break;

        case 'getScriptSource':
          // TODO: Handle file read errors.
          // TODO: Handle non-file scriptIds
          this.replyToCommand(id, { scriptSource: yield this._files.getFileSource(params.scriptId) });
          break;

        case 'setBreakpointByUrl':
          this._setBreakpointByUrl(id, params);
          break;

        case 'removeBreakpoint':
          yield this._removeBreakpoint(id, params);
          break;

        case 'evaluateOnCallFrame':
          var result = yield this._connectionMultiplexer.evaluateOnCallFrame(Number(params.callFrameId), params.expression);
          this.replyToCommand(id, result);
          break;

        default:
          this.unknownMethod(id, method, params);
          break;
      }
    })
  }, {
    key: '_setPauseOnExceptions',
    value: _asyncToGenerator(function* (id, params) {
      var state = params.state;

      yield this._connectionMultiplexer.setPauseOnExceptions(state);
      this.replyToCommand(id, {});
    })
  }, {
    key: '_setBreakpointByUrl',
    value: function _setBreakpointByUrl(id, params) {
      var lineNumber = params.lineNumber;
      var url = params.url;
      var columnNumber = params.columnNumber;
      var condition = params.condition;

      if (!url || condition !== '' || columnNumber !== 0) {
        this.replyWithError(id, 'Invalid arguments to Debugger.setBreakpointByUrl: ' + JSON.stringify(params));
        return;
      }
      this._files.registerFile(url);

      var path = (0, _helpers.uriToPath)(url);
      var breakpointId = this._connectionMultiplexer.setBreakpoint(path, lineNumber + 1);
      this.replyToCommand(id, {
        breakpointId: breakpointId,
        locations: [{
          lineNumber: lineNumber,
          scriptId: path
        }] });
    }
  }, {
    key: '_removeBreakpoint',
    value: _asyncToGenerator(function* (id, params) {
      var breakpointId = params.breakpointId;

      yield this._connectionMultiplexer.removeBreakpoint(breakpointId);
      this.replyToCommand(id, { id: breakpointId });
    })
  }, {
    key: '_debuggerEnable',
    value: function _debuggerEnable(id) {
      this.replyToCommand(id, {});
      this._sendFakeLoaderBreakpoint();
    }
  }, {
    key: '_getStackFrames',
    value: _asyncToGenerator(function* () {
      var _this = this;

      var frames = yield this._connectionMultiplexer.getStackFrames();
      return yield Promise.all(frames.stack.map(function (frame, frameIndex) {
        return _this._convertFrame(frame, frameIndex);
      }));
    })
  }, {
    key: '_convertFrame',
    value: _asyncToGenerator(function* (frame, frameIndex) {
      _utils2['default'].log('Converting frame: ' + JSON.stringify(frame));

      var _require = require('./frame');

      var idOfFrame = _require.idOfFrame;
      var functionOfFrame = _require.functionOfFrame;
      var fileUrlOfFrame = _require.fileUrlOfFrame;
      var locationOfFrame = _require.locationOfFrame;

      this._files.registerFile(fileUrlOfFrame(frame));
      return {
        callFrameId: idOfFrame(frame),
        functionName: functionOfFrame(frame),
        location: locationOfFrame(frame),
        scopeChain: yield this._connectionMultiplexer.getScopesForFrame(frameIndex)
      };
    })
  }, {
    key: '_sendContinuationCommand',
    value: function _sendContinuationCommand(command) {
      if (!this._hadFirstContinuationCommand) {
        this._hadFirstContinuationCommand = true;
        this.sendMethod('Debugger.resumed');
        this._connectionMultiplexer.listen();
        return;
      }
      _utils2['default'].log('Sending continuation command: ' + command);
      this._connectionMultiplexer.sendContinuationCommand(command);
    }
  }, {
    key: '_sendBreakCommand',
    value: _asyncToGenerator(function* (id) {
      var response = yield this._connectionMultiplexer.sendBreakCommand();
      if (!response) {
        this.replyWithError(id, 'Unable to break');
      }
    })
  }, {
    key: '_onStatusChanged',
    value: _asyncToGenerator(function* (status) {
      _utils2['default'].log('Sending status: ' + status);
      switch (status) {
        case _DbgpSocket.STATUS_BREAK:
          yield this._sendPausedMessage();
          break;
        case _DbgpSocket.STATUS_RUNNING:
          this.sendMethod('Debugger.resumed');
          break;
        case _DbgpSocket.STATUS_STOPPED:
        case _DbgpSocket.STATUS_ERROR:
        case _DbgpSocket.STATUS_END:
          this._endSession();
          break;
        case _DbgpSocket.STATUS_STARTING:
        case _DbgpSocket.STATUS_STOPPING:
          // These two should be hidden by the ConnectionMultiplexer
          break;
        default:
          _utils2['default'].logErrorAndThrow('Unexpected status: ' + status);
      }
    })

    // May only call when in paused state.
  }, {
    key: '_sendPausedMessage',
    value: _asyncToGenerator(function* () {
      this.sendMethod('Debugger.paused', {
        callFrames: yield this._getStackFrames(),
        reason: 'breakpoint', // TODO: better reason?
        data: {}
      });
    })
  }, {
    key: '_sendFakeLoaderBreakpoint',
    value: function _sendFakeLoaderBreakpoint() {
      this.sendMethod('Debugger.paused', {
        callFrames: [],
        reason: 'breakpoint', // TODO: better reason?
        data: {}
      });
    }
  }, {
    key: '_endSession',
    value: function _endSession() {
      _utils2['default'].log('DebuggerHandler: Ending session');
      if (this._statusSubscription) {
        this._statusSubscription.dispose();
        this._statusSubscription = null;
      }
      this._emitter.emit(SESSION_END_EVENT);
    }
  }]);

  return DebuggerHandler;
})(_Handler3['default']);

exports.DebuggerHandler = DebuggerHandler;
//# sourceMappingURL=data:application/json;base64,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ImZpbGUiOiJEZWJ1Z2dlckhhbmRsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cbmltcG9ydCBsb2dnZXIgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge3VyaVRvUGF0aH0gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCBIYW5kbGVyIGZyb20gJy4vSGFuZGxlcic7XG5pbXBvcnQge1xuICBTVEFUVVNfU1RBUlRJTkcsXG4gIFNUQVRVU19TVE9QUElORyxcbiAgU1RBVFVTX1NUT1BQRUQsXG4gIFNUQVRVU19SVU5OSU5HLFxuICBTVEFUVVNfQlJFQUssXG4gIFNUQVRVU19FUlJPUixcbiAgU1RBVFVTX0VORCxcbiAgQ09NTUFORF9SVU4sXG4gIENPTU1BTkRfU1RFUF9JTlRPLFxuICBDT01NQU5EX1NURVBfT1ZFUixcbiAgQ09NTUFORF9TVEVQX09VVCxcbn0gZnJvbSAnLi9EYmdwU29ja2V0JztcblxuaW1wb3J0IEZpbGVDYWNoZSBmcm9tICcuL0ZpbGVDYWNoZSc7XG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcblxuaW1wb3J0IHR5cGUge0Nvbm5lY3Rpb25NdWx0aXBsZXhlcn0gZnJvbSAnLi9Db25uZWN0aW9uTXVsdGlwbGV4ZXInO1xuaW1wb3J0IHR5cGUge0NsaWVudENhbGxiYWNrfSBmcm9tICcuL0NsaWVudENhbGxiYWNrJztcblxuY29uc3QgU0VTU0lPTl9FTkRfRVZFTlQgPSAnc2Vzc2lvbi1lbmQtZXZlbnQnO1xuXG4vLyBIYW5kbGVzIGFsbCAnRGVidWcuKicgQ2hyb21lIGRldiB0b29scyBtZXNzYWdlc1xuZXhwb3J0IGNsYXNzIERlYnVnZ2VySGFuZGxlciBleHRlbmRzIEhhbmRsZXIge1xuICBfY29ubmVjdGlvbk11bHRpcGxleGVyOiBDb25uZWN0aW9uTXVsdGlwbGV4ZXI7XG4gIF9maWxlczogRmlsZUNhY2hlO1xuICBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfc3RhdHVzU3Vic2NyaXB0aW9uOiA/YXRvbSREaXNwb3NhYmxlO1xuICBfaGFkRmlyc3RDb250aW51YXRpb25Db21tYW5kOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGNsaWVudENhbGxiYWNrOiBDbGllbnRDYWxsYmFjayxcbiAgICBjb25uZWN0aW9uTXVsdGlwbGV4ZXI6IENvbm5lY3Rpb25NdWx0aXBsZXhlclxuICApIHtcbiAgICBzdXBlcignRGVidWdnZXInLCBjbGllbnRDYWxsYmFjayk7XG5cbiAgICB0aGlzLl9oYWRGaXJzdENvbnRpbnVhdGlvbkNvbW1hbmQgPSBmYWxzZTtcbiAgICB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIgPSBjb25uZWN0aW9uTXVsdGlwbGV4ZXI7XG4gICAgdGhpcy5fZmlsZXMgPSBuZXcgRmlsZUNhY2hlKGNsaWVudENhbGxiYWNrKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbiA9IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5vblN0YXR1cyhcbiAgICAgIHRoaXMuX29uU3RhdHVzQ2hhbmdlZC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgfVxuXG4gIG9uU2Vzc2lvbkVuZChjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGxvZ2dlci5sb2coJ29uU2Vzc2lvbkVuZCcpO1xuICAgIHRoaXMuX2VtaXR0ZXIub24oU0VTU0lPTl9FTkRfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZU1ldGhvZChpZDogbnVtYmVyLCBtZXRob2Q6IHN0cmluZywgcGFyYW1zOiBPYmplY3QpOiBQcm9taXNlIHtcblxuICAgIHN3aXRjaCAobWV0aG9kKSB7XG5cbiAgICAgIC8vIFRPRE86IEFkZCBDb25zb2xlIChha2EgbG9nZ2luZykgc3VwcG9ydFxuICAgICAgY2FzZSAnZW5hYmxlJzpcbiAgICAgICAgdGhpcy5fZGVidWdnZXJFbmFibGUoaWQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAncGF1c2UnOlxuICAgICAgICBhd2FpdCB0aGlzLl9zZW5kQnJlYWtDb21tYW5kKGlkKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3N0ZXBJbnRvJzpcbiAgICAgICAgdGhpcy5fc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9TVEVQX0lOVE8pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc3RlcE91dCc6XG4gICAgICAgIHRoaXMuX3NlbmRDb250aW51YXRpb25Db21tYW5kKENPTU1BTkRfU1RFUF9PVVQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc3RlcE92ZXInOlxuICAgICAgICB0aGlzLl9zZW5kQ29udGludWF0aW9uQ29tbWFuZChDT01NQU5EX1NURVBfT1ZFUik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdyZXN1bWUnOlxuICAgICAgICB0aGlzLl9zZW5kQ29udGludWF0aW9uQ29tbWFuZChDT01NQU5EX1JVTik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdzZXRQYXVzZU9uRXhjZXB0aW9ucyc6XG4gICAgICAgIGF3YWl0IHRoaXMuX3NldFBhdXNlT25FeGNlcHRpb25zKGlkLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc2V0QXN5bmNDYWxsU3RhY2tEZXB0aCc6XG4gICAgICBjYXNlICdza2lwU3RhY2tGcmFtZXMnOlxuICAgICAgICB0aGlzLnJlcGx5V2l0aEVycm9yKGlkLCAnTm90IGltcGxlbWVudGVkJyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdnZXRTY3JpcHRTb3VyY2UnOlxuICAgICAgICAvLyBUT0RPOiBIYW5kbGUgZmlsZSByZWFkIGVycm9ycy5cbiAgICAgICAgLy8gVE9ETzogSGFuZGxlIG5vbi1maWxlIHNjcmlwdElkc1xuICAgICAgICB0aGlzLnJlcGx5VG9Db21tYW5kKGlkLCB7IHNjcmlwdFNvdXJjZTogYXdhaXQgdGhpcy5fZmlsZXMuZ2V0RmlsZVNvdXJjZShwYXJhbXMuc2NyaXB0SWQpIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc2V0QnJlYWtwb2ludEJ5VXJsJzpcbiAgICAgICAgdGhpcy5fc2V0QnJlYWtwb2ludEJ5VXJsKGlkLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAncmVtb3ZlQnJlYWtwb2ludCc6XG4gICAgICAgIGF3YWl0IHRoaXMuX3JlbW92ZUJyZWFrcG9pbnQoaWQsIHBhcmFtcyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdldmFsdWF0ZU9uQ2FsbEZyYW1lJzpcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fY29ubmVjdGlvbk11bHRpcGxleGVyLmV2YWx1YXRlT25DYWxsRnJhbWUoXG4gICAgICAgICAgTnVtYmVyKHBhcmFtcy5jYWxsRnJhbWVJZCksXG4gICAgICAgICAgcGFyYW1zLmV4cHJlc3Npb25cbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5yZXBseVRvQ29tbWFuZChpZCwgcmVzdWx0KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMudW5rbm93bk1ldGhvZChpZCwgbWV0aG9kLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBhc3luYyBfc2V0UGF1c2VPbkV4Y2VwdGlvbnMoaWQ6IG51bWJlciwgcGFyYW1zOiBPYmplY3QpOiBQcm9taXNlIHtcbiAgICBjb25zdCB7c3RhdGV9ID0gcGFyYW1zO1xuICAgIGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5zZXRQYXVzZU9uRXhjZXB0aW9ucyhzdGF0ZSk7XG4gICAgdGhpcy5yZXBseVRvQ29tbWFuZChpZCwge30pO1xuICB9XG5cbiAgX3NldEJyZWFrcG9pbnRCeVVybChpZDogbnVtYmVyLCBwYXJhbXM6IE9iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IHtsaW5lTnVtYmVyLCB1cmwsIGNvbHVtbk51bWJlciwgY29uZGl0aW9ufSA9IHBhcmFtcztcbiAgICBpZiAoIXVybCB8fCBjb25kaXRpb24gIT09ICcnIHx8IGNvbHVtbk51bWJlciAhPT0gMCkge1xuICAgICAgdGhpcy5yZXBseVdpdGhFcnJvcihpZCwgJ0ludmFsaWQgYXJndW1lbnRzIHRvIERlYnVnZ2VyLnNldEJyZWFrcG9pbnRCeVVybDogJ1xuICAgICAgICArIEpTT04uc3RyaW5naWZ5KHBhcmFtcykpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9maWxlcy5yZWdpc3RlckZpbGUodXJsKTtcblxuICAgIGNvbnN0IHBhdGggPSB1cmlUb1BhdGgodXJsKTtcbiAgICBjb25zdCBicmVha3BvaW50SWQgPSB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIuc2V0QnJlYWtwb2ludChwYXRoLCBsaW5lTnVtYmVyICsgMSk7XG4gICAgdGhpcy5yZXBseVRvQ29tbWFuZChpZCwge1xuICAgICAgYnJlYWtwb2ludElkOiBicmVha3BvaW50SWQsXG4gICAgICBsb2NhdGlvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGxpbmVOdW1iZXIsXG4gICAgICAgICAgc2NyaXB0SWQ6IHBhdGgsXG4gICAgICAgIH0sXG4gICAgICBdfSk7XG4gIH1cblxuICBhc3luYyBfcmVtb3ZlQnJlYWtwb2ludChpZDogbnVtYmVyLCBwYXJhbXM6IE9iamVjdCk6IFByb21pc2Uge1xuICAgIGNvbnN0IHticmVha3BvaW50SWR9ID0gcGFyYW1zO1xuICAgIGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5yZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZCk7XG4gICAgdGhpcy5yZXBseVRvQ29tbWFuZChpZCwge2lkOiBicmVha3BvaW50SWR9KTtcbiAgfVxuXG4gIF9kZWJ1Z2dlckVuYWJsZShpZDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5yZXBseVRvQ29tbWFuZChpZCwge30pO1xuICAgIHRoaXMuX3NlbmRGYWtlTG9hZGVyQnJlYWtwb2ludCgpO1xuICB9XG5cbiAgYXN5bmMgX2dldFN0YWNrRnJhbWVzKCk6IFByb21pc2U8QXJyYXk8T2JqZWN0Pj4ge1xuICAgIGNvbnN0IGZyYW1lcyA9IGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5nZXRTdGFja0ZyYW1lcygpO1xuICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIGZyYW1lcy5zdGFjay5tYXAoKGZyYW1lLCBmcmFtZUluZGV4KSA9PiB0aGlzLl9jb252ZXJ0RnJhbWUoZnJhbWUsIGZyYW1lSW5kZXgpKSk7XG4gIH1cblxuICBhc3luYyBfY29udmVydEZyYW1lKGZyYW1lOiBPYmplY3QsIGZyYW1lSW5kZXg6IG51bWJlcik6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgbG9nZ2VyLmxvZygnQ29udmVydGluZyBmcmFtZTogJyArIEpTT04uc3RyaW5naWZ5KGZyYW1lKSk7XG4gICAgY29uc3Qge1xuICAgICAgaWRPZkZyYW1lLFxuICAgICAgZnVuY3Rpb25PZkZyYW1lLFxuICAgICAgZmlsZVVybE9mRnJhbWUsXG4gICAgICBsb2NhdGlvbk9mRnJhbWUsXG4gICAgfSA9IHJlcXVpcmUoJy4vZnJhbWUnKTtcblxuICAgIHRoaXMuX2ZpbGVzLnJlZ2lzdGVyRmlsZShmaWxlVXJsT2ZGcmFtZShmcmFtZSkpO1xuICAgIHJldHVybiB7XG4gICAgICBjYWxsRnJhbWVJZDogaWRPZkZyYW1lKGZyYW1lKSxcbiAgICAgIGZ1bmN0aW9uTmFtZTogZnVuY3Rpb25PZkZyYW1lKGZyYW1lKSxcbiAgICAgIGxvY2F0aW9uOiBsb2NhdGlvbk9mRnJhbWUoZnJhbWUpLFxuICAgICAgc2NvcGVDaGFpbjogYXdhaXQgdGhpcy5fY29ubmVjdGlvbk11bHRpcGxleGVyLmdldFNjb3Blc0ZvckZyYW1lKGZyYW1lSW5kZXgpLFxuICAgIH07XG4gIH1cblxuICBfc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9oYWRGaXJzdENvbnRpbnVhdGlvbkNvbW1hbmQpIHtcbiAgICAgIHRoaXMuX2hhZEZpcnN0Q29udGludWF0aW9uQ29tbWFuZCA9IHRydWU7XG4gICAgICB0aGlzLnNlbmRNZXRob2QoJ0RlYnVnZ2VyLnJlc3VtZWQnKTtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5saXN0ZW4oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nZ2VyLmxvZygnU2VuZGluZyBjb250aW51YXRpb24gY29tbWFuZDogJyArIGNvbW1hbmQpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5zZW5kQ29udGludWF0aW9uQ29tbWFuZChjb21tYW5kKTtcbiAgfVxuXG4gIGFzeW5jIF9zZW5kQnJlYWtDb21tYW5kKGlkOiBudW1iZXIpOiBQcm9taXNlIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5zZW5kQnJlYWtDb21tYW5kKCk7XG4gICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgdGhpcy5yZXBseVdpdGhFcnJvcihpZCwgJ1VuYWJsZSB0byBicmVhaycpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9vblN0YXR1c0NoYW5nZWQoc3RhdHVzOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICBsb2dnZXIubG9nKCdTZW5kaW5nIHN0YXR1czogJyArIHN0YXR1cyk7XG4gICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgIGNhc2UgU1RBVFVTX0JSRUFLOlxuICAgICAgICBhd2FpdCB0aGlzLl9zZW5kUGF1c2VkTWVzc2FnZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX1JVTk5JTkc6XG4gICAgICAgIHRoaXMuc2VuZE1ldGhvZCgnRGVidWdnZXIucmVzdW1lZCcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX1NUT1BQRUQ6XG4gICAgICBjYXNlIFNUQVRVU19FUlJPUjpcbiAgICAgIGNhc2UgU1RBVFVTX0VORDpcbiAgICAgICAgdGhpcy5fZW5kU2Vzc2lvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX1NUQVJUSU5HOlxuICAgICAgY2FzZSBTVEFUVVNfU1RPUFBJTkc6XG4gICAgICAgIC8vIFRoZXNlIHR3byBzaG91bGQgYmUgaGlkZGVuIGJ5IHRoZSBDb25uZWN0aW9uTXVsdGlwbGV4ZXJcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsb2dnZXIubG9nRXJyb3JBbmRUaHJvdygnVW5leHBlY3RlZCBzdGF0dXM6ICcgKyBzdGF0dXMpO1xuICAgIH1cbiAgfVxuXG4gIC8vIE1heSBvbmx5IGNhbGwgd2hlbiBpbiBwYXVzZWQgc3RhdGUuXG4gIGFzeW5jIF9zZW5kUGF1c2VkTWVzc2FnZSgpOiBQcm9taXNlIHtcbiAgICB0aGlzLnNlbmRNZXRob2QoXG4gICAgICAnRGVidWdnZXIucGF1c2VkJyxcbiAgICAgIHtcbiAgICAgICAgY2FsbEZyYW1lczogYXdhaXQgdGhpcy5fZ2V0U3RhY2tGcmFtZXMoKSxcbiAgICAgICAgcmVhc29uOiAnYnJlYWtwb2ludCcsIC8vIFRPRE86IGJldHRlciByZWFzb24/XG4gICAgICAgIGRhdGE6IHt9LFxuICAgICAgfSk7XG4gIH1cblxuICBfc2VuZEZha2VMb2FkZXJCcmVha3BvaW50KCk6IHZvaWQge1xuICAgIHRoaXMuc2VuZE1ldGhvZChcbiAgICAgICdEZWJ1Z2dlci5wYXVzZWQnLFxuICAgICAge1xuICAgICAgICBjYWxsRnJhbWVzOiBbXSxcbiAgICAgICAgcmVhc29uOiAnYnJlYWtwb2ludCcsIC8vIFRPRE86IGJldHRlciByZWFzb24/XG4gICAgICAgIGRhdGE6IHt9LFxuICAgICAgfSk7XG4gIH1cblxuICBfZW5kU2Vzc2lvbigpOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKCdEZWJ1Z2dlckhhbmRsZXI6IEVuZGluZyBzZXNzaW9uJyk7XG4gICAgaWYgKHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fc3RhdHVzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChTRVNTSU9OX0VORF9FVkVOVCk7XG4gIH1cbn1cbiJdfQ==