var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _AnalyticsHelper = require('./AnalyticsHelper');

var _remoteUri = require('../../../remote-uri');

var _remoteUri2 = _interopRequireDefault(_remoteUri);

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
  var trackFunc = require('../../../analytics').track;

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  trackFunc.apply(null, args);
}

var AnalyticsEvents = {
  DEBUGGER_START: 'debugger-start',
  DEBUGGER_START_FAIL: 'debugger-start-fail',
  DEBUGGER_STOP: 'debugger-stop'
};

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
        data: 'starting'
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

      // TODO[jeffreytan]: currently only HHVM debugger implements this method
      // investigate if LLDB/Node needs to implement it.
      if (debugSession.onSessionEnd) {
        this._disposables.add(debugSession.onSessionEnd(this._handleSessionEnd.bind(this)));
      }

      var socketAddr = yield debugSession.getWebsocketAddress();
      (0, _AnalyticsHelper.endTimerTracking)();

      this._dispatcher.dispatch({
        actionType: Constants.Actions.SET_PROCESS_SOCKET,
        data: socketAddr
      });
      this._dispatcher.dispatch({
        actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
        data: 'debugging' });
    })
  }, {
    key: '_handleSessionEnd',
    // Debugger finished initializing and enterig debug mode.
    value: function _handleSessionEnd() {
      this.killDebugger();
    }
  }, {
    key: 'killDebugger',
    value: function killDebugger() {
      track(AnalyticsEvents.DEBUGGER_STOP);
      (0, _AnalyticsHelper.endTimerTracking)();
      this._handleDebugModeEnd();
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
        data: 'stopped'
      });
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
    key: 'setError',
    value: function setError(error) {
      require('../../../logging').getLogger().error(error);
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
        return _remoteUri2['default'].isRemote(path);
      }).map(function (remotePath) {
        var _remoteUri$parseRemoteUri = _remoteUri2['default'].parseRemoteUri(remotePath);

        var hostname = _remoteUri$parseRemoteUri.hostname;
        var port = _remoteUri$parseRemoteUri.port;

        return _remoteUri2['default'].createRemoteUri(hostname, Number(port), '/');
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
      // Open the output window if it's not already opened.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-output:show');
    }
  }, {
    key: '_handleDebugModeEnd',
    value: function _handleDebugModeEnd() {
      // Close the output window when we are done with debugging.
      // TODO(jonaldislarry) don't close the window if it was open prior to debugging.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-output:hide');
    }
  }]);

  return DebuggerActions;
})();

