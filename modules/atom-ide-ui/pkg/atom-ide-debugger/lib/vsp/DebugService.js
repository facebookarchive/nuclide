/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
import type {GatekeeperService} from 'nuclide-commons-atom/types';
import type {TerminalInfo} from '../../../atom-ide-terminal/lib/types';
import type {
  DebuggerModeType,
  IDebugService,
  IModel,
  IViewModel,
  IProcess,
  IThread,
  IEnableable,
  IEvaluatableExpression,
  IRawBreakpoint,
  IStackFrame,
  SerializedState,
} from '../types';
import type {
  IProcessConfig,
  MessageProcessor,
  VSAdapterExecutableInfo,
} from 'nuclide-debugger-common';
import type {EvaluationResult} from 'nuclide-commons-ui/TextRenderer';
import type {TimingTracker} from 'nuclide-commons/analytics';
import * as DebugProtocol from 'vscode-debugprotocol';
import * as React from 'react';

import invariant from 'assert';
import {Icon} from 'nuclide-commons-ui/Icon';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {splitStream} from 'nuclide-commons/observable';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {sleep, serializeAsyncCall} from 'nuclide-commons/promise';
import {
  VsDebugSession,
  localToRemoteProcessor,
  remoteToLocalProcessor,
  getVSCodeDebuggerAdapterServiceByNuclideUri,
} from 'nuclide-debugger-common';
import {Observable, Subject, TimeoutError} from 'rxjs';
import {TextEditorBanner} from 'nuclide-commons-ui/TextEditorBanner';
import ReadOnlyNotice from 'nuclide-commons-ui/ReadOnlyNotice';
import {track, startTracking} from 'nuclide-commons/analytics';
import nullthrows from 'nullthrows';
import {
  getConsoleRegisterExecutor,
  getConsoleService,
  getNotificationService,
  getDatatipService,
  getTerminalService,
  resolveDebugConfiguration,
} from '../AtomServiceContainer';
import {
  expressionAsEvaluationResultStream,
  fetchChildrenForLazyComponent,
  capitalize,
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
import {Emitter, TextBuffer} from 'atom';
import {distinct, mapFromObject} from 'nuclide-commons/collection';
import {onUnexpectedError} from '../utils';
import uuid from 'uuid';
import {
  BreakpointEventReasons,
  DebuggerMode,
  AnalyticsEvents,
  DEBUG_SOURCES_URI,
} from '../constants';
import logger from '../logger';
import stripAnsi from 'strip-ansi';
import url from 'url';
import os from 'os';
import idx from 'idx';

const CONSOLE_VIEW_URI = 'atom://nuclide/console';

const CUSTOM_DEBUG_EVENT = 'CUSTOM_DEBUG_EVENT';
const CHANGE_DEBUG_MODE = 'CHANGE_DEBUG_MODE';
const START_DEBUG_SESSION = 'START_DEBUG_SESSION';

const CHANGE_FOCUSED_PROCESS = 'CHANGE_FOCUSED_PROCESS';
const CHANGE_FOCUSED_STACKFRAME = 'CHANGE_FOCUSED_STACKFRAME';
const CHANGE_EXPRESSION_CONTEXT = 'CHANGE_EXPRESSION_CONTEXT';

// Berakpoint events may arrive sooner than breakpoint responses.
const MAX_BREAKPOINT_EVENT_DELAY_MS = 5 * 1000;

let _gkService: ?GatekeeperService;

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
      : this._focusedThread;
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

  onDidChangeExpressionContext(
    callback: (data: {stackFrame: ?IStackFrame, explicit: boolean}) => mixed,
  ): IDisposable {
    return this._emitter.on(CHANGE_EXPRESSION_CONTEXT, callback);
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
    } else {
      // The focused stack frame didn't change, but something about the
      // context did, so interested listeners should re-evaluate expressions.
      this._emitter.emit(CHANGE_EXPRESSION_CONTEXT, {stackFrame, explicit});
    }
  }
}

