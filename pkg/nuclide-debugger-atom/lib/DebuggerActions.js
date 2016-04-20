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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyQWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OzsrQkFhc0UsbUJBQW1COztnQ0FDbkUsMEJBQTBCOzs7O3NCQUMxQixRQUFROzs7OzZCQUNILGlCQUFpQjs7Ozs7Ozs7OztBQUw1QyxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7O2VBQ1gsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBdEMsbUJBQW1CLFlBQW5CLG1CQUFtQjs7QUFnQjFCLFNBQVMsS0FBSyxHQUFlO0FBQzNCLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEtBQUssQ0FBQzs7b0NBRDNDLElBQUk7QUFBSixRQUFJOzs7QUFFcEIsV0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDN0I7O0FBRUQsSUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNwQyxnQkFBYyxFQUFRLGdCQUFnQjtBQUN0QyxxQkFBbUIsRUFBRyxxQkFBcUI7QUFDM0MsZUFBYSxFQUFTLGVBQWU7Q0FDdEMsQ0FBQyxDQUFDOzs7Ozs7SUFLRyxlQUFlO0FBS1IsV0FMUCxlQUFlLENBS1AsVUFBc0IsRUFBRSxLQUFvQixFQUFFOzBCQUx0RCxlQUFlOztBQU1qQixRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUM5QyxRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUM5QixRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztHQUNyQjs7ZUFURyxlQUFlOzs2QkFXQyxXQUFDLFdBQW9DLEVBQWlCO0FBQ3hFLFdBQUssQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFO0FBQ3BDLG1CQUFXLEVBQUUsV0FBVyxDQUFDLGNBQWMsRUFBRTtPQUMxQyxDQUFDLENBQUM7QUFDSCwrQ0FBbUIsc0NBQXNDLENBQUMsQ0FBQzs7QUFFM0QsVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEIsVUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixDQUFDLDRCQUFhLFFBQVEsQ0FBQyxDQUFDO0FBQzdDLFVBQUk7QUFDRixZQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztBQUNwRixZQUFNLGdCQUFnQixHQUFHLE1BQU0sV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ25ELGNBQU0sSUFBSSxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDLENBQUM7T0FDdkQsQ0FBQyxPQUFPLEdBQUcsRUFBRTtBQUNaLGdEQUFrQixHQUFHLENBQUMsQ0FBQztBQUN2QixhQUFLLENBQUMsZUFBZSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQy9DLFlBQUksQ0FBQyxRQUFRLENBQUMsb0NBQW9DLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDMUQsWUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO09BQ3RCO0tBQ0Y7OztXQUVlLDBCQUFDLFlBQThCLEVBQVE7QUFDckQsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLG9CQUFvQjtBQUNsRCxZQUFJLEVBQUUsWUFBWTtPQUNuQixDQUFDLENBQUM7S0FDSjs7OzZCQUU2QixXQUFDLGdCQUFrQyxFQUFpQjtBQUNoRixVQUFJLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUM1QyxVQUFJLGdCQUFnQixDQUFDLFlBQVksSUFBSSxJQUFJLEVBQUU7QUFDekMsWUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUNwRSxpQ0FBVSxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN6QyxZQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztPQUMvRDs7QUFFRCxVQUFNLFVBQVUsR0FBRyxNQUFNLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDaEUsOENBQWtCLENBQUM7O0FBRW5CLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0I7QUFDaEQsWUFBSSxFQUFFLFVBQVU7T0FDakIsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyw0QkFBYSxPQUFPLENBQUMsQ0FBQzs7O0FBRzVDLFlBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyw2QkFBNkIsQ0FBQztLQUNqRDs7O1dBRW1CLDhCQUFDLGdCQUFtQyxFQUFRO0FBQzlELFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUI7QUFDbkQsWUFBSSxFQUFFLGdCQUFnQjtPQUN2QixDQUFDLENBQUM7S0FDSjs7O1dBRWdCLDJCQUFDLGdCQUFrQyxFQUFRO0FBQzFELFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLGdCQUFnQixFQUFFO0FBQzFELFlBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztPQUN0QixNQUFNOzs7O09BSU47S0FDRjs7O1dBRVkseUJBQUc7QUFDZCxVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEtBQUssNEJBQWEsUUFBUSxFQUFFO0FBQzNELGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyw0QkFBYSxRQUFRLENBQUMsQ0FBQztBQUM3QyxVQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUMzRCxVQUFJLGdCQUFnQixJQUFJLElBQUksRUFBRTtBQUM1Qix3QkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMzQixZQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDakM7QUFDRCxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCO0FBQ2hELFlBQUksRUFBRSxJQUFJO09BQ1gsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLGdCQUFnQixDQUFDLDRCQUFhLE9BQU8sQ0FBQyxDQUFDO0FBQzVDLFdBQUssQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckMsOENBQWtCLENBQUM7O0FBRW5CLCtCQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQztBQUN0RCxVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztLQUNyRjs7O1dBRVMsb0JBQUMsT0FBaUMsRUFBRTtBQUM1QyxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVztBQUN6QyxZQUFJLEVBQUUsT0FBTztPQUNkLENBQUMsQ0FBQztLQUNKOzs7V0FFWSx1QkFBQyxPQUFpQyxFQUFFO0FBQy9DLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxjQUFjO0FBQzVDLFlBQUksRUFBRSxPQUFPO09BQ2QsQ0FBQyxDQUFDO0tBQ0o7OztXQUVrQiw2QkFBQyxRQUFpQyxFQUFFO0FBQ3JELFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUI7QUFDbkQsWUFBSSxFQUFFLFFBQVE7T0FDZixDQUFDLENBQUM7S0FDSjs7O1dBRXFCLGdDQUFDLFFBQWlDLEVBQUU7QUFDeEQsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLHdCQUF3QjtBQUN0RCxZQUFJLEVBQUUsUUFBUTtPQUNmLENBQUMsQ0FBQztLQUNKOzs7V0FFOEIseUNBQUMsUUFBNkMsRUFBRTtBQUM3RSxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsa0NBQWtDO0FBQ2hFLFlBQUksRUFBRSxRQUFRO09BQ2YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVpQyw0Q0FBQyxRQUE2QyxFQUFFO0FBQ2hGLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxxQ0FBcUM7QUFDbkUsWUFBSSxFQUFFLFFBQVE7T0FDZixDQUFDLENBQUM7S0FDSjs7O1dBRU8sa0JBQUMsS0FBYyxFQUFFO0FBQ3ZCLFVBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixlQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDM0Q7QUFDRCxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUztBQUN2QyxZQUFJLEVBQUUsS0FBSztPQUNaLENBQUMsQ0FBQztLQUNKOzs7Ozs7Ozs7O1dBUWlCLDRCQUFDLFVBQW1CLEVBQUU7QUFDdEMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLGtCQUFrQjtBQUNoRCxZQUFJLEVBQUUsVUFBVTtPQUNqQixDQUFDLENBQUM7S0FDSjs7Ozs7Ozs7V0FNZ0IsNkJBQVM7O0FBRXhCLFVBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDOztBQUVqRCxpQkFBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQixVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCO0FBQ2hELFlBQUksRUFBRSxXQUFXO09BQ2xCLENBQUMsQ0FBQztLQUNKOzs7Ozs7O1dBS29CLGlDQUFrQjs7QUFFckMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUM1QyxlQUFPLDhCQUFVLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNqQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsVUFBVSxFQUFJO3dDQUNNLDhCQUFVLGNBQWMsQ0FBQyxVQUFVLENBQUM7O1lBQXRELFFBQVEsNkJBQVIsUUFBUTtZQUFFLElBQUksNkJBQUosSUFBSTs7QUFDckIsZUFBTyw4QkFBVSxlQUFlLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztPQUMvRCxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUs7QUFDckMsZUFBTyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQztPQUMzQyxDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUiw4Q0FBa0IsQ0FBQztBQUNuQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFb0IsaUNBQVM7O0FBRTVCLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0tBQ3BGOzs7U0E1TUcsZUFBZTs7O0FBK01yQixNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJEZWJ1Z2dlckFjdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBDb25zdGFudHMgPSByZXF1aXJlKCcuL0NvbnN0YW50cycpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuaW1wb3J0IHtiZWdpblRpbWVyVHJhY2tpbmcsIGZhaWxUaW1lclRyYWNraW5nLCBlbmRUaW1lclRyYWNraW5nfSBmcm9tICcuL0FuYWx5dGljc0hlbHBlcic7XG5pbXBvcnQgcmVtb3RlVXJpIGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0RlYnVnZ2VyTW9kZX0gZnJvbSAnLi9EZWJ1Z2dlclN0b3JlJztcblxuaW1wb3J0IHR5cGUge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuaW1wb3J0IHR5cGUge1xuICBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UsXG4gIE51Y2xpZGVEZWJ1Z2dlclByb3ZpZGVyLFxuICBOdWNsaWRlRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcixcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1pbnRlcmZhY2VzL3NlcnZpY2UnO1xuaW1wb3J0IHR5cGUge0RlYnVnZ2VyU3RvcmUsIERlYnVnZ2VyTW9kZVR5cGV9IGZyb20gJy4vRGVidWdnZXJTdG9yZSc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlclByb2Nlc3NJbmZvVHlwZSBmcm9tICcuL0RlYnVnZ2VyUHJvY2Vzc0luZm8nO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJJbnN0YW5jZSBmcm9tICcuL0RlYnVnZ2VySW5zdGFuY2UnO1xuXG5mdW5jdGlvbiB0cmFjayguLi5hcmdzOiBhbnkpIHtcbiAgY29uc3QgdHJhY2tGdW5jID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnKS50cmFjaztcbiAgdHJhY2tGdW5jLmFwcGx5KG51bGwsIGFyZ3MpO1xufVxuXG5jb25zdCBBbmFseXRpY3NFdmVudHMgPSBPYmplY3QuZnJlZXplKHtcbiAgREVCVUdHRVJfU1RBUlQ6ICAgICAgICdkZWJ1Z2dlci1zdGFydCcsXG4gIERFQlVHR0VSX1NUQVJUX0ZBSUw6ICAnZGVidWdnZXItc3RhcnQtZmFpbCcsXG4gIERFQlVHR0VSX1NUT1A6ICAgICAgICAnZGVidWdnZXItc3RvcCcsXG59KTtcblxuLyoqXG4gKiBGbHV4IHN0eWxlIGFjdGlvbiBjcmVhdG9yIGZvciBhY3Rpb25zIHRoYXQgYWZmZWN0IHRoZSBkZWJ1Z2dlci5cbiAqL1xuY2xhc3MgRGVidWdnZXJBY3Rpb25zIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX3N0b3JlOiBEZWJ1Z2dlclN0b3JlO1xuXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIHN0b3JlOiBEZWJ1Z2dlclN0b3JlKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIHRoaXMuX3N0b3JlID0gc3RvcmU7XG4gIH1cblxuICBhc3luYyBzdGFydERlYnVnZ2luZyhwcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mb1R5cGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cmFjayhBbmFseXRpY3NFdmVudHMuREVCVUdHRVJfU1RBUlQsIHtcbiAgICAgIHNlcnZpY2VOYW1lOiBwcm9jZXNzSW5mby5nZXRTZXJ2aWNlTmFtZSgpLFxuICAgIH0pO1xuICAgIGJlZ2luVGltZXJUcmFja2luZygnbnVjbGlkZS1kZWJ1Z2dlci1hdG9tOnN0YXJ0RGVidWdnaW5nJyk7XG5cbiAgICB0aGlzLnN0b3BEZWJ1Z2dpbmcoKTsgLy8gc3RvcCBleGlzdGluZyBzZXNzaW9uLlxuICAgIHRoaXMuc2V0RXJyb3IobnVsbCk7XG4gICAgdGhpcy5faGFuZGxlRGVidWdNb2RlU3RhcnQoKTtcbiAgICB0aGlzLl9zZXREZWJ1Z2dlck1vZGUoRGVidWdnZXJNb2RlLlNUQVJUSU5HKTtcbiAgICB0cnkge1xuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnbnVjbGlkZS1kZWJ1Z2dlcjpzaG93Jyk7XG4gICAgICBjb25zdCBkZWJ1Z2dlckluc3RhbmNlID0gYXdhaXQgcHJvY2Vzc0luZm8uZGVidWcoKTtcbiAgICAgIGF3YWl0IHRoaXMuX3dhaXRGb3JDaHJvbWVDb25uZWN0aW9uKGRlYnVnZ2VySW5zdGFuY2UpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZmFpbFRpbWVyVHJhY2tpbmcoZXJyKTtcbiAgICAgIHRyYWNrKEFuYWx5dGljc0V2ZW50cy5ERUJVR0dFUl9TVEFSVF9GQUlMLCB7fSk7XG4gICAgICB0aGlzLnNldEVycm9yKCdGYWlsZWQgdG8gc3RhcnQgZGVidWdnZXIgcHJvY2VzczogJyArIGVycik7XG4gICAgICB0aGlzLnN0b3BEZWJ1Z2dpbmcoKTtcbiAgICB9XG4gIH1cblxuICBfc2V0RGVidWdnZXJNb2RlKGRlYnVnZ2VyTW9kZTogRGVidWdnZXJNb2RlVHlwZSk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuREVCVUdHRVJfTU9ERV9DSEFOR0UsXG4gICAgICBkYXRhOiBkZWJ1Z2dlck1vZGUsXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfd2FpdEZvckNocm9tZUNvbm5lY3Rpb24oZGVidWdnZXJJbnN0YW5jZTogRGVidWdnZXJJbnN0YW5jZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX3NldERlYnVnZ2VySW5zdGFuY2UoZGVidWdnZXJJbnN0YW5jZSk7XG4gICAgaWYgKGRlYnVnZ2VySW5zdGFuY2Uub25TZXNzaW9uRW5kICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9oYW5kbGVTZXNzaW9uRW5kLmJpbmQodGhpcywgZGVidWdnZXJJbnN0YW5jZSk7XG4gICAgICBpbnZhcmlhbnQoZGVidWdnZXJJbnN0YW5jZS5vblNlc3Npb25FbmQpO1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGRlYnVnZ2VySW5zdGFuY2Uub25TZXNzaW9uRW5kKGhhbmRsZXIpKTtcbiAgICB9XG5cbiAgICBjb25zdCBzb2NrZXRBZGRyID0gYXdhaXQgZGVidWdnZXJJbnN0YW5jZS5nZXRXZWJzb2NrZXRBZGRyZXNzKCk7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuXG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBzb2NrZXRBZGRyLFxuICAgIH0pO1xuICAgIC8vIERlYnVnZ2VyIGZpbmlzaGVkIGluaXRpYWxpemluZyBhbmQgZW50ZXJlZCBkZWJ1ZyBtb2RlLlxuICAgIHRoaXMuX3NldERlYnVnZ2VyTW9kZShEZWJ1Z2dlck1vZGUuUlVOTklORyk7XG5cbiAgICAvLyBXYWl0IGZvciAncmVzdW1lJyBldmVudCBmcm9tIEJyaWRnZS5qcyB0byBndWFyYW50ZWUgd2UndmUgcGFzc2VkIHRoZSBsb2FkZXIgYnJlYWtwb2ludC5cbiAgICBhd2FpdCB0aGlzLl9zdG9yZS5sb2FkZXJCcmVha3BvaW50UmVzdW1lUHJvbWlzZTtcbiAgfVxuXG4gIF9zZXREZWJ1Z2dlckluc3RhbmNlKGRlYnVnZ2VySW5zdGFuY2U6ID9EZWJ1Z2dlckluc3RhbmNlKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfREVCVUdHRVJfSU5TVEFOQ0UsXG4gICAgICBkYXRhOiBkZWJ1Z2dlckluc3RhbmNlLFxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZVNlc3Npb25FbmQoZGVidWdnZXJJbnN0YW5jZTogRGVidWdnZXJJbnN0YW5jZSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5nZXREZWJ1Z2dlckluc3RhbmNlKCkgPT09IGRlYnVnZ2VySW5zdGFuY2UpIHtcbiAgICAgIHRoaXMuc3RvcERlYnVnZ2luZygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEbyBub3RoaW5nLCBiZWNhdXNlIGVpdGhlcjpcbiAgICAgIC8vIDEuIEFub3RoZXIgRGVidWdnZXJJbnN0bmFjZSBpcyBhbGl2ZS4gb3JcbiAgICAgIC8vIDIuIERlYnVnZ2VySW5zdGFuY2UgaGFzIGJlZW4gZGlzcG9zZWQuXG4gICAgfVxuICB9XG5cbiAgc3RvcERlYnVnZ2luZygpIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuZ2V0RGVidWdnZXJNb2RlKCkgPT09IERlYnVnZ2VyTW9kZS5TVE9QUElORykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9zZXREZWJ1Z2dlck1vZGUoRGVidWdnZXJNb2RlLlNUT1BQSU5HKTtcbiAgICBjb25zdCBkZWJ1Z2dlckluc3RhbmNlID0gdGhpcy5fc3RvcmUuZ2V0RGVidWdnZXJJbnN0YW5jZSgpO1xuICAgIGlmIChkZWJ1Z2dlckluc3RhbmNlICE9IG51bGwpIHtcbiAgICAgIGRlYnVnZ2VySW5zdGFuY2UuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fc2V0RGVidWdnZXJJbnN0YW5jZShudWxsKTtcbiAgICB9XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBudWxsLFxuICAgIH0pO1xuICAgIHRoaXMuX3NldERlYnVnZ2VyTW9kZShEZWJ1Z2dlck1vZGUuU1RPUFBFRCk7XG4gICAgdHJhY2soQW5hbHl0aWNzRXZlbnRzLkRFQlVHR0VSX1NUT1ApO1xuICAgIGVuZFRpbWVyVHJhY2tpbmcoKTtcblxuICAgIGludmFyaWFudCh0aGlzLl9zdG9yZS5nZXREZWJ1Z2dlckluc3RhbmNlKCkgPT09IG51bGwpO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ251Y2xpZGUtZGVidWdnZXI6aGlkZScpO1xuICB9XG5cbiAgYWRkU2VydmljZShzZXJ2aWNlOiBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkFERF9TRVJWSUNFLFxuICAgICAgZGF0YTogc2VydmljZSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZVNlcnZpY2Uoc2VydmljZTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5SRU1PVkVfU0VSVklDRSxcbiAgICAgIGRhdGE6IHNlcnZpY2UsXG4gICAgfSk7XG4gIH1cblxuICBhZGREZWJ1Z2dlclByb3ZpZGVyKHByb3ZpZGVyOiBOdWNsaWRlRGVidWdnZXJQcm92aWRlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuQUREX0RFQlVHR0VSX1BST1ZJREVSLFxuICAgICAgZGF0YTogcHJvdmlkZXIsXG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVEZWJ1Z2dlclByb3ZpZGVyKHByb3ZpZGVyOiBOdWNsaWRlRGVidWdnZXJQcm92aWRlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuUkVNT1ZFX0RFQlVHR0VSX1BST1ZJREVSLFxuICAgICAgZGF0YTogcHJvdmlkZXIsXG4gICAgfSk7XG4gIH1cblxuICBhZGRFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVyKHByb3ZpZGVyOiBOdWNsaWRlRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuQUREX0VWQUxVQVRJT05fRVhQUkVTU0lPTl9QUk9WSURFUixcbiAgICAgIGRhdGE6IHByb3ZpZGVyLFxuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcihwcm92aWRlcjogTnVjbGlkZUV2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlJFTU9WRV9FVkFMVUFUSU9OX0VYUFJFU1NJT05fUFJPVklERVIsXG4gICAgICBkYXRhOiBwcm92aWRlcixcbiAgICB9KTtcbiAgfVxuXG4gIHNldEVycm9yKGVycm9yOiA/c3RyaW5nKSB7XG4gICAgaWYgKGVycm9yICE9IG51bGwpIHtcbiAgICAgIHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpLmVycm9yKGVycm9yKTtcbiAgICB9XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfRVJST1IsXG4gICAgICBkYXRhOiBlcnJvcixcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IGZvciBkZWJ1Z2dpbmcuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIHVzZWQgdG8gc2V0IGFuIGV4aXN0aW5nIHNvY2tldCwgYnlwYXNzaW5nIG5vcm1hbCBVSSBmbG93IHRvXG4gICAqIGltcHJvdmUgaXRlcmF0aW9uIHNwZWVkIGZvciBkZXZlbG9wbWVudC5cbiAgICovXG4gIGZvcmNlUHJvY2Vzc1NvY2tldChzb2NrZXRBZGRyOiA/c3RyaW5nKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBzb2NrZXRBZGRyLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgZm9yIGdldHRpbmcgcmVmcmVzaGVkIGNvbm5lY3Rpb25zLlxuICAgKiBUT0RPOiByZWZyZXNoIGNvbm5lY3Rpb25zIHdoZW4gbmV3IGRpcmVjdG9yaWVzIGFyZSByZW1vdmVkL2FkZGVkIGluIGZpbGUtdHJlZS5cbiAgICovXG4gIHVwZGF0ZUNvbm5lY3Rpb25zKCk6IHZvaWQge1xuXG4gICAgY29uc3QgY29ubmVjdGlvbnMgPSB0aGlzLl9nZXRSZW1vdGVDb25uZWN0aW9ucygpO1xuICAgIC8vIEFsd2F5cyBoYXZlIG9uZSBzaW5nbGUgbG9jYWwgY29ubmVjdGlvbi5cbiAgICBjb25uZWN0aW9ucy5wdXNoKCdsb2NhbCcpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuVVBEQVRFX0NPTk5FQ1RJT05TLFxuICAgICAgZGF0YTogY29ubmVjdGlvbnMsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHJlbW90ZSBjb25uZWN0aW9ucyB3aXRob3V0IGR1cGxpY2F0aW9uLlxuICAgKi9cbiAgX2dldFJlbW90ZUNvbm5lY3Rpb25zKCk6IEFycmF5PHN0cmluZz4ge1xuICAgIC8vIFRPRE86IG1vdmUgdGhpcyBsb2dpYyBpbnRvIFJlbW90ZUNvbm5lY3Rpb24gcGFja2FnZS5cbiAgICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkuZmlsdGVyKHBhdGggPT4ge1xuICAgICAgcmV0dXJuIHJlbW90ZVVyaS5pc1JlbW90ZShwYXRoKTtcbiAgICB9KS5tYXAocmVtb3RlUGF0aCA9PiB7XG4gICAgICBjb25zdCB7aG9zdG5hbWUsIHBvcnR9ID0gcmVtb3RlVXJpLnBhcnNlUmVtb3RlVXJpKHJlbW90ZVBhdGgpO1xuICAgICAgcmV0dXJuIHJlbW90ZVVyaS5jcmVhdGVSZW1vdGVVcmkoaG9zdG5hbWUsIE51bWJlcihwb3J0KSwgJy8nKTtcbiAgICB9KS5maWx0ZXIoKHBhdGgsIGluZGV4LCBpbnB1dEFycmF5KSA9PiB7XG4gICAgICByZXR1cm4gaW5wdXRBcnJheS5pbmRleE9mKHBhdGgpID09PSBpbmRleDtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9oYW5kbGVEZWJ1Z01vZGVTdGFydCgpOiB2b2lkIHtcbiAgICAvLyBPcGVuIHRoZSBjb25zb2xlIHdpbmRvdyBpZiBpdCdzIG5vdCBhbHJlYWR5IG9wZW5lZC5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdudWNsaWRlLWNvbnNvbGU6c2hvdycpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGVidWdnZXJBY3Rpb25zO1xuIl19