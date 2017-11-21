'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _BackTraceCommand;

function _load_BackTraceCommand() {
  return _BackTraceCommand = _interopRequireDefault(require('./BackTraceCommand'));
}

var _Breakpoint;

function _load_Breakpoint() {
  return _Breakpoint = _interopRequireDefault(require('./Breakpoint'));
}

var _BreakpointCollection;

function _load_BreakpointCollection() {
  return _BreakpointCollection = _interopRequireDefault(require('./BreakpointCollection'));
}

var _BreakpointCommand;

function _load_BreakpointCommand() {
  return _BreakpointCommand = _interopRequireDefault(require('./BreakpointCommand'));
}

var _CommandDispatcher;

function _load_CommandDispatcher() {
  return _CommandDispatcher = _interopRequireDefault(require('./CommandDispatcher'));
}

var _ContinueCommand;

function _load_ContinueCommand() {
  return _ContinueCommand = _interopRequireDefault(require('./ContinueCommand'));
}

var _SourceFileCache;

function _load_SourceFileCache() {
  return _SourceFileCache = _interopRequireDefault(require('./SourceFileCache'));
}

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _StepCommand;

function _load_StepCommand() {
  return _StepCommand = _interopRequireDefault(require('./StepCommand'));
}

var _NextCommand;

function _load_NextCommand() {
  return _NextCommand = _interopRequireDefault(require('./NextCommand'));
}

var _Thread;

function _load_Thread() {
  return _Thread = _interopRequireDefault(require('./Thread'));
}

var _ThreadsCommand;

function _load_ThreadsCommand() {
  return _ThreadsCommand = _interopRequireDefault(require('./ThreadsCommand'));
}

var _VariablesCommand;

function _load_VariablesCommand() {
  return _VariablesCommand = _interopRequireDefault(require('./VariablesCommand'));
}

var _ListCommand;

function _load_ListCommand() {
  return _ListCommand = _interopRequireDefault(require('./ListCommand'));
}

var _RestartCommand;

function _load_RestartCommand() {
  return _RestartCommand = _interopRequireDefault(require('./RestartCommand'));
}

var _VsDebugSession;

function _load_VsDebugSession() {
  return _VsDebugSession = _interopRequireDefault(require('../lib/VsDebugSession'));
}

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

class Debugger {

  constructor(logger, con) {
    this._threads = new Map();
    this._terminated = false;
    this._breakpoints = new (_BreakpointCollection || _load_BreakpointCollection()).default();

    this._logger = logger;
    this._console = con;
    this._sourceFiles = new (_SourceFileCache || _load_SourceFileCache()).default(this._getSourceByReference.bind(this));
  }

  registerCommands(dispatcher) {
    dispatcher.registerCommand(new (_BackTraceCommand || _load_BackTraceCommand()).default(this._console, this));
    dispatcher.registerCommand(new (_ThreadsCommand || _load_ThreadsCommand()).default(this._console, this));
    dispatcher.registerCommand(new (_StepCommand || _load_StepCommand()).default(this));
    dispatcher.registerCommand(new (_NextCommand || _load_NextCommand()).default(this));
    dispatcher.registerCommand(new (_VariablesCommand || _load_VariablesCommand()).default(this._console, this));
    dispatcher.registerCommand(new (_BreakpointCommand || _load_BreakpointCommand()).default(this._console, this));
    dispatcher.registerCommand(new (_ContinueCommand || _load_ContinueCommand()).default(this));
    dispatcher.registerCommand(new (_ListCommand || _load_ListCommand()).default(this._console, this));
    dispatcher.registerCommand(new (_RestartCommand || _load_RestartCommand()).default(this));
  }

  getThreads() {
    this._ensureDebugSession();
    return this._threads;
  }

  getActiveThread() {
    this._ensureDebugSession();
    return (0, (_nullthrows || _load_nullthrows()).default)(this._threads.get((0, (_nullthrows || _load_nullthrows()).default)(this._activeThread)));
  }

