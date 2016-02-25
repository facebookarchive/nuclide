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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyQWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7K0JBYXNFLG1CQUFtQjs7Ozs7Ozs7OztBQUZ6RixJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7O2VBQ1gsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBdEMsbUJBQW1CLFlBQW5CLG1CQUFtQjs7QUFhMUIsU0FBUyxLQUFLLEdBQWU7QUFDM0IsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsS0FBSyxDQUFDOztvQ0FEdEMsSUFBSTtBQUFKLFFBQUk7OztBQUVwQixXQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztDQUM3Qjs7QUFFRCxJQUFNLGVBQWUsR0FBRztBQUN0QixnQkFBYyxFQUFRLGdCQUFnQjtBQUN0QyxxQkFBbUIsRUFBRyxxQkFBcUI7QUFDM0MsZUFBYSxFQUFTLGVBQWU7Q0FDdEMsQ0FBQzs7Ozs7O0lBS0ksZUFBZTtBQU1SLFdBTlAsZUFBZSxDQU1QLFVBQXNCLEVBQUUsS0FBd0IsRUFBRTswQkFOMUQsZUFBZTs7QUFPakIsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7QUFDOUMsUUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7QUFDOUIsUUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7R0FDckI7O2VBVkcsZUFBZTs7NkJBWUMsV0FBQyxXQUFvQyxFQUFpQjtBQUN4RSxXQUFLLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRTtBQUNwQyxtQkFBVyxFQUFFLFdBQVcsQ0FBQyxjQUFjLEVBQUU7T0FDMUMsQ0FBQyxDQUFDO0FBQ0gsK0NBQW1CLHNDQUFzQyxDQUFDLENBQUM7O0FBRTNELFVBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNwQixVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BCLFVBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDOztBQUU3QixVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CO0FBQ2xELFlBQUksRUFBRSxVQUFVO09BQ2pCLENBQUMsQ0FBQzs7QUFFSCxVQUFJO0FBQ0YsWUFBTSxZQUFZLEdBQUcsTUFBTSxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDL0MsY0FBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsWUFBWSxDQUFDLENBQUM7T0FDbkQsQ0FBQyxPQUFPLEdBQUcsRUFBRTtBQUNaLGdEQUFrQixHQUFHLENBQUMsQ0FBQztBQUN2QixhQUFLLENBQUMsZUFBZSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQy9DLFlBQUksQ0FBQyxRQUFRLENBQUMsb0NBQW9DLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDMUQsWUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO09BQ3JCO0tBQ0Y7Ozs2QkFFNkIsV0FBQyxZQUE4QixFQUFpQjtBQUM1RSxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CO0FBQ2xELFlBQUksRUFBRSxZQUFZO09BQ25CLENBQUMsQ0FBQzs7OztBQUlILFVBQUksWUFBWSxDQUFDLFlBQVksRUFBRTtBQUM3QixZQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3JGOztBQUVELFVBQU0sVUFBVSxHQUFHLE1BQU0sWUFBWSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDNUQsOENBQWtCLENBQUM7O0FBRW5CLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0I7QUFDaEQsWUFBSSxFQUFFLFVBQVU7T0FDakIsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLG9CQUFvQjtBQUNsRCxZQUFJLEVBQUUsV0FBVyxFQUNsQixDQUFDLENBQUM7S0FDSjs7OztXQUVnQiw2QkFBUztBQUN4QixVQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDckI7OztXQUVXLHdCQUFHO0FBQ2IsV0FBSyxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyQyw4Q0FBa0IsQ0FBQztBQUNuQixVQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUMzQixVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDdEQsVUFBSSxZQUFZLElBQUksSUFBSSxFQUFFO0FBQ3hCLG9CQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkIsWUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsb0JBQVUsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLG9CQUFvQjtBQUNsRCxjQUFJLEVBQUUsSUFBSTtTQUNYLENBQUMsQ0FBQztPQUNKO0FBQ0QsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLGtCQUFrQjtBQUNoRCxZQUFJLEVBQUUsSUFBSTtPQUNYLENBQUMsQ0FBQztBQUNILFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0I7QUFDbEQsWUFBSSxFQUFFLFNBQVM7T0FDaEIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVTLG9CQUFDLE9BQWlDLEVBQUU7QUFDNUMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVc7QUFDekMsWUFBSSxFQUFFLE9BQU87T0FDZCxDQUFDLENBQUM7S0FDSjs7O1dBRVksdUJBQUMsT0FBaUMsRUFBRTtBQUMvQyxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsY0FBYztBQUM1QyxZQUFJLEVBQUUsT0FBTztPQUNkLENBQUMsQ0FBQztLQUNKOzs7V0FFa0IsNkJBQUMsUUFBaUMsRUFBRTtBQUNyRCxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMscUJBQXFCO0FBQ25ELFlBQUksRUFBRSxRQUFRO09BQ2YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVxQixnQ0FBQyxRQUFpQyxFQUFFO0FBQ3hELFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0I7QUFDdEQsWUFBSSxFQUFFLFFBQVE7T0FDZixDQUFDLENBQUM7S0FDSjs7O1dBRU8sa0JBQUMsS0FBYyxFQUFFO0FBQ3ZCLGFBQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyRCxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUztBQUN2QyxZQUFJLEVBQUUsS0FBSztPQUNaLENBQUMsQ0FBQztLQUNKOzs7Ozs7Ozs7O1dBUWlCLDRCQUFDLFVBQW1CLEVBQUU7QUFDdEMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLGtCQUFrQjtBQUNoRCxZQUFJLEVBQUUsVUFBVTtPQUNqQixDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUiw4Q0FBa0IsQ0FBQztBQUNuQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFb0IsaUNBQVM7O0FBRTVCLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0tBQ25GOzs7V0FFa0IsK0JBQVM7OztBQUcxQixVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUscUJBQXFCLENBQUMsQ0FBQztLQUNuRjs7O1NBeEpHLGVBQWU7OztBQTJKckIsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiRGVidWdnZXJBY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgQ29uc3RhbnRzID0gcmVxdWlyZSgnLi9Db25zdGFudHMnKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmltcG9ydCB7YmVnaW5UaW1lclRyYWNraW5nLCBmYWlsVGltZXJUcmFja2luZywgZW5kVGltZXJUcmFja2luZ30gZnJvbSAnLi9BbmFseXRpY3NIZWxwZXInO1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgdHlwZSB7XG4gIG51Y2xpZGVfZGVidWdnZXIkU2VydmljZSxcbiAgTnVjbGlkZURlYnVnZ2VyUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc2VydmljZSc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlclN0b3JlVHlwZSBmcm9tICcuL0RlYnVnZ2VyU3RvcmUnO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJQcm9jZXNzSW5mb1R5cGUgZnJvbSAnLi9EZWJ1Z2dlclByb2Nlc3NJbmZvJztcbmltcG9ydCB0eXBlIEJyaWRnZVR5cGUgZnJvbSAnLi9CcmlkZ2UnO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJJbnN0YW5jZSBmcm9tICcuL0RlYnVnZ2VySW5zdGFuY2UnO1xuXG5mdW5jdGlvbiB0cmFjayguLi5hcmdzOiBhbnkpIHtcbiAgY29uc3QgdHJhY2tGdW5jID0gcmVxdWlyZSgnLi4vLi4vLi4vYW5hbHl0aWNzJykudHJhY2s7XG4gIHRyYWNrRnVuYy5hcHBseShudWxsLCBhcmdzKTtcbn1cblxuY29uc3QgQW5hbHl0aWNzRXZlbnRzID0ge1xuICBERUJVR0dFUl9TVEFSVDogICAgICAgJ2RlYnVnZ2VyLXN0YXJ0JyxcbiAgREVCVUdHRVJfU1RBUlRfRkFJTDogICdkZWJ1Z2dlci1zdGFydC1mYWlsJyxcbiAgREVCVUdHRVJfU1RPUDogICAgICAgICdkZWJ1Z2dlci1zdG9wJyxcbn07XG5cbi8qKlxuICogRmx1eCBzdHlsZSBhY3Rpb24gY3JlYXRvciBmb3IgYWN0aW9ucyB0aGF0IGFmZmVjdCB0aGUgZGVidWdnZXIuXG4gKi9cbmNsYXNzIERlYnVnZ2VyQWN0aW9ucyB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG4gIF9zdG9yZTogRGVidWdnZXJTdG9yZVR5cGU7XG4gIF9icmlkZ2U6IEJyaWRnZVR5cGU7XG5cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlciwgc3RvcmU6IERlYnVnZ2VyU3RvcmVUeXBlKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIHRoaXMuX3N0b3JlID0gc3RvcmU7XG4gIH1cblxuICBhc3luYyBzdGFydERlYnVnZ2luZyhwcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mb1R5cGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cmFjayhBbmFseXRpY3NFdmVudHMuREVCVUdHRVJfU1RBUlQsIHtcbiAgICAgIHNlcnZpY2VOYW1lOiBwcm9jZXNzSW5mby5nZXRTZXJ2aWNlTmFtZSgpLFxuICAgIH0pO1xuICAgIGJlZ2luVGltZXJUcmFja2luZygnbnVjbGlkZS1kZWJ1Z2dlci1hdG9tOnN0YXJ0RGVidWdnaW5nJyk7XG5cbiAgICB0aGlzLmtpbGxEZWJ1Z2dlcigpOyAvLyBLaWxsIHRoZSBleGlzdGluZyBzZXNzaW9uLlxuICAgIHRoaXMuc2V0RXJyb3IobnVsbCk7XG4gICAgdGhpcy5faGFuZGxlRGVidWdNb2RlU3RhcnQoKTtcblxuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuREVCVUdHRVJfTU9ERV9DSEFOR0UsXG4gICAgICBkYXRhOiAnc3RhcnRpbmcnLFxuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRlYnVnU2Vzc2lvbiA9IGF3YWl0IHByb2Nlc3NJbmZvLmRlYnVnKCk7XG4gICAgICBhd2FpdCB0aGlzLl93YWl0Rm9yQ2hyb21lQ29ubmVjdGlvbihkZWJ1Z1Nlc3Npb24pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZmFpbFRpbWVyVHJhY2tpbmcoZXJyKTtcbiAgICAgIHRyYWNrKEFuYWx5dGljc0V2ZW50cy5ERUJVR0dFUl9TVEFSVF9GQUlMLCB7fSk7XG4gICAgICB0aGlzLnNldEVycm9yKCdGYWlsZWQgdG8gc3RhcnQgZGVidWdnZXIgcHJvY2VzczogJyArIGVycik7XG4gICAgICB0aGlzLmtpbGxEZWJ1Z2dlcigpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF93YWl0Rm9yQ2hyb21lQ29ubmVjdGlvbihkZWJ1Z1Nlc3Npb246IERlYnVnZ2VySW5zdGFuY2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlNFVF9ERUJVR0dFUl9QUk9DRVNTLFxuICAgICAgZGF0YTogZGVidWdTZXNzaW9uLFxuICAgIH0pO1xuXG4gICAgLy8gVE9ET1tqZWZmcmV5dGFuXTogY3VycmVudGx5IG9ubHkgSEhWTSBkZWJ1Z2dlciBpbXBsZW1lbnRzIHRoaXMgbWV0aG9kXG4gICAgLy8gaW52ZXN0aWdhdGUgaWYgTExEQi9Ob2RlIG5lZWRzIHRvIGltcGxlbWVudCBpdC5cbiAgICBpZiAoZGVidWdTZXNzaW9uLm9uU2Vzc2lvbkVuZCkge1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGRlYnVnU2Vzc2lvbi5vblNlc3Npb25FbmQodGhpcy5faGFuZGxlU2Vzc2lvbkVuZC5iaW5kKHRoaXMpKSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc29ja2V0QWRkciA9IGF3YWl0IGRlYnVnU2Vzc2lvbi5nZXRXZWJzb2NrZXRBZGRyZXNzKCk7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuXG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfUFJPQ0VTU19TT0NLRVQsXG4gICAgICBkYXRhOiBzb2NrZXRBZGRyLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuREVCVUdHRVJfTU9ERV9DSEFOR0UsXG4gICAgICBkYXRhOiAnZGVidWdnaW5nJywgIC8vIERlYnVnZ2VyIGZpbmlzaGVkIGluaXRpYWxpemluZyBhbmQgZW50ZXJpZyBkZWJ1ZyBtb2RlLlxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZVNlc3Npb25FbmQoKTogdm9pZCB7XG4gICAgdGhpcy5raWxsRGVidWdnZXIoKTtcbiAgfVxuXG4gIGtpbGxEZWJ1Z2dlcigpIHtcbiAgICB0cmFjayhBbmFseXRpY3NFdmVudHMuREVCVUdHRVJfU1RPUCk7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuICAgIHRoaXMuX2hhbmRsZURlYnVnTW9kZUVuZCgpO1xuICAgIGNvbnN0IGRlYnVnU2Vzc2lvbiA9IHRoaXMuX3N0b3JlLmdldERlYnVnZ2VyUHJvY2VzcygpO1xuICAgIGlmIChkZWJ1Z1Nlc3Npb24gIT0gbnVsbCkge1xuICAgICAgZGVidWdTZXNzaW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5TRVRfREVCVUdHRVJfUFJPQ0VTUyxcbiAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlNFVF9QUk9DRVNTX1NPQ0tFVCxcbiAgICAgIGRhdGE6IG51bGwsXG4gICAgfSk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5ERUJVR0dFUl9NT0RFX0NIQU5HRSxcbiAgICAgIGRhdGE6ICdzdG9wcGVkJyxcbiAgICB9KTtcbiAgfVxuXG4gIGFkZFNlcnZpY2Uoc2VydmljZTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBDb25zdGFudHMuQWN0aW9ucy5BRERfU0VSVklDRSxcbiAgICAgIGRhdGE6IHNlcnZpY2UsXG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVTZXJ2aWNlKHNlcnZpY2U6IG51Y2xpZGVfZGVidWdnZXIkU2VydmljZSkge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuUkVNT1ZFX1NFUlZJQ0UsXG4gICAgICBkYXRhOiBzZXJ2aWNlLFxuICAgIH0pO1xuICB9XG5cbiAgYWRkRGVidWdnZXJQcm92aWRlcihwcm92aWRlcjogTnVjbGlkZURlYnVnZ2VyUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLkFERF9ERUJVR0dFUl9QUk9WSURFUixcbiAgICAgIGRhdGE6IHByb3ZpZGVyLFxuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlRGVidWdnZXJQcm92aWRlcihwcm92aWRlcjogTnVjbGlkZURlYnVnZ2VyUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IENvbnN0YW50cy5BY3Rpb25zLlJFTU9WRV9ERUJVR0dFUl9QUk9WSURFUixcbiAgICAgIGRhdGE6IHByb3ZpZGVyLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0RXJyb3IoZXJyb3I6ID9zdHJpbmcpIHtcbiAgICByZXF1aXJlKCcuLi8uLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCkuZXJyb3IoZXJyb3IpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX0VSUk9SLFxuICAgICAgZGF0YTogZXJyb3IsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXRpbGl0eSBmb3IgZGVidWdnaW5nLlxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIHNldCBhbiBleGlzdGluZyBzb2NrZXQsIGJ5cGFzc2luZyBub3JtYWwgVUkgZmxvdyB0b1xuICAgKiBpbXByb3ZlIGl0ZXJhdGlvbiBzcGVlZCBmb3IgZGV2ZWxvcG1lbnQuXG4gICAqL1xuICBmb3JjZVByb2Nlc3NTb2NrZXQoc29ja2V0QWRkcjogP3N0cmluZykge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQ29uc3RhbnRzLkFjdGlvbnMuU0VUX1BST0NFU1NfU09DS0VULFxuICAgICAgZGF0YTogc29ja2V0QWRkcixcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9oYW5kbGVEZWJ1Z01vZGVTdGFydCgpOiB2b2lkIHtcbiAgICAvLyBPcGVuIHRoZSBvdXRwdXQgd2luZG93IGlmIGl0J3Mgbm90IGFscmVhZHkgb3BlbmVkLlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ251Y2xpZGUtb3V0cHV0OnNob3cnKTtcbiAgfVxuXG4gIF9oYW5kbGVEZWJ1Z01vZGVFbmQoKTogdm9pZCB7XG4gICAgLy8gQ2xvc2UgdGhlIG91dHB1dCB3aW5kb3cgd2hlbiB3ZSBhcmUgZG9uZSB3aXRoIGRlYnVnZ2luZy5cbiAgICAvLyBUT0RPKGpvbmFsZGlzbGFycnkpIGRvbid0IGNsb3NlIHRoZSB3aW5kb3cgaWYgaXQgd2FzIG9wZW4gcHJpb3IgdG8gZGVidWdnaW5nLlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ251Y2xpZGUtb3V0cHV0OmhpZGUnKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VyQWN0aW9ucztcbiJdfQ==