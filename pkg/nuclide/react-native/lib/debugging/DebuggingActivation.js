Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _commons = require('../../../commons');

var _serviceHubPlus = require('../../../service-hub-plus');

var _serviceHubPlus2 = _interopRequireDefault(_serviceHubPlus);

var _reactNativeNodeExecutorLibDebuggerProxyClient = require('../../../react-native-node-executor/lib/DebuggerProxyClient');

var _ReactNativeProcessInfo = require('./ReactNativeProcessInfo');

var _atom = require('atom');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var observableFromSubscribeFunction = _commons.event.observableFromSubscribeFunction;

/**
 * Connects the executor to the debugger.
 */

var DebuggingActivation = (function () {
  function DebuggingActivation() {
    var _this = this;

    _classCallCheck(this, DebuggingActivation);

    this._disposables = new _atom.CompositeDisposable(atom.commands.add('atom-workspace', {
      'nuclide-react-native:start-debugging': function nuclideReactNativeStartDebugging() {
        return _this._startDebugging();
      },
      'nuclide-react-native:stop-debugging': function nuclideReactNativeStopDebugging() {
        return _this._stopDebugging();
      }
    }), new _atom.Disposable(function () {
      return _this._stopDebugging();
    }));
  }

  _createClass(DebuggingActivation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
      if (this._connectionDisposables != null) {
        this._connectionDisposables.dispose();
      }
    }
  }, {
    key: '_startDebugging',
    value: function _startDebugging() {
      var _this2 = this;

      this._stopDebugging();

      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');

      var client = new _reactNativeNodeExecutorLibDebuggerProxyClient.DebuggerProxyClient();
      var service$ = _rx2['default'].Observable.fromPromise(_serviceHubPlus2['default'].consumeFirstProvider('nuclide-debugger.remote'));

      this._connectionDisposables = new _atom.CompositeDisposable(new _atom.Disposable(function () {
        return client.disconnect();
      }), new _atom.Disposable(function () {
        _this2._pendingDebuggerProcessInfo = null;
      }),

      // Start debugging as soon as we get the service. We won't yet have a pid so we use an
      // "unfinished" ProcessInfo instance, which we can later complete by calling `setPid()`
      service$.subscribe(function (debuggerService) {
        _this2._startDebuggerSession(debuggerService, null);
      }),

      // Update the debugger whenever we get a new pid. (This happens whenever the user reloads the
      // RN app.)
      // $FlowIgnore: Not sure how to annotate combineLatest
      _rx2['default'].Observable.combineLatest(service$, observableFromSubscribeFunction(client.onDidEvalApplicationScript.bind(client))).subscribe(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var debuggerService = _ref2[0];
        var pid = _ref2[1];

        _this2._updateDebuggerSession(debuggerService, pid);
      }));

      client.connect();
    }
  }, {
    key: '_stopDebugging',
    value: function _stopDebugging() {
      if (this._connectionDisposables == null) {
        return;
      }
      this._connectionDisposables.dispose();
      this._connectionDisposables = null;
    }

    /**
     * Update the debugger once we receive a pid. When debugging is first started, this will mean
     * updating the pending process info (which was created before we had a pid). After that, however,
     * we can just build new process info objects and start debugging again. This is necessary because
     * 1) we must create a ProcessInfo object in order to signal to the debugger that we're starting
     * debugging and 2) once started, there's no way of telling the debugger to start a new session
     * without creating a new ProcessInfo instance.
     */
  }, {
    key: '_updateDebuggerSession',
    value: function _updateDebuggerSession(debuggerService, pid) {
      var pendingProcessInfo = this._pendingDebuggerProcessInfo;
      if (pendingProcessInfo != null) {
        var currentPid = pendingProcessInfo.getPid();
        if (currentPid == null) {
          pendingProcessInfo.setPid(pid);
          return;
        }
      }

      this._pendingDebuggerProcessInfo = null;
      this._startDebuggerSession(debuggerService, pid);
    }
  }, {
    key: '_startDebuggerSession',
    value: function _startDebuggerSession(debuggerService, pid) {
      var _this3 = this;

      clearTimeout(this._killOnSessionsEndedTimeoutId);

      // TODO(matthewwithanm): Use project root instead of first directory.
      var currentProjectDir = atom.project.getDirectories()[0];

      if (currentProjectDir == null) {
        atom.notifications.addError('You must have an open project to debug a React Native application');
        return;
      }

      var targetUri = currentProjectDir.getPath();
      var processInfo = new _ReactNativeProcessInfo.ReactNativeProcessInfo({
        targetUri: targetUri,
        pid: pid,
        onAllSessionsEnded: function onAllSessionsEnded() {
          // We have no way to differentiate between when all sessions have closed because the user
          // closed the debugger and when all sessions have closed because the user has reloaded the
          // RN app. So we wait a bit to kill the client to make sure a new session isn't going to be
          // started (e.g. the user just reloaded the app).
          // TODO: Create a custom DebuggerInstance class that wraps the creation of the client and
          //       hides the fact that we have multiple sessions.
          _this3._killOnSessionsEndedTimeoutId = setTimeout(_this3._stopDebugging.bind(_this3), 2000);
        }
      });

      if (pid == null) {
        this._pendingDebuggerProcessInfo = processInfo;
      }

      debuggerService.startDebugging(processInfo);
    }
  }]);

  return DebuggingActivation;
})();

