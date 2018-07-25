"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function DebugProtocol() {
  const data = _interopRequireWildcard(require("vscode-debugprotocol"));

  DebugProtocol = function () {
    return data;
  };

  return data;
}

function _BackTraceCommand() {
  const data = _interopRequireDefault(require("./BackTraceCommand"));

  _BackTraceCommand = function () {
    return data;
  };

  return data;
}

function _Breakpoint() {
  const data = _interopRequireDefault(require("./Breakpoint"));

  _Breakpoint = function () {
    return data;
  };

  return data;
}

function _BreakpointCollection() {
  const data = _interopRequireDefault(require("./BreakpointCollection"));

  _BreakpointCollection = function () {
    return data;
  };

  return data;
}

function _BreakpointCommand() {
  const data = _interopRequireDefault(require("./BreakpointCommand"));

  _BreakpointCommand = function () {
    return data;
  };

  return data;
}

function _CommandDispatcher() {
  const data = _interopRequireDefault(require("./CommandDispatcher"));

  _CommandDispatcher = function () {
    return data;
  };

  return data;
}

function _ContinueCommand() {
  const data = _interopRequireDefault(require("./ContinueCommand"));

  _ContinueCommand = function () {
    return data;
  };

  return data;
}

function _EnterCodeCommand() {
  const data = _interopRequireDefault(require("./EnterCodeCommand"));

  _EnterCodeCommand = function () {
    return data;
  };

  return data;
}

