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

      this.killDebugger(); // Kill the existing session.
      this.setError(null);
      this._handleDebugModeStart();

      this._dispatcher.dispatch({
        actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
        data: _DebuggerStore.DebuggerMode.STARTING
      });

      try {
        var debugSession = yield processInfo.debug();
        yield this._waitForChromeConnection(debugSession);
      } catch (err) {
        (0, _AnalyticsHelper.failTimerTracking)(err);
        track(AnalyticsEvents.DEBUGGER_START_FAIL, {});
        this.setError('Failed to start debugger process: ' + err);
        this.killDebugger();
      }
    })
  }, {
    key: '_waitForChromeConnection',
    value: _asyncToGenerator(function* (debugSession) {
      this._dispatcher.dispatch({
        actionType: Constants.Actions.SET_DEBUGGER_PROCESS,
        data: debugSession
      });

      if (debugSession.onSessionEnd != null) {
        var handler = this._handleSessionEnd.bind(this);
        (0, _assert2['default'])(debugSession.onSessionEnd);
        this._disposables.add(debugSession.onSessionEnd(handler));
      }

      var socketAddr = yield debugSession.getWebsocketAddress();
      (0, _AnalyticsHelper.endTimerTracking)();

      this._dispatcher.dispatch({
        actionType: Constants.Actions.SET_PROCESS_SOCKET,
        data: socketAddr
      });
      this._dispatcher.dispatch({
        actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
        data: _DebuggerStore.DebuggerMode.RUNNING });
    })
  }, {
    key: '_handleSessionEnd',
    // Debugger finished initializing and entered debug mode.
    value: function _handleSessionEnd() {
      this.killDebugger();
    }
  }, {
    key: 'killDebugger',
    value: function killDebugger() {
      if (this._store.getDebuggerMode() === _DebuggerStore.DebuggerMode.STOPPING) {
        return;
      }

      this._dispatcher.dispatch({
        actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
        data: _DebuggerStore.DebuggerMode.STOPPING
      });
      var debugSession = this._store.getDebuggerProcess();
      if (debugSession != null) {
        debugSession.dispose();
        this._dispatcher.dispatch({
          actionType: Constants.Actions.SET_DEBUGGER_PROCESS,
          data: null
        });
      }
      this._dispatcher.dispatch({
        actionType: Constants.Actions.SET_PROCESS_SOCKET,
        data: null
      });
      this._dispatcher.dispatch({
        actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
        data: _DebuggerStore.DebuggerMode.STOPPED
      });
      track(AnalyticsEvents.DEBUGGER_STOP);
      (0, _AnalyticsHelper.endTimerTracking)();
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
      require('../../nuclide-logging').getLogger().error(error);
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
//# sourceMappingURL=data:application/json;base64,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QVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNqQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsVUFBVSxFQUFJO3dDQUNNLDhCQUFVLGNBQWMsQ0FBQyxVQUFVLENBQUM7O1lBQXRELFFBQVEsNkJBQVIsUUFBUTtZQUFFLElBQUksNkJBQUosSUFBSTs7QUFDckIsZUFBTyw4QkFBVSxlQUFlLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztPQUMvRCxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUs7QUFDckMsZUFBTyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQztPQUMzQyxDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUiw4Q0FBa0IsQ0FBQztBQUNuQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFb0IsaUNBQVM7O0FBRTVCLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0tBQ3BGOzs7U0FyTUcsZUFBZTs7O0FBd01yQixNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJEZWJ1Z2dlckFjdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBDb25zdGFudHMgPSByZXF1aXJlKCcuL0NvbnN0YW50cycpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuaW1wb3J0IHtiZWdpblRpbWVyVHJhY2tpbmcsIGZhaWxUaW1lclRyYWNraW5nLCBlbmRUaW1lclRyYWNraW5nfSBmcm9tICcuL0FuYWx5dGljc0hlbHBlcic7XG5pbXBvcnQgcmVtb3RlVXJpIGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0RlYnVnZ2VyTW9kZX0gZnJvbSAnLi9EZWJ1Z2dlclN0b3JlJztcblxuaW1wb3J0IHR5cGUge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuaW1wb3J0IHR5cGUge1xuICBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UsXG4gIE51Y2xpZGVEZWJ1Z2dlclByb3ZpZGVyLFxuICBOdWNsaWRlRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcixcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1pbnRlcmZhY2VzL3NlcnZpY2UnO1xuaW1wb3J0IHR5cGUge0RlYnVnZ2VyU3RvcmV9IGZyb20gJy4vRGVidWdnZXJTdG9yZSc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlclByb2Nlc3NJbmZvVHlwZSBmcm9tICcuL0RlYnVnZ2VyUHJvY2Vzc0luZm8nO1xuaW1wb3J0IHR5cGUgQnJpZGdlVHlwZSBmcm9tICcuL0JyaWRnZSc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlckluc3RhbmNlIGZyb20gJy4vRGVidWdnZXJJbnN0YW5jZSc7XG5cbmZ1bmN0aW9uIHRyYWNrKC4uLmFyZ3M6IGFueSkge1xuICBjb25zdCB0cmFja0Z1bmMgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWFuYWx5dGljcycpLnRyYWNrO1xuICB0cmFja0Z1bmMuYXBwbHkobnVsbCwgYXJncyk7XG59XG5cbmNvbnN0IEFuYWx5dGljc0V2ZW50cyA9IE9iamVjdC5mcmVlemUoe1xuICBERUJVR0dFUl9TVEFSVDogICAgICAgJ2RlYnVnZ2VyLXN0YXJ0JyxcbiAgREVCVUdHRVJfU1RBUlRfRkFJTDogICdkZWJ1Z2dlci1zdGFydC1mYWlsJyxcbiAgREVCVUdHRVJfU1RPUDogICAgICAgICdkZWJ1Z2dlci1zdG9wJyxcbn0pO1xuXG4vKipcbiAqIEZsdXggc3R5bGUgYWN0aW9uIGNyZWF0b3IgZm9yIGFjdGlvbnMgdGhhdCBhZmZlY3QgdGhlIGRlYnVnZ2VyLlxuICovXG5jbGFzcyBEZWJ1Z2dlckFjdGlvbnMge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfc3RvcmU6IERlYnVnZ2VyU3RvcmU7XG4gIF9icmlkZ2U6IEJyaWRnZVR5cGU7XG5cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlciwgc3RvcmU6IERlYnVnZ2VyU3RvcmUpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yZTtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvVHlwZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyYWNrKEFuYWx5dGljc0V2ZW50cy5ERUJVR0dFUl9TVEFSVCwge1xuICAgICAgc2VydmljZU5hbWU6IHByb2Nlc3NJbmZvLmdldFNlcnZpY2VOYW1lKCksXG4gICAgfSk7XG4gICAgYmVnaW5UaW1lclRyYWNraW5nKCdudWNsaWRlLWRlYnVnZ2VyLWF0b206c3RhcnREZWJ1Z2dpbmcnKTtcblxuICAgIHRoaXMua2lsbERlYnVnZ2VyKCk7IC8vIEtpbGwgdGhlIGV4aXN0aW5nIHNlc3Npb24uXG4gICAgdGhpcy5zZXRFcnJvcihudWxsKTtcbiAgICB0aGlzLl9oYW5kbGVEZWJ1Z01vZGVTdGFydCgpO1xuXG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5ERUJVR0dFUl9NT0RFX0NIQU5HRSxcbiAgICAgIGRhdGE6IERlYnVnZ2VyTW9kZS5TVEFSVElORyxcbiAgICB9KTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBkZWJ1Z1Nlc3Npb24gPSBhd2FpdCBwcm9jZXNzSW5mby5kZWJ1ZygpO1xuICAgICAgYXdhaXQgdGhpcy5fd2FpdEZvckNocm9tZUNvbm5lY3Rpb24oZGVidWdTZXNzaW9uKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGZhaWxUaW1lclRyYWNraW5nKGVycik7XG4gICAgICB0cmFjayhBbmFseXRpY3NFdmVudHMuREVCVUdHRVJfU1RBUlRfRkFJTCwge30pO1xuICAgICAgdGhpcy5zZXRFcnJvcignRmFpbGVkIHRvIHN0YXJ0IGRlYnVnZ2VyIHByb2Nlc3M6ICcgKyBlcnIpO1xuICAgICAgdGhpcy5raWxsRGVidWdnZXIoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfd2FpdEZvckNocm9tZUNvbm5lY3Rpb24oZGVidWdTZXNzaW9uOiBEZWJ1Z2dlckluc3RhbmNlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfREVCVUdHRVJfUFJPQ0VTUyxcbiAgICAgIGRhdGE6IGRlYnVnU2Vzc2lvbixcbiAgICB9KTtcblxuICAgIGlmIChkZWJ1Z1Nlc3Npb24ub25TZXNzaW9uRW5kICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9oYW5kbGVTZXNzaW9uRW5kLmJpbmQodGhpcyk7XG4gICAgICBpbnZhcmlhbnQoZGVidWdTZXNzaW9uLm9uU2Vzc2lvbkVuZCk7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoZGVidWdTZXNzaW9uLm9uU2Vzc2lvbkVuZChoYW5kbGVyKSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc29ja2V0QWRkciA9IGF3YWl0IGRlYnVnU2Vzc2lvbi5nZXRXZWJzb2NrZXRBZGRyZXNzKCk7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuXG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBzb2NrZXRBZGRyLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuREVCVUdHRVJfTU9ERV9DSEFOR0UsXG4gICAgICBkYXRhOiBEZWJ1Z2dlck1vZGUuUlVOTklORywgIC8vIERlYnVnZ2VyIGZpbmlzaGVkIGluaXRpYWxpemluZyBhbmQgZW50ZXJlZCBkZWJ1ZyBtb2RlLlxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZVNlc3Npb25FbmQoKTogdm9pZCB7XG4gICAgdGhpcy5raWxsRGVidWdnZXIoKTtcbiAgfVxuXG4gIGtpbGxEZWJ1Z2dlcigpIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuZ2V0RGVidWdnZXJNb2RlKCkgPT09IERlYnVnZ2VyTW9kZS5TVE9QUElORykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuREVCVUdHRVJfTU9ERV9DSEFOR0UsXG4gICAgICBkYXRhOiBEZWJ1Z2dlck1vZGUuU1RPUFBJTkcsXG4gICAgfSk7XG4gICAgY29uc3QgZGVidWdTZXNzaW9uID0gdGhpcy5fc3RvcmUuZ2V0RGVidWdnZXJQcm9jZXNzKCk7XG4gICAgaWYgKGRlYnVnU2Vzc2lvbiAhPSBudWxsKSB7XG4gICAgICBkZWJ1Z1Nlc3Npb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlNFVF9ERUJVR0dFUl9QUk9DRVNTLFxuICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX1BST0NFU1NfU09DS0VULFxuICAgICAgZGF0YTogbnVsbCxcbiAgICB9KTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkRFQlVHR0VSX01PREVfQ0hBTkdFLFxuICAgICAgZGF0YTogRGVidWdnZXJNb2RlLlNUT1BQRUQsXG4gICAgfSk7XG4gICAgdHJhY2soQW5hbHl0aWNzRXZlbnRzLkRFQlVHR0VSX1NUT1ApO1xuICAgIGVuZFRpbWVyVHJhY2tpbmcoKTtcbiAgfVxuXG4gIGFkZFNlcnZpY2Uoc2VydmljZTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5BRERfU0VSVklDRSxcbiAgICAgIGRhdGE6IHNlcnZpY2UsXG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVTZXJ2aWNlKHNlcnZpY2U6IG51Y2xpZGVfZGVidWdnZXIkU2VydmljZSkge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuUkVNT1ZFX1NFUlZJQ0UsXG4gICAgICBkYXRhOiBzZXJ2aWNlLFxuICAgIH0pO1xuICB9XG5cbiAgYWRkRGVidWdnZXJQcm92aWRlcihwcm92aWRlcjogTnVjbGlkZURlYnVnZ2VyUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkFERF9ERUJVR0dFUl9QUk9WSURFUixcbiAgICAgIGRhdGE6IHByb3ZpZGVyLFxuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlRGVidWdnZXJQcm92aWRlcihwcm92aWRlcjogTnVjbGlkZURlYnVnZ2VyUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlJFTU9WRV9ERUJVR0dFUl9QUk9WSURFUixcbiAgICAgIGRhdGE6IHByb3ZpZGVyLFxuICAgIH0pO1xuICB9XG5cbiAgYWRkRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcihwcm92aWRlcjogTnVjbGlkZUV2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkFERF9FVkFMVUFUSU9OX0VYUFJFU1NJT05fUFJPVklERVIsXG4gICAgICBkYXRhOiBwcm92aWRlcixcbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZUV2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXIocHJvdmlkZXI6IE51Y2xpZGVFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVyKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5SRU1PVkVfRVZBTFVBVElPTl9FWFBSRVNTSU9OX1BST1ZJREVSLFxuICAgICAgZGF0YTogcHJvdmlkZXIsXG4gICAgfSk7XG4gIH1cblxuICBzZXRFcnJvcihlcnJvcjogP3N0cmluZykge1xuICAgIHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpLmVycm9yKGVycm9yKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlNFVF9FUlJPUixcbiAgICAgIGRhdGE6IGVycm9yLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgZm9yIGRlYnVnZ2luZy5cbiAgICpcbiAgICogVGhpcyBjYW4gYmUgdXNlZCB0byBzZXQgYW4gZXhpc3Rpbmcgc29ja2V0LCBieXBhc3Npbmcgbm9ybWFsIFVJIGZsb3cgdG9cbiAgICogaW1wcm92ZSBpdGVyYXRpb24gc3BlZWQgZm9yIGRldmVsb3BtZW50LlxuICAgKi9cbiAgZm9yY2VQcm9jZXNzU29ja2V0KHNvY2tldEFkZHI6ID9zdHJpbmcpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlNFVF9QUk9DRVNTX1NPQ0tFVCxcbiAgICAgIGRhdGE6IHNvY2tldEFkZHIsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXRpbGl0eSBmb3IgZ2V0dGluZyByZWZyZXNoZWQgY29ubmVjdGlvbnMuXG4gICAqIFRPRE86IHJlZnJlc2ggY29ubmVjdGlvbnMgd2hlbiBuZXcgZGlyZWN0b3JpZXMgYXJlIHJlbW92ZWQvYWRkZWQgaW4gZmlsZS10cmVlLlxuICAgKi9cbiAgdXBkYXRlQ29ubmVjdGlvbnMoKTogdm9pZCB7XG5cbiAgICBjb25zdCBjb25uZWN0aW9ucyA9IHRoaXMuX2dldFJlbW90ZUNvbm5lY3Rpb25zKCk7XG4gICAgLy8gQWx3YXlzIGhhdmUgb25lIHNpbmdsZSBsb2NhbCBjb25uZWN0aW9uLlxuICAgIGNvbm5lY3Rpb25zLnB1c2goJ2xvY2FsJyk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5VUERBVEVfQ09OTkVDVElPTlMsXG4gICAgICBkYXRhOiBjb25uZWN0aW9ucyxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcmVtb3RlIGNvbm5lY3Rpb25zIHdpdGhvdXQgZHVwbGljYXRpb24uXG4gICAqL1xuICBfZ2V0UmVtb3RlQ29ubmVjdGlvbnMoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgLy8gVE9ETzogbW92ZSB0aGlzIGxvZ2ljIGludG8gUmVtb3RlQ29ubmVjdGlvbiBwYWNrYWdlLlxuICAgIHJldHVybiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5maWx0ZXIocGF0aCA9PiB7XG4gICAgICByZXR1cm4gcmVtb3RlVXJpLmlzUmVtb3RlKHBhdGgpO1xuICAgIH0pLm1hcChyZW1vdGVQYXRoID0+IHtcbiAgICAgIGNvbnN0IHtob3N0bmFtZSwgcG9ydH0gPSByZW1vdGVVcmkucGFyc2VSZW1vdGVVcmkocmVtb3RlUGF0aCk7XG4gICAgICByZXR1cm4gcmVtb3RlVXJpLmNyZWF0ZVJlbW90ZVVyaShob3N0bmFtZSwgTnVtYmVyKHBvcnQpLCAnLycpO1xuICAgIH0pLmZpbHRlcigocGF0aCwgaW5kZXgsIGlucHV0QXJyYXkpID0+IHtcbiAgICAgIHJldHVybiBpbnB1dEFycmF5LmluZGV4T2YocGF0aCkgPT09IGluZGV4O1xuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBlbmRUaW1lclRyYWNraW5nKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX2hhbmRsZURlYnVnTW9kZVN0YXJ0KCk6IHZvaWQge1xuICAgIC8vIE9wZW4gdGhlIGNvbnNvbGUgd2luZG93IGlmIGl0J3Mgbm90IGFscmVhZHkgb3BlbmVkLlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ251Y2xpZGUtY29uc29sZTpzaG93Jyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEZWJ1Z2dlckFjdGlvbnM7XG4iXX0=