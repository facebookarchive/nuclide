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
//# sourceMappingURL=data:application/json;base64,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Q2pDLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxVQUFVLEVBQUk7d0NBQ00sOEJBQVUsY0FBYyxDQUFDLFVBQVUsQ0FBQzs7WUFBdEQsUUFBUSw2QkFBUixRQUFRO1lBQUUsSUFBSSw2QkFBSixJQUFJOztBQUNyQixlQUFPLDhCQUFVLGVBQWUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO09BQy9ELENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBSztBQUNyQyxlQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDO09BQzNDLENBQUMsQ0FBQztLQUNKOzs7V0FFTSxtQkFBRztBQUNSLDhDQUFrQixDQUFDO0FBQ25CLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVvQixpQ0FBUzs7QUFFNUIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLHNCQUFzQixDQUFDLENBQUM7S0FDcEY7OztTQXJNRyxlQUFlOzs7QUF3TXJCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IkRlYnVnZ2VyQWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IENvbnN0YW50cyA9IHJlcXVpcmUoJy4vQ29uc3RhbnRzJyk7XG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5pbXBvcnQge2JlZ2luVGltZXJUcmFja2luZywgZmFpbFRpbWVyVHJhY2tpbmcsIGVuZFRpbWVyVHJhY2tpbmd9IGZyb20gJy4vQW5hbHl0aWNzSGVscGVyJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7RGVidWdnZXJNb2RlfSBmcm9tICcuL0RlYnVnZ2VyU3RvcmUnO1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgdHlwZSB7XG4gIG51Y2xpZGVfZGVidWdnZXIkU2VydmljZSxcbiAgTnVjbGlkZURlYnVnZ2VyUHJvdmlkZXIsXG4gIE51Y2xpZGVFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWludGVyZmFjZXMvc2VydmljZSc7XG5pbXBvcnQgdHlwZSB7RGVidWdnZXJTdG9yZX0gZnJvbSAnLi9EZWJ1Z2dlclN0b3JlJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyUHJvY2Vzc0luZm9UeXBlIGZyb20gJy4vRGVidWdnZXJQcm9jZXNzSW5mbyc7XG5pbXBvcnQgdHlwZSBCcmlkZ2VUeXBlIGZyb20gJy4vQnJpZGdlJztcbmltcG9ydCB0eXBlIERlYnVnZ2VySW5zdGFuY2UgZnJvbSAnLi9EZWJ1Z2dlckluc3RhbmNlJztcblxuZnVuY3Rpb24gdHJhY2soLi4uYXJnczogYW55KSB7XG4gIGNvbnN0IHRyYWNrRnVuYyA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJykudHJhY2s7XG4gIHRyYWNrRnVuYy5hcHBseShudWxsLCBhcmdzKTtcbn1cblxuY29uc3QgQW5hbHl0aWNzRXZlbnRzID0ge1xuICBERUJVR0dFUl9TVEFSVDogICAgICAgJ2RlYnVnZ2VyLXN0YXJ0JyxcbiAgREVCVUdHRVJfU1RBUlRfRkFJTDogICdkZWJ1Z2dlci1zdGFydC1mYWlsJyxcbiAgREVCVUdHRVJfU1RPUDogICAgICAgICdkZWJ1Z2dlci1zdG9wJyxcbn07XG5cbi8qKlxuICogRmx1eCBzdHlsZSBhY3Rpb24gY3JlYXRvciBmb3IgYWN0aW9ucyB0aGF0IGFmZmVjdCB0aGUgZGVidWdnZXIuXG4gKi9cbmNsYXNzIERlYnVnZ2VyQWN0aW9ucyB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG4gIF9zdG9yZTogRGVidWdnZXJTdG9yZTtcbiAgX2JyaWRnZTogQnJpZGdlVHlwZTtcblxuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyOiBEaXNwYXRjaGVyLCBzdG9yZTogRGVidWdnZXJTdG9yZSkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JlO1xuICB9XG5cbiAgYXN5bmMgc3RhcnREZWJ1Z2dpbmcocHJvY2Vzc0luZm86IERlYnVnZ2VyUHJvY2Vzc0luZm9UeXBlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJhY2soQW5hbHl0aWNzRXZlbnRzLkRFQlVHR0VSX1NUQVJULCB7XG4gICAgICBzZXJ2aWNlTmFtZTogcHJvY2Vzc0luZm8uZ2V0U2VydmljZU5hbWUoKSxcbiAgICB9KTtcbiAgICBiZWdpblRpbWVyVHJhY2tpbmcoJ251Y2xpZGUtZGVidWdnZXItYXRvbTpzdGFydERlYnVnZ2luZycpO1xuXG4gICAgdGhpcy5raWxsRGVidWdnZXIoKTsgLy8gS2lsbCB0aGUgZXhpc3Rpbmcgc2Vzc2lvbi5cbiAgICB0aGlzLnNldEVycm9yKG51bGwpO1xuICAgIHRoaXMuX2hhbmRsZURlYnVnTW9kZVN0YXJ0KCk7XG5cbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkRFQlVHR0VSX01PREVfQ0hBTkdFLFxuICAgICAgZGF0YTogRGVidWdnZXJNb2RlLlNUQVJUSU5HLFxuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRlYnVnU2Vzc2lvbiA9IGF3YWl0IHByb2Nlc3NJbmZvLmRlYnVnKCk7XG4gICAgICBhd2FpdCB0aGlzLl93YWl0Rm9yQ2hyb21lQ29ubmVjdGlvbihkZWJ1Z1Nlc3Npb24pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZmFpbFRpbWVyVHJhY2tpbmcoZXJyKTtcbiAgICAgIHRyYWNrKEFuYWx5dGljc0V2ZW50cy5ERUJVR0dFUl9TVEFSVF9GQUlMLCB7fSk7XG4gICAgICB0aGlzLnNldEVycm9yKCdGYWlsZWQgdG8gc3RhcnQgZGVidWdnZXIgcHJvY2VzczogJyArIGVycik7XG4gICAgICB0aGlzLmtpbGxEZWJ1Z2dlcigpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF93YWl0Rm9yQ2hyb21lQ29ubmVjdGlvbihkZWJ1Z1Nlc3Npb246IERlYnVnZ2VySW5zdGFuY2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlNFVF9ERUJVR0dFUl9QUk9DRVNTLFxuICAgICAgZGF0YTogZGVidWdTZXNzaW9uLFxuICAgIH0pO1xuXG4gICAgaWYgKGRlYnVnU2Vzc2lvbi5vblNlc3Npb25FbmQgIT0gbnVsbCkge1xuICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX2hhbmRsZVNlc3Npb25FbmQuYmluZCh0aGlzKTtcbiAgICAgIGludmFyaWFudChkZWJ1Z1Nlc3Npb24ub25TZXNzaW9uRW5kKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChkZWJ1Z1Nlc3Npb24ub25TZXNzaW9uRW5kKGhhbmRsZXIpKTtcbiAgICB9XG5cbiAgICBjb25zdCBzb2NrZXRBZGRyID0gYXdhaXQgZGVidWdTZXNzaW9uLmdldFdlYnNvY2tldEFkZHJlc3MoKTtcbiAgICBlbmRUaW1lclRyYWNraW5nKCk7XG5cbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlNFVF9QUk9DRVNTX1NPQ0tFVCxcbiAgICAgIGRhdGE6IHNvY2tldEFkZHIsXG4gICAgfSk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5ERUJVR0dFUl9NT0RFX0NIQU5HRSxcbiAgICAgIGRhdGE6IERlYnVnZ2VyTW9kZS5SVU5OSU5HLCAgLy8gRGVidWdnZXIgZmluaXNoZWQgaW5pdGlhbGl6aW5nIGFuZCBlbnRlcmVkIGRlYnVnIG1vZGUuXG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlU2Vzc2lvbkVuZCgpOiB2b2lkIHtcbiAgICB0aGlzLmtpbGxEZWJ1Z2dlcigpO1xuICB9XG5cbiAga2lsbERlYnVnZ2VyKCkge1xuICAgIGlmICh0aGlzLl9zdG9yZS5nZXREZWJ1Z2dlck1vZGUoKSA9PT0gRGVidWdnZXJNb2RlLlNUT1BQSU5HKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5ERUJVR0dFUl9NT0RFX0NIQU5HRSxcbiAgICAgIGRhdGE6IERlYnVnZ2VyTW9kZS5TVE9QUElORyxcbiAgICB9KTtcbiAgICBjb25zdCBkZWJ1Z1Nlc3Npb24gPSB0aGlzLl9zdG9yZS5nZXREZWJ1Z2dlclByb2Nlc3MoKTtcbiAgICBpZiAoZGVidWdTZXNzaW9uICE9IG51bGwpIHtcbiAgICAgIGRlYnVnU2Vzc2lvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0RFQlVHR0VSX1BST0NFU1MsXG4gICAgICAgIGRhdGE6IG51bGwsXG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBudWxsLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuREVCVUdHRVJfTU9ERV9DSEFOR0UsXG4gICAgICBkYXRhOiBEZWJ1Z2dlck1vZGUuU1RPUFBFRCxcbiAgICB9KTtcbiAgICB0cmFjayhBbmFseXRpY3NFdmVudHMuREVCVUdHRVJfU1RPUCk7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuICB9XG5cbiAgYWRkU2VydmljZShzZXJ2aWNlOiBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkFERF9TRVJWSUNFLFxuICAgICAgZGF0YTogc2VydmljZSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZVNlcnZpY2Uoc2VydmljZTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5SRU1PVkVfU0VSVklDRSxcbiAgICAgIGRhdGE6IHNlcnZpY2UsXG4gICAgfSk7XG4gIH1cblxuICBhZGREZWJ1Z2dlclByb3ZpZGVyKHByb3ZpZGVyOiBOdWNsaWRlRGVidWdnZXJQcm92aWRlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuQUREX0RFQlVHR0VSX1BST1ZJREVSLFxuICAgICAgZGF0YTogcHJvdmlkZXIsXG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVEZWJ1Z2dlclByb3ZpZGVyKHByb3ZpZGVyOiBOdWNsaWRlRGVidWdnZXJQcm92aWRlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuUkVNT1ZFX0RFQlVHR0VSX1BST1ZJREVSLFxuICAgICAgZGF0YTogcHJvdmlkZXIsXG4gICAgfSk7XG4gIH1cblxuICBhZGRFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVyKHByb3ZpZGVyOiBOdWNsaWRlRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuQUREX0VWQUxVQVRJT05fRVhQUkVTU0lPTl9QUk9WSURFUixcbiAgICAgIGRhdGE6IHByb3ZpZGVyLFxuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcihwcm92aWRlcjogTnVjbGlkZUV2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlJFTU9WRV9FVkFMVUFUSU9OX0VYUFJFU1NJT05fUFJPVklERVIsXG4gICAgICBkYXRhOiBwcm92aWRlcixcbiAgICB9KTtcbiAgfVxuXG4gIHNldEVycm9yKGVycm9yOiA/c3RyaW5nKSB7XG4gICAgcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCkuZXJyb3IoZXJyb3IpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0VSUk9SLFxuICAgICAgZGF0YTogZXJyb3IsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXRpbGl0eSBmb3IgZGVidWdnaW5nLlxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIHNldCBhbiBleGlzdGluZyBzb2NrZXQsIGJ5cGFzc2luZyBub3JtYWwgVUkgZmxvdyB0b1xuICAgKiBpbXByb3ZlIGl0ZXJhdGlvbiBzcGVlZCBmb3IgZGV2ZWxvcG1lbnQuXG4gICAqL1xuICBmb3JjZVByb2Nlc3NTb2NrZXQoc29ja2V0QWRkcjogP3N0cmluZykge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX1BST0NFU1NfU09DS0VULFxuICAgICAgZGF0YTogc29ja2V0QWRkcixcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IGZvciBnZXR0aW5nIHJlZnJlc2hlZCBjb25uZWN0aW9ucy5cbiAgICogVE9ETzogcmVmcmVzaCBjb25uZWN0aW9ucyB3aGVuIG5ldyBkaXJlY3RvcmllcyBhcmUgcmVtb3ZlZC9hZGRlZCBpbiBmaWxlLXRyZWUuXG4gICAqL1xuICB1cGRhdGVDb25uZWN0aW9ucygpOiB2b2lkIHtcblxuICAgIGNvbnN0IGNvbm5lY3Rpb25zID0gdGhpcy5fZ2V0UmVtb3RlQ29ubmVjdGlvbnMoKTtcbiAgICAvLyBBbHdheXMgaGF2ZSBvbmUgc2luZ2xlIGxvY2FsIGNvbm5lY3Rpb24uXG4gICAgY29ubmVjdGlvbnMucHVzaCgnbG9jYWwnKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlVQREFURV9DT05ORUNUSU9OUyxcbiAgICAgIGRhdGE6IGNvbm5lY3Rpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCByZW1vdGUgY29ubmVjdGlvbnMgd2l0aG91dCBkdXBsaWNhdGlvbi5cbiAgICovXG4gIF9nZXRSZW1vdGVDb25uZWN0aW9ucygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICAvLyBUT0RPOiBtb3ZlIHRoaXMgbG9naWMgaW50byBSZW1vdGVDb25uZWN0aW9uIHBhY2thZ2UuXG4gICAgcmV0dXJuIGF0b20ucHJvamVjdC5nZXRQYXRocygpLmZpbHRlcihwYXRoID0+IHtcbiAgICAgIHJldHVybiByZW1vdGVVcmkuaXNSZW1vdGUocGF0aCk7XG4gICAgfSkubWFwKHJlbW90ZVBhdGggPT4ge1xuICAgICAgY29uc3Qge2hvc3RuYW1lLCBwb3J0fSA9IHJlbW90ZVVyaS5wYXJzZVJlbW90ZVVyaShyZW1vdGVQYXRoKTtcbiAgICAgIHJldHVybiByZW1vdGVVcmkuY3JlYXRlUmVtb3RlVXJpKGhvc3RuYW1lLCBOdW1iZXIocG9ydCksICcvJyk7XG4gICAgfSkuZmlsdGVyKChwYXRoLCBpbmRleCwgaW5wdXRBcnJheSkgPT4ge1xuICAgICAgcmV0dXJuIGlucHV0QXJyYXkuaW5kZXhPZihwYXRoKSA9PT0gaW5kZXg7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGVuZFRpbWVyVHJhY2tpbmcoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfaGFuZGxlRGVidWdNb2RlU3RhcnQoKTogdm9pZCB7XG4gICAgLy8gT3BlbiB0aGUgY29uc29sZSB3aW5kb3cgaWYgaXQncyBub3QgYWxyZWFkeSBvcGVuZWQuXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnbnVjbGlkZS1jb25zb2xlOnNob3cnKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VyQWN0aW9ucztcbiJdfQ==