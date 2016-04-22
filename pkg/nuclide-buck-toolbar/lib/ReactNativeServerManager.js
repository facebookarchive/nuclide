Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideReactNativeNodeExecutor = require('../../nuclide-react-native-node-executor');

var _nuclideReactNativeNodeExecutor2 = _interopRequireDefault(_nuclideReactNativeNodeExecutor);

var _ReactNativeServerStatus = require('./ReactNativeServerStatus');

var _ReactNativeServerStatus2 = _interopRequireDefault(_ReactNativeServerStatus);

var _reactForAtom = require('react-for-atom');

var _ReactNativeServerPanel = require('./ReactNativeServerPanel');

var _ReactNativeServerPanel2 = _interopRequireDefault(_ReactNativeServerPanel);

var _ReactNativeServerActions = require('./ReactNativeServerActions');

var _ReactNativeServerActions2 = _interopRequireDefault(_ReactNativeServerActions);

var ReactNativeServerManager = (function () {
  function ReactNativeServerManager(dispatcher, actions) {
    _classCallCheck(this, ReactNativeServerManager);

    this._actions = actions;
    this._dispatcher = dispatcher;
    this._status = new _ReactNativeServerStatus2['default']();
    this._setupActions();
  }

  _createClass(ReactNativeServerManager, [{
    key: 'dispose',
    value: function dispose() {
      this._stopServer();
      if (this._nodeExecutorServer) {
        this._nodeExecutorServer.close();
      }
    }
  }, {
    key: '_setupActions',
    value: function _setupActions() {
      var _this = this;

      this._dispatcher.register(function (action) {
        switch (action.actionType) {
          case _ReactNativeServerActions2['default'].ActionType.START_NODE_EXECUTOR_SERVER:
            _this._startNodeExecutorServer();
            break;
          case _ReactNativeServerActions2['default'].ActionType.START_SERVER:
            _this._startServer(action.serverCommand);
            break;
          case _ReactNativeServerActions2['default'].ActionType.STOP_SERVER:
            _this._stopServer();
            break;
          case _ReactNativeServerActions2['default'].ActionType.RESTART_SERVER:
            _this._stopServer();
            atom.workspace.destroyActivePaneItem();
            _this._startServer(action.serverCommand);
            break;
        }
      });
    }
  }, {
    key: '_stopServer',
    value: function _stopServer() {
      this._processRunner && this._processRunner.dispose();
      this._processRunner = null;
      this._status.setServerRunning(false);
    }
  }, {
    key: '_startServer',
    value: _asyncToGenerator(function* (serverCommand) {
      var processRunner = this._processRunner;
      if (processRunner == null) {
        processRunner = yield this._createProcessRunner(serverCommand);
        if (processRunner == null) {
          return;
        }
        this._processRunner = processRunner;
        this._status.setServerRunning(true);
      }
      (0, _assert2['default'])(processRunner);
      processRunner.run();
    })
  }, {
    key: '_createProcessRunner',
    value: _asyncToGenerator(function* (serverCommand) {
      var getRunCommandInNewPane = require('../../nuclide-process-output');

      var _getRunCommandInNewPane = getRunCommandInNewPane();

      var runCommandInNewPane = _getRunCommandInNewPane.runCommandInNewPane;
      var disposable = _getRunCommandInNewPane.disposable;

      var runProcessWithHandlers = function runProcessWithHandlers(dataHandlerOptions) {
        var stdout = dataHandlerOptions.stdout;
        var stderr = dataHandlerOptions.stderr;
        var error = dataHandlerOptions.error;
        var exit = dataHandlerOptions.exit;

        (0, _assert2['default'])(serverCommand);
        var observable = (0, _nuclideCommons.scriptSafeSpawnAndObserveOutput)(serverCommand);
        var onNext = function onNext(data) {
          if (data.stdout) {
            stdout(data.stdout);
          } else {
            stderr(data.stderr || '');
          }
        };
        var onError = function onError(data) {
          error(new Error(data));
          exit(1);
          disposable.dispose();
        };
        var onExit = function onExit() {
          exit(0);
          disposable.dispose();
        };
        var subscription = observable.subscribe(onNext, onError, onExit);

        return Promise.resolve({
          kill: function kill() {
            subscription.unsubscribe();
            disposable.dispose();
          }
        });
      };

      var _require = require('../../nuclide-process-output-store');

      var ProcessOutputStore = _require.ProcessOutputStore;

      var processOutputStore = new ProcessOutputStore(runProcessWithHandlers);

      var panel = _reactForAtom.React.createElement(_ReactNativeServerPanel2['default'], {
        actions: this._actions,
        store: this._status,
        serverCommand: serverCommand
      });

      var isOutputPaneOpen = false;
      var paneSubscription = undefined;

      // We don't want to call getRunCommandInNewPane() multiple times because it has unwanted
      // side effects. So, we cache the output of runCommandInNewPane function and use the same
      // instance of runCommandInNewPane to re-open output pane for the same server process.
      return {
        run: _asyncToGenerator(function* () {
          if (isOutputPaneOpen) {
            return;
          }
          var textEditor = yield runCommandInNewPane({
            tabTitle: 'React Native Server',
            processOutputStore: processOutputStore,
            processOutputViewTopElement: panel
          });
          isOutputPaneOpen = true;

          paneSubscription = atom.workspace.onDidDestroyPaneItem(function (event) {
            if (event.item === textEditor) {
              isOutputPaneOpen = false;
              (0, _assert2['default'])(paneSubscription);
              paneSubscription.dispose();
              paneSubscription = null;
            }
          });
        }),

        dispose: function dispose() {
          processOutputStore && processOutputStore.stopProcess();
          paneSubscription && paneSubscription.dispose();
        }
      };
    })
  }, {
    key: '_attachNodeDebugger',
    value: _asyncToGenerator(function* (pid) {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
      var debuggerService = yield require('../../nuclide-service-hub-plus').consumeFirstProvider('nuclide-debugger.remote');
      debuggerService.debugNode(pid);
    })
  }, {
    key: '_startNodeExecutorServer',
    value: function _startNodeExecutorServer() {
      if (!this._nodeExecutorServer) {
        var server = this._nodeExecutorServer = new _nuclideReactNativeNodeExecutor2['default'](8090);
        server.onDidEvalApplicationScript(this._attachNodeDebugger.bind(this));
      }
    }
  }]);

  return ReactNativeServerManager;
})();

