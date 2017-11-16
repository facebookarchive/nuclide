/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {VSAdapterExecutableInfo} from '../lib/types';
import type {Capabilities} from 'vscode-debugprotocol';
import type {ConsoleIO} from './ConsoleIO';
import type {ParsedVSAdapter} from './DebuggerAdapterFactory';
import type {
  DebuggerInterface,
  VariablesInScope,
  BreakpointSetResult,
} from './DebuggerInterface';
import * as DebugProtocol from 'vscode-debugprotocol';

import BackTraceCommand from './BackTraceCommand';
import Breakpoint from './Breakpoint';
import BreakpointCollection from './BreakpointCollection';
import BreakpointCommand from './BreakpointCommand';
import CommandDispatcher from './CommandDispatcher';
import ContinueCommand from './ContinueCommand';
import SourceFileCache from './SourceFileCache';
import idx from 'idx';
import nuclideUri from 'nuclide-commons/nuclideUri';
import nullthrows from 'nullthrows';
import StepCommand from './StepCommand';
import NextCommand from './NextCommand';
import Thread from './Thread';
import ThreadsCommand from './ThreadsCommand';
import VariablesCommand from './VariablesCommand';
import ListCommand from './ListCommand';
import RestartCommand from './RestartCommand';

import invariant from 'assert';
import VsDebugSession from '../lib/VsDebugSession';

export default class Debugger implements DebuggerInterface {
  _capabilities: ?Capabilities;
  _console: ConsoleIO;
  _debugSession: ?VsDebugSession;
  _logger: log4js$Logger;
  _activeThread: ?number;
  _threads: Map<number, Thread> = new Map();
  _sourceFiles: SourceFileCache;
  _terminated: boolean = false;
  _launching: boolean;
  _breakpoints: BreakpointCollection = new BreakpointCollection();
  _adapter: ?ParsedVSAdapter;

  constructor(logger: log4js$Logger, con: ConsoleIO) {
    this._logger = logger;
    this._console = con;
    this._sourceFiles = new SourceFileCache(
      this._getSourceByReference.bind(this),
    );
  }

  registerCommands(dispatcher: CommandDispatcher): void {
    dispatcher.registerCommand(new BackTraceCommand(this._console, this));
    dispatcher.registerCommand(new ThreadsCommand(this._console, this));
    dispatcher.registerCommand(new StepCommand(this));
    dispatcher.registerCommand(new NextCommand(this));
    dispatcher.registerCommand(new VariablesCommand(this._console, this));
    dispatcher.registerCommand(new BreakpointCommand(this._console, this));
    dispatcher.registerCommand(new ContinueCommand(this));
    dispatcher.registerCommand(new ListCommand(this._console, this));
    dispatcher.registerCommand(new RestartCommand(this));
  }

  getThreads(): Map<number, Thread> {
    this._ensureDebugSession();
    return this._threads;
  }

  getActiveThread(): Thread {
    this._ensureDebugSession();
    return nullthrows(this._threads.get(nullthrows(this._activeThread)));
  }

  async getStackTrace(
    thread: number,
    levels: number,
  ): Promise<DebugProtocol.StackFrame[]> {
    const {body: {stackFrames}} = await this._ensureDebugSession().stackTrace({
      threadId: thread,
      levels,
    });
    return stackFrames;
  }

  async setSelectedStackFrame(
    thread: Thread,
    frameIndex: number,
  ): Promise<void> {
    const frames = await this.getStackTrace(thread.id(), frameIndex + 1);
    if (frames[frameIndex] == null) {
      throw new Error(
        `There are only ${frames.length} frames in the thread's stack trace.`,
      );
    }
    thread.setSelectedStackFrame(frameIndex);
  }

  async getCurrentStackFrame(): Promise<?DebugProtocol.StackFrame> {
    this._ensureDebugSession();
    const thread = this.getActiveThread();
    const selectedFrame = thread.selectedStackFrame();
    const frames = await this.getStackTrace(thread.id(), selectedFrame + 1);

    return frames[selectedFrame];
  }

  async stepIn(): Promise<void> {
    await this._ensureDebugSession().stepIn({
      threadId: this.getActiveThread().id(),
    });
  }

