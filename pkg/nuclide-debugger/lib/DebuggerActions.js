'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = require('./DebuggerDispatcher');
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

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

const AnalyticsEvents = Object.freeze({
  DEBUGGER_START: 'debugger-start',
  DEBUGGER_START_FAIL: 'debugger-start-fail',
  DEBUGGER_STOP: 'debugger-stop'
});

const GK_DEBUGGER_REQUEST_WINDOW = 'nuclide_debugger_php_request_window';
const GK_DEBUGGER_THREADS_WINDOW = 'nuclide_debugger_threads_window';
const GK_DEBUGGER_REQUEST_SENDER = 'nuclide_debugger_request_sender';

/**
 * Flux style action creator for actions that affect the debugger.
 */
let DebuggerActions = class DebuggerActions {

  constructor(dispatcher, store) {
    this._disposables = new _atom.CompositeDisposable();
    this._dispatcher = dispatcher;
    this._store = store;
  }

  startDebugging(processInfo) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.DEBUGGER_START, {
        serviceName: processInfo.getServiceName()
      });
      (0, (_AnalyticsHelper || _load_AnalyticsHelper()).beginTimerTracking)('nuclide-debugger-atom:startDebugging');

      _this.stopDebugging(); // stop existing session.
      _this.setError(null);
      _this._handleDebugModeStart();
      _this.setDebuggerMode((_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STARTING);
      try {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
        const debuggerInstance = yield processInfo.debug();
        _this._registerConsole();
        const supportThreadsWindow = processInfo.supportThreads() && (yield (0, (_passesGK || _load_passesGK()).default)(GK_DEBUGGER_THREADS_WINDOW)) && (yield _this._allowThreadsForPhp(processInfo));
        _this._store.getSettings().set('SupportThreadsWindow', supportThreadsWindow);
        const singleThreadStepping = processInfo.supportSingleThreadStepping();
        if (singleThreadStepping) {
          _this._store.getSettings().set('SingleThreadStepping', singleThreadStepping);
          const singleThreadSteppingEnabled = processInfo.singleThreadSteppingEnabled();
          _this.toggleSingleThreadStepping(singleThreadSteppingEnabled);
        }
        if (processInfo.getServiceName() !== 'hhvm' || (yield (0, (_passesGK || _load_passesGK()).default)(GK_DEBUGGER_REQUEST_SENDER))) {
          const customControlButtons = processInfo.customControlButtons();
          if (customControlButtons.length > 0) {
            _this.updateControlButtons(customControlButtons);
          } else {
            _this.updateControlButtons([]);
          }
        }
        yield _this._waitForChromeConnection(debuggerInstance);
      } catch (err) {
        (0, (_AnalyticsHelper || _load_AnalyticsHelper()).failTimerTracking)(err);
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.DEBUGGER_START_FAIL, {});
        const errorMessage = `Failed to start debugger process: ${ (0, (_string || _load_string()).stringifyError)(err) }`;
        _this.setError(errorMessage);
        atom.notifications.addError(errorMessage);
        _this.stopDebugging();
      }
    })();
  }

  _allowThreadsForPhp(processInfo) {
    return (0, _asyncToGenerator.default)(function* () {
      if (processInfo.getServiceName() === 'hhvm') {
        return yield (0, (_passesGK || _load_passesGK()).default)(GK_DEBUGGER_REQUEST_WINDOW);
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
    this.setDebuggerMode((_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED);
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.DEBUGGER_STOP);
    (0, (_AnalyticsHelper || _load_AnalyticsHelper()).endTimerTracking)();

    if (!(this._store.getDebuggerInstance() === null)) {
      throw new Error('Invariant violation: "this._store.getDebuggerInstance() === null"');
    }

    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:hide');
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
   * Utility for debugging.
   *
   * This can be used to set an existing socket, bypassing normal UI flow to
   * improve iteration speed for development.
   */
  forceProcessSocket(socketAddr) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_PROCESS_SOCKET,
      data: socketAddr
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
      var _nuclideUri$parseRemo = (_nuclideUri || _load_nuclideUri()).default.parseRemoteUri(remotePath);

      const hostname = _nuclideUri$parseRemo.hostname;

      return (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, '/');
    }).filter((path, index, inputArray) => {
      return inputArray.indexOf(path) === index;
    });
  }

  addWatchExpression(expression) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ADD_WATCH_EXPRESSION,
      data: {
        expression: expression
      }
    });
  }

  removeWatchExpression(index) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.REMOVE_WATCH_EXPRESSION,
      data: {
        index: index
      }
    });
  }

  updateWatchExpression(index, newExpression) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_WATCH_EXPRESSION,
      data: {
        newExpression: newExpression,
        index: index
      }
    });
  }

  openSourceLocation(sourceURL, lineNumber) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.OPEN_SOURCE_LOCATION,
      data: {
        sourceURL: sourceURL,
        lineNumber: lineNumber
      }
    });
  }

  /**
   * `actionId` is a debugger action understood by Chrome's `WebInspector.ActionRegistry`.
   */
  triggerDebuggerAction(actionId) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TRIGGER_DEBUGGER_ACTION,
      data: {
        actionId: actionId
      }
    });
  }

  updateCallstack(callstack) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_CALLSTACK,
      data: {
        callstack: callstack
      }
    });
  }

  setSelectedCallFrameLine(options) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_SELECTED_CALLFRAME_LINE,
      data: {
        options: options
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
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ADD_BREAKPOINT,
      data: {
        path: path,
        line: line
      }
    });
  }

  updateBreakpointEnabled(breakpointId, enabled) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_BREAKPOINT_ENABLED,
      data: {
        breakpointId: breakpointId,
        enabled: enabled
      }
    });
  }

  updateBreakpointCondition(breakpointId, condition) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_BREAKPOINT_CONDITION,
      data: {
        breakpointId: breakpointId,
        condition: condition
      }
    });
  }

  deleteBreakpoint(path, line) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DELETE_BREAKPOINT,
      data: {
        path: path,
        line: line
      }
    });
  }

  deleteAllBreakpoints() {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DELETE_ALL_BREAKPOINTS,
      data: {}
    });
  }

  toggleBreakpoint(path, line) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TOGGLE_BREAKPOINT,
      data: {
        path: path,
        line: line
      }
    });
  }

  deleteBreakpointIPC(path, line) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DELETE_BREAKPOINT_IPC,
      data: {
        path: path,
        line: line
      }
    });
  }

  bindBreakpointIPC(path, line, condition, enabled) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.BIND_BREAKPOINT_IPC,
      data: {
        path: path,
        line: line,
        condition: condition,
        enabled: enabled
      }
    });
  }

  togglePauseOnException(pauseOnException) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TOGGLE_PAUSE_ON_EXCEPTION,
      data: pauseOnException
    });
  }

  togglePauseOnCaughtException(pauseOnCaughtException) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TOGGLE_PAUSE_ON_CAUGHT_EXCEPTION,
      data: pauseOnCaughtException
    });
  }

  toggleSingleThreadStepping(singleThreadStepping) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TOGGLE_SINGLE_THREAD_STEPPING,
      data: singleThreadStepping
    });
  }

  updateLocals(locals) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_LOCALS,
      data: {
        locals: locals
      }
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
        threadData: threadData
      }
    });
  }

  updateThread(thread) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_THREAD,
      data: {
        thread: thread
      }
    });
  }

  updateStopThread(id) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_STOP_THREAD,
      data: {
        id: id
      }
    });
  }

  notifyThreadSwitch(sourceURL, lineNumber, message) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.NOTIFY_THREAD_SWITCH,
      data: {
        sourceURL: sourceURL,
        lineNumber: lineNumber,
        message: message
      }
    });
  }

  receiveExpressionEvaluationResponse(id, response) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.RECEIVED_EXPRESSION_EVALUATION_RESPONSE,
      data: {
        id: id,
        response: response
      }
    });
  }

  receiveGetPropertiesResponse(id, response) {
    this._dispatcher.dispatch({
      actionType: (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.RECEIVED_GET_PROPERTIES_RESPONSE,
      data: {
        id: id,
        response: response
      }
    });
  }

  _handleDebugModeStart() {
    // Open the console window if it's not already opened.
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:toggle', { visible: true });
  }
};


module.exports = DebuggerActions;