var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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
    key: 'attachToProcess',
    value: function attachToProcess(processInfo, launchTarget) {
      var _this = this;

      track(AnalyticsEvents.DEBUGGER_START, {
        serviceName: processInfo.getServiceName()
      });
      (0, _AnalyticsHelper.beginTimerTracking)('nuclide-debugger-atom:attachToProcess');

      this.killDebugger(); // Kill the existing session.
      this.setError(null);

      var process = null;
      if (launchTarget) {
        process = processInfo.launch(launchTarget);
      } else {
        process = processInfo.attach();
      }
      this._dispatcher.dispatch({
        actionType: Constants.Actions.SET_DEBUGGER_PROCESS,
        data: process
      });

      // TODO[jeffreytan]: currently only HHVM debugger implements this method
      // investigate if LLDB/Node needs to implement it.
      if (process.onSessionEnd) {
        this._disposables.add(process.onSessionEnd(this._handleSessionEnd.bind(this)));
      }

      process.getWebsocketAddress().then(function (socketAddr) {
        (0, _AnalyticsHelper.endTimerTracking)();
        _this._dispatcher.dispatch({
          actionType: Constants.Actions.SET_PROCESS_SOCKET,
          data: socketAddr
        });
      }, function (err) {
        (0, _AnalyticsHelper.failTimerTracking)(err);
        track(AnalyticsEvents.DEBUGGER_START_FAIL, {});
        _this.setError('Failed to start debugger process: ' + err);
        _this.killDebugger();
      });
    }
  }, {
    key: '_handleSessionEnd',
    value: function _handleSessionEnd() {
      this.killDebugger();
    }
  }, {
    key: 'killDebugger',
    value: function killDebugger() {
      track(AnalyticsEvents.DEBUGGER_STOP);
      (0, _AnalyticsHelper.endTimerTracking)();
      var process = this._store.getDebuggerProcess();
      if (process) {
        process.dispose();
        this._dispatcher.dispatch({
          actionType: Constants.Actions.SET_DEBUGGER_PROCESS,
          data: null
        });
      }
      this._dispatcher.dispatch({
        actionType: Constants.Actions.SET_PROCESS_SOCKET,
        data: null
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
//# sourceMappingURL=data:application/json;base64,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QUMsVUFBbUIsRUFBRTtBQUN0QyxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCO0FBQ2hELFlBQUksRUFBRSxVQUFVO09BQ2pCLENBQUMsQ0FBQztLQUNKOzs7V0FFTSxtQkFBRztBQUNSLDhDQUFrQixDQUFDO0FBQ25CLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztTQWxIRyxlQUFlOzs7QUFxSHJCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IkRlYnVnZ2VyQWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IENvbnN0YW50cyA9IHJlcXVpcmUoJy4vQ29uc3RhbnRzJyk7XG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5pbXBvcnQge2JlZ2luVGltZXJUcmFja2luZywgZmFpbFRpbWVyVHJhY2tpbmcsIGVuZFRpbWVyVHJhY2tpbmd9IGZyb20gJy4vQW5hbHl0aWNzSGVscGVyJztcblxuaW1wb3J0IHR5cGUge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuaW1wb3J0IHR5cGUge251Y2xpZGVfZGVidWdnZXIkU2VydmljZX0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zZXJ2aWNlJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyU3RvcmVUeXBlIGZyb20gJy4vRGVidWdnZXJTdG9yZSc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlclByb2Nlc3NJbmZvVHlwZSBmcm9tICcuL0RlYnVnZ2VyUHJvY2Vzc0luZm8nO1xuaW1wb3J0IHR5cGUgQnJpZGdlVHlwZSBmcm9tICcuL0JyaWRnZSc7XG5cbmZ1bmN0aW9uIHRyYWNrKC4uLmFyZ3M6IGFueSkge1xuICBjb25zdCB0cmFja0Z1bmMgPSByZXF1aXJlKCcuLi8uLi8uLi9hbmFseXRpY3MnKS50cmFjaztcbiAgdHJhY2tGdW5jLmFwcGx5KG51bGwsIGFyZ3MpO1xufVxuXG5jb25zdCBBbmFseXRpY3NFdmVudHMgPSB7XG4gIERFQlVHR0VSX1NUQVJUOiAgICAgICAnZGVidWdnZXItc3RhcnQnLFxuICBERUJVR0dFUl9TVEFSVF9GQUlMOiAgJ2RlYnVnZ2VyLXN0YXJ0LWZhaWwnLFxuICBERUJVR0dFUl9TVE9QOiAgICAgICAgJ2RlYnVnZ2VyLXN0b3AnLFxufTtcblxuLyoqXG4gKiBGbHV4IHN0eWxlIGFjdGlvbiBjcmVhdG9yIGZvciBhY3Rpb25zIHRoYXQgYWZmZWN0IHRoZSBkZWJ1Z2dlci5cbiAqL1xuY2xhc3MgRGVidWdnZXJBY3Rpb25zIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX3N0b3JlOiBEZWJ1Z2dlclN0b3JlVHlwZTtcbiAgX2JyaWRnZTogQnJpZGdlVHlwZTtcblxuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyOiBEaXNwYXRjaGVyLCBzdG9yZTogRGVidWdnZXJTdG9yZVR5cGUpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yZTtcbiAgfVxuXG4gIGF0dGFjaFRvUHJvY2Vzcyhwcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mb1R5cGUsIGxhdW5jaFRhcmdldDogP3N0cmluZykge1xuICAgIHRyYWNrKEFuYWx5dGljc0V2ZW50cy5ERUJVR0dFUl9TVEFSVCwge1xuICAgICAgc2VydmljZU5hbWU6IHByb2Nlc3NJbmZvLmdldFNlcnZpY2VOYW1lKCksXG4gICAgfSk7XG4gICAgYmVnaW5UaW1lclRyYWNraW5nKCdudWNsaWRlLWRlYnVnZ2VyLWF0b206YXR0YWNoVG9Qcm9jZXNzJyk7XG5cbiAgICB0aGlzLmtpbGxEZWJ1Z2dlcigpOyAvLyBLaWxsIHRoZSBleGlzdGluZyBzZXNzaW9uLlxuICAgIHRoaXMuc2V0RXJyb3IobnVsbCk7XG5cbiAgICBsZXQgcHJvY2VzcyA9IG51bGw7XG4gICAgaWYgKGxhdW5jaFRhcmdldCkge1xuICAgICAgcHJvY2VzcyA9IHByb2Nlc3NJbmZvLmxhdW5jaChsYXVuY2hUYXJnZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9jZXNzID0gcHJvY2Vzc0luZm8uYXR0YWNoKCk7XG4gICAgfVxuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0RFQlVHR0VSX1BST0NFU1MsXG4gICAgICBkYXRhOiBwcm9jZXNzLFxuICAgIH0pO1xuXG4gICAgLy8gVE9ET1tqZWZmcmV5dGFuXTogY3VycmVudGx5IG9ubHkgSEhWTSBkZWJ1Z2dlciBpbXBsZW1lbnRzIHRoaXMgbWV0aG9kXG4gICAgLy8gaW52ZXN0aWdhdGUgaWYgTExEQi9Ob2RlIG5lZWRzIHRvIGltcGxlbWVudCBpdC5cbiAgICBpZiAocHJvY2Vzcy5vblNlc3Npb25FbmQpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChwcm9jZXNzLm9uU2Vzc2lvbkVuZCh0aGlzLl9oYW5kbGVTZXNzaW9uRW5kLmJpbmQodGhpcykpKTtcbiAgICB9XG5cbiAgICBwcm9jZXNzLmdldFdlYnNvY2tldEFkZHJlc3MoKS50aGVuKFxuICAgICAgc29ja2V0QWRkciA9PiB7XG4gICAgICAgIGVuZFRpbWVyVHJhY2tpbmcoKTtcbiAgICAgICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX1BST0NFU1NfU09DS0VULFxuICAgICAgICAgIGRhdGE6IHNvY2tldEFkZHIsXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGVyciA9PiB7XG4gICAgICAgIGZhaWxUaW1lclRyYWNraW5nKGVycik7XG4gICAgICAgIHRyYWNrKEFuYWx5dGljc0V2ZW50cy5ERUJVR0dFUl9TVEFSVF9GQUlMLCB7fSk7XG4gICAgICAgIHRoaXMuc2V0RXJyb3IoJ0ZhaWxlZCB0byBzdGFydCBkZWJ1Z2dlciBwcm9jZXNzOiAnICsgZXJyKTtcbiAgICAgICAgdGhpcy5raWxsRGVidWdnZXIoKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZVNlc3Npb25FbmQoKTogdm9pZCB7XG4gICAgdGhpcy5raWxsRGVidWdnZXIoKTtcbiAgfVxuXG4gIGtpbGxEZWJ1Z2dlcigpIHtcbiAgICB0cmFjayhBbmFseXRpY3NFdmVudHMuREVCVUdHRVJfU1RPUCk7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuICAgIGNvbnN0IHByb2Nlc3MgPSB0aGlzLl9zdG9yZS5nZXREZWJ1Z2dlclByb2Nlc3MoKTtcbiAgICBpZiAocHJvY2Vzcykge1xuICAgICAgcHJvY2Vzcy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0RFQlVHR0VSX1BST0NFU1MsXG4gICAgICAgIGRhdGE6IG51bGwsXG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBudWxsLFxuICAgIH0pO1xuICB9XG5cbiAgYWRkU2VydmljZShzZXJ2aWNlOiBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkFERF9TRVJWSUNFLFxuICAgICAgZGF0YTogc2VydmljZSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZVNlcnZpY2Uoc2VydmljZTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5SRU1PVkVfU0VSVklDRSxcbiAgICAgIGRhdGE6IHNlcnZpY2UsXG4gICAgfSk7XG4gIH1cblxuICBzZXRFcnJvcihlcnJvcjogP3N0cmluZykge1xuICAgIHJlcXVpcmUoJy4uLy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKS5lcnJvcihlcnJvcik7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfRVJST1IsXG4gICAgICBkYXRhOiBlcnJvcixcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IGZvciBkZWJ1Z2dpbmcuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIHVzZWQgdG8gc2V0IGFuIGV4aXN0aW5nIHNvY2tldCwgYnlwYXNzaW5nIG5vcm1hbCBVSSBmbG93IHRvXG4gICAqIGltcHJvdmUgaXRlcmF0aW9uIHNwZWVkIGZvciBkZXZlbG9wbWVudC5cbiAgICovXG4gIGZvcmNlUHJvY2Vzc1NvY2tldChzb2NrZXRBZGRyOiA/c3RyaW5nKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBzb2NrZXRBZGRyLFxuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBlbmRUaW1lclRyYWNraW5nKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGVidWdnZXJBY3Rpb25zO1xuIl19