  async stepOver(): Promise<void> {
    await this._ensureDebugSession().next({
      threadId: this.getActiveThread().id(),
    });
  }

  async continue(): Promise<void> {
    await this._ensureDebugSession().continue({
      threadId: this.getActiveThread().id(),
    });
  }

  async getVariables(selectedScope: ?string): Promise<VariablesInScope[]> {
    const session = this._ensureDebugSession();

    const activeThread = this.getActiveThread();
    const stack = await this.getStackTrace(
      activeThread.id(),
      activeThread.selectedStackFrame() + 1,
    );
    const frameId = this._stackFrameId(
      stack,
      activeThread.selectedStackFrame(),
    );
    if (frameId == null) {
      return [];
    }

    const {body: {scopes}} = await session.scopes({frameId});

    let queries: DebugProtocol.Scope[];

    if (selectedScope != null) {
      queries = scopes.filter(scope => scope.name === selectedScope);
      if (queries.length === 0) {
        throw new Error(
          `There is no scope named '${selectedScope}' in the current context.`,
        );
      }
    } else {
      queries = scopes.filter(scope => !scope.expensive);
    }

    const executers = queries.map(async scope => {
      const {body: {variables}} = await session.variables({
        variablesReference: scope.variablesReference,
      });
      return [scope.variablesReference, variables];
    });

    const results = await Promise.all(executers);
    const resultsByVarRef = new Map(results);

    return scopes.map(scope => {
      return {
        expensive: scope.expensive,
        scopeName: scope.name,
        variables: resultsByVarRef.get(scope.variablesReference),
      };
    });
  }

  async setSourceBreakpoint(
    path: string,
    line: number,
  ): Promise<BreakpointSetResult> {
    const session = this._ensureDebugSession();
    const index = this._breakpoints.addSourceBreakpoint(path, line);

    const breakpoint = await this._setSourceBreakpointsForPath(
      session,
      path,
      index,
    );

    const message = breakpoint == null ? null : breakpoint.message;
    return {index, message};
  }

