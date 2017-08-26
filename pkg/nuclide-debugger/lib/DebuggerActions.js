'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = require('./DebuggerDispatcher');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _atom = require('atom');

var _AnalyticsHelper;

function _load_AnalyticsHelper() {
  return _AnalyticsHelper = require('./AnalyticsHelper');
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _ChromeActionRegistryActions;

function _load_ChromeActionRegistryActions() {
  return _ChromeActionRegistryActions = _interopRequireDefault(require('./ChromeActionRegistryActions'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-debugger'); /**
                                                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                                                * All rights reserved.
                                                                                *
                                                                                * This source code is licensed under the license found in the LICENSE file in
                                                                                * the root directory of this source tree.
                                                                                *
                                                                                * 
                                                                                * @format
                                                                                */

const GK_DEBUGGER_REQUEST_WINDOW = 'nuclide_debugger_php_request_window';
const GK_DEBUGGER_REQUEST_SENDER = 'nuclide_debugger_request_sender';

// This must match URI defined in ../../nuclide-console/lib/ui/ConsoleContainer
const CONSOLE_VIEW_URI = 'atom://nuclide/console';

/**
 * Flux style action creator for actions that affect the debugger.
 */
class DebuggerActions {

  constructor(dispatcher, store) {
    this._disposables = new _atom.CompositeDisposable();
    this._dispatcher = dispatcher;
    this._store = store;
  }

  startDebugging(processInfo) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_START, {
        serviceName: processInfo.getServiceName()
      });
      (0, (_AnalyticsHelper || _load_AnalyticsHelper()).beginTimerTracking)('nuclide-debugger-atom:startDebugging');

      _this.stopDebugging(); // stop existing session.
      _this.setError(null);
      _this._handleDebugModeStart();
      _this.setDebuggerMode((_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STARTING);
      _this.setDebugProcessInfo(processInfo);
      try {
        const debuggerCapabilities = processInfo.getDebuggerCapabilities();
        const debuggerProps = processInfo.getDebuggerProps();
        const debuggerInstance = yield processInfo.debug();
        yield _this._store.getBridge().setupNuclideChannel(debuggerInstance);
        _this._registerConsole();
        const supportThreadsWindow = debuggerCapabilities.threads && (yield _this._allowThreadsForPhp(processInfo));
        _this._store.getSettings().set('SupportThreadsWindow', supportThreadsWindow);
        if (supportThreadsWindow) {
          _this._store.getSettings().set('CustomThreadColumns', debuggerProps.threadColumns);
          _this._store.getSettings().set('threadsComponentTitle', debuggerProps.threadsComponentTitle);
        }
        const singleThreadStepping = debuggerCapabilities.singleThreadStepping;
        _this._store.getSettings().set('SingleThreadStepping', singleThreadStepping);
        _this.toggleSingleThreadStepping(singleThreadStepping);
        if (processInfo.getServiceName() !== 'hhvm' || (yield (0, (_passesGK || _load_passesGK()).default)(GK_DEBUGGER_REQUEST_SENDER))) {
          const customControlButtons = debuggerProps.customControlButtons;
          if (customControlButtons.length > 0) {
            _this.updateControlButtons(customControlButtons);
          } else {
            _this.updateControlButtons([]);
          }
        }

        if (debuggerCapabilities.customSourcePaths) {
          _this.updateConfigureSourcePathsCallback(processInfo.configureSourceFilePaths.bind(processInfo));
        } else {
          _this.updateConfigureSourcePathsCallback(null);
        }

        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');

        yield _this._waitForChromeConnection(debuggerInstance);
      } catch (err) {
        (0, (_AnalyticsHelper || _load_AnalyticsHelper()).failTimerTracking)(err);
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_START_FAIL, {});
        const errorMessage = `Failed to start debugger process: ${err}`;
        _this.setError(errorMessage);
        atom.notifications.addError(errorMessage);
        _this.stopDebugging();
      }
    })();
  }

  _allowThreadsForPhp(processInfo) {
    return (0, _asyncToGenerator.default)(function* () {
      if (processInfo.getServiceName() === 'hhvm') {
        return (0, (_passesGK || _load_passesGK()).default)(GK_DEBUGGER_REQUEST_WINDOW);
      }
      return true;
    })();
  }

  setDebuggerMode(debuggerMode) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DEBUGGER_MODE_CHANGE,
      data: debuggerMode
    });
  }

  _waitForChromeConnection(debuggerInstance) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this2._setDebuggerInstance(debuggerInstance);
      if (debuggerInstance.onSessionEnd != null) {
        const handler = _this2._handleSessionEnd.bind(_this2, debuggerInstance);

        if (!debuggerInstance.onSessionEnd) {
          throw new Error('Invariant violation: "debuggerInstance.onSessionEnd"');
        }

        _this2._disposables.add(debuggerInstance.onSessionEnd(handler));
      }

      const socketAddr = yield debuggerInstance.getWebsocketAddress();
      (0, (_AnalyticsHelper || _load_AnalyticsHelper()).endTimerTracking)();

      _this2._dispatcher.dispatch({
        actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_PROCESS_SOCKET,
        data: socketAddr
      });
      // Debugger finished initializing and entered debug mode.
      _this2.setDebuggerMode((_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING);

      // Wait for 'resume' event from Bridge.js to guarantee we've passed the loader breakpoint.
      yield _this2._store.loaderBreakpointResumePromise;
    })();
  }

  _setDebuggerInstance(debuggerInstance) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_DEBUGGER_INSTANCE,
      data: debuggerInstance
    });
  }

  _handleSessionEnd(debuggerInstance) {
    if (this._store.getDebuggerInstance() === debuggerInstance) {
      this.stopDebugging();
    } else {
      // Do nothing, because either:
      // 1. Another DebuggerInstance is alive. or
      // 2. DebuggerInstance has been disposed.
    }
  }

  stopDebugging() {
    if (this._store.getDebuggerMode() === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPING) {
      return;
    }
    this.setDebuggerMode((_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPING);
    this._unregisterConsole();
    const debuggerInstance = this._store.getDebuggerInstance();
    if (debuggerInstance != null) {
      debuggerInstance.dispose();
      this._setDebuggerInstance(null);
    }
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_PROCESS_SOCKET,
      data: null
    });

    this.clearInterface();
    this.updateControlButtons([]);
    this.setDebuggerMode((_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED);
    this.setDebugProcessInfo(null);
    this.updateConfigureSourcePathsCallback(null);
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STOP);
    (0, (_AnalyticsHelper || _load_AnalyticsHelper()).endTimerTracking)();

    if (!(this._store.getDebuggerInstance() == null)) {
      throw new Error('Invariant violation: "this._store.getDebuggerInstance() == null"');
    }
  }

  restartDebugger() {
    const currentDebuggerInfo = this._store.getDebugProcessInfo();
    if (currentDebuggerInfo == null || this._store.getDebuggerMode() === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED) {
      atom.notifications.addWarning('Cannot restart the debugger: the debugger is not currently running!');
      return;
    }

    // Clone the current debugger info before stopping debugging, as stop will dispose it.
    const newDebuggerInfo = currentDebuggerInfo.clone();

    if (!newDebuggerInfo) {
      throw new Error('Invariant violation: "newDebuggerInfo"');
    }

    this.startDebugging(newDebuggerInfo);
  }

  _registerConsole() {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.REGISTER_CONSOLE,
      data: {}
    });
  }

  _unregisterConsole() {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UNREGISTER_CONSOLE,
      data: {}
    });
  }

  addConsoleRegisterFunction(registerExecutor) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ADD_REGISTER_EXECUTOR,
      data: registerExecutor
    });
  }

  removeConsoleRegisterFunction(registerExecutor) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.REMOVE_REGISTER_EXECUTOR,
      data: registerExecutor
    });
  }

  updateControlButtons(buttons) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_CUSTOM_CONTROL_BUTTONS,
      data: buttons
    });
  }

  updateConfigureSourcePathsCallback(callback) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_CONFIGURE_SOURCE_PATHS_CALLBACK,
      data: callback
    });
  }

  configureSourcePaths() {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.CONFIGURE_SOURCE_PATHS
    });
  }

  addDebuggerProvider(provider) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ADD_DEBUGGER_PROVIDER,
      data: provider
    });
  }

  removeDebuggerProvider(provider) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.REMOVE_DEBUGGER_PROVIDER,
      data: provider
    });
  }

  addEvaluationExpressionProvider(provider) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ADD_EVALUATION_EXPRESSION_PROVIDER,
      data: provider
    });
  }

  removeEvaluationExpressionProvider(provider) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.REMOVE_EVALUATION_EXPRESSION_PROVIDER,
      data: provider
    });
  }

  setError(error) {
    if (error != null) {
      logger.error(error);
    }
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_ERROR,
      data: error
    });
  }

  /**
   * Utility for getting refreshed connections.
   * TODO: refresh connections when new directories are removed/added in file-tree.
   */
  updateConnections() {
    const connections = this._getRemoteConnections();
    // Always have one single local connection.
    connections.push('local');
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_CONNECTIONS,
      data: connections
    });
  }

  /**
   * Get remote connections without duplication.
   */
  _getRemoteConnections() {
    // TODO: move this logic into RemoteConnection package.
    return atom.project.getPaths().filter(path => {
      return (_nuclideUri || _load_nuclideUri()).default.isRemote(path);
    }).map(remotePath => {
      const { hostname } = (_nuclideUri || _load_nuclideUri()).default.parseRemoteUri(remotePath);
      return (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, '/');
    }).filter((path, index, inputArray) => {
      return inputArray.indexOf(path) === index;
    });
  }

  addWatchExpression(expression) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_WATCH_ADD_EXPRESSION);
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ADD_WATCH_EXPRESSION,
      data: {
        expression
      }
    });
  }

  removeWatchExpression(index) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_WATCH_REMOVE_EXPRESSION);
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.REMOVE_WATCH_EXPRESSION,
      data: {
        index
      }
    });
  }

  updateWatchExpression(index, newExpression) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_WATCH_UPDATE_EXPRESSION);
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_WATCH_EXPRESSION,
      data: {
        newExpression,
        index
      }
    });
  }

  openSourceLocation(sourceURL, lineNumber) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.OPEN_SOURCE_LOCATION,
      data: {
        sourceURL,
        lineNumber
      }
    });
  }

  /**
   * `actionId` is a debugger action understood by Chrome's `WebInspector.ActionRegistry`.
   */
  triggerDebuggerAction(actionId) {
    switch (actionId) {
      case (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.RUN:
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_CONTINUE);
        break;
      case (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.PAUSE:
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_PAUSE);
        break;
      case (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.STEP_INTO:
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_INTO);
        break;
      case (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.STEP_OVER:
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_OVER);
        break;
      case (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.STEP_OUT:
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_OUT);
        break;
      default:
        logger.error('Unkown debugger action type', actionId);
        break;
    }
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TRIGGER_DEBUGGER_ACTION,
      data: {
        actionId
      }
    });
  }

  updateCallstack(callstack) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_CALLSTACK,
      data: {
        callstack
      }
    });
  }

  setSelectedCallFrameIndex(index) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_SELECTED_CALLFRAME_INDEX,
      data: {
        index
      }
    });
  }

  setSelectedCallFrameLine(options) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_SELECTED_CALLFRAME_LINE,
      data: {
        options
      }
    });
  }

  clearInterface() {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.CLEAR_INTERFACE,
      data: {}
    });
  }

  addBreakpoint(path, line) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_ADD);
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ADD_BREAKPOINT,
      data: {
        path,
        line
      }
    });
  }

  updateBreakpointEnabled(breakpointId, enabled) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_TOGGLE_ENABLED, { enabled });
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_BREAKPOINT_ENABLED,
      data: {
        breakpointId,
        enabled
      }
    });
  }

  updateBreakpointCondition(breakpointId, condition) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_UPDATE_CONDITION, { condition });
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_BREAKPOINT_CONDITION,
      data: {
        breakpointId,
        condition
      }
    });
  }

  deleteBreakpoint(path, line) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_DELETE);
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DELETE_BREAKPOINT,
      data: {
        path,
        line
      }
    });
  }

  deleteAllBreakpoints() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_DELETE_ALL);
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DELETE_ALL_BREAKPOINTS,
      data: {}
    });
  }

  enableAllBreakpoints() {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ENABLE_ALL_BREAKPOINTS,
      data: {}
    });
  }

  disableAllBreakpoints() {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DISABLE_ALL_BREAKPOINTS,
      data: {}
    });
  }

  toggleBreakpoint(path, line) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_TOGGLE);
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TOGGLE_BREAKPOINT,
      data: {
        path,
        line
      }
    });
  }

  deleteBreakpointIPC(path, line) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DELETE_BREAKPOINT_IPC,
      data: {
        path,
        line
      }
    });
  }

  updateBreakpointHitCount(path, line, hitCount) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_BREAKPOINT_HITCOUNT,
      data: {
        path,
        line,
        hitCount
      }
    });
  }

  bindBreakpointIPC(path, line, condition, enabled, resolved) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.BIND_BREAKPOINT_IPC,
      data: {
        path,
        line,
        condition,
        enabled,
        resolved
      }
    });
  }

  togglePauseOnException(pauseOnException) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_TOGGLE_PAUSE_EXCEPTION, { pauseOnException });
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TOGGLE_PAUSE_ON_EXCEPTION,
      data: pauseOnException
    });
  }

  togglePauseOnCaughtException(pauseOnCaughtException) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_TOGGLE_CAUGHT_EXCEPTION, {
      pauseOnCaughtException
    });
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TOGGLE_PAUSE_ON_CAUGHT_EXCEPTION,
      data: pauseOnCaughtException
    });
  }

  toggleSingleThreadStepping(singleThreadStepping) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_TOGGLE_SINGLE_THREAD_STEPPING, {
      singleThreadStepping
    });
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TOGGLE_SINGLE_THREAD_STEPPING,
      data: singleThreadStepping
    });
  }

  updateScopes(scopeSections) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_SCOPES,
      data: scopeSections
    });
  }

  dispose() {
    (0, (_AnalyticsHelper || _load_AnalyticsHelper()).endTimerTracking)();
    this._disposables.dispose();
  }

  updateThreads(threadData) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_THREADS,
      data: {
        threadData
      }
    });
  }

  updateThread(thread) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_THREAD,
      data: {
        thread
      }
    });
  }

  updateStopThread(id) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_STOP_THREAD,
      data: {
        id
      }
    });
  }

  updateSelectedThread(id) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_SELECTED_THREAD,
      data: {
        id
      }
    });
  }

  notifyThreadSwitch(sourceURL, lineNumber, message) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.NOTIFY_THREAD_SWITCH,
      data: {
        sourceURL,
        lineNumber,
        message
      }
    });
  }

  openDevTools() {
    this._dispatcher.dispatch({ actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.OPEN_DEV_TOOLS });
  }

  receiveExpressionEvaluationResponse(id, response) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.RECEIVED_EXPRESSION_EVALUATION_RESPONSE,
      data: {
        id,
        response
      }
    });
  }

  receiveGetPropertiesResponse(id, response) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.RECEIVED_GET_PROPERTIES_RESPONSE,
      data: {
        id,
        response
      }
    });
  }

  setDebugProcessInfo(processInfo) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_DEBUG_PROCESS_INFO,
      data: processInfo
    });
  }

  _handleDebugModeStart() {
    // Open the console window if it's not already opened.
    // eslint-disable-next-line nuclide-internal/atom-apis
    atom.workspace.open(CONSOLE_VIEW_URI, { searchAllPanes: true });
  }
}
exports.default = DebuggerActions;