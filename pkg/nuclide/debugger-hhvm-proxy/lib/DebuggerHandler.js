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
//# sourceMappingURL=data:application/json;base64,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SSxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDdkM7OztTQWpPVSxlQUFlIiwiZmlsZSI6IkRlYnVnZ2VySGFuZGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblxuaW1wb3J0IHttYWtlRXhwcmVzc2lvbkhwaHBkQ29tcGF0aWJsZX0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHt1cmlUb1BhdGh9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQgSGFuZGxlciBmcm9tICcuL0hhbmRsZXInO1xuaW1wb3J0IHtcbiAgU1RBVFVTX1NUQVJUSU5HLFxuICBTVEFUVVNfU1RPUFBJTkcsXG4gIFNUQVRVU19TVE9QUEVELFxuICBTVEFUVVNfUlVOTklORyxcbiAgU1RBVFVTX0JSRUFLLFxuICBTVEFUVVNfRVJST1IsXG4gIFNUQVRVU19FTkQsXG4gIENPTU1BTkRfUlVOLFxuICBDT01NQU5EX1NURVBfSU5UTyxcbiAgQ09NTUFORF9TVEVQX09WRVIsXG4gIENPTU1BTkRfU1RFUF9PVVQsXG59IGZyb20gJy4vRGJncFNvY2tldCc7XG5cbmltcG9ydCBGaWxlQ2FjaGUgZnJvbSAnLi9GaWxlQ2FjaGUnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5cbmltcG9ydCB0eXBlIHtDb25uZWN0aW9uTXVsdGlwbGV4ZXJ9IGZyb20gJy4vQ29ubmVjdGlvbk11bHRpcGxleGVyJztcbmltcG9ydCB0eXBlIHtDbGllbnRDYWxsYmFja30gZnJvbSAnLi9DbGllbnRDYWxsYmFjayc7XG5cbmNvbnN0IFNFU1NJT05fRU5EX0VWRU5UID0gJ3Nlc3Npb24tZW5kLWV2ZW50JztcblxuLy8gSGFuZGxlcyBhbGwgJ0RlYnVnLionIENocm9tZSBkZXYgdG9vbHMgbWVzc2FnZXNcbmV4cG9ydCBjbGFzcyBEZWJ1Z2dlckhhbmRsZXIgZXh0ZW5kcyBIYW5kbGVyIHtcbiAgX2Nvbm5lY3Rpb25NdWx0aXBsZXhlcjogQ29ubmVjdGlvbk11bHRpcGxleGVyO1xuICBfZmlsZXM6IEZpbGVDYWNoZTtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX3N0YXR1c1N1YnNjcmlwdGlvbjogP2F0b20kRGlzcG9zYWJsZTtcbiAgX2hhZEZpcnN0Q29udGludWF0aW9uQ29tbWFuZDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBjbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2ssXG4gICAgY29ubmVjdGlvbk11bHRpcGxleGVyOiBDb25uZWN0aW9uTXVsdGlwbGV4ZXJcbiAgKSB7XG4gICAgc3VwZXIoJ0RlYnVnZ2VyJywgY2xpZW50Q2FsbGJhY2spO1xuXG4gICAgdGhpcy5faGFkRmlyc3RDb250aW51YXRpb25Db21tYW5kID0gZmFsc2U7XG4gICAgdGhpcy5fY29ubmVjdGlvbk11bHRpcGxleGVyID0gY29ubmVjdGlvbk11bHRpcGxleGVyO1xuICAgIHRoaXMuX2ZpbGVzID0gbmV3IEZpbGVDYWNoZShjbGllbnRDYWxsYmFjayk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdGF0dXNTdWJzY3JpcHRpb24gPSB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIub25TdGF0dXMoXG4gICAgICB0aGlzLl9vblN0YXR1c0NoYW5nZWQuYmluZCh0aGlzKVxuICAgICk7XG4gIH1cblxuICBvblNlc3Npb25FbmQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKCdvblNlc3Npb25FbmQnKTtcbiAgICB0aGlzLl9lbWl0dGVyLm9uKFNFU1NJT05fRU5EX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBhc3luYyBoYW5kbGVNZXRob2QoaWQ6IG51bWJlciwgbWV0aG9kOiBzdHJpbmcsIHBhcmFtczogT2JqZWN0KTogUHJvbWlzZSB7XG5cbiAgICBzd2l0Y2ggKG1ldGhvZCkge1xuXG4gICAgICAvLyBUT0RPOiBBZGQgQ29uc29sZSAoYWthIGxvZ2dpbmcpIHN1cHBvcnRcbiAgICAgIGNhc2UgJ2VuYWJsZSc6XG4gICAgICAgIHRoaXMuX2RlYnVnZ2VyRW5hYmxlKGlkKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3BhdXNlJzpcbiAgICAgICAgYXdhaXQgdGhpcy5fc2VuZEJyZWFrQ29tbWFuZChpZCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdzdGVwSW50byc6XG4gICAgICAgIHRoaXMuX3NlbmRDb250aW51YXRpb25Db21tYW5kKENPTU1BTkRfU1RFUF9JTlRPKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3N0ZXBPdXQnOlxuICAgICAgICB0aGlzLl9zZW5kQ29udGludWF0aW9uQ29tbWFuZChDT01NQU5EX1NURVBfT1VUKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3N0ZXBPdmVyJzpcbiAgICAgICAgdGhpcy5fc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9TVEVQX09WRVIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAncmVzdW1lJzpcbiAgICAgICAgdGhpcy5fc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoQ09NTUFORF9SVU4pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc2V0UGF1c2VPbkV4Y2VwdGlvbnMnOlxuICAgICAgICBhd2FpdCB0aGlzLl9zZXRQYXVzZU9uRXhjZXB0aW9ucyhpZCwgcGFyYW1zKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3NldEFzeW5jQ2FsbFN0YWNrRGVwdGgnOlxuICAgICAgY2FzZSAnc2tpcFN0YWNrRnJhbWVzJzpcbiAgICAgICAgdGhpcy5yZXBseVdpdGhFcnJvcihpZCwgJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZ2V0U2NyaXB0U291cmNlJzpcbiAgICAgICAgLy8gVE9ETzogSGFuZGxlIGZpbGUgcmVhZCBlcnJvcnMuXG4gICAgICAgIC8vIFRPRE86IEhhbmRsZSBub24tZmlsZSBzY3JpcHRJZHNcbiAgICAgICAgdGhpcy5yZXBseVRvQ29tbWFuZChpZCwgeyBzY3JpcHRTb3VyY2U6IGF3YWl0IHRoaXMuX2ZpbGVzLmdldEZpbGVTb3VyY2UocGFyYW1zLnNjcmlwdElkKSB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3NldEJyZWFrcG9pbnRCeVVybCc6XG4gICAgICAgIHRoaXMuX3NldEJyZWFrcG9pbnRCeVVybChpZCwgcGFyYW1zKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3JlbW92ZUJyZWFrcG9pbnQnOlxuICAgICAgICBhd2FpdCB0aGlzLl9yZW1vdmVCcmVha3BvaW50KGlkLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZXZhbHVhdGVPbkNhbGxGcmFtZSc6XG4gICAgICAgIGNvbnN0IGNvbXBhdFBhcmFtcyA9IG1ha2VFeHByZXNzaW9uSHBocGRDb21wYXRpYmxlKHBhcmFtcyk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5ldmFsdWF0ZU9uQ2FsbEZyYW1lKFxuICAgICAgICAgIE51bWJlcihjb21wYXRQYXJhbXMuY2FsbEZyYW1lSWQpLFxuICAgICAgICAgIGNvbXBhdFBhcmFtcy5leHByZXNzaW9uXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMucmVwbHlUb0NvbW1hbmQoaWQsIHJlc3VsdCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLnVua25vd25NZXRob2QoaWQsIG1ldGhvZCwgcGFyYW1zKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3NldFBhdXNlT25FeGNlcHRpb25zKGlkOiBudW1iZXIsIHBhcmFtczogT2JqZWN0KTogUHJvbWlzZSB7XG4gICAgY29uc3Qge3N0YXRlfSA9IHBhcmFtcztcbiAgICBhd2FpdCB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIuc2V0UGF1c2VPbkV4Y2VwdGlvbnMoc3RhdGUpO1xuICAgIHRoaXMucmVwbHlUb0NvbW1hbmQoaWQsIHt9KTtcbiAgfVxuXG4gIF9zZXRCcmVha3BvaW50QnlVcmwoaWQ6IG51bWJlciwgcGFyYW1zOiBPYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCB7bGluZU51bWJlciwgdXJsLCBjb2x1bW5OdW1iZXIsIGNvbmRpdGlvbn0gPSBwYXJhbXM7XG4gICAgaWYgKCF1cmwgfHwgY29uZGl0aW9uICE9PSAnJyB8fCBjb2x1bW5OdW1iZXIgIT09IDApIHtcbiAgICAgIHRoaXMucmVwbHlXaXRoRXJyb3IoaWQsICdJbnZhbGlkIGFyZ3VtZW50cyB0byBEZWJ1Z2dlci5zZXRCcmVha3BvaW50QnlVcmw6ICdcbiAgICAgICAgKyBKU09OLnN0cmluZ2lmeShwYXJhbXMpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fZmlsZXMucmVnaXN0ZXJGaWxlKHVybCk7XG5cbiAgICBjb25zdCBwYXRoID0gdXJpVG9QYXRoKHVybCk7XG4gICAgY29uc3QgYnJlYWtwb2ludElkID0gdGhpcy5fY29ubmVjdGlvbk11bHRpcGxleGVyLnNldEJyZWFrcG9pbnQocGF0aCwgbGluZU51bWJlciArIDEpO1xuICAgIHRoaXMucmVwbHlUb0NvbW1hbmQoaWQsIHtcbiAgICAgIGJyZWFrcG9pbnRJZDogYnJlYWtwb2ludElkLFxuICAgICAgbG9jYXRpb25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBsaW5lTnVtYmVyLFxuICAgICAgICAgIHNjcmlwdElkOiBwYXRoLFxuICAgICAgICB9LFxuICAgICAgXX0pO1xuICB9XG5cbiAgYXN5bmMgX3JlbW92ZUJyZWFrcG9pbnQoaWQ6IG51bWJlciwgcGFyYW1zOiBPYmplY3QpOiBQcm9taXNlIHtcbiAgICBjb25zdCB7YnJlYWtwb2ludElkfSA9IHBhcmFtcztcbiAgICBhd2FpdCB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIucmVtb3ZlQnJlYWtwb2ludChicmVha3BvaW50SWQpO1xuICAgIHRoaXMucmVwbHlUb0NvbW1hbmQoaWQsIHtpZDogYnJlYWtwb2ludElkfSk7XG4gIH1cblxuICBfZGVidWdnZXJFbmFibGUoaWQ6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMucmVwbHlUb0NvbW1hbmQoaWQsIHt9KTtcbiAgICB0aGlzLl9zZW5kRmFrZUxvYWRlckJyZWFrcG9pbnQoKTtcbiAgfVxuXG4gIGFzeW5jIF9nZXRTdGFja0ZyYW1lcygpOiBQcm9taXNlPEFycmF5PE9iamVjdD4+IHtcbiAgICBjb25zdCBmcmFtZXMgPSBhd2FpdCB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIuZ2V0U3RhY2tGcmFtZXMoKTtcbiAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICBmcmFtZXMuc3RhY2subWFwKChmcmFtZSwgZnJhbWVJbmRleCkgPT4gdGhpcy5fY29udmVydEZyYW1lKGZyYW1lLCBmcmFtZUluZGV4KSkpO1xuICB9XG5cbiAgYXN5bmMgX2NvbnZlcnRGcmFtZShmcmFtZTogT2JqZWN0LCBmcmFtZUluZGV4OiBudW1iZXIpOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIGxvZ2dlci5sb2coJ0NvbnZlcnRpbmcgZnJhbWU6ICcgKyBKU09OLnN0cmluZ2lmeShmcmFtZSkpO1xuICAgIGNvbnN0IHtcbiAgICAgIGlkT2ZGcmFtZSxcbiAgICAgIGZ1bmN0aW9uT2ZGcmFtZSxcbiAgICAgIGZpbGVVcmxPZkZyYW1lLFxuICAgICAgbG9jYXRpb25PZkZyYW1lLFxuICAgIH0gPSByZXF1aXJlKCcuL2ZyYW1lJyk7XG5cbiAgICB0aGlzLl9maWxlcy5yZWdpc3RlckZpbGUoZmlsZVVybE9mRnJhbWUoZnJhbWUpKTtcbiAgICByZXR1cm4ge1xuICAgICAgY2FsbEZyYW1lSWQ6IGlkT2ZGcmFtZShmcmFtZSksXG4gICAgICBmdW5jdGlvbk5hbWU6IGZ1bmN0aW9uT2ZGcmFtZShmcmFtZSksXG4gICAgICBsb2NhdGlvbjogbG9jYXRpb25PZkZyYW1lKGZyYW1lKSxcbiAgICAgIHNjb3BlQ2hhaW46IGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5nZXRTY29wZXNGb3JGcmFtZShmcmFtZUluZGV4KSxcbiAgICB9O1xuICB9XG5cbiAgX3NlbmRDb250aW51YXRpb25Db21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faGFkRmlyc3RDb250aW51YXRpb25Db21tYW5kKSB7XG4gICAgICB0aGlzLl9oYWRGaXJzdENvbnRpbnVhdGlvbkNvbW1hbmQgPSB0cnVlO1xuICAgICAgdGhpcy5zZW5kTWV0aG9kKCdEZWJ1Z2dlci5yZXN1bWVkJyk7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIubGlzdGVuKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvZ2dlci5sb2coJ1NlbmRpbmcgY29udGludWF0aW9uIGNvbW1hbmQ6ICcgKyBjb21tYW5kKTtcbiAgICB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIuc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoY29tbWFuZCk7XG4gIH1cblxuICBhc3luYyBfc2VuZEJyZWFrQ29tbWFuZChpZDogbnVtYmVyKTogUHJvbWlzZSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIuc2VuZEJyZWFrQ29tbWFuZCgpO1xuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgIHRoaXMucmVwbHlXaXRoRXJyb3IoaWQsICdVbmFibGUgdG8gYnJlYWsnKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfb25TdGF0dXNDaGFuZ2VkKHN0YXR1czogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgbG9nZ2VyLmxvZygnU2VuZGluZyBzdGF0dXM6ICcgKyBzdGF0dXMpO1xuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICBjYXNlIFNUQVRVU19CUkVBSzpcbiAgICAgICAgYXdhaXQgdGhpcy5fc2VuZFBhdXNlZE1lc3NhZ2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFNUQVRVU19SVU5OSU5HOlxuICAgICAgICB0aGlzLnNlbmRNZXRob2QoJ0RlYnVnZ2VyLnJlc3VtZWQnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFNUQVRVU19TVE9QUEVEOlxuICAgICAgY2FzZSBTVEFUVVNfRVJST1I6XG4gICAgICBjYXNlIFNUQVRVU19FTkQ6XG4gICAgICAgIHRoaXMuX2VuZFNlc3Npb24oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFNUQVRVU19TVEFSVElORzpcbiAgICAgIGNhc2UgU1RBVFVTX1NUT1BQSU5HOlxuICAgICAgICAvLyBUaGVzZSB0d28gc2hvdWxkIGJlIGhpZGRlbiBieSB0aGUgQ29ubmVjdGlvbk11bHRpcGxleGVyXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yQW5kVGhyb3coJ1VuZXhwZWN0ZWQgc3RhdHVzOiAnICsgc3RhdHVzKTtcbiAgICB9XG4gIH1cblxuICAvLyBNYXkgb25seSBjYWxsIHdoZW4gaW4gcGF1c2VkIHN0YXRlLlxuICBhc3luYyBfc2VuZFBhdXNlZE1lc3NhZ2UoKTogUHJvbWlzZSB7XG4gICAgdGhpcy5zZW5kTWV0aG9kKFxuICAgICAgJ0RlYnVnZ2VyLnBhdXNlZCcsXG4gICAgICB7XG4gICAgICAgIGNhbGxGcmFtZXM6IGF3YWl0IHRoaXMuX2dldFN0YWNrRnJhbWVzKCksXG4gICAgICAgIHJlYXNvbjogJ2JyZWFrcG9pbnQnLCAvLyBUT0RPOiBiZXR0ZXIgcmVhc29uP1xuICAgICAgICBkYXRhOiB7fSxcbiAgICAgIH0pO1xuICB9XG5cbiAgX3NlbmRGYWtlTG9hZGVyQnJlYWtwb2ludCgpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmRNZXRob2QoXG4gICAgICAnRGVidWdnZXIucGF1c2VkJyxcbiAgICAgIHtcbiAgICAgICAgY2FsbEZyYW1lczogW10sXG4gICAgICAgIHJlYXNvbjogJ2JyZWFrcG9pbnQnLCAvLyBUT0RPOiBiZXR0ZXIgcmVhc29uP1xuICAgICAgICBkYXRhOiB7fSxcbiAgICAgIH0pO1xuICB9XG5cbiAgX2VuZFNlc3Npb24oKTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZygnRGVidWdnZXJIYW5kbGVyOiBFbmRpbmcgc2Vzc2lvbicpO1xuICAgIGlmICh0aGlzLl9zdGF0dXNTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9zdGF0dXNTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoU0VTU0lPTl9FTkRfRVZFTlQpO1xuICB9XG59XG4iXX0=