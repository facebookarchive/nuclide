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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _commons = require('../../../commons');

var _reactNativeNodeExecutor = require('../../../react-native-node-executor');

var _reactNativeNodeExecutor2 = _interopRequireDefault(_reactNativeNodeExecutor);

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
            _this._startServer(action.commandInfo);
            break;
          case _ReactNativeServerActions2['default'].ActionType.STOP_SERVER:
            _this._stopServer();
            break;
          case _ReactNativeServerActions2['default'].ActionType.RESTART_SERVER:
            _this._stopServer();
            atom.workspace.destroyActivePaneItem();
            _this._startServer(action.commandInfo);
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
    value: _asyncToGenerator(function* (commandInfo) {
      var processRunner = this._processRunner;
      if (processRunner == null) {
        processRunner = yield this._createProcessRunner(commandInfo);
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
    value: _asyncToGenerator(function* (commandInfo) {
      var _this2 = this;

      var getRunCommandInNewPane = require('../../../process/output');

      var _getRunCommandInNewPane = getRunCommandInNewPane();

      var runCommandInNewPane = _getRunCommandInNewPane.runCommandInNewPane;
      var disposable = _getRunCommandInNewPane.disposable;

      var runProcessWithHandlers = function runProcessWithHandlers(dataHandlerOptions) {
        var stdout = dataHandlerOptions.stdout;
        var stderr = dataHandlerOptions.stderr;
        var error = dataHandlerOptions.error;
        var exit = dataHandlerOptions.exit;
        var command = commandInfo.command;
        var cwd = commandInfo.cwd;

        (0, _assert2['default'])(command);
        (0, _assert2['default'])(cwd);
        var observable = (0, _commons.scriptSafeSpawnAndObserveOutput)(command, [], { cwd: cwd });
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
            subscription.dispose();
            disposable.dispose();
          }
        });
      };

      var _require = require('../../../process/output-store');

      var ProcessOutputStore = _require.ProcessOutputStore;

      var processOutputStore = new ProcessOutputStore(runProcessWithHandlers);

      var panel = _reactForAtom.React.createElement(_ReactNativeServerPanel2['default'], {
        store: this._status,
        stopServer: function () {
          return _this2._actions.stopServer();
        },
        restartServer: function () {
          return _this2._actions.restartServer(commandInfo);
        }
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
      var debuggerService = yield require('../../../service-hub-plus').consumeFirstProvider('nuclide-debugger.remote');
      debuggerService.debugNode(pid);
    })
  }, {
    key: '_startNodeExecutorServer',
    value: function _startNodeExecutorServer() {
      if (!this._nodeExecutorServer) {
        var server = this._nodeExecutorServer = new _reactNativeNodeExecutor2['default'](8090);
        server.onDidEvalApplicationScript(this._attachNodeDebugger.bind(this));
      }
    }
  }]);

  return ReactNativeServerManager;
})();

