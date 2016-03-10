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
          var compatParams = (0, _utils.makeExpressionHphpdCompatible)(params);
          var result = yield this._connectionMultiplexer.evaluateOnCallFrame(Number(compatParams.callFrameId), compatParams.expression);
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
//# sourceMappingURL=data:application/json;base64,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SSxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDdkM7OztTQWpPVSxlQUFlIiwiZmlsZSI6IkRlYnVnZ2VySGFuZGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblxuaW1wb3J0IHttYWtlRXhwcmVzc2lvbkhwaHBkQ29tcGF0aWJsZX0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHt1cmlUb1BhdGh9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQgSGFuZGxlciBmcm9tICcuL0hhbmRsZXInO1xuaW1wb3J0IHtcbiAgU1RBVFVTX1NUQVJUSU5HLFxuICBTVEFUVVNfU1RPUFBJTkcsXG4gIFNUQVRVU19TVE9QUEVELFxuICBTVEFUVVNfUlVOTklORyxcbiAgU1RBVFVTX0JSRUFLLFxuICBTVEFUVVNfRVJST1IsXG4gIFNUQVRVU19FTkQsXG4gIENPTU1BTkRfUlVOLFxuICBDT01NQU5EX1NURVBfSU5UTyxcbiAgQ09NTUFORF9TVEVQX09WRVIsXG4gIENPTU1BTkRfU1RFUF9PVVQsXG59IGZyb20gJy4vRGJncFNvY2tldCc7XG5cbmltcG9ydCBGaWxlQ2FjaGUgZnJvbSAnLi9GaWxlQ2FjaGUnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5cbmltcG9ydCB0eXBlIHtDb25uZWN0aW9uTXVsdGlwbGV4ZXJ9IGZyb20gJy4vQ29ubmVjdGlvbk11bHRpcGxleGVyJztcbmltcG9ydCB0eXBlIHtDbGllbnRDYWxsYmFja30gZnJvbSAnLi9DbGllbnRDYWxsYmFjayc7XG5cbmNvbnN0IFNFU1NJT05fRU5EX0VWRU5UID0gJ3Nlc3Npb24tZW5kLWV2ZW50JztcblxuLy8gSGFuZGxlcyBhbGwgJ0RlYnVnLionIENocm9tZSBkZXYgdG9vbHMgbWVzc2FnZXNcbmV4cG9ydCBjbGFzcyBEZWJ1Z2dlckhhbmRsZXIgZXh0ZW5kcyBIYW5kbGVyIHtcbiAgX2Nvbm5lY3Rpb25NdWx0aXBsZXhlcjogQ29ubmVjdGlvbk11bHRpcGxleGVyO1xuICBfZmlsZXM6IEZpbGVDYWNoZTtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX3N0YXR1c1N1YnNjcmlwdGlvbjogP0lEaXNwb3NhYmxlO1xuICBfaGFkRmlyc3RDb250aW51YXRpb25Db21tYW5kOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGNsaWVudENhbGxiYWNrOiBDbGllbnRDYWxsYmFjayxcbiAgICBjb25uZWN0aW9uTXVsdGlwbGV4ZXI6IENvbm5lY3Rpb25NdWx0aXBsZXhlclxuICApIHtcbiAgICBzdXBlcignRGVidWdnZXInLCBjbGllbnRDYWxsYmFjayk7XG5cbiAgICB0aGlzLl9oYWRGaXJzdENvbnRpbnVhdGlvbkNvbW1hbmQgPSBmYWxzZTtcbiAgICB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIgPSBjb25uZWN0aW9uTXVsdGlwbGV4ZXI7XG4gICAgdGhpcy5fZmlsZXMgPSBuZXcgRmlsZUNhY2hlKGNsaWVudENhbGxiYWNrKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbiA9IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5vblN0YXR1cyhcbiAgICAgIHRoaXMuX29uU3RhdHVzQ2hhbmdlZC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgfVxuXG4gIG9uU2Vzc2lvbkVuZChjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGxvZ2dlci5sb2coJ29uU2Vzc2lvbkVuZCcpO1xuICAgIHRoaXMuX2VtaXR0ZXIub24oU0VTU0lPTl9FTkRfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZU1ldGhvZChpZDogbnVtYmVyLCBtZXRob2Q6IHN0cmluZywgcGFyYW1zOiBPYmplY3QpOiBQcm9taXNlIHtcblxuICAgIHN3aXRjaCAobWV0aG9kKSB7XG5cbiAgICAgIC8vIFRPRE86IEFkZCBDb25zb2xlIChha2EgbG9nZ2luZykgc3VwcG9ydFxuICAgICAgY2FzZSAnZW5hYmxlJzpcbiAgICAgICAgdGhpcy5fZGVidWdnZXJFbmFibGUoaWQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAncGF1c2UnOlxuICAgICAgICBhd2FpdCB0aGlzLl9zZW5kQnJlYWtDb21tYW5kKGlkKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3N0ZXBJbnRvJzpcbiAgICAgICAgdGhpcy5fc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9TVEVQX0lOVE8pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc3RlcE91dCc6XG4gICAgICAgIHRoaXMuX3NlbmRDb250aW51YXRpb25Db21tYW5kKENPTU1BTkRfU1RFUF9PVVQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc3RlcE92ZXInOlxuICAgICAgICB0aGlzLl9zZW5kQ29udGludWF0aW9uQ29tbWFuZChDT01NQU5EX1NURVBfT1ZFUik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdyZXN1bWUnOlxuICAgICAgICB0aGlzLl9zZW5kQ29udGludWF0aW9uQ29tbWFuZChDT01NQU5EX1JVTik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdzZXRQYXVzZU9uRXhjZXB0aW9ucyc6XG4gICAgICAgIGF3YWl0IHRoaXMuX3NldFBhdXNlT25FeGNlcHRpb25zKGlkLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc2V0QXN5bmNDYWxsU3RhY2tEZXB0aCc6XG4gICAgICBjYXNlICdza2lwU3RhY2tGcmFtZXMnOlxuICAgICAgICB0aGlzLnJlcGx5V2l0aEVycm9yKGlkLCAnTm90IGltcGxlbWVudGVkJyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdnZXRTY3JpcHRTb3VyY2UnOlxuICAgICAgICAvLyBUT0RPOiBIYW5kbGUgZmlsZSByZWFkIGVycm9ycy5cbiAgICAgICAgLy8gVE9ETzogSGFuZGxlIG5vbi1maWxlIHNjcmlwdElkc1xuICAgICAgICB0aGlzLnJlcGx5VG9Db21tYW5kKGlkLCB7IHNjcmlwdFNvdXJjZTogYXdhaXQgdGhpcy5fZmlsZXMuZ2V0RmlsZVNvdXJjZShwYXJhbXMuc2NyaXB0SWQpIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc2V0QnJlYWtwb2ludEJ5VXJsJzpcbiAgICAgICAgdGhpcy5fc2V0QnJlYWtwb2ludEJ5VXJsKGlkLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAncmVtb3ZlQnJlYWtwb2ludCc6XG4gICAgICAgIGF3YWl0IHRoaXMuX3JlbW92ZUJyZWFrcG9pbnQoaWQsIHBhcmFtcyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdldmFsdWF0ZU9uQ2FsbEZyYW1lJzpcbiAgICAgICAgY29uc3QgY29tcGF0UGFyYW1zID0gbWFrZUV4cHJlc3Npb25IcGhwZENvbXBhdGlibGUocGFyYW1zKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fY29ubmVjdGlvbk11bHRpcGxleGVyLmV2YWx1YXRlT25DYWxsRnJhbWUoXG4gICAgICAgICAgTnVtYmVyKGNvbXBhdFBhcmFtcy5jYWxsRnJhbWVJZCksXG4gICAgICAgICAgY29tcGF0UGFyYW1zLmV4cHJlc3Npb25cbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5yZXBseVRvQ29tbWFuZChpZCwgcmVzdWx0KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMudW5rbm93bk1ldGhvZChpZCwgbWV0aG9kLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBhc3luYyBfc2V0UGF1c2VPbkV4Y2VwdGlvbnMoaWQ6IG51bWJlciwgcGFyYW1zOiBPYmplY3QpOiBQcm9taXNlIHtcbiAgICBjb25zdCB7c3RhdGV9ID0gcGFyYW1zO1xuICAgIGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5zZXRQYXVzZU9uRXhjZXB0aW9ucyhzdGF0ZSk7XG4gICAgdGhpcy5yZXBseVRvQ29tbWFuZChpZCwge30pO1xuICB9XG5cbiAgX3NldEJyZWFrcG9pbnRCeVVybChpZDogbnVtYmVyLCBwYXJhbXM6IE9iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IHtsaW5lTnVtYmVyLCB1cmwsIGNvbHVtbk51bWJlciwgY29uZGl0aW9ufSA9IHBhcmFtcztcbiAgICBpZiAoIXVybCB8fCBjb25kaXRpb24gIT09ICcnIHx8IGNvbHVtbk51bWJlciAhPT0gMCkge1xuICAgICAgdGhpcy5yZXBseVdpdGhFcnJvcihpZCwgJ0ludmFsaWQgYXJndW1lbnRzIHRvIERlYnVnZ2VyLnNldEJyZWFrcG9pbnRCeVVybDogJ1xuICAgICAgICArIEpTT04uc3RyaW5naWZ5KHBhcmFtcykpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9maWxlcy5yZWdpc3RlckZpbGUodXJsKTtcblxuICAgIGNvbnN0IHBhdGggPSB1cmlUb1BhdGgodXJsKTtcbiAgICBjb25zdCBicmVha3BvaW50SWQgPSB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIuc2V0QnJlYWtwb2ludChwYXRoLCBsaW5lTnVtYmVyICsgMSk7XG4gICAgdGhpcy5yZXBseVRvQ29tbWFuZChpZCwge1xuICAgICAgYnJlYWtwb2ludElkOiBicmVha3BvaW50SWQsXG4gICAgICBsb2NhdGlvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGxpbmVOdW1iZXIsXG4gICAgICAgICAgc2NyaXB0SWQ6IHBhdGgsXG4gICAgICAgIH0sXG4gICAgICBdfSk7XG4gIH1cblxuICBhc3luYyBfcmVtb3ZlQnJlYWtwb2ludChpZDogbnVtYmVyLCBwYXJhbXM6IE9iamVjdCk6IFByb21pc2Uge1xuICAgIGNvbnN0IHticmVha3BvaW50SWR9ID0gcGFyYW1zO1xuICAgIGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5yZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZCk7XG4gICAgdGhpcy5yZXBseVRvQ29tbWFuZChpZCwge2lkOiBicmVha3BvaW50SWR9KTtcbiAgfVxuXG4gIF9kZWJ1Z2dlckVuYWJsZShpZDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5yZXBseVRvQ29tbWFuZChpZCwge30pO1xuICAgIHRoaXMuX3NlbmRGYWtlTG9hZGVyQnJlYWtwb2ludCgpO1xuICB9XG5cbiAgYXN5bmMgX2dldFN0YWNrRnJhbWVzKCk6IFByb21pc2U8QXJyYXk8T2JqZWN0Pj4ge1xuICAgIGNvbnN0IGZyYW1lcyA9IGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5nZXRTdGFja0ZyYW1lcygpO1xuICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIGZyYW1lcy5zdGFjay5tYXAoKGZyYW1lLCBmcmFtZUluZGV4KSA9PiB0aGlzLl9jb252ZXJ0RnJhbWUoZnJhbWUsIGZyYW1lSW5kZXgpKSk7XG4gIH1cblxuICBhc3luYyBfY29udmVydEZyYW1lKGZyYW1lOiBPYmplY3QsIGZyYW1lSW5kZXg6IG51bWJlcik6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgbG9nZ2VyLmxvZygnQ29udmVydGluZyBmcmFtZTogJyArIEpTT04uc3RyaW5naWZ5KGZyYW1lKSk7XG4gICAgY29uc3Qge1xuICAgICAgaWRPZkZyYW1lLFxuICAgICAgZnVuY3Rpb25PZkZyYW1lLFxuICAgICAgZmlsZVVybE9mRnJhbWUsXG4gICAgICBsb2NhdGlvbk9mRnJhbWUsXG4gICAgfSA9IHJlcXVpcmUoJy4vZnJhbWUnKTtcblxuICAgIHRoaXMuX2ZpbGVzLnJlZ2lzdGVyRmlsZShmaWxlVXJsT2ZGcmFtZShmcmFtZSkpO1xuICAgIHJldHVybiB7XG4gICAgICBjYWxsRnJhbWVJZDogaWRPZkZyYW1lKGZyYW1lKSxcbiAgICAgIGZ1bmN0aW9uTmFtZTogZnVuY3Rpb25PZkZyYW1lKGZyYW1lKSxcbiAgICAgIGxvY2F0aW9uOiBsb2NhdGlvbk9mRnJhbWUoZnJhbWUpLFxuICAgICAgc2NvcGVDaGFpbjogYXdhaXQgdGhpcy5fY29ubmVjdGlvbk11bHRpcGxleGVyLmdldFNjb3Blc0ZvckZyYW1lKGZyYW1lSW5kZXgpLFxuICAgIH07XG4gIH1cblxuICBfc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9oYWRGaXJzdENvbnRpbnVhdGlvbkNvbW1hbmQpIHtcbiAgICAgIHRoaXMuX2hhZEZpcnN0Q29udGludWF0aW9uQ29tbWFuZCA9IHRydWU7XG4gICAgICB0aGlzLnNlbmRNZXRob2QoJ0RlYnVnZ2VyLnJlc3VtZWQnKTtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5saXN0ZW4oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nZ2VyLmxvZygnU2VuZGluZyBjb250aW51YXRpb24gY29tbWFuZDogJyArIGNvbW1hbmQpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5zZW5kQ29udGludWF0aW9uQ29tbWFuZChjb21tYW5kKTtcbiAgfVxuXG4gIGFzeW5jIF9zZW5kQnJlYWtDb21tYW5kKGlkOiBudW1iZXIpOiBQcm9taXNlIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5zZW5kQnJlYWtDb21tYW5kKCk7XG4gICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgdGhpcy5yZXBseVdpdGhFcnJvcihpZCwgJ1VuYWJsZSB0byBicmVhaycpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9vblN0YXR1c0NoYW5nZWQoc3RhdHVzOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICBsb2dnZXIubG9nKCdTZW5kaW5nIHN0YXR1czogJyArIHN0YXR1cyk7XG4gICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgIGNhc2UgU1RBVFVTX0JSRUFLOlxuICAgICAgICBhd2FpdCB0aGlzLl9zZW5kUGF1c2VkTWVzc2FnZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX1JVTk5JTkc6XG4gICAgICAgIHRoaXMuc2VuZE1ldGhvZCgnRGVidWdnZXIucmVzdW1lZCcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX1NUT1BQRUQ6XG4gICAgICBjYXNlIFNUQVRVU19FUlJPUjpcbiAgICAgIGNhc2UgU1RBVFVTX0VORDpcbiAgICAgICAgdGhpcy5fZW5kU2Vzc2lvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX1NUQVJUSU5HOlxuICAgICAgY2FzZSBTVEFUVVNfU1RPUFBJTkc6XG4gICAgICAgIC8vIFRoZXNlIHR3byBzaG91bGQgYmUgaGlkZGVuIGJ5IHRoZSBDb25uZWN0aW9uTXVsdGlwbGV4ZXJcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsb2dnZXIubG9nRXJyb3JBbmRUaHJvdygnVW5leHBlY3RlZCBzdGF0dXM6ICcgKyBzdGF0dXMpO1xuICAgIH1cbiAgfVxuXG4gIC8vIE1heSBvbmx5IGNhbGwgd2hlbiBpbiBwYXVzZWQgc3RhdGUuXG4gIGFzeW5jIF9zZW5kUGF1c2VkTWVzc2FnZSgpOiBQcm9taXNlIHtcbiAgICB0aGlzLnNlbmRNZXRob2QoXG4gICAgICAnRGVidWdnZXIucGF1c2VkJyxcbiAgICAgIHtcbiAgICAgICAgY2FsbEZyYW1lczogYXdhaXQgdGhpcy5fZ2V0U3RhY2tGcmFtZXMoKSxcbiAgICAgICAgcmVhc29uOiAnYnJlYWtwb2ludCcsIC8vIFRPRE86IGJldHRlciByZWFzb24/XG4gICAgICAgIGRhdGE6IHt9LFxuICAgICAgfSk7XG4gIH1cblxuICBfc2VuZEZha2VMb2FkZXJCcmVha3BvaW50KCk6IHZvaWQge1xuICAgIHRoaXMuc2VuZE1ldGhvZChcbiAgICAgICdEZWJ1Z2dlci5wYXVzZWQnLFxuICAgICAge1xuICAgICAgICBjYWxsRnJhbWVzOiBbXSxcbiAgICAgICAgcmVhc29uOiAnYnJlYWtwb2ludCcsIC8vIFRPRE86IGJldHRlciByZWFzb24/XG4gICAgICAgIGRhdGE6IHt9LFxuICAgICAgfSk7XG4gIH1cblxuICBfZW5kU2Vzc2lvbigpOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKCdEZWJ1Z2dlckhhbmRsZXI6IEVuZGluZyBzZXNzaW9uJyk7XG4gICAgaWYgKHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fc3RhdHVzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChTRVNTSU9OX0VORF9FVkVOVCk7XG4gIH1cbn1cbiJdfQ==