exports.DebuggingActivation = DebuggingActivation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2luZ0FjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUJBYW9DLGtCQUFrQjs7OEJBQy9CLDJCQUEyQjs7Ozs2REFDaEIsNkRBQTZEOztzQ0FDMUQsMEJBQTBCOztvQkFDakIsTUFBTTs7a0JBQ3JDLElBQUk7Ozs7SUFFWiwrQkFBK0Isa0JBQS9CLCtCQUErQjs7Ozs7O0lBS3pCLG1CQUFtQjtBQU9uQixXQVBBLG1CQUFtQixHQU9oQjs7OzBCQVBILG1CQUFtQjs7QUFRNUIsUUFBSSxDQUFDLFlBQVksR0FBRyw4QkFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDbEMsNENBQXNDLEVBQUU7ZUFBTSxNQUFLLGVBQWUsRUFBRTtPQUFBO0FBQ3BFLDJDQUFxQyxFQUFFO2VBQU0sTUFBSyxjQUFjLEVBQUU7T0FBQTtLQUNuRSxDQUFDLEVBQ0YscUJBQWU7YUFBTSxNQUFLLGNBQWMsRUFBRTtLQUFBLENBQUMsQ0FDNUMsQ0FBQztHQUNIOztlQWZVLG1CQUFtQjs7V0FpQnZCLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM1QixVQUFJLElBQUksQ0FBQyxzQkFBc0IsSUFBSSxJQUFJLEVBQUU7QUFDdkMsWUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3ZDO0tBQ0Y7OztXQUVjLDJCQUFTOzs7QUFDdEIsVUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUV0QixVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsQ0FBQzs7QUFFcEYsVUFBTSxNQUFNLEdBQUcsd0VBQXlCLENBQUM7QUFDekMsVUFBTSxRQUFRLEdBQUcsZ0JBQUcsVUFBVSxDQUFDLFdBQVcsQ0FDeEMsNEJBQVcsb0JBQW9CLENBQUMseUJBQXlCLENBQUMsQ0FDM0QsQ0FBQzs7QUFFRixVQUFJLENBQUMsc0JBQXNCLEdBQUcsOEJBQzVCLHFCQUFlO2VBQU0sTUFBTSxDQUFDLFVBQVUsRUFBRTtPQUFBLENBQUMsRUFDekMscUJBQWUsWUFBTTtBQUFFLGVBQUssMkJBQTJCLEdBQUcsSUFBSSxDQUFDO09BQUUsQ0FBQzs7OztBQUlsRSxjQUFRLENBQUMsU0FBUyxDQUFDLFVBQUEsZUFBZSxFQUFJO0FBQUUsZUFBSyxxQkFBcUIsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FBRSxDQUFDOzs7OztBQUs3RixzQkFBRyxVQUFVLENBQUMsYUFBYSxDQUN6QixRQUFRLEVBQ1IsK0JBQStCLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUNoRixDQUNFLFNBQVMsQ0FBQyxVQUFDLElBQXNCLEVBQUs7bUNBQTNCLElBQXNCOztZQUFyQixlQUFlO1lBQUUsR0FBRzs7QUFDL0IsZUFBSyxzQkFBc0IsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUM7T0FDbkQsQ0FBQyxDQUNMLENBQUM7O0FBRUYsWUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2xCOzs7V0FFYSwwQkFBUztBQUNyQixVQUFJLElBQUksQ0FBQyxzQkFBc0IsSUFBSSxJQUFJLEVBQUU7QUFDdkMsZUFBTztPQUNSO0FBQ0QsVUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7S0FDcEM7Ozs7Ozs7Ozs7OztXQVVxQixnQ0FBQyxlQUFxQyxFQUFFLEdBQVcsRUFBUTtBQUMvRSxVQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQztBQUM1RCxVQUFJLGtCQUFrQixJQUFJLElBQUksRUFBRTtBQUM5QixZQUFNLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMvQyxZQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsNEJBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLGlCQUFPO1NBQ1I7T0FDRjs7QUFFRCxVQUFJLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDO0FBQ3hDLFVBQUksQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDbEQ7OztXQUVvQiwrQkFBQyxlQUFxQyxFQUFFLEdBQVksRUFBUTs7O0FBQy9FLGtCQUFZLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7OztBQUdqRCxVQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTNELFVBQUksaUJBQWlCLElBQUksSUFBSSxFQUFFO0FBQzdCLFlBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUN6QixtRUFBbUUsQ0FDcEUsQ0FBQztBQUNGLGVBQU87T0FDUjs7QUFFRCxVQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QyxVQUFNLFdBQVcsR0FBRyxtREFBMkI7QUFDN0MsaUJBQVMsRUFBVCxTQUFTO0FBQ1QsV0FBRyxFQUFILEdBQUc7QUFDSCwwQkFBa0IsRUFBRSw4QkFBTTs7Ozs7OztBQU94QixpQkFBSyw2QkFBNkIsR0FBRyxVQUFVLENBQUMsT0FBSyxjQUFjLENBQUMsSUFBSSxRQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDdkY7T0FDRixDQUFDLENBQUM7O0FBRUgsVUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2YsWUFBSSxDQUFDLDJCQUEyQixHQUFHLFdBQVcsQ0FBQztPQUNoRDs7QUFFRCxxQkFBZSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUM3Qzs7O1NBeEhVLG1CQUFtQiIsImZpbGUiOiJEZWJ1Z2dpbmdBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgUmVtb3RlQ29udHJvbFNlcnZpY2UgZnJvbSAnLi4vLi4vLi4vZGVidWdnZXIvYXRvbS9saWIvUmVtb3RlQ29udHJvbFNlcnZpY2UnO1xuXG5pbXBvcnQge2V2ZW50IGFzIGNvbW1vbnNFdmVudH0gZnJvbSAnLi4vLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgc2VydmljZUh1YiBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlLWh1Yi1wbHVzJztcbmltcG9ydCB7RGVidWdnZXJQcm94eUNsaWVudH0gZnJvbSAnLi4vLi4vLi4vcmVhY3QtbmF0aXZlLW5vZGUtZXhlY3V0b3IvbGliL0RlYnVnZ2VyUHJveHlDbGllbnQnO1xuaW1wb3J0IHtSZWFjdE5hdGl2ZVByb2Nlc3NJbmZvfSBmcm9tICcuL1JlYWN0TmF0aXZlUHJvY2Vzc0luZm8nO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbmNvbnN0IHtvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9ufSA9IGNvbW1vbnNFdmVudDtcblxuLyoqXG4gKiBDb25uZWN0cyB0aGUgZXhlY3V0b3IgdG8gdGhlIGRlYnVnZ2VyLlxuICovXG5leHBvcnQgY2xhc3MgRGVidWdnaW5nQWN0aXZhdGlvbiB7XG5cbiAgX2Nvbm5lY3Rpb25EaXNwb3NhYmxlczogP0lEaXNwb3NhYmxlO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9raWxsT25TZXNzaW9uc0VuZGVkVGltZW91dElkOiA/bnVtYmVyO1xuICBfcGVuZGluZ0RlYnVnZ2VyUHJvY2Vzc0luZm86ID9SZWFjdE5hdGl2ZVByb2Nlc3NJbmZvO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLXJlYWN0LW5hdGl2ZTpzdGFydC1kZWJ1Z2dpbmcnOiAoKSA9PiB0aGlzLl9zdGFydERlYnVnZ2luZygpLFxuICAgICAgICAnbnVjbGlkZS1yZWFjdC1uYXRpdmU6c3RvcC1kZWJ1Z2dpbmcnOiAoKSA9PiB0aGlzLl9zdG9wRGVidWdnaW5nKCksXG4gICAgICB9KSxcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHRoaXMuX3N0b3BEZWJ1Z2dpbmcoKSksXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIGlmICh0aGlzLl9jb25uZWN0aW9uRGlzcG9zYWJsZXMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fY29ubmVjdGlvbkRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBfc3RhcnREZWJ1Z2dpbmcoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RvcERlYnVnZ2luZygpO1xuXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnbnVjbGlkZS1kZWJ1Z2dlcjpzaG93Jyk7XG5cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgRGVidWdnZXJQcm94eUNsaWVudCgpO1xuICAgIGNvbnN0IHNlcnZpY2UkID0gUnguT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZShcbiAgICAgIHNlcnZpY2VIdWIuY29uc3VtZUZpcnN0UHJvdmlkZXIoJ251Y2xpZGUtZGVidWdnZXIucmVtb3RlJylcbiAgICApO1xuXG4gICAgdGhpcy5fY29ubmVjdGlvbkRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiBjbGllbnQuZGlzY29ubmVjdCgpKSxcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdGhpcy5fcGVuZGluZ0RlYnVnZ2VyUHJvY2Vzc0luZm8gPSBudWxsOyB9KSxcblxuICAgICAgLy8gU3RhcnQgZGVidWdnaW5nIGFzIHNvb24gYXMgd2UgZ2V0IHRoZSBzZXJ2aWNlLiBXZSB3b24ndCB5ZXQgaGF2ZSBhIHBpZCBzbyB3ZSB1c2UgYW5cbiAgICAgIC8vIFwidW5maW5pc2hlZFwiIFByb2Nlc3NJbmZvIGluc3RhbmNlLCB3aGljaCB3ZSBjYW4gbGF0ZXIgY29tcGxldGUgYnkgY2FsbGluZyBgc2V0UGlkKClgXG4gICAgICBzZXJ2aWNlJC5zdWJzY3JpYmUoZGVidWdnZXJTZXJ2aWNlID0+IHsgdGhpcy5fc3RhcnREZWJ1Z2dlclNlc3Npb24oZGVidWdnZXJTZXJ2aWNlLCBudWxsKTsgfSksXG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgZGVidWdnZXIgd2hlbmV2ZXIgd2UgZ2V0IGEgbmV3IHBpZC4gKFRoaXMgaGFwcGVucyB3aGVuZXZlciB0aGUgdXNlciByZWxvYWRzIHRoZVxuICAgICAgLy8gUk4gYXBwLilcbiAgICAgIC8vICRGbG93SWdub3JlOiBOb3Qgc3VyZSBob3cgdG8gYW5ub3RhdGUgY29tYmluZUxhdGVzdFxuICAgICAgUnguT2JzZXJ2YWJsZS5jb21iaW5lTGF0ZXN0KFxuICAgICAgICBzZXJ2aWNlJCxcbiAgICAgICAgb2JzZXJ2YWJsZUZyb21TdWJzY3JpYmVGdW5jdGlvbihjbGllbnQub25EaWRFdmFsQXBwbGljYXRpb25TY3JpcHQuYmluZChjbGllbnQpKSxcbiAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZSgoW2RlYnVnZ2VyU2VydmljZSwgcGlkXSkgPT4ge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZURlYnVnZ2VyU2Vzc2lvbihkZWJ1Z2dlclNlcnZpY2UsIHBpZCk7XG4gICAgICAgIH0pLFxuICAgICk7XG5cbiAgICBjbGllbnQuY29ubmVjdCgpO1xuICB9XG5cbiAgX3N0b3BEZWJ1Z2dpbmcoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb25EaXNwb3NhYmxlcyA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2Nvbm5lY3Rpb25EaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fY29ubmVjdGlvbkRpc3Bvc2FibGVzID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGRlYnVnZ2VyIG9uY2Ugd2UgcmVjZWl2ZSBhIHBpZC4gV2hlbiBkZWJ1Z2dpbmcgaXMgZmlyc3Qgc3RhcnRlZCwgdGhpcyB3aWxsIG1lYW5cbiAgICogdXBkYXRpbmcgdGhlIHBlbmRpbmcgcHJvY2VzcyBpbmZvICh3aGljaCB3YXMgY3JlYXRlZCBiZWZvcmUgd2UgaGFkIGEgcGlkKS4gQWZ0ZXIgdGhhdCwgaG93ZXZlcixcbiAgICogd2UgY2FuIGp1c3QgYnVpbGQgbmV3IHByb2Nlc3MgaW5mbyBvYmplY3RzIGFuZCBzdGFydCBkZWJ1Z2dpbmcgYWdhaW4uIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2VcbiAgICogMSkgd2UgbXVzdCBjcmVhdGUgYSBQcm9jZXNzSW5mbyBvYmplY3QgaW4gb3JkZXIgdG8gc2lnbmFsIHRvIHRoZSBkZWJ1Z2dlciB0aGF0IHdlJ3JlIHN0YXJ0aW5nXG4gICAqIGRlYnVnZ2luZyBhbmQgMikgb25jZSBzdGFydGVkLCB0aGVyZSdzIG5vIHdheSBvZiB0ZWxsaW5nIHRoZSBkZWJ1Z2dlciB0byBzdGFydCBhIG5ldyBzZXNzaW9uXG4gICAqIHdpdGhvdXQgY3JlYXRpbmcgYSBuZXcgUHJvY2Vzc0luZm8gaW5zdGFuY2UuXG4gICAqL1xuICBfdXBkYXRlRGVidWdnZXJTZXNzaW9uKGRlYnVnZ2VyU2VydmljZTogUmVtb3RlQ29udHJvbFNlcnZpY2UsIHBpZDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgcGVuZGluZ1Byb2Nlc3NJbmZvID0gdGhpcy5fcGVuZGluZ0RlYnVnZ2VyUHJvY2Vzc0luZm87XG4gICAgaWYgKHBlbmRpbmdQcm9jZXNzSW5mbyAhPSBudWxsKSB7XG4gICAgICBjb25zdCBjdXJyZW50UGlkID0gcGVuZGluZ1Byb2Nlc3NJbmZvLmdldFBpZCgpO1xuICAgICAgaWYgKGN1cnJlbnRQaWQgPT0gbnVsbCkge1xuICAgICAgICBwZW5kaW5nUHJvY2Vzc0luZm8uc2V0UGlkKHBpZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9wZW5kaW5nRGVidWdnZXJQcm9jZXNzSW5mbyA9IG51bGw7XG4gICAgdGhpcy5fc3RhcnREZWJ1Z2dlclNlc3Npb24oZGVidWdnZXJTZXJ2aWNlLCBwaWQpO1xuICB9XG5cbiAgX3N0YXJ0RGVidWdnZXJTZXNzaW9uKGRlYnVnZ2VyU2VydmljZTogUmVtb3RlQ29udHJvbFNlcnZpY2UsIHBpZDogP251bWJlcik6IHZvaWQge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9raWxsT25TZXNzaW9uc0VuZGVkVGltZW91dElkKTtcblxuICAgIC8vIFRPRE8obWF0dGhld3dpdGhhbm0pOiBVc2UgcHJvamVjdCByb290IGluc3RlYWQgb2YgZmlyc3QgZGlyZWN0b3J5LlxuICAgIGNvbnN0IGN1cnJlbnRQcm9qZWN0RGlyID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF07XG5cbiAgICBpZiAoY3VycmVudFByb2plY3REaXIgPT0gbnVsbCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAnWW91IG11c3QgaGF2ZSBhbiBvcGVuIHByb2plY3QgdG8gZGVidWcgYSBSZWFjdCBOYXRpdmUgYXBwbGljYXRpb24nXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhcmdldFVyaSA9IGN1cnJlbnRQcm9qZWN0RGlyLmdldFBhdGgoKTtcbiAgICBjb25zdCBwcm9jZXNzSW5mbyA9IG5ldyBSZWFjdE5hdGl2ZVByb2Nlc3NJbmZvKHtcbiAgICAgIHRhcmdldFVyaSxcbiAgICAgIHBpZCxcbiAgICAgIG9uQWxsU2Vzc2lvbnNFbmRlZDogKCkgPT4ge1xuICAgICAgICAvLyBXZSBoYXZlIG5vIHdheSB0byBkaWZmZXJlbnRpYXRlIGJldHdlZW4gd2hlbiBhbGwgc2Vzc2lvbnMgaGF2ZSBjbG9zZWQgYmVjYXVzZSB0aGUgdXNlclxuICAgICAgICAvLyBjbG9zZWQgdGhlIGRlYnVnZ2VyIGFuZCB3aGVuIGFsbCBzZXNzaW9ucyBoYXZlIGNsb3NlZCBiZWNhdXNlIHRoZSB1c2VyIGhhcyByZWxvYWRlZCB0aGVcbiAgICAgICAgLy8gUk4gYXBwLiBTbyB3ZSB3YWl0IGEgYml0IHRvIGtpbGwgdGhlIGNsaWVudCB0byBtYWtlIHN1cmUgYSBuZXcgc2Vzc2lvbiBpc24ndCBnb2luZyB0byBiZVxuICAgICAgICAvLyBzdGFydGVkIChlLmcuIHRoZSB1c2VyIGp1c3QgcmVsb2FkZWQgdGhlIGFwcCkuXG4gICAgICAgIC8vIFRPRE86IENyZWF0ZSBhIGN1c3RvbSBEZWJ1Z2dlckluc3RhbmNlIGNsYXNzIHRoYXQgd3JhcHMgdGhlIGNyZWF0aW9uIG9mIHRoZSBjbGllbnQgYW5kXG4gICAgICAgIC8vICAgICAgIGhpZGVzIHRoZSBmYWN0IHRoYXQgd2UgaGF2ZSBtdWx0aXBsZSBzZXNzaW9ucy5cbiAgICAgICAgdGhpcy5fa2lsbE9uU2Vzc2lvbnNFbmRlZFRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5fc3RvcERlYnVnZ2luZy5iaW5kKHRoaXMpLCAyMDAwKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBpZiAocGlkID09IG51bGwpIHtcbiAgICAgIHRoaXMuX3BlbmRpbmdEZWJ1Z2dlclByb2Nlc3NJbmZvID0gcHJvY2Vzc0luZm87XG4gICAgfVxuXG4gICAgZGVidWdnZXJTZXJ2aWNlLnN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvKTtcbiAgfVxuXG59XG4iXX0=