function getDebuggerName(adapterType: string): string {
  return `${capitalize(adapterType)} Debugger`;
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
  _breakpointsToSendOnSave: Set<string>;

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
    this._disposables.add(
      atom.workspace.addOpener(uri => {
        if (uri.startsWith(DEBUG_SOURCES_URI)) {
          if (this._debuggerMode !== DebuggerMode.STOPPED) {
            return this._openSourceView(uri);
          }
        }
      }),
    );
  }

  async _openSourceView(uri: string): Promise<atom$TextEditor> {
    const query = (url.parse(uri).path || '').split('/');
    const [, sessionId, sourceReferenceRaw] = query;
    const sourceReference = parseInt(sourceReferenceRaw, 10);

    const process =
      this._model.getProcesses().find(p => p.getId() === sessionId) ||
      this._viewModel.focusedProcess;
    if (process == null) {
      throw new Error(`No debug session for source: ${sourceReference}`);
    }

    const source = process.getSource({
      path: uri,
      sourceReference,
    });

    let content = '';
    try {
      const response = await process.session.source({
        sourceReference,
        source: source.raw,
      });
      content = response.body.content;
    } catch (error) {
      this._sourceIsNotAvailable(uri);
      throw new Error('Debug source is not available');
    }

    const editor = atom.workspace.buildTextEditor({
      buffer: new DebugSourceTextBufffer(content, uri),
      autoHeight: false,
      readOnly: true,
    });

    // $FlowFixMe Debugger source views shouldn't persist between reload.
    editor.serialize = () => null;
    editor.setGrammar(atom.grammars.selectGrammar(source.name || '', content));
    const textEditorBanner = new TextEditorBanner(editor);
    textEditorBanner.render(
      <ReadOnlyNotice
        detailedMessage="This is a debug source view that may not exist on the filesystem."
        canEditAnyway={false}
        onDismiss={textEditorBanner.dispose.bind(textEditorBanner)}
      />,
    );

    this._sessionEndDisposables.addUntilDestroyed(
      editor,
      editor,
      textEditorBanner,
    );

    return editor;
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
      callStack.length === 0 ||
      (this._viewModel.focusedStackFrame &&
        this._viewModel.focusedStackFrame.thread.getId() === thread.getId() &&
        callStack.includes(this._viewModel.focusedStackFrame))
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

  _registerMarkers(process: IProcess): IDisposable {
    let selectedFrameMarker: ?atom$Marker = null;
    let threadChangeDatatip: ?IDisposable;
    let lastFocusedThreadId: ?number;
    let lastFocusedProcess: ?IProcess;

    const cleaupMarkers = () => {
      if (selectedFrameMarker != null) {
        selectedFrameMarker.destroy();
        selectedFrameMarker = null;
      }

      if (threadChangeDatatip != null) {
        threadChangeDatatip.dispose();
        threadChangeDatatip = null;
      }
    };

    return new UniversalDisposable(
      observableFromSubscribeFunction(
        this._viewModel.onDidFocusStackFrame.bind(this._viewModel),
      )
        .concatMap(event => {
          cleaupMarkers();

          const {stackFrame, explicit} = event;

          if (stackFrame == null || !stackFrame.source.available) {
            if (explicit && this._debuggerMode === DebuggerMode.PAUSED) {
              atom.notifications.addWarning(
                'No source available for the selected stack frame',
              );
            }
            return Observable.empty();
          }
          return Observable.fromPromise(stackFrame.openInEditor()).switchMap(
            editor => {
              if (editor == null) {
                atom.notifications.addError(
                  'Failed to open source file for stack frame!',
                );
                return Observable.empty();
              }
              return Observable.of({editor, explicit, stackFrame});
            },
          );
        })
        .subscribe(({editor, explicit, stackFrame}) => {
          const line = stackFrame.range.start.row;
          selectedFrameMarker = editor.markBufferRange(
            [[line, 0], [line, Infinity]],
            {
              invalidate: 'never',
            },
          );
          editor.decorateMarker(selectedFrameMarker, {
            type: 'line',
            class: 'debugger-current-line-highlight',
          });

          const datatipService = getDatatipService();
          if (datatipService == null) {
            return;
          }

          if (
            lastFocusedThreadId != null &&
            !explicit &&
            stackFrame.thread.threadId !== lastFocusedThreadId &&
            process === lastFocusedProcess
          ) {
            let message = `Active thread changed from ${lastFocusedThreadId} to ${
              stackFrame.thread.threadId
            }`;
            const newFocusedProcess = stackFrame.thread.process;
            if (
              lastFocusedProcess != null &&
              !explicit &&
              newFocusedProcess !== lastFocusedProcess
            ) {
              if (
                lastFocusedProcess.configuration.processName != null &&
                newFocusedProcess.configuration.processName != null
              ) {
                message =
                  'Active process changed from ' +
                  lastFocusedProcess.configuration.processName +
                  ' to ' +
                  newFocusedProcess.configuration.processName +
                  ' AND ' +
                  message;
              } else {
                message = 'Active process changed AND ' + message;
              }
            }
            threadChangeDatatip = datatipService.createPinnedDataTip(
              {
                component: () => (
                  <div className="debugger-thread-switch-alert">
                    <Icon icon="alert" />
                    {message}
                  </div>
                ),
                range: stackFrame.range,
                pinnable: true,
              },
              editor,
            );
          }
          lastFocusedThreadId = stackFrame.thread.threadId;
          lastFocusedProcess = stackFrame.thread.process;
        }),

      cleaupMarkers,
    );
  }

  _registerSessionListeners(process: Process, session: VsDebugSession): void {
    this._sessionEndDisposables = new UniversalDisposable(session);
    this._sessionEndDisposables.add(this._registerMarkers(process));

    const sessionId = session.getId();

    const threadFetcher = serializeAsyncCall(async () => {
      const response = await session.threads();
      if (response && response.body && response.body.threads) {
        response.body.threads.forEach(thread => {
          this._model.rawUpdate({
            sessionId,
            thread,
          });
        });
      }
    });

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
            return session
              .configurationDone()
              .then(_ => {
                this._updateModeAndEmit(DebuggerMode.RUNNING);
              })
              .catch(e => {
                // Disconnect the debug session on configuration done error #10596
                this._onSessionEnd();
                session.disconnect().catch(onUnexpectedError);
                atom.notifications.addError(
                  'Failed to configure debugger. This is often because either ' +
                    'the process you tried to attach to has already terminated, or ' +
                    'you do not have permissions (the process is running as root or ' +
                    'another user.)',
                  {
                    detail: e.message,
                  },
                );
              });
          }
        };

        try {
          await this._sendAllBreakpoints().then(
            sendConfigurationDone,
            sendConfigurationDone,
          );
          await threadFetcher();
        } catch (error) {
          onUnexpectedError(error);
        }
      }),
    );

    const toFocusThreads = new Subject();

    const observeContinuedTo = (threadId: ?number) => {
      return session
        .observeContinuedEvents()
        .filter(
          continued =>
            continued.body.allThreadsContinued ||
            (threadId != null && threadId === continued.body.threadId),
        )
        .take(1);
    };

    this._sessionEndDisposables.add(
      session.observeStopEvents().subscribe(() => {
        this._updateModeAndEmit(DebuggerMode.PAUSED);
      }),
      session
        .observeStopEvents()
        .flatMap(event =>
          Observable.fromPromise(threadFetcher())
            .ignoreElements()
            .concat(Observable.of(event))
            .catch(error => {
              onUnexpectedError(error);
              return Observable.empty();
            })
            // Proceeed processing the stopped event only if there wasn't
            // a continued event while we're fetching the threads
            .takeUntil(observeContinuedTo(event.body.threadId)),
        )
        .subscribe((event: DebugProtocol.StoppedEvent) => {
          const {threadId} = event.body;
          // Updating stopped state needs to happen after fetching the threads
          this._model.rawUpdate({
            sessionId,
            stoppedDetails: (event.body: any),
            threadId,
          });

          if (threadId == null) {
            return;
          }
          const thread = process.getThread(threadId);
          if (thread != null) {
            toFocusThreads.next(thread);
          }
        }),

      toFocusThreads
        .concatMap(thread => {
          const {focusedThread} = this._viewModel;
          const preserveFocusHint =
            idx(thread, _ => _.stoppedDetails.preserveFocusHint) || false;

          if (
            focusedThread != null &&
            focusedThread.stopped &&
            focusedThread.getId() !== thread.getId() &&
            preserveFocusHint
          ) {
            // The debugger is already stopped elsewhere.
            return Observable.empty();
          }

          // UX: That'll fetch the top stack frame first (to allow the UI to focus on it),
          // then the rest of the call stack.
          return (
            Observable.fromPromise(this._model.fetchCallStack(thread))
              .ignoreElements()
              .concat(Observable.of(thread))
              // Avoid focusing a continued thread.
              .takeUntil(observeContinuedTo(thread.threadId))
              // Verify the thread is still stopped.
              .filter(() => thread.stopped)
              .catch(error => {
                onUnexpectedError(error);
                return Observable.empty();
              })
          );
        })
        .subscribe(thread => {
          this._tryToAutoFocusStackFrame(thread);
          this._scheduleNativeNotification();
        }),
    );

    this._sessionEndDisposables.add(
      session.observeThreadEvents().subscribe(async event => {
        if (event.body.reason === 'started') {
          await threadFetcher();
        } else if (event.body.reason === 'exited') {
          this._model.clearThreads(session.getId(), true, event.body.threadId);
        }
      }),
    );

    this._sessionEndDisposables.add(
      session.observeTerminateDebugeeEvents().subscribe(event => {
        if (event.body && event.body.restart) {
          this.restartProcess().catch(err => {
            atom.notifications.addError('Failed to restart debugger', {
              detail: err.stack || String(err),
            });
          });
        } else {
          this._onSessionEnd(session);
          session.disconnect().catch(onUnexpectedError);
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
        this._updateModeAndEmit(this._computeDebugMode());
      }),
    );

    const createConsole = getConsoleService();
    if (createConsole != null) {
      const name = getDebuggerName(process.configuration.adapterType);
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
      const KNOWN_CATEGORIES = new Set([
        'stderr',
        'console',
        'telemetry',
        'success',
      ]);
      const logStream = splitStream(
        outputEvents
          .filter(e => !KNOWN_CATEGORIES.has(e.body.category))
          .map(e => stripAnsi(e.body.output)),
      );
      const [errorStream, warningsStream, successStream] = [
        'stderr',
        'console',
        'success',
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
        successStream.subscribe(line => {
          consoleApi.append({text: line, level: 'success'});
        }),
        logStream.subscribe(line => {
          consoleApi.append({text: line, level: 'log'});
        }),
        notificationStream.subscribe(({type, message}) => {
          atom.notifications.add(type, message);
        }),
        // TODO handle non string output (e.g. files & objects)
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
        this._onSessionEnd(session);
      }),
    );

    this._sessionEndDisposables.add(
      session.observeCustomEvents().subscribe(event => {
        this._emitter.emit(CUSTOM_DEBUG_EVENT, event);
      }),
    );

    // Clear in memory breakpoints.
    this._sessionEndDisposables.add(() => {
      const sourceRefBreakpoints = this._model
        .getBreakpoints()
        .filter(bp => bp.uri.startsWith(DEBUG_SOURCES_URI));
      if (sourceRefBreakpoints.length > 0) {
        this._model.removeBreakpoints(sourceRefBreakpoints);
      }
    });
  }

  _scheduleNativeNotification(): void {
    const raiseNativeNotification = getNotificationService();
    if (raiseNativeNotification != null) {
      const pendingNotification = raiseNativeNotification(
        'Debugger',
        'Paused at a breakpoint',
        3000,
        false,
      );
      if (pendingNotification != null) {
        this._sessionEndDisposables.add(pendingNotification);
      }
    }
  }

  onDidStartDebugSession(
    callback: (config: IProcessConfig) => mixed,
  ): IDisposable {
    return this._emitter.on(START_DEBUG_SESSION, callback);
  }

  onDidCustomEvent(
    callback: (event: DebugProtocol.DebugEvent) => mixed,
  ): IDisposable {
    return this._emitter.on(CUSTOM_DEBUG_EVENT, callback);
  }

  onDidChangeMode(callback: (mode: DebuggerModeType) => mixed): IDisposable {
    return this._emitter.on(CHANGE_DEBUG_MODE, callback);
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
        focusProcess = this._model.getProcesses()[0];
      }
    }
    let focusThread: ?IThread = thread;
    let focusStackFrame = stackFrame;

    if (focusThread == null && stackFrame != null) {
      focusThread = stackFrame.thread;
    } else if (focusThread != null && focusProcess != null) {
      focusThread = focusProcess.getThread(focusThread.threadId);
    }

    if (stackFrame == null && thread != null) {
      focusStackFrame = thread.getCallStack()[0];
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
    const {focusedThread, focusedStackFrame} = this._viewModel;
    if (
      focusedStackFrame != null ||
      (focusedThread != null && focusedThread.stopped)
    ) {
      return DebuggerMode.PAUSED;
    } else if (this._getCurrentProcess() == null) {
      return DebuggerMode.STOPPED;
    } else if (this._debuggerMode === DebuggerMode.STARTING) {
      return DebuggerMode.STARTING;
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

  addBreakpoints(uri: string, rawBreakpoints: IRawBreakpoint[]): Promise<void> {
    track(AnalyticsEvents.DEBUGGER_BREAKPOINT_ADD);
    this._model.addBreakpoints(uri, rawBreakpoints);
    return this._sendBreakpoints(uri);
  }

  addSourceBreakpoint(uri: string, line: number): Promise<void> {
    track(AnalyticsEvents.DEBUGGER_BREAKPOINT_SINGLE_ADD);
    const existing = this._model.getBreakpointAtLine(uri, line);
    if (existing == null) {
      return this.addBreakpoints(uri, [{line}]);
    }
    return Promise.resolve(undefined);
  }

  toggleSourceBreakpoint(uri: string, line: number): Promise<void> {
    track(AnalyticsEvents.DEBUGGER_BREAKPOINT_TOGGLE);
    const existing = this._model.getBreakpointAtLine(uri, line);
    if (existing == null) {
      return this.addBreakpoints(uri, [{line}]);
    } else {
      return this.removeBreakpoints(existing.getId(), true);
    }
  }

  updateBreakpoints(
    uri: string,
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
    const urisToClear = distinct(toRemove, bp => bp.uri).map(bp => bp.uri);

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

  async terminateThreads(threadIds: Array<number>): Promise<void> {
    const {focusedProcess} = this.viewModel;
    if (focusedProcess == null) {
      return;
    }

    const session = focusedProcess.session;
    track(AnalyticsEvents.DEBUGGER_TERMINATE_THREAD);
    if (Boolean(session.capabilities.supportsTerminateThreadsRequest)) {
      await session.custom('terminateThreads', {
        threadIds,
      });
    }
  }

  async runToLocation(uri: string, line: number): Promise<void> {
    const {focusedThread, focusedProcess} = this.viewModel;
    if (focusedThread == null || focusedProcess == null) {
      return;
    }

    const session = focusedProcess.session;

    track(AnalyticsEvents.DEBUGGER_STEP_RUN_TO_LOCATION);
    if (Boolean(session.capabilities.supportsContinueToLocation)) {
      await session.custom('continueToLocation', {
        source: focusedProcess.getSource({path: uri}).raw,
        line,
        threadId: focusedThread.threadId,
      });
      return;
    }
    const existing = this._model.getBreakpointAtLine(uri, line);
    if (existing == null) {
      await this.addBreakpoints(uri, [{line}]);
      const runToLocationBreakpoint = this._model.getBreakpointAtLine(
        uri,
        line,
      );
      invariant(runToLocationBreakpoint != null);

      const removeBreakpoint = () => {
        this.removeBreakpoints(
          runToLocationBreakpoint.getId(),
          true /* skip analytics */,
        ).catch(error =>
          onUnexpectedError(
            `Failed to clear run-to-location breakpoint! - ${String(error)}`,
          ),
        );
        removeBreakpointDisposable.dispose();
        this._sessionEndDisposables.remove(removeBreakpointDisposable);
        this._sessionEndDisposables.remove(removeBreakpoint);
      };

      // Remove if the debugger stopped at any location.
      const removeBreakpointDisposable = new UniversalDisposable(
        session
          .observeStopEvents()
          .take(1)
          .subscribe(removeBreakpoint),
      );
      // Remove if the session has ended without hitting it.
      this._sessionEndDisposables.add(
        removeBreakpointDisposable,
        removeBreakpoint,
      );
    }
    await focusedThread.continue();
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
    rawConfiguration: IProcessConfig,
    sessionId: string,
  ): Promise<?IProcess> {
    let process: ?IProcess;
    let session: ?VsDebugSession;
    const errorHandler = (error: Error) => {
      if (this._timer != null) {
        this._timer.onError(error);
        this._timer = null;
      }
      track(AnalyticsEvents.DEBUGGER_START_FAIL, {});
      const errorMessage = error instanceof Error ? error.message : error;
      atom.notifications.addError(
        `Failed to start debugger process: ${errorMessage}`,
      );
      if (
        this._model.getProcesses() == null ||
        this._model.getProcesses().length === 0
      ) {
        this._consoleDisposables.dispose();
        this._updateModeAndEmit(DebuggerMode.STOPPED);
      }
      if (session != null && !session.isDisconnected()) {
        this._onSessionEnd();
        session.disconnect().catch(onUnexpectedError);
      }
      if (process != null) {
        this._model.removeProcess(process.getId());
      }
    };

    try {
      const adapterExecutable = await this._resolveAdapterExecutable(
        rawConfiguration,
      );
      const configuration = await resolveDebugConfiguration({
        ...rawConfiguration,
        adapterExecutable,
      });
      const {
        adapterType,
        onInitializeCallback,
        customDisposable,
      } = configuration;

      track(AnalyticsEvents.DEBUGGER_START, {
        serviceName: configuration.adapterType,
        clientType: 'VSP',
      });

      const createInitializeSession = async (config: IProcessConfig) => {
        const newSession = await this._createVsDebugSession(
          config,
          config.adapterExecutable || adapterExecutable,
          sessionId,
        );

        process = this._model.addProcess(config, newSession);
        this._emitter.emit(START_DEBUG_SESSION, config);
        this.focusStackFrame(null, null, process);
        this._registerSessionListeners(process, newSession);
        atom.commands.dispatch(
          atom.views.getView(atom.workspace),
          'debugger:show',
        );
        await newSession.initialize({
          clientID: 'atom',
          adapterID: adapterType,
          pathFormat: 'path',
          linesStartAt1: true,
          columnsStartAt1: true,
          supportsVariableType: true,
          supportsVariablePaging: false,
          supportsRunInTerminalRequest: getTerminalService() != null,
          locale: 'en-us',
        });

        if (onInitializeCallback != null) {
          await onInitializeCallback(newSession);
        }

        this._model.setExceptionBreakpoints(
          newSession.getCapabilities().exceptionBreakpointFilters || [],
        );
        return newSession;
      };

      session = await createInitializeSession(configuration);

      // We're not awaiting launch/attach to finish because some debug adapters
      // need to do custom work for launch/attach to work (e.g. mobilejs)
      this._launchOrAttachTarget(session, configuration).catch(async error => {
        if (
          configuration.debugMode === 'attach' &&
          configuration.adapterExecutable != null &&
          configuration.adapterExecutable.command !== 'sudo' &&
          // sudo is not supported on Windows, and currently remote projects
          // are not supported on Windows, so a remote URI must be *nix.
          (os.platform() !== 'win32' ||
            nuclideUri.isRemote(configuration.targetUri))
        ) {
          configuration.adapterExecutable.args = [
            configuration.adapterExecutable.command,
            ...configuration.adapterExecutable.args,
          ];
          configuration.adapterExecutable.command = 'sudo';

          const errorMessage = error instanceof Error ? error.message : error;
          atom.notifications.addWarning(
            `The debugger was unable to attach to the target process: ${errorMessage}. ` +
              'Attempting to re-launch the debugger as root...',
          );

          session = await createInitializeSession(configuration);
          this._launchOrAttachTarget(session, configuration).catch(
            errorHandler,
          );
        } else {
          errorHandler(error);
        }
      });

      // make sure to add the configuration.customDisposable to dispose on
      //   session end
      if (customDisposable != null) {
        customDisposable.add(
          this.viewModel.onDidFocusProcess(() => {
            if (
              !this.getModel()
                .getProcesses()
                .includes(process)
            ) {
              customDisposable.dispose();
            }
          }),
        );
      }

      return process;
    } catch (error) {
      errorHandler(error);
      return null;
    }
  }

  async _resolveAdapterExecutable(
    configuration: IProcessConfig,
  ): Promise<VSAdapterExecutableInfo> {
    if (configuration.adapterExecutable != null) {
      return configuration.adapterExecutable;
    }
    return getVSCodeDebuggerAdapterServiceByNuclideUri(
      configuration.targetUri,
    ).getAdapterExecutableInfo(configuration.adapterType);
  }

  async _createVsDebugSession(
    configuration: IProcessConfig,
    adapterExecutable: VSAdapterExecutableInfo,
    sessionId: string,
  ): Promise<VsDebugSession> {
    const {targetUri} = configuration;
    const service = getVSCodeDebuggerAdapterServiceByNuclideUri(targetUri);
    const spawner = await service.createVsRawAdapterSpawnerService();

    const clientPreprocessors: Array<MessageProcessor> = [];
    const adapterPreprocessors: Array<MessageProcessor> = [];
    if (configuration.clientPreprocessor != null) {
      clientPreprocessors.push(configuration.clientPreprocessor);
    }
    if (configuration.adapterPreprocessor != null) {
      adapterPreprocessors.push(configuration.adapterPreprocessor);
    }
    const isRemote = nuclideUri.isRemote(targetUri);
    if (isRemote) {
      clientPreprocessors.push(remoteToLocalProcessor());
      adapterPreprocessors.push(localToRemoteProcessor(targetUri));
    }
    return new VsDebugSession(
      sessionId,
      logger,
      adapterExecutable,
      {adapter: configuration.adapterType, host: 'debugService', isRemote},
      spawner,
      clientPreprocessors,
      adapterPreprocessors,
      this._runInTerminal,
    );
  }

  async _launchOrAttachTarget(
    session: VsDebugSession,
    configuration: IProcessConfig,
  ): Promise<void> {
    if (configuration.debugMode === 'attach') {
      await session.attach(configuration.config);
    } else {
      // It's 'launch'
      await session.launch(configuration.config);
    }
  }

  _sourceIsNotAvailable(uri: string): void {
    this._model.sourceIsNotAvailable(uri);
  }

  _runInTerminal = async (
    args: DebugProtocol.RunInTerminalRequestArguments,
  ): Promise<void> => {
    const terminalService = getTerminalService();
    if (terminalService == null) {
      throw new Error(
        'Unable to launch in terminal since the service is not available',
      );
    }
    const process = this._getCurrentProcess();
    if (process == null) {
      throw new Error("There's no debug process to create a terminal for!");
    }
    const {adapterType, targetUri} = process.configuration;
    const key = `targetUri=${targetUri}&command=${args.args[0]}`;

    // Ensure any previous instances of this same target are closed before
    // opening a new terminal tab. We don't want them to pile up if the
    // user keeps running the same app over and over.
    terminalService.close(key);

    const title =
      args.title != null ? args.title : getDebuggerName(adapterType);
    const hostname = nuclideUri.getHostnameOpt(targetUri);
    const cwd =
      hostname == null
        ? args.cwd
        : nuclideUri.createRemoteUri(hostname, args.cwd);

    const info: TerminalInfo = {
      key,
      title,
      cwd,
      command: {
        file: args.args[0],
        args: args.args.slice(1),
      },
      environmentVariables:
        args.env != null ? mapFromObject(args.env) : undefined,
      preservedCommands: [
        'debugger:continue-debugging',
        'debugger:stop-debugging',
        'debugger:restart-debugging',
        'debugger:step-over',
        'debugger:step-into',
        'debugger:step-out',
      ],
      remainOnCleanExit: true,
      icon: 'nuclicon-debugger',
      defaultLocation: 'bottom',
    };
    const terminal = await terminalService.open(info);
    terminal.setProcessExitCallback(() => {
      // This callback is invoked if the target process dies first, ensuring
      // we tear down the debugger.
      this.stopProcess();
    });

    this._sessionEndDisposables.add(() => {
      // This termination path is invoked if the debugger dies first, ensuring
      // we terminate the target process. This can happen if the user hits stop,
      // or if the debugger crashes.
      terminal.setProcessExitCallback(() => {});
      terminal.terminateProcess();
    });
  };

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
    this._timer = startTracking('debugger-atom:startDebugging');

    if (this._viewModel.focusedProcess != null) {
      // We currently support only running only one debug session at a time,
      // so stop the current debug session.

      if (_gkService != null) {
        const passesMultiGK = await _gkService.passesGK(
          'nuclide_multitarget_debugging',
        );
        if (!passesMultiGK) {
          this.stopProcess();
        }
        _gkService
          .passesGK('nuclide_processtree_debugging')
          .then(passesProcessTree => {
            if (passesProcessTree) {
              track(AnalyticsEvents.DEBUGGER_TREE_OPENED);
            }
          });
      } else {
        this.stopProcess();
      }
    }

    this._updateModeAndEmit(DebuggerMode.STARTING);
    // Open the console window if it's not already opened.
    // eslint-disable-next-line nuclide-internal/atom-apis
    atom.workspace.open(CONSOLE_VIEW_URI, {searchAllPanes: true});
    this._consoleDisposables = this._registerConsoleExecutor();
    await this._doCreateProcess(config, uuid.v4());
    if (this._model.getProcesses().length > 1) {
      const debuggerTypes = [];
      this._model.getProcesses().forEach(process => {
        debuggerTypes.push(process.configuration.adapterType);
      });
      track(AnalyticsEvents.DEBUGGER_MULTITARGET, {
        processesCount: this._model.getProcesses().length,
        debuggerTypes,
      });
    }
  }

  consumeGatekeeperService(service: GatekeeperService): IDisposable {
    _gkService = service;
    return new UniversalDisposable(() => (_gkService = null));
  }

  _onSessionEnd = (givenSession: ?VsDebugSession): void => {
    const session =
      givenSession == null ? this._getCurrentSession() : givenSession;
    if (session == null) {
      return;
    }
    track(AnalyticsEvents.DEBUGGER_STOP);
    const removedProcesses = this._model.removeProcess(session.getId());
    if (
      this._model.getProcesses() == null ||
      this._model.getProcesses().length === 0
    ) {
      this._sessionEndDisposables.dispose();
      this._consoleDisposables.dispose();
      this.focusStackFrame(null, null, null);
      this._updateModeAndEmit(DebuggerMode.STOPPED);
    } else {
      if (
        this._viewModel.focusedProcess != null &&
        this._viewModel.focusedProcess.getId() === session.getId()
      ) {
        const processToFocus = this._model.getProcesses()[
          this._model.getProcesses().length - 1
        ];
        const threadToFocus =
          processToFocus.getAllThreads().length > 0
            ? processToFocus.getAllThreads()[0]
            : null;
        const frameToFocus =
          threadToFocus != null && threadToFocus.getCallStack.length > 0
            ? threadToFocus.getCallStack()[0]
            : null;

        this.focusStackFrame(frameToFocus, threadToFocus, processToFocus);
      }
    }

    const createConsole = getConsoleService();
    if (createConsole != null) {
      const name = 'Nuclide Debugger';
      const consoleApi = createConsole({
        id: name,
        name,
      });

      removedProcesses.forEach(p =>
        consoleApi.append({
          text:
            'Process exited' +
            (p.configuration.processName == null
              ? ''
              : ' (' + p.configuration.processName + ')'),
          level: 'log',
        }),
      );
    }

    if (this._timer != null) {
      this._timer.onSuccess();
      this._timer = null;
    }

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
      distinct(this._model.getBreakpoints(), bp => bp.uri).map(bp =>
        this._sendBreakpoints(bp.uri, false),
      ),
    );
    await this._sendFunctionBreakpoints();
    // send exception breakpoints at the end since some debug adapters rely on the order
    await this._sendExceptionBreakpoints();
  }

  async _sendBreakpoints(
    uri: string,
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
          this._model.areBreakpointsActivated() && bp.enabled && bp.uri === uri,
      );

    const rawSource = process.getSource({
      path: uri,
      name: nuclideUri.basename(uri),
    }).raw;

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
              false,
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

class DebugSourceTextBufffer extends TextBuffer {
  _uri: string;

  constructor(contents: string, uri: string) {
    super(contents);
    this._uri = uri;
  }

  getUri() {
    return this._uri;
  }

  getPath() {
    return this._uri;
  }

  isModified() {
    return false;
  }
}
