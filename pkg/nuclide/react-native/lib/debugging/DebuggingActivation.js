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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2luZ0FjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUJBYW9DLGtCQUFrQjs7OEJBQy9CLDJCQUEyQjs7Ozs2REFDaEIsNkRBQTZEOztzQ0FDMUQsMEJBQTBCOztvQkFDakIsTUFBTTs7a0JBQ3JDLElBQUk7Ozs7SUFFWiwrQkFBK0Isa0JBQS9CLCtCQUErQjs7Ozs7O0lBS3pCLG1CQUFtQjtBQU9uQixXQVBBLG1CQUFtQixHQU9oQjs7OzBCQVBILG1CQUFtQjs7QUFRNUIsUUFBSSxDQUFDLFlBQVksR0FBRyw4QkFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDbEMsNENBQXNDLEVBQUU7ZUFBTSxNQUFLLGVBQWUsRUFBRTtPQUFBO0FBQ3BFLDJDQUFxQyxFQUFFO2VBQU0sTUFBSyxjQUFjLEVBQUU7T0FBQTtLQUNuRSxDQUFDLEVBQ0YscUJBQWU7YUFBTSxNQUFLLGNBQWMsRUFBRTtLQUFBLENBQUMsQ0FDNUMsQ0FBQztHQUNIOztlQWZVLG1CQUFtQjs7V0FpQnZCLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM1QixVQUFJLElBQUksQ0FBQyxzQkFBc0IsSUFBSSxJQUFJLEVBQUU7QUFDdkMsWUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3ZDO0tBQ0Y7OztXQUVjLDJCQUFTOzs7QUFDdEIsVUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUV0QixVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsQ0FBQzs7QUFFcEYsVUFBTSxNQUFNLEdBQUcsd0VBQXlCLENBQUM7QUFDekMsVUFBTSxRQUFRLEdBQUcsZ0JBQUcsVUFBVSxDQUFDLFdBQVcsQ0FDeEMsNEJBQVcsb0JBQW9CLENBQUMseUJBQXlCLENBQUMsQ0FDM0QsQ0FBQzs7QUFFRixVQUFJLENBQUMsc0JBQXNCLEdBQUcsOEJBQzVCLHFCQUFlO2VBQU0sTUFBTSxDQUFDLFVBQVUsRUFBRTtPQUFBLENBQUMsRUFDekMscUJBQWUsWUFBTTtBQUFFLGVBQUssMkJBQTJCLEdBQUcsSUFBSSxDQUFDO09BQUUsQ0FBQzs7OztBQUlsRSxjQUFRLENBQUMsU0FBUyxDQUFDLFVBQUEsZUFBZSxFQUFJO0FBQUUsZUFBSyxxQkFBcUIsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FBRSxDQUFDOzs7O0FBSTdGLHNCQUFHLFVBQVUsQ0FBQyxhQUFhLENBQ3pCLFFBQVEsRUFDUiwrQkFBK0IsQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQ2hGLENBQ0UsU0FBUyxDQUFDLFVBQUMsSUFBc0IsRUFBSzttQ0FBM0IsSUFBc0I7O1lBQXJCLGVBQWU7WUFBRSxHQUFHOztBQUMvQixlQUFLLHNCQUFzQixDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztPQUNuRCxDQUFDLENBQ0wsQ0FBQzs7QUFFRixZQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDbEI7OztXQUVhLDBCQUFTO0FBQ3JCLFVBQUksSUFBSSxDQUFDLHNCQUFzQixJQUFJLElBQUksRUFBRTtBQUN2QyxlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdEMsVUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztLQUNwQzs7Ozs7Ozs7Ozs7O1dBVXFCLGdDQUFDLGVBQXFDLEVBQUUsR0FBVyxFQUFRO0FBQy9FLFVBQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDO0FBQzVELFVBQUksa0JBQWtCLElBQUksSUFBSSxFQUFFO0FBQzlCLFlBQU0sVUFBVSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQy9DLFlBQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0Qiw0QkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0IsaUJBQU87U0FDUjtPQUNGOztBQUVELFVBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUM7QUFDeEMsVUFBSSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztLQUNsRDs7O1dBRW9CLCtCQUFDLGVBQXFDLEVBQUUsR0FBWSxFQUFROzs7QUFDL0Usa0JBQVksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQzs7O0FBR2pELFVBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFM0QsVUFBSSxpQkFBaUIsSUFBSSxJQUFJLEVBQUU7QUFDN0IsWUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQ3pCLG1FQUFtRSxDQUNwRSxDQUFDO0FBQ0YsZUFBTztPQUNSOztBQUVELFVBQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlDLFVBQU0sV0FBVyxHQUFHLG1EQUEyQjtBQUM3QyxpQkFBUyxFQUFULFNBQVM7QUFDVCxXQUFHLEVBQUgsR0FBRztBQUNILDBCQUFrQixFQUFFLDhCQUFNOzs7Ozs7O0FBT3hCLGlCQUFLLDZCQUE2QixHQUFHLFVBQVUsQ0FBQyxPQUFLLGNBQWMsQ0FBQyxJQUFJLFFBQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN2RjtPQUNGLENBQUMsQ0FBQzs7QUFFSCxVQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDZixZQUFJLENBQUMsMkJBQTJCLEdBQUcsV0FBVyxDQUFDO09BQ2hEOztBQUVELHFCQUFlLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQzdDOzs7U0F2SFUsbUJBQW1CIiwiZmlsZSI6IkRlYnVnZ2luZ0FjdGl2YXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBSZW1vdGVDb250cm9sU2VydmljZSBmcm9tICcuLi8uLi8uLi9kZWJ1Z2dlci9hdG9tL2xpYi9SZW1vdGVDb250cm9sU2VydmljZSc7XG5cbmltcG9ydCB7ZXZlbnQgYXMgY29tbW9uc0V2ZW50fSBmcm9tICcuLi8uLi8uLi9jb21tb25zJztcbmltcG9ydCBzZXJ2aWNlSHViIGZyb20gJy4uLy4uLy4uL3NlcnZpY2UtaHViLXBsdXMnO1xuaW1wb3J0IHtEZWJ1Z2dlclByb3h5Q2xpZW50fSBmcm9tICcuLi8uLi8uLi9yZWFjdC1uYXRpdmUtbm9kZS1leGVjdXRvci9saWIvRGVidWdnZXJQcm94eUNsaWVudCc7XG5pbXBvcnQge1JlYWN0TmF0aXZlUHJvY2Vzc0luZm99IGZyb20gJy4vUmVhY3ROYXRpdmVQcm9jZXNzSW5mbyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuY29uc3Qge29ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb259ID0gY29tbW9uc0V2ZW50O1xuXG4vKipcbiAqIENvbm5lY3RzIHRoZSBleGVjdXRvciB0byB0aGUgZGVidWdnZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWJ1Z2dpbmdBY3RpdmF0aW9uIHtcblxuICBfY29ubmVjdGlvbkRpc3Bvc2FibGVzOiA/SURpc3Bvc2FibGU7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2tpbGxPblNlc3Npb25zRW5kZWRUaW1lb3V0SWQ6ID9udW1iZXI7XG4gIF9wZW5kaW5nRGVidWdnZXJQcm9jZXNzSW5mbzogP1JlYWN0TmF0aXZlUHJvY2Vzc0luZm87XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtcmVhY3QtbmF0aXZlOnN0YXJ0LWRlYnVnZ2luZyc6ICgpID0+IHRoaXMuX3N0YXJ0RGVidWdnaW5nKCksXG4gICAgICAgICdudWNsaWRlLXJlYWN0LW5hdGl2ZTpzdG9wLWRlYnVnZ2luZyc6ICgpID0+IHRoaXMuX3N0b3BEZWJ1Z2dpbmcoKSxcbiAgICAgIH0pLFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5fc3RvcERlYnVnZ2luZygpKSxcbiAgICApO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb25EaXNwb3NhYmxlcyAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uRGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9zdGFydERlYnVnZ2luZygpOiB2b2lkIHtcbiAgICB0aGlzLl9zdG9wRGVidWdnaW5nKCk7XG5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdudWNsaWRlLWRlYnVnZ2VyOnNob3cnKTtcblxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBEZWJ1Z2dlclByb3h5Q2xpZW50KCk7XG4gICAgY29uc3Qgc2VydmljZSQgPSBSeC5PYnNlcnZhYmxlLmZyb21Qcm9taXNlKFxuICAgICAgc2VydmljZUh1Yi5jb25zdW1lRmlyc3RQcm92aWRlcignbnVjbGlkZS1kZWJ1Z2dlci5yZW1vdGUnKVxuICAgICk7XG5cbiAgICB0aGlzLl9jb25uZWN0aW9uRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IGNsaWVudC5kaXNjb25uZWN0KCkpLFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4geyB0aGlzLl9wZW5kaW5nRGVidWdnZXJQcm9jZXNzSW5mbyA9IG51bGw7IH0pLFxuXG4gICAgICAvLyBTdGFydCBkZWJ1Z2dpbmcgYXMgc29vbiBhcyB3ZSBnZXQgdGhlIHNlcnZpY2UuIFdlIHdvbid0IHlldCBoYXZlIGEgcGlkIHNvIHdlIHVzZSBhblxuICAgICAgLy8gXCJ1bmZpbmlzaGVkXCIgUHJvY2Vzc0luZm8gaW5zdGFuY2UsIHdoaWNoIHdlIGNhbiBsYXRlciBjb21wbGV0ZSBieSBjYWxsaW5nIGBzZXRQaWQoKWBcbiAgICAgIHNlcnZpY2UkLnN1YnNjcmliZShkZWJ1Z2dlclNlcnZpY2UgPT4geyB0aGlzLl9zdGFydERlYnVnZ2VyU2Vzc2lvbihkZWJ1Z2dlclNlcnZpY2UsIG51bGwpOyB9KSxcblxuICAgICAgLy8gVXBkYXRlIHRoZSBkZWJ1Z2dlciB3aGVuZXZlciB3ZSBnZXQgYSBuZXcgcGlkLiAoVGhpcyBoYXBwZW5zIHdoZW5ldmVyIHRoZSB1c2VyIHJlbG9hZHMgdGhlXG4gICAgICAvLyBSTiBhcHAuKVxuICAgICAgUnguT2JzZXJ2YWJsZS5jb21iaW5lTGF0ZXN0KFxuICAgICAgICBzZXJ2aWNlJCxcbiAgICAgICAgb2JzZXJ2YWJsZUZyb21TdWJzY3JpYmVGdW5jdGlvbihjbGllbnQub25EaWRFdmFsQXBwbGljYXRpb25TY3JpcHQuYmluZChjbGllbnQpKSxcbiAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZSgoW2RlYnVnZ2VyU2VydmljZSwgcGlkXSkgPT4ge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZURlYnVnZ2VyU2Vzc2lvbihkZWJ1Z2dlclNlcnZpY2UsIHBpZCk7XG4gICAgICAgIH0pLFxuICAgICk7XG5cbiAgICBjbGllbnQuY29ubmVjdCgpO1xuICB9XG5cbiAgX3N0b3BEZWJ1Z2dpbmcoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb25EaXNwb3NhYmxlcyA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2Nvbm5lY3Rpb25EaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fY29ubmVjdGlvbkRpc3Bvc2FibGVzID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGRlYnVnZ2VyIG9uY2Ugd2UgcmVjZWl2ZSBhIHBpZC4gV2hlbiBkZWJ1Z2dpbmcgaXMgZmlyc3Qgc3RhcnRlZCwgdGhpcyB3aWxsIG1lYW5cbiAgICogdXBkYXRpbmcgdGhlIHBlbmRpbmcgcHJvY2VzcyBpbmZvICh3aGljaCB3YXMgY3JlYXRlZCBiZWZvcmUgd2UgaGFkIGEgcGlkKS4gQWZ0ZXIgdGhhdCwgaG93ZXZlcixcbiAgICogd2UgY2FuIGp1c3QgYnVpbGQgbmV3IHByb2Nlc3MgaW5mbyBvYmplY3RzIGFuZCBzdGFydCBkZWJ1Z2dpbmcgYWdhaW4uIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2VcbiAgICogMSkgd2UgbXVzdCBjcmVhdGUgYSBQcm9jZXNzSW5mbyBvYmplY3QgaW4gb3JkZXIgdG8gc2lnbmFsIHRvIHRoZSBkZWJ1Z2dlciB0aGF0IHdlJ3JlIHN0YXJ0aW5nXG4gICAqIGRlYnVnZ2luZyBhbmQgMikgb25jZSBzdGFydGVkLCB0aGVyZSdzIG5vIHdheSBvZiB0ZWxsaW5nIHRoZSBkZWJ1Z2dlciB0byBzdGFydCBhIG5ldyBzZXNzaW9uXG4gICAqIHdpdGhvdXQgY3JlYXRpbmcgYSBuZXcgUHJvY2Vzc0luZm8gaW5zdGFuY2UuXG4gICAqL1xuICBfdXBkYXRlRGVidWdnZXJTZXNzaW9uKGRlYnVnZ2VyU2VydmljZTogUmVtb3RlQ29udHJvbFNlcnZpY2UsIHBpZDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgcGVuZGluZ1Byb2Nlc3NJbmZvID0gdGhpcy5fcGVuZGluZ0RlYnVnZ2VyUHJvY2Vzc0luZm87XG4gICAgaWYgKHBlbmRpbmdQcm9jZXNzSW5mbyAhPSBudWxsKSB7XG4gICAgICBjb25zdCBjdXJyZW50UGlkID0gcGVuZGluZ1Byb2Nlc3NJbmZvLmdldFBpZCgpO1xuICAgICAgaWYgKGN1cnJlbnRQaWQgPT0gbnVsbCkge1xuICAgICAgICBwZW5kaW5nUHJvY2Vzc0luZm8uc2V0UGlkKHBpZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9wZW5kaW5nRGVidWdnZXJQcm9jZXNzSW5mbyA9IG51bGw7XG4gICAgdGhpcy5fc3RhcnREZWJ1Z2dlclNlc3Npb24oZGVidWdnZXJTZXJ2aWNlLCBwaWQpO1xuICB9XG5cbiAgX3N0YXJ0RGVidWdnZXJTZXNzaW9uKGRlYnVnZ2VyU2VydmljZTogUmVtb3RlQ29udHJvbFNlcnZpY2UsIHBpZDogP251bWJlcik6IHZvaWQge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9raWxsT25TZXNzaW9uc0VuZGVkVGltZW91dElkKTtcblxuICAgIC8vIFRPRE8obWF0dGhld3dpdGhhbm0pOiBVc2UgcHJvamVjdCByb290IGluc3RlYWQgb2YgZmlyc3QgZGlyZWN0b3J5LlxuICAgIGNvbnN0IGN1cnJlbnRQcm9qZWN0RGlyID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF07XG5cbiAgICBpZiAoY3VycmVudFByb2plY3REaXIgPT0gbnVsbCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAnWW91IG11c3QgaGF2ZSBhbiBvcGVuIHByb2plY3QgdG8gZGVidWcgYSBSZWFjdCBOYXRpdmUgYXBwbGljYXRpb24nXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhcmdldFVyaSA9IGN1cnJlbnRQcm9qZWN0RGlyLmdldFBhdGgoKTtcbiAgICBjb25zdCBwcm9jZXNzSW5mbyA9IG5ldyBSZWFjdE5hdGl2ZVByb2Nlc3NJbmZvKHtcbiAgICAgIHRhcmdldFVyaSxcbiAgICAgIHBpZCxcbiAgICAgIG9uQWxsU2Vzc2lvbnNFbmRlZDogKCkgPT4ge1xuICAgICAgICAvLyBXZSBoYXZlIG5vIHdheSB0byBkaWZmZXJlbnRpYXRlIGJldHdlZW4gd2hlbiBhbGwgc2Vzc2lvbnMgaGF2ZSBjbG9zZWQgYmVjYXVzZSB0aGUgdXNlclxuICAgICAgICAvLyBjbG9zZWQgdGhlIGRlYnVnZ2VyIGFuZCB3aGVuIGFsbCBzZXNzaW9ucyBoYXZlIGNsb3NlZCBiZWNhdXNlIHRoZSB1c2VyIGhhcyByZWxvYWRlZCB0aGVcbiAgICAgICAgLy8gUk4gYXBwLiBTbyB3ZSB3YWl0IGEgYml0IHRvIGtpbGwgdGhlIGNsaWVudCB0byBtYWtlIHN1cmUgYSBuZXcgc2Vzc2lvbiBpc24ndCBnb2luZyB0byBiZVxuICAgICAgICAvLyBzdGFydGVkIChlLmcuIHRoZSB1c2VyIGp1c3QgcmVsb2FkZWQgdGhlIGFwcCkuXG4gICAgICAgIC8vIFRPRE86IENyZWF0ZSBhIGN1c3RvbSBEZWJ1Z2dlckluc3RhbmNlIGNsYXNzIHRoYXQgd3JhcHMgdGhlIGNyZWF0aW9uIG9mIHRoZSBjbGllbnQgYW5kXG4gICAgICAgIC8vICAgICAgIGhpZGVzIHRoZSBmYWN0IHRoYXQgd2UgaGF2ZSBtdWx0aXBsZSBzZXNzaW9ucy5cbiAgICAgICAgdGhpcy5fa2lsbE9uU2Vzc2lvbnNFbmRlZFRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5fc3RvcERlYnVnZ2luZy5iaW5kKHRoaXMpLCAyMDAwKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBpZiAocGlkID09IG51bGwpIHtcbiAgICAgIHRoaXMuX3BlbmRpbmdEZWJ1Z2dlclByb2Nlc3NJbmZvID0gcHJvY2Vzc0luZm87XG4gICAgfVxuXG4gICAgZGVidWdnZXJTZXJ2aWNlLnN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvKTtcbiAgfVxuXG59XG4iXX0=