  async _setSourceBreakpointsForPath(
    session: VsDebugSession,
    path: string,
    indexOfInterest: number,
  ): Promise<?DebugProtocol.Breakpoint> {
    const debuggerBreakpoints = this._breakpoints.getAllEnabledBreakpointsForSource(
      path,
    );

    const request = {
      source: {path},
      breakpoints: debuggerBreakpoints.map(x => ({line: x.line})),
    };

    const {
      body: {breakpoints: adapterBreakpoints},
    } = await session.setBreakpoints(request);

    const paired = debuggerBreakpoints.map((_, i) => [
      _,
      adapterBreakpoints[i],
    ]);

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
        if (
          !adapterBreakpoint.verified &&
          (adapterBreakpoint.message == null ||
            adapterBreakpoint.message === '')
        ) {
          adapterBreakpoint.message =
            'Could not set this breakpoint. The module may not have been loaded yet.';
        }
      }
    }

    const breakpoint = paired.find(_ => _[0].index === indexOfInterest);

    return breakpoint == null ? null : breakpoint[1];
  }

  _stackFrameId(stack: DebugProtocol.StackFrame[], depth: number): ?number {
    return idx(stack, _ => _[depth].id);
  }

  async getSourceLines(
    source: DebugProtocol.Source,
    start: number,
    length: number,
  ): Promise<string[]> {
    // If `source' contains a non-zero sourceReference, then the adapter
    // supports returning source data; otherwise, we use the given
    // path as a local file system path.
    //
    let lines: string[] = [];
    const sourceReference = source.sourceReference;

    if (sourceReference != null && sourceReference !== 0) {
      lines = await this._sourceFiles.getFileDataBySourceReference(
        sourceReference,
      );
    } else if (source.path != null) {
      lines = await this._sourceFiles.getFileDataByPath(source.path);
    }

    if (start > lines.length) {
      return [];
    }

    const end = Math.min(start + length - 1, lines.length);
    return lines.slice(start - 1, end);
  }

  getAllBreakpoints(): Breakpoint[] {
    return this._breakpoints.getAllBreakpoints();
  }

  getBreakpointByIndex(index: number): Breakpoint {
    return this._breakpoints.getBreakpointByIndex(index);
  }

  async setBreakpointEnabled(index: number, enabled: boolean): Promise<void> {
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
    }
    // $TODO function breakpoints
  }

  async deleteBreakpoint(index: number): Promise<void> {
    const session = this._ensureDebugSession();
    const breakpoint = this._breakpoints.getBreakpointByIndex(index);
    const path = breakpoint.path;

    this._breakpoints.deleteBreakpoint(index);

    if (path != null) {
      const pathBreakpoints = this._breakpoints.getAllEnabledBreakpointsForSource(
        path,
      );

      await session.setBreakpoints({
        source: {path},
        breakpoints: pathBreakpoints.map(x => {
          return {line: x.line};
        }),
      });
    }
  }

  // launch is for launching a process from scratch when we need a new
  // session
  launch(adapter: ParsedVSAdapter): Promise<void> {
    this._adapter = adapter;
    this._breakpoints = new BreakpointCollection();
    return this.relaunch();
  }

  // relaunch is for when we want to restart the current process
  // without tearing down the session. some adapters can do this
  // automatically
  async relaunch(): Promise<void> {
    const adapter = this._adapter;
    if (adapter == null) {
      throw new Error('There is nothing to relaunch.');
    }

    this._launching = true;
    await this.closeSession();
    await this.createSession(adapter.adapterInfo);
    await this._ensureDebugSession().launch(adapter.launchArgs);
    await this._cacheThreads();
    this._launching = false;
  }

  async createSession(adapterInfo: VSAdapterExecutableInfo): Promise<void> {
    this._terminated = false;
    this._console.stopInput();

    this._debugSession = new VsDebugSession(
      process.pid.toString(),
      this._logger,
      adapterInfo,
    );

    this._initializeObservers();

    invariant(this._debugSession != null);
    const {body} = await this._debugSession.initialize({
      adapterID: 'fbdb',
      pathFormat: 'path',
      linesStartAt1: true,
      columnsStartAt1: true,
    });

    this._capabilities = body;
  }

  async _finishInitialization(): Promise<void> {
    const session = this._ensureDebugSession();

    await session.setExceptionBreakpoints({filters: []});
    await this._resetAllBreakpoints();

    invariant(this._capabilities != null);
    if (this._capabilities.supportsConfigurationDoneRequest) {
      await session.configurationDone();
    }
  }

  async _resetAllBreakpoints(): Promise<void> {
    const session = this._ensureDebugSession();

    const sourceBreakpoints = this._breakpoints.getAllEnabledBreakpointsByPath();

    await Promise.all(
      Array.from(sourceBreakpoints).map(async ([path, breakpointLines]) => {
        const lines: DebugProtocol.SourceBreakpoint[] = breakpointLines.map(
          _ => {
            return {
              verified: false,
              line: _.line,
            };
          },
        );

        const source: DebugProtocol.Source = {
          path,
        };

        const {
          body: {breakpoints: breakpointsOut},
        } = await session.setBreakpoints({
          source,
          breakpoints: lines,
        });

        for (const breakpointOut of breakpointsOut) {
          const {verified, line} = breakpointOut;
          const breakpoint = breakpointLines.find(_ => _.line === line);
          if (breakpoint != null) {
            breakpoint.setVerified(verified);
          }
        }
      }),
    );
  }

  _initializeObservers(): void {
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

    session
      .observeOutputEvents()
      .filter(
        x => x.body.category !== 'stderr' && x.body.category !== 'telemetry',
      )
      .subscribe(this._onOutput.bind(this));

    session.observeContinuedEvents().subscribe(this._onContinued.bind(this));

    session.observeStopEvents().subscribe(this._onStopped.bind(this));

    session
      .observeExitedDebugeeEvents()
      .subscribe(this._onExitedDebugee.bind(this));

    session
      .observeTerminateDebugeeEvents()
      .subscribe(this._onTerminatedDebugee.bind(this));

    session
      .observeBreakpointEvents()
      .subscribe(this._onBreakpointEvent.bind(this));
  }

  async closeSession(): Promise<void> {
    if (this._debugSession == null) {
      return;
    }

    this._terminated = true;

    await this._debugSession.disconnect();
    this._threads = new Map();
    this._debugSession = null;
    this._activeThread = null;

    // $TODO perf - there may be some value in not immediately flushing
    // and keeping the cache around if we reattach to the same target,
    // using watch to see if the file has changed in the meantime
    this._sourceFiles.flush();
  }

  _onOutput(event: DebugProtocol.OutputEvent): void {
    const text = idx(event, _ => _.body.output) || '';
    this._console.output(text);
  }

  _onContinued(event: DebugProtocol.ContinuedEvent) {
    // if the thread we're actively debugging starts running,
    // stop interactivity until the target stops again
    if (event.body.threadId === this.getActiveThread().id()) {
      this._console.stopInput();
    }
  }

  async _onStopped(event: DebugProtocol.StoppedEvent) {
    const {body: {description, threadId}} = event;

    if (description != null) {
      this._console.outputLine(description);
    }

    // $TODO handle allThreadsStopped
    if (threadId != null) {
      let thread = this._threads.get(threadId);

      if (thread == null) {
        await this._cacheThreads();
        thread = this._threads.get(threadId);
      }

      nullthrows(thread).clearSelectedStackFrame();

      if (threadId === this.getActiveThread().id()) {
        const topOfStack = await this._getTopOfStackSourceInfo(threadId);
        if (topOfStack != null) {
          this._console.outputLine(
            `${topOfStack.name}:${topOfStack.frame.line} ${topOfStack.line}`,
          );
        }
      }
    }

    this._console.startInput();
  }

  _onExitedDebugee(event: DebugProtocol.ExitedEvent) {
    this._console.outputLine(
      `Target exited with status ${event.body.exitCode}`,
    );
    this.closeSession();
  }

  _onTerminatedDebugee(event: DebugProtocol.TerminatedEvent) {
    // Some adapters will send multiple terminated events.
    if (this._terminated || this._launching) {
      return;
    }
    this._console.outputLine('The target has exited.');
    this.closeSession();
    this._console.startInput();
  }

  async _cacheThreads(): Promise<void> {
    invariant(
      this._debugSession != null,
      '_cacheThreads called without session',
    );

    const {body: {threads}} = await this._debugSession.threads();
    this._threads = new Map(
      threads.map(thd => [thd.id, new Thread(thd.id, thd.name)]),
    );

    this._activeThread = null;
    if (threads.length > 0) {
      this._activeThread = threads[0].id;
    }
  }

  _onBreakpointEvent(event: DebugProtocol.BreakpointEvent): void {
    const {body: {reason, breakpoint: {id, verified}}} = event;

    if (id != null && (reason === 'new' || reason === 'changed')) {
      try {
        const breakpoint = this._breakpoints.getBreakpointById(id);
        breakpoint.setVerified(verified);
      } catch (error) {
        this._console.outputLine('Failed to verify breakpoint.');
      }
    }
  }

  async _getTopOfStackSourceInfo(
    threadId: number,
  ): Promise<?{
    line: string,
    name: string,
    frame: DebugProtocol.StackFrame,
  }> {
    // $TODO paths relative to project root?
    const frames = await this.getStackTrace(threadId, 1);
    const source = Debugger._sourceFromTopFrame(frames);
    if (source == null) {
      return null;
    }

    const frame = frames[0];
    const lines = await this.getSourceLines(source, frames[0].line, 1);

    let name: string;

    if (source.path != null) {
      const path = nuclideUri.resolve(source.path);
      name = nuclideUri.split(path).pop();
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
      frame,
    };
  }

  static _sourceFromTopFrame(
    frames: DebugProtocol.StackFrame[],
  ): ?DebugProtocol.Source {
    return idx(frames, _ => _[0].source) || null;
  }

  async _getSourceByReference(sourceReference: number): Promise<string> {
    const {body: {content}} = await this._ensureDebugSession().source({
      sourceReference,
    });
    return content;
  }

  _ensureDebugSession(): VsDebugSession {
    if (this._debugSession == null) {
      throw new Error('There is no active debugging session.');
    }
    return this._debugSession;
  }
}