module.exports = DebuggerActions;
//# sourceMappingURL=data:application/json;base64,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LENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUM7S0FDbkY7OztTQXRMRyxlQUFlOzs7QUF5THJCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IkRlYnVnZ2VyQWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IENvbnN0YW50cyA9IHJlcXVpcmUoJy4vQ29uc3RhbnRzJyk7XG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5pbXBvcnQge2JlZ2luVGltZXJUcmFja2luZywgZmFpbFRpbWVyVHJhY2tpbmcsIGVuZFRpbWVyVHJhY2tpbmd9IGZyb20gJy4vQW5hbHl0aWNzSGVscGVyJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcbmltcG9ydCB0eXBlIHtcbiAgbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlLFxuICBOdWNsaWRlRGVidWdnZXJQcm92aWRlcixcbn0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zZXJ2aWNlJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyU3RvcmVUeXBlIGZyb20gJy4vRGVidWdnZXJTdG9yZSc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlclByb2Nlc3NJbmZvVHlwZSBmcm9tICcuL0RlYnVnZ2VyUHJvY2Vzc0luZm8nO1xuaW1wb3J0IHR5cGUgQnJpZGdlVHlwZSBmcm9tICcuL0JyaWRnZSc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlckluc3RhbmNlIGZyb20gJy4vRGVidWdnZXJJbnN0YW5jZSc7XG5cbmZ1bmN0aW9uIHRyYWNrKC4uLmFyZ3M6IGFueSkge1xuICBjb25zdCB0cmFja0Z1bmMgPSByZXF1aXJlKCcuLi8uLi8uLi9hbmFseXRpY3MnKS50cmFjaztcbiAgdHJhY2tGdW5jLmFwcGx5KG51bGwsIGFyZ3MpO1xufVxuXG5jb25zdCBBbmFseXRpY3NFdmVudHMgPSB7XG4gIERFQlVHR0VSX1NUQVJUOiAgICAgICAnZGVidWdnZXItc3RhcnQnLFxuICBERUJVR0dFUl9TVEFSVF9GQUlMOiAgJ2RlYnVnZ2VyLXN0YXJ0LWZhaWwnLFxuICBERUJVR0dFUl9TVE9QOiAgICAgICAgJ2RlYnVnZ2VyLXN0b3AnLFxufTtcblxuLyoqXG4gKiBGbHV4IHN0eWxlIGFjdGlvbiBjcmVhdG9yIGZvciBhY3Rpb25zIHRoYXQgYWZmZWN0IHRoZSBkZWJ1Z2dlci5cbiAqL1xuY2xhc3MgRGVidWdnZXJBY3Rpb25zIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX3N0b3JlOiBEZWJ1Z2dlclN0b3JlVHlwZTtcbiAgX2JyaWRnZTogQnJpZGdlVHlwZTtcblxuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyOiBEaXNwYXRjaGVyLCBzdG9yZTogRGVidWdnZXJTdG9yZVR5cGUpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yZTtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvVHlwZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyYWNrKEFuYWx5dGljc0V2ZW50cy5ERUJVR0dFUl9TVEFSVCwge1xuICAgICAgc2VydmljZU5hbWU6IHByb2Nlc3NJbmZvLmdldFNlcnZpY2VOYW1lKCksXG4gICAgfSk7XG4gICAgYmVnaW5UaW1lclRyYWNraW5nKCdudWNsaWRlLWRlYnVnZ2VyLWF0b206c3RhcnREZWJ1Z2dpbmcnKTtcblxuICAgIHRoaXMua2lsbERlYnVnZ2VyKCk7IC8vIEtpbGwgdGhlIGV4aXN0aW5nIHNlc3Npb24uXG4gICAgdGhpcy5zZXRFcnJvcihudWxsKTtcbiAgICB0aGlzLl9oYW5kbGVEZWJ1Z01vZGVTdGFydCgpO1xuXG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5ERUJVR0dFUl9NT0RFX0NIQU5HRSxcbiAgICAgIGRhdGE6ICdzdGFydGluZycsXG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZGVidWdTZXNzaW9uID0gYXdhaXQgcHJvY2Vzc0luZm8uZGVidWcoKTtcbiAgICAgIGF3YWl0IHRoaXMuX3dhaXRGb3JDaHJvbWVDb25uZWN0aW9uKGRlYnVnU2Vzc2lvbik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBmYWlsVGltZXJUcmFja2luZyhlcnIpO1xuICAgICAgdHJhY2soQW5hbHl0aWNzRXZlbnRzLkRFQlVHR0VSX1NUQVJUX0ZBSUwsIHt9KTtcbiAgICAgIHRoaXMuc2V0RXJyb3IoJ0ZhaWxlZCB0byBzdGFydCBkZWJ1Z2dlciBwcm9jZXNzOiAnICsgZXJyKTtcbiAgICAgIHRoaXMua2lsbERlYnVnZ2VyKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3dhaXRGb3JDaHJvbWVDb25uZWN0aW9uKGRlYnVnU2Vzc2lvbjogRGVidWdnZXJJbnN0YW5jZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0RFQlVHR0VSX1BST0NFU1MsXG4gICAgICBkYXRhOiBkZWJ1Z1Nlc3Npb24sXG4gICAgfSk7XG5cbiAgICAvLyBUT0RPW2plZmZyZXl0YW5dOiBjdXJyZW50bHkgb25seSBISFZNIGRlYnVnZ2VyIGltcGxlbWVudHMgdGhpcyBtZXRob2RcbiAgICAvLyBpbnZlc3RpZ2F0ZSBpZiBMTERCL05vZGUgbmVlZHMgdG8gaW1wbGVtZW50IGl0LlxuICAgIGlmIChkZWJ1Z1Nlc3Npb24ub25TZXNzaW9uRW5kKSB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoZGVidWdTZXNzaW9uLm9uU2Vzc2lvbkVuZCh0aGlzLl9oYW5kbGVTZXNzaW9uRW5kLmJpbmQodGhpcykpKTtcbiAgICB9XG5cbiAgICBjb25zdCBzb2NrZXRBZGRyID0gYXdhaXQgZGVidWdTZXNzaW9uLmdldFdlYnNvY2tldEFkZHJlc3MoKTtcbiAgICBlbmRUaW1lclRyYWNraW5nKCk7XG5cbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlNFVF9QUk9DRVNTX1NPQ0tFVCxcbiAgICAgIGRhdGE6IHNvY2tldEFkZHIsXG4gICAgfSk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5ERUJVR0dFUl9NT0RFX0NIQU5HRSxcbiAgICAgIGRhdGE6ICdkZWJ1Z2dpbmcnLCAgLy8gRGVidWdnZXIgZmluaXNoZWQgaW5pdGlhbGl6aW5nIGFuZCBlbnRlcmlnIGRlYnVnIG1vZGUuXG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlU2Vzc2lvbkVuZCgpOiB2b2lkIHtcbiAgICB0aGlzLmtpbGxEZWJ1Z2dlcigpO1xuICB9XG5cbiAga2lsbERlYnVnZ2VyKCkge1xuICAgIHRyYWNrKEFuYWx5dGljc0V2ZW50cy5ERUJVR0dFUl9TVE9QKTtcbiAgICBlbmRUaW1lclRyYWNraW5nKCk7XG4gICAgdGhpcy5faGFuZGxlRGVidWdNb2RlRW5kKCk7XG4gICAgY29uc3QgZGVidWdTZXNzaW9uID0gdGhpcy5fc3RvcmUuZ2V0RGVidWdnZXJQcm9jZXNzKCk7XG4gICAgaWYgKGRlYnVnU2Vzc2lvbiAhPSBudWxsKSB7XG4gICAgICBkZWJ1Z1Nlc3Npb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlNFVF9ERUJVR0dFUl9QUk9DRVNTLFxuICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX1BST0NFU1NfU09DS0VULFxuICAgICAgZGF0YTogbnVsbCxcbiAgICB9KTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkRFQlVHR0VSX01PREVfQ0hBTkdFLFxuICAgICAgZGF0YTogJ3N0b3BwZWQnLFxuICAgIH0pO1xuICB9XG5cbiAgYWRkU2VydmljZShzZXJ2aWNlOiBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkFERF9TRVJWSUNFLFxuICAgICAgZGF0YTogc2VydmljZSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZVNlcnZpY2Uoc2VydmljZTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5SRU1PVkVfU0VSVklDRSxcbiAgICAgIGRhdGE6IHNlcnZpY2UsXG4gICAgfSk7XG4gIH1cblxuICBhZGREZWJ1Z2dlclByb3ZpZGVyKHByb3ZpZGVyOiBOdWNsaWRlRGVidWdnZXJQcm92aWRlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuQUREX0RFQlVHR0VSX1BST1ZJREVSLFxuICAgICAgZGF0YTogcHJvdmlkZXIsXG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVEZWJ1Z2dlclByb3ZpZGVyKHByb3ZpZGVyOiBOdWNsaWRlRGVidWdnZXJQcm92aWRlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuUkVNT1ZFX0RFQlVHR0VSX1BST1ZJREVSLFxuICAgICAgZGF0YTogcHJvdmlkZXIsXG4gICAgfSk7XG4gIH1cblxuICBzZXRFcnJvcihlcnJvcjogP3N0cmluZykge1xuICAgIHJlcXVpcmUoJy4uLy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKS5lcnJvcihlcnJvcik7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfRVJST1IsXG4gICAgICBkYXRhOiBlcnJvcixcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IGZvciBkZWJ1Z2dpbmcuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIHVzZWQgdG8gc2V0IGFuIGV4aXN0aW5nIHNvY2tldCwgYnlwYXNzaW5nIG5vcm1hbCBVSSBmbG93IHRvXG4gICAqIGltcHJvdmUgaXRlcmF0aW9uIHNwZWVkIGZvciBkZXZlbG9wbWVudC5cbiAgICovXG4gIGZvcmNlUHJvY2Vzc1NvY2tldChzb2NrZXRBZGRyOiA/c3RyaW5nKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBzb2NrZXRBZGRyLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgZm9yIGdldHRpbmcgcmVmcmVzaGVkIGNvbm5lY3Rpb25zLlxuICAgKiBUT0RPOiByZWZyZXNoIGNvbm5lY3Rpb25zIHdoZW4gbmV3IGRpcmVjdG9yaWVzIGFyZSByZW1vdmVkL2FkZGVkIGluIGZpbGUtdHJlZS5cbiAgICovXG4gIHVwZGF0ZUNvbm5lY3Rpb25zKCk6IHZvaWQge1xuXG4gICAgY29uc3QgY29ubmVjdGlvbnMgPSB0aGlzLl9nZXRSZW1vdGVDb25uZWN0aW9ucygpO1xuICAgIC8vIEFsd2F5cyBoYXZlIG9uZSBzaW5nbGUgbG9jYWwgY29ubmVjdGlvbi5cbiAgICBjb25uZWN0aW9ucy5wdXNoKCdsb2NhbCcpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuVVBEQVRFX0NPTk5FQ1RJT05TLFxuICAgICAgZGF0YTogY29ubmVjdGlvbnMsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHJlbW90ZSBjb25uZWN0aW9ucyB3aXRob3V0IGR1cGxpY2F0aW9uLlxuICAgKi9cbiAgX2dldFJlbW90ZUNvbm5lY3Rpb25zKCk6IEFycmF5PHN0cmluZz4ge1xuICAgIC8vIFRPRE86IG1vdmUgdGhpcyBsb2dpYyBpbnRvIFJlbW90ZUNvbm5lY3Rpb24gcGFja2FnZS5cbiAgICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkuZmlsdGVyKHBhdGggPT4ge1xuICAgICAgcmV0dXJuIHJlbW90ZVVyaS5pc1JlbW90ZShwYXRoKTtcbiAgICB9KS5tYXAocmVtb3RlUGF0aCA9PiB7XG4gICAgICBjb25zdCB7aG9zdG5hbWUsIHBvcnR9ID0gcmVtb3RlVXJpLnBhcnNlUmVtb3RlVXJpKHJlbW90ZVBhdGgpO1xuICAgICAgcmV0dXJuIHJlbW90ZVVyaS5jcmVhdGVSZW1vdGVVcmkoaG9zdG5hbWUsIE51bWJlcihwb3J0KSwgJy8nKTtcbiAgICB9KS5maWx0ZXIoKHBhdGgsIGluZGV4LCBpbnB1dEFycmF5KSA9PiB7XG4gICAgICByZXR1cm4gaW5wdXRBcnJheS5pbmRleE9mKHBhdGgpID09PSBpbmRleDtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9oYW5kbGVEZWJ1Z01vZGVTdGFydCgpOiB2b2lkIHtcbiAgICAvLyBPcGVuIHRoZSBvdXRwdXQgd2luZG93IGlmIGl0J3Mgbm90IGFscmVhZHkgb3BlbmVkLlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ251Y2xpZGUtb3V0cHV0OnNob3cnKTtcbiAgfVxuXG4gIF9oYW5kbGVEZWJ1Z01vZGVFbmQoKTogdm9pZCB7XG4gICAgLy8gQ2xvc2UgdGhlIG91dHB1dCB3aW5kb3cgd2hlbiB3ZSBhcmUgZG9uZSB3aXRoIGRlYnVnZ2luZy5cbiAgICAvLyBUT0RPKGpvbmFsZGlzbGFycnkpIGRvbid0IGNsb3NlIHRoZSB3aW5kb3cgaWYgaXQgd2FzIG9wZW4gcHJpb3IgdG8gZGVidWdnaW5nLlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ251Y2xpZGUtb3V0cHV0OmhpZGUnKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VyQWN0aW9ucztcbiJdfQ==