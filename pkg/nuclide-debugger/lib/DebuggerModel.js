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

import type {DatatipService} from 'atom-ide-ui';
import type {
  ControlButtonSpecification,
  DebuggerInstanceInterface,
  DebuggerLaunchAttachProvider,
  DebuggerProcessInfo,
  NuclideDebuggerProvider,
  NuclideEvaluationExpressionProvider,
} from 'nuclide-debugger-common';
import type {DebuggerAction} from './DebuggerDispatcher';
import type {
  BreakpointUserChangeArgType,
  Callstack,
  ChromeProtocolResponse,
  DebuggerModeType,
  DebuggerSettings,
  Expression,
  EvalCommand,
  EvaluatedExpression,
  EvaluatedExpressionList,
  EvaluationResult,
  ExpansionResult,
  FileLineBreakpoint,
  FileLineBreakpoints,
  NuclideThreadData,
  ObjectGroup,
  SerializedBreakpoint,
  ScopesMap,
  ScopeSection,
  ScopeSectionPayload,
  ThreadItem,
} from './types';
import type {
  SetVariableResponse,
  RemoteObjectId,
} from 'nuclide-debugger-common/protocol-types';

import * as React from 'react';
import BreakpointManager from './BreakpointManager';
import DebuggerActions from './DebuggerActions';
import Bridge from './Bridge';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import DebuggerDispatcher from './DebuggerDispatcher';
import {Emitter} from 'atom';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {ActionTypes} from './DebuggerDispatcher';
import debounce from 'nuclide-commons/debounce';
import {Icon} from 'nuclide-commons-ui/Icon';
import {DebuggerMode} from './constants';
import nullthrows from 'nullthrows';
import {BehaviorSubject, Observable} from 'rxjs';
import {track} from '../../nuclide-analytics';
import {AnalyticsEvents} from './constants';
import {reportError} from './Protocol/EventReporter';
import {isLocalScopeName} from './utils';
import {Deferred} from 'nuclide-commons/promise';
import {getLogger} from 'log4js';
import {normalizeRemoteObjectValue} from './normalizeRemoteObjectValue';
import invariant from 'assert';
import {getNotificationService} from './AtomServiceContainer';

import type {SerializedState} from '..';

export const WORKSPACE_VIEW_URI = 'atom://nuclide/debugger';

const CALLSTACK_CHANGE_EVENT = 'CALLSTACK_CHANGE_EVENT';
const THREADS_CHANGED_EVENT = 'THREADS_CHANGED_EVENT';
const CONNECTIONS_UPDATED_EVENT = 'CONNECTIONS_UPDATED_EVENT';
const PROVIDERS_UPDATED_EVENT = 'PROVIDERS_UPDATED_EVENT';
const DEBUGGER_CHANGE_EVENT = 'DEBUGGER_CHANGE_EVENT';
const DEBUGGER_MODE_CHANGE_EVENT = 'DEBUGGER_MODE_CHANGE_EVENT';
const BREAKPOINT_NEED_UI_UPDATE = 'BREAKPOINT_NEED_UI_UPDATE';
const BREAKPOINT_USER_CHANGED = 'BREAKPOINT_USER_CHANGED';
const ADD_BREAKPOINT_ACTION = 'AddBreakpoint';
const DELETE_BREAKPOINT_ACTION = 'DeleteBreakpoint';

type LineToBreakpointMap = Map<number, FileLineBreakpoint>;

/**
 * Atom ViewProvider compatible model object.
 */
export default class DebuggerModel {
  _disposables: UniversalDisposable;
  _actions: DebuggerActions;
  _breakpointManager: BreakpointManager;
  _dispatcher: DebuggerDispatcher;
  _bridge: Bridge;
  _emitter: Emitter;
  _datatipService: ?DatatipService;
  _debuggerSettings: DebuggerSettings;
  _debuggerInstance: ?DebuggerInstanceInterface;
  _error: ?string;
  _evaluationExpressionProviders: Set<NuclideEvaluationExpressionProvider>;
  _debuggerMode: DebuggerModeType;
  _togglePauseOnException: boolean;
  _togglePauseOnCaughtException: boolean;
  _enableShowDisassembly: boolean;
  _onLoaderBreakpointResume: () => void;
  _registerExecutor: ?() => IDisposable;
  _consoleDisposable: ?IDisposable;
  _customControlButtons: Array<ControlButtonSpecification>;
  _debugProcessInfo: ?DebuggerProcessInfo;
  _setSourcePathCallback: ?() => void;
  loaderBreakpointResumePromise: Promise<void>;

  // CallStack state
  _callstack: ?Callstack;
  _selectedCallFrameIndex: number;
  _selectedCallFrameMarker: ?atom$Marker;

  // Threads state
  _threadMap: Map<number, ThreadItem>;
  _owningProcessId: number;
  _selectedThreadId: number;
  _stopThreadId: number;
  _threadChangeDatatip: ?IDisposable;
  _threadsReloading: boolean;

  // Scopes
  _scopes: BehaviorSubject<ScopesMap>;
  _expandedScopes: Map<string, boolean>;

  // Debugger providers
  _debuggerProviders: Set<NuclideDebuggerProvider>;
  _connections: Array<string>;

  // Watch expressions
  _watchExpressions: Map<Expression, BehaviorSubject<?EvaluationResult>>;
  _previousEvaluationSubscriptions: UniversalDisposable;
  _evaluationId: number;
  _evaluationRequestsInFlight: Map<number, Deferred<mixed>>;
  _watchExpressionsList: BehaviorSubject<EvaluatedExpressionList>;

  // Breakpoints
  _breakpointIdSeed: number;
  _breakpoints: Map<string, LineToBreakpointMap>;
  _idToBreakpointMap: Map<number, FileLineBreakpoint>;