function _SourceFileCache() {
  const data = _interopRequireDefault(require("./SourceFileCache"));

  _SourceFileCache = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _StepCommand() {
  const data = _interopRequireDefault(require("./StepCommand"));

  _StepCommand = function () {
    return data;
  };

  return data;
}

function _NextCommand() {
  const data = _interopRequireDefault(require("./NextCommand"));

  _NextCommand = function () {
    return data;
  };

  return data;
}

function _Thread() {
  const data = _interopRequireDefault(require("./Thread"));

  _Thread = function () {
    return data;
  };

  return data;
}

function _ThreadsCommand() {
  const data = _interopRequireDefault(require("./ThreadsCommand"));

  _ThreadsCommand = function () {
    return data;
  };

  return data;
}

function _VariablesCommand() {
  const data = _interopRequireDefault(require("./VariablesCommand"));

  _VariablesCommand = function () {
    return data;
  };

  return data;
}

function _ListCommand() {
  const data = _interopRequireDefault(require("./ListCommand"));

  _ListCommand = function () {
    return data;
  };

  return data;
}

function _RestartCommand() {
  const data = _interopRequireDefault(require("./RestartCommand"));

  _RestartCommand = function () {
    return data;
  };

  return data;
}

function _PrintCommand() {
  const data = _interopRequireDefault(require("./PrintCommand"));

  _PrintCommand = function () {
    return data;
  };

  return data;
}

function _RunCommand() {
  const data = _interopRequireDefault(require("./RunCommand"));

  _RunCommand = function () {
    return data;
  };

  return data;
}

function _ThreadCollection() {
  const data = _interopRequireDefault(require("./ThreadCollection"));

  _ThreadCollection = function () {
    return data;
  };

  return data;
}

function _VsDebugSession() {
  const data = _interopRequireDefault(require("../../nuclide-debugger-common/VsDebugSession"));

  _VsDebugSession = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
// program is gone and not coming back
class Debugger {
  constructor(logger, con, preset) {
    this._capabilities = {};
    this._threads = new (_ThreadCollection().default)();
    this._state = 'INITIALIZING';
    this._breakpoints = new (_BreakpointCollection().default)();
    this._attachMode = false;
    this._readyForEvaluations = false;
    this._logger = logger;
    this._console = con;
    this._sourceFiles = new (_SourceFileCache().default)(this._getSourceByReference.bind(this));
    this._preset = preset;
  }

  registerCommands(dispatcher) {
    dispatcher.registerCommand(new (_BackTraceCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_ThreadsCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_StepCommand().default)(this));
    dispatcher.registerCommand(new (_NextCommand().default)(this));
    dispatcher.registerCommand(new (_VariablesCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_BreakpointCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_ContinueCommand().default)(this));
    dispatcher.registerCommand(new (_ListCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_RestartCommand().default)(this));
    dispatcher.registerCommand(new (_PrintCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_RunCommand().default)(this));
    dispatcher.registerCommand(new (_EnterCodeCommand().default)(this._console, this));
  } // launch is for launching a process from scratch when we need a new
  // session


  launch(adapter) {
    this._adapter = adapter;
    this._breakpoints = new (_BreakpointCollection().default)();
    return this.relaunch();
  } // relaunch is for when we want to restart the current process
  // without tearing down the session. some adapters can do this
  // automatically


  async relaunch() {
    const adapter = this._adapter;

    if (adapter == null) {
      throw new Error('There is nothing to relaunch.');
    }

    this._state = 'INITIALIZING';
    await this.closeSession();
    await this.createSession(adapter);

    if (!(adapter.action === 'attach' || adapter.action === 'launch')) {
      throw new Error("Invariant violation: \"adapter.action === 'attach' || adapter.action === 'launch'\"");
    }

    this._attachMode = adapter.action === 'attach';

    const session = this._ensureDebugSession(true);

    if (this._attachMode) {
      await session.attach((0, _nullthrows().default)(this._adapter).adapter.transformAttachArguments(adapter.attachArgs));
    } else {
      await session.launch((0, _nullthrows().default)(this._adapter).adapter.transformLaunchArguments(adapter.launchArgs));
    }
  }

  async _onInitialized() {
    const adapter = this._adapter;

    if (!(adapter != null)) {
      throw new Error("Invariant violation: \"adapter != null\"");
    }

    this._state = 'CONFIGURING';

    this._startConfigurationInput();
  }

  async _configurationDone() {
    const session = this._ensureDebugSession(true);

    this._state = 'RUNNING';
    await this._resetAllBreakpoints(); // this needs to be sent last for adapters that don't support configurationDone

    await session.setExceptionBreakpoints({
      filters: []
    });

    if (this._capabilities.supportsConfigurationDoneRequest) {
      await session.configurationDone();
    }

    this._cacheThreads();

    this._console.stopInput();
  }

  async run() {
    if (this._attachMode) {
      throw new Error('Cannot run an attached process; already attached.');
    }

    if (this._state !== 'CONFIGURING') {
      throw new Error('There is nothing to run.');
    }

    return this._configurationDone();
  }

  breakInto() {
    // if there is a focus thread from before, stop that one, else just
    // pick the first.
    const thread = this._threads.focusThread != null ? this._threads.focusThread : this._threads.allThreads[0];

    if (thread == null) {
      return;
    }

    this._ensureDebugSession().pause({
      threadId: thread.id()
    });
  }

  getThreads() {
    this._ensureDebugSession();

    return this._threads;
  }

  getActiveThread() {
    this._ensureDebugSession();

    return (0, _nullthrows().default)(this._threads.focusThread);
  }

  async getStackTrace(thread, levels) {
    const {
      body: {
        stackFrames
      }
    } = await this._ensureDebugSession().stackTrace({
      threadId: thread,
      levels
    });
    return stackFrames;
  }

  async setSelectedStackFrame(thread, frameIndex) {
    const frames = await this.getStackTrace(thread.id(), frameIndex + 1);

    if (frames[frameIndex] == null) {
      throw new Error(`There are only ${frames.length} frames in the thread's stack trace.`);
    }

    thread.setSelectedStackFrame(frameIndex);
  }

  async getCurrentStackFrame() {
    this._ensureDebugSession();

    const thread = this.getActiveThread();
    const selectedFrame = thread.selectedStackFrame();
    const frames = await this.getStackTrace(thread.id(), selectedFrame + 1);
    return frames[selectedFrame];
  }

  async stepIn() {
    await this._ensureDebugSession().stepIn({
      threadId: this.getActiveThread().id()
    });
  }

  async stepOver() {
    await this._ensureDebugSession().next({
      threadId: this.getActiveThread().id()
    });
  }

  async continue() {
    try {
      // we stop console input once execution has restarted, but some adapters
      // send output before that happens. since the continued notification is
      // async, the debugger will treat that output as if it happened while
      // the command prompt is up, and reprint the prompt after it. really,
      // any output that happens while we're trying to continue should see that
      // input is stopped.
      this._console.stopInput();

      const session = this._ensureDebugSession(true); // if we are attaching and still in configuration, this is where we'll
      // send configuration done.


      if (this._state === 'CONFIGURING') {
        if (this._attachMode) {
          return this._configurationDone();
        }

        throw new Error('There is not yet a running process to continue.');
      }

      if (this._state === 'STOPPED') {
        await session.continue({
          threadId: this.getActiveThread().id()
        });
        return;
      }

      if (this._state === 'TERMINATED') {
        throw new Error('Cannot continue; process is terminated.');
      }

      throw new Error(`Continue called from unexpected state ${this._state}`);
    } catch (error) {
      this._console.startInput();

      throw error;
    }
  }

  async getVariables(selectedScope) {
    const session = this._ensureDebugSession();

    const activeThread = this.getActiveThread();
    const stack = await this.getStackTrace(activeThread.id(), activeThread.selectedStackFrame() + 1);

    const frameId = this._stackFrameId(stack, activeThread.selectedStackFrame());

    if (frameId == null) {
      return [];
    }

    const {
      body: {
        scopes
      }
    } = await session.scopes({
      frameId
    });
    let queries;

    if (selectedScope != null) {
      queries = scopes.filter(scope => scope.name === selectedScope);

      if (queries.length === 0) {
        throw new Error(`There is no scope named '${selectedScope}' in the current context.`);
      }
    } else {
      queries = scopes.filter(scope => !scope.expensive);
    }

    const executers = queries.map(async scope => {
      const {
        body: {
          variables
        }
      } = await session.variables({
        variablesReference: scope.variablesReference
      });
      return [scope.variablesReference, variables];
    });
    const results = await Promise.all(executers);
    const resultsByVarRef = new Map(results);
    return scopes.map(scope => {
      return {
        expensive: scope.expensive,
        scopeName: scope.name,
        variables: resultsByVarRef.get(scope.variablesReference)
      };
    });
  }

  async setSourceBreakpoint(path, line) {
    // NB this call is allowed before the program is launched
    const session = this._ensureDebugSession(true);

    const index = this._breakpoints.addSourceBreakpoint(path, line);

    let message = 'Breakpoint pending until program starts.';

    if (this._state !== 'CONFIGURING') {
      const breakpoint = await this._setSourceBreakpointsForPath(session, path, index);
      message = breakpoint == null ? null : breakpoint.message;
    }

    return {
      index,
      message
    };
  }

  async _setSourceBreakpointsForPath(session, path, indexOfInterest) {
    const localBreakpoints = this._breakpoints.getAllEnabledBreakpointsForSource(path);

    const request = {
      source: {
        path
      },
      breakpoints: localBreakpoints.map(x => ({
        line: x.line
      }))
    };
    const {
      body: {
        breakpoints: adapterBreakpoints
      }
    } = await session.setBreakpoints(request);
    const paired = localBreakpoints.map((_, i) => [_, adapterBreakpoints[i]]);

    for (const [debuggerBreakpoint, adapterBreakpoint] of paired) {
      this._updateBreakpoint(debuggerBreakpoint, adapterBreakpoint);
    }

    const breakpoint = paired.find(_ => _[0].index === indexOfInterest);
    return breakpoint == null ? null : breakpoint[1];
  }

  async setFunctionBreakpoint(func) {
    if (!this._capabilities.supportsFunctionBreakpoints) {
      throw new Error(`The ${(0, _nullthrows().default)(this._adapter).type} debugger does not support function breakpoints.`);
    } // NB this call is allowed before the program is launched


    const session = this._ensureDebugSession(true);

    const index = this._breakpoints.addFunctionBreakpoint(func);

    let message = 'Breakpoint pending until program starts.';

    if (this._state !== 'CONFIGURING') {
      const breakpoint = await this._setFunctionBreakpoints(session, index);
      message = breakpoint == null ? null : breakpoint.message;
    }

    return {
      index,
      message
    };
  }

  async _setFunctionBreakpoints(session, indexOfInterest) {
    const funcBreakpoints = this._breakpoints.getAllEnabledFunctionBreakpoints();

    const request = {
      breakpoints: funcBreakpoints.map(bpt => ({
        name: bpt.func
      }))
    };
    const response = await session.setFunctionBreakpoints(request);
    const {
      body: {
        breakpoints: adapterBreakpoints
      }
    } = response;
    const paired = funcBreakpoints.map((_, i) => [_, adapterBreakpoints[i]]);

    for (const [debuggerBreakpoint, adapterBreakpoint] of paired) {
      this._updateBreakpoint(debuggerBreakpoint, adapterBreakpoint);
    }

    const breakpoint = paired.find(_ => _[0].index === indexOfInterest);
    return breakpoint == null ? null : breakpoint[1];
  }

  _stackFrameId(stack, depth) {
    var _ref;

    return (_ref = stack) != null ? (_ref = _ref[depth]) != null ? _ref.id : _ref : _ref;
  }

  async getSourceLines(source, start, length) {
    // If `source' contains a non-zero sourceReference, then the adapter
    // supports returning source data; otherwise, we use the given
    // path as a local file system path.
    let lines = [];
    const sourceReference = source.sourceReference;

    if (sourceReference != null && sourceReference !== 0) {
      lines = await this._sourceFiles.getFileDataBySourceReference(sourceReference);
    } else if (source.path != null) {
      lines = await this._sourceFiles.getFileDataByPath(source.path);
    }

    if (start > lines.length) {
      return [];
    }

    const end = Math.min(start + length - 1, lines.length);
    return lines.slice(start - 1, end);
  }

  getAllBreakpoints() {
    return this._breakpoints.getAllBreakpoints();
  }

  getBreakpointByIndex(index) {
    return this._breakpoints.getBreakpointByIndex(index);
  }

  async setBreakpointEnabled(index, enabled) {
    const session = this._ensureDebugSession();

    const breakpoint = this._breakpoints.getBreakpointByIndex(index);

    const path = breakpoint.path;

    if (breakpoint.enabled === enabled) {
      return;
    }

    breakpoint.setEnabled(enabled);

    if (path != null) {
      try {
        await this._setSourceBreakpointsForPath(session, path, index);
      } catch (error) {
        breakpoint.setEnabled(!enabled);
        throw error;
      }

      return;
    } // $TODO function breakpoints

  }

  async deleteBreakpoint(index) {
    const session = this._ensureDebugSession();

    const breakpoint = this._breakpoints.getBreakpointByIndex(index);

    const path = breakpoint.path;

    this._breakpoints.deleteBreakpoint(index);

    if (path != null) {
      const pathBreakpoints = this._breakpoints.getAllEnabledBreakpointsForSource(path);

      await session.setBreakpoints({
        source: {
          path
        },
        breakpoints: pathBreakpoints.map(x => {
          return {
            line: x.line
          };
        })
      });
    }
  }

  async evaluateExpression(expression) {
    const session = this._ensureDebugSession(true);

    let args = {
      expression,
      context: 'repl'
    };

    if (this._state === 'RUNNING') {
      const frame = await this.getCurrentStackFrame();

      if (frame != null) {
        args = Object.assign({}, args, {
          frameId: frame.id
        });
      }
    }

    return session.evaluate(args);
  }

  async createSession(adapter) {
    this._console.stopInput();

    this._threads = new (_ThreadCollection().default)();
    this._debugSession = new (_VsDebugSession().default)(process.pid.toString(), this._logger, adapter.adapterInfo, {
      host: 'cli',
      adapter: adapter.type,
      isRemote: false
    });

    this._initializeObservers();

    if (!(this._debugSession != null)) {
      throw new Error("Invariant violation: \"this._debugSession != null\"");
    }

    const {
      body
    } = await this._debugSession.initialize({
      adapterID: 'fbdbg',
      pathFormat: 'path',
      linesStartAt1: true,
      columnsStartAt1: true,
      clientID: 'nuclide-cli'
    });
    this._capabilities = {};

    if (body != null) {
      // $FlowFixMe should be able to just assign here
      this._capabilities = body;
    }

    this._readyForEvaluations = true; // $FlowFixMe

    const extraBody = body;

    if (extraBody.supportsReadyForEvaluationsEvent === true) {
      this._readyForEvaluations = false;
    }
  }

  async _resetAllBreakpoints() {
    const session = this._ensureDebugSession();

    const sourceBreakpoints = this._breakpoints.getAllEnabledBreakpointsByPath();

    const sourceBreakpointSets = Array.from(sourceBreakpoints).map(async ([path, breakpointLines]) => {
      const lines = breakpointLines.map(_ => ({
        line: _.line
      }));
      const source = {
        path
      };
      const {
        body: {
          breakpoints: breakpointsOut
        }
      } = await session.setBreakpoints({
        source,
        breakpoints: lines
      });
      breakpointLines.forEach((local, i) => {
        this._updateBreakpoint(local, breakpointsOut[i]);
      });
    });
    await Promise.all(sourceBreakpointSets.concat(this._resetAllFunctionBreakpoints()));
  }

  async _resetAllFunctionBreakpoints() {
    const session = this._ensureDebugSession();

    const funcBreakpoints = this._breakpoints.getAllEnabledFunctionBreakpoints();

    if (!this._capabilities.supportsFunctionBreakpoints || funcBreakpoints.length === 0) {
      return;
    }

    const {
      body: {
        breakpoints: funcBreakpointsOut
      }
    } = await session.setFunctionBreakpoints({
      breakpoints: funcBreakpoints.map(bpt => ({
        name: bpt.func
      }))
    });
    funcBreakpoints.forEach((local, i) => {
      this._updateBreakpoint(local, funcBreakpointsOut[i]);
    });
  }

  _updateBreakpoint(local, remote) {
    const index = local.index;
    const id = remote.id;

    if (id != null) {
      this._breakpoints.setBreakpointId(index, id);

      const verified = remote.verified;

      if (verified != null) {
        this._breakpoints.setBreakpointVerified(index, verified);
      }
    } else {
      // if we didn't get an id back from the adapter, we can't match
      // breakpoint events, so we'll never get to mark anything verified.
      // just assume it's verified.
      this._breakpoints.setBreakpointVerified(index, true);
    } // If it's a function breakpoint and we got back a source location,
    // save it


    if (local.func != null && remote.source) {
      const path = remote.source.path;
      const line = remote.line;

      if (path != null && line != null) {
        this._breakpoints.setPathAndFile(index, path, line);
      }
    } // If we failed to set the breakpoint, and we didn't get a message why,
    // concot one.


    if (!remote.verified && (remote.message == null || remote.message === '')) {
      remote.message = 'Could not set this breakpoint. The module may not have been loaded yet.';
    }
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
    session.observeAdapterExitedEvents().subscribe(this._onAdapterExited.bind(this));
    session.observeBreakpointEvents().subscribe(this._onBreakpointEvent.bind(this));
    session.observeCustomEvents().subscribe(e => {
      if (e.event === 'readyForEvaluations') {
        this._onReadyForEvaluations();
      }
    });
  }

  async closeSession() {
    if (this._debugSession == null) {
      return;
    }

    await this._debugSession.disconnect();
    this._threads = new (_ThreadCollection().default)();
    this._debugSession = null;
    this._activeThread = null; // $TODO perf - there may be some value in not immediately flushing
    // and keeping the cache around if we reattach to the same target,
    // using watch to see if the file has changed in the meantime

    this._sourceFiles.flush();
  }

  _onOutput(event) {
    var _ref2;

    const text = ((_ref2 = event) != null ? (_ref2 = _ref2.body) != null ? _ref2.output : _ref2 : _ref2) || '';

    this._console.output(text);
  }

  _onContinued(event) {
    const {
      body: {
        threadId,
        allThreadsContinued
      }
    } = event;

    if (allThreadsContinued === true) {
      this._threads.markAllThreadsRunning();
    } else if (threadId != null) {
      this._threads.markThreadRunning(threadId);
    } // only turn the console off if all threads have started up again


    if (this._threads.allThreadsRunning()) {
      this._console.stopInput();
    }
  }

  async _onStopped(event) {
    const {
      body: {
        description,
        threadId,
        allThreadsStopped
      }
    } = event;

    const firstStop = this._threads.allThreadsRunning();

    if (firstStop && description != null) {
      this._console.outputLine(`Stopped: ${description}`);
    }

    if (allThreadsStopped === true) {
      this._threads.markAllThreadsStopped();

      this._threads.allThreads.map(_ => _.clearSelectedStackFrame());
    } else if (threadId != null) {
      this._threads.markThreadStopped(threadId);

      (0, _nullthrows().default)(this._threads.getThreadById(threadId)).clearSelectedStackFrame();
    } else {
      // the call didn't actually contain information about anything stopping.
      this._console.outputLine('stop event with no thread information.');
    } // for now, set the focus thread to the first thread that stopped


    if (firstStop) {
      if (threadId != null) {
        this._threads.setFocusThread(threadId);
      } else {
        const firstStopped = this._threads.firstStoppedThread();

        if (!(firstStopped != null)) {
          throw new Error("Invariant violation: \"firstStopped != null\"");
        }

        this._threads.setFocusThread(firstStopped);
      }

      const topOfStack = await this._getTopOfStackSourceInfo((0, _nullthrows().default)(this._threads.focusThreadId));

      if (topOfStack != null) {
        this._console.outputLine(`${topOfStack.name}:${topOfStack.frame.line} ${topOfStack.line}`);
      }

      this._state = 'STOPPED';

      this._console.startInput();
    }
  }

  _onThread(event) {
    const {
      body: {
        reason,
        threadId
      }
    } = event;

    if (reason === 'started') {
      // to avoid a race, create a thread immediately. then call _cacheThreads,
      // which will query gdb and update the description
      this._threads.addThread(new (_Thread().default)(threadId, `thread ${threadId}`));

      this._cacheThreads();

      return;
    }

    if (reason === 'exited') {
      this._threads.removeThread(threadId);
    }
  }

  _onReadyForEvaluations() {
    this._readyForEvaluations = true;

    this._startConfigurationInput();
  }

  _startConfigurationInput() {
    if (this._readyForEvaluations && this._state === 'CONFIGURING') {
      this._console.startInput();
    }
  }

  _onExitedDebugee(event) {
    this._state = 'TERMINATED';

    this._console.outputLine(`Target exited with status ${event.body.exitCode}`);

    const adapter = this._adapter;

    if (!(adapter != null)) {
      throw new Error("Invariant violation: \"adapter != null\"");
    }

    if (!this._attachMode) {
      this._console.startInput();

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
      throw new Error("Invariant violation: \"adapter != null\"");
    }

    if (!this._attachMode) {
      this._console.startInput();

      this.relaunch();
      return;
    }

    process.exit(0);
  }

  _onAdapterExited(event) {
    this._state = 'TERMINATED';

    this._console.outputLine('The debug adapter has exited.');

    const adapter = this._adapter;

    if (!(adapter != null)) {
      throw new Error("Invariant violation: \"adapter != null\"");
    }

    if (!this._attachMode) {
      this._console.startInput();

      this.relaunch();
      return;
    }

    process.exit(0);
  }

  async _cacheThreads() {
    if (!(this._debugSession != null)) {
      throw new Error('_cacheThreads called without session');
    }

    const {
      body
    } = await this._debugSession.threads();
    const threads = (body.threads != null ? body.threads : []).map(_ => new (_Thread().default)(_.id, _.name));

    this._threads.updateThreads(threads);
  }

  _onBreakpointEvent(event) {
    const {
      body: {
        reason,
        breakpoint: {
          id,
          verified
        }
      }
    } = event;

    if (id != null && (reason === 'new' || reason === 'changed')) {
      try {
        const breakpoint = this._breakpoints.getBreakpointById(id);

        breakpoint.setVerified(verified);
      } catch (error) {
        this._console.outputLine('Failed to verify breakpoint.');
      }
    }
  }

  async _getTopOfStackSourceInfo(threadId) {
    // $TODO paths relative to project root?
    const frames = await this.getStackTrace(threadId, 1);

    const source = Debugger._sourceFromTopFrame(frames);

    if (source == null) {
      return null;
    }

    const frame = frames[0];
    const lines = await this.getSourceLines(source, frames[0].line, 1);
    let name;

    if (source.path != null) {
      const path = _nuclideUri().default.resolve(source.path);

      name = _nuclideUri().default.split(path).pop();
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
  }

  static _sourceFromTopFrame(frames) {
    var _ref3;

    return ((_ref3 = frames) != null ? (_ref3 = _ref3[0]) != null ? _ref3.source : _ref3 : _ref3) || null;
  }

  async _getSourceByReference(sourceReference) {
    const {
      body: {
        content
      }
    } = await this._ensureDebugSession().source({
      sourceReference
    });
    return content;
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