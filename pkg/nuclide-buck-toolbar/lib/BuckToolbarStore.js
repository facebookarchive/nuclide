var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ReactNativeServerManager = require('./ReactNativeServerManager');

var _ReactNativeServerManager2 = _interopRequireDefault(_ReactNativeServerManager);

var _ReactNativeServerActions = require('./ReactNativeServerActions');

var _ReactNativeServerActions2 = _interopRequireDefault(_ReactNativeServerActions);

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var logger = undefined;
function getLogger() {
  if (!logger) {
    logger = require('../../nuclide-logging').getLogger();
  }
  return logger;
}

var invariant = require('assert');

var _require = require('atom');

var Emitter = _require.Emitter;

var path = require('path');

var _require2 = require('flux');

var Dispatcher = _require2.Dispatcher;

var _require3 = require('../../nuclide-buck-commons');

var buckProjectRootForPath = _require3.buckProjectRootForPath;

var BuckToolbarActions = require('./BuckToolbarActions');

var BUCK_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;
var REACT_NATIVE_APP_FLAGS = ['-executor-override', 'RCTWebSocketExecutor', '-websocket-executor-name', 'Nuclide', '-websocket-executor-port', '8090'];

var BuckToolbarStore = (function () {
  function BuckToolbarStore(dispatcher) {
    var initialState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, BuckToolbarStore);

    this._dispatcher = dispatcher;
    this._reactNativeServerActions = new _ReactNativeServerActions2['default'](dispatcher);
    this._reactNativeServerManager = new _ReactNativeServerManager2['default'](dispatcher, this._reactNativeServerActions);
    this._emitter = new Emitter();
    this._textEditorToBuckProject = new WeakMap();
    this._aliasesByProject = new WeakMap();
    this._initState(initialState);
    this._setupActions();
  }

  _createClass(BuckToolbarStore, [{
    key: '_initState',
    value: function _initState(initialState) {
      this._isBuilding = false;
      this._buildTarget = initialState.buildTarget || '';
      this._buildProgress = 0;
      this._buildRuleType = '';
      this._isPanelVisible = initialState.isPanelVisible || false;
      this._isReactNativeApp = false;
      this._isReactNativeServerMode = initialState.isReactNativeServerMode || false;
    }
  }, {
    key: '_setupActions',
    value: function _setupActions() {
      var _this = this;

      this._dispatcher.register(function (action) {
        switch (action.actionType) {
          case BuckToolbarActions.ActionType.UPDATE_PROJECT:
            _this._updateProject(action.editor);
            break;
          case BuckToolbarActions.ActionType.UPDATE_BUILD_TARGET:
            _this._updateBuildTarget(action.buildTarget);
            break;
          case BuckToolbarActions.ActionType.UPDATE_SIMULATOR:
            _this._simulator = action.simulator;
            break;
          case BuckToolbarActions.ActionType.UPDATE_REACT_NATIVE_SERVER_MODE:
            _this._isReactNativeServerMode = action.serverMode;
            _this.emitChange();
            break;
          case BuckToolbarActions.ActionType.BUILD:
            _this._doBuild('build', /* debug */false);
            break;
          case BuckToolbarActions.ActionType.RUN:
            _this._doBuild('install', /* debug */false);
            break;
          case BuckToolbarActions.ActionType.TEST:
            _this._doBuild('test', /* debug */false);
            break;
          case BuckToolbarActions.ActionType.DEBUG:
            _this._doDebug();
            break;
          case BuckToolbarActions.ActionType.TOGGLE_PANEL_VISIBILITY:
            _this._isPanelVisible = !_this._isPanelVisible;
            _this.emitChange();
            break;
          case BuckToolbarActions.ActionType.UPDATE_PANEL_VISIBILITY:
            _this._isPanelVisible = action.isPanelVisible;
            _this.emitChange();
            break;
        }
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._reactNativeServerManager.dispose();
      if (this._buckProcessOutputStore) {
        this._buckProcessOutputStore.stopProcess();
      }
    }
  }, {
    key: 'subscribe',
    value: function subscribe(callback) {
      return this._emitter.on('change', callback);
    }
  }, {
    key: 'emitChange',
    value: function emitChange() {
      this._emitter.emit('change');
    }
  }, {
    key: 'getBuildTarget',
    value: function getBuildTarget() {
      return this._buildTarget;
    }
  }, {
    key: 'isBuilding',
    value: function isBuilding() {
      return this._isBuilding;
    }
  }, {
    key: 'getRuleType',
    value: function getRuleType() {
      return this._buildRuleType;
    }
  }, {
    key: 'getBuildProgress',
    value: function getBuildProgress() {
      return this._buildProgress;
    }
  }, {
    key: 'isPanelVisible',
    value: function isPanelVisible() {
      return this._isPanelVisible;
    }
  }, {
    key: 'isReactNativeApp',
    value: function isReactNativeApp() {
      return this._isReactNativeApp;
    }
  }, {
    key: 'isReactNativeServerMode',
    value: function isReactNativeServerMode() {
      return this.isReactNativeApp() && this._isReactNativeServerMode;
    }
  }, {
    key: 'loadAliases',
    value: _asyncToGenerator(function* () {
      var buckProject = this._mostRecentBuckProject;
      if (!buckProject) {
        return Promise.resolve([]);
      }

      // Cache aliases for a project because invoking buck just to list aliases that are highly
      // unlikely to change is wasteful.
      var aliases = this._aliasesByProject.get(buckProject);
      if (!aliases) {
        aliases = yield buckProject.listAliases();
        this._aliasesByProject.set(buckProject, aliases);
      }

      return aliases;
    })
  }, {
    key: '_getReactNativeServerCommand',
    value: _asyncToGenerator(function* () {
      var buckProject = this._mostRecentBuckProject;
      if (!buckProject) {
        return null;
      }
      var serverCommand = yield buckProject.getBuckConfig('react-native', 'server');
      if (serverCommand == null) {
        return null;
      }
      var repoRoot = yield buckProject.getPath();
      if (repoRoot == null) {
        return null;
      }
      return path.join(repoRoot, serverCommand);
    })
  }, {
    key: '_updateProject',
    value: _asyncToGenerator(function* (editor) {
      var nuclideUri = editor.getPath();
      if (!nuclideUri) {
        return;
      }
      var buckProject = this._textEditorToBuckProject.get(editor);
      if (!buckProject) {
        buckProject = yield buckProjectRootForPath(nuclideUri);
        if (!buckProject) {
          return;
        }
        this._textEditorToBuckProject.set(editor, buckProject);
      }
      this._mostRecentBuckProject = buckProject;
    })
  }, {
    key: '_updateBuildTarget',
    value: _asyncToGenerator(function* (buildTarget) {
      buildTarget = buildTarget.trim();
      this._buildTarget = buildTarget;

      this._buildRuleType = yield this._findRuleType();
      this.emitChange();
      this._isReactNativeApp = yield this._findIsReactNativeApp();
      this.emitChange();
    })
  }, {
    key: '_findRuleType',
    value: _asyncToGenerator(function* () {
      var buckProject = this._mostRecentBuckProject;
      var buildTarget = this._buildTarget;

      var buildRuleType = '';
      if (buildTarget && buckProject) {
        try {
          buildRuleType = yield buckProject.buildRuleTypeFor(buildTarget);
        } catch (e) {
          // Most likely, this is an invalid target, so do nothing.
        }
      }
      return buildRuleType;
    })
  }, {
    key: '_findIsReactNativeApp',
    value: _asyncToGenerator(function* () {
      var buildRuleType = this._buildRuleType;
      if (buildRuleType !== 'apple_bundle' && buildRuleType !== 'android_binary') {
        return false;
      }
      var buckProject = this._mostRecentBuckProject;
      if (!buckProject) {
        return false;
      }

      var reactNativeRule = buildRuleType === 'apple_bundle' ? 'ios_react_native_library' : 'android_react_native_library';

      var buildTarget = this._buildTarget;
      var matches = yield buckProject.queryWithArgs('kind(\'' + reactNativeRule + '\', deps(\'%s\'))', [buildTarget]);
      return matches[buildTarget].length > 0;
    })
  }, {
    key: '_doDebug',
    value: _asyncToGenerator(function* () {
      // TODO(natthu): Restore validation logic to make sure the target is installable.
      // For now, let's leave that to Buck.

      // Stop any existing debugging sessions, as install hangs if an existing
      // app that's being overwritten is being debugged.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:stop-debugging');

      var installResult = yield this._doBuild('install', /* debug */true);
      if (!installResult) {
        return;
      }
      var buckProject = installResult.buckProject;
      var pid = installResult.pid;

      if (pid) {
        // Use commands here to trigger package activation.
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
        var debuggerService = yield require('../../nuclide-service-hub-plus').consumeFirstProvider('nuclide-debugger.remote');
        var buckProjectPath = yield buckProject.getPath();
        debuggerService.debugLLDB(pid, buckProjectPath);
      }
    })
  }, {
    key: '_doBuild',
    value: _asyncToGenerator(function* (subcommand, debug) {
      var buildTarget = this._buildTarget;
      var simulator = this._simulator;
      var buckProject = this._mostRecentBuckProject;
      if (!this._buildTarget) {
        return;
      }
      if (!buckProject) {
        this._notifyError();
        return;
      }

      var appArgs = [];
      if (subcommand === 'install' && this.isReactNativeServerMode()) {
        var serverCommand = yield this._getReactNativeServerCommand();
        if (serverCommand) {
          this._reactNativeServerActions.startServer(serverCommand);
          appArgs = REACT_NATIVE_APP_FLAGS;
          this._reactNativeServerActions.startNodeExecutorServer();
        }
      }

      atom.notifications.addInfo('buck ' + subcommand + ' ' + buildTarget + ' started.');
      var ws = yield this._setupWebSocket(buckProject, buildTarget);

      this._buildProgress = 0;
      this._isBuilding = true;
      this.emitChange();

      var _ref = yield this._runBuckCommandInNewPane({ buckProject: buckProject, buildTarget: buildTarget, simulator: simulator, subcommand: subcommand, debug: debug, appArgs: appArgs });

      var pid = _ref.pid;

      this._isBuilding = false;
      this.emitChange();
      if (ws) {
        ws.close();
      }

      return { buckProject: buckProject, buildTarget: buildTarget, pid: pid };
    })

    /**
     * @return An Object with some details about the output of the command:
     *   pid: The process id of the running app, if 'run' was true.
     */
  }, {
    key: '_runBuckCommandInNewPane',
    value: _asyncToGenerator(function* (buckParams) {
      var _this2 = this;

      var buckProject = buckParams.buckProject;
      var buildTarget = buckParams.buildTarget;
      var simulator = buckParams.simulator;
      var subcommand = buckParams.subcommand;
      var debug = buckParams.debug;
      var appArgs = buckParams.appArgs;

      var getRunCommandInNewPane = require('../../nuclide-process-output');

      var _getRunCommandInNewPane = getRunCommandInNewPane();

      var runCommandInNewPane = _getRunCommandInNewPane.runCommandInNewPane;
      var disposable = _getRunCommandInNewPane.disposable;

      var run = subcommand === 'install';
      var runProcessWithHandlers = _asyncToGenerator(function* (dataHandlerOptions) {
        var stdout = dataHandlerOptions.stdout;
        var stderr = dataHandlerOptions.stderr;
        var error = dataHandlerOptions.error;
        var exit = dataHandlerOptions.exit;

        var observable = undefined;
        invariant(buckProject);
        if (run) {
          observable = yield buckProject.installWithOutput([buildTarget], simulator, { run: run, debug: debug, appArgs: appArgs });
        } else if (subcommand === 'build') {
          observable = yield buckProject.buildWithOutput([buildTarget]);
        } else if (subcommand === 'test') {
          observable = yield buckProject.testWithOutput([buildTarget]);
        } else {
          throw Error('Unknown subcommand: ' + subcommand);
        }
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
          atom.notifications.addError(buildTarget + ' failed to build.');
          disposable.dispose();
        };
        var onExit = function onExit() {
          // onExit will only be called if the process completes successfully,
          // i.e. with exit code 0. Unfortunately an Observable cannot pass an
          // argument (e.g. an exit code) on completion.
          exit(0);
          atom.notifications.addSuccess('buck ' + subcommand + ' succeeded.');
          disposable.dispose();
        };
        var subscription = observable.subscribe(onNext, onError, onExit);

        return {
          kill: function kill() {
            subscription.unsubscribe();
            disposable.dispose();
          }
        };
      });

      var buckRunPromise = new Promise(function (resolve, reject) {
        var _require4 = require('../../nuclide-process-output-store');

        var ProcessOutputStore = _require4.ProcessOutputStore;

        var processOutputStore = new ProcessOutputStore(runProcessWithHandlers);

        var _require5 = require('../../nuclide-process-output-handler');

        var handleBuckAnsiOutput = _require5.handleBuckAnsiOutput;

        _this2._buckProcessOutputStore = processOutputStore;
        var exitSubscription = processOutputStore.onProcessExit(function (exitCode) {
          if (exitCode === 0 && run) {
            // Get the process ID.
            var allBuildOutput = processOutputStore.getStdout() || '';
            var pidMatch = allBuildOutput.match(BUCK_PROCESS_ID_REGEX);
            if (pidMatch) {
              // Index 1 is the captured pid.
              resolve({ pid: parseInt(pidMatch[1], 10) });
            }
          } else {
            resolve({});
          }
          exitSubscription.dispose();
          _this2._buckProcessOutputStore = null;
        });

        runCommandInNewPane({
          tabTitle: 'buck ' + subcommand + ' ' + buildTarget,
          processOutputStore: processOutputStore,
          processOutputHandler: handleBuckAnsiOutput,
          destroyExistingPane: true
        });
      });

      return yield buckRunPromise;
    })
  }, {
    key: '_setupWebSocket',
    value: _asyncToGenerator(function* (buckProject, buildTarget) {
      var _this3 = this;

      var httpPort = yield buckProject.getServerPort();
      if (httpPort <= 0) {
        return null;
      }

      var uri = 'ws://localhost:' + httpPort + '/ws/build';
      var ws = new WebSocket(uri);
      var buildId = null;
      var isFinished = false;

      ws.onmessage = function (e) {
        var message = undefined;
        try {
          message = JSON.parse(e.data);
        } catch (err) {
          getLogger().error('Buck was likely killed while building ' + buildTarget + '.');
          return;
        }
        var type = message['type'];
        if (buildId === null) {
          if (type === 'BuildStarted') {
            buildId = message['buildId'];
          } else {
            return;
          }
        }

        if (buildId !== message['buildId']) {
          return;
        }

        if (type === 'BuildProgressUpdated' || type === 'ParsingProgressUpdated') {
          _this3._buildProgress = message.progressValue;
          _this3.emitChange();
        } else if (type === 'BuildFinished') {
          _this3._buildProgress = 1.0;
          _this3.emitChange();
          isFinished = true;
          ws.close();
        }
      };

      ws.onclose = function () {
        if (!isFinished) {
          getLogger().error('WebSocket closed before ' + buildTarget + ' finished building.');
        }
      };
      return ws;
    })
  }, {
    key: '_notifyError',
    value: function _notifyError() {
      var activeEditor = atom.workspace.getActiveTextEditor();
      if (!activeEditor) {
        atom.notifications.addWarning('Could not build: must navigate to a file that is part of a Buck project.');
        return;
      }

      var fileName = activeEditor.getPath();
      atom.notifications.addWarning('Could not build: file \'' + fileName + '\' is not part of a Buck project.');
    }
  }]);

  return BuckToolbarStore;
})();

