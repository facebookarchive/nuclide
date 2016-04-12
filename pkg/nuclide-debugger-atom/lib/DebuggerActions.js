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

      this._dispatcher.dispatch({
        actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
        data: _DebuggerStore.DebuggerMode.STARTING
      });

      try {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
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
      this.stopDebugging();
    }
  }, {
    key: 'stopDebugging',
    value: function stopDebugging() {
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
    key: 'killDebugger',
    value: function killDebugger() {
      this.stopDebugging();
      if (this._store.getDebuggerProcess() === null) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:hide');
      }
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
//# sourceMappingURL=data:application/json;base64,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QWU7OztBQWdOckIsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiRGVidWdnZXJBY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgQ29uc3RhbnRzID0gcmVxdWlyZSgnLi9Db25zdGFudHMnKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmltcG9ydCB7YmVnaW5UaW1lclRyYWNraW5nLCBmYWlsVGltZXJUcmFja2luZywgZW5kVGltZXJUcmFja2luZ30gZnJvbSAnLi9BbmFseXRpY3NIZWxwZXInO1xuaW1wb3J0IHJlbW90ZVVyaSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtEZWJ1Z2dlck1vZGV9IGZyb20gJy4vRGVidWdnZXJTdG9yZSc7XG5cbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcbmltcG9ydCB0eXBlIHtcbiAgbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlLFxuICBOdWNsaWRlRGVidWdnZXJQcm92aWRlcixcbiAgTnVjbGlkZUV2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItaW50ZXJmYWNlcy9zZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtEZWJ1Z2dlclN0b3JlfSBmcm9tICcuL0RlYnVnZ2VyU3RvcmUnO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJQcm9jZXNzSW5mb1R5cGUgZnJvbSAnLi9EZWJ1Z2dlclByb2Nlc3NJbmZvJztcbmltcG9ydCB0eXBlIEJyaWRnZVR5cGUgZnJvbSAnLi9CcmlkZ2UnO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJJbnN0YW5jZSBmcm9tICcuL0RlYnVnZ2VySW5zdGFuY2UnO1xuXG5mdW5jdGlvbiB0cmFjayguLi5hcmdzOiBhbnkpIHtcbiAgY29uc3QgdHJhY2tGdW5jID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnKS50cmFjaztcbiAgdHJhY2tGdW5jLmFwcGx5KG51bGwsIGFyZ3MpO1xufVxuXG5jb25zdCBBbmFseXRpY3NFdmVudHMgPSBPYmplY3QuZnJlZXplKHtcbiAgREVCVUdHRVJfU1RBUlQ6ICAgICAgICdkZWJ1Z2dlci1zdGFydCcsXG4gIERFQlVHR0VSX1NUQVJUX0ZBSUw6ICAnZGVidWdnZXItc3RhcnQtZmFpbCcsXG4gIERFQlVHR0VSX1NUT1A6ICAgICAgICAnZGVidWdnZXItc3RvcCcsXG59KTtcblxuLyoqXG4gKiBGbHV4IHN0eWxlIGFjdGlvbiBjcmVhdG9yIGZvciBhY3Rpb25zIHRoYXQgYWZmZWN0IHRoZSBkZWJ1Z2dlci5cbiAqL1xuY2xhc3MgRGVidWdnZXJBY3Rpb25zIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX3N0b3JlOiBEZWJ1Z2dlclN0b3JlO1xuICBfYnJpZGdlOiBCcmlkZ2VUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIHN0b3JlOiBEZWJ1Z2dlclN0b3JlKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIHRoaXMuX3N0b3JlID0gc3RvcmU7XG4gIH1cblxuICBhc3luYyBzdGFydERlYnVnZ2luZyhwcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mb1R5cGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cmFjayhBbmFseXRpY3NFdmVudHMuREVCVUdHRVJfU1RBUlQsIHtcbiAgICAgIHNlcnZpY2VOYW1lOiBwcm9jZXNzSW5mby5nZXRTZXJ2aWNlTmFtZSgpLFxuICAgIH0pO1xuICAgIGJlZ2luVGltZXJUcmFja2luZygnbnVjbGlkZS1kZWJ1Z2dlci1hdG9tOnN0YXJ0RGVidWdnaW5nJyk7XG5cbiAgICB0aGlzLnN0b3BEZWJ1Z2dpbmcoKTsgLy8gc3RvcCBleGlzdGluZyBzZXNzaW9uLlxuICAgIHRoaXMuc2V0RXJyb3IobnVsbCk7XG4gICAgdGhpcy5faGFuZGxlRGVidWdNb2RlU3RhcnQoKTtcblxuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuREVCVUdHRVJfTU9ERV9DSEFOR0UsXG4gICAgICBkYXRhOiBEZWJ1Z2dlck1vZGUuU1RBUlRJTkcsXG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnbnVjbGlkZS1kZWJ1Z2dlcjpzaG93Jyk7XG4gICAgICBjb25zdCBkZWJ1Z1Nlc3Npb24gPSBhd2FpdCBwcm9jZXNzSW5mby5kZWJ1ZygpO1xuICAgICAgYXdhaXQgdGhpcy5fd2FpdEZvckNocm9tZUNvbm5lY3Rpb24oZGVidWdTZXNzaW9uKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGZhaWxUaW1lclRyYWNraW5nKGVycik7XG4gICAgICB0cmFjayhBbmFseXRpY3NFdmVudHMuREVCVUdHRVJfU1RBUlRfRkFJTCwge30pO1xuICAgICAgdGhpcy5zZXRFcnJvcignRmFpbGVkIHRvIHN0YXJ0IGRlYnVnZ2VyIHByb2Nlc3M6ICcgKyBlcnIpO1xuICAgICAgdGhpcy5raWxsRGVidWdnZXIoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfd2FpdEZvckNocm9tZUNvbm5lY3Rpb24oZGVidWdTZXNzaW9uOiBEZWJ1Z2dlckluc3RhbmNlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfREVCVUdHRVJfUFJPQ0VTUyxcbiAgICAgIGRhdGE6IGRlYnVnU2Vzc2lvbixcbiAgICB9KTtcblxuICAgIGlmIChkZWJ1Z1Nlc3Npb24ub25TZXNzaW9uRW5kICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9oYW5kbGVTZXNzaW9uRW5kLmJpbmQodGhpcyk7XG4gICAgICBpbnZhcmlhbnQoZGVidWdTZXNzaW9uLm9uU2Vzc2lvbkVuZCk7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoZGVidWdTZXNzaW9uLm9uU2Vzc2lvbkVuZChoYW5kbGVyKSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc29ja2V0QWRkciA9IGF3YWl0IGRlYnVnU2Vzc2lvbi5nZXRXZWJzb2NrZXRBZGRyZXNzKCk7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuXG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBzb2NrZXRBZGRyLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuREVCVUdHRVJfTU9ERV9DSEFOR0UsXG4gICAgICBkYXRhOiBEZWJ1Z2dlck1vZGUuUlVOTklORywgIC8vIERlYnVnZ2VyIGZpbmlzaGVkIGluaXRpYWxpemluZyBhbmQgZW50ZXJlZCBkZWJ1ZyBtb2RlLlxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZVNlc3Npb25FbmQoKTogdm9pZCB7XG4gICAgdGhpcy5zdG9wRGVidWdnaW5nKCk7XG4gIH1cblxuICBzdG9wRGVidWdnaW5nKCkge1xuICAgIGlmICh0aGlzLl9zdG9yZS5nZXREZWJ1Z2dlck1vZGUoKSA9PT0gRGVidWdnZXJNb2RlLlNUT1BQSU5HKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5ERUJVR0dFUl9NT0RFX0NIQU5HRSxcbiAgICAgIGRhdGE6IERlYnVnZ2VyTW9kZS5TVE9QUElORyxcbiAgICB9KTtcbiAgICBjb25zdCBkZWJ1Z1Nlc3Npb24gPSB0aGlzLl9zdG9yZS5nZXREZWJ1Z2dlclByb2Nlc3MoKTtcbiAgICBpZiAoZGVidWdTZXNzaW9uICE9IG51bGwpIHtcbiAgICAgIGRlYnVnU2Vzc2lvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0RFQlVHR0VSX1BST0NFU1MsXG4gICAgICAgIGRhdGE6IG51bGwsXG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBudWxsLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuREVCVUdHRVJfTU9ERV9DSEFOR0UsXG4gICAgICBkYXRhOiBEZWJ1Z2dlck1vZGUuU1RPUFBFRCxcbiAgICB9KTtcbiAgICB0cmFjayhBbmFseXRpY3NFdmVudHMuREVCVUdHRVJfU1RPUCk7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuICB9XG5cbiAga2lsbERlYnVnZ2VyKCkge1xuICAgIHRoaXMuc3RvcERlYnVnZ2luZygpO1xuICAgIGlmICh0aGlzLl9zdG9yZS5nZXREZWJ1Z2dlclByb2Nlc3MoKSA9PT0gbnVsbCkge1xuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnbnVjbGlkZS1kZWJ1Z2dlcjpoaWRlJyk7XG4gICAgfVxuICB9XG5cbiAgYWRkU2VydmljZShzZXJ2aWNlOiBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkFERF9TRVJWSUNFLFxuICAgICAgZGF0YTogc2VydmljZSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZVNlcnZpY2Uoc2VydmljZTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5SRU1PVkVfU0VSVklDRSxcbiAgICAgIGRhdGE6IHNlcnZpY2UsXG4gICAgfSk7XG4gIH1cblxuICBhZGREZWJ1Z2dlclByb3ZpZGVyKHByb3ZpZGVyOiBOdWNsaWRlRGVidWdnZXJQcm92aWRlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuQUREX0RFQlVHR0VSX1BST1ZJREVSLFxuICAgICAgZGF0YTogcHJvdmlkZXIsXG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVEZWJ1Z2dlclByb3ZpZGVyKHByb3ZpZGVyOiBOdWNsaWRlRGVidWdnZXJQcm92aWRlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuUkVNT1ZFX0RFQlVHR0VSX1BST1ZJREVSLFxuICAgICAgZGF0YTogcHJvdmlkZXIsXG4gICAgfSk7XG4gIH1cblxuICBhZGRFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVyKHByb3ZpZGVyOiBOdWNsaWRlRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuQUREX0VWQUxVQVRJT05fRVhQUkVTU0lPTl9QUk9WSURFUixcbiAgICAgIGRhdGE6IHByb3ZpZGVyLFxuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcihwcm92aWRlcjogTnVjbGlkZUV2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlJFTU9WRV9FVkFMVUFUSU9OX0VYUFJFU1NJT05fUFJPVklERVIsXG4gICAgICBkYXRhOiBwcm92aWRlcixcbiAgICB9KTtcbiAgfVxuXG4gIHNldEVycm9yKGVycm9yOiA/c3RyaW5nKSB7XG4gICAgcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCkuZXJyb3IoZXJyb3IpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0VSUk9SLFxuICAgICAgZGF0YTogZXJyb3IsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXRpbGl0eSBmb3IgZGVidWdnaW5nLlxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIHNldCBhbiBleGlzdGluZyBzb2NrZXQsIGJ5cGFzc2luZyBub3JtYWwgVUkgZmxvdyB0b1xuICAgKiBpbXByb3ZlIGl0ZXJhdGlvbiBzcGVlZCBmb3IgZGV2ZWxvcG1lbnQuXG4gICAqL1xuICBmb3JjZVByb2Nlc3NTb2NrZXQoc29ja2V0QWRkcjogP3N0cmluZykge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX1BST0NFU1NfU09DS0VULFxuICAgICAgZGF0YTogc29ja2V0QWRkcixcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IGZvciBnZXR0aW5nIHJlZnJlc2hlZCBjb25uZWN0aW9ucy5cbiAgICogVE9ETzogcmVmcmVzaCBjb25uZWN0aW9ucyB3aGVuIG5ldyBkaXJlY3RvcmllcyBhcmUgcmVtb3ZlZC9hZGRlZCBpbiBmaWxlLXRyZWUuXG4gICAqL1xuICB1cGRhdGVDb25uZWN0aW9ucygpOiB2b2lkIHtcblxuICAgIGNvbnN0IGNvbm5lY3Rpb25zID0gdGhpcy5fZ2V0UmVtb3RlQ29ubmVjdGlvbnMoKTtcbiAgICAvLyBBbHdheXMgaGF2ZSBvbmUgc2luZ2xlIGxvY2FsIGNvbm5lY3Rpb24uXG4gICAgY29ubmVjdGlvbnMucHVzaCgnbG9jYWwnKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlVQREFURV9DT05ORUNUSU9OUyxcbiAgICAgIGRhdGE6IGNvbm5lY3Rpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCByZW1vdGUgY29ubmVjdGlvbnMgd2l0aG91dCBkdXBsaWNhdGlvbi5cbiAgICovXG4gIF9nZXRSZW1vdGVDb25uZWN0aW9ucygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICAvLyBUT0RPOiBtb3ZlIHRoaXMgbG9naWMgaW50byBSZW1vdGVDb25uZWN0aW9uIHBhY2thZ2UuXG4gICAgcmV0dXJuIGF0b20ucHJvamVjdC5nZXRQYXRocygpLmZpbHRlcihwYXRoID0+IHtcbiAgICAgIHJldHVybiByZW1vdGVVcmkuaXNSZW1vdGUocGF0aCk7XG4gICAgfSkubWFwKHJlbW90ZVBhdGggPT4ge1xuICAgICAgY29uc3Qge2hvc3RuYW1lLCBwb3J0fSA9IHJlbW90ZVVyaS5wYXJzZVJlbW90ZVVyaShyZW1vdGVQYXRoKTtcbiAgICAgIHJldHVybiByZW1vdGVVcmkuY3JlYXRlUmVtb3RlVXJpKGhvc3RuYW1lLCBOdW1iZXIocG9ydCksICcvJyk7XG4gICAgfSkuZmlsdGVyKChwYXRoLCBpbmRleCwgaW5wdXRBcnJheSkgPT4ge1xuICAgICAgcmV0dXJuIGlucHV0QXJyYXkuaW5kZXhPZihwYXRoKSA9PT0gaW5kZXg7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGVuZFRpbWVyVHJhY2tpbmcoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfaGFuZGxlRGVidWdNb2RlU3RhcnQoKTogdm9pZCB7XG4gICAgLy8gT3BlbiB0aGUgY29uc29sZSB3aW5kb3cgaWYgaXQncyBub3QgYWxyZWFkeSBvcGVuZWQuXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnbnVjbGlkZS1jb25zb2xlOnNob3cnKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VyQWN0aW9ucztcbiJdfQ==