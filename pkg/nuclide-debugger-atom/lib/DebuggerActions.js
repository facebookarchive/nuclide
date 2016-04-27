var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _AnalyticsHelper = require('./AnalyticsHelper');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _DebuggerStore = require('./DebuggerStore');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var Constants = require('./Constants');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

function track() {
  var trackFunc = require('../../nuclide-analytics').track;

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  trackFunc.apply(null, args);
}

var AnalyticsEvents = Object.freeze({
  DEBUGGER_START: 'debugger-start',
  DEBUGGER_START_FAIL: 'debugger-start-fail',
  DEBUGGER_STOP: 'debugger-stop'
});

/**
 * Flux style action creator for actions that affect the debugger.
 */

var DebuggerActions = (function () {
  function DebuggerActions(dispatcher, store) {
    _classCallCheck(this, DebuggerActions);

    this._disposables = new CompositeDisposable();
    this._dispatcher = dispatcher;
    this._store = store;
  }

  _createClass(DebuggerActions, [{
    key: 'startDebugging',
    value: _asyncToGenerator(function* (processInfo) {
      track(AnalyticsEvents.DEBUGGER_START, {
        serviceName: processInfo.getServiceName()
      });
      (0, _AnalyticsHelper.beginTimerTracking)('nuclide-debugger-atom:startDebugging');

      this.stopDebugging(); // stop existing session.
      this.setError(null);
      this._handleDebugModeStart();
      this._setDebuggerMode(_DebuggerStore.DebuggerMode.STARTING);
      try {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
        var debuggerInstance = yield processInfo.debug();
        yield this._waitForChromeConnection(debuggerInstance);
      } catch (err) {
        (0, _AnalyticsHelper.failTimerTracking)(err);
        track(AnalyticsEvents.DEBUGGER_START_FAIL, {});
        this.setError('Failed to start debugger process: ' + err);
        this.stopDebugging();
      }
    })
  }, {
    key: '_setDebuggerMode',
    value: function _setDebuggerMode(debuggerMode) {
      this._dispatcher.dispatch({
        actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
        data: debuggerMode
      });
    }
  }, {
    key: '_waitForChromeConnection',
    value: _asyncToGenerator(function* (debuggerInstance) {
      this._setDebuggerInstance(debuggerInstance);
      if (debuggerInstance.onSessionEnd != null) {
        var handler = this._handleSessionEnd.bind(this, debuggerInstance);
        (0, _assert2['default'])(debuggerInstance.onSessionEnd);
        this._disposables.add(debuggerInstance.onSessionEnd(handler));
      }

      var socketAddr = yield debuggerInstance.getWebsocketAddress();
      (0, _AnalyticsHelper.endTimerTracking)();

      this._dispatcher.dispatch({
        actionType: Constants.Actions.SET_PROCESS_SOCKET,
        data: socketAddr
      });
      // Debugger finished initializing and entered debug mode.
      this._setDebuggerMode(_DebuggerStore.DebuggerMode.RUNNING);

      // Wait for 'resume' event from Bridge.js to guarantee we've passed the loader breakpoint.
      yield this._store.loaderBreakpointResumePromise;
    })
  }, {
    key: '_setDebuggerInstance',
    value: function _setDebuggerInstance(debuggerInstance) {
      this._dispatcher.dispatch({
        actionType: Constants.Actions.SET_DEBUGGER_INSTANCE,
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
      if (this._store.getDebuggerMode() === _DebuggerStore.DebuggerMode.STOPPING) {
        return;
      }
      this._setDebuggerMode(_DebuggerStore.DebuggerMode.STOPPING);
      var debuggerInstance = this._store.getDebuggerInstance();
      if (debuggerInstance != null) {
        debuggerInstance.dispose();
        this._setDebuggerInstance(null);
      }
      this._dispatcher.dispatch({
        actionType: Constants.Actions.SET_PROCESS_SOCKET,
        data: null
      });
      this._setDebuggerMode(_DebuggerStore.DebuggerMode.STOPPED);
      track(AnalyticsEvents.DEBUGGER_STOP);
      (0, _AnalyticsHelper.endTimerTracking)();

      (0, _assert2['default'])(this._store.getDebuggerInstance() === null);
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:hide');
    }
  }, {
    key: 'addService',
    value: function addService(service) {
      this._dispatcher.dispatch({
        actionType: Constants.Actions.ADD_SERVICE,
        data: service
      });
    }
  }, {
    key: 'removeService',
    value: function removeService(service) {
      this._dispatcher.dispatch({
        actionType: Constants.Actions.REMOVE_SERVICE,
        data: service
      });
    }
  }, {
    key: 'addDebuggerProvider',
    value: function addDebuggerProvider(provider) {
      this._dispatcher.dispatch({
        actionType: Constants.Actions.ADD_DEBUGGER_PROVIDER,
        data: provider
      });
    }
  }, {
    key: 'removeDebuggerProvider',
    value: function removeDebuggerProvider(provider) {
      this._dispatcher.dispatch({
        actionType: Constants.Actions.REMOVE_DEBUGGER_PROVIDER,
        data: provider
      });
    }
  }, {
    key: 'addEvaluationExpressionProvider',
    value: function addEvaluationExpressionProvider(provider) {
      this._dispatcher.dispatch({
        actionType: Constants.Actions.ADD_EVALUATION_EXPRESSION_PROVIDER,
        data: provider
      });
    }
  }, {
    key: 'removeEvaluationExpressionProvider',
    value: function removeEvaluationExpressionProvider(provider) {
      this._dispatcher.dispatch({
        actionType: Constants.Actions.REMOVE_EVALUATION_EXPRESSION_PROVIDER,
        data: provider
      });
    }
  }, {
    key: 'setError',
    value: function setError(error) {
      if (error != null) {
        require('../../nuclide-logging').getLogger().error(error);
      }
      this._dispatcher.dispatch({
        actionType: Constants.Actions.SET_ERROR,
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
        actionType: Constants.Actions.SET_PROCESS_SOCKET,
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
        actionType: Constants.Actions.UPDATE_CONNECTIONS,
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
        return _nuclideRemoteUri2['default'].isRemote(path);
      }).map(function (remotePath) {
        var _remoteUri$parseRemoteUri = _nuclideRemoteUri2['default'].parseRemoteUri(remotePath);

        var hostname = _remoteUri$parseRemoteUri.hostname;
        var port = _remoteUri$parseRemoteUri.port;

        return _nuclideRemoteUri2['default'].createRemoteUri(hostname, Number(port), '/');
      }).filter(function (path, index, inputArray) {
        return inputArray.indexOf(path) === index;
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      (0, _AnalyticsHelper.endTimerTracking)();
      this._disposables.dispose();
    }
  }, {
    key: '_handleDebugModeStart',
    value: function _handleDebugModeStart() {
      // Open the console window if it's not already opened.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');
    }
  }]);

  return DebuggerActions;
})();

module.exports = DebuggerActions;