module.exports = BuckToolbarStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1Y2tUb29sYmFyU3RvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7d0NBa0NxQyw0QkFBNEI7Ozs7d0NBQzVCLDRCQUE0Qjs7Ozs7Ozs7Ozs7O0FBeEJqRSxJQUFJLE1BQU0sWUFBQSxDQUFDO0FBQ1gsU0FBUyxTQUFTLEdBQUc7QUFDbkIsTUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLFVBQU0sR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztHQUN2RDtBQUNELFNBQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRUQsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztlQUNsQixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUExQixPQUFPLFlBQVAsT0FBTzs7QUFDZCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7O2dCQUNSLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdCLFVBQVUsYUFBVixVQUFVOztnQkFDZ0IsT0FBTyxDQUFDLDRCQUE0QixDQUFDOztJQUEvRCxzQkFBc0IsYUFBdEIsc0JBQXNCOztBQUM3QixJQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOztBQWEzRCxJQUFNLHFCQUFxQixHQUFHLGtCQUFrQixDQUFDO0FBQ2pELElBQU0sc0JBQXNCLEdBQUcsQ0FDN0Isb0JBQW9CLEVBQUUsc0JBQXNCLEVBQzVDLDBCQUEwQixFQUFFLFNBQVMsRUFDckMsMEJBQTBCLEVBQUUsTUFBTSxDQUNuQyxDQUFDOztJQVFJLGdCQUFnQjtBQW1CVCxXQW5CUCxnQkFBZ0IsQ0FtQlIsVUFBc0IsRUFBbUM7UUFBakMsWUFBMEIseURBQUcsRUFBRTs7MEJBbkIvRCxnQkFBZ0I7O0FBb0JsQixRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUM5QixRQUFJLENBQUMseUJBQXlCLEdBQUcsMENBQTZCLFVBQVUsQ0FBQyxDQUFDO0FBQzFFLFFBQUksQ0FBQyx5QkFBeUIsR0FBRywwQ0FDL0IsVUFBVSxFQUNWLElBQUksQ0FBQyx5QkFBeUIsQ0FDL0IsQ0FBQztBQUNGLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUM5QixRQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUM5QyxRQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUN2QyxRQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzlCLFFBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztHQUN0Qjs7ZUEvQkcsZ0JBQWdCOztXQWlDVixvQkFBQyxZQUEwQixFQUFFO0FBQ3JDLFVBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUM7QUFDbkQsVUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDeEIsVUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDekIsVUFBSSxDQUFDLGVBQWUsR0FBRyxZQUFZLENBQUMsY0FBYyxJQUFJLEtBQUssQ0FBQztBQUM1RCxVQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO0FBQy9CLFVBQUksQ0FBQyx3QkFBd0IsR0FBRyxZQUFZLENBQUMsdUJBQXVCLElBQUksS0FBSyxDQUFDO0tBQy9FOzs7V0FFWSx5QkFBRzs7O0FBQ2QsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDbEMsZ0JBQVEsTUFBTSxDQUFDLFVBQVU7QUFDdkIsZUFBSyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsY0FBYztBQUMvQyxrQkFBSyxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ25DLGtCQUFNO0FBQUEsQUFDUixlQUFLLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxtQkFBbUI7QUFDcEQsa0JBQUssa0JBQWtCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzVDLGtCQUFNO0FBQUEsQUFDUixlQUFLLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxnQkFBZ0I7QUFDakQsa0JBQUssVUFBVSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDbkMsa0JBQU07QUFBQSxBQUNSLGVBQUssa0JBQWtCLENBQUMsVUFBVSxDQUFDLCtCQUErQjtBQUNoRSxrQkFBSyx3QkFBd0IsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ2xELGtCQUFLLFVBQVUsRUFBRSxDQUFDO0FBQ2xCLGtCQUFNO0FBQUEsQUFDUixlQUFLLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxLQUFLO0FBQ3RDLGtCQUFLLFFBQVEsQ0FBQyxPQUFPLGFBQWMsS0FBSyxDQUFDLENBQUM7QUFDMUMsa0JBQU07QUFBQSxBQUNSLGVBQUssa0JBQWtCLENBQUMsVUFBVSxDQUFDLEdBQUc7QUFDcEMsa0JBQUssUUFBUSxDQUFDLFNBQVMsYUFBYyxLQUFLLENBQUMsQ0FBQztBQUM1QyxrQkFBTTtBQUFBLEFBQ1IsZUFBSyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsSUFBSTtBQUNyQyxrQkFBSyxRQUFRLENBQUMsTUFBTSxhQUFjLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLGtCQUFNO0FBQUEsQUFDUixlQUFLLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxLQUFLO0FBQ3RDLGtCQUFLLFFBQVEsRUFBRSxDQUFDO0FBQ2hCLGtCQUFNO0FBQUEsQUFDUixlQUFLLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyx1QkFBdUI7QUFDeEQsa0JBQUssZUFBZSxHQUFHLENBQUMsTUFBSyxlQUFlLENBQUM7QUFDN0Msa0JBQUssVUFBVSxFQUFFLENBQUM7QUFDbEIsa0JBQU07QUFBQSxBQUNSLGVBQUssa0JBQWtCLENBQUMsVUFBVSxDQUFDLHVCQUF1QjtBQUN4RCxrQkFBSyxlQUFlLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUM3QyxrQkFBSyxVQUFVLEVBQUUsQ0FBQztBQUNsQixrQkFBTTtBQUFBLFNBQ1Q7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDekMsVUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7QUFDaEMsWUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsRUFBRSxDQUFDO09BQzVDO0tBQ0Y7OztXQUVRLG1CQUFDLFFBQW9CLEVBQWU7QUFDM0MsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDN0M7OztXQUVTLHNCQUFTO0FBQ2pCLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzlCOzs7V0FFYSwwQkFBVztBQUN2QixhQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7S0FDMUI7OztXQUVTLHNCQUFZO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztLQUN6Qjs7O1dBRVUsdUJBQVc7QUFDcEIsYUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0tBQzVCOzs7V0FFZSw0QkFBVztBQUN6QixhQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7S0FDNUI7OztXQUVhLDBCQUFZO0FBQ3hCLGFBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztLQUM3Qjs7O1dBRWUsNEJBQVk7QUFDMUIsYUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7S0FDL0I7OztXQUVzQixtQ0FBWTtBQUNqQyxhQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztLQUNqRTs7OzZCQUVnQixhQUEyQjtBQUMxQyxVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7QUFDaEQsVUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNoQixlQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7T0FDNUI7Ozs7QUFJRCxVQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3RELFVBQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixlQUFPLEdBQUcsTUFBTSxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDMUMsWUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDbEQ7O0FBRUQsYUFBTyxPQUFPLENBQUM7S0FDaEI7Ozs2QkFFaUMsYUFBcUI7QUFDckQsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDO0FBQ2hELFVBQUksQ0FBQyxXQUFXLEVBQUU7QUFDaEIsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELFVBQU0sYUFBYSxHQUFHLE1BQU0sV0FBVyxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDaEYsVUFBSSxhQUFhLElBQUksSUFBSSxFQUFFO0FBQ3pCLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxVQUFNLFFBQVEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QyxVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7S0FDM0M7Ozs2QkFFbUIsV0FBQyxNQUFrQixFQUFpQjtBQUN0RCxVQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDcEMsVUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNmLGVBQU87T0FDUjtBQUNELFVBQUksV0FBVyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDNUQsVUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNoQixtQkFBVyxHQUFHLE1BQU0sc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdkQsWUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNoQixpQkFBTztTQUNSO0FBQ0QsWUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7T0FDeEQ7QUFDRCxVQUFJLENBQUMsc0JBQXNCLEdBQUcsV0FBVyxDQUFDO0tBQzNDOzs7NkJBRXVCLFdBQUMsV0FBbUIsRUFBaUI7QUFDM0QsaUJBQVcsR0FBRyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakMsVUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7O0FBRWhDLFVBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDakQsVUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQzVELFVBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUNuQjs7OzZCQUVrQixhQUFvQjtBQUNyQyxVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7QUFDaEQsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQzs7QUFFdEMsVUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLFVBQUksV0FBVyxJQUFJLFdBQVcsRUFBRTtBQUM5QixZQUFJO0FBQ0YsdUJBQWEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNqRSxDQUFDLE9BQU8sQ0FBQyxFQUFFOztTQUVYO09BQ0Y7QUFDRCxhQUFPLGFBQWEsQ0FBQztLQUN0Qjs7OzZCQUUwQixhQUFxQjtBQUM5QyxVQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO0FBQzFDLFVBQUksYUFBYSxLQUFLLGNBQWMsSUFBSSxhQUFhLEtBQUssZ0JBQWdCLEVBQUU7QUFDMUUsZUFBTyxLQUFLLENBQUM7T0FDZDtBQUNELFVBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztBQUNoRCxVQUFJLENBQUMsV0FBVyxFQUFFO0FBQ2hCLGVBQU8sS0FBSyxDQUFDO09BQ2Q7O0FBRUQsVUFBTSxlQUFlLEdBQUcsYUFBYSxLQUFLLGNBQWMsR0FDdEQsMEJBQTBCLEdBQzFCLDhCQUE4QixDQUFDOztBQUVqQyxVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ3RDLFVBQU0sT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFDLGFBQWEsYUFDcEMsZUFBZSx3QkFDeEIsQ0FBQyxXQUFXLENBQUMsQ0FDZCxDQUFDO0FBQ0YsYUFBTyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztLQUN4Qzs7OzZCQUVhLGFBQWtCOzs7Ozs7QUFNOUIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDbEMsaUNBQWlDLENBQUMsQ0FBQzs7QUFFckMsVUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsYUFBYyxJQUFJLENBQUMsQ0FBQztBQUN2RSxVQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2xCLGVBQU87T0FDUjtVQUNNLFdBQVcsR0FBUyxhQUFhLENBQWpDLFdBQVc7VUFBRSxHQUFHLEdBQUksYUFBYSxDQUFwQixHQUFHOztBQUV2QixVQUFJLEdBQUcsRUFBRTs7QUFFUCxZQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztBQUNwRixZQUFNLGVBQWUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUNsRSxvQkFBb0IsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3JELFlBQU0sZUFBZSxHQUFHLE1BQU0sV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BELHVCQUFlLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQztPQUNqRDtLQUNGOzs7NkJBRWEsV0FDWixVQUEwQixFQUMxQixLQUFjLEVBQzJEO0FBQ3pFLFVBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDdEMsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUNsQyxVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7QUFDaEQsVUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDdEIsZUFBTztPQUNSO0FBQ0QsVUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNoQixZQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDcEIsZUFBTztPQUNSOztBQUVELFVBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNqQixVQUFJLFVBQVUsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFLEVBQUU7QUFDOUQsWUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztBQUNoRSxZQUFJLGFBQWEsRUFBRTtBQUNqQixjQUFJLENBQUMseUJBQXlCLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzFELGlCQUFPLEdBQUcsc0JBQXNCLENBQUM7QUFDakMsY0FBSSxDQUFDLHlCQUF5QixDQUFDLHVCQUF1QixFQUFFLENBQUM7U0FDMUQ7T0FDRjs7QUFFRCxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sV0FBUyxVQUFVLFNBQUksV0FBVyxlQUFZLENBQUM7QUFDekUsVUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQzs7QUFFaEUsVUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDeEIsVUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDeEIsVUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDOztpQkFFSixNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FDN0MsRUFBQyxXQUFXLEVBQVgsV0FBVyxFQUFFLFdBQVcsRUFBWCxXQUFXLEVBQUUsU0FBUyxFQUFULFNBQVMsRUFBRSxVQUFVLEVBQVYsVUFBVSxFQUFFLEtBQUssRUFBTCxLQUFLLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBQyxDQUFDOztVQUQvRCxHQUFHLFFBQUgsR0FBRzs7QUFHVixVQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUN6QixVQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDbEIsVUFBSSxFQUFFLEVBQUU7QUFDTixVQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDWjs7QUFFRCxhQUFPLEVBQUMsV0FBVyxFQUFYLFdBQVcsRUFBRSxXQUFXLEVBQVgsV0FBVyxFQUFFLEdBQUcsRUFBSCxHQUFHLEVBQUMsQ0FBQztLQUN4Qzs7Ozs7Ozs7NkJBTTZCLFdBQUMsVUFPOUIsRUFBMkI7OztVQUNuQixXQUFXLEdBQXdELFVBQVUsQ0FBN0UsV0FBVztVQUFFLFdBQVcsR0FBMkMsVUFBVSxDQUFoRSxXQUFXO1VBQUUsU0FBUyxHQUFnQyxVQUFVLENBQW5ELFNBQVM7VUFBRSxVQUFVLEdBQW9CLFVBQVUsQ0FBeEMsVUFBVTtVQUFFLEtBQUssR0FBYSxVQUFVLENBQTVCLEtBQUs7VUFBRSxPQUFPLEdBQUksVUFBVSxDQUFyQixPQUFPOztBQUV0RSxVQUFNLHNCQUFzQixHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDOztvQ0FDN0Isc0JBQXNCLEVBQUU7O1VBQTNELG1CQUFtQiwyQkFBbkIsbUJBQW1CO1VBQUUsVUFBVSwyQkFBVixVQUFVOztBQUV0QyxVQUFNLEdBQUcsR0FBRyxVQUFVLEtBQUssU0FBUyxDQUFDO0FBQ3JDLFVBQU0sc0JBQXNCLHFCQUFHLFdBQU8sa0JBQWtCLEVBQWdDO1lBQy9FLE1BQU0sR0FBeUIsa0JBQWtCLENBQWpELE1BQU07WUFBRSxNQUFNLEdBQWlCLGtCQUFrQixDQUF6QyxNQUFNO1lBQUUsS0FBSyxHQUFVLGtCQUFrQixDQUFqQyxLQUFLO1lBQUUsSUFBSSxHQUFJLGtCQUFrQixDQUExQixJQUFJOztBQUNsQyxZQUFJLFVBQVUsWUFBQSxDQUFDO0FBQ2YsaUJBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN2QixZQUFJLEdBQUcsRUFBRTtBQUNQLG9CQUFVLEdBQUcsTUFBTSxXQUFXLENBQUMsaUJBQWlCLENBQzVDLENBQUMsV0FBVyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUMsR0FBRyxFQUFILEdBQUcsRUFBRSxLQUFLLEVBQUwsS0FBSyxFQUFFLE9BQU8sRUFBUCxPQUFPLEVBQUMsQ0FBQyxDQUFDO1NBQ3RELE1BQU0sSUFBSSxVQUFVLEtBQUssT0FBTyxFQUFFO0FBQ2pDLG9CQUFVLEdBQUcsTUFBTSxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztTQUMvRCxNQUFNLElBQUksVUFBVSxLQUFLLE1BQU0sRUFBRTtBQUNoQyxvQkFBVSxHQUFHLE1BQU0sV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7U0FDOUQsTUFBTTtBQUNMLGdCQUFNLEtBQUssMEJBQXdCLFVBQVUsQ0FBRyxDQUFDO1NBQ2xEO0FBQ0QsWUFBTSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQUksSUFBSSxFQUF5QztBQUMzRCxjQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDZixrQkFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztXQUNyQixNQUFNO0FBQ0wsa0JBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1dBQzNCO1NBQ0YsQ0FBQztBQUNGLFlBQU0sT0FBTyxHQUFHLFNBQVYsT0FBTyxDQUFJLElBQUksRUFBYTtBQUNoQyxlQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2QixjQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDUixjQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBSSxXQUFXLHVCQUFvQixDQUFDO0FBQy9ELG9CQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDdEIsQ0FBQztBQUNGLFlBQU0sTUFBTSxHQUFHLFNBQVQsTUFBTSxHQUFTOzs7O0FBSW5CLGNBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNSLGNBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxXQUFTLFVBQVUsaUJBQWMsQ0FBQztBQUMvRCxvQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ3RCLENBQUM7QUFDRixZQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRW5FLGVBQU87QUFDTCxjQUFJLEVBQUEsZ0JBQUc7QUFDTCx3QkFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNCLHNCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7V0FDdEI7U0FDRixDQUFDO09BQ0gsQ0FBQSxDQUFDOztBQUVGLFVBQU0sY0FBdUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7d0JBQ2xELE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQzs7WUFBbkUsa0JBQWtCLGFBQWxCLGtCQUFrQjs7QUFDekIsWUFBTSxrQkFBa0IsR0FBRyxJQUFJLGtCQUFrQixDQUFDLHNCQUFzQixDQUFDLENBQUM7O3dCQUMzQyxPQUFPLENBQUMsc0NBQXNDLENBQUM7O1lBQXZFLG9CQUFvQixhQUFwQixvQkFBb0I7O0FBRTNCLGVBQUssdUJBQXVCLEdBQUcsa0JBQWtCLENBQUM7QUFDbEQsWUFBTSxnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsVUFBQyxRQUFRLEVBQWE7QUFDOUUsY0FBSSxRQUFRLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRTs7QUFFekIsZ0JBQU0sY0FBYyxHQUFHLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM1RCxnQkFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzdELGdCQUFJLFFBQVEsRUFBRTs7QUFFWixxQkFBTyxDQUFDLEVBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO2FBQzNDO1dBQ0YsTUFBTTtBQUNMLG1CQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7V0FDYjtBQUNELDBCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzNCLGlCQUFLLHVCQUF1QixHQUFHLElBQUksQ0FBQztTQUNyQyxDQUFDLENBQUM7O0FBRUgsMkJBQW1CLENBQUM7QUFDbEIsa0JBQVEsWUFBVSxVQUFVLFNBQUksV0FBVyxBQUFFO0FBQzdDLDRCQUFrQixFQUFsQixrQkFBa0I7QUFDbEIsOEJBQW9CLEVBQUUsb0JBQW9CO0FBQzFDLDZCQUFtQixFQUFFLElBQUk7U0FDMUIsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDOztBQUVILGFBQU8sTUFBTSxjQUFjLENBQUM7S0FDN0I7Ozs2QkFFb0IsV0FBQyxXQUF3QixFQUFFLFdBQW1CLEVBQXVCOzs7QUFDeEYsVUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDbkQsVUFBSSxRQUFRLElBQUksQ0FBQyxFQUFFO0FBQ2pCLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsVUFBTSxHQUFHLHVCQUFxQixRQUFRLGNBQVcsQ0FBQztBQUNsRCxVQUFNLEVBQUUsR0FBRyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixVQUFJLE9BQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzVCLFVBQUksVUFBVSxHQUFHLEtBQUssQ0FBQzs7QUFFdkIsUUFBRSxDQUFDLFNBQVMsR0FBRyxVQUFBLENBQUMsRUFBSTtBQUNsQixZQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osWUFBSTtBQUNGLGlCQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDOUIsQ0FBQyxPQUFPLEdBQUcsRUFBRTtBQUNaLG1CQUFTLEVBQUUsQ0FBQyxLQUFLLDRDQUM0QixXQUFXLE9BQUksQ0FBQztBQUM3RCxpQkFBTztTQUNSO0FBQ0QsWUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLFlBQUksT0FBTyxLQUFLLElBQUksRUFBRTtBQUNwQixjQUFJLElBQUksS0FBSyxjQUFjLEVBQUU7QUFDM0IsbUJBQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7V0FDOUIsTUFBTTtBQUNMLG1CQUFPO1dBQ1I7U0FDRjs7QUFFRCxZQUFJLE9BQU8sS0FBSyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDbEMsaUJBQU87U0FDUjs7QUFFRCxZQUFJLElBQUksS0FBSyxzQkFBc0IsSUFBSSxJQUFJLEtBQUssd0JBQXdCLEVBQUU7QUFDeEUsaUJBQUssY0FBYyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7QUFDNUMsaUJBQUssVUFBVSxFQUFFLENBQUM7U0FDbkIsTUFBTSxJQUFJLElBQUksS0FBSyxlQUFlLEVBQUU7QUFDbkMsaUJBQUssY0FBYyxHQUFHLEdBQUcsQ0FBQztBQUMxQixpQkFBSyxVQUFVLEVBQUUsQ0FBQztBQUNsQixvQkFBVSxHQUFHLElBQUksQ0FBQztBQUNsQixZQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDWjtPQUNGLENBQUM7O0FBRUYsUUFBRSxDQUFDLE9BQU8sR0FBRyxZQUFNO0FBQ2pCLFlBQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixtQkFBUyxFQUFFLENBQUMsS0FBSyw4QkFDYyxXQUFXLHlCQUFzQixDQUFDO1NBQ2xFO09BQ0YsQ0FBQztBQUNGLGFBQU8sRUFBRSxDQUFDO0tBQ1g7OztXQUVXLHdCQUFHO0FBQ2IsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzFELFVBQUksQ0FBQyxZQUFZLEVBQUU7QUFDakIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLDRFQUNrRCxDQUFDO0FBQ2hGLGVBQU87T0FDUjs7QUFFRCxVQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDeEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLDhCQUNDLFFBQVEsdUNBQW1DLENBQUM7S0FDM0U7OztTQXBjRyxnQkFBZ0I7OztBQXVjdEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyIsImZpbGUiOiJCdWNrVG9vbGJhclN0b3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxubGV0IGxvZ2dlcjtcbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgaWYgKCFsb2dnZXIpIHtcbiAgICBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgfVxuICByZXR1cm4gbG9nZ2VyO1xufVxuXG5jb25zdCBpbnZhcmlhbnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcbmNvbnN0IHtFbWl0dGVyfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB7RGlzcGF0Y2hlcn0gPSByZXF1aXJlKCdmbHV4Jyk7XG5jb25zdCB7YnVja1Byb2plY3RSb290Rm9yUGF0aH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWJ1Y2stY29tbW9ucycpO1xuY29uc3QgQnVja1Rvb2xiYXJBY3Rpb25zID0gcmVxdWlyZSgnLi9CdWNrVG9vbGJhckFjdGlvbnMnKTtcblxudHlwZSBCdWNrUnVuRGV0YWlscyA9IHtcbiAgcGlkPzogbnVtYmVyO1xufTtcbmltcG9ydCB0eXBlIHtcbiAgUHJvY2Vzc091dHB1dFN0b3JlIGFzIFByb2Nlc3NPdXRwdXRTdG9yZVR5cGUsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtcHJvY2Vzcy1vdXRwdXQtc3RvcmUnO1xuaW1wb3J0IHR5cGUge1Byb2Nlc3NPdXRwdXREYXRhSGFuZGxlcnN9IGZyb20gJy4uLy4uL251Y2xpZGUtcHJvY2Vzcy1vdXRwdXQtc3RvcmUvbGliL3R5cGVzJztcbmltcG9ydCB0eXBlIHtCdWNrUHJvamVjdH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1idWNrLWJhc2UvbGliL0J1Y2tQcm9qZWN0JztcbmltcG9ydCBSZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXIgZnJvbSAnLi9SZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXInO1xuaW1wb3J0IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyBmcm9tICcuL1JlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyc7XG5cbmNvbnN0IEJVQ0tfUFJPQ0VTU19JRF9SRUdFWCA9IC9sbGRiIC1wIChbMC05XSspLztcbmNvbnN0IFJFQUNUX05BVElWRV9BUFBfRkxBR1MgPSBbXG4gICctZXhlY3V0b3Itb3ZlcnJpZGUnLCAnUkNUV2ViU29ja2V0RXhlY3V0b3InLFxuICAnLXdlYnNvY2tldC1leGVjdXRvci1uYW1lJywgJ051Y2xpZGUnLFxuICAnLXdlYnNvY2tldC1leGVjdXRvci1wb3J0JywgJzgwOTAnLFxuXTtcblxudHlwZSBJbml0aWFsU3RhdGUgPSB7XG4gIGlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlPzogYm9vbGVhbjtcbn07XG5cbnR5cGUgQnVja1N1YmNvbW1hbmQgPSAnYnVpbGQnIHwgJ2luc3RhbGwnIHwgJ3Rlc3QnO1xuXG5jbGFzcyBCdWNrVG9vbGJhclN0b3JlIHtcblxuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9yZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnM6IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucztcbiAgX3JlYWN0TmF0aXZlU2VydmVyTWFuYWdlcjogUmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyO1xuICBfbW9zdFJlY2VudEJ1Y2tQcm9qZWN0OiA/QnVja1Byb2plY3Q7XG4gIF90ZXh0RWRpdG9yVG9CdWNrUHJvamVjdDogV2Vha01hcDxUZXh0RWRpdG9yLCBCdWNrUHJvamVjdD47XG4gIF9pc0J1aWxkaW5nOiBib29sZWFuO1xuICBfYnVpbGRUYXJnZXQ6IHN0cmluZztcbiAgX2J1aWxkUHJvZ3Jlc3M6IG51bWJlcjtcbiAgX2J1aWxkUnVsZVR5cGU6IHN0cmluZztcbiAgX3NpbXVsYXRvcjogP3N0cmluZztcbiAgX2lzUGFuZWxWaXNpYmxlOiBib29sZWFuO1xuICBfaXNSZWFjdE5hdGl2ZUFwcDogYm9vbGVhbjtcbiAgX2lzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlOiBib29sZWFuO1xuICBfYnVja1Byb2Nlc3NPdXRwdXRTdG9yZTogP1Byb2Nlc3NPdXRwdXRTdG9yZVR5cGU7XG4gIF9hbGlhc2VzQnlQcm9qZWN0OiBXZWFrTWFwPEJ1Y2tQcm9qZWN0LCBBcnJheTxzdHJpbmc+PjtcblxuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyOiBEaXNwYXRjaGVyLCBpbml0aWFsU3RhdGU6IEluaXRpYWxTdGF0ZSA9IHt9KSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5fcmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zID0gbmV3IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyhkaXNwYXRjaGVyKTtcbiAgICB0aGlzLl9yZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXIgPSBuZXcgUmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyKFxuICAgICAgZGlzcGF0Y2hlcixcbiAgICAgIHRoaXMuX3JlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyxcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JUb0J1Y2tQcm9qZWN0ID0gbmV3IFdlYWtNYXAoKTtcbiAgICB0aGlzLl9hbGlhc2VzQnlQcm9qZWN0ID0gbmV3IFdlYWtNYXAoKTtcbiAgICB0aGlzLl9pbml0U3RhdGUoaW5pdGlhbFN0YXRlKTtcbiAgICB0aGlzLl9zZXR1cEFjdGlvbnMoKTtcbiAgfVxuXG4gIF9pbml0U3RhdGUoaW5pdGlhbFN0YXRlOiBJbml0aWFsU3RhdGUpIHtcbiAgICB0aGlzLl9pc0J1aWxkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5fYnVpbGRUYXJnZXQgPSBpbml0aWFsU3RhdGUuYnVpbGRUYXJnZXQgfHwgJyc7XG4gICAgdGhpcy5fYnVpbGRQcm9ncmVzcyA9IDA7XG4gICAgdGhpcy5fYnVpbGRSdWxlVHlwZSA9ICcnO1xuICAgIHRoaXMuX2lzUGFuZWxWaXNpYmxlID0gaW5pdGlhbFN0YXRlLmlzUGFuZWxWaXNpYmxlIHx8IGZhbHNlO1xuICAgIHRoaXMuX2lzUmVhY3ROYXRpdmVBcHAgPSBmYWxzZTtcbiAgICB0aGlzLl9pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSA9IGluaXRpYWxTdGF0ZS5pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSB8fCBmYWxzZTtcbiAgfVxuXG4gIF9zZXR1cEFjdGlvbnMoKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5yZWdpc3RlcihhY3Rpb24gPT4ge1xuICAgICAgc3dpdGNoIChhY3Rpb24uYWN0aW9uVHlwZSkge1xuICAgICAgICBjYXNlIEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlVQREFURV9QUk9KRUNUOlxuICAgICAgICAgIHRoaXMuX3VwZGF0ZVByb2plY3QoYWN0aW9uLmVkaXRvcik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX0JVSUxEX1RBUkdFVDpcbiAgICAgICAgICB0aGlzLl91cGRhdGVCdWlsZFRhcmdldChhY3Rpb24uYnVpbGRUYXJnZXQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlVQREFURV9TSU1VTEFUT1I6XG4gICAgICAgICAgdGhpcy5fc2ltdWxhdG9yID0gYWN0aW9uLnNpbXVsYXRvcjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfUkVBQ1RfTkFUSVZFX1NFUlZFUl9NT0RFOlxuICAgICAgICAgIHRoaXMuX2lzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlID0gYWN0aW9uLnNlcnZlck1vZGU7XG4gICAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuQlVJTEQ6XG4gICAgICAgICAgdGhpcy5fZG9CdWlsZCgnYnVpbGQnLCAvKiBkZWJ1ZyAqLyBmYWxzZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuUlVOOlxuICAgICAgICAgIHRoaXMuX2RvQnVpbGQoJ2luc3RhbGwnLCAvKiBkZWJ1ZyAqLyBmYWxzZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVEVTVDpcbiAgICAgICAgICB0aGlzLl9kb0J1aWxkKCd0ZXN0JywgLyogZGVidWcgKi8gZmFsc2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLkRFQlVHOlxuICAgICAgICAgIHRoaXMuX2RvRGVidWcoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5UT0dHTEVfUEFORUxfVklTSUJJTElUWTpcbiAgICAgICAgICB0aGlzLl9pc1BhbmVsVmlzaWJsZSA9ICF0aGlzLl9pc1BhbmVsVmlzaWJsZTtcbiAgICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfUEFORUxfVklTSUJJTElUWTpcbiAgICAgICAgICB0aGlzLl9pc1BhbmVsVmlzaWJsZSA9IGFjdGlvbi5pc1BhbmVsVmlzaWJsZTtcbiAgICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fcmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5fYnVja1Byb2Nlc3NPdXRwdXRTdG9yZSkge1xuICAgICAgdGhpcy5fYnVja1Byb2Nlc3NPdXRwdXRTdG9yZS5zdG9wUHJvY2VzcygpO1xuICAgIH1cbiAgfVxuXG4gIHN1YnNjcmliZShjYWxsYmFjazogKCkgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignY2hhbmdlJywgY2FsbGJhY2spO1xuICB9XG5cbiAgZW1pdENoYW5nZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2NoYW5nZScpO1xuICB9XG5cbiAgZ2V0QnVpbGRUYXJnZXQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fYnVpbGRUYXJnZXQ7XG4gIH1cblxuICBpc0J1aWxkaW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0J1aWxkaW5nO1xuICB9XG5cbiAgZ2V0UnVsZVR5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fYnVpbGRSdWxlVHlwZTtcbiAgfVxuXG4gIGdldEJ1aWxkUHJvZ3Jlc3MoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fYnVpbGRQcm9ncmVzcztcbiAgfVxuXG4gIGlzUGFuZWxWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc1BhbmVsVmlzaWJsZTtcbiAgfVxuXG4gIGlzUmVhY3ROYXRpdmVBcHAoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzUmVhY3ROYXRpdmVBcHA7XG4gIH1cblxuICBpc1JlYWN0TmF0aXZlU2VydmVyTW9kZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc1JlYWN0TmF0aXZlQXBwKCkgJiYgdGhpcy5faXNSZWFjdE5hdGl2ZVNlcnZlck1vZGU7XG4gIH1cblxuICBhc3luYyBsb2FkQWxpYXNlcygpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgICBjb25zdCBidWNrUHJvamVjdCA9IHRoaXMuX21vc3RSZWNlbnRCdWNrUHJvamVjdDtcbiAgICBpZiAoIWJ1Y2tQcm9qZWN0KSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICB9XG5cbiAgICAvLyBDYWNoZSBhbGlhc2VzIGZvciBhIHByb2plY3QgYmVjYXVzZSBpbnZva2luZyBidWNrIGp1c3QgdG8gbGlzdCBhbGlhc2VzIHRoYXQgYXJlIGhpZ2hseVxuICAgIC8vIHVubGlrZWx5IHRvIGNoYW5nZSBpcyB3YXN0ZWZ1bC5cbiAgICBsZXQgYWxpYXNlcyA9IHRoaXMuX2FsaWFzZXNCeVByb2plY3QuZ2V0KGJ1Y2tQcm9qZWN0KTtcbiAgICBpZiAoIWFsaWFzZXMpIHtcbiAgICAgIGFsaWFzZXMgPSBhd2FpdCBidWNrUHJvamVjdC5saXN0QWxpYXNlcygpO1xuICAgICAgdGhpcy5fYWxpYXNlc0J5UHJvamVjdC5zZXQoYnVja1Byb2plY3QsIGFsaWFzZXMpO1xuICAgIH1cblxuICAgIHJldHVybiBhbGlhc2VzO1xuICB9XG5cbiAgYXN5bmMgX2dldFJlYWN0TmF0aXZlU2VydmVyQ29tbWFuZCgpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICBjb25zdCBidWNrUHJvamVjdCA9IHRoaXMuX21vc3RSZWNlbnRCdWNrUHJvamVjdDtcbiAgICBpZiAoIWJ1Y2tQcm9qZWN0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc2VydmVyQ29tbWFuZCA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmdldEJ1Y2tDb25maWcoJ3JlYWN0LW5hdGl2ZScsICdzZXJ2ZXInKTtcbiAgICBpZiAoc2VydmVyQ29tbWFuZCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgcmVwb1Jvb3QgPSBhd2FpdCBidWNrUHJvamVjdC5nZXRQYXRoKCk7XG4gICAgaWYgKHJlcG9Sb290ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aC5qb2luKHJlcG9Sb290LCBzZXJ2ZXJDb21tYW5kKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVQcm9qZWN0KGVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG51Y2xpZGVVcmkgPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghbnVjbGlkZVVyaSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgYnVja1Byb2plY3QgPSB0aGlzLl90ZXh0RWRpdG9yVG9CdWNrUHJvamVjdC5nZXQoZWRpdG9yKTtcbiAgICBpZiAoIWJ1Y2tQcm9qZWN0KSB7XG4gICAgICBidWNrUHJvamVjdCA9IGF3YWl0IGJ1Y2tQcm9qZWN0Um9vdEZvclBhdGgobnVjbGlkZVVyaSk7XG4gICAgICBpZiAoIWJ1Y2tQcm9qZWN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3RleHRFZGl0b3JUb0J1Y2tQcm9qZWN0LnNldChlZGl0b3IsIGJ1Y2tQcm9qZWN0KTtcbiAgICB9XG4gICAgdGhpcy5fbW9zdFJlY2VudEJ1Y2tQcm9qZWN0ID0gYnVja1Byb2plY3Q7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlQnVpbGRUYXJnZXQoYnVpbGRUYXJnZXQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGJ1aWxkVGFyZ2V0ID0gYnVpbGRUYXJnZXQudHJpbSgpO1xuICAgIHRoaXMuX2J1aWxkVGFyZ2V0ID0gYnVpbGRUYXJnZXQ7XG5cbiAgICB0aGlzLl9idWlsZFJ1bGVUeXBlID0gYXdhaXQgdGhpcy5fZmluZFJ1bGVUeXBlKCk7XG4gICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgdGhpcy5faXNSZWFjdE5hdGl2ZUFwcCA9IGF3YWl0IHRoaXMuX2ZpbmRJc1JlYWN0TmF0aXZlQXBwKCk7XG4gICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gIH1cblxuICBhc3luYyBfZmluZFJ1bGVUeXBlKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgYnVja1Byb2plY3QgPSB0aGlzLl9tb3N0UmVjZW50QnVja1Byb2plY3Q7XG4gICAgY29uc3QgYnVpbGRUYXJnZXQgPSB0aGlzLl9idWlsZFRhcmdldDtcblxuICAgIGxldCBidWlsZFJ1bGVUeXBlID0gJyc7XG4gICAgaWYgKGJ1aWxkVGFyZ2V0ICYmIGJ1Y2tQcm9qZWN0KSB7XG4gICAgICB0cnkge1xuICAgICAgICBidWlsZFJ1bGVUeXBlID0gYXdhaXQgYnVja1Byb2plY3QuYnVpbGRSdWxlVHlwZUZvcihidWlsZFRhcmdldCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIE1vc3QgbGlrZWx5LCB0aGlzIGlzIGFuIGludmFsaWQgdGFyZ2V0LCBzbyBkbyBub3RoaW5nLlxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYnVpbGRSdWxlVHlwZTtcbiAgfVxuXG4gIGFzeW5jIF9maW5kSXNSZWFjdE5hdGl2ZUFwcCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBidWlsZFJ1bGVUeXBlID0gdGhpcy5fYnVpbGRSdWxlVHlwZTtcbiAgICBpZiAoYnVpbGRSdWxlVHlwZSAhPT0gJ2FwcGxlX2J1bmRsZScgJiYgYnVpbGRSdWxlVHlwZSAhPT0gJ2FuZHJvaWRfYmluYXJ5Jykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBidWNrUHJvamVjdCA9IHRoaXMuX21vc3RSZWNlbnRCdWNrUHJvamVjdDtcbiAgICBpZiAoIWJ1Y2tQcm9qZWN0KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcmVhY3ROYXRpdmVSdWxlID0gYnVpbGRSdWxlVHlwZSA9PT0gJ2FwcGxlX2J1bmRsZSdcbiAgICA/ICdpb3NfcmVhY3RfbmF0aXZlX2xpYnJhcnknXG4gICAgOiAnYW5kcm9pZF9yZWFjdF9uYXRpdmVfbGlicmFyeSc7XG5cbiAgICBjb25zdCBidWlsZFRhcmdldCA9IHRoaXMuX2J1aWxkVGFyZ2V0O1xuICAgIGNvbnN0IG1hdGNoZXMgPSBhd2FpdCBidWNrUHJvamVjdC5xdWVyeVdpdGhBcmdzKFxuICAgICAgYGtpbmQoJyR7cmVhY3ROYXRpdmVSdWxlfScsIGRlcHMoJyVzJykpYCxcbiAgICAgIFtidWlsZFRhcmdldF0sXG4gICAgKTtcbiAgICByZXR1cm4gbWF0Y2hlc1tidWlsZFRhcmdldF0ubGVuZ3RoID4gMDtcbiAgfVxuXG4gIGFzeW5jIF9kb0RlYnVnKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFRPRE8obmF0dGh1KTogUmVzdG9yZSB2YWxpZGF0aW9uIGxvZ2ljIHRvIG1ha2Ugc3VyZSB0aGUgdGFyZ2V0IGlzIGluc3RhbGxhYmxlLlxuICAgIC8vIEZvciBub3csIGxldCdzIGxlYXZlIHRoYXQgdG8gQnVjay5cblxuICAgIC8vIFN0b3AgYW55IGV4aXN0aW5nIGRlYnVnZ2luZyBzZXNzaW9ucywgYXMgaW5zdGFsbCBoYW5ncyBpZiBhbiBleGlzdGluZ1xuICAgIC8vIGFwcCB0aGF0J3MgYmVpbmcgb3ZlcndyaXR0ZW4gaXMgYmVpbmcgZGVidWdnZWQuXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzdG9wLWRlYnVnZ2luZycpO1xuXG4gICAgY29uc3QgaW5zdGFsbFJlc3VsdCA9IGF3YWl0IHRoaXMuX2RvQnVpbGQoJ2luc3RhbGwnLCAvKiBkZWJ1ZyAqLyB0cnVlKTtcbiAgICBpZiAoIWluc3RhbGxSZXN1bHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge2J1Y2tQcm9qZWN0LCBwaWR9ID0gaW5zdGFsbFJlc3VsdDtcblxuICAgIGlmIChwaWQpIHtcbiAgICAgIC8vIFVzZSBjb21tYW5kcyBoZXJlIHRvIHRyaWdnZXIgcGFja2FnZSBhY3RpdmF0aW9uLlxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnbnVjbGlkZS1kZWJ1Z2dlcjpzaG93Jyk7XG4gICAgICBjb25zdCBkZWJ1Z2dlclNlcnZpY2UgPSBhd2FpdCByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXNlcnZpY2UtaHViLXBsdXMnKVxuICAgICAgICAgIC5jb25zdW1lRmlyc3RQcm92aWRlcignbnVjbGlkZS1kZWJ1Z2dlci5yZW1vdGUnKTtcbiAgICAgIGNvbnN0IGJ1Y2tQcm9qZWN0UGF0aCA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmdldFBhdGgoKTtcbiAgICAgIGRlYnVnZ2VyU2VydmljZS5kZWJ1Z0xMREIocGlkLCBidWNrUHJvamVjdFBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9kb0J1aWxkKFxuICAgIHN1YmNvbW1hbmQ6IEJ1Y2tTdWJjb21tYW5kLFxuICAgIGRlYnVnOiBib29sZWFuLFxuICApOiBQcm9taXNlPD97YnVja1Byb2plY3Q6IEJ1Y2tQcm9qZWN0OyBidWlsZFRhcmdldDogc3RyaW5nOyBwaWQ6ID9udW1iZXJ9PiB7XG4gICAgY29uc3QgYnVpbGRUYXJnZXQgPSB0aGlzLl9idWlsZFRhcmdldDtcbiAgICBjb25zdCBzaW11bGF0b3IgPSB0aGlzLl9zaW11bGF0b3I7XG4gICAgY29uc3QgYnVja1Byb2plY3QgPSB0aGlzLl9tb3N0UmVjZW50QnVja1Byb2plY3Q7XG4gICAgaWYgKCF0aGlzLl9idWlsZFRhcmdldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWJ1Y2tQcm9qZWN0KSB7XG4gICAgICB0aGlzLl9ub3RpZnlFcnJvcigpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBhcHBBcmdzID0gW107XG4gICAgaWYgKHN1YmNvbW1hbmQgPT09ICdpbnN0YWxsJyAmJiB0aGlzLmlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlKCkpIHtcbiAgICAgIGNvbnN0IHNlcnZlckNvbW1hbmQgPSBhd2FpdCB0aGlzLl9nZXRSZWFjdE5hdGl2ZVNlcnZlckNvbW1hbmQoKTtcbiAgICAgIGlmIChzZXJ2ZXJDb21tYW5kKSB7XG4gICAgICAgIHRoaXMuX3JlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5zdGFydFNlcnZlcihzZXJ2ZXJDb21tYW5kKTtcbiAgICAgICAgYXBwQXJncyA9IFJFQUNUX05BVElWRV9BUFBfRkxBR1M7XG4gICAgICAgIHRoaXMuX3JlYWN0TmF0aXZlU2VydmVyQWN0aW9ucy5zdGFydE5vZGVFeGVjdXRvclNlcnZlcigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKGBidWNrICR7c3ViY29tbWFuZH0gJHtidWlsZFRhcmdldH0gc3RhcnRlZC5gKTtcbiAgICBjb25zdCB3cyA9IGF3YWl0IHRoaXMuX3NldHVwV2ViU29ja2V0KGJ1Y2tQcm9qZWN0LCBidWlsZFRhcmdldCk7XG5cbiAgICB0aGlzLl9idWlsZFByb2dyZXNzID0gMDtcbiAgICB0aGlzLl9pc0J1aWxkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcblxuICAgIGNvbnN0IHtwaWR9ID0gYXdhaXQgdGhpcy5fcnVuQnVja0NvbW1hbmRJbk5ld1BhbmUoXG4gICAgICAgIHtidWNrUHJvamVjdCwgYnVpbGRUYXJnZXQsIHNpbXVsYXRvciwgc3ViY29tbWFuZCwgZGVidWcsIGFwcEFyZ3N9KTtcblxuICAgIHRoaXMuX2lzQnVpbGRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICBpZiAod3MpIHtcbiAgICAgIHdzLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtidWNrUHJvamVjdCwgYnVpbGRUYXJnZXQsIHBpZH07XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiBBbiBPYmplY3Qgd2l0aCBzb21lIGRldGFpbHMgYWJvdXQgdGhlIG91dHB1dCBvZiB0aGUgY29tbWFuZDpcbiAgICogICBwaWQ6IFRoZSBwcm9jZXNzIGlkIG9mIHRoZSBydW5uaW5nIGFwcCwgaWYgJ3J1bicgd2FzIHRydWUuXG4gICAqL1xuICBhc3luYyBfcnVuQnVja0NvbW1hbmRJbk5ld1BhbmUoYnVja1BhcmFtczoge1xuICAgIGJ1Y2tQcm9qZWN0OiBCdWNrUHJvamVjdDtcbiAgICBidWlsZFRhcmdldDogc3RyaW5nO1xuICAgIHNpbXVsYXRvcjogP3N0cmluZztcbiAgICBzdWJjb21tYW5kOiBzdHJpbmc7XG4gICAgZGVidWc6IGJvb2xlYW47XG4gICAgYXBwQXJnczogQXJyYXk8c3RyaW5nPjtcbiAgfSk6IFByb21pc2U8QnVja1J1bkRldGFpbHM+IHtcbiAgICBjb25zdCB7YnVja1Byb2plY3QsIGJ1aWxkVGFyZ2V0LCBzaW11bGF0b3IsIHN1YmNvbW1hbmQsIGRlYnVnLCBhcHBBcmdzfSA9IGJ1Y2tQYXJhbXM7XG5cbiAgICBjb25zdCBnZXRSdW5Db21tYW5kSW5OZXdQYW5lID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1wcm9jZXNzLW91dHB1dCcpO1xuICAgIGNvbnN0IHtydW5Db21tYW5kSW5OZXdQYW5lLCBkaXNwb3NhYmxlfSA9IGdldFJ1bkNvbW1hbmRJbk5ld1BhbmUoKTtcblxuICAgIGNvbnN0IHJ1biA9IHN1YmNvbW1hbmQgPT09ICdpbnN0YWxsJztcbiAgICBjb25zdCBydW5Qcm9jZXNzV2l0aEhhbmRsZXJzID0gYXN5bmMgKGRhdGFIYW5kbGVyT3B0aW9uczogUHJvY2Vzc091dHB1dERhdGFIYW5kbGVycykgPT4ge1xuICAgICAgY29uc3Qge3N0ZG91dCwgc3RkZXJyLCBlcnJvciwgZXhpdH0gPSBkYXRhSGFuZGxlck9wdGlvbnM7XG4gICAgICBsZXQgb2JzZXJ2YWJsZTtcbiAgICAgIGludmFyaWFudChidWNrUHJvamVjdCk7XG4gICAgICBpZiAocnVuKSB7XG4gICAgICAgIG9ic2VydmFibGUgPSBhd2FpdCBidWNrUHJvamVjdC5pbnN0YWxsV2l0aE91dHB1dChcbiAgICAgICAgICAgIFtidWlsZFRhcmdldF0sIHNpbXVsYXRvciwge3J1biwgZGVidWcsIGFwcEFyZ3N9KTtcbiAgICAgIH0gZWxzZSBpZiAoc3ViY29tbWFuZCA9PT0gJ2J1aWxkJykge1xuICAgICAgICBvYnNlcnZhYmxlID0gYXdhaXQgYnVja1Byb2plY3QuYnVpbGRXaXRoT3V0cHV0KFtidWlsZFRhcmdldF0pO1xuICAgICAgfSBlbHNlIGlmIChzdWJjb21tYW5kID09PSAndGVzdCcpIHtcbiAgICAgICAgb2JzZXJ2YWJsZSA9IGF3YWl0IGJ1Y2tQcm9qZWN0LnRlc3RXaXRoT3V0cHV0KFtidWlsZFRhcmdldF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoYFVua25vd24gc3ViY29tbWFuZDogJHtzdWJjb21tYW5kfWApO1xuICAgICAgfVxuICAgICAgY29uc3Qgb25OZXh0ID0gKGRhdGE6IHtzdGRlcnI/OiBzdHJpbmc7IHN0ZG91dD86IHN0cmluZ30pID0+IHtcbiAgICAgICAgaWYgKGRhdGEuc3Rkb3V0KSB7XG4gICAgICAgICAgc3Rkb3V0KGRhdGEuc3Rkb3V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGRlcnIoZGF0YS5zdGRlcnIgfHwgJycpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY29uc3Qgb25FcnJvciA9IChkYXRhOiBzdHJpbmcpID0+IHtcbiAgICAgICAgZXJyb3IobmV3IEVycm9yKGRhdGEpKTtcbiAgICAgICAgZXhpdCgxKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGAke2J1aWxkVGFyZ2V0fSBmYWlsZWQgdG8gYnVpbGQuYCk7XG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IG9uRXhpdCA9ICgpID0+IHtcbiAgICAgICAgLy8gb25FeGl0IHdpbGwgb25seSBiZSBjYWxsZWQgaWYgdGhlIHByb2Nlc3MgY29tcGxldGVzIHN1Y2Nlc3NmdWxseSxcbiAgICAgICAgLy8gaS5lLiB3aXRoIGV4aXQgY29kZSAwLiBVbmZvcnR1bmF0ZWx5IGFuIE9ic2VydmFibGUgY2Fubm90IHBhc3MgYW5cbiAgICAgICAgLy8gYXJndW1lbnQgKGUuZy4gYW4gZXhpdCBjb2RlKSBvbiBjb21wbGV0aW9uLlxuICAgICAgICBleGl0KDApO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhgYnVjayAke3N1YmNvbW1hbmR9IHN1Y2NlZWRlZC5gKTtcbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICB9O1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gb2JzZXJ2YWJsZS5zdWJzY3JpYmUob25OZXh0LCBvbkVycm9yLCBvbkV4aXQpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBraWxsKCkge1xuICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgY29uc3QgYnVja1J1blByb21pc2U6IFByb21pc2U8QnVja1J1bkRldGFpbHM+ID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qge1Byb2Nlc3NPdXRwdXRTdG9yZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXByb2Nlc3Mtb3V0cHV0LXN0b3JlJyk7XG4gICAgICBjb25zdCBwcm9jZXNzT3V0cHV0U3RvcmUgPSBuZXcgUHJvY2Vzc091dHB1dFN0b3JlKHJ1blByb2Nlc3NXaXRoSGFuZGxlcnMpO1xuICAgICAgY29uc3Qge2hhbmRsZUJ1Y2tBbnNpT3V0cHV0fSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtcHJvY2Vzcy1vdXRwdXQtaGFuZGxlcicpO1xuXG4gICAgICB0aGlzLl9idWNrUHJvY2Vzc091dHB1dFN0b3JlID0gcHJvY2Vzc091dHB1dFN0b3JlO1xuICAgICAgY29uc3QgZXhpdFN1YnNjcmlwdGlvbiA9IHByb2Nlc3NPdXRwdXRTdG9yZS5vblByb2Nlc3NFeGl0KChleGl0Q29kZTogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChleGl0Q29kZSA9PT0gMCAmJiBydW4pIHtcbiAgICAgICAgICAvLyBHZXQgdGhlIHByb2Nlc3MgSUQuXG4gICAgICAgICAgY29uc3QgYWxsQnVpbGRPdXRwdXQgPSBwcm9jZXNzT3V0cHV0U3RvcmUuZ2V0U3Rkb3V0KCkgfHwgJyc7XG4gICAgICAgICAgY29uc3QgcGlkTWF0Y2ggPSBhbGxCdWlsZE91dHB1dC5tYXRjaChCVUNLX1BST0NFU1NfSURfUkVHRVgpO1xuICAgICAgICAgIGlmIChwaWRNYXRjaCkge1xuICAgICAgICAgICAgLy8gSW5kZXggMSBpcyB0aGUgY2FwdHVyZWQgcGlkLlxuICAgICAgICAgICAgcmVzb2x2ZSh7cGlkOiBwYXJzZUludChwaWRNYXRjaFsxXSwgMTApfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoe30pO1xuICAgICAgICB9XG4gICAgICAgIGV4aXRTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9idWNrUHJvY2Vzc091dHB1dFN0b3JlID0gbnVsbDtcbiAgICAgIH0pO1xuXG4gICAgICBydW5Db21tYW5kSW5OZXdQYW5lKHtcbiAgICAgICAgdGFiVGl0bGU6IGBidWNrICR7c3ViY29tbWFuZH0gJHtidWlsZFRhcmdldH1gLFxuICAgICAgICBwcm9jZXNzT3V0cHV0U3RvcmUsXG4gICAgICAgIHByb2Nlc3NPdXRwdXRIYW5kbGVyOiBoYW5kbGVCdWNrQW5zaU91dHB1dCxcbiAgICAgICAgZGVzdHJveUV4aXN0aW5nUGFuZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGF3YWl0IGJ1Y2tSdW5Qcm9taXNlO1xuICB9XG5cbiAgYXN5bmMgX3NldHVwV2ViU29ja2V0KGJ1Y2tQcm9qZWN0OiBCdWNrUHJvamVjdCwgYnVpbGRUYXJnZXQ6IHN0cmluZyk6IFByb21pc2U8P1dlYlNvY2tldD4ge1xuICAgIGNvbnN0IGh0dHBQb3J0ID0gYXdhaXQgYnVja1Byb2plY3QuZ2V0U2VydmVyUG9ydCgpO1xuICAgIGlmIChodHRwUG9ydCA8PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCB1cmkgPSBgd3M6Ly9sb2NhbGhvc3Q6JHtodHRwUG9ydH0vd3MvYnVpbGRgO1xuICAgIGNvbnN0IHdzID0gbmV3IFdlYlNvY2tldCh1cmkpO1xuICAgIGxldCBidWlsZElkOiA/c3RyaW5nID0gbnVsbDtcbiAgICBsZXQgaXNGaW5pc2hlZCA9IGZhbHNlO1xuXG4gICAgd3Mub25tZXNzYWdlID0gZSA9PiB7XG4gICAgICBsZXQgbWVzc2FnZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoXG4gICAgICAgICAgICBgQnVjayB3YXMgbGlrZWx5IGtpbGxlZCB3aGlsZSBidWlsZGluZyAke2J1aWxkVGFyZ2V0fS5gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgdHlwZSA9IG1lc3NhZ2VbJ3R5cGUnXTtcbiAgICAgIGlmIChidWlsZElkID09PSBudWxsKSB7XG4gICAgICAgIGlmICh0eXBlID09PSAnQnVpbGRTdGFydGVkJykge1xuICAgICAgICAgIGJ1aWxkSWQgPSBtZXNzYWdlWydidWlsZElkJ107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChidWlsZElkICE9PSBtZXNzYWdlWydidWlsZElkJ10pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZSA9PT0gJ0J1aWxkUHJvZ3Jlc3NVcGRhdGVkJyB8fCB0eXBlID09PSAnUGFyc2luZ1Byb2dyZXNzVXBkYXRlZCcpIHtcbiAgICAgICAgdGhpcy5fYnVpbGRQcm9ncmVzcyA9IG1lc3NhZ2UucHJvZ3Jlc3NWYWx1ZTtcbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdCdWlsZEZpbmlzaGVkJykge1xuICAgICAgICB0aGlzLl9idWlsZFByb2dyZXNzID0gMS4wO1xuICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICAgIHdzLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHdzLm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIWlzRmluaXNoZWQpIHtcbiAgICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoXG4gICAgICAgICAgICBgV2ViU29ja2V0IGNsb3NlZCBiZWZvcmUgJHtidWlsZFRhcmdldH0gZmluaXNoZWQgYnVpbGRpbmcuYCk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gd3M7XG4gIH1cblxuICBfbm90aWZ5RXJyb3IoKSB7XG4gICAgY29uc3QgYWN0aXZlRWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmICghYWN0aXZlRWRpdG9yKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICBgQ291bGQgbm90IGJ1aWxkOiBtdXN0IG5hdmlnYXRlIHRvIGEgZmlsZSB0aGF0IGlzIHBhcnQgb2YgYSBCdWNrIHByb2plY3QuYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZU5hbWUgPSBhY3RpdmVFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICBgQ291bGQgbm90IGJ1aWxkOiBmaWxlICcke2ZpbGVOYW1lfScgaXMgbm90IHBhcnQgb2YgYSBCdWNrIHByb2plY3QuYCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCdWNrVG9vbGJhclN0b3JlO1xuIl19