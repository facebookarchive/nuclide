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

var _PrintCommand;

function _load_PrintCommand() {
  return _PrintCommand = _interopRequireDefault(require('./PrintCommand'));
}

var _RunCommand;

function _load_RunCommand() {
  return _RunCommand = _interopRequireDefault(require('./RunCommand'));
}

var _ThreadCollection;

function _load_ThreadCollection() {
  return _ThreadCollection = _interopRequireDefault(require('./ThreadCollection'));
}

var _VsDebugSession;

function _load_VsDebugSession() {
  return _VsDebugSession = _interopRequireDefault(require('nuclide-debugger-common/VsDebugSession'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// program is gone and not coming back

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

class Debugger {

  constructor(logger, con) {
    this._threads = new (_ThreadCollection || _load_ThreadCollection()).default();
    this._state = 'INITIALIZING';
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
    dispatcher.registerCommand(new (_PrintCommand || _load_PrintCommand()).default(this._console, this));
    dispatcher.registerCommand(new (_RunCommand || _load_RunCommand()).default(this));
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
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const adapter = _this._adapter;
      if (adapter == null) {
        throw new Error('There is nothing to relaunch.');
      }

      _this._state = 'INITIALIZING';
      yield _this.closeSession();
      yield _this.createSession(adapter);

      switch (adapter.action) {
        case 'attach':
          const attachArgs = adapter.attachArgs;

          if (!(attachArgs != null)) {
            throw new Error('Invariant violation: "attachArgs != null"');
          }

          yield _this._ensureDebugSession(true).attach(attachArgs);
          break;

        case 'launch':
          const launchArgs = adapter.launchArgs;

          if (!(launchArgs != null)) {
            throw new Error('Invariant violation: "launchArgs != null"');
          }

          yield _this._ensureDebugSession(true).launch(launchArgs);
          break;
      }
    })();
  }

  _onInitialized() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const adapter = _this2._adapter;

      if (!(adapter != null)) {
        throw new Error('Invariant violation: "adapter != null"');
      }

      _this2._state = 'CONFIGURING';

      // if we are attaching, then the process is already running, so
      // just proceed to configurationDone
      if (adapter.action === 'attach') {
        return _this2._configurationDone();
      }

      // for launching, we now open up the command prompt so the user can set
      // breakpoints
      _this2._console.startInput();
    })();
  }

  _configurationDone() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this3._ensureDebugSession(true);
      _this3._state = 'RUNNING';

      yield _this3._resetAllBreakpoints();

      // this needs to be sent last for adapters that don't support configurationDone
      yield session.setExceptionBreakpoints({ filters: [] });

      if (!(_this3._capabilities != null)) {
        throw new Error('Invariant violation: "this._capabilities != null"');
      }

      if (_this3._capabilities.supportsConfigurationDoneRequest) {
        yield session.configurationDone();
      }

      _this3._cacheThreads();
      _this3._console.stopInput();
    })();
  }

  run() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const adapter = _this4._adapter;

      if (_this4._state !== 'CONFIGURING' || adapter == null || adapter.action !== 'launch') {
        throw new Error('There is nothing to run, or already attached to a process.');
      }

      return _this4._configurationDone();
    })();
  }

  breakInto() {
    // if there is a focus thread from before, stop that one, else just
    // pick the first.
    const thread = this._threads.focusThread != null ? this._threads.focusThread : this._threads.allThreads[0];
    if (thread == null) {
      return;
    }

    this._ensureDebugSession().pause({ threadId: thread.id() });
  }

  getThreads() {
    this._ensureDebugSession();
    return this._threads;
  }

  getActiveThread() {
    this._ensureDebugSession();
    return (0, (_nullthrows || _load_nullthrows()).default)(this._threads.focusThread);
  }

  getStackTrace(thread, levels) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { body: { stackFrames } } = yield _this5._ensureDebugSession().stackTrace({
        threadId: thread,
        levels
      });
      return stackFrames;
    })();
  }

  setSelectedStackFrame(thread, frameIndex) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const frames = yield _this6.getStackTrace(thread.id(), frameIndex + 1);
      if (frames[frameIndex] == null) {
        throw new Error(`There are only ${frames.length} frames in the thread's stack trace.`);
      }
      thread.setSelectedStackFrame(frameIndex);
    })();
  }

  getCurrentStackFrame() {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this7._ensureDebugSession();
      const thread = _this7.getActiveThread();
      const selectedFrame = thread.selectedStackFrame();
      const frames = yield _this7.getStackTrace(thread.id(), selectedFrame + 1);

      return frames[selectedFrame];
    })();
  }

  stepIn() {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this8._ensureDebugSession().stepIn({
        threadId: _this8.getActiveThread().id()
      });
    })();
  }

  stepOver() {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this9._ensureDebugSession().next({
        threadId: _this9.getActiveThread().id()
      });
    })();
  }

  continue() {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this10._ensureDebugSession().continue({
        threadId: _this10.getActiveThread().id()
      });
    })();
  }

  getVariables(selectedScope) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this11._ensureDebugSession();

      const activeThread = _this11.getActiveThread();
      const stack = yield _this11.getStackTrace(activeThread.id(), activeThread.selectedStackFrame() + 1);
      const frameId = _this11._stackFrameId(stack, activeThread.selectedStackFrame());
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
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // NB this call is allowed before the program is launched
      const session = _this12._ensureDebugSession(true);
      const index = _this12._breakpoints.addSourceBreakpoint(path, line);

      let message = 'Breakpoint pending until program starts.';

      if (_this12._state !== 'CONFIGURING') {
        const breakpoint = yield _this12._setSourceBreakpointsForPath(session, path, index);
        message = breakpoint == null ? null : breakpoint.message;
      }

      return { index, message };
    })();
  }

  _setSourceBreakpointsForPath(session, path, indexOfInterest) {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const debuggerBreakpoints = _this13._breakpoints.getAllEnabledBreakpointsForSource(path);

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
        // NB the id field of the protocol Breakpoint type is optional and
        // not all adapters send it (or the breakpoint event). For these
        // adapters we won't know when an unverified breakpoint becomes
        // verified, so just assume all breakpoints are verfied, and
        // send back an explanatory message if the adapter doesn't.
        const id = adapterBreakpoint.id;
        if (id != null) {
          debuggerBreakpoint.setId(id);
          const verified = adapterBreakpoint.verified;
          if (verified != null) {
            debuggerBreakpoint.setVerified(verified);
          }
        } else {
          debuggerBreakpoint.setVerified(true);
          if (!adapterBreakpoint.verified && (adapterBreakpoint.message == null || adapterBreakpoint.message === '')) {
            adapterBreakpoint.message = 'Could not set this breakpoint. The module may not have been loaded yet.';
          }
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
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // If `source' contains a non-zero sourceReference, then the adapter
      // supports returning source data; otherwise, we use the given
      // path as a local file system path.
      let lines = [];
      const sourceReference = source.sourceReference;

      if (sourceReference != null && sourceReference !== 0) {
        lines = yield _this14._sourceFiles.getFileDataBySourceReference(sourceReference);
      } else if (source.path != null) {
        lines = yield _this14._sourceFiles.getFileDataByPath(source.path);
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
    var _this15 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this15._ensureDebugSession();
      const breakpoint = _this15._breakpoints.getBreakpointByIndex(index);
      const path = breakpoint.path;

      if (breakpoint.enabled === enabled) {
        return;
      }

      breakpoint.setEnabled(enabled);

      if (path != null) {
        try {
          yield _this15._setSourceBreakpointsForPath(session, path, index);
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
    var _this16 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this16._ensureDebugSession();
      const breakpoint = _this16._breakpoints.getBreakpointByIndex(index);
      const path = breakpoint.path;

      _this16._breakpoints.deleteBreakpoint(index);

      if (path != null) {
        const pathBreakpoints = _this16._breakpoints.getAllEnabledBreakpointsForSource(path);

        yield session.setBreakpoints({
          source: { path },
          breakpoints: pathBreakpoints.map(function (x) {
            return { line: x.line };
          })
        });
      }
    })();
  }

  evaluateExpression(expression) {
    var _this17 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this17._ensureDebugSession();

      let args = { expression, context: 'repl' };

      const frame = yield _this17.getCurrentStackFrame();
      if (frame != null) {
        args = Object.assign({}, args, { frameId: frame.id });
      }

      return session.evaluate(args);
    })();
  }

  createSession(adapter) {
    var _this18 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this18._console.stopInput();

      _this18._threads = new (_ThreadCollection || _load_ThreadCollection()).default();

      _this18._debugSession = new (_VsDebugSession || _load_VsDebugSession()).default(process.pid.toString(), _this18._logger, adapter.adapterInfo, { host: 'cli', adapter: adapter.type, isRemote: false });

      _this18._initializeObservers();

      if (!(_this18._debugSession != null)) {
        throw new Error('Invariant violation: "this._debugSession != null"');
      }

      const { body } = yield _this18._debugSession.initialize({
        adapterID: 'fbdbg',
        pathFormat: 'path',
        linesStartAt1: true,
        columnsStartAt1: true
      });

      _this18._capabilities = body;
    })();
  }

  _resetAllBreakpoints() {
    var _this19 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const session = _this19._ensureDebugSession();

      const sourceBreakpoints = _this19._breakpoints.getAllEnabledBreakpointsByPath();

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
    const session = this._ensureDebugSession(true);

    session.observeInitializeEvents().subscribe(() => {
      try {
        this._onInitialized();
      } catch (error) {
        this._console.outputLine('Failed to initialize debugging session.');
        this._console.outputLine(error.message);
        this.closeSession();
      }
    });

    session.observeOutputEvents().filter(x => x.body.category !== 'stderr' && x.body.category !== 'telemetry').subscribe(this._onOutput.bind(this));

    session.observeContinuedEvents().subscribe(this._onContinued.bind(this));

    session.observeStopEvents().subscribe(this._onStopped.bind(this));

    session.observeThreadEvents().subscribe(this._onThread.bind(this));

    session.observeExitedDebugeeEvents().subscribe(this._onExitedDebugee.bind(this));

    session.observeTerminateDebugeeEvents().subscribe(this._onTerminatedDebugee.bind(this));

    session.observeBreakpointEvents().subscribe(this._onBreakpointEvent.bind(this));
  }

  closeSession() {
    var _this20 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this20._debugSession == null) {
        return;
      }

      yield _this20._debugSession.disconnect();
      _this20._threads = new (_ThreadCollection || _load_ThreadCollection()).default();
      _this20._debugSession = null;
      _this20._activeThread = null;

      // $TODO perf - there may be some value in not immediately flushing
      // and keeping the cache around if we reattach to the same target,
      // using watch to see if the file has changed in the meantime
      _this20._sourceFiles.flush();
    })();
  }

  _onOutput(event) {
    var _ref3, _ref4;

    const text = ((_ref3 = event) != null ? (_ref4 = _ref3.body) != null ? _ref4.output : _ref4 : _ref3) || '';
    this._console.output(text);
  }

  _onContinued(event) {
    const { body: { threadId, allThreadsContinued } } = event;

    if (allThreadsContinued === true) {
      this._threads.markAllThreadsRunning();
    } else {
      this._threads.markThreadRunning(threadId);
    }

    // only turn the console off if all threads have started up again
    if (this._threads.allThreadsRunning()) {
      this._console.stopInput();
    }
  }

  _onStopped(event) {
    var _this21 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { body: { description, threadId, allThreadsStopped } } = event;

      if (description != null) {
        _this21._console.outputLine(description);
      }

      const firstStop = _this21._threads.allThreadsRunning();

      if (allThreadsStopped === true) {
        _this21._threads.markAllThreadsStopped();
        _this21._threads.allThreads.map(function (_) {
          return _.clearSelectedStackFrame();
        });
      } else if (threadId != null) {
        _this21._threads.markThreadStopped(threadId);
        (0, (_nullthrows || _load_nullthrows()).default)(_this21._threads.getThreadById(threadId)).clearSelectedStackFrame();
      } else {
        // the call didn't actually contain information about anything stopping.
        _this21._console.outputLine('stop event with no thread information ignored.');
        return;
      }

      // for now, set the focus thread to the first thread that stopped
      if (firstStop) {
        if (threadId != null) {
          _this21._threads.setFocusThread(threadId);
        } else {
          const firstStopped = _this21._threads.firstStoppedThread();

          if (!(firstStopped != null)) {
            throw new Error('Invariant violation: "firstStopped != null"');
          }

          _this21._threads.setFocusThread(firstStopped);
        }

        const topOfStack = yield _this21._getTopOfStackSourceInfo((0, (_nullthrows || _load_nullthrows()).default)(_this21._threads.focusThreadId));

        if (topOfStack != null) {
          _this21._console.outputLine(`${topOfStack.name}:${topOfStack.frame.line} ${topOfStack.line}`);
        }

        _this21._console.startInput();
      }
    })();
  }

  _onThread(event) {
    const { body: { reason, threadId } } = event;

    if (reason === 'started') {
      // to avoid a race, create a thread immediately. then call _cacheThreads,
      // which will query gdb and update the description
      this._threads.addThread(new (_Thread || _load_Thread()).default(threadId, `thread ${threadId}`));
      this._cacheThreads();
      return;
    }

    if (reason === 'exited') {
      this._threads.removeThread(threadId);
    }
  }

  _onExitedDebugee(event) {
    this._state = 'TERMINATED';

    this._console.outputLine(`Target exited with status ${event.body.exitCode}`);

    const adapter = this._adapter;

    if (!(adapter != null)) {
      throw new Error('Invariant violation: "adapter != null"');
    }

    if (adapter.action === 'launch') {
      this.relaunch();
      return;
    }

    process.exit(0);
  }

  _onTerminatedDebugee(event) {
    // Some adapters will send multiple terminated events.
    if (this._state !== 'RUNNING') {
      return;
    }

    this._state = 'TERMINATED';

    this._console.outputLine('The target has exited.');

    const adapter = this._adapter;

    if (!(adapter != null)) {
      throw new Error('Invariant violation: "adapter != null"');
    }

    if (adapter.action === 'launch') {
      this.relaunch();
      return;
    }

    process.exit(0);
  }

  _cacheThreads() {
    var _this22 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(_this22._debugSession != null)) {
        throw new Error('_cacheThreads called without session');
      }

      const { body } = yield _this22._debugSession.threads();
      const threads = (body.threads != null ? body.threads : []).map(function (_) {
        return new (_Thread || _load_Thread()).default(_.id, _.name);
      });

      _this22._threads.updateThreads(threads);
    })();
  }

  _onBreakpointEvent(event) {
    const { body: { reason, breakpoint: { id, verified } } } = event;

    if (id != null && (reason === 'new' || reason === 'changed')) {
      try {
        const breakpoint = this._breakpoints.getBreakpointById(id);
        breakpoint.setVerified(verified);
      } catch (error) {
        this._console.outputLine('Failed to verify breakpoint.');
      }
    }
  }

  _getTopOfStackSourceInfo(threadId) {
    var _this23 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // $TODO paths relative to project root?
      const frames = yield _this23.getStackTrace(threadId, 1);
      const source = Debugger._sourceFromTopFrame(frames);
      if (source == null) {
        return null;
      }

      const frame = frames[0];
      const lines = yield _this23.getSourceLines(source, frames[0].line, 1);

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
    var _this24 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { body: { content } } = yield _this24._ensureDebugSession().source({
        sourceReference
      });
      return content;
    })();
  }

  _ensureDebugSession(allowBeforeLaunch = false) {
    if (this._debugSession == null) {
      throw new Error('There is no active debugging session.');
    }

    if ((this._state === 'INITIALIZING' || this._state === 'CONFIGURING') && !allowBeforeLaunch) {
      const err = new Error("The program is not yet running (use 'run' to start it).");
      throw err;
    }

    return this._debugSession;
  }
}
exports.default = Debugger;