  getStackTrace(thread, levels) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { body: { stackFrames } } = yield _this._ensureDebugSession().stackTrace({
        threadId: thread,
        levels
      });
      return stackFrames;
    })();
  }

  setSelectedStackFrame(thread, frameIndex) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const frames = yield _this2.getStackTrace(thread.id(), frameIndex + 1);
      if (frames[frameIndex] == null) {
        throw new Error(`There are only ${frames.length} frames in the thread's stack trace.`);
      }
      thread.setSelectedStackFrame(frameIndex);
    })();
  }

  getCurrentStackFrame() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this3._ensureDebugSession();
      const thread = _this3.getActiveThread();
      const selectedFrame = thread.selectedStackFrame();
      const frames = yield _this3.getStackTrace(thread.id(), selectedFrame + 1);

      return frames[selectedFrame];
    })();
  }

  stepIn() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this4._ensureDebugSession().stepIn({
        threadId: _this4.getActiveThread().id()
      });
    })();
  }

  stepOver() {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this5._ensureDebugSession().next({
        threadId: _this5.getActiveThread().id()
      });
    })();
  }

  continue() {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this6._ensureDebugSession().continue({
        threadId: _this6.getActiveThread().id()
      });
    })();
  }

  getVariables(selectedScope) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this7._ensureDebugSession();

      const activeThread = _this7.getActiveThread();
      const stack = yield _this7.getStackTrace(activeThread.id(), activeThread.selectedStackFrame() + 1);
      const frameId = _this7._stackFrameId(stack, activeThread.selectedStackFrame());
      if (frameId == null) {
        return [];
      }

      const { body: { scopes } } = yield session.scopes({ frameId });

      let queries;

      if (selectedScope != null) {
        queries = scopes.filter(function (scope) {
          return scope.name === selectedScope;
        });
        if (queries.length === 0) {
          throw new Error(`There is no scope named '${selectedScope}' in the current context.`);
        }
      } else {
        queries = scopes.filter(function (scope) {
          return !scope.expensive;
        });
      }

      const executers = queries.map((() => {
        var _ref7 = (0, _asyncToGenerator.default)(function* (scope) {
          const { body: { variables } } = yield session.variables({
            variablesReference: scope.variablesReference
          });
          return [scope.variablesReference, variables];
        });

        return function (_x) {
          return _ref7.apply(this, arguments);
        };
      })());

      const results = yield Promise.all(executers);
      const resultsByVarRef = new Map(results);

      return scopes.map(function (scope) {
        return {
          expensive: scope.expensive,
          scopeName: scope.name,
          variables: resultsByVarRef.get(scope.variablesReference)
        };
      });
    })();
  }

  setSourceBreakpoint(path, line) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this8._ensureDebugSession();
      const index = _this8._breakpoints.addSourceBreakpoint(path, line);

      const breakpoint = yield _this8._setSourceBreakpointsForPath(session, path, index);

      const message = breakpoint == null ? null : breakpoint.message;
      return { index, message };
    })();
  }

  _setSourceBreakpointsForPath(session, path, indexOfInterest) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const debuggerBreakpoints = _this9._breakpoints.getAllEnabledBreakpointsForSource(path);

      const request = {
        source: { path },
        breakpoints: debuggerBreakpoints.map(function (x) {
          return { line: x.line };
        })
      };

      const {
        body: { breakpoints: adapterBreakpoints }
      } = yield session.setBreakpoints(request);

      const paired = debuggerBreakpoints.map(function (_, i) {
        return [_, adapterBreakpoints[i]];
      });

      for (const [debuggerBreakpoint, adapterBreakpoint] of paired) {
        const verified = adapterBreakpoint.verified;
        if (verified != null) {
          debuggerBreakpoint.setVerified(verified);
        }
      }

      const breakpoint = paired.find(function (_) {
        return _[0].index === indexOfInterest;
      });

      return breakpoint == null ? null : breakpoint[1];
    })();
  }

  _stackFrameId(stack, depth) {
    var _ref, _ref2;

    return (_ref = stack) != null ? (_ref2 = _ref[depth]) != null ? _ref2.id : _ref2 : _ref;
  }

  getSourceLines(source, start, length) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // If `source' contains a non-zero sourceReference, then the adapter
      // supports returning source data; otherwise, we use the given
      // path as a local file system path.
      let lines = [];
      const sourceReference = source.sourceReference;

      if (sourceReference != null && sourceReference !== 0) {
        lines = yield _this10._sourceFiles.getFileDataBySourceReference(sourceReference);
      } else if (source.path != null) {
        lines = yield _this10._sourceFiles.getFileDataByPath(source.path);
      }

      if (start > lines.length) {
        return [];
      }

      const end = Math.min(start + length - 1, lines.length);
      return lines.slice(start - 1, end);
    })();
  }

  getAllBreakpoints() {
    return this._breakpoints.getAllBreakpoints();
  }

  getBreakpointByIndex(index) {
    return this._breakpoints.getBreakpointByIndex(index);
  }

  setBreakpointEnabled(index, enabled) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this11._ensureDebugSession();
      const breakpoint = _this11._breakpoints.getBreakpointByIndex(index);
      const path = breakpoint.path;

      if (breakpoint.enabled === enabled) {
        return;
      }

      breakpoint.setEnabled(enabled);

      if (path != null) {
        try {
          yield _this11._setSourceBreakpointsForPath(session, path, index);
        } catch (error) {
          breakpoint.setEnabled(!enabled);
          throw error;
        }
        return;
      }
      // $TODO function breakpoints
    })();
  }

  deleteBreakpoint(index) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this12._ensureDebugSession();
      const breakpoint = _this12._breakpoints.getBreakpointByIndex(index);
      const path = breakpoint.path;

      _this12._breakpoints.deleteBreakpoint(index);

      if (path != null) {
        const pathBreakpoints = _this12._breakpoints.getAllEnabledBreakpointsForSource(path);

        yield session.setBreakpoints({
          source: { path },
          breakpoints: pathBreakpoints.map(function (x) {
            return { line: x.line };
          })
        });
      }
    })();
  }

  // launch is for launching a process from scratch when we need a new
  // session
  launch(adapter) {
    this._adapter = adapter;
    this._breakpoints = new (_BreakpointCollection || _load_BreakpointCollection()).default();
    return this.relaunch();
  }

  // relaunch is for when we want to restart the current process
  // without tearing down the session. some adapters can do this
  // automatically
  relaunch() {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const adapter = _this13._adapter;
      if (adapter == null) {
        throw new Error('There is nothing to relaunch.');
      }

      _this13._launching = true;
      yield _this13.closeSession();
      yield _this13.createSession(adapter.adapterInfo);
      yield _this13._ensureDebugSession().launch(adapter.launchArgs);
      yield _this13._cacheThreads();
      _this13._launching = false;
    })();
  }

  createSession(adapterInfo) {
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this14._terminated = false;
      _this14._console.stopInput();

      _this14._debugSession = new (_VsDebugSession || _load_VsDebugSession()).default(process.pid.toString(), _this14._logger, adapterInfo);

      _this14._initializeObservers();

      if (!(_this14._debugSession != null)) {
        throw new Error('Invariant violation: "this._debugSession != null"');
      }

      const { body } = yield _this14._debugSession.initialize({
        adapterID: 'fbdb',
        pathFormat: 'path',
        linesStartAt1: true,
        columnsStartAt1: true
      });

      _this14._capabilities = body;
    })();
  }

  _finishInitialization() {
    var _this15 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this15._ensureDebugSession();

      yield session.setExceptionBreakpoints({ filters: [] });
      yield _this15._resetAllBreakpoints();

      if (!(_this15._capabilities != null)) {
        throw new Error('Invariant violation: "this._capabilities != null"');
      }

      if (_this15._capabilities.supportsConfigurationDoneRequest) {
        yield session.configurationDone();
      }
    })();
  }

  _resetAllBreakpoints() {
    var _this16 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this16._ensureDebugSession();

      const sourceBreakpoints = _this16._breakpoints.getAllEnabledBreakpointsByPath();

      yield Promise.all(Array.from(sourceBreakpoints).map((() => {
        var _ref8 = (0, _asyncToGenerator.default)(function* ([path, breakpointLines]) {
          const lines = breakpointLines.map(function (_) {
            return {
              verified: false,
              line: _.line
            };
          });

          const source = {
            path
          };

          const {
            body: { breakpoints: breakpointsOut }
          } = yield session.setBreakpoints({
            source,
            breakpoints: lines
          });

          for (const breakpointOut of breakpointsOut) {
            const { verified, line } = breakpointOut;
            const breakpoint = breakpointLines.find(function (_) {
              return _.line === line;
            });
            if (breakpoint != null) {
              breakpoint.setVerified(verified);
            }
          }
        });

        return function (_x2) {
          return _ref8.apply(this, arguments);
        };
      })()));
    })();
  }

  _initializeObservers() {
    const session = this._ensureDebugSession();

    session.observeInitializeEvents().subscribe(() => {
      try {
        this._finishInitialization();
      } catch (error) {
        this._console.outputLine('Failed to initialize debugging session.');
        this._console.outputLine(error.message);
        this.closeSession();
      }
    });

    session.observeOutputEvents().filter(x => x.body.category !== 'stderr' && x.body.category !== 'telemetry').subscribe(this._onOutput.bind(this));

    session.observeContinuedEvents().subscribe(this._onContinued.bind(this));

    session.observeStopEvents().subscribe(this._onStopped.bind(this));

    session.observeExitedDebugeeEvents().subscribe(this._onExitedDebugee.bind(this));

    session.observeTerminateDebugeeEvents().subscribe(this._onTerminatedDebugee.bind(this));
  }

  closeSession() {
    var _this17 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this17._debugSession == null) {
        return;
      }

      _this17._terminated = true;

      yield _this17._debugSession.disconnect();
      _this17._threads = new Map();
      _this17._debugSession = null;
      _this17._activeThread = null;

      // $TODO perf - there may be some value in not immediately flushing
      // and keeping the cache around if we reattach to the same target,
      // using watch to see if the file has changed in the meantime
      _this17._sourceFiles.flush();
    })();
  }

  _onOutput(event) {
    var _ref3, _ref4;

    const text = ((_ref3 = event) != null ? (_ref4 = _ref3.body) != null ? _ref4.output : _ref4 : _ref3) || '';
    this._console.output(text);
  }

  _onContinued(event) {
    // if the thread we're actively debugging starts running,
    // stop interactivity until the target stops again
    if (event.body.threadId === this.getActiveThread().id()) {
      this._console.stopInput();
    }
  }

  _onStopped(event) {
    var _this18 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { body: { description, threadId } } = event;

      if (description != null) {
        _this18._console.outputLine(description);
      }

      // $TODO handle allThreadsStopped
      if (threadId != null) {
        let thread = _this18._threads.get(threadId);

        if (thread == null) {
          yield _this18._cacheThreads();
          thread = _this18._threads.get(threadId);
        }

        (0, (_nullthrows || _load_nullthrows()).default)(thread).clearSelectedStackFrame();

        if (threadId === _this18.getActiveThread().id()) {
          const topOfStack = yield _this18._getTopOfStackSourceInfo(threadId);
          if (topOfStack != null) {
            _this18._console.outputLine(`${topOfStack.name}:${topOfStack.frame.line} ${topOfStack.line}`);
          }
        }
      }

      _this18._console.startInput();
    })();
  }

  _onExitedDebugee(event) {
    this._console.outputLine(`Target exited with status ${event.body.exitCode}`);
    this.closeSession();
  }

  _onTerminatedDebugee(event) {
    // Some adapters will send multiple terminated events.
    if (this._terminated || this._launching) {
      return;
    }
    this._console.outputLine('The target has exited.');
    this.closeSession();
    this._console.startInput();
  }

  _cacheThreads() {
    var _this19 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(_this19._debugSession != null)) {
        throw new Error('_cacheThreads called without session');
      }

      const { body: { threads } } = yield _this19._debugSession.threads();
      _this19._threads = new Map(threads.map(function (thd) {
        return [thd.id, new (_Thread || _load_Thread()).default(thd.id, thd.name)];
      }));

      _this19._activeThread = null;
      if (threads.length > 0) {
        _this19._activeThread = threads[0].id;
      }
    })();
  }

  _getTopOfStackSourceInfo(threadId) {
    var _this20 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // $TODO paths relative to project root?
      const frames = yield _this20.getStackTrace(threadId, 1);
      const source = Debugger._sourceFromTopFrame(frames);
      if (source == null) {
        return null;
      }

      const frame = frames[0];
      const lines = yield _this20.getSourceLines(source, frames[0].line, 1);

      let name;

      if (source.path != null) {
        const path = (_nuclideUri || _load_nuclideUri()).default.resolve(source.path);
        name = (_nuclideUri || _load_nuclideUri()).default.split(path).pop();
      } else if (source.name != null) {
        name = source.name;
      } else {
        // the spec guarantees that name is always defined on return, so
        // we should never get here.
        return null;
      }

      return {
        line: lines.length > 0 ? lines[0] : '',
        name,
        frame
      };
    })();
  }

  static _sourceFromTopFrame(frames) {
    var _ref5, _ref6;

    return ((_ref5 = frames) != null ? (_ref6 = _ref5[0]) != null ? _ref6.source : _ref6 : _ref5) || null;
  }

  _getSourceByReference(sourceReference) {
    var _this21 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { body: { content } } = yield _this21._ensureDebugSession().source({
        sourceReference
      });
      return content;
    })();
  }

  _ensureDebugSession() {
    if (this._debugSession == null) {
      throw new Error('There is no active debugging session.');
    }
    return this._debugSession;
  }
}
exports.default = Debugger;