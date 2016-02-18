var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _AnalyticsHelper = require('./AnalyticsHelper');

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
      var debugSession = this._store.getDebuggerProcess();
      if (debugSession) {
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
  }, {
    key: 'dispose',
    value: function dispose() {
      (0, _AnalyticsHelper.endTimerTracking)();
      this._disposables.dispose();
    }
  }]);

  return DebuggerActions;
})();

module.exports = DebuggerActions;
//# sourceMappingURL=data:application/json;base64,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UUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxjQUFjO0FBQzVDLFlBQUksRUFBRSxPQUFPO09BQ2QsQ0FBQyxDQUFDO0tBQ0o7OztXQUVPLGtCQUFDLEtBQWMsRUFBRTtBQUN2QixhQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckQsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVM7QUFDdkMsWUFBSSxFQUFFLEtBQUs7T0FDWixDQUFDLENBQUM7S0FDSjs7Ozs7Ozs7OztXQVFpQiw0QkFBQyxVQUFtQixFQUFFO0FBQ3RDLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0I7QUFDaEQsWUFBSSxFQUFFLFVBQVU7T0FDakIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVNLG1CQUFHO0FBQ1IsOENBQWtCLENBQUM7QUFDbkIsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1NBN0hHLGVBQWU7OztBQWdJckIsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiRGVidWdnZXJBY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgQ29uc3RhbnRzID0gcmVxdWlyZSgnLi9Db25zdGFudHMnKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmltcG9ydCB7YmVnaW5UaW1lclRyYWNraW5nLCBmYWlsVGltZXJUcmFja2luZywgZW5kVGltZXJUcmFja2luZ30gZnJvbSAnLi9BbmFseXRpY3NIZWxwZXInO1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgdHlwZSB7bnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlfSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL3NlcnZpY2UnO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJTdG9yZVR5cGUgZnJvbSAnLi9EZWJ1Z2dlclN0b3JlJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyUHJvY2Vzc0luZm9UeXBlIGZyb20gJy4vRGVidWdnZXJQcm9jZXNzSW5mbyc7XG5pbXBvcnQgdHlwZSBCcmlkZ2VUeXBlIGZyb20gJy4vQnJpZGdlJztcbmltcG9ydCB0eXBlIERlYnVnZ2VySW5zdGFuY2UgZnJvbSAnLi9EZWJ1Z2dlckluc3RhbmNlJztcblxuZnVuY3Rpb24gdHJhY2soLi4uYXJnczogYW55KSB7XG4gIGNvbnN0IHRyYWNrRnVuYyA9IHJlcXVpcmUoJy4uLy4uLy4uL2FuYWx5dGljcycpLnRyYWNrO1xuICB0cmFja0Z1bmMuYXBwbHkobnVsbCwgYXJncyk7XG59XG5cbmNvbnN0IEFuYWx5dGljc0V2ZW50cyA9IHtcbiAgREVCVUdHRVJfU1RBUlQ6ICAgICAgICdkZWJ1Z2dlci1zdGFydCcsXG4gIERFQlVHR0VSX1NUQVJUX0ZBSUw6ICAnZGVidWdnZXItc3RhcnQtZmFpbCcsXG4gIERFQlVHR0VSX1NUT1A6ICAgICAgICAnZGVidWdnZXItc3RvcCcsXG59O1xuXG4vKipcbiAqIEZsdXggc3R5bGUgYWN0aW9uIGNyZWF0b3IgZm9yIGFjdGlvbnMgdGhhdCBhZmZlY3QgdGhlIGRlYnVnZ2VyLlxuICovXG5jbGFzcyBEZWJ1Z2dlckFjdGlvbnMge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfc3RvcmU6IERlYnVnZ2VyU3RvcmVUeXBlO1xuICBfYnJpZGdlOiBCcmlkZ2VUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIHN0b3JlOiBEZWJ1Z2dlclN0b3JlVHlwZSkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JlO1xuICB9XG5cbiAgYXN5bmMgc3RhcnREZWJ1Z2dpbmcocHJvY2Vzc0luZm86IERlYnVnZ2VyUHJvY2Vzc0luZm9UeXBlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJhY2soQW5hbHl0aWNzRXZlbnRzLkRFQlVHR0VSX1NUQVJULCB7XG4gICAgICBzZXJ2aWNlTmFtZTogcHJvY2Vzc0luZm8uZ2V0U2VydmljZU5hbWUoKSxcbiAgICB9KTtcbiAgICBiZWdpblRpbWVyVHJhY2tpbmcoJ251Y2xpZGUtZGVidWdnZXItYXRvbTpzdGFydERlYnVnZ2luZycpO1xuXG4gICAgdGhpcy5raWxsRGVidWdnZXIoKTsgLy8gS2lsbCB0aGUgZXhpc3Rpbmcgc2Vzc2lvbi5cbiAgICB0aGlzLnNldEVycm9yKG51bGwpO1xuXG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5ERUJVR0dFUl9NT0RFX0NIQU5HRSxcbiAgICAgIGRhdGE6ICdzdGFydGluZycsXG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZGVidWdTZXNzaW9uID0gYXdhaXQgcHJvY2Vzc0luZm8uZGVidWcoKTtcbiAgICAgIGF3YWl0IHRoaXMuX3dhaXRGb3JDaHJvbWVDb25uZWN0aW9uKGRlYnVnU2Vzc2lvbik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBmYWlsVGltZXJUcmFja2luZyhlcnIpO1xuICAgICAgdHJhY2soQW5hbHl0aWNzRXZlbnRzLkRFQlVHR0VSX1NUQVJUX0ZBSUwsIHt9KTtcbiAgICAgIHRoaXMuc2V0RXJyb3IoJ0ZhaWxlZCB0byBzdGFydCBkZWJ1Z2dlciBwcm9jZXNzOiAnICsgZXJyKTtcbiAgICAgIHRoaXMua2lsbERlYnVnZ2VyKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3dhaXRGb3JDaHJvbWVDb25uZWN0aW9uKGRlYnVnU2Vzc2lvbjogRGVidWdnZXJJbnN0YW5jZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0RFQlVHR0VSX1BST0NFU1MsXG4gICAgICBkYXRhOiBkZWJ1Z1Nlc3Npb24sXG4gICAgfSk7XG5cbiAgICAvLyBUT0RPW2plZmZyZXl0YW5dOiBjdXJyZW50bHkgb25seSBISFZNIGRlYnVnZ2VyIGltcGxlbWVudHMgdGhpcyBtZXRob2RcbiAgICAvLyBpbnZlc3RpZ2F0ZSBpZiBMTERCL05vZGUgbmVlZHMgdG8gaW1wbGVtZW50IGl0LlxuICAgIGlmIChkZWJ1Z1Nlc3Npb24ub25TZXNzaW9uRW5kKSB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoZGVidWdTZXNzaW9uLm9uU2Vzc2lvbkVuZCh0aGlzLl9oYW5kbGVTZXNzaW9uRW5kLmJpbmQodGhpcykpKTtcbiAgICB9XG5cbiAgICBjb25zdCBzb2NrZXRBZGRyID0gYXdhaXQgZGVidWdTZXNzaW9uLmdldFdlYnNvY2tldEFkZHJlc3MoKTtcbiAgICBlbmRUaW1lclRyYWNraW5nKCk7XG5cbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlNFVF9QUk9DRVNTX1NPQ0tFVCxcbiAgICAgIGRhdGE6IHNvY2tldEFkZHIsXG4gICAgfSk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5ERUJVR0dFUl9NT0RFX0NIQU5HRSxcbiAgICAgIGRhdGE6ICdkZWJ1Z2dpbmcnLCAgLy8gRGVidWdnZXIgZmluaXNoZWQgaW5pdGlhbGl6aW5nIGFuZCBlbnRlcmlnIGRlYnVnIG1vZGUuXG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlU2Vzc2lvbkVuZCgpOiB2b2lkIHtcbiAgICB0aGlzLmtpbGxEZWJ1Z2dlcigpO1xuICB9XG5cbiAga2lsbERlYnVnZ2VyKCkge1xuICAgIHRyYWNrKEFuYWx5dGljc0V2ZW50cy5ERUJVR0dFUl9TVE9QKTtcbiAgICBlbmRUaW1lclRyYWNraW5nKCk7XG4gICAgY29uc3QgZGVidWdTZXNzaW9uID0gdGhpcy5fc3RvcmUuZ2V0RGVidWdnZXJQcm9jZXNzKCk7XG4gICAgaWYgKGRlYnVnU2Vzc2lvbikge1xuICAgICAgZGVidWdTZXNzaW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfREVCVUdHRVJfUFJPQ0VTUyxcbiAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlNFVF9QUk9DRVNTX1NPQ0tFVCxcbiAgICAgIGRhdGE6IG51bGwsXG4gICAgfSk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5ERUJVR0dFUl9NT0RFX0NIQU5HRSxcbiAgICAgIGRhdGE6ICdzdG9wcGVkJyxcbiAgICB9KTtcbiAgfVxuXG4gIGFkZFNlcnZpY2Uoc2VydmljZTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5BRERfU0VSVklDRSxcbiAgICAgIGRhdGE6IHNlcnZpY2UsXG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVTZXJ2aWNlKHNlcnZpY2U6IG51Y2xpZGVfZGVidWdnZXIkU2VydmljZSkge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuUkVNT1ZFX1NFUlZJQ0UsXG4gICAgICBkYXRhOiBzZXJ2aWNlLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0RXJyb3IoZXJyb3I6ID9zdHJpbmcpIHtcbiAgICByZXF1aXJlKCcuLi8uLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCkuZXJyb3IoZXJyb3IpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0VSUk9SLFxuICAgICAgZGF0YTogZXJyb3IsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXRpbGl0eSBmb3IgZGVidWdnaW5nLlxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIHNldCBhbiBleGlzdGluZyBzb2NrZXQsIGJ5cGFzc2luZyBub3JtYWwgVUkgZmxvdyB0b1xuICAgKiBpbXByb3ZlIGl0ZXJhdGlvbiBzcGVlZCBmb3IgZGV2ZWxvcG1lbnQuXG4gICAqL1xuICBmb3JjZVByb2Nlc3NTb2NrZXQoc29ja2V0QWRkcjogP3N0cmluZykge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX1BST0NFU1NfU09DS0VULFxuICAgICAgZGF0YTogc29ja2V0QWRkcixcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VyQWN0aW9ucztcbiJdfQ==