  constructor(state: ?SerializedState) {
    this._dispatcher = new DebuggerDispatcher();
    this._debuggerSettings = {
      supportThreadsWindow: false,
      threadsComponentTitle: 'Threads',
    };
    this._debuggerInstance = null;
    this._error = null;
    this._evaluationExpressionProviders = new Set();
    this._togglePauseOnException =
      state != null ? state.pauseOnException : true;
    this._togglePauseOnCaughtException =
      state != null ? state.pauseOnCaughtException : false;
    this._enableShowDisassembly = false;
    this._registerExecutor = null;
    this._consoleDisposable = null;
    this._customControlButtons = [];
    this._debugProcessInfo = null;
    this._setSourcePathCallback = null;
    this.loaderBreakpointResumePromise = new Promise(resolve => {
      this._onLoaderBreakpointResume = resolve;
    });

    this._callstack = null;
    this._selectedCallFrameIndex = 0;
    this._selectedCallFrameMarker = null;
    this._emitter = new Emitter();
    this._datatipService = null;
    this._threadMap = new Map();
    this._owningProcessId = 0;
    this._selectedThreadId = 0;
    this._stopThreadId = 0;
    this._threadsReloading = false;
    this._debuggerMode = DebuggerMode.STOPPED;
    this._debuggerProviders = new Set();
    // There is always a local connection.
    this._connections = ['local'];
    this._scopes = new BehaviorSubject(new Map());
    this._expandedScopes = new Map();
    this._evaluationId = 0;
    this._watchExpressions = new Map();
    this._evaluationRequestsInFlight = new Map();
    // `this._previousEvaluationSubscriptions` can change at any time and are a distinct subset of
    // `this._disposables`.
    this._previousEvaluationSubscriptions = new UniversalDisposable();
    this._watchExpressionsList = new BehaviorSubject([]);

    this._breakpointIdSeed = 0;
    this._breakpoints = new Map();
    this._idToBreakpointMap = new Map();

    // Debounce calls to _openPathInEditor to work around an Atom bug that causes
    // two editor windows to be opened if multiple calls to atom.workspace.open
    // are made close together, even if {searchAllPanes: true} is set.
    (this: any)._openPathInEditor = debounce(this._openPathInEditor, 100, true);
    this._actions = new DebuggerActions(this._dispatcher, this);
    this._breakpointManager = new BreakpointManager(this._actions, this);
    this._bridge = new Bridge(this);
    const initialWatchExpressions =
      state != null ? state.watchExpressions : null;
    this._deserializeWatchExpressions(initialWatchExpressions);
    this._deserializeBreakpoints(state != null ? state.breakpoints : null);

    const dispatcherToken = this._dispatcher.register(
      this._handlePayload.bind(this),
    );

    this._disposables = new UniversalDisposable(
      this._actions,
      this._breakpointManager,
      this._bridge,
      () => {
        this._dispatcher.unregister(dispatcherToken);
        this._clearSelectedCallFrameMarker();
        this._cleanUpDatatip();
        this._watchExpressions.clear();
        if (this._debuggerInstance != null) {
          this._debuggerInstance.dispose();
          this._debuggerInstance = null;
        }
        if (this._debugProcessInfo != null) {
          this._debugProcessInfo.dispose();
          this._debugProcessInfo = null;
        }
      },
      this._listenForProjectChange(),
      this._previousEvaluationSubscriptions,
    );
  }

