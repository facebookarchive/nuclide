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

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../nuclide-debugger-common');
}

var _events = _interopRequireDefault(require('events'));

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SESSION_END_EVENT = 'session-end-event'; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */

const RESOLVE_BREAKPOINT_DELAY_MS = 500;

// Handles all 'Debug.*' Chrome dev tools messages
class DebuggerHandler extends (_Handler || _load_Handler()).default {

  constructor(clientCallback, connectionMultiplexer) {
    super('Debugger', clientCallback);

    this._hadFirstContinuationCommand = false;
    this._connectionMultiplexer = connectionMultiplexer;
    this._files = new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).FileCache(clientCallback.sendServerMethod.bind(clientCallback));
    this._emitter = new _events.default();
    this._subscriptions = new (_eventKit || _load_eventKit()).CompositeDisposable(this._connectionMultiplexer.onStatus(this._onStatusChanged.bind(this)), this._connectionMultiplexer.onNotification(this._onNotification.bind(this)));
  }

  onSessionEnd(callback) {
    (_utils2 || _load_utils2()).default.debug('onSessionEnd');
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
          _this.replyToCommand(id, {
            scriptSource: yield _this._files.getFileSource(params.scriptId)
          });
          break;

        case 'setBreakpointByUrl':
          _this._setBreakpointByUrl(id, params);
          break;

        case 'continueToLocation':
          _this._continueToLocation(id, params);
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

        case 'getThreadStack':
          const threadStackObject = yield _this._getThreadStack();
          _this.replyToCommand(id, threadStackObject);
          break;

        default:
          _this.unknownMethod(id, method, params);
          break;
      }
    })();
  }

  _getThreadStack() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const enabledConnection = _this2._connectionMultiplexer.getEnabledConnectionId();
      return {
        callFrames: enabledConnection == null ? [] : yield _this2._getStackFrames(enabledConnection)
      };
    })();
  }

  _selectThread(params) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { threadId } = params;
      yield _this3._connectionMultiplexer.selectThread(threadId);
      _this3._sendPausedMessage();
    })();
  }

  _setPauseOnExceptions(id, params) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { state } = params;
      yield _this4._connectionMultiplexer.getBreakpointStore().setPauseOnExceptions(String(id), state);
      _this4.replyToCommand(id, {});
    })();
  }

  _setBreakpointByUrl(id, params) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { lineNumber, url, columnNumber, condition } = params;
      if (!url || columnNumber !== 0) {
        _this5.replyWithError(id, 'Invalid arguments to Debugger.setBreakpointByUrl: ' + JSON.stringify(params));
        return;
      }
      yield _this5._files.registerFile(url);

      const path = (0, (_helpers || _load_helpers()).uriToPath)(url);
      const breakpointStore = _this5._connectionMultiplexer.getBreakpointStore();
      // Chrome lineNumber is 0-based while xdebug lineno is 1-based.
      const breakpointId = yield breakpointStore.setFileLineBreakpoint(String(id), path, lineNumber + 1, condition);
      const breakpoint = yield breakpointStore.getBreakpoint(breakpointId);

      if (!(breakpoint != null)) {
        throw new Error('Invariant violation: "breakpoint != null"');
      }

      _this5.replyToCommand(id, {
        breakpointId,
        resolved: breakpoint.resolved,
        locations: [(0, (_helpers || _load_helpers()).getBreakpointLocation)(breakpoint)]
      });
    })();
  }

  _continueToLocation(id, params) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const enabledConnection = _this6._connectionMultiplexer.getEnabledConnection();
      const { location: { columnNumber, lineNumber, scriptId } } = params;
      if (enabledConnection == null) {
        _this6.replyWithError(id, 'No active connection to continue running!');
        return;
      }

      const breakpointStore = _this6._connectionMultiplexer.getBreakpointStore();

      if (_this6._temporaryBreakpointpointId != null) {
        yield breakpointStore.removeBreakpoint(_this6._temporaryBreakpointpointId);
        _this6._temporaryBreakpointpointId = null;
      }

      if (!scriptId || columnNumber != null && columnNumber !== 0) {
        _this6.replyWithError(id, 'Invalid arguments to Debugger.continueToLocation: ' + JSON.stringify(params));
        return;
      }

      const filePath = (_nuclideUri || _load_nuclideUri()).default.getPath(scriptId);
      const url = (0, (_helpers || _load_helpers()).pathToUri)(filePath);
      yield _this6._files.registerFile(url);

      // Chrome lineNumber is 0-based while xdebug lineno is 1-based.
      _this6._temporaryBreakpointpointId = yield breakpointStore.setFileLineBreakpointForConnection(enabledConnection, String(id), filePath, lineNumber + 1,
      /* condition */'');

      const breakpoint = breakpointStore.getBreakpoint(_this6._temporaryBreakpointpointId);

      if (!(breakpoint != null)) {
        throw new Error('Invariant violation: "breakpoint != null"');
      }

      if (!(breakpoint.connectionId === enabledConnection.getId())) {
        throw new Error('Invariant violation: "breakpoint.connectionId === enabledConnection.getId()"');
      }

      _this6.replyToCommand(id, {});
      // TODO change to resume on resolve notification when it's received after setting a breakpoint.
      yield (0, (_promise || _load_promise()).sleep)(RESOLVE_BREAKPOINT_DELAY_MS);
      _this6._resume();
    })();
  }

  _removeBreakpoint(id, params) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { breakpointId } = params;
      yield _this7._connectionMultiplexer.removeBreakpoint(breakpointId);
      _this7.replyToCommand(id, { id: breakpointId });
    })();
  }

  _debuggerEnable(id) {
    this.replyToCommand(id, {});
    this._sendFakeLoaderBreakpoint();
  }

  _getStackFrames(id) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const frames = yield _this8._connectionMultiplexer.getConnectionStackFrames(id);

      if (frames != null && frames.stack != null || frames.stack.length === 0) {
        return Promise.all(frames.stack.map(function (frame, frameIndex) {
          return _this8._convertFrame(frame, frameIndex);
        }));
      }

      return Promise.resolve([]);
    })();
  }

  _getTopFrameForConnection(id) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const frames = yield _this9._connectionMultiplexer.getConnectionStackFrames(id);
      if (frames == null || frames.stack == null || frames.stack.length === 0) {
        return null;
      }
      return _this9._convertFrame(frames.stack[0], 0);
    })();
  }

  _convertFrame(frame, frameIndex) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      (_utils2 || _load_utils2()).default.debug('Converting frame: ' + JSON.stringify(frame));
      const file = yield _this10._files.registerFile((0, (_frame || _load_frame()).fileUrlOfFrame)(frame));
      const location = (0, (_frame || _load_frame()).locationOfFrame)(frame);
      const hasSource = yield file.hasSource();
      if (!hasSource) {
        location.scriptId = '';
      }

      let scopeChain = null;
      try {
        scopeChain = yield _this10._connectionMultiplexer.getScopesForFrame(frameIndex);
      } catch (e) {
        // Couldn't get scopes.
      }

      return {
        callFrameId: (0, (_frame || _load_frame()).idOfFrame)(frame),
        functionName: (0, (_frame || _load_frame()).functionOfFrame)(frame),
        location,
        scopeChain
      };
    })();
  }

  _sendContinuationCommand(command) {
    (_utils2 || _load_utils2()).default.debug('Sending continuation command: ' + command);
    this._connectionMultiplexer.sendContinuationCommand(command);
  }

  _pause() {
    this._connectionMultiplexer.pause();
  }

  _resume() {
    if (!this._hadFirstContinuationCommand) {
      this._hadFirstContinuationCommand = true;
      this.sendMethod('Debugger.resumed');
      this._subscriptions.add(this._connectionMultiplexer.listen(this._endSession.bind(this)));
      return;
    }
    this._connectionMultiplexer.resume();
  }

  _onStatusChanged(status, params) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      (_utils2 || _load_utils2()).default.debug('Sending status: ' + status);
      switch (status) {
        case (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexerStatus.AllConnectionsPaused:
        case (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexerStatus.SingleConnectionPaused:
          yield _this11._sendPausedMessage();
          yield _this11._clearIfTemporaryBreakpoint();
          break;
        case (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexerStatus.Running:
          _this11.sendMethod('Debugger.resumed');
          break;
        case (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexerStatus.End:
          _this11._endSession();
          break;
        default:
          const message = 'Unexpected status: ' + status;
          (_utils2 || _load_utils2()).default.error(message);
          throw new Error(message);
      }
    })();
  }

  _clearIfTemporaryBreakpoint() {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const temporaryBreakpointId = _this12._temporaryBreakpointpointId;
      if (temporaryBreakpointId == null) {
        return;
      }
      const breakpointStore = _this12._connectionMultiplexer.getBreakpointStore();
      const breakpoint = breakpointStore.getBreakpoint(temporaryBreakpointId);
      const enabledConnection = _this12._connectionMultiplexer.getEnabledConnection();
      if (enabledConnection == null || breakpoint == null || enabledConnection.getId() !== breakpoint.connectionId) {
        return;
      }
      const { breakpointInfo } = breakpoint;
      const stopLocation = enabledConnection.getStopBreakpointLocation();
      if (stopLocation != null && stopLocation.filename === breakpointInfo.filename && stopLocation.lineNumber === breakpointInfo.lineNumber) {
        yield breakpointStore.removeBreakpoint(temporaryBreakpointId);
        _this12._temporaryBreakpointpointId = null;
      }
    })();
  }

  _onNotification(notifyName, params) {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      switch (notifyName) {
        case (_DbgpSocket || _load_DbgpSocket()).BREAKPOINT_RESOLVED_NOTIFICATION:
          if (!params) {
            throw new Error('Invariant violation: "params"');
          }

          const breakpoint = params;
          _this13.sendMethod('Debugger.breakpointResolved', {
            breakpointId: breakpoint.chromeId,
            location: (0, (_helpers || _load_helpers()).getBreakpointLocation)(breakpoint)
          });
          break;
        case (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexerNotification.RequestUpdate:
          if (!params) {
            throw new Error('Invariant violation: "params"');
          }

          const frame = params.status === (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Break ? yield _this13._getTopFrameForConnection(params.id) : null;
          _this13.sendMethod('Debugger.threadUpdated', {
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
          const message = `Unexpected notification: ${notifyName}`;
          (_utils2 || _load_utils2()).default.error(message);
          throw new Error(message);
      }
    })();
  }

  // May only call when in paused state.
  _sendPausedMessage() {
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const requestSwitchMessage = _this14._connectionMultiplexer.getRequestSwitchMessage();
      _this14._connectionMultiplexer.resetRequestSwitchMessage();
      if (requestSwitchMessage != null) {
        _this14.sendUserMessage('outputWindow', {
          level: 'info',
          text: requestSwitchMessage
        });
      }
      const enabledConnectionId = _this14._connectionMultiplexer.getEnabledConnectionId();
      _this14.sendMethod('Debugger.paused', {
        callFrames: enabledConnectionId != null ? yield _this14._getStackFrames(enabledConnectionId) : [],
        reason: 'breakpoint', // TODO: better reason?
        threadSwitchMessage: requestSwitchMessage,
        data: {},
        stopThreadId: enabledConnectionId
      });

      // Send an update for the enabled thread to cause the request window in the
      // front-end to update.
      if (enabledConnectionId != null) {
        const frame = yield _this14._getTopFrameForConnection(enabledConnectionId);
        _this14.sendMethod('Debugger.threadUpdated', {
          thread: {
            id: String(enabledConnectionId),
            name: String(enabledConnectionId),
            address: frame != null ? frame.functionName : 'N/A',
            location: frame != null ? frame.location : null,
            hasSource: true,
            stopReason: _this14._connectionMultiplexer.getConnectionStopReason(enabledConnectionId),
            description: 'N/A'
          }
        });
      }
    })();
  }

  _sendFakeLoaderBreakpoint() {
    this.sendMethod('Debugger.paused', {
      callFrames: [],
      reason: 'initial break',
      data: {}
    });
  }

  _endSession() {
    (_utils2 || _load_utils2()).default.debug('DebuggerHandler: Ending session');
    this._subscriptions.dispose();
    this._emitter.emit(SESSION_END_EVENT);
  }
}
exports.DebuggerHandler = DebuggerHandler;