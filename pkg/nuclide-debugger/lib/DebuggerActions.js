var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _Constants2;

function _Constants() {
  return _Constants2 = _interopRequireDefault(require('./Constants'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _AnalyticsHelper2;

function _AnalyticsHelper() {
  return _AnalyticsHelper2 = require('./AnalyticsHelper');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _DebuggerStore2;

function _DebuggerStore() {
  return _DebuggerStore2 = require('./DebuggerStore');
}

var _commonsNodePassesGK2;

function _commonsNodePassesGK() {
  return _commonsNodePassesGK2 = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _commonsNodeString2;

function _commonsNodeString() {
  return _commonsNodeString2 = require('../../commons-node/string');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var AnalyticsEvents = Object.freeze({
  DEBUGGER_START: 'debugger-start',
  DEBUGGER_START_FAIL: 'debugger-start-fail',
  DEBUGGER_STOP: 'debugger-stop'
});

var GK_DEBUGGER_REQUEST_WINDOW = 'nuclide_debugger_php_request_window';
var GK_DEBUGGER_THREADS_WINDOW = 'nuclide_debugger_threads_window';
var GK_DEBUGGER_CONSOLE_WINDOW = 'nuclide_debugger_console_window';
var GK_DEBUGGER_SINGLE_THREAD_STEPPING = 'nuclide_debugger_single_thread_stepping';
var GK_DEBUGGER_REQUEST_SENDER = 'nuclide_debugger_request_sender';

/**
 * Flux style action creator for actions that affect the debugger.
 */

var DebuggerActions = (function () {
  function DebuggerActions(dispatcher, store) {
    _classCallCheck(this, DebuggerActions);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._dispatcher = dispatcher;
    this._store = store;
  }

  _createClass(DebuggerActions, [{
    key: 'startDebugging',
    value: _asyncToGenerator(function* (processInfo) {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(AnalyticsEvents.DEBUGGER_START, {
        serviceName: processInfo.getServiceName()
      });
      (0, (_AnalyticsHelper2 || _AnalyticsHelper()).beginTimerTracking)('nuclide-debugger-atom:startDebugging');

      this.stopDebugging(); // stop existing session.
      this.setError(null);
      this._handleDebugModeStart();
      this.setDebuggerMode((_DebuggerStore2 || _DebuggerStore()).DebuggerMode.STARTING);
      try {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
        var debuggerInstance = yield processInfo.debug();
        if (yield (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)(GK_DEBUGGER_CONSOLE_WINDOW)) {
          this._registerConsole();
        }
        var supportThreadsWindow = processInfo.supportThreads() && (yield (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)(GK_DEBUGGER_THREADS_WINDOW)) && (yield this._allowThreadsForPhp(processInfo));
        this._store.getSettings().set('SupportThreadsWindow', supportThreadsWindow);
        var singleThreadStepping = processInfo.supportSingleThreadStepping();
        if (singleThreadStepping && (yield (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)(GK_DEBUGGER_SINGLE_THREAD_STEPPING))) {
          this._store.getSettings().set('SingleThreadStepping', singleThreadStepping);
          var singleThreadSteppingEnabled = processInfo.singleThreadSteppingEnabled();
          this.toggleSingleThreadStepping(singleThreadSteppingEnabled);
        }
        if (processInfo.getServiceName() !== 'hhvm' || (yield (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)(GK_DEBUGGER_REQUEST_SENDER))) {
          var customControlButtons = processInfo.customControlButtons();
          if (customControlButtons.length > 0) {
            this.addControlButtons(customControlButtons);
          }
        }
        yield this._waitForChromeConnection(debuggerInstance);
      } catch (err) {
        (0, (_AnalyticsHelper2 || _AnalyticsHelper()).failTimerTracking)(err);
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(AnalyticsEvents.DEBUGGER_START_FAIL, {});
        var errorMessage = 'Failed to start debugger process: ' + (0, (_commonsNodeString2 || _commonsNodeString()).stringifyError)(err);
        this.setError(errorMessage);
        atom.notifications.addError(errorMessage);
        this.stopDebugging();
      }
    })
  }, {
    key: '_allowThreadsForPhp',
    value: _asyncToGenerator(function* (processInfo) {
      if (processInfo.getServiceName() === 'hhvm') {
        return yield (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)(GK_DEBUGGER_REQUEST_WINDOW);
      }
      return true;
    })
  }, {
    key: 'setDebuggerMode',
    value: function setDebuggerMode(debuggerMode) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.DEBUGGER_MODE_CHANGE,
        data: debuggerMode
      });
    }
  }, {
    key: '_waitForChromeConnection',
    value: _asyncToGenerator(function* (debuggerInstance) {
      this._setDebuggerInstance(debuggerInstance);
      if (debuggerInstance.onSessionEnd != null) {
        var handler = this._handleSessionEnd.bind(this, debuggerInstance);
        (0, (_assert2 || _assert()).default)(debuggerInstance.onSessionEnd);
        this._disposables.add(debuggerInstance.onSessionEnd(handler));
      }

      var socketAddr = yield debuggerInstance.getWebsocketAddress();
      (0, (_AnalyticsHelper2 || _AnalyticsHelper()).endTimerTracking)();

      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.SET_PROCESS_SOCKET,
        data: socketAddr
      });
      // Debugger finished initializing and entered debug mode.
      this.setDebuggerMode((_DebuggerStore2 || _DebuggerStore()).DebuggerMode.RUNNING);

      // Wait for 'resume' event from Bridge.js to guarantee we've passed the loader breakpoint.
      yield this._store.loaderBreakpointResumePromise;
    })
  }, {
    key: '_setDebuggerInstance',
    value: function _setDebuggerInstance(debuggerInstance) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.SET_DEBUGGER_INSTANCE,
        data: debuggerInstance
      });
    }
  }, {
    key: '_handleSessionEnd',
    value: function _handleSessionEnd(debuggerInstance) {
      if (this._store.getDebuggerInstance() === debuggerInstance) {
        this.stopDebugging();
      } else {
        // Do nothing, because either:
        // 1. Another DebuggerInstnace is alive. or
        // 2. DebuggerInstance has been disposed.
      }
    }
  }, {
    key: 'stopDebugging',
    value: function stopDebugging() {
      if (this._store.getDebuggerMode() === (_DebuggerStore2 || _DebuggerStore()).DebuggerMode.STOPPING) {
        return;
      }
      this.setDebuggerMode((_DebuggerStore2 || _DebuggerStore()).DebuggerMode.STOPPING);
      this._unregisterConsole();
      var debuggerInstance = this._store.getDebuggerInstance();
      if (debuggerInstance != null) {
        debuggerInstance.dispose();
        this._setDebuggerInstance(null);
      }
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.SET_PROCESS_SOCKET,
        data: null
      });
      this.setDebuggerMode((_DebuggerStore2 || _DebuggerStore()).DebuggerMode.STOPPED);
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(AnalyticsEvents.DEBUGGER_STOP);
      (0, (_AnalyticsHelper2 || _AnalyticsHelper()).endTimerTracking)();

      (0, (_assert2 || _assert()).default)(this._store.getDebuggerInstance() === null);
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:hide');
    }
  }, {
    key: '_registerConsole',
    value: function _registerConsole() {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.REGISTER_CONSOLE
      });
    }
  }, {
    key: '_unregisterConsole',
    value: function _unregisterConsole() {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.UNREGISTER_CONSOLE
      });
    }
  }, {
    key: 'addConsoleRegisterFunction',
    value: function addConsoleRegisterFunction(registerExecutor) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.ADD_REGISTER_EXECUTOR,
        data: registerExecutor
      });
    }
  }, {
    key: 'removeConsoleRegisterFunction',
    value: function removeConsoleRegisterFunction(registerExecutor) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.REMOVE_REGISTER_EXECUTOR,
        data: registerExecutor
      });
    }
  }, {
    key: 'addControlButtons',
    value: function addControlButtons(buttons) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.ADD_CUSTOM_CONTROL_BUTTONS,
        data: buttons
      });
    }
  }, {
    key: 'addDebuggerProvider',
    value: function addDebuggerProvider(provider) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.ADD_DEBUGGER_PROVIDER,
        data: provider
      });
    }
  }, {
    key: 'removeDebuggerProvider',
    value: function removeDebuggerProvider(provider) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.REMOVE_DEBUGGER_PROVIDER,
        data: provider
      });
    }
  }, {
    key: 'addEvaluationExpressionProvider',
    value: function addEvaluationExpressionProvider(provider) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.ADD_EVALUATION_EXPRESSION_PROVIDER,
        data: provider
      });
    }
  }, {
    key: 'removeEvaluationExpressionProvider',
    value: function removeEvaluationExpressionProvider(provider) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.REMOVE_EVALUATION_EXPRESSION_PROVIDER,
        data: provider
      });
    }
  }, {
    key: 'setError',
    value: function setError(error) {
      if (error != null) {
        logger.error(error);
      }
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.SET_ERROR,
        data: error
      });
    }

    /**
     * Utility for debugging.
     *
     * This can be used to set an existing socket, bypassing normal UI flow to
     * improve iteration speed for development.
     */
  }, {
    key: 'forceProcessSocket',
    value: function forceProcessSocket(socketAddr) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.SET_PROCESS_SOCKET,
        data: socketAddr
      });
    }

    /**
     * Utility for getting refreshed connections.
     * TODO: refresh connections when new directories are removed/added in file-tree.
     */
  }, {
    key: 'updateConnections',
    value: function updateConnections() {

      var connections = this._getRemoteConnections();
      // Always have one single local connection.
      connections.push('local');
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.UPDATE_CONNECTIONS,
        data: connections
      });
    }

    /**
     * Get remote connections without duplication.
     */
  }, {
    key: '_getRemoteConnections',
    value: function _getRemoteConnections() {
      // TODO: move this logic into RemoteConnection package.
      return atom.project.getPaths().filter(function (path) {
        return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isRemote(path);
      }).map(function (remotePath) {
        var _default$parseRemoteUri = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.parseRemoteUri(remotePath);

        var hostname = _default$parseRemoteUri.hostname;

        return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.createRemoteUri(hostname, '/');
      }).filter(function (path, index, inputArray) {
        return inputArray.indexOf(path) === index;
      });
    }
  }, {
    key: 'addWatchExpression',
    value: function addWatchExpression(expression) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.ADD_WATCH_EXPRESSION,
        data: {
          expression: expression
        }
      });
    }
  }, {
    key: 'removeWatchExpression',
    value: function removeWatchExpression(index) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.REMOVE_WATCH_EXPRESSION,
        data: {
          index: index
        }
      });
    }
  }, {
    key: 'updateWatchExpression',
    value: function updateWatchExpression(index, newExpression) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.UPDATE_WATCH_EXPRESSION,
        data: {
          newExpression: newExpression,
          index: index
        }
      });
    }
  }, {
    key: 'openSourceLocation',
    value: function openSourceLocation(sourceURL, lineNumber) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.OPEN_SOURCE_LOCATION,
        data: {
          sourceURL: sourceURL,
          lineNumber: lineNumber
        }
      });
    }

    /**
     * `actionId` is a debugger action understood by Chrome's `WebInspector.ActionRegistry`.
     */
  }, {
    key: 'triggerDebuggerAction',
    value: function triggerDebuggerAction(actionId) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.TRIGGER_DEBUGGER_ACTION,
        data: {
          actionId: actionId
        }
      });
    }
  }, {
    key: 'updateCallstack',
    value: function updateCallstack(callstack) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.UPDATE_CALLSTACK,
        data: {
          callstack: callstack
        }
      });
    }
  }, {
    key: 'setSelectedCallFrameLine',
    value: function setSelectedCallFrameLine(options) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.SET_SELECTED_CALLFRAME_LINE,
        data: {
          options: options
        }
      });
    }
  }, {
    key: 'clearInterface',
    value: function clearInterface() {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.CLEAR_INTERFACE,
        data: {}
      });
    }
  }, {
    key: 'addBreakpoint',
    value: function addBreakpoint(path, line) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.ADD_BREAKPOINT,
        data: {
          path: path,
          line: line
        }
      });
    }
  }, {
    key: 'updateBreakpointEnabled',
    value: function updateBreakpointEnabled(breakpointId, enabled) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.UPDATE_BREAKPOINT_ENABLED,
        data: {
          breakpointId: breakpointId,
          enabled: enabled
        }
      });
    }
  }, {
    key: 'updateBreakpointCondition',
    value: function updateBreakpointCondition(breakpointId, condition) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.UPDATE_BREAKPOINT_CONDITION,
        data: {
          breakpointId: breakpointId,
          condition: condition
        }
      });
    }
  }, {
    key: 'deleteBreakpoint',
    value: function deleteBreakpoint(path, line) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.DELETE_BREAKPOINT,
        data: {
          path: path,
          line: line
        }
      });
    }
  }, {
    key: 'deleteAllBreakpoints',
    value: function deleteAllBreakpoints() {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.DELETE_ALL_BREAKPOINTS
      });
    }
  }, {
    key: 'toggleBreakpoint',
    value: function toggleBreakpoint(path, line) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.TOGGLE_BREAKPOINT,
        data: {
          path: path,
          line: line
        }
      });
    }
  }, {
    key: 'deleteBreakpointIPC',
    value: function deleteBreakpointIPC(path, line) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.DELETE_BREAKPOINT_IPC,
        data: {
          path: path,
          line: line
        }
      });
    }
  }, {
    key: 'bindBreakpointIPC',
    value: function bindBreakpointIPC(path, line, condition, enabled) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.BIND_BREAKPOINT_IPC,
        data: {
          path: path,
          line: line,
          condition: condition,
          enabled: enabled
        }
      });
    }
  }, {
    key: 'togglePauseOnException',
    value: function togglePauseOnException(pauseOnException) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.TOGGLE_PAUSE_ON_EXCEPTION,
        data: pauseOnException
      });
    }
  }, {
    key: 'togglePauseOnCaughtException',
    value: function togglePauseOnCaughtException(pauseOnCaughtException) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.TOGGLE_PAUSE_ON_CAUGHT_EXCEPTION,
        data: pauseOnCaughtException
      });
    }
  }, {
    key: 'toggleSingleThreadStepping',
    value: function toggleSingleThreadStepping(singleThreadStepping) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.TOGGLE_SINGLE_THREAD_STEPPING,
        data: singleThreadStepping
      });
    }
  }, {
    key: 'updateLocals',
    value: function updateLocals(locals) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.UPDATE_LOCALS,
        data: {
          locals: locals
        }
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      (0, (_AnalyticsHelper2 || _AnalyticsHelper()).endTimerTracking)();
      this._disposables.dispose();
    }
  }, {
    key: 'updateThreads',
    value: function updateThreads(threadData) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.UPDATE_THREADS,
        data: {
          threadData: threadData
        }
      });
    }
  }, {
    key: 'updateThread',
    value: function updateThread(thread) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.UPDATE_THREAD,
        data: {
          thread: thread
        }
      });
    }
  }, {
    key: 'updateStopThread',
    value: function updateStopThread(id) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.UPDATE_STOP_THREAD,
        data: {
          id: id
        }
      });
    }
  }, {
    key: 'notifyThreadSwitch',
    value: function notifyThreadSwitch(sourceURL, lineNumber, message) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.NOTIFY_THREAD_SWITCH,
        data: {
          sourceURL: sourceURL,
          lineNumber: lineNumber,
          message: message
        }
      });
    }
  }, {
    key: 'receiveExpressionEvaluationResponse',
    value: function receiveExpressionEvaluationResponse(id, response) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.RECEIVED_EXPRESSION_EVALUATION_RESPONSE,
        data: {
          id: id,
          response: response
        }
      });
    }
  }, {
    key: 'receiveGetPropertiesResponse',
    value: function receiveGetPropertiesResponse(id, response) {
      this._dispatcher.dispatch({
        actionType: (_Constants2 || _Constants()).default.Actions.RECEIVED_GET_PROPERTIES_RESPONSE,
        data: {
          id: id,
          response: response
        }
      });
    }
  }, {
    key: '_handleDebugModeStart',
    value: function _handleDebugModeStart() {
      // Open the console window if it's not already opened.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:toggle', { visible: true });
    }
  }]);

  return DebuggerActions;
})();

module.exports = DebuggerActions;