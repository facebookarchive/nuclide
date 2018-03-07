'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WORKSPACE_VIEW_URI = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _react = _interopRequireWildcard(require('react'));

var _BreakpointManager;

function _load_BreakpointManager() {
  return _BreakpointManager = _interopRequireDefault(require('./BreakpointManager'));
}

var _DebuggerActions;

function _load_DebuggerActions() {
  return _DebuggerActions = _interopRequireDefault(require('./DebuggerActions'));
}

var _Bridge;

function _load_Bridge() {
  return _Bridge = _interopRequireDefault(require('./Bridge'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = _interopRequireDefault(require('./DebuggerDispatcher'));
}

var _DebuggerDispatcher2;

function _load_DebuggerDispatcher2() {
  return _DebuggerDispatcher2 = require('./DebuggerDispatcher');
}

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('nuclide-commons/debounce'));
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _EventReporter;

function _load_EventReporter() {
  return _EventReporter = require('./Protocol/EventReporter');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _normalizeRemoteObjectValue;

function _load_normalizeRemoteObjectValue() {
  return _normalizeRemoteObjectValue = require('./normalizeRemoteObjectValue');
}

var _AtomServiceContainer;

function _load_AtomServiceContainer() {
  return _AtomServiceContainer = require('./AtomServiceContainer');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/debugger'; /**
                                                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                                                    * All rights reserved.
                                                                                    *
                                                                                    * This source code is licensed under the license found in the LICENSE file in
                                                                                    * the root directory of this source tree.
                                                                                    *
                                                                                    * 
                                                                                    * @format
                                                                                    */

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

/**
 * Atom ViewProvider compatible model object.
 */
class DebuggerModel {

  // Watch expressions


  // Debugger providers


  // Scopes


  // Threads state
  constructor(state) {
    this._convertScopeSectionPayloadToScopeSection = scopeSectionPayload => {
      const expandedState = this._expandedScopes.get(scopeSectionPayload.name);
      return Object.assign({}, scopeSectionPayload, {
        scopeVariables: [],
        loaded: false,
        expanded: expandedState != null ? expandedState : (0, (_utils || _load_utils()).isLocalScopeName)(scopeSectionPayload.name)
      });
    };

    this._setVariable = (scopeName, expression, confirmedNewValue) => {
      const scopes = this._scopes.getValue();
      const selectedScope = (0, (_nullthrows || _load_nullthrows()).default)(scopes.get(scopeName));
      const variableToChangeIndex = selectedScope.scopeVariables.findIndex(v => v.name === expression);
      const variableToChange = (0, (_nullthrows || _load_nullthrows()).default)(selectedScope.scopeVariables[variableToChangeIndex]);
      const newVariable = Object.assign({}, variableToChange, {
        value: Object.assign({}, variableToChange.value, {
          value: confirmedNewValue,
          description: confirmedNewValue
        })
      });
      selectedScope.scopeVariables.splice(variableToChangeIndex, 1, newVariable);
      this._handleUpdateScopes(scopes);
    };

    this._dispatcher = new (_DebuggerDispatcher || _load_DebuggerDispatcher()).default();
    this._debuggerSettings = {
      supportThreadsWindow: false,
      threadsComponentTitle: 'Threads'
    };
    this._debuggerInstance = null;
    this._error = null;
    this._evaluationExpressionProviders = new Set();
    this._togglePauseOnException = state != null ? state.pauseOnException : true;
    this._togglePauseOnCaughtException = state != null ? state.pauseOnCaughtException : false;
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
    this._emitter = new _atom.Emitter();
    this._datatipService = null;
    this._threadMap = new Map();
    this._owningProcessId = 0;
    this._selectedThreadId = 0;
    this._stopThreadId = 0;
    this._threadsReloading = false;
    this._debuggerMode = (_constants || _load_constants()).DebuggerMode.STOPPED;
    this._debuggerProviders = new Set();
    // There is always a local connection.
    this._connections = ['local'];
    this._scopes = new _rxjsBundlesRxMinJs.BehaviorSubject(new Map());
    this._expandedScopes = new Map();
    this._evaluationId = 0;
    this._watchExpressions = new Map();
    this._evaluationRequestsInFlight = new Map();
    // `this._previousEvaluationSubscriptions` can change at any time and are a distinct subset of
    // `this._disposables`.
    this._previousEvaluationSubscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._watchExpressionsList = new _rxjsBundlesRxMinJs.BehaviorSubject([]);

    this._breakpointIdSeed = 0;
    this._breakpoints = new Map();
    this._idToBreakpointMap = new Map();

    // Debounce calls to _openPathInEditor to work around an Atom bug that causes
    // two editor windows to be opened if multiple calls to atom.workspace.open
    // are made close together, even if {searchAllPanes: true} is set.
    this._openPathInEditor = (0, (_debounce || _load_debounce()).default)(this._openPathInEditor, 100, true);
    this._actions = new (_DebuggerActions || _load_DebuggerActions()).default(this._dispatcher, this);
    this._breakpointManager = new (_BreakpointManager || _load_BreakpointManager()).default(this._actions, this);
    this._bridge = new (_Bridge || _load_Bridge()).default(this);
    const initialWatchExpressions = state != null ? state.watchExpressions : null;
    this._deserializeWatchExpressions(initialWatchExpressions);
    this._deserializeBreakpoints(state != null ? state.breakpoints : null);

    const dispatcherToken = this._dispatcher.register(this._handlePayload.bind(this));

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._actions, this._breakpointManager, this._bridge, () => {
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
    }, this._listenForProjectChange(), this._previousEvaluationSubscriptions);
  }

  // Breakpoints


  // CallStack state


  _listenForProjectChange() {
    return atom.project.onDidChangePaths(() => {
      this._actions.updateConnections();
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  getActions() {
    return this._actions;
  }

  getBridge() {
    return this._bridge;
  }

  getTitle() {
    return 'Debugger';
  }

  getDefaultLocation() {
    return 'right';
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getPreferredWidth() {
    return 500;
  }

  selectThread(threadId) {
    this._bridge.selectThread(threadId);
  }

  setSelectedCallFrameIndex(callFrameIndex) {
    this._bridge.setSelectedCallFrameIndex(callFrameIndex);
    this._actions.setSelectedCallFrameIndex(callFrameIndex);
  }

  _handlePayload(payload) {
    switch (payload.actionType) {
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.CLEAR_INTERFACE:
        this._handleClearInterface();
        this._emitter.emit(THREADS_CHANGED_EVENT);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.SET_SELECTED_CALLFRAME_LINE:
        // TODO: update _selectedCallFrameIndex.
        this._setSelectedCallFrameLine(payload.data.options);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.OPEN_SOURCE_LOCATION:
        this._openSourceLocation(payload.data.sourceURL, payload.data.lineNumber);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UPDATE_CALLSTACK:
        this._updateCallstack(payload.data.callstack);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.SET_SELECTED_CALLFRAME_INDEX:
        this._clearScopesInterface();
        this._updateSelectedCallFrameIndex(payload.data.index);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UPDATE_THREADS:
        this._threadsReloading = false;
        this._updateThreads(payload.data.threadData);
        this._emitter.emit(THREADS_CHANGED_EVENT);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UPDATE_THREAD:
        this._threadsReloading = false;
        this._updateThread(payload.data.thread);
        this._emitter.emit(THREADS_CHANGED_EVENT);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UPDATE_STOP_THREAD:
        this._updateStopThread(payload.data.id);
        this._emitter.emit(THREADS_CHANGED_EVENT);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UPDATE_SELECTED_THREAD:
        this._updateSelectedThread(payload.data.id);
        this._emitter.emit(THREADS_CHANGED_EVENT);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.NOTIFY_THREAD_SWITCH:
        this._notifyThreadSwitch(payload.data.sourceURL, payload.data.lineNumber, payload.data.message);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.DEBUGGER_MODE_CHANGE:
        if (this._debuggerMode === (_constants || _load_constants()).DebuggerMode.RUNNING && payload.data === (_constants || _load_constants()).DebuggerMode.PAUSED) {
          // If the debugger just transitioned from running to paused, the debug server should
          // be sending updated thread stacks. This may take a moment.
          this._threadsReloading = true;
        } else if (payload.data === (_constants || _load_constants()).DebuggerMode.RUNNING) {
          // The UI is never waiting for threads if it's running.
          this._threadsReloading = false;
        }

        if (payload.data === (_constants || _load_constants()).DebuggerMode.PAUSED) {
          this.triggerReevaluation();
          // Moving from non-pause to pause state.
          this._scheduleNativeNotification();
        } else if (payload.data === (_constants || _load_constants()).DebuggerMode.STOPPED) {
          this._cancelRequestsToBridge();
          this._handleClearInterface();
          this.loaderBreakpointResumePromise = new Promise(resolve => {
            this._onLoaderBreakpointResume = resolve;
          });
        } else if (payload.data === (_constants || _load_constants()).DebuggerMode.STARTING) {
          this._refetchWatchSubscriptions();
        }

        this._debuggerMode = payload.data;
        this._emitter.emit(DEBUGGER_MODE_CHANGE_EVENT);
        this._emitter.emit(THREADS_CHANGED_EVENT);

        // Breakpoint handling
        if (this._debuggerMode === (_constants || _load_constants()).DebuggerMode.STOPPED) {
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
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.SET_PROCESS_SOCKET:
        const { data } = payload;
        if (data == null) {
          this._bridge.leaveDebugMode();
        } else {
          this._bridge.enterDebugMode();
          this._bridge.setupChromeChannel();
          this._bridge.enableEventsListening();
        }
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.TRIGGER_DEBUGGER_ACTION:
        this._bridge.triggerAction(payload.data.actionId);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.ADD_DEBUGGER_PROVIDER:
        if (this._debuggerProviders.has(payload.data)) {
          return;
        }
        this._debuggerProviders.add(payload.data);
        this._emitter.emit(PROVIDERS_UPDATED_EVENT);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.REMOVE_DEBUGGER_PROVIDER:
        if (!this._debuggerProviders.has(payload.data)) {
          return;
        }
        this._debuggerProviders.delete(payload.data);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UPDATE_CONNECTIONS:
        this._connections = payload.data;
        this._emitter.emit(CONNECTIONS_UPDATED_EVENT);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UPDATE_SCOPES:
        this._handleUpdateScopesAsPayload(payload.data);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.RECEIVED_GET_PROPERTIES_RESPONSE:
        {
          const { id, response } = payload.data;
          this._handleResponseForPendingRequest(id, response);
          break;
        }
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.RECEIVED_EXPRESSION_EVALUATION_RESPONSE:
        {
          const { id, response } = payload.data;
          response.result = (0, (_normalizeRemoteObjectValue || _load_normalizeRemoteObjectValue()).normalizeRemoteObjectValue)(response.result);
          this._handleResponseForPendingRequest(id, response);
          break;
        }
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.ADD_WATCH_EXPRESSION:
        this._addWatchExpression(payload.data.expression);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.REMOVE_WATCH_EXPRESSION:
        this._removeWatchExpression(payload.data.index);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UPDATE_WATCH_EXPRESSION:
        this._updateWatchExpression(payload.data.index, payload.data.newExpression);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.SET_ERROR:
        this._error = payload.data;
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.SET_DEBUGGER_INSTANCE:
        this._debuggerInstance = payload.data;
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.TOGGLE_PAUSE_ON_EXCEPTION:
        const pauseOnException = payload.data;
        this._togglePauseOnException = pauseOnException;
        if (!this._togglePauseOnException) {
          this._togglePauseOnCaughtException = false;
        }
        if (this.isDebugging()) {
          this.getBridge().setPauseOnException(pauseOnException);
          if (!pauseOnException) {
            this.getBridge().setPauseOnCaughtException(this._togglePauseOnCaughtException);
          }
        }
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.TOGGLE_PAUSE_ON_CAUGHT_EXCEPTION:
        const pauseOnCaughtException = payload.data;
        this._togglePauseOnCaughtException = pauseOnCaughtException;
        if (this.isDebugging()) {
          this.getBridge().setPauseOnCaughtException(pauseOnCaughtException);
        }
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.ADD_EVALUATION_EXPRESSION_PROVIDER:
        if (this._evaluationExpressionProviders.has(payload.data)) {
          return;
        }
        this._evaluationExpressionProviders.add(payload.data);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.REMOVE_EVALUATION_EXPRESSION_PROVIDER:
        if (!this._evaluationExpressionProviders.has(payload.data)) {
          return;
        }
        this._evaluationExpressionProviders.delete(payload.data);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.ADD_REGISTER_EXECUTOR:
        if (!(this._registerExecutor == null)) {
          throw new Error('Invariant violation: "this._registerExecutor == null"');
        }

        this._registerExecutor = payload.data;
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.REMOVE_REGISTER_EXECUTOR:
        if (!(this._registerExecutor === payload.data)) {
          throw new Error('Invariant violation: "this._registerExecutor === payload.data"');
        }

        this._registerExecutor = null;
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.REGISTER_CONSOLE:
        if (this._registerExecutor != null) {
          this._consoleDisposable = this._registerExecutor();
        }
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UNREGISTER_CONSOLE:
        if (this._consoleDisposable != null) {
          this._consoleDisposable.dispose();
          this._consoleDisposable = null;
        }
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UPDATE_CUSTOM_CONTROL_BUTTONS:
        this._customControlButtons = payload.data;
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UPDATE_CONFIGURE_SOURCE_PATHS_CALLBACK:
        this._setSourcePathCallback = payload.data;
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.CONFIGURE_SOURCE_PATHS:
        if (this._setSourcePathCallback != null) {
          this._setSourcePathCallback();
        }
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.SET_DEBUG_PROCESS_INFO:
        if (this._debugProcessInfo != null) {
          this._debugProcessInfo.dispose();
        }
        this._debugProcessInfo = payload.data;
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.ADD_BREAKPOINT:
        this._addBreakpoint(payload.data.path, payload.data.line);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UPDATE_BREAKPOINT_CONDITION:
        this._updateBreakpointCondition(payload.data.breakpointId, payload.data.condition);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UPDATE_BREAKPOINT_ENABLED:
        this._updateBreakpointEnabled(payload.data.breakpointId, payload.data.enabled);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.DELETE_BREAKPOINT:
        this._deleteBreakpoint(payload.data.path, payload.data.line);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.DELETE_ALL_BREAKPOINTS:
        this._deleteAllBreakpoints();
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.ENABLE_ALL_BREAKPOINTS:
        this._enableAllBreakpoints();
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.DISABLE_ALL_BREAKPOINTS:
        this._disableAllBreakpoints();
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.TOGGLE_BREAKPOINT:
        this._toggleBreakpoint(payload.data.path, payload.data.line);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.DELETE_BREAKPOINT_IPC:
        this._deleteBreakpoint(payload.data.path, payload.data.line, false);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.UPDATE_BREAKPOINT_HITCOUNT:
        this._updateBreakpointHitcount(payload.data.path, payload.data.line, payload.data.hitCount);
        break;
      case (_DebuggerDispatcher2 || _load_DebuggerDispatcher2()).ActionTypes.BIND_BREAKPOINT_IPC:
        this._bindBreakpoint(payload.data.path, payload.data.line, payload.data.condition, payload.data.enabled, payload.data.resolved);
        break;
      default:
        return;
    }
    this._emitter.emit(DEBUGGER_CHANGE_EVENT);
  }

  _updateCallstack(callstack) {
    this._selectedCallFrameIndex = 0;
    this._callstack = callstack;
    this._emitter.emit(CALLSTACK_CHANGE_EVENT);
  }

  _updateSelectedCallFrameIndex(index) {
    this._selectedCallFrameIndex = index;
    this._emitter.emit(CALLSTACK_CHANGE_EVENT);
  }

  _openSourceLocation(sourceURL, lineNumber) {
    try {
      const path = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(sourceURL);
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

  _openPathInEditor(path) {
    // eslint-disable-next-line rulesdir/atom-apis
    return atom.workspace.open(path, {
      searchAllPanes: true,
      pending: true
    });
  }

  _nagivateToLocation(editor, line) {
    editor.scrollToBufferPosition([line, 0]);
    editor.setCursorBufferPosition([line, 0]);
  }

  _handleClearInterface() {
    this._selectedCallFrameIndex = 0;
    this._setSelectedCallFrameLine(null);
    this._updateCallstack([]);

    this._threadMap.clear();
    this._cleanUpDatatip();
    this._clearScopesInterface();
    this._clearEvaluationValues();
  }

  _setSelectedCallFrameLine(options) {
    if (options) {
      const path = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(options.sourceURL);
      const { lineNumber } = options;
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

  _highlightCallFrameLine(editor, line) {
    const marker = editor.markBufferRange([[line, 0], [line, Infinity]], {
      invalidate: 'never'
    });
    editor.decorateMarker(marker, {
      type: 'line',
      class: 'nuclide-current-line-highlight'
    });
    this._selectedCallFrameMarker = marker;
  }

  _clearSelectedCallFrameMarker() {
    if (this._selectedCallFrameMarker) {
      this._selectedCallFrameMarker.destroy();
      this._selectedCallFrameMarker = null;
    }
  }

  onCallstackChange(callback) {
    return this._emitter.on(CALLSTACK_CHANGE_EVENT, callback);
  }

  getCallstack() {
    return this._callstack;
  }

  getSelectedCallFrameIndex() {
    return this._selectedCallFrameIndex;
  }

  setDatatipService(service) {
    this._datatipService = service;
  }

  _updateThreads(threadData) {
    this._threadMap.clear();
    this._owningProcessId = threadData.owningProcessId;
    if (!Number.isNaN(threadData.stopThreadId) && threadData.stopThreadId >= 0) {
      this._stopThreadId = threadData.stopThreadId;
      this._selectedThreadId = threadData.stopThreadId;
    }

    this._threadsReloading = false;
    threadData.threads.forEach(thread => this._threadMap.set(Number(thread.id), thread));
  }

  _updateThread(thread) {
    // TODO(jonaldislarry): add deleteThread API so that this stop reason checking is not needed.
    if (thread.stopReason === 'end' || thread.stopReason === 'error' || thread.stopReason === 'stopped') {
      this._threadMap.delete(Number(thread.id));
    } else {
      this._threadMap.set(Number(thread.id), thread);
    }
  }

  _updateStopThread(id) {
    this._stopThreadId = Number(id);
    this._selectedThreadId = Number(id);
  }

  _updateSelectedThread(id) {
    this._selectedThreadId = Number(id);
  }

  _cleanUpDatatip() {
    if (this._threadChangeDatatip) {
      if (this._datatipService != null) {
        this._threadChangeDatatip.dispose();
      }
      this._threadChangeDatatip = null;
    }
  }

  // TODO(dbonafilia): refactor this code along with the ui code in callstackStore to a ui controller.
  _notifyThreadSwitch(sourceURL, lineNumber, message) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const path = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(sourceURL);
      // we want to put the message one line above the current line unless the selected
      // line is the top line, in which case we will put the datatip next to the line.
      const notificationLineNumber = lineNumber === 0 ? 0 : lineNumber - 1;
      // only handle real files for now
      const datatipService = _this._datatipService;
      if (datatipService != null && path != null && atom.workspace != null) {
        // This should be goToLocation instead but since the searchAllPanes option is correctly
        // provided it's not urgent.
        // eslint-disable-next-line rulesdir/atom-apis
        atom.workspace.open(path, { searchAllPanes: true }).then(function (editor) {
          const buffer = editor.getBuffer();
          const rowRange = buffer.rangeForRow(notificationLineNumber);
          _this._cleanUpDatatip();
          _this._threadChangeDatatip = datatipService.createPinnedDataTip({
            component: _this._createAlertComponentClass(message),
            range: rowRange,
            pinnable: true
          }, editor);
        });
      }
    })();
  }

  getThreadList() {
    return Array.from(this._threadMap.values());
  }

  getSelectedThreadId() {
    return this._selectedThreadId;
  }

  getThreadsReloading() {
    return this._threadsReloading;
  }

  getStopThread() {
    return this._stopThreadId;
  }

  onThreadsChanged(callback) {
    return this._emitter.on(THREADS_CHANGED_EVENT, callback);
  }

  _createAlertComponentClass(message) {
    return () => _react.createElement(
      'div',
      { className: 'nuclide-debugger-thread-switch-alert' },
      _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'alert' }),
      message
    );
  }

  /**
   * Subscribe to new connection updates from DebuggerActions.
   */
  onConnectionsUpdated(callback) {
    return this._emitter.on(CONNECTIONS_UPDATED_EVENT, callback);
  }

  onProvidersUpdated(callback) {
    return this._emitter.on(PROVIDERS_UPDATED_EVENT, callback);
  }

  getConnections() {
    return this._connections;
  }

  /**
   * Return available launch/attach provider for input connection.
   * Caller is responsible for disposing the results.
   */
  getLaunchAttachProvidersForConnection(connection) {
    const availableLaunchAttachProviders = [];
    for (const provider of this._debuggerProviders) {
      const launchAttachProvider = provider.getLaunchAttachProvider(connection);
      if (launchAttachProvider != null) {
        availableLaunchAttachProviders.push(launchAttachProvider);
      }
    }
    return availableLaunchAttachProviders;
  }

  _clearScopesInterface() {
    this._expandedScopes.clear();
    this.getScopesNow().forEach(scope => {
      this._expandedScopes.set(scope.name, scope.expanded);
    });
    this._scopes.next(new Map());
  }

  _handleUpdateScopesAsPayload(scopeSectionsPayload) {
    this._handleUpdateScopes(new Map(scopeSectionsPayload.map(this._convertScopeSectionPayloadToScopeSection).map(section => [section.name, section])));
  }

  _handleUpdateScopes(scopeSections) {
    this._scopes.next(scopeSections);
    scopeSections.forEach(scopeSection => {
      const { expanded, loaded, name } = scopeSection;
      if (expanded && !loaded) {
        this._loadScopeVariablesFor(name);
      }
    });
  }

  _loadScopeVariablesFor(scopeName) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const scopes = _this2.getScopesNow();
      const selectedScope = (0, (_nullthrows || _load_nullthrows()).default)(scopes.get(scopeName));
      const expressionEvaluationManager = (0, (_nullthrows || _load_nullthrows()).default)(_this2._bridge.getCommandDispatcher().getBridgeAdapter()).getExpressionEvaluationManager();
      selectedScope.scopeVariables = yield expressionEvaluationManager.getScopeVariablesFor((0, (_nullthrows || _load_nullthrows()).default)(expressionEvaluationManager.getRemoteObjectManager().getRemoteObjectFromId(selectedScope.scopeObjectId)));
      selectedScope.loaded = true;
      _this2._handleUpdateScopes(scopes);
    })();
  }

  getScopes() {
    return this._scopes.asObservable();
  }

  getScopesNow() {
    return this._scopes.getValue();
  }

  setExpanded(scopeName, expanded) {
    const scopes = this.getScopesNow();
    const selectedScope = (0, (_nullthrows || _load_nullthrows()).default)(scopes.get(scopeName));
    selectedScope.expanded = expanded;
    if (expanded) {
      selectedScope.loaded = false;
    }
    this._handleUpdateScopes(scopes);
  }

  // Returns a promise of the updated value after it has been set.
  sendSetVariableRequest(scopeObjectId, scopeName, expression, newValue) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const debuggerInstance = _this3.getDebuggerInstance();
      if (debuggerInstance == null) {
        const errorMsg = 'setVariable failed because debuggerInstance is null';
        (0, (_EventReporter || _load_EventReporter()).reportError)(errorMsg);
        return Promise.reject(new Error(errorMsg));
      }
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_EDIT_VARIABLE, {
        language: debuggerInstance.getProviderName()
      });
      return new Promise(function (resolve, reject) {
        function callback(error, response) {
          if (error != null) {
            const message = JSON.stringify(error);
            (0, (_EventReporter || _load_EventReporter()).reportError)(`setVariable failed with ${message}`);
            atom.notifications.addError(message);
            reject(error);
          } else {
            resolve(response.value);
          }
        }
        _this3._bridge.sendSetVariableCommand(Number(scopeObjectId), expression, newValue, callback);
      }).then(function (confirmedNewValue) {
        _this3._setVariable(scopeName, expression, confirmedNewValue);
        return confirmedNewValue;
      });
    })();
  }

  triggerReevaluation() {
    this._cancelRequestsToBridge();
    for (const [expression, subject] of this._watchExpressions) {
      if (subject.observers == null || subject.observers.length === 0) {
        // Nobody is watching this expression anymore.
        this._watchExpressions.delete(expression);
        continue;
      }
      this._requestExpressionEvaluation(expression, subject, false /* no REPL support */
      );
    }
  }

  _cancelRequestsToBridge() {
    this._previousEvaluationSubscriptions.dispose();
    this._previousEvaluationSubscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  // Resets all values to N/A, for examples when the debugger resumes or stops.
  _clearEvaluationValues() {
    for (const subject of this._watchExpressions.values()) {
      subject.next(null);
    }
  }

  /**
   * Returns an observable of child properties for the given objectId.
   * Resources are automatically cleaned up once all subscribers of an expression have unsubscribed.
   */
  getProperties(objectId) {
    const getPropertiesPromise = this._sendEvaluationCommand('getProperties', objectId);
    return _rxjsBundlesRxMinJs.Observable.fromPromise(getPropertiesPromise);
  }

  evaluateConsoleExpression(expression) {
    return this._evaluateExpression(expression, true /* support REPL */);
  }

  evaluateWatchExpression(expression) {
    return this._evaluateExpression(expression, false /* do not support REPL */
    );
  }

  /**
   * Returns an observable of evaluation results for a given expression.
   * Resources are automatically cleaned up once all subscribers of an expression have unsubscribed.
   *
   * The supportRepl boolean indicates if we allow evaluation in a non-paused state.
   */
  _evaluateExpression(expression, supportRepl) {
    if (!supportRepl && this._watchExpressions.has(expression)) {
      const cachedResult = this._watchExpressions.get(expression);
      return (0, (_nullthrows || _load_nullthrows()).default)(cachedResult);
    }
    const subject = new _rxjsBundlesRxMinJs.BehaviorSubject(null);
    this._requestExpressionEvaluation(expression, subject, supportRepl);
    if (!supportRepl) {
      this._watchExpressions.set(expression, subject);
    }
    // Expose an observable rather than the raw subject.
    return subject.asObservable();
  }

  _requestExpressionEvaluation(expression, subject, supportRepl) {
    let evaluationPromise;
    if (supportRepl) {
      evaluationPromise = this._debuggerMode === (_constants || _load_constants()).DebuggerMode.PAUSED ? this._evaluateOnSelectedCallFrame(expression, 'console') : this._runtimeEvaluate(expression);
    } else {
      evaluationPromise = this._evaluateOnSelectedCallFrame(expression, 'watch-group');
    }

    const evaluationDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(_rxjsBundlesRxMinJs.Observable.fromPromise(evaluationPromise).merge(_rxjsBundlesRxMinJs.Observable.never()) // So that we do not unsubscribe `subject` when disposed.
    .subscribe(subject));

    // Non-REPL environments will want to record these requests so they can be canceled on
    // re-evaluation, e.g. in the case of stepping.  REPL environments should let them complete so
    // we can have e.g. a history of evaluations in the console.
    if (!supportRepl) {
      this._previousEvaluationSubscriptions.add(evaluationDisposable);
    } else {
      this._disposables.add(evaluationDisposable);
    }
  }

  _evaluateOnSelectedCallFrame(expression, objectGroup) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const result = yield _this4._sendEvaluationCommand('evaluateOnSelectedCallFrame', expression, objectGroup);
      if (result == null) {
        // Backend returned neither a result nor an error message
        return {
          type: 'text',
          value: `Failed to evaluate: ${expression}`
        };
      } else {
        return result;
      }
    })();
  }

  _runtimeEvaluate(expression) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const result = yield _this5._sendEvaluationCommand('runtimeEvaluate', expression);
      if (result == null) {
        // Backend returned neither a result nor an error message
        return {
          type: 'text',
          value: `Failed to evaluate: ${expression}`
        };
      } else {
        return result;
      }
    })();
  }

  _sendEvaluationCommand(command, ...args) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const deferred = new (_promise || _load_promise()).Deferred();
      const evalId = _this6._evaluationId;
      ++_this6._evaluationId;
      _this6._evaluationRequestsInFlight.set(evalId, deferred);
      _this6._bridge.sendEvaluationCommand(command, evalId, ...args);
      let result = null;
      try {
        result = yield deferred.promise;
      } catch (e) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-debugger').warn(`${command}: Error getting result.`, e);
      }
      _this6._evaluationRequestsInFlight.delete(evalId);
      return result;
    })();
  }

  _handleResponseForPendingRequest(id, response) {
    const { result, error } = response;
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

  _deserializeWatchExpressions(watchExpressions) {
    if (watchExpressions != null) {
      this._watchExpressionsList.next(watchExpressions.map(expression => this._getExpressionEvaluationFor(expression)));
    }
  }

  _getExpressionEvaluationFor(expression) {
    return {
      expression,
      value: this.evaluateWatchExpression(expression)
    };
  }

  getWatchExpressions() {
    return this._watchExpressionsList.asObservable();
  }

  getSerializedWatchExpressions() {
    return this._watchExpressionsList.getValue().map(evaluatedExpression => evaluatedExpression.expression);
  }

  _addWatchExpression(expression) {
    if (expression === '') {
      return;
    }
    this._watchExpressionsList.next([...this._watchExpressionsList.getValue(), this._getExpressionEvaluationFor(expression)]);
  }

  _removeWatchExpression(index) {
    const watchExpressions = this._watchExpressionsList.getValue().slice();
    watchExpressions.splice(index, 1);
    this._watchExpressionsList.next(watchExpressions);
  }

  _updateWatchExpression(index, newExpression) {
    if (newExpression === '') {
      return this._removeWatchExpression(index);
    }
    const watchExpressions = this._watchExpressionsList.getValue().slice();
    watchExpressions[index] = this._getExpressionEvaluationFor(newExpression);
    this._watchExpressionsList.next(watchExpressions);
  }

  _refetchWatchSubscriptions() {
    const watchExpressions = this._watchExpressionsList.getValue().slice();
    const refetchedWatchExpressions = watchExpressions.map(({ expression }) => {
      return this._getExpressionEvaluationFor(expression);
    });
    this._watchExpressionsList.next(refetchedWatchExpressions);
  }

  loaderBreakpointResumed() {
    this._onLoaderBreakpointResume(); // Resolves onLoaderBreakpointResumePromise.
  }

  getCustomControlButtons() {
    return this._customControlButtons;
  }

  getDebuggerInstance() {
    return this._debuggerInstance;
  }

  getError() {
    return this._error;
  }

  getDebuggerMode() {
    return this._debuggerMode;
  }

  isDebugging() {
    return this._debuggerMode !== (_constants || _load_constants()).DebuggerMode.STOPPED && this._debuggerMode !== (_constants || _load_constants()).DebuggerMode.STOPPING;
  }

  getTogglePauseOnException() {
    return this._togglePauseOnException;
  }

  getTogglePauseOnCaughtException() {
    return this._togglePauseOnCaughtException;
  }

  getIsReadonlyTarget() {
    return this._debugProcessInfo != null && this._debugProcessInfo.getDebuggerCapabilities().readOnlyTarget;
  }

  getSettings() {
    return this._debuggerSettings;
  }

  getEvaluationExpressionProviders() {
    return this._evaluationExpressionProviders;
  }

  getCanSetSourcePaths() {
    return this._setSourcePathCallback != null;
  }

  getCanRestartDebugger() {
    return this._debugProcessInfo != null;
  }

  getDebugProcessInfo() {
    return this._debugProcessInfo;
  }

  onChange(callback) {
    return this._emitter.on(DEBUGGER_CHANGE_EVENT, callback);
  }

  onDebuggerModeChange(callback) {
    return this._emitter.on(DEBUGGER_MODE_CHANGE_EVENT, callback);
  }

  setShowDisassembly(enable) {
    this._enableShowDisassembly = enable;
    if (this.isDebugging()) {
      this.getBridge().setShowDisassembly(enable);
    }
  }

  getShowDisassembly() {
    return this._debugProcessInfo != null && this._debugProcessInfo.getDebuggerCapabilities().disassembly && this._enableShowDisassembly;
  }

  supportsSetVariable() {
    const currentDebugInfo = this.getDebugProcessInfo();
    return currentDebugInfo ? currentDebugInfo.getDebuggerCapabilities().setVariable : false;
  }

  _scheduleNativeNotification() {
    const raiseNativeNotification = (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getNotificationService)();
    if (raiseNativeNotification != null) {
      const pendingNotification = raiseNativeNotification('Nuclide Debugger', 'Paused at a breakpoint', 3000, false);
      if (pendingNotification != null) {
        this._disposables.add(pendingNotification);
      }
    }
  }

  _addBreakpoint(path, line, condition = '', resolved = false, userAction = true, enabled = true) {
    this._breakpointIdSeed++;
    const breakpoint = {
      id: this._breakpointIdSeed,
      path,
      line,
      condition,
      enabled,
      resolved
    };
    this._idToBreakpointMap.set(breakpoint.id, breakpoint);
    if (!this._breakpoints.has(path)) {
      this._breakpoints.set(path, new Map());
    }
    const lineMap = this._breakpoints.get(path);

    if (!(lineMap != null)) {
      throw new Error('Invariant violation: "lineMap != null"');
    }

    lineMap.set(line, breakpoint);
    this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, path);
    if (userAction) {
      this._emitter.emit(BREAKPOINT_USER_CHANGED, {
        action: ADD_BREAKPOINT_ACTION,
        breakpoint
      });
    }
  }

  _updateBreakpointHitcount(path, line, hitCount) {
    const breakpoint = this.getBreakpointAtLine(path, line);
    if (breakpoint == null) {
      return;
    }
    breakpoint.hitCount = hitCount;
    this._updateBreakpoint(breakpoint);
  }

  _updateBreakpointEnabled(breakpointId, enabled) {
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

  _updateBreakpointCondition(breakpointId, condition) {
    const breakpoint = this._idToBreakpointMap.get(breakpointId);
    if (breakpoint == null) {
      return;
    }
    breakpoint.condition = condition;
    this._updateBreakpoint(breakpoint);
  }

  _updateBreakpoint(breakpoint) {
    this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, breakpoint.path);
    this._emitter.emit(BREAKPOINT_USER_CHANGED, {
      action: 'UpdateBreakpoint',
      breakpoint
    });
  }

  _forEachBreakpoint(callback) {
    for (const path of this._breakpoints.keys()) {
      const lineMap = this._breakpoints.get(path);

      if (!(lineMap != null)) {
        throw new Error('Invariant violation: "lineMap != null"');
      }

      for (const line of lineMap.keys()) {
        const bp = lineMap.get(line);

        if (!(bp != null)) {
          throw new Error('Invariant violation: "bp != null"');
        }

        callback(path, line, bp.id);
      }
    }
  }

  _deleteAllBreakpoints() {
    this._forEachBreakpoint((path, line, breakpointId) => this._deleteBreakpoint(path, line));
  }

  _enableAllBreakpoints() {
    this._forEachBreakpoint((path, line, breakpointId) => this._updateBreakpointEnabled(breakpointId, true));
  }

  _disableAllBreakpoints() {
    this._forEachBreakpoint((path, line, breakpointId) => this._updateBreakpointEnabled(breakpointId, false));
  }

  _deleteBreakpoint(path, line, userAction = true) {
    const lineMap = this._breakpoints.get(path);
    if (lineMap == null) {
      return;
    }
    const breakpoint = lineMap.get(line);
    if (lineMap.delete(line)) {
      if (!breakpoint) {
        throw new Error('Invariant violation: "breakpoint"');
      }

      this._idToBreakpointMap.delete(breakpoint.id);
      this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, path);
      if (userAction) {
        this._emitter.emit(BREAKPOINT_USER_CHANGED, {
          action: DELETE_BREAKPOINT_ACTION,
          breakpoint
        });
      }
    }
  }

  _toggleBreakpoint(path, line) {
    if (!this._breakpoints.has(path)) {
      this._breakpoints.set(path, new Map());
    }
    const lineMap = this._breakpoints.get(path);

    if (!(lineMap != null)) {
      throw new Error('Invariant violation: "lineMap != null"');
    }

    if (lineMap.has(line)) {
      this._deleteBreakpoint(path, line);
    } else {
      this._addBreakpoint(path, line, '');
    }
  }

  _bindBreakpoint(path, line, condition, enabled, resolved) {
    // The Chrome devtools always bind a new breakpoint as enabled the first time. If this
    // breakpoint is known to be disabled in the front-end, sync the enabled state with Chrome.
    const existingBp = this.getBreakpointAtLine(path, line);
    const updateEnabled = existingBp != null && existingBp.enabled !== enabled;

    this._addBreakpoint(path, line, condition, resolved, false, // userAction
    enabled);

    if (updateEnabled) {
      const updatedBp = this.getBreakpointAtLine(path, line);
      if (updatedBp != null) {
        updatedBp.enabled = !enabled;
        this._updateBreakpoint(updatedBp);
      }
    }

    const currentInfo = this.getDebugProcessInfo();
    if (condition !== '' && currentInfo != null && !currentInfo.getDebuggerCapabilities().conditionalBreakpoints) {
      // If the current debugger does not support conditional breakpoints, and the bp that
      // was just bound has a condition on it, warn the user that the condition isn't going
      // to be honored.
      atom.notifications.addWarning('The current debugger does not support conditional breakpoints. The breakpoint at this location will hit without ' + 'evaluating the specified condition expression:\n' + `${(_nuclideUri || _load_nuclideUri()).default.basename(path)}:${line}`);
      const updatedBp = this.getBreakpointAtLine(path, line);
      if (updatedBp != null) {
        this._updateBreakpointCondition(updatedBp.id, '');
      }
    }
  }

  _resetBreakpoints() {
    for (const breakpoint of this.getAllBreakpoints()) {
      breakpoint.resolved = false;
      breakpoint.hitCount = undefined;
      this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, breakpoint.path);
    }
  }

  getBreakpointsForPath(path) {
    if (!this._breakpoints.has(path)) {
      this._breakpoints.set(path, new Map());
    }
    const ret = this._breakpoints.get(path);

    if (!ret) {
      throw new Error('Invariant violation: "ret"');
    }

    return ret;
  }

  getBreakpointLinesForPath(path) {
    const lineMap = this._breakpoints.get(path);
    return lineMap != null ? new Set(lineMap.keys()) : new Set();
  }

  getBreakpointAtLine(path, line) {
    const lineMap = this._breakpoints.get(path);
    if (lineMap == null) {
      return null;
    }
    return lineMap.get(line);
  }

  getAllBreakpoints() {
    const breakpoints = [];
    for (const [, lineMap] of this._breakpoints) {
      for (const breakpoint of lineMap.values()) {
        breakpoints.push(breakpoint);
      }
    }
    return breakpoints;
  }

  getSerializedBreakpoints() {
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
          condition: breakpoint.condition
        });
      }
    }
    return breakpoints;
  }

  breakpointSupportsConditions(breakpoint) {
    // If currently debugging, return whether or not the current debugger supports this.
    if (this.getDebuggerMode() !== (_constants || _load_constants()).DebuggerMode.STOPPED) {
      const currentDebugInfo = this.getDebugProcessInfo();
      if (currentDebugInfo != null) {
        return currentDebugInfo.getDebuggerCapabilities().conditionalBreakpoints;
      }
    }

    // If not currently debugging, return if any of the debuggers that support
    // the file extension this bp is in support conditions.
    // TODO: have providers register their file extensions and filter correctly here.
    return true;
  }

  _deserializeBreakpoints(breakpoints) {
    if (breakpoints == null) {
      return;
    }
    for (const breakpoint of breakpoints) {
      const { line, sourceURL, disabled, condition } = breakpoint;
      this._addBreakpoint(sourceURL, line, condition || '', false, // resolved
      false, // user action
      !disabled // enabled
      );
    }
  }

  /**
   * Register a change handler that is invoked when the breakpoints UI
   * needs to be updated for a file.
   */
  onNeedUIUpdate(callback) {
    return this._emitter.on(BREAKPOINT_NEED_UI_UPDATE, callback);
  }

  /**
   * Register a change handler that is invoked when a breakpoint is changed
   * by user action, like user explicitly added, deleted a breakpoint.
   */
  onUserChange(callback) {
    return this._emitter.on(BREAKPOINT_USER_CHANGED, callback);
  }
}
exports.default = DebuggerModel;