exports['default'] = ReactNativeServerManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyTWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFhc0IsUUFBUTs7Ozt1QkFHZ0Isa0JBQWtCOzt1Q0FDckMscUNBQXFDOzs7O3VDQUM1QiwyQkFBMkI7Ozs7NEJBQzNDLGdCQUFnQjs7c0NBQ0QsMEJBQTBCOzs7O3dDQUN4Qiw0QkFBNEI7Ozs7SUFFNUMsd0JBQXdCO0FBUWhDLFdBUlEsd0JBQXdCLENBUS9CLFVBQXNCLEVBQUUsT0FBaUMsRUFBRTswQkFScEQsd0JBQXdCOztBQVN6QyxRQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztBQUN4QixRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUM5QixRQUFJLENBQUMsT0FBTyxHQUFHLDBDQUE2QixDQUFDO0FBQzdDLFFBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztHQUN0Qjs7ZUFia0Isd0JBQXdCOztXQWVwQyxtQkFBRztBQUNSLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixVQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtBQUM1QixZQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDbEM7S0FDRjs7O1dBRVkseUJBQUc7OztBQUNkLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQ2xDLGdCQUFRLE1BQU0sQ0FBQyxVQUFVO0FBQ3ZCLGVBQUssc0NBQXlCLFVBQVUsQ0FBQywwQkFBMEI7QUFDakUsa0JBQUssd0JBQXdCLEVBQUUsQ0FBQztBQUNoQyxrQkFBTTtBQUFBLEFBQ1IsZUFBSyxzQ0FBeUIsVUFBVSxDQUFDLFlBQVk7QUFDbkQsa0JBQUssWUFBWSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN0QyxrQkFBTTtBQUFBLEFBQ1IsZUFBSyxzQ0FBeUIsVUFBVSxDQUFDLFdBQVc7QUFDbEQsa0JBQUssV0FBVyxFQUFFLENB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LEtBQUssQ0FBQztBQUN6Qix1Q0FBVSxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzVCLDhCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzNCLDhCQUFnQixHQUFHLElBQUksQ0FBQzthQUN6QjtXQUNGLENBQUMsQ0FBQztTQUNKLENBQUE7O0FBRUQsZUFBTyxFQUFFLG1CQUFNO0FBQ2IsNEJBQWtCLElBQUksa0JBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDdkQsMEJBQWdCLElBQUksZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDaEQ7T0FDRixDQUFDO0tBQ0g7Ozs2QkFFd0IsV0FBQyxHQUFXLEVBQWlCO0FBQ3BELFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3BGLFVBQU0sZUFBZSxHQUFHLE1BQU0sT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQy9ELG9CQUFvQixDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDbkQscUJBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDaEM7OztXQUV1QixvQ0FBRztBQUN6QixVQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO0FBQzdCLFlBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsR0FBRyx5Q0FBbUIsSUFBSSxDQUFDLENBQUM7QUFDbkUsY0FBTSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztPQUN4RTtLQUNGOzs7U0E1SmtCLHdCQUF3Qjs7O3FCQUF4Qix3QkFBd0IiLCJmaWxlIjoiUmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0NvbW1hbmRJbmZvfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHR5cGUge1Byb2Nlc3NPdXRwdXREYXRhSGFuZGxlcnN9IGZyb20gJy4uLy4uLy4uL3Byb2Nlc3Mvb3V0cHV0LXN0b3JlL2xpYi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQge3NjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXR9IGZyb20gJy4uLy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IEV4ZWN1dG9yU2VydmVyIGZyb20gJy4uLy4uLy4uL3JlYWN0LW5hdGl2ZS1ub2RlLWV4ZWN1dG9yJztcbmltcG9ydCBSZWFjdE5hdGl2ZVNlcnZlclN0YXR1cyBmcm9tICcuL1JlYWN0TmF0aXZlU2VydmVyU3RhdHVzJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBSZWFjdE5hdGl2ZVNlcnZlclBhbmVsIGZyb20gJy4vUmVhY3ROYXRpdmVTZXJ2ZXJQYW5lbCc7XG5pbXBvcnQgUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zIGZyb20gJy4vUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyIHtcblxuICBfYWN0aW9uczogUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zO1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX3N0YXR1czogUmVhY3ROYXRpdmVTZXJ2ZXJTdGF0dXM7XG4gIF9wcm9jZXNzUnVubmVyOiA/T2JqZWN0O1xuICBfbm9kZUV4ZWN1dG9yU2VydmVyOiA/RXhlY3V0b3JTZXJ2ZXI7XG5cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlciwgYWN0aW9uczogUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zKSB7XG4gICAgdGhpcy5fYWN0aW9ucyA9IGFjdGlvbnM7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5fc3RhdHVzID0gbmV3IFJlYWN0TmF0aXZlU2VydmVyU3RhdHVzKCk7XG4gICAgdGhpcy5fc2V0dXBBY3Rpb25zKCk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3N0b3BTZXJ2ZXIoKTtcbiAgICBpZiAodGhpcy5fbm9kZUV4ZWN1dG9yU2VydmVyKSB7XG4gICAgICB0aGlzLl9ub2RlRXhlY3V0b3JTZXJ2ZXIuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBfc2V0dXBBY3Rpb25zKCkge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIucmVnaXN0ZXIoYWN0aW9uID0+IHtcbiAgICAgIHN3aXRjaCAoYWN0aW9uLmFjdGlvblR5cGUpIHtcbiAgICAgICAgY2FzZSBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuQWN0aW9uVHlwZS5TVEFSVF9OT0RFX0VYRUNVVE9SX1NFUlZFUjpcbiAgICAgICAgICB0aGlzLl9zdGFydE5vZGVFeGVjdXRvclNlcnZlcigpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5BY3Rpb25UeXBlLlNUQVJUX1NFUlZFUjpcbiAgICAgICAgICB0aGlzLl9zdGFydFNlcnZlcihhY3Rpb24uY29tbWFuZEluZm8pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5BY3Rpb25UeXBlLlNUT1BfU0VSVkVSOlxuICAgICAgICAgIHRoaXMuX3N0b3BTZXJ2ZXIoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuQWN0aW9uVHlwZS5SRVNUQVJUX1NFUlZFUjpcbiAgICAgICAgICB0aGlzLl9zdG9wU2VydmVyKCk7XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmVJdGVtKCk7XG4gICAgICAgICAgdGhpcy5fc3RhcnRTZXJ2ZXIoYWN0aW9uLmNvbW1hbmRJbmZvKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9zdG9wU2VydmVyKCkge1xuICAgIHRoaXMuX3Byb2Nlc3NSdW5uZXIgJiYgdGhpcy5fcHJvY2Vzc1J1bm5lci5kaXNwb3NlKCk7XG4gICAgdGhpcy5fcHJvY2Vzc1J1bm5lciA9IG51bGw7XG4gICAgdGhpcy5fc3RhdHVzLnNldFNlcnZlclJ1bm5pbmcoZmFsc2UpO1xuICB9XG5cbiAgYXN5bmMgX3N0YXJ0U2VydmVyKGNvbW1hbmRJbmZvOiBDb21tYW5kSW5mbyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBwcm9jZXNzUnVubmVyID0gdGhpcy5fcHJvY2Vzc1J1bm5lcjtcbiAgICBpZiAocHJvY2Vzc1J1bm5lciA9PSBudWxsKSB7XG4gICAgICBwcm9jZXNzUnVubmVyID0gYXdhaXQgdGhpcy5fY3JlYXRlUHJvY2Vzc1J1bm5lcihjb21tYW5kSW5mbyk7XG4gICAgICBpZiAocHJvY2Vzc1J1bm5lciA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3Byb2Nlc3NSdW5uZXIgPSBwcm9jZXNzUnVubmVyO1xuICAgICAgdGhpcy5fc3RhdHVzLnNldFNlcnZlclJ1bm5pbmcodHJ1ZSk7XG4gICAgfVxuICAgIGludmFyaWFudChwcm9jZXNzUnVubmVyKTtcbiAgICBwcm9jZXNzUnVubmVyLnJ1bigpO1xuICB9XG5cbiAgYXN5bmMgX2NyZWF0ZVByb2Nlc3NSdW5uZXIoY29tbWFuZEluZm86IENvbW1hbmRJbmZvKTogUHJvbWlzZTw/T2JqZWN0PiB7XG4gICAgY29uc3QgZ2V0UnVuQ29tbWFuZEluTmV3UGFuZSA9IHJlcXVpcmUoJy4uLy4uLy4uL3Byb2Nlc3Mvb3V0cHV0Jyk7XG4gICAgY29uc3Qge3J1bkNvbW1hbmRJbk5ld1BhbmUsIGRpc3Bvc2FibGV9ID0gZ2V0UnVuQ29tbWFuZEluTmV3UGFuZSgpO1xuXG4gICAgY29uc3QgcnVuUHJvY2Vzc1dpdGhIYW5kbGVycyA9IChkYXRhSGFuZGxlck9wdGlvbnM6IFByb2Nlc3NPdXRwdXREYXRhSGFuZGxlcnMpID0+IHtcbiAgICAgIGNvbnN0IHtzdGRvdXQsIHN0ZGVyciwgZXJyb3IsIGV4aXR9ID0gZGF0YUhhbmRsZXJPcHRpb25zO1xuICAgICAgY29uc3Qge2NvbW1hbmQsIGN3ZH0gPSBjb21tYW5kSW5mbztcbiAgICAgIGludmFyaWFudChjb21tYW5kKTtcbiAgICAgIGludmFyaWFudChjd2QpO1xuICAgICAgY29uc3Qgb2JzZXJ2YWJsZSA9IHNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQoY29tbWFuZCwgW10sIHtjd2R9KTtcbiAgICAgIGNvbnN0IG9uTmV4dCA9IChkYXRhOiB7c3Rkb3V0Pzogc3RyaW5nOyBzdGRlcnI/OiBzdHJpbmd9KSA9PiB7XG4gICAgICAgIGlmIChkYXRhLnN0ZG91dCkge1xuICAgICAgICAgIHN0ZG91dChkYXRhLnN0ZG91dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RkZXJyKGRhdGEuc3RkZXJyIHx8ICcnKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNvbnN0IG9uRXJyb3IgPSAoZGF0YTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGVycm9yKG5ldyBFcnJvcihkYXRhKSk7XG4gICAgICAgIGV4aXQoMSk7XG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IG9uRXhpdCA9ICgpID0+IHtcbiAgICAgICAgZXhpdCgwKTtcbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICB9O1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gb2JzZXJ2YWJsZS5zdWJzY3JpYmUob25OZXh0LCBvbkVycm9yLCBvbkV4aXQpO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAga2lsbCgpIHtcbiAgICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbnN0IHtQcm9jZXNzT3V0cHV0U3RvcmV9ID0gcmVxdWlyZSgnLi4vLi4vLi4vcHJvY2Vzcy9vdXRwdXQtc3RvcmUnKTtcbiAgICBjb25zdCBwcm9jZXNzT3V0cHV0U3RvcmUgPSBuZXcgUHJvY2Vzc091dHB1dFN0b3JlKHJ1blByb2Nlc3NXaXRoSGFuZGxlcnMpO1xuXG4gICAgY29uc3QgcGFuZWwgPVxuICAgICAgPFJlYWN0TmF0aXZlU2VydmVyUGFuZWxcbiAgICAgICAgc3RvcmU9e3RoaXMuX3N0YXR1c31cbiAgICAgICAgc3RvcFNlcnZlcj17KCkgPT4gdGhpcy5fYWN0aW9ucy5zdG9wU2VydmVyKCl9XG4gICAgICAgIHJlc3RhcnRTZXJ2ZXI9eygpID0+IHRoaXMuX2FjdGlvbnMucmVzdGFydFNlcnZlcihjb21tYW5kSW5mbyl9XG4gICAgICAvPjtcblxuICAgIGxldCBpc091dHB1dFBhbmVPcGVuID0gZmFsc2U7XG4gICAgbGV0IHBhbmVTdWJzY3JpcHRpb247XG5cbiAgICAvLyBXZSBkb24ndCB3YW50IHRvIGNhbGwgZ2V0UnVuQ29tbWFuZEluTmV3UGFuZSgpIG11bHRpcGxlIHRpbWVzIGJlY2F1c2UgaXQgaGFzIHVud2FudGVkXG4gICAgLy8gc2lkZSBlZmZlY3RzLiBTbywgd2UgY2FjaGUgdGhlIG91dHB1dCBvZiBydW5Db21tYW5kSW5OZXdQYW5lIGZ1bmN0aW9uIGFuZCB1c2UgdGhlIHNhbWVcbiAgICAvLyBpbnN0YW5jZSBvZiBydW5Db21tYW5kSW5OZXdQYW5lIHRvIHJlLW9wZW4gb3V0cHV0IHBhbmUgZm9yIHRoZSBzYW1lIHNlcnZlciBwcm9jZXNzLlxuICAgIHJldHVybiB7XG4gICAgICBydW46IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKGlzT3V0cHV0UGFuZU9wZW4pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGV4dEVkaXRvciA9IGF3YWl0IHJ1bkNvbW1hbmRJbk5ld1BhbmUoe1xuICAgICAgICAgIHRhYlRpdGxlOiAnUmVhY3QgTmF0aXZlIFNlcnZlcicsXG4gICAgICAgICAgcHJvY2Vzc091dHB1dFN0b3JlLFxuICAgICAgICAgIHByb2Nlc3NPdXRwdXRWaWV3VG9wRWxlbWVudDogcGFuZWwsXG4gICAgICAgIH0pO1xuICAgICAgICBpc091dHB1dFBhbmVPcGVuID0gdHJ1ZTtcblxuICAgICAgICBwYW5lU3Vic2NyaXB0aW9uID0gYXRvbS53b3Jrc3BhY2Uub25EaWREZXN0cm95UGFuZUl0ZW0oZXZlbnQgPT4ge1xuICAgICAgICAgIGlmIChldmVudC5pdGVtID09PSB0ZXh0RWRpdG9yKSB7XG4gICAgICAgICAgICBpc091dHB1dFBhbmVPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICBpbnZhcmlhbnQocGFuZVN1YnNjcmlwdGlvbik7XG4gICAgICAgICAgICBwYW5lU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIHBhbmVTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICBkaXNwb3NlOiAoKSA9PiB7XG4gICAgICAgIHByb2Nlc3NPdXRwdXRTdG9yZSAmJiBwcm9jZXNzT3V0cHV0U3RvcmUuc3RvcFByb2Nlc3MoKTtcbiAgICAgICAgcGFuZVN1YnNjcmlwdGlvbiAmJiBwYW5lU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIF9hdHRhY2hOb2RlRGVidWdnZXIocGlkOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdudWNsaWRlLWRlYnVnZ2VyOnNob3cnKTtcbiAgICBjb25zdCBkZWJ1Z2dlclNlcnZpY2UgPSBhd2FpdCByZXF1aXJlKCcuLi8uLi8uLi9zZXJ2aWNlLWh1Yi1wbHVzJylcbiAgICAgIC5jb25zdW1lRmlyc3RQcm92aWRlcignbnVjbGlkZS1kZWJ1Z2dlci5yZW1vdGUnKTtcbiAgICBkZWJ1Z2dlclNlcnZpY2UuZGVidWdOb2RlKHBpZCk7XG4gIH1cblxuICBfc3RhcnROb2RlRXhlY3V0b3JTZXJ2ZXIoKSB7XG4gICAgaWYgKCF0aGlzLl9ub2RlRXhlY3V0b3JTZXJ2ZXIpIHtcbiAgICAgIGNvbnN0IHNlcnZlciA9IHRoaXMuX25vZGVFeGVjdXRvclNlcnZlciA9IG5ldyBFeGVjdXRvclNlcnZlcig4MDkwKTtcbiAgICAgIHNlcnZlci5vbkRpZEV2YWxBcHBsaWNhdGlvblNjcmlwdCh0aGlzLl9hdHRhY2hOb2RlRGVidWdnZXIuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG59XG4iXX0=