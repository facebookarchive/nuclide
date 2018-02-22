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

/**
The following debug service implementation was ported from VSCode's debugger implementation
in https://github.com/Microsoft/vscode/tree/master/src/vs/workbench/parts/debug

MIT License

Copyright (c) 2015 - present Microsoft Corporation

All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import type {ConsoleMessage} from 'atom-ide-ui';
import type {
  DebuggerModeType,
  IDebugService,
  IModel,
  IViewModel,
  IProcess,
  IRawStoppedDetails,
  IThread,
  IEnableable,
  IEvaluatableExpression,
  IRawBreakpoint,
  IStackFrame,
  IProcessConfig,
  SerializedState,
} from '../types';
import type {MessageProcessor} from 'nuclide-debugger-common';
import type {EvaluationResult} from 'nuclide-commons-ui/TextRenderer';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {TimingTracker} from '../../../nuclide-analytics';
import * as DebugProtocol from 'vscode-debugprotocol';

import nuclideUri from 'nuclide-commons/nuclideUri';
import {splitStream} from 'nuclide-commons/observable';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {sleep} from 'nuclide-commons/promise';
import {VsDebugSession} from 'nuclide-debugger-common';
import {Observable, Subject, TimeoutError} from 'rxjs';
import capitalize from 'lodash/capitalize';
import {track, startTracking} from '../../../nuclide-analytics';
import nullthrows from 'nullthrows';
import {getVSCodeDebuggerAdapterServiceByNuclideUri} from '../../../nuclide-remote-connection';
import {
  getConsoleRegisterExecutor,
  getConsoleService,
  getNotificationService,
} from '../AtomServiceContainer';
import {
  expressionAsEvaluationResultStream,
  fetchChildrenForLazyComponent,
} from '../utils';
import {
  Model,
  ExceptionBreakpoint,
  FunctionBreakpoint,
  Breakpoint,
  Expression,
  Process,
} from './DebuggerModel';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Emitter} from 'atom';
import {distinct} from 'nuclide-commons/collection';
import {onUnexpectedError} from '../utils';
import uuid from 'uuid';
import {
  BreakpointEventReasons,
  DebuggerMode,
  AnalyticsEvents,
} from '../constants';
import logger from '../logger';
import stripAnsi from 'strip-ansi';
import {remoteToLocalProcessor, localToRemoteProcessor} from './processors';

// This must match URI defined in ../../nuclide-console/lib/ui/ConsoleContainer
const CONSOLE_VIEW_URI = 'atom://nuclide/console';

const CUSTOM_DEBUG_EVENT = 'CUSTOM_DEBUG_EVENT';
const CHANGE_DEBUG_MODE = 'CHANGE_DEBUG_MODE';

const CHANGE_FOCUSED_PROCESS = 'CHANGE_FOCUSED_PROCESS';
const CHANGE_FOCUSED_STACKFRAME = 'CHANGE_FOCUSED_STACKFRAME';

// Berakpoint events may arrive sooner than breakpoint responses.
const MAX_BREAKPOINT_EVENT_DELAY_MS = 5 * 1000;

class ViewModel implements IViewModel {
  _focusedProcess: ?IProcess;
  _focusedThread: ?IThread;
  _focusedStackFrame: ?IStackFrame;
  _emitter: Emitter;

  constructor() {
    this._focusedProcess = null;
    this._focusedThread = null;
    this._focusedStackFrame = null;
    this._emitter = new Emitter();
  }

  get focusedProcess(): ?IProcess {
    return this._focusedProcess;
  }

  get focusedThread(): ?IThread {
    return this._focusedStackFrame != null
      ? this._focusedStackFrame.thread
      : this._focusedProcess != null
        ? this._focusedProcess.getAllThreads().pop()
        : null;
  }

  get focusedStackFrame(): ?IStackFrame {
    return this._focusedStackFrame;
  }

  onDidFocusProcess(callback: (process: ?IProcess) => mixed): IDisposable {
    return this._emitter.on(CHANGE_FOCUSED_PROCESS, callback);
  }

  onDidFocusStackFrame(
    callback: (data: {stackFrame: ?IStackFrame, explicit: boolean}) => mixed,
  ): IDisposable {
    return this._emitter.on(CHANGE_FOCUSED_STACKFRAME, callback);
  }

  isMultiProcessView(): boolean {
    return false;
  }

  setFocus(
    stackFrame: ?IStackFrame,
    thread: ?IThread,
    process: ?IProcess,
    explicit: boolean,
  ): void {
    const shouldEmit =
      this._focusedProcess !== process ||
      this._focusedThread !== thread ||
      this._focusedStackFrame !== stackFrame ||
      explicit;
    if (this._focusedProcess !== process) {
      this._focusedProcess = process;
      this._emitter.emit(CHANGE_FOCUSED_PROCESS, process);
    }
    this._focusedThread = thread;
    this._focusedStackFrame = stackFrame;

    if (shouldEmit) {
      this._emitter.emit(CHANGE_FOCUSED_STACKFRAME, {stackFrame, explicit});
    }
  }
}

export default class DebugService implements IDebugService {
  _model: Model;
  _disposables: UniversalDisposable;
  _sessionEndDisposables: UniversalDisposable;
  _consoleDisposables: IDisposable;
  _debuggerMode: DebuggerModeType;
  _emitter: Emitter;
  _viewModel: ViewModel;
  _timer: ?TimingTracker;
  _breakpointsToSendOnSave: Set<NuclideUri>;

  constructor(state: ?SerializedState) {
    this._disposables = new UniversalDisposable();
    this._sessionEndDisposables = new UniversalDisposable();
    this._consoleDisposables = new UniversalDisposable();
    this._emitter = new Emitter();
    this._debuggerMode = DebuggerMode.STOPPED;
    this._viewModel = new ViewModel();
    this._breakpointsToSendOnSave = new Set();

    this._model = new Model(
      this._loadBreakpoints(state),
      true,
      this._loadFunctionBreakpoints(state),
      this._loadExceptionBreakpoints(state),
      this._loadWatchExpressions(state),
    );
    this._disposables.add(this._model);
    this._registerListeners();
  }

  get viewModel(): IViewModel {
    return this._viewModel;
  }

  getDebuggerMode(): DebuggerModeType {
    return this._debuggerMode;
  }

  _registerListeners(): void {
    // this._disposables.add(this.fileService.onFileChanges(e => this.onFileChanges(e)));
    let selectedFrameMarker: ?atom$Marker = null;
    this._disposables.add(
      this._viewModel.onDidFocusStackFrame(async event => {
        const {stackFrame, explicit} = event;
        if (selectedFrameMarker != null) {
          selectedFrameMarker.destroy();
          selectedFrameMarker = null;
        }
        if (stackFrame == null || !stackFrame.source.available) {
          if (explicit) {
            atom.notifications.addWarning(
              'No source available for the selected stack frame',
            );
          }
          return;
        } else {
          const editor = await stackFrame.openInEditor();
          if (editor == null) {
            atom.notifications.addError(
              'Failed to open source file for stack frame!',
            );
            return;
          }
          const line = stackFrame.range.start.row;
          selectedFrameMarker = editor.markBufferRange(
            [[line, 0], [line, Infinity]],
            {
              invalidate: 'never',
            },
          );
          editor.decorateMarker(selectedFrameMarker, {
            type: 'line',
            class: 'nuclide-current-line-highlight',
          });
        }
      }),
      () => {
        if (selectedFrameMarker != null) {
          selectedFrameMarker.destroy();
          selectedFrameMarker = null;
        }
      },
    );
  }

  /**
   * Stops the process. If the process does not exist then stops all processes.
   */
  async stopProcess(): Promise<void> {
    if (
      this._debuggerMode === DebuggerMode.STOPPING ||
      this._debuggerMode === DebuggerMode.STOPPED
    ) {
      return;
    }
    this._onSessionEnd();
  }

  _tryToAutoFocusStackFrame(thread: IThread): void {
    const callStack = thread.getCallStack();
    if (
      !callStack.length ||
      (this._viewModel.focusedStackFrame &&
        this._viewModel.focusedStackFrame.thread.getId() === thread.getId())
    ) {
      return;
    }

    // Focus first stack frame from top that has source location if no other stack frame is focused
    const stackFrameToFocus = callStack.find(
      sf => sf.source != null && sf.source.available,
    );
    if (stackFrameToFocus == null) {
      return;
    }

    this.focusStackFrame(stackFrameToFocus, null, null);
  }

  _registerSessionListeners(process: Process, session: VsDebugSession): void {
    this._sessionEndDisposables = new UniversalDisposable(session);

    const openFilesSaved = observableFromSubscribeFunction(
      atom.workspace.observeTextEditors.bind(atom.workspace),
    ).flatMap(editor => {
      return observableFromSubscribeFunction(editor.onDidSave.bind(editor))
        .map(() => editor.getPath())
        .takeUntil(
          observableFromSubscribeFunction(editor.onDidDestroy.bind(editor)),
        );
    });

    this._sessionEndDisposables.add(
      openFilesSaved.subscribe(async filePath => {
        if (filePath == null || !this._breakpointsToSendOnSave.has(filePath)) {
          return;
        }
        this._breakpointsToSendOnSave.delete(filePath);
        await this._sendBreakpoints(filePath, true);
      }),
    );

    this._sessionEndDisposables.add(
      session.observeInitializeEvents().subscribe(async event => {
        const sendConfigurationDone = async () => {
          if (
            session &&
            session.getCapabilities().supportsConfigurationDoneRequest
          ) {
            return session.configurationDone().catch(e => {
              // Disconnect the debug session on configuration done error #10596
              session
                .disconnect()
                .catch(onUnexpectedError)
                .then(this._onSessionEnd);
              atom.notifications.addError('Failed to configure debugger', {
                detail: e.message,
              });
            });
          }
        };

        try {
          await this._sendAllBreakpoints().then(
            sendConfigurationDone,
            sendConfigurationDone,
          );
          await this._fetchThreads(session);
        } catch (error) {
          onUnexpectedError(error);
        }
      }),
    );

    this._sessionEndDisposables.add(
      session.observeStopEvents().subscribe(async event => {
        this._updateModeAndEmit(DebuggerMode.PAUSED);
        this._scheduleNativeNotification();
        try {
          await this._fetchThreads(session, (event.body: any));
          const thread =
            event.body.threadId != null
              ? process.getThread(event.body.threadId)
              : null;
          if (thread != null) {
            // UX: That'll fetch the top stack frame first (to allow the UI to focus on it),
            // then the rest of the call stack.
            await this._model.fetchCallStack(thread);
            this._tryToAutoFocusStackFrame(thread);
          }
        } catch (error) {
          onUnexpectedError(error);
        }
      }),
    );

    this._sessionEndDisposables.add(
      session.observeThreadEvents().subscribe(async event => {
        if (event.body.reason === 'started') {
          await this._fetchThreads(session);
        } else if (event.body.reason === 'exited') {
          this._model.clearThreads(session.getId(), true, event.body.threadId);
        }
      }),
    );

    this._sessionEndDisposables.add(
      session.observeTerminateDebugeeEvents().subscribe(event => {
        if (session && session.getId() === event.sessionId) {
          if (event.body && event.body.restart && process) {
            this.restartProcess().catch(err => {
              atom.notifications.addError('Failed to restart debugger', {
                detail: err.stack || String(err),
              });
            });
          } else {
            session
              .disconnect()
              .catch(onUnexpectedError)
              .then(this._onSessionEnd);
          }
        }
      }),
    );

    this._sessionEndDisposables.add(
      session.observeContinuedEvents().subscribe(event => {
        const threadId =
          event.body.allThreadsContinued !== false
            ? undefined
            : event.body.threadId;
        this._model.clearThreads(session.getId(), false, threadId);
        this.focusStackFrame(null, this._viewModel.focusedThread, null);
        this._updateModeAndEmit(DebuggerMode.RUNNING);
      }),
    );

    const createConsole = getConsoleService();
    if (createConsole != null) {
      const name = `${capitalize(process.configuration.adapterType)} Debugger`;
      const consoleApi = createConsole({
        id: name,
        name,
      });
      this._sessionEndDisposables.add(consoleApi);
      const outputEvents = session
        .observeOutputEvents()
        .filter(
          event => event.body != null && typeof event.body.output === 'string',
        )
        .share();
      const [errorStream, warningsStream, logStream] = [
        'stderr',
        'console',
        'stdout',
      ].map(category =>
        splitStream(
          outputEvents
            .filter(e => category === e.body.category)
            .map(e => stripAnsi(e.body.output)),
        ),
      );
      const notificationStream = outputEvents
        .filter(e => e.body.category === 'nuclide_notification')
        .map(e => ({
          type: nullthrows(e.body.data).type,
          message: e.body.output,
        }));
      this._sessionEndDisposables.add(
        errorStream.subscribe(line => {
          consoleApi.append({text: line, level: 'error'});
        }),
        warningsStream.subscribe(line => {
          consoleApi.append({text: line, level: 'warning'});
        }),
        logStream.subscribe(line => {
          consoleApi.append({text: line, level: 'log'});
        }),
        notificationStream.subscribe(({type, message}) => {
          atom.notifications.add(type, message);
        }),
        // TODO handle non string & unkown categories
      );
    }

    this._sessionEndDisposables.add(
      session
        .observeBreakpointEvents()
        .flatMap(event => {
          const {breakpoint, reason} = event.body;
          if (
            reason !== BreakpointEventReasons.CHANGED &&
            reason !== BreakpointEventReasons.REMOVED
          ) {
            return Observable.of({
              reason,
              breakpoint,
              sourceBreakpoint: null,
              functionBreakpoint: null,
            });
          }

          // Breakpoint events may arrive sooner than their responses.
          // Hence, we'll keep them cached and try re-processing on every change to the model's breakpoints
          // for a set maximum time, then discard.
          return observableFromSubscribeFunction(
            this._model.onDidChangeBreakpoints.bind(this._model),
          )
            .startWith(null)
            .switchMap(() => {
              const sourceBreakpoint = this._model
                .getBreakpoints()
                .filter(b => b.idFromAdapter === breakpoint.id)
                .pop();
              const functionBreakpoint = this._model
                .getFunctionBreakpoints()
                .filter(b => b.idFromAdapter === breakpoint.id)
                .pop();
              if (sourceBreakpoint == null && functionBreakpoint == null) {
                return Observable.empty();
              } else {
                return Observable.of({
                  reason,
                  breakpoint,
                  sourceBreakpoint,
                  functionBreakpoint,
                });
              }
            })
            .take(1)
            .timeout(MAX_BREAKPOINT_EVENT_DELAY_MS)
            .catch(error => {
              if (error instanceof TimeoutError) {
                logger.error(
                  'Timed out breakpoint event handler',
                  process.configuration.adapterType,
                  reason,
                  breakpoint,
                );
              }
              return Observable.empty();
            });
        })
        .subscribe(
          ({reason, breakpoint, sourceBreakpoint, functionBreakpoint}) => {
            if (reason === BreakpointEventReasons.NEW && breakpoint.source) {
              const source = process.getSource(breakpoint.source);
              const bps = this._model.addBreakpoints(
                source.uri,
                [
                  {
                    column: breakpoint.column || 0,
                    enabled: true,
                    line: breakpoint.line == null ? -1 : breakpoint.line,
                  },
                ],
                false,
              );
              if (bps.length === 1) {
                this._model.updateBreakpoints({
                  [bps[0].getId()]: breakpoint,
                });
              }
            } else if (reason === BreakpointEventReasons.REMOVED) {
              if (sourceBreakpoint != null) {
                this._model.removeBreakpoints([sourceBreakpoint]);
              }
              if (functionBreakpoint != null) {
                this._model.removeFunctionBreakpoints(
                  functionBreakpoint.getId(),
                );
              }
            } else if (reason === BreakpointEventReasons.CHANGED) {
              if (sourceBreakpoint != null) {
                if (!sourceBreakpoint.column) {
                  breakpoint.column = undefined;
                }
                this._model.updateBreakpoints({
                  [sourceBreakpoint.getId()]: breakpoint,
                });
              }
              if (functionBreakpoint != null) {
                this._model.updateFunctionBreakpoints({
                  [functionBreakpoint.getId()]: breakpoint,
                });
              }
            } else {
              logger.warn('Unknown breakpoint event', reason, breakpoint);
            }
          },
        ),
    );

    this._sessionEndDisposables.add(
      session.observeAdapterExitedEvents().subscribe(event => {
        // 'Run without debugging' mode VSCode must terminate the extension host. More details: #3905
        if (session && session.getId() === event.body.sessionId) {
          this._onSessionEnd();
        }
      }),
    );

    this._sessionEndDisposables.add(
      session.observeCustomEvents().subscribe(event => {
        this._emitter.emit(CUSTOM_DEBUG_EVENT, event);
      }),
    );
  }

  _scheduleNativeNotification(): void {
    const raiseNativeNotification = getNotificationService();
    if (raiseNativeNotification != null) {
      const pendingNotification = raiseNativeNotification(
        'Nuclide Debugger',
        'Paused at a breakpoint',
        3000,
        false,
      );
      if (pendingNotification != null) {
        this._sessionEndDisposables.add(pendingNotification);
      }
    }
  }

  onDidCustomEvent(
    callback: (event: DebugProtocol.DebugEvent) => mixed,
  ): IDisposable {
    return this._emitter.on(CUSTOM_DEBUG_EVENT, callback);
  }

  onDidChangeMode(callback: (mode: DebuggerModeType) => mixed): IDisposable {
    return this._emitter.on(CHANGE_DEBUG_MODE, callback);
  }

  async _fetchThreads(
    session: VsDebugSession,
    stoppedDetails?: IRawStoppedDetails,
  ): Promise<void> {
    const response = await session.threads();
    if (response && response.body && response.body.threads) {
      response.body.threads.forEach(thread => {
        this._model.rawUpdate({
          sessionId: session.getId(),
          threadId: thread.id,
          thread,
          stoppedDetails:
            stoppedDetails != null && thread.id === stoppedDetails.threadId
              ? stoppedDetails
              : null,
        });
      });
    }
  }

  _loadBreakpoints(state: ?SerializedState): Breakpoint[] {
    let result: Breakpoint[] = [];
    if (state == null || state.sourceBreakpoints == null) {
      return result;
    }
    try {
      result = state.sourceBreakpoints.map(breakpoint => {
        return new Breakpoint(
          breakpoint.uri,
          breakpoint.line,
          breakpoint.column,
          breakpoint.enabled,
          breakpoint.condition,
          breakpoint.hitCondition,
          breakpoint.adapterData,
        );
      });
    } catch (e) {}

    return result;
  }

  _loadFunctionBreakpoints(state: ?SerializedState): FunctionBreakpoint[] {
    let result: FunctionBreakpoint[] = [];
    if (state == null || state.functionBreakpoints == null) {
      return result;
    }
    try {
      result = state.functionBreakpoints.map(fb => {
        return new FunctionBreakpoint(fb.name, fb.enabled, fb.hitCondition);
      });
    } catch (e) {}

    return result;
  }

  _loadExceptionBreakpoints(state: ?SerializedState): ExceptionBreakpoint[] {
    let result: ExceptionBreakpoint[] = [];
    if (state == null || state.exceptionBreakpoints == null) {
      return result;
    }
    try {
      result = state.exceptionBreakpoints.map(exBreakpoint => {
        return new ExceptionBreakpoint(
          exBreakpoint.filter,
          exBreakpoint.label,
          exBreakpoint.enabled,
        );
      });
    } catch (e) {}

    return result;
  }

  _loadWatchExpressions(state: ?SerializedState): Expression[] {
    let result: Expression[] = [];
    if (state == null || state.watchExpressions == null) {
      return result;
    }
    try {
      result = state.watchExpressions.map(name => new Expression(name));
    } catch (e) {}

    return result;
  }

  _updateModeAndEmit(debugMode: DebuggerModeType): void {
    this._debuggerMode = debugMode;
    this._emitter.emit(CHANGE_DEBUG_MODE, debugMode);
  }

  focusStackFrame(
    stackFrame: ?IStackFrame,
    thread: ?IThread,
    process: ?IProcess,
    explicit?: boolean = false,
  ): void {
    let focusProcess = process;
    if (focusProcess == null) {
      if (stackFrame != null) {
        focusProcess = stackFrame.thread.process;
      } else if (thread != null) {
        focusProcess = thread.process;
      } else {
        const processes = this._model.getProcesses();
        focusProcess = processes.length ? processes[0] : null;
      }
    }
    let focusThread: ?IThread = thread;
    let focusStackFrame = stackFrame;

    if (focusThread == null) {
      if (stackFrame != null) {
        focusThread = stackFrame.thread;
      } else {
        const threads =
          focusProcess != null ? focusProcess.getAllThreads() : [];
        focusThread = threads[0];
      }
    }

    if (stackFrame == null) {
      if (thread != null) {
        const callStack = thread.getCallStack();
        focusStackFrame = callStack[0];
      }
    }

    this._viewModel.setFocus(
      focusStackFrame,
      focusThread,
      focusProcess,
      explicit,
    );
    this._updateModeAndEmit(this._computeDebugMode());
  }

  _computeDebugMode(): DebuggerModeType {
    const focusedThread = this._viewModel.focusedThread;
    if (focusedThread && focusedThread.stopped) {
      return DebuggerMode.PAUSED;
    } else if (this._getCurrentProcess() == null) {
      return DebuggerMode.STOPPED;
    } else {
      return DebuggerMode.RUNNING;
    }
  }

  enableOrDisableBreakpoints(
    enable: boolean,
    breakpoint?: IEnableable,
  ): Promise<void> {
    if (breakpoint != null) {
      this._model.setEnablement(breakpoint, enable);
      if (breakpoint instanceof Breakpoint) {
        return this._sendBreakpoints(breakpoint.uri);
      } else if (breakpoint instanceof FunctionBreakpoint) {
        return this._sendFunctionBreakpoints();
      } else {
        track(AnalyticsEvents.DEBUGGER_TOGGLE_EXCEPTION_BREAKPOINT);
        return this._sendExceptionBreakpoints();
      }
    }

    this._model.enableOrDisableAllBreakpoints(enable);
    return this._sendAllBreakpoints();
  }

  addBreakpoints(
    uri: NuclideUri,
    rawBreakpoints: IRawBreakpoint[],
  ): Promise<void> {
    track(AnalyticsEvents.DEBUGGER_BREAKPOINT_ADD);
    this._model.addBreakpoints(uri, rawBreakpoints);
    return this._sendBreakpoints(uri);
  }

  toggleSourceBreakpoint(uri: NuclideUri, line: number): Promise<void> {
    track(AnalyticsEvents.DEBUGGER_BREAKPOINT_TOGGLE);
    const existing = this._model.getBreakpointAtLine(uri, line);
    if (existing == null) {
      return this.addBreakpoints(uri, [{line}]);
    } else {
      return this.removeBreakpoints(existing.getId(), true);
    }
  }

  updateBreakpoints(
    uri: NuclideUri,
    data: {[id: string]: DebugProtocol.Breakpoint},
  ) {
    this._model.updateBreakpoints(data);
    this._breakpointsToSendOnSave.add(uri);
  }

  async removeBreakpoints(
    id?: string,
    skipAnalytics?: boolean = false,
  ): Promise<void> {
    const toRemove = this._model
      .getBreakpoints()
      .filter(bp => id == null || bp.getId() === id);
    const urisToClear = distinct(toRemove, bp => bp.uri.toString()).map(
      bp => bp.uri,
    );

    this._model.removeBreakpoints(toRemove);

    if (id == null) {
      track(AnalyticsEvents.DEBUGGER_BREAKPOINT_DELETE_ALL);
    } else if (!skipAnalytics) {
      track(AnalyticsEvents.DEBUGGER_BREAKPOINT_DELETE);
    }

    await Promise.all(urisToClear.map(uri => this._sendBreakpoints(uri)));
  }

  setBreakpointsActivated(activated: boolean): Promise<void> {
    this._model.setBreakpointsActivated(activated);
    return this._sendAllBreakpoints();
  }

  addFunctionBreakpoint(): void {
    this._model.addFunctionBreakpoint('');
  }

  renameFunctionBreakpoint(id: string, newFunctionName: string): Promise<void> {
    this._model.updateFunctionBreakpoints({[id]: {name: newFunctionName}});
    return this._sendFunctionBreakpoints();
  }

  removeFunctionBreakpoints(id?: string): Promise<void> {
    this._model.removeFunctionBreakpoints(id);
    return this._sendFunctionBreakpoints();
  }

  addWatchExpression(name: string): void {
    track(AnalyticsEvents.DEBUGGER_WATCH_ADD_EXPRESSION);
    return this._model.addWatchExpression(name);
  }

  renameWatchExpression(id: string, newName: string): void {
    track(AnalyticsEvents.DEBUGGER_WATCH_UPDATE_EXPRESSION);
    return this._model.renameWatchExpression(id, newName);
  }

  removeWatchExpressions(id?: string): void {
    track(AnalyticsEvents.DEBUGGER_WATCH_REMOVE_EXPRESSION);
    this._model.removeWatchExpressions(id);
  }

  createExpression(rawExpression: string): IEvaluatableExpression {
    return new Expression(rawExpression);
  }

  async _doCreateProcess(
    configuration: IProcessConfig,
    sessionId: string,
  ): Promise<?IProcess> {
    let process: ?IProcess;
    const session = this._createVsDebugSession(configuration, sessionId);
    try {
      process = this._model.addProcess(configuration, session);
      this.focusStackFrame(null, null, process);
      this._registerSessionListeners(process, session);
      await session.initialize({
        clientID: 'atom',
        adapterID: configuration.adapterType,
        pathFormat: 'path',
        linesStartAt1: true,
        columnsStartAt1: true,
        supportsVariableType: true,
        supportsVariablePaging: false,
        supportsRunInTerminalRequest: false,
        locale: 'en_US',
      });
      this._model.setExceptionBreakpoints(
        session.getCapabilities().exceptionBreakpointFilters || [],
      );
      if (configuration.debugMode === 'attach') {
        await session.attach(configuration.config);
      } else {
        // It's 'launch'
        await session.launch(configuration.config);
      }
      if (session.isDisconnected()) {
        return;
      }
      this._updateModeAndEmit(DebuggerMode.RUNNING);
      return process;
    } catch (error) {
      if (this._timer != null) {
        this._timer.onError(error);
        this._timer = null;
      }
      track(AnalyticsEvents.DEBUGGER_START_FAIL, {});
      const errorMessage = error instanceof Error ? error.message : error;
      atom.notifications.addError(
        `Failed to start debugger process: ${errorMessage}`,
      );
      this._consoleDisposables.dispose();
      this._updateModeAndEmit(DebuggerMode.STOPPED);
      if (!session.isDisconnected()) {
        session
          .disconnect()
          .catch(onUnexpectedError)
          .then(this._onSessionEnd);
      }
      if (process != null) {
        this._model.removeProcess(process.getId());
      }
      return null;
    }
  }

  _createVsDebugSession(
    configuration: IProcessConfig,
    sessionId: string,
  ): VsDebugSession {
    const service = getVSCodeDebuggerAdapterServiceByNuclideUri(
      configuration.targetUri,
    );
    const spawner = new service.VsRawAdapterSpawnerService();
    const clientPreprocessors: Array<MessageProcessor> = [];
    const adapterPreprocessors: Array<MessageProcessor> = [];
    if (configuration.clientPreprocessor != null) {
      clientPreprocessors.push(configuration.clientPreprocessor);
    }
    if (configuration.adapterPreprocessor != null) {
      adapterPreprocessors.push(configuration.adapterPreprocessor);
    }
    if (nuclideUri.isRemote(configuration.targetUri)) {
      clientPreprocessors.push(remoteToLocalProcessor());
      adapterPreprocessors.push(
        localToRemoteProcessor(configuration.targetUri),
      );
    }
    return new VsDebugSession(
      sessionId,
      logger,
      configuration.adapterExecutable,
      spawner,
      clientPreprocessors,
      adapterPreprocessors,
    );
  }

  sourceIsNotAvailable(uri: NuclideUri): void {
    this._model.sourceIsNotAvailable(uri);
  }

  async restartProcess(): Promise<void> {
    const process = this._getCurrentProcess();
    if (process == null) {
      return;
    }
    if (process.session.capabilities.supportsRestartRequest) {
      await process.session.custom('restart', null);
    }
    await process.session.disconnect(true);
    await sleep(300);
    await this.startDebugging(process.configuration);
  }

  /**
   * Starts debugging. If the configOrName is not passed uses the selected configuration in the debug dropdown.
   * Also saves all files, manages if compounds are present in the configuration
   * and resolveds configurations via DebugConfigurationProviders.
   */
  async startDebugging(config: IProcessConfig): Promise<void> {
    this._timer = startTracking('nuclide-debugger-atom:startDebugging');
    this._onSessionEnd();

    this._updateModeAndEmit(DebuggerMode.STARTING);
    // Open the console window if it's not already opened.
    // eslint-disable-next-line rulesdir/atom-apis
    atom.workspace.open(CONSOLE_VIEW_URI, {searchAllPanes: true});
    this._consoleDisposables = this._registerConsoleExecutor();
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:show',
    );
    await this._doCreateProcess(config, uuid.v4());
  }

  _onSessionEnd = (): void => {
    const session = this._getCurrentSession();
    if (session == null) {
      return;
    }
    track(AnalyticsEvents.DEBUGGER_STOP);
    this._model.removeProcess(session.getId());
    this._sessionEndDisposables.dispose();
    this._consoleDisposables.dispose();
    if (this._timer != null) {
      this._timer.onSuccess();
      this._timer = null;
    }

    this.focusStackFrame(null, null, null);
    this._updateModeAndEmit(DebuggerMode.STOPPED);

    // set breakpoints back to unverified since the session ended.
    const data: {
      [id: string]: DebugProtocol.Breakpoint,
    } = {};
    this._model.getBreakpoints().forEach(bp => {
      data[bp.getId()] = {
        line: bp.line,
        verified: false,
        column: bp.column,
        endLine: bp.endLine == null ? undefined : bp.endLine,
        endColumn: bp.endColumn == null ? undefined : bp.endColumn,
      };
    });
    this._model.updateBreakpoints(data);
  };

  getModel(): IModel {
    return this._model;
  }

  async _sendAllBreakpoints(): Promise<void> {
    await Promise.all(
      distinct(this._model.getBreakpoints(), bp => bp.uri.toString()).map(bp =>
        this._sendBreakpoints(bp.uri, false),
      ),
    );
    await this._sendFunctionBreakpoints();
    // send exception breakpoints at the end since some debug adapters rely on the order
    await this._sendExceptionBreakpoints();
  }

  async _sendBreakpoints(
    modelUri: NuclideUri,
    sourceModified?: boolean = false,
  ): Promise<void> {
    const process = this._getCurrentProcess();
    const session = this._getCurrentSession();
    if (
      process == null ||
      session == null ||
      !session.isReadyForBreakpoints()
    ) {
      return;
    }

    const breakpointsToSend = this._model
      .getBreakpoints()
      .filter(
        bp =>
          this._model.areBreakpointsActivated() &&
          bp.enabled &&
          bp.uri.toString() === modelUri,
      );

    const source = process.sources.get(modelUri);
    let rawSource: DebugProtocol.Source;
    if (source != null) {
      rawSource = source.raw;
    } else {
      // TODO const data = Source.getEncodedDebugData(modelUri);
      rawSource = ({
        name: nuclideUri.basename(modelUri),
        path: modelUri,
        sourceReference: undefined,
      }: DebugProtocol.Source);
    }

    if (breakpointsToSend.length && !rawSource.adapterData) {
      rawSource.adapterData = breakpointsToSend[0].adapterData;
    }

    // The UI is 0-based, while VSP is 1-based.
    const response = await session.setBreakpoints({
      source: (rawSource: any),
      lines: breakpointsToSend.map(bp => bp.line),
      breakpoints: breakpointsToSend.map(bp => ({
        line: bp.line,
        column: bp.column,
        condition: bp.condition,
        hitCondition: bp.hitCondition,
      })),
      sourceModified,
    });
    if (response == null || response.body == null) {
      return;
    }

    const data: {[id: string]: DebugProtocol.Breakpoint} = {};
    for (let i = 0; i < breakpointsToSend.length; i++) {
      data[breakpointsToSend[i].getId()] = response.body.breakpoints[i];
      if (!breakpointsToSend[i].column) {
        // If there was no column sent ignore the breakpoint column response from the adapter
        data[breakpointsToSend[i].getId()].column = undefined;
      }
    }

    this._model.updateBreakpoints(data);
  }

  _getCurrentSession(): ?VsDebugSession {
    return this._viewModel.focusedProcess == null
      ? null
      : (this._viewModel.focusedProcess.session: any);
  }

  _getCurrentProcess(): ?IProcess {
    return this._viewModel.focusedProcess;
  }

  async _sendFunctionBreakpoints(): Promise<void> {
    const session = this._getCurrentSession();
    if (
      session == null ||
      !session.isReadyForBreakpoints() ||
      !session.getCapabilities().supportsFunctionBreakpoints
    ) {
      return;
    }

    const breakpointsToSend: any = this._model
      .getFunctionBreakpoints()
      .filter(fbp => fbp.enabled && this._model.areBreakpointsActivated());
    const response: DebugProtocol.SetFunctionBreakpointsResponse = await session.setFunctionBreakpoints(
      {
        breakpoints: breakpointsToSend,
      },
    );
    if (response == null || response.body == null) {
      return;
    }

    const data = {};
    for (let i = 0; i < breakpointsToSend.length; i++) {
      data[breakpointsToSend[i].getId()] = response.body.breakpoints[i];
    }

    this._model.updateFunctionBreakpoints(data);
  }

  async _sendExceptionBreakpoints(): Promise<void> {
    const session = this._getCurrentSession();
    if (
      session == null ||
      !session.isReadyForBreakpoints() ||
      this._model.getExceptionBreakpoints().length === 0
    ) {
      return;
    }

    const enabledExceptionBps = this._model
      .getExceptionBreakpoints()
      .filter(exb => exb.enabled);
    await session.setExceptionBreakpoints({
      filters: enabledExceptionBps.map(exb => exb.filter),
    });
  }

  _registerConsoleExecutor(): IDisposable {
    const disposables = new UniversalDisposable();
    const registerExecutor = getConsoleRegisterExecutor();
    if (registerExecutor == null) {
      return disposables;
    }
    const output: Subject<
      ConsoleMessage | {result?: EvaluationResult},
    > = new Subject();
    const evaluateExpression = rawExpression => {
      const expression = new Expression(rawExpression);
      const {focusedProcess, focusedStackFrame} = this._viewModel;
      if (focusedProcess == null) {
        logger.error('Cannot evaluate while there is no active debug session');
        return;
      }
      disposables.add(
        // We filter here because the first value in the BehaviorSubject is null no matter what, and
        // we want the console to unsubscribe the stream after the first non-null value.
        expressionAsEvaluationResultStream(
          expression,
          focusedProcess,
          focusedStackFrame,
          'repl',
        )
          .skip(1) // Skip the first pending null value.
          .subscribe(result => {
            // Evaluate all watch expressions and fetch variables again since repl evaluation might have changed some.
            this.focusStackFrame(
              this._viewModel.focusedStackFrame,
              this._viewModel.focusedThread,
              null,
            );

            if (result == null || !expression.available) {
              const message: ConsoleMessage = {
                text: expression.getValue(),
                level: 'error',
              };
              output.next(message);
            } else {
              output.next({data: result});
            }
          }),
      );
    };

    disposables.add(
      registerExecutor({
        id: 'debugger',
        name: 'Debugger',
        scopeName: 'text.plain',
        send(expression: string) {
          evaluateExpression(expression);
        },
        output,
        getProperties: (fetchChildrenForLazyComponent: any),
      }),
    );
    return disposables;
  }

  dispose(): void {
    this._disposables.dispose();
    this._consoleDisposables.dispose();
    this._sessionEndDisposables.dispose();
  }
}
