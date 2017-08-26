'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _protocolTypes;

function _load_protocolTypes() {
  return _protocolTypes = _interopRequireWildcard(require('../../nuclide-debugger-base/lib/protocol-types'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../nuclide-debugger-common');
}

var _helpers;

function _load_helpers() {
  return _helpers = require('../../nuclide-debugger-common/lib/helpers');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _VsDebugSession;

function _load_VsDebugSession() {
  return _VsDebugSession = _interopRequireDefault(require('./VsDebugSession'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function translateStopReason(stopReason) {
  return stopReason;
}
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports


function nuclideDebuggerLocation(scriptId, lineNumber, columnNumber) {
  return {
    scriptId,
    lineNumber,
    columnNumber
  };
}

function getFakeLoaderPauseEvent() {
  return {
    method: 'Debugger.paused',
    params: {
      callFrames: [],
      reason: 'initial break',
      data: {}
    }
  };
}

function getEmptyResponse(id) {
  return { id, result: {} };
}

function getErrorResponse(id, message) {
  return { id, error: { message } };
}

/**
 * Instead of having every async command handler try/catch its own logic
 * and send error response when failing, this utility would provide
 * the try/catch wrapper for command handlers.
 */
function catchCommandError(handler) {
  return (() => {
    var _ref = (0, _asyncToGenerator.default)(function* (command) {
      try {
        return yield handler(command);
      } catch (error) {
        return getErrorResponse(command.id, error.message);
      }
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })();
}

const OUTPUT_CATEGORY_TO_LEVEL = Object.freeze({
  console: 'debug',
  info: 'info',
  log: 'log',
  warning: 'warning',
  error: 'error',
  debug: 'debug',
  stderr: 'error',
  stdout: 'log',
  success: 'success'
});

// VSP deoesn't provide process id.
const VSP_PROCESS_ID = -1;

/**
 * This translator will be responsible of mapping Nuclide's debugger protocol
 * requests to VSCode debugger protocol requests and back from VSCode's response
 * to Nuclide's responses and events.
 */
class VsDebugSessionTranslator {

  constructor(adapterType, adapter, debugMode, debuggerArgs, clientCallback, logger) {
    this._adapterType = adapterType;
    this._debugMode = debugMode;
    this._session = new (_VsDebugSession || _load_VsDebugSession()).default('id', logger, adapter);
    this._debuggerArgs = debuggerArgs;
    this._clientCallback = clientCallback;
    this._logger = logger;
    this._commands = new _rxjsBundlesRxMinJs.Subject();
    this._handledCommands = new Set();
    this._breakpointsById = new Map();
    this._threadsById = new Map();
    this._mainThreadId = null;
    this._lastBreakpointId = 0;
    this._exceptionFilters = [];
    this._files = new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).FileCache((method, params) => this._sendMessageToClient({ method, params }));

    // Ignore the first fake pause request.
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._session, this._handleCommands().subscribe(message => this._sendMessageToClient(message)), this._listenToSessionEvents());
  }

  // Session state.


  _handleCommands() {
    var _this = this;

    const resumeCommands = this._commandsOfType('Debugger.resume');
    return _rxjsBundlesRxMinJs.Observable.merge(
    // Ack debugger enabled and send fake pause event
    // (indicating readiness to receive config requests).
    this._commandsOfType('Debugger.enable').flatMap(command => _rxjsBundlesRxMinJs.Observable.of(getEmptyResponse(command.id), getFakeLoaderPauseEvent())), this._commandsOfType('Debugger.pause').flatMap(catchCommandError((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (command) {
        const mainThreadId =
        // flowlint-next-line sketchy-null-number:off
        _this._mainThreadId || Array.from(_this._threadsById.keys())[0] || -1;
        yield _this._session.pause({ threadId: mainThreadId });
        return getEmptyResponse(command.id);
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })())),
    // Skip the fake resume command.
    resumeCommands.skip(1).flatMap(catchCommandError((() => {
      var _ref3 = (0, _asyncToGenerator.default)(function* (command) {
        if (_this._pausedThreadId == null) {
          return getErrorResponse(command.id, 'No paused thread to resume!');
        }
        yield _this._session.continue({ threadId: _this._pausedThreadId });
        return getEmptyResponse(command.id);
      });

      return function (_x3) {
        return _ref3.apply(this, arguments);
      };
    })())),
    // Step over
    this._commandsOfType('Debugger.stepOver').flatMap(catchCommandError((() => {
      var _ref4 = (0, _asyncToGenerator.default)(function* (command) {
        if (_this._pausedThreadId == null) {
          return getErrorResponse(command.id, 'No paused thread to step over!');
        }
        yield _this._session.next({ threadId: _this._pausedThreadId });
        return getEmptyResponse(command.id);
      });

      return function (_x4) {
        return _ref4.apply(this, arguments);
      };
    })())),
    // Step into
    this._commandsOfType('Debugger.stepInto').flatMap(catchCommandError((() => {
      var _ref5 = (0, _asyncToGenerator.default)(function* (command) {
        if (_this._pausedThreadId == null) {
          return getErrorResponse(command.id, 'No paused thread to step into!');
        }
        yield _this._session.stepIn({ threadId: _this._pausedThreadId });
        return getEmptyResponse(command.id);
      });

      return function (_x5) {
        return _ref5.apply(this, arguments);
      };
    })())),
    // Step out
    this._commandsOfType('Debugger.stepOut').flatMap(catchCommandError((() => {
      var _ref6 = (0, _asyncToGenerator.default)(function* (command) {
        if (_this._pausedThreadId == null) {
          return getErrorResponse(command.id, 'No paused thread to step out!');
        }
        yield _this._session.stepOut({ threadId: _this._pausedThreadId });
        return getEmptyResponse(command.id);
      });

      return function (_x6) {
        return _ref6.apply(this, arguments);
      };
    })())),
    // Get script source
    this._commandsOfType('Debugger.getScriptSource').flatMap(catchCommandError((() => {
      var _ref7 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Debugger.getScriptSource')) {
          throw new Error('Invariant violation: "command.method === \'Debugger.getScriptSource\'"');
        }

        const result = {
          scriptSource: yield _this._files.getFileSource(command.params.scriptId)
        };
        return { id: command.id, result };
      });

      return function (_x7) {
        return _ref7.apply(this, arguments);
      };
    })())), this._commandsOfType('Debugger.setPauseOnExceptions').switchMap(catchCommandError((() => {
      var _ref8 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Debugger.setPauseOnExceptions')) {
          throw new Error('Invariant violation: "command.method === \'Debugger.setPauseOnExceptions\'"');
        }

        const { state } = command.params;
        switch (state) {
          case 'none':
            _this._exceptionFilters = [];
            break;
          case 'uncaught':
          case 'all':
            _this._exceptionFilters = [state];
            break;
        }
        yield _this._session.setExceptionBreakpoints({
          filters: _this._exceptionFilters
        });
        return getEmptyResponse(command.id);
      });

      return function (_x8) {
        return _ref8.apply(this, arguments);
      };
    })())), this._commandsOfType('Debugger.continueToLocation').switchMap(catchCommandError((() => {
      var _ref9 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Debugger.continueToLocation')) {
          throw new Error('Invariant violation: "command.method === \'Debugger.continueToLocation\'"');
        }

        const { location } = command.params;
        yield _this._continueToLocation(location);
        return getEmptyResponse(command.id);
      });

      return function (_x9) {
        return _ref9.apply(this, arguments);
      };
    })())),
    // Ack config commands
    _rxjsBundlesRxMinJs.Observable.merge(this._commandsOfType('Debugger.setDebuggerSettings'), this._commandsOfType('Runtime.enable')).map(command => getEmptyResponse(command.id)),
    // Get properties
    this._commandsOfType('Runtime.getProperties').flatMap(catchCommandError((() => {
      var _ref10 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Runtime.getProperties')) {
          throw new Error('Invariant violation: "command.method === \'Runtime.getProperties\'"');
        }

        const result = yield _this._getProperties(command.id, command.params);
        return { id: command.id, result };
      });

      return function (_x10) {
        return _ref10.apply(this, arguments);
      };
    })())),
    // Set breakpoints
    this._handleSetBreakpointsCommands(),
    // Ack first resume command (indicating the session is ready to start).
    resumeCommands.take(1).map(command => getEmptyResponse(command.id)),
    // Remove breakpoints
    this._commandsOfType('Debugger.removeBreakpoint').flatMap(catchCommandError((() => {
      var _ref11 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Debugger.removeBreakpoint')) {
          throw new Error('Invariant violation: "command.method === \'Debugger.removeBreakpoint\'"');
        }

        yield _this._removeBreakpoint(command.params.breakpointId);
        return getEmptyResponse(command.id);
      });

      return function (_x11) {
        return _ref11.apply(this, arguments);
      };
    })())), this._commandsOfType('Debugger.getThreadStack').map(command => {
      if (!(command.method === 'Debugger.getThreadStack')) {
        throw new Error('Invariant violation: "command.method === \'Debugger.getThreadStack\'"');
      }

      const { threadId } = command.params;
      const threadInfo = this._threadsById.get(threadId);
      const callFrames = threadInfo != null && threadInfo.state === 'paused' ? threadInfo.callFrames : null;
      return {
        id: command.id,
        result: { callFrames: callFrames || [] }
      };
    }), this._commandsOfType('Debugger.evaluateOnCallFrame').flatMap(catchCommandError((() => {
      var _ref12 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Debugger.evaluateOnCallFrame')) {
          throw new Error('Invariant violation: "command.method === \'Debugger.evaluateOnCallFrame\'"');
        }

        const { callFrameId, expression } = command.params;
        const result = yield _this._evaluateOnCallFrame(expression, Number(callFrameId));
        return {
          id: command.id,
          result
        };
      });

      return function (_x12) {
        return _ref12.apply(this, arguments);
      };
    })())), this._commandsOfType('Runtime.evaluate').flatMap(catchCommandError((() => {
      var _ref13 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Runtime.evaluate')) {
          throw new Error('Invariant violation: "command.method === \'Runtime.evaluate\'"');
        }

        const { expression } = command.params;
        const result = yield _this._evaluateOnCallFrame(expression);
        return {
          id: command.id,
          result
        };
      });

      return function (_x13) {
        return _ref13.apply(this, arguments);
      };
    })())),
    // Error for unhandled commands
    this._unhandledCommands().map(command => getErrorResponse(command.id, 'Unknown command: ' + command.method)));
  }

  _continueToLocation(location) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { columnNumber, lineNumber, scriptId } = location;
      const source = {
        path: (_nuclideUri || _load_nuclideUri()).default.getPath(scriptId),
        name: (_nuclideUri || _load_nuclideUri()).default.basename(scriptId)
      };
      yield _this2._files.registerFile((0, (_helpers || _load_helpers()).pathToUri)(scriptId));
      yield _this2._session.nuclide_continueToLocation({
        // flowlint-next-line sketchy-null-number:off
        column: columnNumber || 1,
        line: lineNumber + 1,
        source
      });
    })();
  }

  _handleSetBreakpointsCommands() {
    var _this3 = this;

    const setBreakpointsCommands = this._commandsOfType('Debugger.setBreakpointByUrl');

    let startedDebugging = false;

    return _rxjsBundlesRxMinJs.Observable.concat(setBreakpointsCommands.buffer(this._commandsOfType('Debugger.resume').first().switchMap(() => {
      if (this._session.isReadyForBreakpoints()) {
        // Session is initialized and ready for breakpoint requests.
        return _rxjsBundlesRxMinJs.Observable.of(null);
      } else {
        // Session initialization is pending launch.
        startedDebugging = true;
        return _rxjsBundlesRxMinJs.Observable.fromPromise(this._startDebugging()).ignoreElements().concat(this._session.observeInitializeEvents());
      }
    })).first().flatMap((() => {
      var _ref14 = (0, _asyncToGenerator.default)(function* (commands) {
        // Upon session start, send the cached breakpoints
        // and other configuration requests.
        try {
          const promises = [_this3._setBulkBreakpoints(commands), _this3._configDone(), startedDebugging ? Promise.resolve() : _this3._startDebugging()];
          startedDebugging = true;
          yield Promise.all(promises);
          return yield promises[0];
        } catch (error) {
          return commands.map(function ({ id }) {
            return getErrorResponse(id, error.message);
          });
        }
      });

      return function (_x14) {
        return _ref14.apply(this, arguments);
      };
    })()),
    // Following breakpoint requests are handled by
    // immediatelly passing to the active debug session.
    setBreakpointsCommands.flatMap((() => {
      var _ref15 = (0, _asyncToGenerator.default)(function* (command) {
        try {
          return yield _this3._setBulkBreakpoints([command]);
        } catch (error) {
          return [getErrorResponse(command.id, error.message)];
        }
      });

      return function (_x15) {
        return _ref15.apply(this, arguments);
      };
    })())).flatMap(responses => _rxjsBundlesRxMinJs.Observable.from(responses));
  }

  _startDebugging() {
    if (this._debugMode === 'launch') {
      return this._session.launch(this._debuggerArgs);
    } else {
      return this._session.attach(this._debuggerArgs);
    }
  }

  _setBulkBreakpoints(setBreakpointsCommands) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this4._session.isReadyForBreakpoints()) {
        throw new Error('VsDebugSession is not ready for breakpoints');
      }
      if (setBreakpointsCommands.length === 0) {
        return [];
      }
      // Group breakpoint commands by file path.
      const breakpointCommandsByUrl = new Map();
      for (const command of setBreakpointsCommands) {
        if (!(command.method === 'Debugger.setBreakpointByUrl')) {
          throw new Error('Invariant violation: "command.method === \'Debugger.setBreakpointByUrl\'"');
        }

        const url = decodeURIComponent(command.params.url);
        const existing = breakpointCommandsByUrl.get(url);
        if (existing == null) {
          breakpointCommandsByUrl.set(url, [command]);
        } else {
          existing.push(command);
        }
      }

      const responseGroups = yield Promise.all(Array.from(breakpointCommandsByUrl).map((() => {
        var _ref16 = (0, _asyncToGenerator.default)(function* ([url, breakpointCommands]) {
          const path = (0, (_helpers || _load_helpers()).uriToPath)(url);

          const existingTranslatorBreakpoints = _this4._getBreakpointsForFilePath(path).map(function (bp) {
            return Object.assign({}, bp);
          });

          const breakOnLineNumbers = new Set();

          const translatorBreakpoins = breakpointCommands.map(function (c) {
            const newTranslatorBp = {
              breakpointId: _this4._nextBreakpointId(),
              path,
              lineNumber: c.params.lineNumber + 1,
              condition: c.params.condition || '',
              resolved: false,
              hitCount: 0
            };
            breakOnLineNumbers.add(newTranslatorBp.lineNumber);
            _this4._breakpointsById.set(newTranslatorBp.breakpointId, newTranslatorBp);
            return newTranslatorBp;
          }).concat(existingTranslatorBreakpoints.filter(function (tBp) {
            return !breakOnLineNumbers.has(tBp.lineNumber);
          }));

          yield _this4._files.registerFile(url);
          yield _this4._syncBreakpointsForFilePath(path, translatorBreakpoins);

          return breakpointCommands.map(function (command, i) {
            const { breakpointId, lineNumber, resolved } = translatorBreakpoins[i];

            const result = {
              breakpointId,
              locations: [nuclideDebuggerLocation(path, lineNumber - 1, 0)],
              resolved
            };
            return {
              id: command.id,
              result
            };
          });
        });

        return function (_x16) {
          return _ref16.apply(this, arguments);
        };
      })()));
      return (0, (_collection || _load_collection()).arrayFlatten)(responseGroups);
    })();
  }

  _syncBreakpoints() {
    const filePaths = new Set(Array.from(this._breakpointsById.values()).map(bp => bp.path));
    const setBreakpointPromises = [];
    for (const filePath of filePaths) {
      setBreakpointPromises.push(this._syncBreakpointsForFilePath(filePath, this._getBreakpointsForFilePath(filePath).map(bp => Object.assign({}, bp))));
    }
    return Promise.all(setBreakpointPromises);
  }

  _configDone() {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this5._session.setExceptionBreakpoints({
        filters: _this5._exceptionFilters
      });
      if (_this5._session.getCapabilities().supportsConfigurationDoneRequest) {
        yield _this5._session.configurationDone();
      }
    })();
  }

  _syncBreakpointsForFilePath(path, breakpoints) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const source = { path, name: (_nuclideUri || _load_nuclideUri()).default.basename(path) };
      const {
        body: { breakpoints: vsBreakpoints }
      } = yield _this6._session.setBreakpoints({
        source,
        lines: breakpoints.map(function (bp) {
          return bp.lineNumber;
        }),
        breakpoints: breakpoints.map(function (bp) {
          return {
            line: bp.lineNumber,
            condition: bp.condition
          };
        })
      });
      if (vsBreakpoints.length !== breakpoints.length) {
        const errorMessage = 'Failed to set breakpoints - count mismatch!' + ` ${vsBreakpoints.length} vs. ${breakpoints.length}`;
        _this6._logger.error(errorMessage, JSON.stringify(vsBreakpoints), JSON.stringify(breakpoints));
        throw new Error(errorMessage);
      }
      vsBreakpoints.forEach(function (vsBreakpoint, i) {
        breakpoints[i].resolved = vsBreakpoint.verified;
      });
    })();
  }

  _removeBreakpoint(breakpointId) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const foundBreakpoint = _this7._breakpointsById.get(breakpointId);
      if (foundBreakpoint == null) {
        _this7._logger.info(`No breakpoint with id: ${breakpointId} to remove!`);
        return;
      }
      const remainingBreakpoints = _this7._getBreakpointsForFilePath(foundBreakpoint.path).filter(function (breakpoint) {
        return breakpoint.breakpointId !== breakpointId;
      });
      _this7._breakpointsById.delete(breakpointId);

      yield _this7._syncBreakpointsForFilePath(foundBreakpoint.path, remainingBreakpoints.map(function (bp) {
        return Object.assign({}, bp);
      }));
    })();
  }

  _evaluateOnCallFrame(expression, frameId) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { body } = yield _this8._session.evaluate({
        expression,
        frameId
      });
      return {
        result: {
          type: body.type,
          value: body.result,
          description: body.result,
          objectId: body.variablesReference > 0 ? String(body.variablesReference) : undefined
        },
        wasThrown: false
      };
    })();
  }

  _getBreakpointsForFilePath(path) {
    return Array.from(this._breakpointsById.values()).filter(breakpoint => breakpoint.path === path);
  }

  _nextBreakpointId() {
    return String(++this._lastBreakpointId);
  }

  _commandsOfType(type) {
    this._handledCommands.add(type);
    return this._commands.filter(c => c.method === type);
  }

  _unhandledCommands() {
    return this._commands.filter(c => !this._handledCommands.has(c.method));
  }

  _listenToSessionEvents() {
    var _this9 = this;

    // The first resume command is the indicator of client readiness
    // to receive session events.
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._session.observeAllEvents().subscribe(event => {
      this._logger.info('VSP Event', event);
    }), this._session.observeThreadEvents().subscribe(({ body }) => {
      const { reason, threadId } = body;
      if (reason === 'started') {
        if (this._mainThreadId == null) {
          this._mainThreadId = threadId;
        }
        this._updateThreadsState([threadId], 'running');
      } else if (reason === 'exited') {
        this._threadsById.delete(threadId);
        if (this._pausedThreadId === threadId) {
          this._pausedThreadId = null;
        }
        if (this._mainThreadId === threadId) {
          this._mainThreadId = null;
        }
      } else {
        this._logger.error('Unkown thread event:', body);
      }
      const threadsUpdatedEvent = this._getThreadsUpdatedEvent();
      this._sendMessageToClient({
        method: 'Debugger.threadsUpdated',
        params: threadsUpdatedEvent
      });
    }), this._session.observeStopEvents().subscribe(({ body }) => {
      const { threadId, allThreadsStopped, reason } = body;
      if (allThreadsStopped) {
        this._updateThreadsState(this._threadsById.keys(), 'paused');
        this._pausedThreadId = Array.from(this._threadsById.keys())[0];
      }
      if (threadId != null) {
        this._updateThreadsState([threadId], 'paused');
        this._pausedThreadId = threadId;
      }
      // Even though the python debugger engine pauses all threads,
      // It only reports the main thread as paused.
      if (this._adapterType === (_constants || _load_constants()).VsAdapterTypes.PYTHON && reason === 'user request') {
        Array.from(this._threadsById.values()).forEach(threadInfo => threadInfo.stopReason = reason);
      }
    }), this._session.observeBreakpointEvents().subscribe(({ body }) => {
      const { breakpoint } = body;
      const existingBreakpoint = this._breakpointsById.get(String(breakpoint.id == null ? -1 : breakpoint.id));
      const hitCount = parseInt(breakpoint.nuclide_hitCount, 10);

      if (existingBreakpoint == null) {
        this._logger.warn('Received a breakpoint event, but cannot find the breakpoint');
        return;
      } else if (!existingBreakpoint.resolved && breakpoint.verified) {
        existingBreakpoint.resolved = true;
        this._sendMessageToClient({
          method: 'Debugger.breakpointResolved',
          params: {
            breakpointId: existingBreakpoint.breakpointId,
            location: nuclideDebuggerLocation(existingBreakpoint.path, existingBreakpoint.lineNumber - 1, 0)
          }
        });
      } else if (!Number.isNaN(hitCount) && existingBreakpoint != null && existingBreakpoint.hitCount !== hitCount) {
        existingBreakpoint.hitCount = hitCount;
        this._sendMessageToClient({
          method: 'Debugger.breakpointHitCountChanged',
          params: {
            breakpointId: String(breakpoint.id),
            hitCount
          }
        });
      } else {
        this._logger.warn('Unkown breakpoint event', body);
      }
    }), this._session.observeStopEvents().flatMap((() => {
      var _ref17 = (0, _asyncToGenerator.default)(function* ({ body }) {
        const { threadId, reason } = body;
        let callFrames = [];
        const translatedStopReason = translateStopReason(reason);
        if (threadId != null) {
          callFrames = yield _this9._getTranslatedCallFramesForThread(threadId);
          _this9._threadsById.set(threadId, {
            state: 'paused',
            callFrames,
            stopReason: translatedStopReason
          });
        }
        const pausedEvent = {
          callFrames,
          reason: translatedStopReason,
          stopThreadId: threadId,
          threadSwitchMessage: null
        };

        const threadsUpdatedEvent = _this9._getThreadsUpdatedEvent();
        return { pausedEvent, threadsUpdatedEvent };
      });

      return function (_x17) {
        return _ref17.apply(this, arguments);
      };
    })()).subscribe(({ pausedEvent, threadsUpdatedEvent }) => {
      this._sendMessageToClient({
        method: 'Debugger.paused',
        params: pausedEvent
      });
      this._sendMessageToClient({
        method: 'Debugger.threadsUpdated',
        params: threadsUpdatedEvent
      });
    }), this._session.observeContinuedEvents().subscribe(({ body }) => {
      const { allThreadsContinued, threadId } = body;
      if (allThreadsContinued || threadId === this._pausedThreadId) {
        this._pausedThreadId = null;
      }

      if (allThreadsContinued) {
        this._updateThreadsState(this._threadsById.keys(), 'running');
      }
      if (threadId != null) {
        this._updateThreadsState([threadId], 'running');
      }
      this._sendMessageToClient({ method: 'Debugger.resumed' });
    }), this._session.observeOutputEvents().subscribe(({ body }) => {
      // flowlint-next-line sketchy-null-string:off
      const category = body.category || 'console';
      const level = OUTPUT_CATEGORY_TO_LEVEL[category];
      const output = (body.output || '').replace(/\r?\n$/, '');
      if (level != null && output.length > 0) {
        this._sendUserOutputMessage(level, output);
      } else if (category === 'nuclide_notification') {
        if (!body.data) {
          throw new Error('Invariant violation: "body.data"');
        }

        this._sendAtomNotification(body.data.type, body.output);
      }
    }), this._session.observeInitializeEvents()
    // The first initialized event is used for breakpoint handling
    // and launch synchronization.
    .skip(1)
    // Next initialized events are session restarts.
    // Hence, we need to sync breakpoints & config done.
    .switchMap((0, _asyncToGenerator.default)(function* () {
      yield _this9._syncBreakpoints();
      yield _this9._configDone();
    })).subscribe(() => this._logger.info('Session synced'), error => this._logger.error('Unable to sync session: ', error)));
  }

  _updateThreadsState(threadIds, state) {
    for (const threadId of threadIds) {
      const threadInfo = this._threadsById.get(threadId);
      if (threadInfo == null || state === 'running') {
        this._threadsById.set(threadId, { state });
      } else {
        this._threadsById.set(threadId, Object.assign({}, threadInfo, {
          state
        }));
      }
    }
  }

  _getThreadsUpdatedEvent() {
    const threads = Array.from(this._threadsById.entries()).map(([id, { state, callFrames, stopReason }]) => {
      const topCallFrame = callFrames == null ? null : callFrames[0];
      const threadName = `Thread ${id}`;

      let address;
      let location;
      let hasSource;
      if (topCallFrame == null) {
        address = '';
        location = nuclideDebuggerLocation('N/A', 0, 0);
        hasSource = false;
      } else {
        address = topCallFrame.functionName;
        location = Object.assign({}, topCallFrame.location);
        hasSource = topCallFrame.hasSource === true;
      }

      return {
        id,
        name: threadName,
        description: threadName,
        address,
        location,
        // flowlint-next-line sketchy-null-string:off
        stopReason: stopReason || 'running',
        hasSource
      };
    });

    return {
      owningProcessId: VSP_PROCESS_ID,
      // flowlint-next-line sketchy-null-number:off
      stopThreadId: this._pausedThreadId || -1,
      threads
    };
  }

  initilize() {
    return this._session.initialize({
      clientID: 'Nuclide',
      adapterID: 'python' /* TODO(most) */
      , linesStartAt1: true,
      columnsStartAt1: true,
      supportsVariableType: true,
      supportsVariablePaging: false,
      supportsRunInTerminalRequest: false,
      pathFormat: 'path'
    });
  }

  processCommand(command) {
    this._commands.next(command);
  }

  _getTranslatedCallFramesForThread(threadId) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { body: { stackFrames } } = yield _this10._session.stackTrace({
        threadId
      });
      return Promise.all(stackFrames.map((() => {
        var _ref19 = (0, _asyncToGenerator.default)(function* (frame) {
          let scriptId;
          if (frame.source != null && frame.source.path != null) {
            scriptId = frame.source.path;
          } else {
            _this10._logger.error('Cannot find source/script of frame: ', frame);
            scriptId = 'N/A';
          }
          yield _this10._files.registerFile((0, (_helpers || _load_helpers()).pathToUri)(scriptId));
          return {
            callFrameId: String(frame.id),
            functionName: frame.name,
            location: nuclideDebuggerLocation(scriptId, frame.line - 1, frame.column - 1),
            hasSource: frame.source != null,
            scopeChain: yield _this10._getScopesForFrame(frame.id),
            this: undefined
          };
        });

        return function (_x18) {
          return _ref19.apply(this, arguments);
        };
      })()));
    })();
  }

  _getScopesForFrame(frameId) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { body: { scopes } } = yield _this11._session.scopes({ frameId });
      return scopes.map(function (scope) {
        return {
          type: scope.name,
          name: scope.name,
          object: {
            type: 'object',
            description: scope.name,
            objectId: String(scope.variablesReference)
          }
        };
      });
    })();
  }

  _getProperties(id, params) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const variablesReference = Number(params.objectId);
      const { body: { variables } } = yield _this12._session.variables({
        variablesReference
      });
      const propertyDescriptors = variables.map(function (variable) {
        const value = {
          type: variable.type,
          value: variable.value,
          description: variable.value,
          objectId: variable.variablesReference > 0 ? String(variable.variablesReference) : undefined
        };
        return {
          name: variable.name,
          value,
          configurable: false,
          enumerable: true
        };
      });
      return {
        result: propertyDescriptors
      };
    })();
  }

  _sendMessageToClient(message) {
    this._logger.info('Sent message to client', JSON.stringify(message));
    this._clientCallback.sendChromeMessage(JSON.stringify(message));
  }

  _sendAtomNotification(level, message) {
    this._clientCallback.sendAtomNotification(level, message);
  }

  _sendUserOutputMessage(level, text) {
    const message = { level, text };
    this._clientCallback.sendUserOutputMessage(JSON.stringify(message));
  }

  observeSessionEnd() {
    return _rxjsBundlesRxMinJs.Observable.merge(this._session.observeExitedDebugeeEvents(), this._observeTerminatedDebugeeEvents(), this._session.observeAdapterExitedEvents()).map(() => undefined);
  }

  _observeTerminatedDebugeeEvents() {
    const debugeeTerminated = this._session.observeTerminateDebugeeEvents();
    if (this._adapterType === (_constants || _load_constants()).VsAdapterTypes.PYTHON) {
      // The python adapter normally it sends one terminated event on exit.
      // However, in program crashes, it sends two terminated events:
      // One immediatelly, followed by the output events with the stack trace
      // & then the real terminated event.
      // TODO(t19793170): Remove the extra `TerminatedEvent` from `pythonVSCode`
      return debugeeTerminated.delay(1000);
    } else {
      return debugeeTerminated;
    }
  }

  dispose() {
    this._disposables.dispose();
  }
}
exports.default = VsDebugSessionTranslator;