  _listenForProjectChange(): IDisposable {
    return atom.project.onDidChangePaths(() => {
      this._actions.updateConnections();
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  getActions(): DebuggerActions {
    return this._actions;
  }

  getBridge(): Bridge {
    return this._bridge;
  }

  getTitle(): string {
    return 'Debugger';
  }

  getDefaultLocation(): string {
    return 'right';
  }

  getURI(): string {
    return WORKSPACE_VIEW_URI;
  }

  getPreferredWidth(): number {
    return 500;
  }

  selectThread(threadId: string): void {
    this._bridge.selectThread(threadId);
  }

  setSelectedCallFrameIndex(callFrameIndex: number): void {
    this._bridge.setSelectedCallFrameIndex(callFrameIndex);
    this._actions.setSelectedCallFrameIndex(callFrameIndex);
  }

  _handlePayload(payload: DebuggerAction): void {
    switch (payload.actionType) {
      case ActionTypes.CLEAR_INTERFACE:
        this._handleClearInterface();
        this._emitter.emit(THREADS_CHANGED_EVENT);
        break;
      case ActionTypes.SET_SELECTED_CALLFRAME_LINE:
        // TODO: update _selectedCallFrameIndex.
        this._setSelectedCallFrameLine(payload.data.options);
        break;
      case ActionTypes.OPEN_SOURCE_LOCATION:
        this._openSourceLocation(
          payload.data.sourceURL,
          payload.data.lineNumber,
        );
        break;
      case ActionTypes.UPDATE_CALLSTACK:
        this._updateCallstack(payload.data.callstack);
        break;
      case ActionTypes.SET_SELECTED_CALLFRAME_INDEX:
        this._clearScopesInterface();
        this._updateSelectedCallFrameIndex(payload.data.index);
        break;
      case ActionTypes.UPDATE_THREADS:
        this._threadsReloading = false;
        this._updateThreads(payload.data.threadData);
        this._emitter.emit(THREADS_CHANGED_EVENT);
        break;
      case ActionTypes.UPDATE_THREAD:
        this._threadsReloading = false;
        this._updateThread(payload.data.thread);
        this._emitter.emit(THREADS_CHANGED_EVENT);
        break;
      case ActionTypes.UPDATE_STOP_THREAD:
        this._updateStopThread(payload.data.id);
        this._emitter.emit(THREADS_CHANGED_EVENT);
        break;
      case ActionTypes.UPDATE_SELECTED_THREAD:
        this._updateSelectedThread(payload.data.id);
        this._emitter.emit(THREADS_CHANGED_EVENT);
        break;
      case ActionTypes.NOTIFY_THREAD_SWITCH:
        this._notifyThreadSwitch(
          payload.data.sourceURL,
          payload.data.lineNumber,
          payload.data.message,
        );
        break;
      case ActionTypes.DEBUGGER_MODE_CHANGE:
        if (
          this._debuggerMode === DebuggerMode.RUNNING &&
          payload.data === DebuggerMode.PAUSED
        ) {
          // If the debugger just transitioned from running to paused, the debug server should
          // be sending updated thread stacks. This may take a moment.
          this._threadsReloading = true;
        } else if (payload.data === DebuggerMode.RUNNING) {
          // The UI is never waiting for threads if it's running.
          this._threadsReloading = false;
        }

        if (payload.data === DebuggerMode.PAUSED) {
          this.triggerReevaluation();
          // Moving from non-pause to pause state.
          this._scheduleNativeNotification();
        } else if (payload.data === DebuggerMode.STOPPED) {
          this._cancelRequestsToBridge();
          this._clearEvaluationValues();
          this.loaderBreakpointResumePromise = new Promise(resolve => {
            this._onLoaderBreakpointResume = resolve;
          });
        } else if (payload.data === DebuggerMode.STARTING) {
          this._refetchWatchSubscriptions();
        }

        this._debuggerMode = payload.data;
        this._emitter.emit(DEBUGGER_MODE_CHANGE_EVENT);
        this._emitter.emit(THREADS_CHANGED_EVENT);

        // Breakpoint handling
        if (this._debuggerMode === DebuggerMode.STOPPED) {
          // All breakpoints should be unresolved after stop debugging.
          this._resetBreakpoints();
        } else {
          for (const breakpoint of this.getAllBreakpoints()) {
            if (!breakpoint.resolved) {
              this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, breakpoint.path);
            }
          }
        }
        break;
      case ActionTypes.SET_PROCESS_SOCKET:
        const {data} = payload;
        if (data == null) {
          this._bridge.leaveDebugMode();
        } else {
          this._bridge.enterDebugMode();
          this._bridge.setupChromeChannel();
          this._bridge.enableEventsListening();
        }
        break;
      case ActionTypes.TRIGGER_DEBUGGER_ACTION:
        this._bridge.triggerAction(payload.data.actionId);
        break;
      case ActionTypes.ADD_DEBUGGER_PROVIDER:
        if (this._debuggerProviders.has(payload.data)) {
          return;
        }
        this._debuggerProviders.add(payload.data);
        this._emitter.emit(PROVIDERS_UPDATED_EVENT);
        break;
      case ActionTypes.REMOVE_DEBUGGER_PROVIDER:
        if (!this._debuggerProviders.has(payload.data)) {
          return;
        }
        this._debuggerProviders.delete(payload.data);
        break;
      case ActionTypes.UPDATE_CONNECTIONS:
        this._connections = payload.data;
        this._emitter.emit(CONNECTIONS_UPDATED_EVENT);
        break;
      case ActionTypes.UPDATE_SCOPES:
        this._handleUpdateScopesAsPayload(payload.data);
        break;
      case ActionTypes.RECEIVED_GET_PROPERTIES_RESPONSE: {
        const {id, response} = payload.data;
        this._handleResponseForPendingRequest(id, response);
        break;
      }
      case ActionTypes.RECEIVED_EXPRESSION_EVALUATION_RESPONSE: {
        const {id, response} = payload.data;
        response.result = normalizeRemoteObjectValue(response.result);
        this._handleResponseForPendingRequest(id, response);
        break;
      }
      case ActionTypes.ADD_WATCH_EXPRESSION:
        this._addWatchExpression(payload.data.expression);
        break;
      case ActionTypes.REMOVE_WATCH_EXPRESSION:
        this._removeWatchExpression(payload.data.index);
        break;
      case ActionTypes.UPDATE_WATCH_EXPRESSION:
        this._updateWatchExpression(
          payload.data.index,
          payload.data.newExpression,
        );
        break;
      case ActionTypes.SET_ERROR:
        this._error = payload.data;
        break;
      case ActionTypes.SET_DEBUGGER_INSTANCE:
        this._debuggerInstance = payload.data;
        break;
      case ActionTypes.TOGGLE_PAUSE_ON_EXCEPTION:
        const pauseOnException = payload.data;
        this._togglePauseOnException = pauseOnException;
        if (!this._togglePauseOnException) {
          this._togglePauseOnCaughtException = false;
        }
        if (this.isDebugging()) {
          this.getBridge().setPauseOnException(pauseOnException);
          if (!pauseOnException) {
            this.getBridge().setPauseOnCaughtException(
              this._togglePauseOnCaughtException,
            );
          }
        }
        break;
      case ActionTypes.TOGGLE_PAUSE_ON_CAUGHT_EXCEPTION:
        const pauseOnCaughtException = payload.data;
        this._togglePauseOnCaughtException = pauseOnCaughtException;
        if (this.isDebugging()) {
          this.getBridge().setPauseOnCaughtException(pauseOnCaughtException);
        }
        break;
      case ActionTypes.ADD_EVALUATION_EXPRESSION_PROVIDER:
        if (this._evaluationExpressionProviders.has(payload.data)) {
          return;
        }
        this._evaluationExpressionProviders.add(payload.data);
        break;
      case ActionTypes.REMOVE_EVALUATION_EXPRESSION_PROVIDER:
        if (!this._evaluationExpressionProviders.has(payload.data)) {
          return;
        }
        this._evaluationExpressionProviders.delete(payload.data);
        break;
      case ActionTypes.ADD_REGISTER_EXECUTOR:
        invariant(this._registerExecutor == null);
        this._registerExecutor = payload.data;
        break;
      case ActionTypes.REMOVE_REGISTER_EXECUTOR:
        invariant(this._registerExecutor === payload.data);
        this._registerExecutor = null;
        break;
      case ActionTypes.REGISTER_CONSOLE:
        if (this._registerExecutor != null) {
          this._consoleDisposable = this._registerExecutor();
        }
        break;
      case ActionTypes.UNREGISTER_CONSOLE:
        if (this._consoleDisposable != null) {
          this._consoleDisposable.dispose();
          this._consoleDisposable = null;
        }
        break;
      case ActionTypes.UPDATE_CUSTOM_CONTROL_BUTTONS:
        this._customControlButtons = payload.data;
        break;
      case ActionTypes.UPDATE_CONFIGURE_SOURCE_PATHS_CALLBACK:
        this._setSourcePathCallback = payload.data;
        break;
      case ActionTypes.CONFIGURE_SOURCE_PATHS:
        if (this._setSourcePathCallback != null) {
          this._setSourcePathCallback();
        }
        break;
      case ActionTypes.SET_DEBUG_PROCESS_INFO:
        if (this._debugProcessInfo != null) {
          this._debugProcessInfo.dispose();
        }
        this._debugProcessInfo = payload.data;
        break;
      case ActionTypes.ADD_BREAKPOINT:
        this._addBreakpoint(payload.data.path, payload.data.line);
        break;
      case ActionTypes.UPDATE_BREAKPOINT_CONDITION:
        this._updateBreakpointCondition(
          payload.data.breakpointId,
          payload.data.condition,
        );
        break;
      case ActionTypes.UPDATE_BREAKPOINT_ENABLED:
        this._updateBreakpointEnabled(
          payload.data.breakpointId,
          payload.data.enabled,
        );
        break;
      case ActionTypes.DELETE_BREAKPOINT:
        this._deleteBreakpoint(payload.data.path, payload.data.line);
        break;
      case ActionTypes.DELETE_ALL_BREAKPOINTS:
        this._deleteAllBreakpoints();
        break;
      case ActionTypes.ENABLE_ALL_BREAKPOINTS:
        this._enableAllBreakpoints();
        break;
      case ActionTypes.DISABLE_ALL_BREAKPOINTS:
        this._disableAllBreakpoints();
        break;
      case ActionTypes.TOGGLE_BREAKPOINT:
        this._toggleBreakpoint(payload.data.path, payload.data.line);
        break;
      case ActionTypes.DELETE_BREAKPOINT_IPC:
        this._deleteBreakpoint(payload.data.path, payload.data.line, false);
        break;
      case ActionTypes.UPDATE_BREAKPOINT_HITCOUNT:
        this._updateBreakpointHitcount(
          payload.data.path,
          payload.data.line,
          payload.data.hitCount,
        );
        break;
      case ActionTypes.BIND_BREAKPOINT_IPC:
        this._bindBreakpoint(
          payload.data.path,
          payload.data.line,
          payload.data.condition,
          payload.data.enabled,
          payload.data.resolved,
        );
        break;
      default:
        return;
    }
    this._emitter.emit(DEBUGGER_CHANGE_EVENT);
  }

  _updateCallstack(callstack: Callstack): void {
    this._selectedCallFrameIndex = 0;
    this._callstack = callstack;
    this._emitter.emit(CALLSTACK_CHANGE_EVENT);
  }

  _updateSelectedCallFrameIndex(index: number): void {
    this._selectedCallFrameIndex = index;
    this._emitter.emit(CALLSTACK_CHANGE_EVENT);
  }

  _openSourceLocation(sourceURL: string, lineNumber: number): void {
    try {
      const path = nuclideUri.uriToNuclideUri(sourceURL);
      if (path != null && atom.workspace != null) {
        // only handle real files for now.
        // This should be goToLocation instead but since the searchAllPanes option is correctly
        // provided it's not urgent.
        this._openPathInEditor(path).then(editor => {
          this._nagivateToLocation(editor, lineNumber);
        });
      }
    } catch (e) {}
  }

  _openPathInEditor(path: string): Promise<atom$TextEditor> {
    // eslint-disable-next-line rulesdir/atom-apis
    return atom.workspace.open(path, {
      searchAllPanes: true,
      pending: true,
    });
  }

  _nagivateToLocation(editor: atom$TextEditor, line: number): void {
    editor.scrollToBufferPosition([line, 0]);
    editor.setCursorBufferPosition([line, 0]);
  }

  _handleClearInterface(): void {
    this._selectedCallFrameIndex = 0;
    this._setSelectedCallFrameLine(null);
    this._updateCallstack([]);

    this._threadMap.clear();
    this._cleanUpDatatip();
    this._clearScopesInterface();
    this._clearEvaluationValues();
  }

  _setSelectedCallFrameLine(options: ?{sourceURL: string, lineNumber: number}) {
    if (options) {
      const path = nuclideUri.uriToNuclideUri(options.sourceURL);
      const {lineNumber} = options;
      if (path != null && atom.workspace != null) {
        // only handle real files for now
        // This should be goToLocation instead but since the searchAllPanes option is correctly
        // provided it's not urgent.
        this._openPathInEditor(path).then(editor => {
          this._clearSelectedCallFrameMarker();
          this._highlightCallFrameLine(editor, lineNumber);
          this._nagivateToLocation(editor, lineNumber);
        });
      }
    } else {
      this._clearSelectedCallFrameMarker();
    }
  }

  _highlightCallFrameLine(editor: atom$TextEditor, line: number) {
    const marker = editor.markBufferRange([[line, 0], [line, Infinity]], {
      invalidate: 'never',
    });
    editor.decorateMarker(marker, {
      type: 'line',
      class: 'nuclide-current-line-highlight',
    });
    this._selectedCallFrameMarker = marker;
  }

  _clearSelectedCallFrameMarker() {
    if (this._selectedCallFrameMarker) {
      this._selectedCallFrameMarker.destroy();
      this._selectedCallFrameMarker = null;
    }
  }

  onCallstackChange(callback: () => void): IDisposable {
    return this._emitter.on(CALLSTACK_CHANGE_EVENT, callback);
  }

  getCallstack(): ?Callstack {
    return this._callstack;
  }

  getSelectedCallFrameIndex(): number {
    return this._selectedCallFrameIndex;
  }

  setDatatipService(service: DatatipService) {
    this._datatipService = service;
  }

  _updateThreads(threadData: NuclideThreadData): void {
    this._threadMap.clear();
    this._owningProcessId = threadData.owningProcessId;
    if (
      !Number.isNaN(threadData.stopThreadId) &&
      threadData.stopThreadId >= 0
    ) {
      this._stopThreadId = threadData.stopThreadId;
      this._selectedThreadId = threadData.stopThreadId;
    }

    this._threadsReloading = false;
    threadData.threads.forEach(thread =>
      this._threadMap.set(Number(thread.id), thread),
    );
  }

  _updateThread(thread: ThreadItem): void {
    // TODO(jonaldislarry): add deleteThread API so that this stop reason checking is not needed.
    if (
      thread.stopReason === 'end' ||
      thread.stopReason === 'error' ||
      thread.stopReason === 'stopped'
    ) {
      this._threadMap.delete(Number(thread.id));
    } else {
      this._threadMap.set(Number(thread.id), thread);
    }
  }

  _updateStopThread(id: number) {
    this._stopThreadId = Number(id);
    this._selectedThreadId = Number(id);
  }

  _updateSelectedThread(id: number) {
    this._selectedThreadId = Number(id);
  }

  _cleanUpDatatip(): void {
    if (this._threadChangeDatatip) {
      if (this._datatipService != null) {
        this._threadChangeDatatip.dispose();
      }
      this._threadChangeDatatip = null;
    }
  }

  // TODO(dbonafilia): refactor this code along with the ui code in callstackStore to a ui controller.
  async _notifyThreadSwitch(
    sourceURL: string,
    lineNumber: number,
    message: string,
  ): Promise<void> {
    const path = nuclideUri.uriToNuclideUri(sourceURL);
    // we want to put the message one line above the current line unless the selected
    // line is the top line, in which case we will put the datatip next to the line.
    const notificationLineNumber = lineNumber === 0 ? 0 : lineNumber - 1;
    // only handle real files for now
    const datatipService = this._datatipService;
    if (datatipService != null && path != null && atom.workspace != null) {
      // This should be goToLocation instead but since the searchAllPanes option is correctly
      // provided it's not urgent.
      // eslint-disable-next-line rulesdir/atom-apis
      atom.workspace.open(path, {searchAllPanes: true}).then(editor => {
        const buffer = editor.getBuffer();
        const rowRange = buffer.rangeForRow(notificationLineNumber);
        this._threadChangeDatatip = datatipService.createPinnedDataTip(
          {
            component: this._createAlertComponentClass(message),
            range: rowRange,
            pinnable: true,
          },
          editor,
        );
      });
    }
  }

  getThreadList(): Array<ThreadItem> {
    return Array.from(this._threadMap.values());
  }

  getSelectedThreadId(): number {
    return this._selectedThreadId;
  }

  getThreadsReloading(): boolean {
    return this._threadsReloading;
  }

  getStopThread(): ?number {
    return this._stopThreadId;
  }

  onThreadsChanged(callback: () => void): IDisposable {
    return this._emitter.on(THREADS_CHANGED_EVENT, callback);
  }

  _createAlertComponentClass(message: string): React.ComponentType<any> {
    return () => (
      <div className="nuclide-debugger-thread-switch-alert">
        <Icon icon="alert" />
        {message}
      </div>
    );
  }

  /**
   * Subscribe to new connection updates from DebuggerActions.
   */
  onConnectionsUpdated(callback: () => void): IDisposable {
    return this._emitter.on(CONNECTIONS_UPDATED_EVENT, callback);
  }

  onProvidersUpdated(callback: () => void): IDisposable {
    return this._emitter.on(PROVIDERS_UPDATED_EVENT, callback);
  }

  getConnections(): Array<string> {
    return this._connections;
  }

  /**
   * Return available launch/attach provider for input connection.
   * Caller is responsible for disposing the results.
   */
  getLaunchAttachProvidersForConnection(
    connection: string,
  ): Array<DebuggerLaunchAttachProvider> {
    const availableLaunchAttachProviders = [];
    for (const provider of this._debuggerProviders) {
      const launchAttachProvider = provider.getLaunchAttachProvider(connection);
      if (launchAttachProvider != null) {
        availableLaunchAttachProviders.push(launchAttachProvider);
      }
    }
    return availableLaunchAttachProviders;
  }

  _clearScopesInterface(): void {
    this._expandedScopes.clear();
    this.getScopesNow().forEach(scope => {
      this._expandedScopes.set(scope.name, scope.expanded);
    });
    this._scopes.next(new Map());
  }

  _handleUpdateScopesAsPayload(
    scopeSectionsPayload: Array<ScopeSectionPayload>,
  ): void {
    this._handleUpdateScopes(
      new Map(
        scopeSectionsPayload
          .map(this._convertScopeSectionPayloadToScopeSection)
          .map(section => [section.name, section]),
      ),
    );
  }

  _convertScopeSectionPayloadToScopeSection = (
    scopeSectionPayload: ScopeSectionPayload,
  ): ScopeSection => {
    const expandedState = this._expandedScopes.get(scopeSectionPayload.name);
    return {
      ...scopeSectionPayload,
      scopeVariables: [],
      loaded: false,
      expanded:
        expandedState != null
          ? expandedState
          : isLocalScopeName(scopeSectionPayload.name),
    };
  };

  _handleUpdateScopes(scopeSections: ScopesMap): void {
    this._scopes.next(scopeSections);
    scopeSections.forEach(scopeSection => {
      const {expanded, loaded, name} = scopeSection;
      if (expanded && !loaded) {
        this._loadScopeVariablesFor(name);
      }
    });
  }

  async _loadScopeVariablesFor(scopeName: string): Promise<void> {
    const scopes = this.getScopesNow();
    const selectedScope = nullthrows(scopes.get(scopeName));
    const expressionEvaluationManager = nullthrows(
      this._bridge.getCommandDispatcher().getBridgeAdapter(),
    ).getExpressionEvaluationManager();
    selectedScope.scopeVariables = await expressionEvaluationManager.getScopeVariablesFor(
      nullthrows(
        expressionEvaluationManager
          .getRemoteObjectManager()
          .getRemoteObjectFromId(selectedScope.scopeObjectId),
      ),
    );
    selectedScope.loaded = true;
    this._handleUpdateScopes(scopes);
  }

  getScopes(): Observable<ScopesMap> {
    return this._scopes.asObservable();
  }

  getScopesNow(): ScopesMap {
    return this._scopes.getValue();
  }

  setExpanded(scopeName: string, expanded: boolean) {
    const scopes = this.getScopesNow();
    const selectedScope = nullthrows(scopes.get(scopeName));
    selectedScope.expanded = expanded;
    if (expanded) {
      selectedScope.loaded = false;
    }
    this._handleUpdateScopes(scopes);
  }

  // Returns a promise of the updated value after it has been set.
  async sendSetVariableRequest(
    scopeObjectId: RemoteObjectId,
    scopeName: string,
    expression: string,
    newValue: string,
  ): Promise<string> {
    const debuggerInstance = this.getDebuggerInstance();
    if (debuggerInstance == null) {
      const errorMsg = 'setVariable failed because debuggerInstance is null';
      reportError(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
    track(AnalyticsEvents.DEBUGGER_EDIT_VARIABLE, {
      language: debuggerInstance.getProviderName(),
    });
    return new Promise((resolve, reject) => {
      function callback(error: Error, response: SetVariableResponse) {
        if (error != null) {
          const message = JSON.stringify(error);
          reportError(`setVariable failed with ${message}`);
          atom.notifications.addError(message);
          reject(error);
        } else {
          resolve(response.value);
        }
      }
      this._bridge.sendSetVariableCommand(
        Number(scopeObjectId),
        expression,
        newValue,
        callback,
      );
    }).then(confirmedNewValue => {
      this._setVariable(scopeName, expression, confirmedNewValue);
      return confirmedNewValue;
    });
  }

  _setVariable = (
    scopeName: string,
    expression: string,
    confirmedNewValue: string,
  ): void => {
    const scopes = this._scopes.getValue();
    const selectedScope = nullthrows(scopes.get(scopeName));
    const variableToChangeIndex = selectedScope.scopeVariables.findIndex(
      v => v.name === expression,
    );
    const variableToChange = nullthrows(
      selectedScope.scopeVariables[variableToChangeIndex],
    );
    const newVariable = {
      ...variableToChange,
      value: {
        ...variableToChange.value,
        value: confirmedNewValue,
        description: confirmedNewValue,
      },
    };
    selectedScope.scopeVariables.splice(variableToChangeIndex, 1, newVariable);
    this._handleUpdateScopes(scopes);
  };

  triggerReevaluation(): void {
    this._cancelRequestsToBridge();
    for (const [expression, subject] of this._watchExpressions) {
      if (subject.observers == null || subject.observers.length === 0) {
        // Nobody is watching this expression anymore.
        this._watchExpressions.delete(expression);
        continue;
      }
      this._requestExpressionEvaluation(
        expression,
        subject,
        false /* no REPL support */,
      );
    }
  }

  _cancelRequestsToBridge(): void {
    this._previousEvaluationSubscriptions.dispose();
    this._previousEvaluationSubscriptions = new UniversalDisposable();
  }

  // Resets all values to N/A, for examples when the debugger resumes or stops.
  _clearEvaluationValues(): void {
    for (const subject of this._watchExpressions.values()) {
      subject.next(null);
    }
  }

  /**
   * Returns an observable of child properties for the given objectId.
   * Resources are automatically cleaned up once all subscribers of an expression have unsubscribed.
   */
  getProperties(objectId: string): Observable<?ExpansionResult> {
    const getPropertiesPromise: Promise<?ExpansionResult> = this._sendEvaluationCommand(
      'getProperties',
      objectId,
    );
    return Observable.fromPromise(getPropertiesPromise);
  }

  evaluateConsoleExpression(
    expression: Expression,
  ): Observable<?EvaluationResult> {
    return this._evaluateExpression(expression, true /* support REPL */);
  }

  evaluateWatchExpression(
    expression: Expression,
  ): Observable<?EvaluationResult> {
    return this._evaluateExpression(
      expression,
      false /* do not support REPL */,
    );
  }

  /**
   * Returns an observable of evaluation results for a given expression.
   * Resources are automatically cleaned up once all subscribers of an expression have unsubscribed.
   *
   * The supportRepl boolean indicates if we allow evaluation in a non-paused state.
   */
  _evaluateExpression(
    expression: Expression,
    supportRepl: boolean,
  ): Observable<?EvaluationResult> {
    if (!supportRepl && this._watchExpressions.has(expression)) {
      const cachedResult = this._watchExpressions.get(expression);
      return nullthrows(cachedResult);
    }
    const subject = new BehaviorSubject(null);
    this._requestExpressionEvaluation(expression, subject, supportRepl);
    if (!supportRepl) {
      this._watchExpressions.set(expression, subject);
    }
    // Expose an observable rather than the raw subject.
    return subject.asObservable();
  }

  _requestExpressionEvaluation(
    expression: Expression,
    subject: BehaviorSubject<?EvaluationResult>,
    supportRepl: boolean,
  ): void {
    let evaluationPromise;
    if (supportRepl) {
      evaluationPromise =
        this._debuggerMode === DebuggerMode.PAUSED
          ? this._evaluateOnSelectedCallFrame(expression, 'console')
          : this._runtimeEvaluate(expression);
    } else {
      evaluationPromise = this._evaluateOnSelectedCallFrame(
        expression,
        'watch-group',
      );
    }

    const evaluationDisposable = new UniversalDisposable(
      Observable.fromPromise(evaluationPromise)
        .merge(Observable.never()) // So that we do not unsubscribe `subject` when disposed.
        .subscribe(subject),
    );

    // Non-REPL environments will want to record these requests so they can be canceled on
    // re-evaluation, e.g. in the case of stepping.  REPL environments should let them complete so
    // we can have e.g. a history of evaluations in the console.
    if (!supportRepl) {
      this._previousEvaluationSubscriptions.add(evaluationDisposable);
    } else {
      this._disposables.add(evaluationDisposable);
    }
  }

  async _evaluateOnSelectedCallFrame(
    expression: string,
    objectGroup: ObjectGroup,
  ): Promise<EvaluationResult> {
    const result: ?EvaluationResult = await this._sendEvaluationCommand(
      'evaluateOnSelectedCallFrame',
      expression,
      objectGroup,
    );
    if (result == null) {
      // Backend returned neither a result nor an error message
      return {
        type: 'text',
        value: `Failed to evaluate: ${expression}`,
      };
    } else {
      return result;
    }
  }

  async _runtimeEvaluate(expression: string): Promise<?EvaluationResult> {
    const result: ?EvaluationResult = await this._sendEvaluationCommand(
      'runtimeEvaluate',
      expression,
    );
    if (result == null) {
      // Backend returned neither a result nor an error message
      return {
        type: 'text',
        value: `Failed to evaluate: ${expression}`,
      };
    } else {
      return result;
    }
  }

  async _sendEvaluationCommand(
    command: EvalCommand,
    ...args: Array<mixed>
  ): Promise<any> {
    const deferred = new Deferred();
    const evalId = this._evaluationId;
    ++this._evaluationId;
    this._evaluationRequestsInFlight.set(evalId, deferred);
    this._bridge.sendEvaluationCommand(command, evalId, ...args);
    let result = null;
    try {
      result = await deferred.promise;
    } catch (e) {
      getLogger('nuclide-debugger').warn(
        `${command}: Error getting result.`,
        e,
      );
    }
    this._evaluationRequestsInFlight.delete(evalId);
    return result;
  }

  _handleResponseForPendingRequest(
    id: number,
    response: ChromeProtocolResponse,
  ): void {
    const {result, error} = response;
    const deferred = this._evaluationRequestsInFlight.get(id);
    if (deferred == null) {
      // Nobody is listening for the result of this expression.
      return;
    }
    if (error != null) {
      deferred.reject(error);
    } else {
      deferred.resolve(result);
    }
  }

  _deserializeWatchExpressions(watchExpressions: ?Array<Expression>): void {
    if (watchExpressions != null) {
      this._watchExpressionsList.next(
        watchExpressions.map(expression =>
          this._getExpressionEvaluationFor(expression),
        ),
      );
    }
  }

  _getExpressionEvaluationFor(expression: Expression): EvaluatedExpression {
    return {
      expression,
      value: this.evaluateWatchExpression(expression),
    };
  }

  getWatchExpressions(): Observable<EvaluatedExpressionList> {
    return this._watchExpressionsList.asObservable();
  }

  getSerializedWatchExpressions(): Array<Expression> {
    return this._watchExpressionsList
      .getValue()
      .map(evaluatedExpression => evaluatedExpression.expression);
  }

  _addWatchExpression(expression: Expression): void {
    if (expression === '') {
      return;
    }
    this._watchExpressionsList.next([
      ...this._watchExpressionsList.getValue(),
      this._getExpressionEvaluationFor(expression),
    ]);
  }

  _removeWatchExpression(index: number): void {
    const watchExpressions = this._watchExpressionsList.getValue().slice();
    watchExpressions.splice(index, 1);
    this._watchExpressionsList.next(watchExpressions);
  }

  _updateWatchExpression(index: number, newExpression: Expression): void {
    if (newExpression === '') {
      return this._removeWatchExpression(index);
    }
    const watchExpressions = this._watchExpressionsList.getValue().slice();
    watchExpressions[index] = this._getExpressionEvaluationFor(newExpression);
    this._watchExpressionsList.next(watchExpressions);
  }

  _refetchWatchSubscriptions(): void {
    const watchExpressions = this._watchExpressionsList.getValue().slice();
    const refetchedWatchExpressions = watchExpressions.map(({expression}) => {
      return this._getExpressionEvaluationFor(expression);
    });
    this._watchExpressionsList.next(refetchedWatchExpressions);
  }

  loaderBreakpointResumed(): void {
    this._onLoaderBreakpointResume(); // Resolves onLoaderBreakpointResumePromise.
  }

  getCustomControlButtons(): Array<ControlButtonSpecification> {
    return this._customControlButtons;
  }

  getDebuggerInstance(): ?DebuggerInstanceInterface {
    return this._debuggerInstance;
  }

  getError(): ?string {
    return this._error;
  }

  getDebuggerMode(): DebuggerModeType {
    return this._debuggerMode;
  }

  isDebugging(): boolean {
    return (
      this._debuggerMode !== DebuggerMode.STOPPED &&
      this._debuggerMode !== DebuggerMode.STOPPING
    );
  }

  getTogglePauseOnException(): boolean {
    return this._togglePauseOnException;
  }

  getTogglePauseOnCaughtException(): boolean {
    return this._togglePauseOnCaughtException;
  }

  getIsReadonlyTarget(): boolean {
    return (
      this._debugProcessInfo != null &&
      this._debugProcessInfo.getDebuggerCapabilities().readOnlyTarget
    );
  }

  getSettings(): DebuggerSettings {
    return this._debuggerSettings;
  }

  getEvaluationExpressionProviders(): Set<NuclideEvaluationExpressionProvider> {
    return this._evaluationExpressionProviders;
  }

  getCanSetSourcePaths(): boolean {
    return this._setSourcePathCallback != null;
  }

  getCanRestartDebugger(): boolean {
    return this._debugProcessInfo != null;
  }

  getDebugProcessInfo(): ?DebuggerProcessInfo {
    return this._debugProcessInfo;
  }

  onChange(callback: () => void): IDisposable {
    return this._emitter.on(DEBUGGER_CHANGE_EVENT, callback);
  }

  onDebuggerModeChange(callback: () => void): IDisposable {
    return this._emitter.on(DEBUGGER_MODE_CHANGE_EVENT, callback);
  }

  setShowDisassembly(enable: boolean): void {
    this._enableShowDisassembly = enable;
    if (this.isDebugging()) {
      this.getBridge().setShowDisassembly(enable);
    }
  }

  getShowDisassembly(): boolean {
    return (
      this._debugProcessInfo != null &&
      this._debugProcessInfo.getDebuggerCapabilities().disassembly &&
      this._enableShowDisassembly
    );
  }

  supportsSetVariable(): boolean {
    const currentDebugInfo = this.getDebugProcessInfo();
    return currentDebugInfo
      ? currentDebugInfo.getDebuggerCapabilities().setVariable
      : false;
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
        this._disposables.add(pendingNotification);
      }
    }
  }

  _addBreakpoint(
    path: string,
    line: number,
    condition: string = '',
    resolved: boolean = false,
    userAction: boolean = true,
    enabled: boolean = true,
  ): void {
    this._breakpointIdSeed++;
    const breakpoint = {
      id: this._breakpointIdSeed,
      path,
      line,
      condition,
      enabled,
      resolved,
    };
    this._idToBreakpointMap.set(breakpoint.id, breakpoint);
    if (!this._breakpoints.has(path)) {
      this._breakpoints.set(path, new Map());
    }
    const lineMap = this._breakpoints.get(path);
    invariant(lineMap != null);
    lineMap.set(line, breakpoint);
    this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, path);
    if (userAction) {
      this._emitter.emit(BREAKPOINT_USER_CHANGED, {
        action: ADD_BREAKPOINT_ACTION,
        breakpoint,
      });
    }
  }

  _updateBreakpointHitcount(
    path: string,
    line: number,
    hitCount: number,
  ): void {
    const breakpoint = this.getBreakpointAtLine(path, line);
    if (breakpoint == null) {
      return;
    }
    breakpoint.hitCount = hitCount;
    this._updateBreakpoint(breakpoint);
  }

  _updateBreakpointEnabled(breakpointId: number, enabled: boolean): void {
    const breakpoint = this._idToBreakpointMap.get(breakpointId);
    if (breakpoint == null) {
      return;
    }
    breakpoint.enabled = enabled;
    if (!enabled) {
      // For VSCode backends, disabling a breakpoint removes it from the backend
      // even though the front-end remembers it. If this bp had a hit count
      // being maintained by the backend, it will be reset to 0 so remove it
      // from the UX as well.
      delete breakpoint.hitCount;
    }
    this._updateBreakpoint(breakpoint);
  }

  _updateBreakpointCondition(breakpointId: number, condition: string): void {
    const breakpoint = this._idToBreakpointMap.get(breakpointId);
    if (breakpoint == null) {
      return;
    }
    breakpoint.condition = condition;
    this._updateBreakpoint(breakpoint);
  }

  _updateBreakpoint(breakpoint: FileLineBreakpoint): void {
    this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, breakpoint.path);
    this._emitter.emit(BREAKPOINT_USER_CHANGED, {
      action: 'UpdateBreakpoint',
      breakpoint,
    });
  }

