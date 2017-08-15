'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerHandler = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _vscodeDebugadapter;

function _load_vscodeDebugadapter() {
  return _vscodeDebugadapter = require('vscode-debugadapter');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _utils2;

function _load_utils2() {
  return _utils2 = _interopRequireDefault(require('./utils'));
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
  return _ConnectionMultiplexer = require('./ConnectionMultiplexer');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _Connection;

function _load_Connection() {
  return _Connection = require('./Connection');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const RESOLVE_BREAKPOINT_DELAY_MS = 500; /**
                                          * Copyright (c) 2015-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the license found in the LICENSE file in
                                          * the root directory of this source tree.
                                          *
                                          * 
                                          * @format
                                          */

class DebuggerHandler {

  _sendOutput(message, level) {
    this._eventSender(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).OutputEvent(message, level));
  }

  // Since we want to send breakpoint events, we will assign an id to every event
  // so that the frontend can match events with breakpoints.


  _sendNotification(message, type) {
    this._eventSender(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).OutputEvent(message, 'nuclide_notification', { type }));
  }

  constructor(eventSender) {
    this._breakpointId = 0;
    this._breakpoints = new Map();
    this._variableHandles = new (_vscodeDebugadapter || _load_vscodeDebugadapter()).Handles();

    this._eventSender = eventSender;
    this._hadFirstContinuationCommand = false;
    this._connectionMultiplexer = new (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexer(this._sendOutput.bind(this), this._sendNotification.bind(this));
    this._subscriptions = new (_eventKit || _load_eventKit()).CompositeDisposable(this._connectionMultiplexer.onStatus(this._onStatusChanged.bind(this)), this._connectionMultiplexer.onNotification(this._onNotification.bind(this)), this._connectionMultiplexer);
  }

  setPauseOnExceptions(breakpointId, state) {
    return this._connectionMultiplexer.getBreakpointStore().setPauseOnExceptions(String(breakpointId), state);
  }

  setBreakpoints(path, bpSources) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const existingBreakpoints = _this._breakpoints.get(path) || [];
      const existingBsSet = new Set(existingBreakpoints);
      const newBpSources = new Set(bpSources);

      const addedBreakpoints = yield Promise.all(Array.from((0, (_collection || _load_collection()).setDifference)(newBpSources, existingBsSet, function (v) {
        return v.line;
      })).map(function (sourceBp) {
        return _this._setBreakpointFromSource(++_this._breakpointId, path, sourceBp);
      }));

      const removedBpIds = new Set((yield Promise.all(Array.from((0, (_collection || _load_collection()).setDifference)(existingBsSet, newBpSources, function (v) {
        return v.line;
      })).map((() => {
        var _ref = (0, _asyncToGenerator.default)(function* (existingBp) {
          const bpId = existingBp.id;
          yield _this._removeBreakpoint(bpId);
          return bpId;
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })()))));

      const newBreakpoints = existingBreakpoints.filter(function (bp) {
        return !removedBpIds.has(bp.id);
      }).concat(addedBreakpoints);

      _this._breakpoints.set(path, newBreakpoints);
      return newBreakpoints;
    })();
  }

  _setBreakpointFromSource(id, path, bpSource) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const breakpointStore = _this2._connectionMultiplexer.getBreakpointStore();
      // Chrome lineNumber is 0-based while xdebug lineno is 1-based.
      const breakpointId = yield breakpointStore.setFileLineBreakpoint(String(id), path, bpSource.line, bpSource.condition);
      const hhBreakpoint = yield breakpointStore.getBreakpoint(breakpointId);

      if (!(hhBreakpoint != null)) {
        throw new Error('Invariant violation: "hhBreakpoint != null"');
      }

      const bp = new (_vscodeDebugadapter || _load_vscodeDebugadapter()).Breakpoint(hhBreakpoint.resolved, bpSource.line);
      bp.id = id;
      return bp;
    })();
  }

  _removeBreakpoint(breakpointId) {
    return this._connectionMultiplexer.removeBreakpoint(String(breakpointId));
  }

  getStackFrames(id) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // this._connectionMultiplexer.selectThread(id);
      const frames = yield _this3._connectionMultiplexer.getConnectionStackFrames(id);
      if (frames != null && frames.stack != null || frames.stack.length === 0) {
        return Promise.all(frames.stack.map(function (frame, frameIndex) {
          return _this3._convertFrame(frame, frameIndex);
        }));
      }

      return [];
    })();
  }

  getScopesForFrame(frameIndex) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const scopes = yield _this4._connectionMultiplexer.getScopesForFrame(frameIndex);
      return scopes.map(function (scope) {
        return new (_vscodeDebugadapter || _load_vscodeDebugadapter()).Scope(scope.object.description || scope.name || scope.type, _this4._variableHandles.create((0, (_nullthrows || _load_nullthrows()).default)(scope.object.objectId)), true);
      });
    })();
  }

  _convertFrame(frame, frameIndex) {
    return (0, _asyncToGenerator.default)(function* () {
      (_utils2 || _load_utils2()).default.debug('Converting frame: ' + JSON.stringify(frame));
      const location = (0, (_frame || _load_frame()).locationOfFrame)(frame);
      const hasSource = true; // TODO;
      if (!hasSource) {
        location.scriptId = '';
      }

      return new (_vscodeDebugadapter || _load_vscodeDebugadapter()).StackFrame(frameIndex, (0, (_frame || _load_frame()).functionOfFrame)(frame), hasSource ? new (_vscodeDebugadapter || _load_vscodeDebugadapter()).Source((_nuclideUri || _load_nuclideUri()).default.basename(location.scriptId), location.scriptId) : null, location.lineNumber, 0);
    })();
  }

  _sendContinuationCommand(command) {
    (_utils2 || _load_utils2()).default.debug('Sending continuation command: ' + command);
    this._connectionMultiplexer.sendContinuationCommand(command);
  }

  pause() {
    this._connectionMultiplexer.pause();
  }

  resume() {
    if (!this._hadFirstContinuationCommand) {
      this._hadFirstContinuationCommand = true;
      this._subscriptions.add(this._connectionMultiplexer.listen(this._endSession.bind(this)));
      return;
    }
    this._connectionMultiplexer.resume();
  }

  _updateBreakpointHitCount() {
    // If the enabled connection just hit a breakpoint, update its hit count.
    if (this._connectionMultiplexer.getEnabledConnection == null) {
      return;
    }
    const currentConnection = this._connectionMultiplexer.getEnabledConnection();
    if (currentConnection == null || currentConnection.getStopReason() !== (_Connection || _load_Connection()).BREAKPOINT) {
      return;
    }
    const stopLocation = currentConnection.getStopBreakpointLocation();
    if (stopLocation == null) {
      return;
    }
    const hhBp = this._connectionMultiplexer.getBreakpointStore().findBreakpoint(stopLocation.filename, stopLocation.lineNumber);
    if (hhBp == null) {
      return;
    }
    hhBp.hitCount++;
    const vsBreakpoint = this._getBreakpointById(Number(hhBp.chromeId));
    if (vsBreakpoint == null) {
      return;
    }
    vsBreakpoint.nuclide_hitCount = hhBp.hitCount;
    this._eventSender(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).BreakpointEvent('update', vsBreakpoint));
  }

  continueToLocation(params) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const enabledConnection = _this5._connectionMultiplexer.getEnabledConnection();
      const { source, line } = params;
      if (enabledConnection == null) {
        throw new Error('No active connection to continue on!');
      }

      const breakpointStore = _this5._connectionMultiplexer.getBreakpointStore();

      if (_this5._temporaryBreakpointpointId != null) {
        yield breakpointStore.removeBreakpoint(_this5._temporaryBreakpointpointId);
        _this5._temporaryBreakpointpointId = null;
      }

      // Chrome lineNumber is 0-based while xdebug lineno is 1-based.
      _this5._temporaryBreakpointpointId = yield breakpointStore.setFileLineBreakpointForConnection(enabledConnection, String(++_this5._breakpointId), (0, (_nullthrows || _load_nullthrows()).default)(source.path), line,
      /* condition */'');

      const breakpoint = breakpointStore.getBreakpoint(_this5._temporaryBreakpointpointId);

      if (!(breakpoint != null)) {
        throw new Error('Invariant violation: "breakpoint != null"');
      }

      if (!(breakpoint.connectionId === enabledConnection.getId())) {
        throw new Error('Invariant violation: "breakpoint.connectionId === enabledConnection.getId()"');
      }

      // TODO change to resume on resolve notification when it's received after setting a breakpoint.


      yield (0, (_promise || _load_promise()).sleep)(RESOLVE_BREAKPOINT_DELAY_MS);
      _this5.resume();
    })();
  }

  stepOver() {
    this._sendContinuationCommand((_DbgpSocket || _load_DbgpSocket()).COMMAND_STEP_OVER);
  }

  stepInto() {
    this._sendContinuationCommand((_DbgpSocket || _load_DbgpSocket()).COMMAND_STEP_INTO);
  }

  stepOut() {
    this._sendContinuationCommand((_DbgpSocket || _load_DbgpSocket()).COMMAND_STEP_OUT);
  }

  _onStatusChanged(status) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      (_utils2 || _load_utils2()).default.debug('Sending status: ' + status);
      switch (status) {
        case (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexerStatus.AllConnectionsPaused:
        case (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexerStatus.SingleConnectionPaused:
          _this6._updateBreakpointHitCount();
          yield _this6._sendPausedMessage();
          break;
        case (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexerStatus.End:
          _this6._endSession();
          break;
        default:
          const message = 'Unexpected status: ' + status;
          (_utils2 || _load_utils2()).default.error(message);
          throw new Error(message);
      }
    })();
  }

  _onNotification(notifyName, params) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      switch (notifyName) {
        case (_DbgpSocket || _load_DbgpSocket()).BREAKPOINT_RESOLVED_NOTIFICATION:
          if (!params) {
            throw new Error('Invariant violation: "params"');
          }

          const breakpoint = params;
          _this7._resolveBreakpoint(Number(breakpoint.chromeId));
          break;
        default:
          const message = `Unexpected notification: ${notifyName}`;
          (_utils2 || _load_utils2()).default.error(message);
          throw new Error(message);
      }
    })();
  }

  _resolveBreakpoint(bpId) {
    const breakpoint = this._getBreakpointById(bpId);
    if (breakpoint == null) {
      (_utils2 || _load_utils2()).default.warn('Cannot resolve non-existing breakpoint', bpId);
    } else {
      breakpoint.verified = true;
      this._eventSender(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).BreakpointEvent('update', breakpoint));
    }
  }

  _getBreakpointById(bpId) {
    return (0, (_collection || _load_collection()).arrayFlatten)(Array.from(this._breakpoints.values())).find(bp => bp.id === bpId);
  }

  // May only call when in paused state.
  _sendPausedMessage() {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const requestSwitchMessage = _this8._connectionMultiplexer.getRequestSwitchMessage();
      _this8._connectionMultiplexer.resetRequestSwitchMessage();
      if (requestSwitchMessage != null) {
        _this8._sendOutput(requestSwitchMessage, 'info');
      }
      const enabledConnectionId = _this8._connectionMultiplexer.getEnabledConnectionId();
      if (enabledConnectionId == null) {
        throw new Error('No active hhvm connection to pause!');
      }
      _this8._eventSender(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).StoppedEvent('breakpoint', enabledConnectionId));
    })();
  }

  dispose() {
    this._endSession();
  }

  _endSession() {
    (_utils2 || _load_utils2()).default.debug('DebuggerHandler: Ending session');
    this._eventSender(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).TerminatedEvent());
    this._subscriptions.dispose();
  }

  getProperties(variablesReference) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const id = _this9._variableHandles.get(variablesReference);
      if (id == null) {
        return [];
      }
      const properties = yield _this9._connectionMultiplexer.getProperties(id);
      return properties.map(function (prop) {
        return {
          name: prop.name,
          type: prop.value && prop.value.type || 'unknown',
          value: prop.value && (prop.value.value || prop.value.description) || 'N/A',
          variablesReference: prop.value && prop.value.objectId ? _this9._variableHandles.create(prop.value.objectId) : 0
        };
      });
    })();
  }

  evaluate(expression, frameId, response) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const hphpdExpression = (0, (_utils || _load_utils()).makeExpressionHphpdCompatible)(expression);
      let hhResult;
      if (frameId == null) {
        hhResult = yield _this10._connectionMultiplexer.runtimeEvaluate(hphpdExpression);
      } else {
        hhResult = yield _this10._connectionMultiplexer.evaluateOnCallFrame(frameId, hphpdExpression);
      }
      if (hhResult.wasThrown) {
        response.success = false;
        // $FlowIgnore: returning an ErrorResponse.
        response.body = {
          error: {
            id: hhResult.error.$.code,
            format: hhResult.error.message[0]
          }
        };
      } else {
        response.body = {
          type: hhResult.result.type,
          result: hhResult.result.value || hhResult.result.description,
          variablesReference: hhResult.result.objectId ? _this10._variableHandles.create(hhResult.result.objectId) : 0
        };
      }
    })();
  }
}
exports.DebuggerHandler = DebuggerHandler;