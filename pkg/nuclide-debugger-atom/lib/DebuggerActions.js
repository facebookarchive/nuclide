var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _AnalyticsHelper = require('./AnalyticsHelper');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

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
      if (this._store.getDebuggerMode() === 'stopping') {
        return;
      }

      this._dispatcher.dispatch({
        actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
        data: 'stopping'
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
        data: 'stopped'
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
      // Open the output window if it's not already opened.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-output:show');
    }
  }]);

  return DebuggerActions;
})();

module.exports = DebuggerActions;
//# sourceMappingURL=data:application/json;base64,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LG1CQUFHO0FBQ1IsOENBQWtCLENBQUM7QUFDbkIsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRW9CLGlDQUFTOztBQUU1QixVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUscUJBQXFCLENBQUMsQ0FBQztLQUNuRjs7O1NBdkxHLGVBQWU7OztBQTBMckIsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiRGVidWdnZXJBY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgQ29uc3RhbnRzID0gcmVxdWlyZSgnLi9Db25zdGFudHMnKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmltcG9ydCB7YmVnaW5UaW1lclRyYWNraW5nLCBmYWlsVGltZXJUcmFja2luZywgZW5kVGltZXJUcmFja2luZ30gZnJvbSAnLi9BbmFseXRpY3NIZWxwZXInO1xuaW1wb3J0IHJlbW90ZVVyaSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgdHlwZSB7XG4gIG51Y2xpZGVfZGVidWdnZXIkU2VydmljZSxcbiAgTnVjbGlkZURlYnVnZ2VyUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItaW50ZXJmYWNlcy9zZXJ2aWNlJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyU3RvcmVUeXBlIGZyb20gJy4vRGVidWdnZXJTdG9yZSc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlclByb2Nlc3NJbmZvVHlwZSBmcm9tICcuL0RlYnVnZ2VyUHJvY2Vzc0luZm8nO1xuaW1wb3J0IHR5cGUgQnJpZGdlVHlwZSBmcm9tICcuL0JyaWRnZSc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlckluc3RhbmNlIGZyb20gJy4vRGVidWdnZXJJbnN0YW5jZSc7XG5cbmZ1bmN0aW9uIHRyYWNrKC4uLmFyZ3M6IGFueSkge1xuICBjb25zdCB0cmFja0Z1bmMgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWFuYWx5dGljcycpLnRyYWNrO1xuICB0cmFja0Z1bmMuYXBwbHkobnVsbCwgYXJncyk7XG59XG5cbmNvbnN0IEFuYWx5dGljc0V2ZW50cyA9IHtcbiAgREVCVUdHRVJfU1RBUlQ6ICAgICAgICdkZWJ1Z2dlci1zdGFydCcsXG4gIERFQlVHR0VSX1NUQVJUX0ZBSUw6ICAnZGVidWdnZXItc3RhcnQtZmFpbCcsXG4gIERFQlVHR0VSX1NUT1A6ICAgICAgICAnZGVidWdnZXItc3RvcCcsXG59O1xuXG4vKipcbiAqIEZsdXggc3R5bGUgYWN0aW9uIGNyZWF0b3IgZm9yIGFjdGlvbnMgdGhhdCBhZmZlY3QgdGhlIGRlYnVnZ2VyLlxuICovXG5jbGFzcyBEZWJ1Z2dlckFjdGlvbnMge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfc3RvcmU6IERlYnVnZ2VyU3RvcmVUeXBlO1xuICBfYnJpZGdlOiBCcmlkZ2VUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIHN0b3JlOiBEZWJ1Z2dlclN0b3JlVHlwZSkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JlO1xuICB9XG5cbiAgYXN5bmMgc3RhcnREZWJ1Z2dpbmcocHJvY2Vzc0luZm86IERlYnVnZ2VyUHJvY2Vzc0luZm9UeXBlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJhY2soQW5hbHl0aWNzRXZlbnRzLkRFQlVHR0VSX1NUQVJULCB7XG4gICAgICBzZXJ2aWNlTmFtZTogcHJvY2Vzc0luZm8uZ2V0U2VydmljZU5hbWUoKSxcbiAgICB9KTtcbiAgICBiZWdpblRpbWVyVHJhY2tpbmcoJ251Y2xpZGUtZGVidWdnZXItYXRvbTpzdGFydERlYnVnZ2luZycpO1xuXG4gICAgdGhpcy5raWxsRGVidWdnZXIoKTsgLy8gS2lsbCB0aGUgZXhpc3Rpbmcgc2Vzc2lvbi5cbiAgICB0aGlzLnNldEVycm9yKG51bGwpO1xuICAgIHRoaXMuX2hhbmRsZURlYnVnTW9kZVN0YXJ0KCk7XG5cbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkRFQlVHR0VSX01PREVfQ0hBTkdFLFxuICAgICAgZGF0YTogJ3N0YXJ0aW5nJyxcbiAgICB9KTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBkZWJ1Z1Nlc3Npb24gPSBhd2FpdCBwcm9jZXNzSW5mby5kZWJ1ZygpO1xuICAgICAgYXdhaXQgdGhpcy5fd2FpdEZvckNocm9tZUNvbm5lY3Rpb24oZGVidWdTZXNzaW9uKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGZhaWxUaW1lclRyYWNraW5nKGVycik7XG4gICAgICB0cmFjayhBbmFseXRpY3NFdmVudHMuREVCVUdHRVJfU1RBUlRfRkFJTCwge30pO1xuICAgICAgdGhpcy5zZXRFcnJvcignRmFpbGVkIHRvIHN0YXJ0IGRlYnVnZ2VyIHByb2Nlc3M6ICcgKyBlcnIpO1xuICAgICAgdGhpcy5raWxsRGVidWdnZXIoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfd2FpdEZvckNocm9tZUNvbm5lY3Rpb24oZGVidWdTZXNzaW9uOiBEZWJ1Z2dlckluc3RhbmNlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfREVCVUdHRVJfUFJPQ0VTUyxcbiAgICAgIGRhdGE6IGRlYnVnU2Vzc2lvbixcbiAgICB9KTtcblxuICAgIGlmIChkZWJ1Z1Nlc3Npb24ub25TZXNzaW9uRW5kICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9oYW5kbGVTZXNzaW9uRW5kLmJpbmQodGhpcyk7XG4gICAgICBpbnZhcmlhbnQoZGVidWdTZXNzaW9uLm9uU2Vzc2lvbkVuZCk7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoZGVidWdTZXNzaW9uLm9uU2Vzc2lvbkVuZChoYW5kbGVyKSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc29ja2V0QWRkciA9IGF3YWl0IGRlYnVnU2Vzc2lvbi5nZXRXZWJzb2NrZXRBZGRyZXNzKCk7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuXG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBzb2NrZXRBZGRyLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuREVCVUdHRVJfTU9ERV9DSEFOR0UsXG4gICAgICBkYXRhOiAnZGVidWdnaW5nJywgIC8vIERlYnVnZ2VyIGZpbmlzaGVkIGluaXRpYWxpemluZyBhbmQgZW50ZXJpZyBkZWJ1ZyBtb2RlLlxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZVNlc3Npb25FbmQoKTogdm9pZCB7XG4gICAgdGhpcy5raWxsRGVidWdnZXIoKTtcbiAgfVxuXG4gIGtpbGxEZWJ1Z2dlcigpIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuZ2V0RGVidWdnZXJNb2RlKCkgPT09ICdzdG9wcGluZycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkRFQlVHR0VSX01PREVfQ0hBTkdFLFxuICAgICAgZGF0YTogJ3N0b3BwaW5nJyxcbiAgICB9KTtcbiAgICBjb25zdCBkZWJ1Z1Nlc3Npb24gPSB0aGlzLl9zdG9yZS5nZXREZWJ1Z2dlclByb2Nlc3MoKTtcbiAgICBpZiAoZGVidWdTZXNzaW9uICE9IG51bGwpIHtcbiAgICAgIGRlYnVnU2Vzc2lvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0RFQlVHR0VSX1BST0NFU1MsXG4gICAgICAgIGRhdGE6IG51bGwsXG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBudWxsLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuREVCVUdHRVJfTU9ERV9DSEFOR0UsXG4gICAgICBkYXRhOiAnc3RvcHBlZCcsXG4gICAgfSk7XG4gICAgdHJhY2soQW5hbHl0aWNzRXZlbnRzLkRFQlVHR0VSX1NUT1ApO1xuICAgIGVuZFRpbWVyVHJhY2tpbmcoKTtcbiAgfVxuXG4gIGFkZFNlcnZpY2Uoc2VydmljZTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5BRERfU0VSVklDRSxcbiAgICAgIGRhdGE6IHNlcnZpY2UsXG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVTZXJ2aWNlKHNlcnZpY2U6IG51Y2xpZGVfZGVidWdnZXIkU2VydmljZSkge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuUkVNT1ZFX1NFUlZJQ0UsXG4gICAgICBkYXRhOiBzZXJ2aWNlLFxuICAgIH0pO1xuICB9XG5cbiAgYWRkRGVidWdnZXJQcm92aWRlcihwcm92aWRlcjogTnVjbGlkZURlYnVnZ2VyUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkFERF9ERUJVR0dFUl9QUk9WSURFUixcbiAgICAgIGRhdGE6IHByb3ZpZGVyLFxuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlRGVidWdnZXJQcm92aWRlcihwcm92aWRlcjogTnVjbGlkZURlYnVnZ2VyUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlJFTU9WRV9ERUJVR0dFUl9QUk9WSURFUixcbiAgICAgIGRhdGE6IHByb3ZpZGVyLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0RXJyb3IoZXJyb3I6ID9zdHJpbmcpIHtcbiAgICByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKS5lcnJvcihlcnJvcik7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfRVJST1IsXG4gICAgICBkYXRhOiBlcnJvcixcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IGZvciBkZWJ1Z2dpbmcuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIHVzZWQgdG8gc2V0IGFuIGV4aXN0aW5nIHNvY2tldCwgYnlwYXNzaW5nIG5vcm1hbCBVSSBmbG93IHRvXG4gICAqIGltcHJvdmUgaXRlcmF0aW9uIHNwZWVkIGZvciBkZXZlbG9wbWVudC5cbiAgICovXG4gIGZvcmNlUHJvY2Vzc1NvY2tldChzb2NrZXRBZGRyOiA/c3RyaW5nKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBzb2NrZXRBZGRyLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgZm9yIGdldHRpbmcgcmVmcmVzaGVkIGNvbm5lY3Rpb25zLlxuICAgKiBUT0RPOiByZWZyZXNoIGNvbm5lY3Rpb25zIHdoZW4gbmV3IGRpcmVjdG9yaWVzIGFyZSByZW1vdmVkL2FkZGVkIGluIGZpbGUtdHJlZS5cbiAgICovXG4gIHVwZGF0ZUNvbm5lY3Rpb25zKCk6IHZvaWQge1xuXG4gICAgY29uc3QgY29ubmVjdGlvbnMgPSB0aGlzLl9nZXRSZW1vdGVDb25uZWN0aW9ucygpO1xuICAgIC8vIEFsd2F5cyBoYXZlIG9uZSBzaW5nbGUgbG9jYWwgY29ubmVjdGlvbi5cbiAgICBjb25uZWN0aW9ucy5wdXNoKCdsb2NhbCcpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuVVBEQVRFX0NPTk5FQ1RJT05TLFxuICAgICAgZGF0YTogY29ubmVjdGlvbnMsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHJlbW90ZSBjb25uZWN0aW9ucyB3aXRob3V0IGR1cGxpY2F0aW9uLlxuICAgKi9cbiAgX2dldFJlbW90ZUNvbm5lY3Rpb25zKCk6IEFycmF5PHN0cmluZz4ge1xuICAgIC8vIFRPRE86IG1vdmUgdGhpcyBsb2dpYyBpbnRvIFJlbW90ZUNvbm5lY3Rpb24gcGFja2FnZS5cbiAgICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkuZmlsdGVyKHBhdGggPT4ge1xuICAgICAgcmV0dXJuIHJlbW90ZVVyaS5pc1JlbW90ZShwYXRoKTtcbiAgICB9KS5tYXAocmVtb3RlUGF0aCA9PiB7XG4gICAgICBjb25zdCB7aG9zdG5hbWUsIHBvcnR9ID0gcmVtb3RlVXJpLnBhcnNlUmVtb3RlVXJpKHJlbW90ZVBhdGgpO1xuICAgICAgcmV0dXJuIHJlbW90ZVVyaS5jcmVhdGVSZW1vdGVVcmkoaG9zdG5hbWUsIE51bWJlcihwb3J0KSwgJy8nKTtcbiAgICB9KS5maWx0ZXIoKHBhdGgsIGluZGV4LCBpbnB1dEFycmF5KSA9PiB7XG4gICAgICByZXR1cm4gaW5wdXRBcnJheS5pbmRleE9mKHBhdGgpID09PSBpbmRleDtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9oYW5kbGVEZWJ1Z01vZGVTdGFydCgpOiB2b2lkIHtcbiAgICAvLyBPcGVuIHRoZSBvdXRwdXQgd2luZG93IGlmIGl0J3Mgbm90IGFscmVhZHkgb3BlbmVkLlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ251Y2xpZGUtb3V0cHV0OnNob3cnKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VyQWN0aW9ucztcbiJdfQ==