exports['default'] = ReactNativeServerManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyTWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFXc0IsUUFBUTs7Ozs4QkFHZ0IsdUJBQXVCOzs4Q0FDMUMsMENBQTBDOzs7O3VDQUNqQywyQkFBMkI7Ozs7NEJBQzNDLGdCQUFnQjs7c0NBQ0QsMEJBQTBCOzs7O3dDQUN4Qiw0QkFBNEI7Ozs7SUFFNUMsd0JBQXdCO0FBUWhDLFdBUlEsd0JBQXdCLENBUS9CLFVBQXNCLEVBQUUsT0FBaUMsRUFBRTswQkFScEQsd0JBQXdCOztBQVN6QyxRQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztBQUN4QixRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUM5QixRQUFJLENBQUMsT0FBTyxHQUFHLDBDQUE2QixDQUFDO0FBQzdDLFFBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztHQUN0Qjs7ZUFia0Isd0JBQXdCOztXQWVwQyxtQkFBRztBQUNSLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixVQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtBQUM1QixZQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDbEM7S0FDRjs7O1dBRVkseUJBQUc7OztBQUNkLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQ2xDLGdCQUFRLE1BQU0sQ0FBQyxVQUFVO0FBQ3ZCLGVBQUssc0NBQXlCLFVBQVUsQ0FBQywwQkFBMEI7QUFDakUsa0JBQUssd0JBQXdCLEVBQUUsQ0FBQztBQUNoQyxrQkFBTTtBQUFBLEFBQ1IsZUFBSyxzQ0FBeUIsVUFBVSxDQUFDLFlBQVk7QUFDbkQsa0JBQUssWUFBWSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN4QyxrQkFBTTtBQUFBLEFBQ1IsZUFBSyxzQ0FBeUIsVUFBVSxDQUFDLFdBQVc7QUFDbEQsa0JBQUssV0FBVyxFQUFFLENB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QUFDO0FBQ3ZELDBCQUFnQixJQUFJLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ2hEO09BQ0YsQ0FBQztLQUNIOzs7NkJBRXdCLFdBQUMsR0FBVyxFQUFpQjtBQUNwRCxVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztBQUNwRixVQUFNLGVBQWUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUNwRSxvQkFBb0IsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ25ELHFCQUFlLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2hDOzs7V0FFdUIsb0NBQUc7QUFDekIsVUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtBQUM3QixZQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsZ0RBQW1CLElBQUksQ0FBQyxDQUFDO0FBQ25FLGNBQU0sQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDeEU7S0FDRjs7O1NBMUprQix3QkFBd0I7OztxQkFBeEIsd0JBQXdCIiwiZmlsZSI6IlJlYWN0TmF0aXZlU2VydmVyTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB0eXBlIHtQcm9jZXNzT3V0cHV0RGF0YUhhbmRsZXJzfSBmcm9tICcuLi8uLi9udWNsaWRlLXByb2Nlc3Mtb3V0cHV0LXN0b3JlL2xpYi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQge3NjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXR9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgRXhlY3V0b3JTZXJ2ZXIgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZWFjdC1uYXRpdmUtbm9kZS1leGVjdXRvcic7XG5pbXBvcnQgUmVhY3ROYXRpdmVTZXJ2ZXJTdGF0dXMgZnJvbSAnLi9SZWFjdE5hdGl2ZVNlcnZlclN0YXR1cyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUmVhY3ROYXRpdmVTZXJ2ZXJQYW5lbCBmcm9tICcuL1JlYWN0TmF0aXZlU2VydmVyUGFuZWwnO1xuaW1wb3J0IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyBmcm9tICcuL1JlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlYWN0TmF0aXZlU2VydmVyTWFuYWdlciB7XG5cbiAgX2FjdGlvbnM6IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucztcbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG4gIF9zdGF0dXM6IFJlYWN0TmF0aXZlU2VydmVyU3RhdHVzO1xuICBfcHJvY2Vzc1J1bm5lcjogP09iamVjdDtcbiAgX25vZGVFeGVjdXRvclNlcnZlcjogP0V4ZWN1dG9yU2VydmVyO1xuXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIGFjdGlvbnM6IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucykge1xuICAgIHRoaXMuX2FjdGlvbnMgPSBhY3Rpb25zO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIHRoaXMuX3N0YXR1cyA9IG5ldyBSZWFjdE5hdGl2ZVNlcnZlclN0YXR1cygpO1xuICAgIHRoaXMuX3NldHVwQWN0aW9ucygpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9zdG9wU2VydmVyKCk7XG4gICAgaWYgKHRoaXMuX25vZGVFeGVjdXRvclNlcnZlcikge1xuICAgICAgdGhpcy5fbm9kZUV4ZWN1dG9yU2VydmVyLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgX3NldHVwQWN0aW9ucygpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLnJlZ2lzdGVyKGFjdGlvbiA9PiB7XG4gICAgICBzd2l0Y2ggKGFjdGlvbi5hY3Rpb25UeXBlKSB7XG4gICAgICAgIGNhc2UgUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zLkFjdGlvblR5cGUuU1RBUlRfTk9ERV9FWEVDVVRPUl9TRVJWRVI6XG4gICAgICAgICAgdGhpcy5fc3RhcnROb2RlRXhlY3V0b3JTZXJ2ZXIoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuQWN0aW9uVHlwZS5TVEFSVF9TRVJWRVI6XG4gICAgICAgICAgdGhpcy5fc3RhcnRTZXJ2ZXIoYWN0aW9uLnNlcnZlckNvbW1hbmQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5BY3Rpb25UeXBlLlNUT1BfU0VSVkVSOlxuICAgICAgICAgIHRoaXMuX3N0b3BTZXJ2ZXIoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuQWN0aW9uVHlwZS5SRVNUQVJUX1NFUlZFUjpcbiAgICAgICAgICB0aGlzLl9zdG9wU2VydmVyKCk7XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmVJdGVtKCk7XG4gICAgICAgICAgdGhpcy5fc3RhcnRTZXJ2ZXIoYWN0aW9uLnNlcnZlckNvbW1hbmQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX3N0b3BTZXJ2ZXIoKSB7XG4gICAgdGhpcy5fcHJvY2Vzc1J1bm5lciAmJiB0aGlzLl9wcm9jZXNzUnVubmVyLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9wcm9jZXNzUnVubmVyID0gbnVsbDtcbiAgICB0aGlzLl9zdGF0dXMuc2V0U2VydmVyUnVubmluZyhmYWxzZSk7XG4gIH1cblxuICBhc3luYyBfc3RhcnRTZXJ2ZXIoc2VydmVyQ29tbWFuZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHByb2Nlc3NSdW5uZXIgPSB0aGlzLl9wcm9jZXNzUnVubmVyO1xuICAgIGlmIChwcm9jZXNzUnVubmVyID09IG51bGwpIHtcbiAgICAgIHByb2Nlc3NSdW5uZXIgPSBhd2FpdCB0aGlzLl9jcmVhdGVQcm9jZXNzUnVubmVyKHNlcnZlckNvbW1hbmQpO1xuICAgICAgaWYgKHByb2Nlc3NSdW5uZXIgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9wcm9jZXNzUnVubmVyID0gcHJvY2Vzc1J1bm5lcjtcbiAgICAgIHRoaXMuX3N0YXR1cy5zZXRTZXJ2ZXJSdW5uaW5nKHRydWUpO1xuICAgIH1cbiAgICBpbnZhcmlhbnQocHJvY2Vzc1J1bm5lcik7XG4gICAgcHJvY2Vzc1J1bm5lci5ydW4oKTtcbiAgfVxuXG4gIGFzeW5jIF9jcmVhdGVQcm9jZXNzUnVubmVyKHNlcnZlckNvbW1hbmQ6IHN0cmluZyk6IFByb21pc2U8P09iamVjdD4ge1xuICAgIGNvbnN0IGdldFJ1bkNvbW1hbmRJbk5ld1BhbmUgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXByb2Nlc3Mtb3V0cHV0Jyk7XG4gICAgY29uc3Qge3J1bkNvbW1hbmRJbk5ld1BhbmUsIGRpc3Bvc2FibGV9ID0gZ2V0UnVuQ29tbWFuZEluTmV3UGFuZSgpO1xuXG4gICAgY29uc3QgcnVuUHJvY2Vzc1dpdGhIYW5kbGVycyA9IChkYXRhSGFuZGxlck9wdGlvbnM6IFByb2Nlc3NPdXRwdXREYXRhSGFuZGxlcnMpID0+IHtcbiAgICAgIGNvbnN0IHtzdGRvdXQsIHN0ZGVyciwgZXJyb3IsIGV4aXR9ID0gZGF0YUhhbmRsZXJPcHRpb25zO1xuICAgICAgaW52YXJpYW50KHNlcnZlckNvbW1hbmQpO1xuICAgICAgY29uc3Qgb2JzZXJ2YWJsZSA9IHNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQoc2VydmVyQ29tbWFuZCk7XG4gICAgICBjb25zdCBvbk5leHQgPSAoZGF0YToge3N0ZG91dD86IHN0cmluZzsgc3RkZXJyPzogc3RyaW5nfSkgPT4ge1xuICAgICAgICBpZiAoZGF0YS5zdGRvdXQpIHtcbiAgICAgICAgICBzdGRvdXQoZGF0YS5zdGRvdXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ZGVycihkYXRhLnN0ZGVyciB8fCAnJyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjb25zdCBvbkVycm9yID0gKGRhdGE6IHN0cmluZykgPT4ge1xuICAgICAgICBlcnJvcihuZXcgRXJyb3IoZGF0YSkpO1xuICAgICAgICBleGl0KDEpO1xuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBvbkV4aXQgPSAoKSA9PiB7XG4gICAgICAgIGV4aXQoMCk7XG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IG9ic2VydmFibGUuc3Vic2NyaWJlKG9uTmV4dCwgb25FcnJvciwgb25FeGl0KTtcblxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgIGtpbGwoKSB7XG4gICAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3Qge1Byb2Nlc3NPdXRwdXRTdG9yZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXByb2Nlc3Mtb3V0cHV0LXN0b3JlJyk7XG4gICAgY29uc3QgcHJvY2Vzc091dHB1dFN0b3JlID0gbmV3IFByb2Nlc3NPdXRwdXRTdG9yZShydW5Qcm9jZXNzV2l0aEhhbmRsZXJzKTtcblxuICAgIGNvbnN0IHBhbmVsID1cbiAgICAgIDxSZWFjdE5hdGl2ZVNlcnZlclBhbmVsXG4gICAgICAgIGFjdGlvbnM9e3RoaXMuX2FjdGlvbnN9XG4gICAgICAgIHN0b3JlPXt0aGlzLl9zdGF0dXN9XG4gICAgICAgIHNlcnZlckNvbW1hbmQ9e3NlcnZlckNvbW1hbmR9XG4gICAgICAvPjtcblxuICAgIGxldCBpc091dHB1dFBhbmVPcGVuID0gZmFsc2U7XG4gICAgbGV0IHBhbmVTdWJzY3JpcHRpb247XG5cbiAgICAvLyBXZSBkb24ndCB3YW50IHRvIGNhbGwgZ2V0UnVuQ29tbWFuZEluTmV3UGFuZSgpIG11bHRpcGxlIHRpbWVzIGJlY2F1c2UgaXQgaGFzIHVud2FudGVkXG4gICAgLy8gc2lkZSBlZmZlY3RzLiBTbywgd2UgY2FjaGUgdGhlIG91dHB1dCBvZiBydW5Db21tYW5kSW5OZXdQYW5lIGZ1bmN0aW9uIGFuZCB1c2UgdGhlIHNhbWVcbiAgICAvLyBpbnN0YW5jZSBvZiBydW5Db21tYW5kSW5OZXdQYW5lIHRvIHJlLW9wZW4gb3V0cHV0IHBhbmUgZm9yIHRoZSBzYW1lIHNlcnZlciBwcm9jZXNzLlxuICAgIHJldHVybiB7XG4gICAgICBydW46IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKGlzT3V0cHV0UGFuZU9wZW4pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGV4dEVkaXRvciA9IGF3YWl0IHJ1bkNvbW1hbmRJbk5ld1BhbmUoe1xuICAgICAgICAgIHRhYlRpdGxlOiAnUmVhY3QgTmF0aXZlIFNlcnZlcicsXG4gICAgICAgICAgcHJvY2Vzc091dHB1dFN0b3JlLFxuICAgICAgICAgIHByb2Nlc3NPdXRwdXRWaWV3VG9wRWxlbWVudDogcGFuZWwsXG4gICAgICAgIH0pO1xuICAgICAgICBpc091dHB1dFBhbmVPcGVuID0gdHJ1ZTtcblxuICAgICAgICBwYW5lU3Vic2NyaXB0aW9uID0gYXRvbS53b3Jrc3BhY2Uub25EaWREZXN0cm95UGFuZUl0ZW0oZXZlbnQgPT4ge1xuICAgICAgICAgIGlmIChldmVudC5pdGVtID09PSB0ZXh0RWRpdG9yKSB7XG4gICAgICAgICAgICBpc091dHB1dFBhbmVPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICBpbnZhcmlhbnQocGFuZVN1YnNjcmlwdGlvbik7XG4gICAgICAgICAgICBwYW5lU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIHBhbmVTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICBkaXNwb3NlOiAoKSA9PiB7XG4gICAgICAgIHByb2Nlc3NPdXRwdXRTdG9yZSAmJiBwcm9jZXNzT3V0cHV0U3RvcmUuc3RvcFByb2Nlc3MoKTtcbiAgICAgICAgcGFuZVN1YnNjcmlwdGlvbiAmJiBwYW5lU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIF9hdHRhY2hOb2RlRGVidWdnZXIocGlkOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdudWNsaWRlLWRlYnVnZ2VyOnNob3cnKTtcbiAgICBjb25zdCBkZWJ1Z2dlclNlcnZpY2UgPSBhd2FpdCByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXNlcnZpY2UtaHViLXBsdXMnKVxuICAgICAgLmNvbnN1bWVGaXJzdFByb3ZpZGVyKCdudWNsaWRlLWRlYnVnZ2VyLnJlbW90ZScpO1xuICAgIGRlYnVnZ2VyU2VydmljZS5kZWJ1Z05vZGUocGlkKTtcbiAgfVxuXG4gIF9zdGFydE5vZGVFeGVjdXRvclNlcnZlcigpIHtcbiAgICBpZiAoIXRoaXMuX25vZGVFeGVjdXRvclNlcnZlcikge1xuICAgICAgY29uc3Qgc2VydmVyID0gdGhpcy5fbm9kZUV4ZWN1dG9yU2VydmVyID0gbmV3IEV4ZWN1dG9yU2VydmVyKDgwOTApO1xuICAgICAgc2VydmVyLm9uRGlkRXZhbEFwcGxpY2F0aW9uU2NyaXB0KHRoaXMuX2F0dGFjaE5vZGVEZWJ1Z2dlci5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==