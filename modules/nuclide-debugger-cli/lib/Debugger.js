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
  const data = _interopRequireWildcard(require("./Breakpoint"));

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

function _DownCommand() {
  const data = _interopRequireDefault(require("./DownCommand"));

  _DownCommand = function () {
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

function _FrameCommand() {
  const data = _interopRequireDefault(require("./FrameCommand"));

  _FrameCommand = function () {
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

function _InfoCommand() {
  const data = _interopRequireDefault(require("./InfoCommand"));

  _InfoCommand = function () {
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

function _OutCommand() {
  const data = _interopRequireDefault(require("./OutCommand"));

  _OutCommand = function () {
    return data;
  };

  return data;
}

function _ShowCapsCommand() {
  const data = _interopRequireDefault(require("./ShowCapsCommand"));

  _ShowCapsCommand = function () {
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

function _UpCommand() {
  const data = _interopRequireDefault(require("./UpCommand"));

  _UpCommand = function () {
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
  constructor(logger, con, preset, muteOutputCategories) {
    this._threads = new (_ThreadCollection().default)();
    this._state = 'INITIALIZING';
    this._breakpoints = new (_BreakpointCollection().default)();
    this._attachMode = false;
    this._readyForEvaluations = false;
    this._attached = false;
    this._configured = false;
    this._stoppedAtBreakpoint = null;
    this._disconnecting = false;
    this._logger = logger;
    this._console = con;
    this._sourceFiles = new (_SourceFileCache().default)(this._getSourceByReference.bind(this));
    this._preset = preset;
    this._muteOutputCategories = muteOutputCategories;
  }

  registerCommands(dispatcher) {
    this._dispatcher = dispatcher;
    dispatcher.registerCommand(new (_BackTraceCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_ThreadsCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_StepCommand().default)(this));
    dispatcher.registerCommand(new (_NextCommand().default)(this));
    dispatcher.registerCommand(new (_VariablesCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_BreakpointCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_ContinueCommand().default)(this));
    dispatcher.registerCommand(new (_ListCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_PrintCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_RunCommand().default)(this));
    dispatcher.registerCommand(new (_EnterCodeCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_FrameCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_UpCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_DownCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_OutCommand().default)(this));
    dispatcher.registerCommand(new (_ShowCapsCommand().default)(this._console, this));
    dispatcher.registerCommand(new (_InfoCommand().default)(this._console, this));
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

    try {
      this._state = 'INITIALIZING';
      this._configured = false;
      this._attached = false;
      await this.closeSession();
      await this.createSession(adapter);

      if (!(adapter.action === 'attach' || adapter.action === 'launch')) {
        throw new Error("Invariant violation: \"adapter.action === 'attach' || adapter.action === 'launch'\"");
      }

      this._attachMode = adapter.action === 'attach';

      const session = this._ensureDebugSession(true);

      const _adapter = this._adapter;

      if (_adapter == null) {
        throw new Error('Adapter is not set up in relaunch()');
      }

      if (this._attachMode) {
        const attachArgs = _adapter.adapter.transformAttachArguments(adapter.attachArgs);

        await session.attach(attachArgs);
        this._attached = true;
        return this._pauseAfterAttach();
      }

      await session.launch(_adapter.adapter.transformLaunchArguments(adapter.launchArgs));
    } catch (err) {
      this._console.close(`Failed to debug target: ${err.message}\r\n`);
    }
  }

  async _onInitialized() {
    const adapter = this._adapter;

    if (!(adapter != null)) {
      throw new Error("Invariant violation: \"adapter != null\"");
    } // In attach mode, we don't have a separate configuation mode --
    // we just let the attach finish and then force a stop
    // Some adapters claim to support stopping on attach, but the ones
    // supported so far don't do it reliably.


    if (this._attachMode) {
      return this._configurationDone();
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

    if (Boolean(session.capabilities.supportsConfigurationDoneRequest)) {
      try {
        await session.configurationDone();
      } catch (err) {
        this._console.close(`Failed to debug target: ${err.message}\r\n`);
      }
    }

    await this._cacheThreads();

    if (this._attachMode) {
      this._configured = true;
      return this._pauseAfterAttach();
    }

    this._console.stopInput();
  }

  async _pauseAfterAttach() {
    if (this._configured && this._attached) {
      const session = this._ensureDebugSession(true);

      if (this._adapter == null) {
        throw new Error('Adapter not set up in _pauseAfterAttach');
      }

      let threadId = this._adapter.adapter.asyncStopThread;

      if (threadId == null) {
        const threads = this._threads.allThreads;

        if (threads.length !== 0) {
          threadId = threads[0].id();
        }
      }

      if (threadId == null) {
        // nowhere to stop right now.
        this._console.stopInput();

        return;
      }

      await session.pause({
        threadId
      });
    }
  }

  async run() {
    if (this._attachMode) {
      throw new Error('Cannot run an attached process; already attached.');
    }

    this._stoppedAtBreakpoint = null;

    if (this._state === 'STOPPED') {
      this.relaunch();
      return;
    }

    if (this._state !== 'CONFIGURING') {
      throw new Error('There is nothing to run.');
    }

    return this._configurationDone();
  }

  breakInto() {
    // this is mostly for hhvm. if things are slow and the user is seeing the
    // 'factsdb is syncing slowly' message, take SIGINT to mean they want to
    // exit the debugger as opposed to break into the target
    if (!this._readyForEvaluations) {
      this._console.close();

      return;
    }

    if (this._adapter == null) {
      throw new Error('No adapter set up in breakInto()');
    }

    const adapter = this._adapter.adapter; // if there is a focus thread from before, stop that one, else pick
    // a thread or use the adapter-specified default

    let threadId = null;

    if (this._threads.focusThread != null) {
      threadId = this._threads.focusThread.id();
    } else if (adapter.asyncStopThread != null) {
      threadId = adapter.asyncStopThread;
    } else if (this._threads.allThreads.length !== 0) {
      threadId = this._threads.allThreads[0].id();
    }

    if (threadId == null) {
      return;
    }

    this._ensureDebugSession().pause({
      threadId
    });
  }

  getThreads() {
    this._ensureDebugSession();

    return this._threads;
  }

  getActiveThread() {
    this._ensureDebugSession();

    if (this._threads.focusThread == null) {
      throw new Error('There is no active thread.');
    }

    return this._threads.focusThread;
  }

  async getStackTrace(tid, levels) {
    const thread = this._threads.getThreadById(tid);

    if (thread == null) {
      throw new Error(`There is no thread #${tid}.`);
    }

    if (!thread.isStopped) {
      throw new Error(`Thread #${tid} is not stopped.`);
    }

    if (thread.getStackFrames().length < levels) {
      const {
        body: {
          stackFrames
        }
      } = await this._ensureDebugSession().stackTrace({
        threadId: tid,
        startFrame: thread.getStackFrames().length,
        levels: levels - thread.getStackFrames().length
      });
      thread.addStackFrames(stackFrames);
    }

    return thread.getStackFrames();
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
    try {
      await this._ensureDebugSession().stepIn({
        threadId: this.getActiveThread().id()
      });
    } catch (error) {
      this._console.startInput();

      throw error;
    }
  }

  async stepOver() {
    try {
      await this._ensureDebugSession().next({
        threadId: this.getActiveThread().id()
      });
    } catch (error) {
      this._console.startInput();

      throw error;
    }
  }

  async stepOut() {
    try {
      await this._ensureDebugSession().stepOut({
        threadId: this.getActiveThread().id()
      });
    } catch (error) {
      this._console.startInput();

      throw error;
    }
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

      const session = this._ensureDebugSession(true);

      this._stoppedAtBreakpoint = null; // if we are attaching and still in configuration, this is where we'll
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

  async getVariablesByScope(selectedScope) {
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

  async getVariablesByReference(ref) {
    const session = this._ensureDebugSession();

    const {
      body: {
        variables
      }
    } = await session.variables({
      variablesReference: ref
    });
    return variables;
  }

  supportsStoppedAtBreakpoint() {
    const session = this._ensureDebugSession();

    return Boolean(session.capabilities.supportsBreakpointIdOnStop);
  }

  getStoppedAtBreakpoint() {
    return this._stoppedAtBreakpoint;
  }

  async setSourceBreakpoint(path, line, once, condition) {
    if (once && !this._breakpoints.supportsOnceState()) {
      throw new Error(`The ${this._adapter == null ? 'current' : this._adapter.type} debugger does not support one-shot breakpoints.`);
    }

    if (condition != null && !this._breakpoints.supportsConditional()) {
      throw new Error(`The ${this._adapter == null ? 'current' : this._adapter.type} debugger does not support conditional breakpoints.`);
    } // NB this call is allowed before the program is launched


    const session = this._ensureDebugSession(true);

    const index = this._breakpoints.addSourceBreakpoint(path, line, once, condition);

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
        line: x.line,
        condition: x.condition
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

  async setFunctionBreakpoint(func, once, condition) {
    // NB this call is allowed before the program is launched
    const session = this._ensureDebugSession(true);

    if (!Boolean(session.capabilities.supportsFunctionBreakpoints)) {
      throw new Error(`The ${this._adapter == null ? 'current' : this._adapter.type} debugger does not support function breakpoints.`);
    }

    if (once && !this._breakpoints.supportsOnceState()) {
      throw new Error(`The ${this._adapter == null ? 'current' : this._adapter.type} debugger does not support one-shot breakpoints.`);
    }

    if (condition != null && !this._breakpoints.supportsConditional()) {
      throw new Error(`The ${this._adapter == null ? 'current' : this._adapter.type} debugger does not support conditional breakpoints.`);
    }

    const index = this._breakpoints.addFunctionBreakpoint(func, once, condition);

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
        name: bpt.func,
        condition: bpt.condition
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

  async setAllBreakpointsEnabled(enabled) {
    this._breakpoints.getAllBreakpoints().forEach(bp => bp.setState(_Breakpoint().BreakpointState.ENABLED));

    return this._resetAllBreakpoints();
  }

  async setBreakpointEnabled(breakpoint, enabled) {
    const session = this._ensureDebugSession();

    const path = breakpoint.path;

    if (breakpoint.state !== _Breakpoint().BreakpointState.ENABLED) {
      return;
    }

    const oldState = breakpoint.state;
    breakpoint.setState(enabled ? _Breakpoint().BreakpointState.ENABLED : _Breakpoint().BreakpointState.DISABLED);

    if (path != null) {
      try {
        await this._setSourceBreakpointsForPath(session, path, breakpoint.index);
      } catch (error) {
        breakpoint.setState(oldState);
        throw error;
      }

      return;
    }

    await this._resetAllFunctionBreakpoints();
  }

  async toggleAllBreakpoints() {
    this._breakpoints.getAllBreakpoints().forEach(bp => bp.toggleState());

    return this._resetAllBreakpoints();
  }

  async toggleBreakpoint(breakpoint) {
    const session = this._ensureDebugSession();

    const path = breakpoint.path;
    const oldState = breakpoint.state;
    breakpoint.toggleState();

    if (path != null) {
      try {
        await this._setSourceBreakpointsForPath(session, path, breakpoint.index);
      } catch (error) {
        breakpoint.setState(oldState);
        throw error;
      }

      return;
    }

    await this._resetAllFunctionBreakpoints();
  }

  async deleteAllBreakpoints() {
    const session = this._ensureDebugSession();

    const promises = this._breakpoints.getAllBreakpointPaths().map(path => session.setBreakpoints({
      source: {
        path
      },
      breakpoints: []
    }));

    await Promise.all(promises);
    await session.setFunctionBreakpoints({
      breakpoints: []
    });

    this._breakpoints.deleteAllBreakpoints();
  }

  async deleteBreakpoint(breakpoint) {
    const session = this._ensureDebugSession();

    const path = breakpoint.path;

    this._breakpoints.deleteBreakpoint(breakpoint.index);

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

  async evaluateExpression(expression, isBlockOfCode) {
    const session = this._ensureDebugSession(true);

    const adapter = this._adapter;

    if (!(adapter != null)) {
      throw new Error("Invariant violation: \"adapter != null\"");
    }

    let args = {
      expression: adapter.adapter.transformExpression(expression, isBlockOfCode),
      context: 'repl'
    };

    if (this._state === 'STOPPED') {
      const frame = await this.getCurrentStackFrame();

      if (frame != null) {
        args = Object.assign({}, args, {
          frameId: frame.id
        });
      }
    }

    return session.evaluate(args);
  }

  supportsCodeBlocks() {
    if (this._adapter == null) {
      return false;
    }

    return this._adapter.adapter.supportsCodeBlocks;
  }

  adapterCaps() {
    const session = this._ensureDebugSession();

    return session.capabilities;
  }

  info(object) {
    const session = this._ensureDebugSession();

    if (!Boolean(session.capabilities.supportsInfo)) {
      throw new Error('This debug adapter does not support "info"');
    }

    let args = {
      object
    };
    const threadId = this._threads.focusThreadId;

    if (threadId != null) {
      args = Object.assign({}, args, {
        threadId
      });
    }

    return session.info(args);
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
      adapterID: adapter.type,
      pathFormat: 'path',
      linesStartAt1: true,
      columnsStartAt1: true,
      clientID: 'nuclide-cli'
    });

    if (body != null) {
      // $FlowFixMe should be able to just assign here
      this._capabilities = body;
    }

    this._readyForEvaluations = true; // $FlowFixMe

    const extraBody = body;

    if (extraBody.supportsReadyForEvaluationsEvent === true) {
      this._readyForEvaluations = false;
    }

    if (extraBody.supportsBreakpointIdOnStop) {
      this._breakpoints.enableOnceState();
    }

    if (extraBody.supportsConditionalBreakpoints) {
      this._breakpoints.enableConditional();
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

    if (!Boolean(session.capabilities.supportsFunctionBreakpoints) || funcBreakpoints.length === 0) {
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
    /* eslint-disable nuclide-internal/unused-subscription */


    session.observeInitializeEvents().subscribe(() => {
      try {
        this._onInitialized();
      } catch (error) {
        this._console.outputLine('Failed to initialize debugging session.');

        this._console.outputLine(error.message);

        this.closeSession();
      }
    });
    session.observeOutputEvents().filter(x => x.body.category != null && !this._muteOutputCategories.has(x.body.category)).subscribe(this._onOutput.bind(this));
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
      } else if (e.event === 'hhvmConnectionRefused' || e.event === 'hhvmConnectionDied') {
        this._console.outputLine('Connection to debug server lost.');

        this._console.close();
      }
    });
    /* eslint-enable nuclide-internal/unused-subscription */
  }

  async closeSession() {
    if (this._debugSession == null) {
      return;
    } // Note that we will always get the adapter exited event while
    // in the disconnect call (it's implemented that way in VsDebugSession,
    // not in the individual adapters.)


    this._disconnecting = true;
    await this._debugSession.disconnect();
    this._disconnecting = false;
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
        allThreadsStopped,
        breakpointId
      }
    } = event;
    this._stoppedAtBreakpoint = null;

    if (breakpointId != null) {
      try {
        this._stoppedAtBreakpoint = this._breakpoints.getBreakpointById(breakpointId);
      } catch (err) {
        this._console.outputLine('Debugger stopped at unrecognized breakpoint -- current breakpoint will not be valid.');
      }
    }

    await this._disableBreakpointIfOneShot(breakpointId);

    const firstStop = this._threads.allThreadsRunning();

    if (firstStop && description != null) {
      this._console.outputLine(`Stopped: ${description}`);
    }

    if (allThreadsStopped === true) {
      this._threads.markAllThreadsStopped();

      this._threads.allThreads.map(_ => _.clearSelectedStackFrame());
    } else if (threadId != null) {
      this._threads.markThreadStopped(threadId);

      const thread = this._threads.getThreadById(threadId);

      if (thread == null) {
        throw new Error("Couldn't get data for stopped thread.");
      }

      thread.clearSelectedStackFrame();
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

      try {
        const focusThread = this._threads.focusThreadId;

        if (focusThread == null) {
          throw new Error('No focused thread trying to get stack at stop time.');
        }

        const topOfStack = await this._getTopOfStackSourceInfo(focusThread);

        if (topOfStack != null) {
          this._console.outputLine(`${topOfStack.name}:${topOfStack.frame.line} ${topOfStack.line}`);
        }

        const dispatcher = this._dispatcher;

        if (dispatcher != null) {
          for (const cmd of dispatcher.getCommands()) {
            if (cmd.onStopped != null) {
              cmd.onStopped();
            }
          }
        }
      } catch (err) {
        this._console.outputLine(`failed to get source at stop point: ${err.message}`);
      }

      this._state = 'STOPPED';

      this._console.startInput();
    }
  }

  async _disableBreakpointIfOneShot(breakpointId) {
    if (breakpointId == null) {
      return;
    }

    const bpt = this._breakpoints.getBreakpointById(breakpointId);

    if (bpt.state === _Breakpoint().BreakpointState.ONCE) {
      bpt.setState(_Breakpoint().BreakpointState.DISABLED);
      return this._resetAllBreakpoints();
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
    // If we're initializing, this is expected - relaunch() is tearing down
    // the adapter to build a new one.
    if (this._state === 'INITIALIZING' && this._disconnecting) {
      return;
    }

    this._state = 'TERMINATED';
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
    try {
      const {
        body: {
          content
        }
      } = await this._ensureDebugSession().source({
        sourceReference
      });
      return content;
    } catch (err) {
      return `Failed to retrieve source: ${err.message}`;
    }
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