  _forEachBreakpoint(
    callback: (path: string, line: number, breakpointId: number) => void,
  ) {
    for (const path of this._breakpoints.keys()) {
      const lineMap = this._breakpoints.get(path);
      invariant(lineMap != null);
      for (const line of lineMap.keys()) {
        const bp = lineMap.get(line);
        invariant(bp != null);
        callback(path, line, bp.id);
      }
    }
  }

  _deleteAllBreakpoints(): void {
    this._forEachBreakpoint((path, line, breakpointId) =>
      this._deleteBreakpoint(path, line),
    );
  }

  _enableAllBreakpoints(): void {
    this._forEachBreakpoint((path, line, breakpointId) =>
      this._updateBreakpointEnabled(breakpointId, true),
    );
  }

  _disableAllBreakpoints(): void {
    this._forEachBreakpoint((path, line, breakpointId) =>
      this._updateBreakpointEnabled(breakpointId, false),
    );
  }

  _deleteBreakpoint(
    path: string,
    line: number,
    userAction: boolean = true,
  ): void {
    const lineMap = this._breakpoints.get(path);
    if (lineMap == null) {
      return;
    }
    const breakpoint = lineMap.get(line);
    if (lineMap.delete(line)) {
      invariant(breakpoint);
      this._idToBreakpointMap.delete(breakpoint.id);
      this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, path);
      if (userAction) {
        this._emitter.emit(BREAKPOINT_USER_CHANGED, {
          action: DELETE_BREAKPOINT_ACTION,
          breakpoint,
        });
      }
    }
  }

  _toggleBreakpoint(path: string, line: number): void {
    if (!this._breakpoints.has(path)) {
      this._breakpoints.set(path, new Map());
    }
    const lineMap = this._breakpoints.get(path);
    invariant(lineMap != null);
    if (lineMap.has(line)) {
      this._deleteBreakpoint(path, line);
    } else {
      this._addBreakpoint(path, line, '');
    }
  }

  _bindBreakpoint(
    path: string,
    line: number,
    condition: string,
    enabled: boolean,
    resolved: boolean,
  ): void {
    // The Chrome devtools always bind a new breakpoint as enabled the first time. If this
    // breakpoint is known to be disabled in the front-end, sync the enabled state with Chrome.
    const existingBp = this.getBreakpointAtLine(path, line);
    const updateEnabled = existingBp != null && existingBp.enabled !== enabled;

    this._addBreakpoint(
      path,
      line,
      condition,
      resolved,
      false, // userAction
      enabled,
    );

    if (updateEnabled) {
      const updatedBp = this.getBreakpointAtLine(path, line);
      if (updatedBp != null) {
        updatedBp.enabled = !enabled;
        this._updateBreakpoint(updatedBp);
      }
    }

    const currentInfo = this.getDebugProcessInfo();
    if (
      condition !== '' &&
      currentInfo != null &&
      !currentInfo.getDebuggerCapabilities().conditionalBreakpoints
    ) {
      // If the current debugger does not support conditional breakpoints, and the bp that
      // was just bound has a condition on it, warn the user that the condition isn't going
      // to be honored.
      atom.notifications.addWarning(
        'The current debugger does not support conditional breakpoints. The breakpoint at this location will hit without ' +
          'evaluating the specified condition expression:\n' +
          `${nuclideUri.basename(path)}:${line}`,
      );
      const updatedBp = this.getBreakpointAtLine(path, line);
      if (updatedBp != null) {
        this._updateBreakpointCondition(updatedBp.id, '');
      }
    }
  }

  _handleDebuggerModeChange(newMode: DebuggerModeType): void {
    if (newMode === DebuggerMode.STOPPED) {
      // All breakpoints should be unresolved after stop debugging.
      this._resetBreakpoints();
    } else {
      for (const breakpoint of this.getAllBreakpoints()) {
        if (!breakpoint.resolved) {
          this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, breakpoint.path);
        }
      }
    }
  }

  _resetBreakpoints(): void {
    for (const breakpoint of this.getAllBreakpoints()) {
      breakpoint.resolved = false;
      breakpoint.hitCount = undefined;
      this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, breakpoint.path);
    }
  }

  getBreakpointsForPath(path: string): LineToBreakpointMap {
    if (!this._breakpoints.has(path)) {
      this._breakpoints.set(path, new Map());
    }
    const ret = this._breakpoints.get(path);
    invariant(ret);
    return ret;
  }

  getBreakpointLinesForPath(path: string): Set<number> {
    const lineMap = this._breakpoints.get(path);
    return lineMap != null ? new Set(lineMap.keys()) : new Set();
  }

  getBreakpointAtLine(path: string, line: number): ?FileLineBreakpoint {
    const lineMap = this._breakpoints.get(path);
    if (lineMap == null) {
      return null;
    }
    return lineMap.get(line);
  }

  getAllBreakpoints(): FileLineBreakpoints {
    const breakpoints: FileLineBreakpoints = [];
    for (const [, lineMap] of this._breakpoints) {
      for (const breakpoint of lineMap.values()) {
        breakpoints.push(breakpoint);
      }
    }
    return breakpoints;
  }

  getSerializedBreakpoints(): Array<SerializedBreakpoint> {
    const breakpoints = [];
    for (const [path, lineMap] of this._breakpoints) {
      for (const line of lineMap.keys()) {
        const breakpoint = lineMap.get(line);
        if (breakpoint == null) {
          continue;
        }

        breakpoints.push({
          line,
          sourceURL: path,
          disabled: !breakpoint.enabled,
          condition: breakpoint.condition,
        });
      }
    }
    return breakpoints;
  }

  breakpointSupportsConditions(breakpoint: FileLineBreakpoint): boolean {
    // If currently debugging, return whether or not the current debugger supports this.
    if (this.getDebuggerMode() !== DebuggerMode.STOPPED) {
      const currentDebugInfo = this.getDebugProcessInfo();
      if (currentDebugInfo != null) {
        return currentDebugInfo.getDebuggerCapabilities()
          .conditionalBreakpoints;
      }
    }

    // If not currently debugging, return if any of the debuggers that support
    // the file extension this bp is in support conditions.
    // TODO: have providers register their file extensions and filter correctly here.
    return true;
  }

  _deserializeBreakpoints(breakpoints: ?Array<SerializedBreakpoint>): void {
    if (breakpoints == null) {
      return;
    }
    for (const breakpoint of breakpoints) {
      const {line, sourceURL, disabled, condition} = breakpoint;
      this._addBreakpoint(
        sourceURL,
        line,
        condition || '',
        false, // resolved
        false, // user action
        !disabled, // enabled
      );
    }
  }

  /**
   * Register a change handler that is invoked when the breakpoints UI
   * needs to be updated for a file.
   */
  onNeedUIUpdate(callback: (path: string) => void): IDisposable {
    return this._emitter.on(BREAKPOINT_NEED_UI_UPDATE, callback);
  }

  /**
   * Register a change handler that is invoked when a breakpoint is changed
   * by user action, like user explicitly added, deleted a breakpoint.
   */
  onUserChange(
    callback: (params: BreakpointUserChangeArgType) => void,
  ): IDisposable {
    return this._emitter.on(BREAKPOINT_USER_CHANGED, callback);
  }
}
