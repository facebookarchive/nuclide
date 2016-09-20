Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _settings2;

function _settings() {
  return _settings2 = require('./settings');
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var _utils4;

function _utils3() {
  return _utils4 = _interopRequireDefault(require('./utils'));
}

var _helpers2;

function _helpers() {
  return _helpers2 = require('./helpers');
}

var _Handler2;

function _Handler() {
  return _Handler2 = _interopRequireDefault(require('./Handler'));
}

var _frame2;

function _frame() {
  return _frame2 = require('./frame');
}

var _DbgpSocket2;

function _DbgpSocket() {
  return _DbgpSocket2 = require('./DbgpSocket');
}

var _ConnectionMultiplexerJs2;

function _ConnectionMultiplexerJs() {
  return _ConnectionMultiplexerJs2 = require('./ConnectionMultiplexer.js');
}

var _FileCache2;

function _FileCache() {
  return _FileCache2 = _interopRequireDefault(require('./FileCache'));
}

var _events2;

function _events() {
  return _events2 = _interopRequireDefault(require('events'));
}

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var SESSION_END_EVENT = 'session-end-event';

// Handles all 'Debug.*' Chrome dev tools messages

var DebuggerHandler = (function (_default) {
  _inherits(DebuggerHandler, _default);

  function DebuggerHandler(clientCallback, connectionMultiplexer) {
    _classCallCheck(this, DebuggerHandler);

    _get(Object.getPrototypeOf(DebuggerHandler.prototype), 'constructor', this).call(this, 'Debugger', clientCallback);

    this._hadFirstContinuationCommand = false;
    this._connectionMultiplexer = connectionMultiplexer;
    this._files = new (_FileCache2 || _FileCache()).default(clientCallback);
    this._emitter = new (_events2 || _events()).default();
    this._subscriptions = new (_eventKit2 || _eventKit()).CompositeDisposable(this._connectionMultiplexer.onStatus(this._onStatusChanged.bind(this)), this._connectionMultiplexer.onNotification(this._onNotification.bind(this)));
  }

  _createClass(DebuggerHandler, [{
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      (_utils4 || _utils3()).default.log('onSessionEnd');
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
          this._pause();
          break;

        case 'stepInto':
          this._sendContinuationCommand((_DbgpSocket2 || _DbgpSocket()).COMMAND_STEP_INTO);
          break;

        case 'stepOut':
          this._sendContinuationCommand((_DbgpSocket2 || _DbgpSocket()).COMMAND_STEP_OUT);
          break;

        case 'stepOver':
          this._sendContinuationCommand((_DbgpSocket2 || _DbgpSocket()).COMMAND_STEP_OVER);
          break;

        case 'resume':
          this._resume();
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
          var compatParams = (0, (_utils2 || _utils()).makeExpressionHphpdCompatible)(params);
          var result = yield this._connectionMultiplexer.evaluateOnCallFrame(Number(compatParams.callFrameId), compatParams.expression);
          this.replyToCommand(id, result);
          break;

        case 'selectThread':
          this._selectThread(params);
          break;

        case 'setDebuggerSettings':
          (0, (_settings2 || _settings()).updateSettings)(params);
          break;

        default:
          this.unknownMethod(id, method, params);
          break;
      }
    })
  }, {
    key: '_selectThread',
    value: _asyncToGenerator(function* (params) {
      var threadId = params.threadId;

      yield this._connectionMultiplexer.selectThread(threadId);
      this._sendPausedMessage();
    })
  }, {
    key: '_setPauseOnExceptions',
    value: _asyncToGenerator(function* (id, params) {
      var state = params.state;

      yield this._connectionMultiplexer.getBreakpointStore().setPauseOnExceptions(String(id), state);
      this.replyToCommand(id, {});
    })
  }, {
    key: '_setBreakpointByUrl',
    value: _asyncToGenerator(function* (id, params) {
      var lineNumber = params.lineNumber;
      var url = params.url;
      var columnNumber = params.columnNumber;
      var condition = params.condition;

      if (!url || columnNumber !== 0) {
        this.replyWithError(id, 'Invalid arguments to Debugger.setBreakpointByUrl: ' + JSON.stringify(params));
        return;
      }
      this._files.registerFile(url);

      var path = (0, (_helpers2 || _helpers()).uriToPath)(url);
      var breakpointStore = this._connectionMultiplexer.getBreakpointStore();
      // Chrome lineNumber is 0-based while xdebug lineno is 1-based.
      var breakpointId = yield breakpointStore.setFileLineBreakpoint(String(id), path, lineNumber + 1, condition);
      var breakpoint = yield breakpointStore.getBreakpoint(breakpointId);
      (0, (_assert2 || _assert()).default)(breakpoint != null);
      this.replyToCommand(id, {
        breakpointId: breakpointId,
        resolved: breakpoint.resolved,
        locations: [(0, (_helpers2 || _helpers()).getBreakpointLocation)(breakpoint)]
      });
    })
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
    key: '_getTopFrameForConnection',
    value: _asyncToGenerator(function* (id) {
      var frames = yield this._connectionMultiplexer.getConnectionStackFrames(id);
      return yield this._convertFrame(frames.stack[0], 0);
    })
  }, {
    key: '_convertFrame',
    value: _asyncToGenerator(function* (frame, frameIndex) {
      (_utils4 || _utils3()).default.log('Converting frame: ' + JSON.stringify(frame));
      var file = this._files.registerFile((0, (_frame2 || _frame()).fileUrlOfFrame)(frame));
      var location = (0, (_frame2 || _frame()).locationOfFrame)(frame);
      var hasSource = yield file.hasSource();
      if (!hasSource) {
        location.scriptId = '';
      }
      return {
        callFrameId: (0, (_frame2 || _frame()).idOfFrame)(frame),
        functionName: (0, (_frame2 || _frame()).functionOfFrame)(frame),
        location: location,
        scopeChain: yield this._connectionMultiplexer.getScopesForFrame(frameIndex)
      };
    })
  }, {
    key: '_sendContinuationCommand',
    value: function _sendContinuationCommand(command) {
      (_utils4 || _utils3()).default.log('Sending continuation command: ' + command);
      this._connectionMultiplexer.sendContinuationCommand(command);
    }
  }, {
    key: '_pause',
    value: function _pause() {
      this._connectionMultiplexer.pause();
    }
  }, {
    key: '_resume',
    value: function _resume() {
      if (!this._hadFirstContinuationCommand) {
        this._hadFirstContinuationCommand = true;
        this.sendMethod('Debugger.resumed');
        this._connectionMultiplexer.listen();
        return;
      }
      this._connectionMultiplexer.resume();
    }
  }, {
    key: '_onStatusChanged',
    value: _asyncToGenerator(function* (status, params) {
      (_utils4 || _utils3()).default.log('Sending status: ' + status);
      switch (status) {
        case (_ConnectionMultiplexerJs2 || _ConnectionMultiplexerJs()).MULTIPLEXER_STATUS.ALL_CONNECTIONS_BREAK:
        case (_ConnectionMultiplexerJs2 || _ConnectionMultiplexerJs()).MULTIPLEXER_STATUS.BREAK:
          yield this._sendPausedMessage();
          break;
        case (_ConnectionMultiplexerJs2 || _ConnectionMultiplexerJs()).MULTIPLEXER_STATUS.RUNNING:
          this.sendMethod('Debugger.resumed');
          break;
        case (_ConnectionMultiplexerJs2 || _ConnectionMultiplexerJs()).MULTIPLEXER_STATUS.END:
          this._endSession();
          break;
        default:
          (_utils4 || _utils3()).default.logErrorAndThrow('Unexpected status: ' + status);
      }
    })
  }, {
    key: '_onNotification',
    value: _asyncToGenerator(function* (notifyName, params) {
      switch (notifyName) {
        case (_DbgpSocket2 || _DbgpSocket()).BREAKPOINT_RESOLVED_NOTIFICATION:
          (0, (_assert2 || _assert()).default)(params);
          var breakpoint = params;
          this.sendMethod('Debugger.breakpointResolved', {
            breakpointId: breakpoint.chromeId,
            location: (0, (_helpers2 || _helpers()).getBreakpointLocation)(breakpoint)
          });
          break;
        case (_ConnectionMultiplexerJs2 || _ConnectionMultiplexerJs()).CONNECTION_MUX_NOTIFICATION.REQUEST_UPDATE:
          (0, (_assert2 || _assert()).default)(params);
          var frame = params.status === (_DbgpSocket2 || _DbgpSocket()).CONNECTION_STATUS.BREAK ? (yield this._getTopFrameForConnection(params.id)) : null;
          this.sendMethod('Debugger.threadUpdated', {
            thread: {
              id: String(params.id),
              name: String(params.id),
              address: frame != null ? frame.functionName : 'N/A',
              location: frame != null ? frame.location : null,
              hasSource: true,
              stopReason: params.stopReason,
              description: 'N/A'
            }
          });
          break;
        default:
          (_utils4 || _utils3()).default.logErrorAndThrow('Unexpected notification: ' + notifyName);
      }
    })

    // May only call when in paused state.
  }, {
    key: '_sendPausedMessage',
    value: _asyncToGenerator(function* () {
      var requestSwitchMessage = this._connectionMultiplexer.getRequestSwitchMessage();
      this._connectionMultiplexer.resetRequestSwitchMessage();
      if (requestSwitchMessage != null) {
        this.sendUserMessage('outputWindow', {
          level: 'info',
          text: requestSwitchMessage
        });
      }
      this.sendMethod('Debugger.paused', {
        callFrames: yield this._getStackFrames(),
        reason: 'breakpoint', // TODO: better reason?
        threadSwitchMessage: requestSwitchMessage,
        data: {},
        stopThreadId: this._connectionMultiplexer.getEnabledConnectionId()
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
      (_utils4 || _utils3()).default.log('DebuggerHandler: Ending session');
      this._subscriptions.dispose();
      this._emitter.emit(SESSION_END_EVENT);
    }
  }]);

  return DebuggerHandler;
})((_Handler2 || _Handler()).default);

exports.DebuggerHandler = DebuggerHandler;