'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerHandler = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _settings;

function _load_settings() {
  return _settings = require('./settings');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _utils2;

function _load_utils2() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var _helpers;

function _load_helpers() {
  return _helpers = require('./helpers');
}

var _Handler;

function _load_Handler() {
  return _Handler = _interopRequireDefault(require('./Handler'));
}

var _frame;

function _load_frame() {
  return _frame = require('./frame');
}

var _DbgpSocket;

function _load_DbgpSocket() {
  return _DbgpSocket = require('./DbgpSocket');
}

var _ConnectionMultiplexer;

function _load_ConnectionMultiplexer() {
  return _ConnectionMultiplexer = require('./ConnectionMultiplexer.js');
}

var _FileCache;

function _load_FileCache() {
  return _FileCache = _interopRequireDefault(require('./FileCache'));
}

var _events = _interopRequireDefault(require('events'));

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SESSION_END_EVENT = 'session-end-event';

// Handles all 'Debug.*' Chrome dev tools messages
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class DebuggerHandler extends (_Handler || _load_Handler()).default {

  constructor(clientCallback, connectionMultiplexer) {
    super('Debugger', clientCallback);

    this._hadFirstContinuationCommand = false;
    this._connectionMultiplexer = connectionMultiplexer;
    this._files = new (_FileCache || _load_FileCache()).default(clientCallback);
    this._emitter = new _events.default();
    this._subscriptions = new (_eventKit || _load_eventKit()).CompositeDisposable(this._connectionMultiplexer.onStatus(this._onStatusChanged.bind(this)), this._connectionMultiplexer.onNotification(this._onNotification.bind(this)));
  }

  onSessionEnd(callback) {
    (_utils2 || _load_utils2()).default.log('onSessionEnd');
    this._emitter.on(SESSION_END_EVENT, callback);
  }

  handleMethod(id, method, params) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      switch (method) {
        // TODO: Add Console (aka logging) support
        case 'enable':
          _this._debuggerEnable(id);
          break;

        case 'pause':
          _this._pause();
          break;

        case 'stepInto':
          _this._sendContinuationCommand((_DbgpSocket || _load_DbgpSocket()).COMMAND_STEP_INTO);
          break;

        case 'stepOut':
          _this._sendContinuationCommand((_DbgpSocket || _load_DbgpSocket()).COMMAND_STEP_OUT);
          break;

        case 'stepOver':
          _this._sendContinuationCommand((_DbgpSocket || _load_DbgpSocket()).COMMAND_STEP_OVER);
          break;

        case 'resume':
          _this._resume();
          break;

        case 'setPauseOnExceptions':
          yield _this._setPauseOnExceptions(id, params);
          break;

        case 'setAsyncCallStackDepth':
        case 'skipStackFrames':
          _this.replyWithError(id, 'Not implemented');
          break;

        case 'getScriptSource':
          // TODO: Handle file read errors.
          // TODO: Handle non-file scriptIds
          _this.replyToCommand(id, { scriptSource: yield _this._files.getFileSource(params.scriptId) });
          break;

        case 'setBreakpointByUrl':
          _this._setBreakpointByUrl(id, params);
          break;

        case 'removeBreakpoint':
          yield _this._removeBreakpoint(id, params);
          break;

        case 'evaluateOnCallFrame':
          const compatParams = (0, (_utils || _load_utils()).makeExpressionHphpdCompatible)(params);
          const result = yield _this._connectionMultiplexer.evaluateOnCallFrame(Number(compatParams.callFrameId), compatParams.expression);
          _this.replyToCommand(id, result);
          break;

        case 'selectThread':
          _this._selectThread(params);
          break;

        case 'setDebuggerSettings':
          (0, (_settings || _load_settings()).updateSettings)(params);
          break;

        default:
          _this.unknownMethod(id, method, params);
          break;
      }
    })();
  }

  _selectThread(params) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { threadId } = params;
      yield _this2._connectionMultiplexer.selectThread(threadId);
      _this2._sendPausedMessage();
    })();
  }

  _setPauseOnExceptions(id, params) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { state } = params;
      yield _this3._connectionMultiplexer.getBreakpointStore().setPauseOnExceptions(String(id), state);
      _this3.replyToCommand(id, {});
    })();
  }

  _setBreakpointByUrl(id, params) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { lineNumber, url, columnNumber, condition } = params;
      if (!url || columnNumber !== 0) {
        _this4.replyWithError(id, 'Invalid arguments to Debugger.setBreakpointByUrl: ' + JSON.stringify(params));
        return;
      }
      _this4._files.registerFile(url);

      const path = (0, (_helpers || _load_helpers()).uriToPath)(url);
      const breakpointStore = _this4._connectionMultiplexer.getBreakpointStore();
      // Chrome lineNumber is 0-based while xdebug lineno is 1-based.
      const breakpointId = yield breakpointStore.setFileLineBreakpoint(String(id), path, lineNumber + 1, condition);
      const breakpoint = yield breakpointStore.getBreakpoint(breakpointId);

      if (!(breakpoint != null)) {
        throw new Error('Invariant violation: "breakpoint != null"');
      }

      _this4.replyToCommand(id, {
        breakpointId,
        resolved: breakpoint.resolved,
        locations: [(0, (_helpers || _load_helpers()).getBreakpointLocation)(breakpoint)]
      });
    })();
  }

  _removeBreakpoint(id, params) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { breakpointId } = params;
      yield _this5._connectionMultiplexer.removeBreakpoint(breakpointId);
      _this5.replyToCommand(id, { id: breakpointId });
    })();
  }

  _debuggerEnable(id) {
    this.replyToCommand(id, {});
    this._sendFakeLoaderBreakpoint();
  }

  _getStackFrames() {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const frames = yield _this6._connectionMultiplexer.getStackFrames();
      return Promise.all(frames.stack.map(function (frame, frameIndex) {
        return _this6._convertFrame(frame, frameIndex);
      }));
    })();
  }

  _getTopFrameForConnection(id) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const frames = yield _this7._connectionMultiplexer.getConnectionStackFrames(id);
      return _this7._convertFrame(frames.stack[0], 0);
    })();
  }

  _convertFrame(frame, frameIndex) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      (_utils2 || _load_utils2()).default.log('Converting frame: ' + JSON.stringify(frame));
      const file = _this8._files.registerFile((0, (_frame || _load_frame()).fileUrlOfFrame)(frame));
      const location = (0, (_frame || _load_frame()).locationOfFrame)(frame);
      const hasSource = yield file.hasSource();
      if (!hasSource) {
        location.scriptId = '';
      }
      return {
        callFrameId: (0, (_frame || _load_frame()).idOfFrame)(frame),
        functionName: (0, (_frame || _load_frame()).functionOfFrame)(frame),
        location,
        scopeChain: yield _this8._connectionMultiplexer.getScopesForFrame(frameIndex)
      };
    })();
  }

  _sendContinuationCommand(command) {
    (_utils2 || _load_utils2()).default.log('Sending continuation command: ' + command);
    this._connectionMultiplexer.sendContinuationCommand(command);
  }

  _pause() {
    this._connectionMultiplexer.pause();
  }

  _resume() {
    if (!this._hadFirstContinuationCommand) {
      this._hadFirstContinuationCommand = true;
      this.sendMethod('Debugger.resumed');
      this._connectionMultiplexer.listen();
      return;
    }
    this._connectionMultiplexer.resume();
  }

  _onStatusChanged(status, params) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      (_utils2 || _load_utils2()).default.log('Sending status: ' + status);
      switch (status) {
        case (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexerStatus.AllConnectionsPaused:
        case (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexerStatus.SingleConnectionPaused:
          yield _this9._sendPausedMessage();
          break;
        case (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexerStatus.Running:
          _this9.sendMethod('Debugger.resumed');
          break;
        case (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexerStatus.End:
          _this9._endSession();
          break;
        default:
          (_utils2 || _load_utils2()).default.logErrorAndThrow('Unexpected status: ' + status);
      }
    })();
  }

  _onNotification(notifyName, params) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      switch (notifyName) {
        case (_DbgpSocket || _load_DbgpSocket()).BREAKPOINT_RESOLVED_NOTIFICATION:
          if (!params) {
            throw new Error('Invariant violation: "params"');
          }

          const breakpoint = params;
          _this10.sendMethod('Debugger.breakpointResolved', {
            breakpointId: breakpoint.chromeId,
            location: (0, (_helpers || _load_helpers()).getBreakpointLocation)(breakpoint)
          });
          break;
        case (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexerNotification.RequestUpdate:
          if (!params) {
            throw new Error('Invariant violation: "params"');
          }

          const frame = params.status === (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Break ? yield _this10._getTopFrameForConnection(params.id) : null;
          _this10.sendMethod('Debugger.threadUpdated', {
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
          (_utils2 || _load_utils2()).default.logErrorAndThrow(`Unexpected notification: ${notifyName}`);
      }
    })();
  }

  // May only call when in paused state.
  _sendPausedMessage() {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const requestSwitchMessage = _this11._connectionMultiplexer.getRequestSwitchMessage();
      _this11._connectionMultiplexer.resetRequestSwitchMessage();
      if (requestSwitchMessage != null) {
        _this11.sendUserMessage('outputWindow', {
          level: 'info',
          text: requestSwitchMessage
        });
      }
      _this11.sendMethod('Debugger.paused', {
        callFrames: yield _this11._getStackFrames(),
        reason: 'breakpoint', // TODO: better reason?
        threadSwitchMessage: requestSwitchMessage,
        data: {},
        stopThreadId: _this11._connectionMultiplexer.getEnabledConnectionId()
      });
    })();
  }

  _sendFakeLoaderBreakpoint() {
    this.sendMethod('Debugger.paused', {
      callFrames: [],
      reason: 'breakpoint', // TODO: better reason?
      data: {}
    });
  }

  _endSession() {
    (_utils2 || _load_utils2()).default.log('DebuggerHandler: Ending session');
    this._subscriptions.dispose();
    this._emitter.emit(SESSION_END_EVENT);
  }
}
exports.DebuggerHandler = DebuggerHandler;