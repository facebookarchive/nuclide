'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _protocolTypes;

function _load_protocolTypes() {
  return _protocolTypes = _interopRequireWildcard(require('./protocol-types'));
}

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _FileCache;

function _load_FileCache() {
  return _FileCache = _interopRequireDefault(require('./FileCache'));
}

var _helpers;

function _load_helpers() {
  return _helpers = require('./helpers');
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

var _util = _interopRequireDefault(require('util'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

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

  // Session state.
  constructor(adapterType, adapter, debugMode, debuggerArgs, clientCallback, logger) {
    this._adapterType = adapterType;
    this._debugMode = debugMode;
    this._session = new (_VsDebugSession || _load_VsDebugSession()).default('id', logger, adapter);
    this._debuggerArgs = debuggerArgs;
    this._clientCallback = clientCallback;
    this._logger = logger;
    this._commands = new _rxjsBundlesRxMinJs.Subject();
    this._handledCommands = new Set();
    this._breakpoints = [];
    this._threadsById = new Map();
    this._lastBreakpointId = 0;
    this._configDoneSent = false;
    this._exceptionFilters = [];
    this._pausedThreadId = null;
    this._files = new (_FileCache || _load_FileCache()).default((method, params) => this._sendMessageToClient({ method, params }));

    // Ignore the first fake pause request.
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._session, this._handleCommands().subscribe(message => this._sendMessageToClient(message)), this._listenToSessionEvents());
  }

  _updatePausedThreadId(newPausedThreadId) {
    if (this._pausedThreadId != null) {
      this._pausedThreadIdPrevious = this._pausedThreadId;
    }

    this._pausedThreadId = newPausedThreadId;
  }

  _handleCommands() {
    var _this = this;

    const resumeCommands = this._commandsOfType('Debugger.resume');
    return _rxjsBundlesRxMinJs.Observable.merge(
    // Ack debugger enabled and send fake pause event
    // (indicating readiness to receive config requests).
    this._commandsOfType('Debugger.enable').flatMap(command => _rxjsBundlesRxMinJs.Observable.of(getEmptyResponse(command.id), getFakeLoaderPauseEvent())), this._commandsOfType('Debugger.pause').flatMap(catchCommandError((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (command) {
        const pausedThreadId = _this._pausedThreadId != null ? _this._pausedThreadId : Array.from(_this._threadsById.keys())[0] || -1;
        _this._updatePausedThreadId(null);
        yield _this._session.pause({ threadId: pausedThreadId });
        return getEmptyResponse(command.id);
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })())),
    // Skip the fake resume command.
    resumeCommands.skip(1).flatMap(catchCommandError((() => {
      var _ref3 = (0, _asyncToGenerator.default)(function* (command) {
        const threadId = _this._pausedThreadId != null ? _this._pausedThreadId : -1;
        yield _this._session.continue({ threadId });
        return getEmptyResponse(command.id);
      });

      return function (_x3) {
        return _ref3.apply(this, arguments);
      };
    })())),
    // Select thread.
    this._commandsOfType('Debugger.selectThread').flatMap(command => {
      if (!(command.method === 'Debugger.selectThread')) {
        throw new Error('Invariant violation: "command.method === \'Debugger.selectThread\'"');
      }

      this._updatePausedThreadId(command.params.threadId);
      return _rxjsBundlesRxMinJs.Observable.of(getEmptyResponse(command.id));
    }),
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
    // Request completions
    this._commandsOfType('Debugger.completions').flatMap(catchCommandError((() => {
      var _ref7 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Debugger.completions')) {
          throw new Error('Invariant violation: "command.method === \'Debugger.completions\'"');
        }

        const { text, column, frameId } = command.params;
        if (!_this._session.getCapabilities().supportsCompletionsRequest) {
          // Not supported, return empty result.
          return { id: command.id, result: { targets: [] } };
        }
        const { body } = yield _this._session.completions({
          text,
          column,
          frameId
        });
        const result = {
          targets: body.targets
        };
        return { id: command.id, result };
      });

      return function (_x7) {
        return _ref7.apply(this, arguments);
      };
    })())),
    // Get script source
    this._commandsOfType('Debugger.getScriptSource').flatMap(catchCommandError((() => {
      var _ref8 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Debugger.getScriptSource')) {
          throw new Error('Invariant violation: "command.method === \'Debugger.getScriptSource\'"');
        }

        const result = {
          scriptSource: yield _this._files.getFileSource(command.params.scriptId)
        };
        return { id: command.id, result };
      });

      return function (_x8) {
        return _ref8.apply(this, arguments);
      };
    })())), this._commandsOfType('Debugger.setPauseOnExceptions').switchMap(catchCommandError((() => {
      var _ref9 = (0, _asyncToGenerator.default)(function* (command) {
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
        if (_this._configDoneSent) {
          yield _this._session.setExceptionBreakpoints({
            filters: _this._exceptionFilters
          });
        }
        return getEmptyResponse(command.id);
      });

      return function (_x9) {
        return _ref9.apply(this, arguments);
      };
    })())), this._commandsOfType('Debugger.continueToLocation').switchMap(catchCommandError((() => {
      var _ref10 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Debugger.continueToLocation')) {
          throw new Error('Invariant violation: "command.method === \'Debugger.continueToLocation\'"');
        }

        const { location } = command.params;
        yield _this._continueToLocation(location);
        return getEmptyResponse(command.id);
      });

      return function (_x10) {
        return _ref10.apply(this, arguments);
      };
    })())),
    // Ack config commands
    _rxjsBundlesRxMinJs.Observable.merge(this._commandsOfType('Debugger.setDebuggerSettings'), this._commandsOfType('Runtime.enable')).map(command => getEmptyResponse(command.id)),
    // Get properties
    this._commandsOfType('Runtime.getProperties').flatMap(catchCommandError((() => {
      var _ref11 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Runtime.getProperties')) {
          throw new Error('Invariant violation: "command.method === \'Runtime.getProperties\'"');
        }

        const result = yield _this._getProperties(command.id, command.params);
        return { id: command.id, result };
      });

      return function (_x11) {
        return _ref11.apply(this, arguments);
      };
    })())),
    // Set breakpoints
    this._handleSetBreakpointsCommands(),
    // Ack first resume command (indicating the session is ready to start).
    resumeCommands.take(1).map(command => getEmptyResponse(command.id)),
    // Remove breakpoints
    this._commandsOfType('Debugger.removeBreakpoint').flatMap(catchCommandError((() => {
      var _ref12 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Debugger.removeBreakpoint')) {
          throw new Error('Invariant violation: "command.method === \'Debugger.removeBreakpoint\'"');
        }

        yield _this._removeBreakpoint(command.params.breakpointId);
        return getEmptyResponse(command.id);
      });

      return function (_x12) {
        return _ref12.apply(this, arguments);
      };
    })())), this._commandsOfType('Debugger.getThreadStack').flatMap((() => {
      var _ref13 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Debugger.getThreadStack')) {
          throw new Error('Invariant violation: "command.method === \'Debugger.getThreadStack\'"');
        }

        const { threadId } = command.params;
        const threadInfo = _this._threadsById.get(threadId);
        let callFrames = null;
        if (threadInfo != null && threadInfo.state === 'paused') {
          callFrames = threadInfo.callFrames;
          if (threadInfo.callFrames == null || threadInfo.callFrames.length === 0 || !threadInfo.callStackLoaded) {
            // Need to fetch this thread's frames.
            threadInfo.callFrames = yield _this._getTranslatedCallFramesForThread(command.params.threadId, null);
            callFrames = threadInfo.callFrames;
          }
        }
        const result = {
          callFrames: callFrames || []
        };
        return {
          id: command.id,
          result
        };
      });

      return function (_x13) {
        return _ref13.apply(this, arguments);
      };
    })()), this._commandsOfType('Debugger.evaluateOnCallFrame').flatMap((() => {
      var _ref14 = (0, _asyncToGenerator.default)(function* (command) {
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

      return function (_x14) {
        return _ref14.apply(this, arguments);
      };
    })()), this._commandsOfType('Debugger.setVariableValue').flatMap(catchCommandError((() => {
      var _ref15 = (0, _asyncToGenerator.default)(function* (command) {
        if (!(command.method === 'Debugger.setVariableValue')) {
          throw new Error('Invariant violation: "command.method === \'Debugger.setVariableValue\'"');
        }

        const { callFrameId, name, value } = command.params;
        const args = {
          variablesReference: callFrameId,
          name,
          value
        };
        const { body } = yield _this._session.setVariable(args);
        const result = {
          value: body.value
        };
        return {
          id: command.id,
          result
        };
      });

      return function (_x15) {
        return _ref15.apply(this, arguments);
      };
    })())), this._commandsOfType('Runtime.evaluate').flatMap((() => {
      var _ref16 = (0, _asyncToGenerator.default)(function* (command) {
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

      return function (_x16) {
        return _ref16.apply(this, arguments);
      };
    })()),
    // Error for unhandled commands
    this._unhandledCommands().map(command => getErrorResponse(command.id, 'Unknown command: ' + command.method)));
  }

  _continueToLocation(location) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { columnNumber, lineNumber, scriptId, threadId } = location;
      const source = {
        path: (_nuclideUri || _load_nuclideUri()).default.getPath(scriptId),
        name: (_nuclideUri || _load_nuclideUri()).default.basename(scriptId)
      };
      yield _this2._files.registerFile((0, (_helpers || _load_helpers()).pathToUri)(scriptId));
      const args = {
        // flowlint-next-line sketchy-null-number:off
        column: columnNumber || 1,
        line: lineNumber + 1,
        source
      };
      if (threadId != null) {
        args.threadId = threadId;
      }
      yield _this2._session.nuclide_continueToLocation(args);
    })();
  }

  _handleSetBreakpointsCommands() {
    var _this3 = this;

    const setBreakpointsCommands = this._commandsOfType('Debugger.setBreakpointByUrl');

    return _rxjsBundlesRxMinJs.Observable.concat(setBreakpointsCommands.buffer(this._commandsOfType('Debugger.resume').first().switchMap((0, _asyncToGenerator.default)(function* () {
      yield _this3._startDebugging();
      if (!_this3._session.isReadyForBreakpoints()) {
        yield _this3._session.observeInitializeEvents().first().toPromise();
      }
    }))).first().flatMap((() => {
      var _ref18 = (0, _asyncToGenerator.default)(function* (commands) {
        // Upon session start, send the cached breakpoints
        // and other configuration requests.
        try {
          const breakpoints = yield _this3._setBulkBreakpoints(commands);
          yield _this3._configDone();
          return breakpoints;
        } catch (error) {
          return commands.map(function ({ id }) {
            return getErrorResponse(id, error.message);
          });
        }
      });

      return function (_x17) {
        return _ref18.apply(this, arguments);
      };
    })()),
    // Following breakpoint requests are handled by
    // immediatelly passing to the active debug session.
    setBreakpointsCommands.flatMap((() => {
      var _ref19 = (0, _asyncToGenerator.default)(function* (command) {
        try {
          return yield _this3._setBulkBreakpoints([command]);
        } catch (error) {
          return [getErrorResponse(command.id, error.message)];
        }
      });

      return function (_x18) {
        return _ref19.apply(this, arguments);
      };
    })())).flatMap(responses => _rxjsBundlesRxMinJs.Observable.from(responses));
  }

  _startDebugging() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        if (_this4._debugMode === 'launch') {
          yield _this4._session.launch(_this4._debuggerArgs);
        } else {
          yield _this4._session.attach(_this4._debuggerArgs);
        }
      } catch (error) {
        _this4._terminateSessionWithError(`Failed to ${_this4._debugMode} the debugger!`, error);
      }
    })();
  }

  _setBulkBreakpoints(setBreakpointsCommands) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this5._session.isReadyForBreakpoints()) {
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
        var _ref20 = (0, _asyncToGenerator.default)(function* ([url, breakpointCommands]) {
          const path = (0, (_helpers || _load_helpers()).uriToPath)(url);

          const existingTranslatorBreakpoints = _this5._getBreakpointsForFilePath(path).map(function (bp) {
            return Object.assign({}, bp);
          });

          const breakOnLineNumbers = new Set();

          const translatorBreakpoins = breakpointCommands.map(function (c) {
            const newTranslatorBp = {
              breakpointId: null,
              path,
              lineNumber: c.params.lineNumber + 1,
              condition: c.params.condition || '',
              resolved: false,
              hitCount: 0
            };
            breakOnLineNumbers.add(newTranslatorBp.lineNumber);
            _this5._breakpoints.push(newTranslatorBp);
            return newTranslatorBp;
          }).concat(existingTranslatorBreakpoints.filter(function (tBp) {
            return !breakOnLineNumbers.has(tBp.lineNumber);
          }));

          yield _this5._files.registerFile(url);
          yield _this5._syncBreakpointsForFilePath(path, translatorBreakpoins);

          return breakpointCommands.map(function (command, i) {
            const { breakpointId, lineNumber, resolved } = translatorBreakpoins[i];

            if (!(breakpointId != null)) {
              throw new Error('Invariant violation: "breakpointId != null"');
            }

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

        return function (_x19) {
          return _ref20.apply(this, arguments);
        };
      })()));
      return (0, (_collection || _load_collection()).arrayFlatten)(responseGroups);
    })();
  }

  _syncBreakpoints() {
    const filePaths = new Set(this._breakpoints.map(bp => bp.path));
    const setBreakpointPromises = [];
    for (const filePath of filePaths) {
      setBreakpointPromises.push(this._syncBreakpointsForFilePath(filePath, this._getBreakpointsForFilePath(filePath).map(bp => Object.assign({}, bp))));
    }
    return Promise.all(setBreakpointPromises);
  }

  _configDone() {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this6._session.setExceptionBreakpoints({
        filters: _this6._exceptionFilters
      });
      if (_this6._session.getCapabilities().supportsConfigurationDoneRequest) {
        yield _this6._session.configurationDone();
      }
      _this6._configDoneSent = true;
    })();
  }

  _tryUpdateBreakpoint(breakpoint, vsBreakpoint) {
    if (!breakpoint.resolved && vsBreakpoint.verified) {
      breakpoint.resolved = true;
    }

    if (vsBreakpoint.line != null) {
      const lineNumber = parseInt(vsBreakpoint.line, 10);
      if (!Number.isNaN(lineNumber) && lineNumber !== breakpoint.line) {
        // Breakpoint resolved to a different line number by the engine.
        breakpoint.lineNumber = lineNumber;
      }
    }
  }

  _syncBreakpointsForFilePath(path, breakpoints) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const source = { path, name: (_nuclideUri || _load_nuclideUri()).default.basename(path) };
      const {
        body: { breakpoints: vsBreakpoints }
      } = yield _this7._session.setBreakpoints({
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
        _this7._logger.error(errorMessage, JSON.stringify(vsBreakpoints), JSON.stringify(breakpoints));
        throw new Error(errorMessage);
      }
      vsBreakpoints.forEach(function (vsBreakpoint, i) {
        if (breakpoints[i].breakpointId == null) {
          breakpoints[i].breakpointId = String(vsBreakpoint.id == null ? _this7._nextBreakpointId() : vsBreakpoint.id);
        }
        _this7._tryUpdateBreakpoint(breakpoints[i], vsBreakpoint);
      });
    })();
  }

  _removeBreakpoint(breakpointId) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const foundBreakpointIdx = _this8._breakpoints.findIndex(function (bp) {
        return bp.breakpointId === breakpointId;
      });
      if (foundBreakpointIdx === -1) {
        _this8._logger.info(`No breakpoint with id: ${breakpointId} to remove!`);
        return;
      }
      const foundBreakpoint = _this8._breakpoints[foundBreakpointIdx];
      const remainingBreakpoints = _this8._getBreakpointsForFilePath(foundBreakpoint.path).filter(function (breakpoint) {
        return breakpoint.breakpointId !== breakpointId;
      });
      _this8._breakpoints.splice(foundBreakpointIdx, 1);

      yield _this8._syncBreakpointsForFilePath(foundBreakpoint.path, remainingBreakpoints.map(function (bp) {
        return Object.assign({}, bp);
      }));
    })();
  }

  _evaluateOnCallFrame(expression, frameId) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        const { body } = yield _this9._session.evaluate({
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
      } catch (error) {
        return {
          result: {
            type: 'undefined'
          },
          exceptionDetails: error.message,
          wasThrown: true
        };
      }
    })();
  }

  _getBreakpointsForFilePath(path) {
    return this._breakpoints.filter(breakpoint => breakpoint.path === path);
  }

  _nextBreakpointId() {
    return ++this._lastBreakpointId;
  }

  _commandsOfType(type) {
    this._handledCommands.add(type);
    return this._commands.filter(c => c.method === type);
  }

  _unhandledCommands() {
    return this._commands.filter(c => !this._handledCommands.has(c.method));
  }

  _listenToSessionEvents() {
    var _this10 = this;

    // The first resume command is the indicator of client readiness
    // to receive session events.
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._session.observeAllEvents().subscribe(event => {
      this._logger.info('VSP Event', event);
    }), this._session.observeThreadEvents().subscribe(({ body }) => {
      const { reason, threadId } = body;
      if (reason === 'started') {
        this._updateThreadsState([threadId], 'running');
      } else if (reason === 'exited') {
        this._threadsById.delete(threadId);
        if (this._pausedThreadId === threadId) {
          this._updatePausedThreadId(null);
        }
      } else {
        this._logger.error('Unknown thread event:', body);
      }
      const threadsUpdatedEvent = this._getThreadsUpdatedEvent();
      this._sendMessageToClient({
        method: 'Debugger.threadsUpdated',
        params: threadsUpdatedEvent
      });
    }), this._session.observeBreakpointEvents().subscribe(({ body }) => {
      const { breakpoint } = body;
      const bpId = String(breakpoint.id == null ? -1 : breakpoint.id);

      // Find an existing breakpoint. Note the protocol doesn't provide
      // an original line here, only the resolved line. If the bp had to
      // be moved by the backend, this fails to find a match.
      const existingBreakpoint = this._breakpoints.find(bp => bp.breakpointId === bpId || bp.breakpointId == null && bp.lineNumber === (breakpoint.originalLine != null ? breakpoint.originalLine : breakpoint.line) && breakpoint.source != null && bp.path === breakpoint.source.path);
      const hitCount = parseInt(breakpoint.nuclide_hitCount, 10);

      if (existingBreakpoint == null) {
        this._logger.warn('Received a breakpoint event, but cannot find the breakpoint');
        return;
      } else if (breakpoint.verified) {
        this._tryUpdateBreakpoint(existingBreakpoint, breakpoint);
        this._sendMessageToClient({
          method: 'Debugger.breakpointResolved',
          params: {
            breakpointId: bpId,
            location: nuclideDebuggerLocation(existingBreakpoint.path, existingBreakpoint.lineNumber - 1, 0)
          }
        });
      } else if (!Number.isNaN(hitCount) && existingBreakpoint != null && existingBreakpoint.hitCount !== hitCount) {
        existingBreakpoint.hitCount = hitCount;
        this._sendMessageToClient({
          method: 'Debugger.breakpointHitCountChanged',
          params: {
            breakpointId: bpId,
            hitCount
          }
        });
      } else {
        this._logger.warn('Unknown breakpoint event', body);
      }
    }), this._session.observeStopEvents().flatMap(({ body }) => {
      const { threadId, reason } = body;
      let { allThreadsStopped } = body;

      // Compatibility work around:
      //   Even though the python debugger engine pauses all threads,
      //   It only reports the main thread as paused. For this engine,
      //   behave as if allThreadsStopped == true.
      if (this._adapterType === (_constants || _load_constants()).VsAdapterTypes.PYTHON && reason === 'user request') {
        allThreadsStopped = true;
      }

      const stoppedThreadIds = [];
      if (threadId != null && threadId >= 0) {
        // If a threadId was specified, always ask for the stack for that
        // thread.
        stoppedThreadIds.push(threadId);
      }

      if (allThreadsStopped) {
        // If all threads are stopped or no stop thread was specified, ask
        // for updated stacks from any thread that is not already paused.
        const allStoppedIds = Array.from(this._threadsById.keys()).filter(id => {
          const threadInfo = this._threadsById.get(id);
          return id !== threadId && threadInfo != null && threadInfo.state !== 'paused';
        });

        if (allStoppedIds.length > 0) {
          stoppedThreadIds.push(...allStoppedIds);
        }
      }

      // If this is the first thread to stop, use the stop thread ID
      // from this event as the currently selected thread in the UX.
      if (this._pausedThreadId == null && stoppedThreadIds.length > 0) {
        this._updatePausedThreadId(stoppedThreadIds[0]);
      }

      return _rxjsBundlesRxMinJs.Observable.fromPromise(Promise.all(stoppedThreadIds.map((() => {
        var _ref21 = (0, _asyncToGenerator.default)(function* (id) {
          let callFrames = [];
          try {
            callFrames = _this10._pausedThreadId === threadId ? yield _this10._getTranslatedCallFramesForThread(id, null) : yield _this10._getTranslatedCallFramesForThread(id, 1);
          } catch (e) {
            callFrames = [];
          }
          const threadSwitchMessage = _this10._pausedThreadIdPrevious != null && _this10._pausedThreadId != null && _this10._pausedThreadIdPrevious !== _this10._pausedThreadId ? `Active thread switched from thread #${_this10._pausedThreadIdPrevious} to thread #${_this10._pausedThreadId}` : null;
          const pausedEvent = {
            callFrames,
            reason,
            stopThreadId: id,
            threadSwitchMessage
          };
          return pausedEvent;
        });

        return function (_x20) {
          return _ref21.apply(this, arguments);
        };
      })()))).takeUntil(
      // Stop processing this stop event if a continue event is seen before
      // the stop event is completely processed and sent to the UX.
      this._session.observeContinuedEvents().filter(e => e.body.allThreadsContinued === true || e.body.threadId == null || e.body.threadId === threadId)).take(1);
    }).subscribe(pausedEvents => {
      for (const pausedEvent of pausedEvents) {
        // Mark the affected threads as paused and update their call frames.
        const { stopThreadId } = pausedEvent;
        if (stopThreadId != null && stopThreadId >= 0) {
          this._threadsById.set(stopThreadId, {
            state: 'paused',
            callFrames: pausedEvent.callFrames,
            stopReason: pausedEvent.reason,
            callStackLoaded: this._pausedThreadId === stopThreadId
          });
        }
      }

      let pausedEvent = null;
      if (pausedEvents.length === 0) {
        // This is expected in the case of an async-break where the
        // target has no threads running. We need to raise a Chrome
        // event or the UX spins forever and hangs.
        pausedEvent = {
          callFrames: [],
          reason: 'Async-Break',
          stopThreadId: -1,
          threadSwitchMessage: null
        };
      } else if (this._pausedThreadId === pausedEvents[0].stopThreadId && pausedEvents[0].stopThreadId != null) {
        // Only send Debugger.Paused for the first thread that stops
        // the debugger. Otherwise, we cause the selected thread in the
        // UX to jump around as additional threads pause.
        pausedEvent = pausedEvents[0];
      }

      if (pausedEvent != null) {
        this._sendMessageToClient({
          method: 'Debugger.paused',
          params: pausedEvent
        });
      }

      const threadsUpdatedEvent = this._getThreadsUpdatedEvent();
      threadsUpdatedEvent.stopThreadId = this._pausedThreadId != null ? this._pausedThreadId : -1;
      this._sendMessageToClient({
        method: 'Debugger.threadsUpdated',
        params: threadsUpdatedEvent
      });
    }, error => this._terminateSessionWithError('Unable to translate stop event / call stack', error)), this._session.observeContinuedEvents().subscribe(({ body }) => {
      const { threadId } = body;
      let { allThreadsContinued } = body;

      if (threadId == null || threadId < 0) {
        allThreadsContinued = true;
      }

      if (allThreadsContinued || threadId === this._pausedThreadId) {
        this._updatePausedThreadId(null);
      }

      const continuedThreadIds = allThreadsContinued ? Array.from(this._threadsById.keys()).filter(id => {
        const threadInfo = this._threadsById.get(id);
        return threadInfo != null && threadInfo.state !== 'running';
      }) : [threadId];

      this._updateThreadsState(continuedThreadIds, 'running');
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
      yield _this10._syncBreakpoints();
      yield _this10._configDone();
    })).subscribe(() => this._logger.info('Session synced'), error => this._terminateSessionWithError('Unable to sync session', error)));
  }

  _terminateSessionWithError(errorMessage, error) {
    this._logger.error(errorMessage, error);
    this._sendAtomNotification('error', `${errorMessage}<br/>` + _util.default.format(error));
    this.dispose();
  }

  _updateThreadsState(threadIds, state) {
    for (const threadId of threadIds) {
      const threadInfo = this._threadsById.get(threadId);
      if (threadInfo == null || state === 'running') {
        this._threadsById.set(threadId, { state, callStackLoaded: false });
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
      threads
    };
  }

  initilize() {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this11._session.initialize({
        clientID: 'Nuclide',
        adapterID: _this11._adapterType,
        linesStartAt1: true,
        columnsStartAt1: true,
        supportsVariableType: true,
        supportsVariablePaging: false,
        supportsRunInTerminalRequest: false,
        pathFormat: 'path'
      });
    })();
  }

  processCommand(command) {
    this._commands.next(command);
  }

  _getTranslatedCallFramesForThread(threadId, levels = null) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        const options = {};
        if (levels != null && _this12._session.getCapabilities().supportsDelayedStackTraceLoading === true) {
          options.levels = levels;
          options.startFrame = 0;
        }
        const { body: { stackFrames } } = yield _this12._session.stackTrace(Object.assign({
          threadId
        }, options));
        // $FlowFixMe(>=0.55.0) Flow suppress
        return Promise.all(stackFrames.map((() => {
          var _ref23 = (0, _asyncToGenerator.default)(function* (frame) {
            let scriptId;
            if (frame.source != null && frame.source.path != null) {
              scriptId = frame.source.path;
            } else {
              _this12._logger.error('Cannot find source/script of frame: ', frame);
              scriptId = 'N/A';
            }
            yield _this12._files.registerFile((0, (_helpers || _load_helpers()).pathToUri)(scriptId));
            return {
              callFrameId: String(frame.id),
              functionName: frame.name,
              location: nuclideDebuggerLocation(scriptId, frame.line - 1, frame.column - 1),
              hasSource: frame.source != null,
              scopeChain: yield _this12._getScopesForFrame(frame.id),
              this: undefined
            };
          });

          return function (_x21) {
            return _ref23.apply(this, arguments);
          };
        })()));
      } catch (e) {
        // This is expected in some situations, such as if stacks were requested
        // asynchronously but the target resumed before the request was received.
        // Throwing here or failing to provide a stack completely breaks the
        // state machine in the Nuclide UX layer.
        _this12._logger.error('Could not get stack traces: ', e.message);
        return [];
      }
    })();
  }

  _getScopesForFrame(frameId) {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        const { body: { scopes } } = yield _this13._session.scopes({ frameId });
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
      } catch (e) {
        // This is expected in some situations, such as if scopes were requested
        // asynchronously but the target resumed before the request was received.
        _this13._logger.error('Could not get frame scopes: ', e.message);
        return [];
      }
    })();
  }

  _getProperties(id, params) {
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const variablesReference = Number(params.objectId);
      const { body: { variables } } = yield _this14._session.variables({
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
    // The service framework doesn't flush the last output messages
    // if the observables and session are eagerly terminated.
    // Hence, delaying 1 second.
    return this._session.observeTerminateDebugeeEvents().delay(1000);
  }

  getSession() {
    return this._session;
  }

  dispose() {
    this._disposables.dispose();
  }
}
exports.default = VsDebugSessionTranslator;