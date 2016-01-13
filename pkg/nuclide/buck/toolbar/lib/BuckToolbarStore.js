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
    logger = require('../../../logging').getLogger();
  }
  return logger;
}

var invariant = require('assert');

var _require = require('atom');

var Disposable = _require.Disposable;
var Emitter = _require.Emitter;

var path = require('path');

var _require2 = require('flux');

var Dispatcher = _require2.Dispatcher;

var _require3 = require('../../commons');

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
      this._buildTarget = '';
      this._buildProgress = 0;
      this._buildRuleType = '';
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
            _this._doBuild(false, false);
            break;
          case BuckToolbarActions.ActionType.RUN:
            _this._doBuild(true, false);
            break;
          case BuckToolbarActions.ActionType.DEBUG:
            _this._doDebug();
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

      var installResult = yield this._doBuild(true, true);
      if (!installResult) {
        return;
      }
      var buckProject = installResult.buckProject;
      var pid = installResult.pid;

      if (pid) {
        // Use commands here to trigger package activation.
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
        var debuggerService = yield require('../../../service-hub-plus').consumeFirstProvider('nuclide-debugger.remote');
        var buckProjectPath = yield buckProject.getPath();
        debuggerService.debugLLDB(pid, buckProjectPath);
      }
    })
  }, {
    key: '_doBuild',
    value: _asyncToGenerator(function* (run, debug) {
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
      if (run && this.isReactNativeServerMode()) {
        var serverCommand = yield this._getReactNativeServerCommand();
        if (serverCommand) {
          this._reactNativeServerActions.startServer(serverCommand);
          appArgs = REACT_NATIVE_APP_FLAGS;
          this._reactNativeServerActions.startNodeExecutorServer();
        }
      }

      var command = 'buck ' + (run ? 'install' : 'build') + ' ' + buildTarget;
      atom.notifications.addInfo(command + ' started.');
      var ws = yield this._setupWebSocket(buckProject, buildTarget);

      this._buildProgress = 0;
      this._isBuilding = true;
      this.emitChange();

      var _ref = yield this._runBuckCommandInNewPane({ buckProject: buckProject, buildTarget: buildTarget, simulator: simulator, run: run, debug: debug, command: command, appArgs: appArgs });

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
      var run = buckParams.run;
      var debug = buckParams.debug;
      var command = buckParams.command;
      var appArgs = buckParams.appArgs;

      var getRunCommandInNewPane = require('../../../process/output');

      var _getRunCommandInNewPane = getRunCommandInNewPane();

      var runCommandInNewPane = _getRunCommandInNewPane.runCommandInNewPane;
      var disposable = _getRunCommandInNewPane.disposable;

      var runProcessWithHandlers = _asyncToGenerator(function* (dataHandlerOptions) {
        var stdout = dataHandlerOptions.stdout;
        var stderr = dataHandlerOptions.stderr;
        var error = dataHandlerOptions.error;
        var exit = dataHandlerOptions.exit;

        var observable = undefined;
        invariant(buckProject);
        if (run) {
          observable = yield buckProject.installWithOutput([buildTarget], simulator, { run: run, debug: debug, appArgs: appArgs });
        } else {
          observable = yield buckProject.buildWithOutput([buildTarget]);
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
          atom.notifications.addSuccess(command + ' succeeded.');
          disposable.dispose();
        };
        var subscription = observable.subscribe(onNext, onError, onExit);

        return {
          kill: function kill() {
            subscription.dispose();
            disposable.dispose();
          }
        };
      });

      var buckRunPromise = new Promise(function (resolve, reject) {
        var _require4 = require('../../../process/output-store');

        var ProcessOutputStore = _require4.ProcessOutputStore;

        var processOutputStore = new ProcessOutputStore(runProcessWithHandlers);

        var _require5 = require('../../../process/output-handler');

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
          tabTitle: 'buck',
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
//# sourceMappingURL=data:application/json;base64,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akIsWUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNmLG1CQUFTLEVBQUUsQ0FBQyxLQUFLLDhCQUNjLFdBQVcseUJBQXNCLENBQUM7U0FDbEU7T0FDRixDQUFDO0FBQ0YsYUFBTyxFQUFFLENBQUM7S0FDWDs7O1dBRVcsd0JBQUc7QUFDYixVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDMUQsVUFBSSxDQUFDLFlBQVksRUFBRTtBQUNqQixZQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsNEVBQ2tELENBQUM7QUFDaEYsZUFBTztPQUNSOztBQUVELFVBQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4QyxVQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsOEJBQ0MsUUFBUSx1Q0FBbUMsQ0FBQztLQUMzRTs7O1NBaGJHLGdCQUFnQjs7O0FBbWJ0QixNQUFNLENBQUMsT0FBTyxHQUFHLGdCQUFnQixDQUFDIiwiZmlsZSI6IkJ1Y2tUb29sYmFyU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5sZXQgbG9nZ2VyO1xuZnVuY3Rpb24gZ2V0TG9nZ2VyKCkge1xuICBpZiAoIWxvZ2dlcikge1xuICAgIGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgfVxuICByZXR1cm4gbG9nZ2VyO1xufVxuXG5jb25zdCBpbnZhcmlhbnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcbmNvbnN0IHtEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB7RGlzcGF0Y2hlcn0gPSByZXF1aXJlKCdmbHV4Jyk7XG5jb25zdCB7YnVja1Byb2plY3RSb290Rm9yUGF0aH0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJyk7XG5jb25zdCBCdWNrVG9vbGJhckFjdGlvbnMgPSByZXF1aXJlKCcuL0J1Y2tUb29sYmFyQWN0aW9ucycpO1xuXG50eXBlIEJ1Y2tSdW5EZXRhaWxzID0ge1xuICBwaWQ/OiBudW1iZXI7XG59O1xuaW1wb3J0IHR5cGUge1Byb2Nlc3NPdXRwdXRTdG9yZSBhcyBQcm9jZXNzT3V0cHV0U3RvcmVUeXBlfSBmcm9tICcuLi8uLi8uLi9wcm9jZXNzL291dHB1dC1zdG9yZSc7XG5pbXBvcnQgdHlwZSB7UHJvY2Vzc091dHB1dERhdGFIYW5kbGVyc30gZnJvbSAnLi4vLi4vLi4vcHJvY2Vzcy9vdXRwdXQtc3RvcmUvbGliL3R5cGVzJztcbmltcG9ydCB0eXBlIHtCdWNrUHJvamVjdH0gZnJvbSAnLi4vLi4vYmFzZS9saWIvQnVja1Byb2plY3QnO1xuaW1wb3J0IFJlYWN0TmF0aXZlU2VydmVyTWFuYWdlciBmcm9tICcuL1JlYWN0TmF0aXZlU2VydmVyTWFuYWdlcic7XG5pbXBvcnQgUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zIGZyb20gJy4vUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zJztcblxuY29uc3QgQlVDS19QUk9DRVNTX0lEX1JFR0VYID0gL2xsZGIgLXAgKFswLTldKykvO1xuY29uc3QgUkVBQ1RfTkFUSVZFX0FQUF9GTEFHUyA9IFtcbiAgJy1leGVjdXRvci1vdmVycmlkZScsICdSQ1RXZWJTb2NrZXRFeGVjdXRvcicsXG4gICctd2Vic29ja2V0LWV4ZWN1dG9yLW5hbWUnLCAnTnVjbGlkZScsXG4gICctd2Vic29ja2V0LWV4ZWN1dG9yLXBvcnQnLCAnODA5MCcsXG5dO1xuXG50eXBlIEluaXRpYWxTdGF0ZSA9IHtcbiAgaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGU/OiBib29sZWFuO1xufTtcblxuY2xhc3MgQnVja1Rvb2xiYXJTdG9yZSB7XG5cbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfcmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zOiBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnM7XG4gIF9yZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXI6IFJlYWN0TmF0aXZlU2VydmVyTWFuYWdlcjtcbiAgX21vc3RSZWNlbnRCdWNrUHJvamVjdDogP0J1Y2tQcm9qZWN0O1xuICBfdGV4dEVkaXRvclRvQnVja1Byb2plY3Q6IFdlYWtNYXA8VGV4dEVkaXRvciwgQnVja1Byb2plY3Q+O1xuICBfaXNCdWlsZGluZzogYm9vbGVhbjtcbiAgX2J1aWxkVGFyZ2V0OiBzdHJpbmc7XG4gIF9idWlsZFByb2dyZXNzOiBudW1iZXI7XG4gIF9idWlsZFJ1bGVUeXBlOiBzdHJpbmc7XG4gIF9zaW11bGF0b3I6ID9zdHJpbmc7XG4gIF9pc1JlYWN0TmF0aXZlQXBwOiBib29sZWFuO1xuICBfaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGU6IGJvb2xlYW47XG4gIF9idWNrUHJvY2Vzc091dHB1dFN0b3JlOiA/UHJvY2Vzc091dHB1dFN0b3JlVHlwZTtcbiAgX2FsaWFzZXNCeVByb2plY3Q6IFdlYWtNYXA8QnVja1Byb2plY3QsIEFycmF5PHN0cmluZz4+O1xuXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIGluaXRpYWxTdGF0ZTogSW5pdGlhbFN0YXRlID0ge30pIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB0aGlzLl9yZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMgPSBuZXcgUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zKGRpc3BhdGNoZXIpO1xuICAgIHRoaXMuX3JlYWN0TmF0aXZlU2VydmVyTWFuYWdlciA9IG5ldyBSZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXIoXG4gICAgICBkaXNwYXRjaGVyLFxuICAgICAgdGhpcy5fcmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zLFxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fdGV4dEVkaXRvclRvQnVja1Byb2plY3QgPSBuZXcgV2Vha01hcCgpO1xuICAgIHRoaXMuX2FsaWFzZXNCeVByb2plY3QgPSBuZXcgV2Vha01hcCgpO1xuICAgIHRoaXMuX2luaXRTdGF0ZShpbml0aWFsU3RhdGUpO1xuICAgIHRoaXMuX3NldHVwQWN0aW9ucygpO1xuICB9XG5cbiAgX2luaXRTdGF0ZShpbml0aWFsU3RhdGU6IEluaXRpYWxTdGF0ZSkge1xuICAgIHRoaXMuX2lzQnVpbGRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9idWlsZFRhcmdldCA9ICcnO1xuICAgIHRoaXMuX2J1aWxkUHJvZ3Jlc3MgPSAwO1xuICAgIHRoaXMuX2J1aWxkUnVsZVR5cGUgPSAnJztcbiAgICB0aGlzLl9pc1JlYWN0TmF0aXZlQXBwID0gZmFsc2U7XG4gICAgdGhpcy5faXNSZWFjdE5hdGl2ZVNlcnZlck1vZGUgPSBpbml0aWFsU3RhdGUuaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGUgfHwgZmFsc2U7XG4gIH1cblxuICBfc2V0dXBBY3Rpb25zKCkge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIucmVnaXN0ZXIoYWN0aW9uID0+IHtcbiAgICAgIHN3aXRjaCAoYWN0aW9uLmFjdGlvblR5cGUpIHtcbiAgICAgICAgY2FzZSBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfUFJPSkVDVDpcbiAgICAgICAgICB0aGlzLl91cGRhdGVQcm9qZWN0KGFjdGlvbi5lZGl0b3IpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlVQREFURV9CVUlMRF9UQVJHRVQ6XG4gICAgICAgICAgdGhpcy5fdXBkYXRlQnVpbGRUYXJnZXQoYWN0aW9uLmJ1aWxkVGFyZ2V0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfU0lNVUxBVE9SOlxuICAgICAgICAgIHRoaXMuX3NpbXVsYXRvciA9IGFjdGlvbi5zaW11bGF0b3I7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX1JFQUNUX05BVElWRV9TRVJWRVJfTU9ERTpcbiAgICAgICAgICB0aGlzLl9pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSA9IGFjdGlvbi5zZXJ2ZXJNb2RlO1xuICAgICAgICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLkJVSUxEOlxuICAgICAgICAgIHRoaXMuX2RvQnVpbGQoZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5SVU46XG4gICAgICAgICAgdGhpcy5fZG9CdWlsZCh0cnVlLCBmYWxzZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuREVCVUc6XG4gICAgICAgICAgdGhpcy5fZG9EZWJ1ZygpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9yZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXIuZGlzcG9zZSgpO1xuICAgIGlmICh0aGlzLl9idWNrUHJvY2Vzc091dHB1dFN0b3JlKSB7XG4gICAgICB0aGlzLl9idWNrUHJvY2Vzc091dHB1dFN0b3JlLnN0b3BQcm9jZXNzKCk7XG4gICAgfVxuICB9XG5cbiAgc3Vic2NyaWJlKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2NoYW5nZScsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGVtaXRDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjaGFuZ2UnKTtcbiAgfVxuXG4gIGdldEJ1aWxkVGFyZ2V0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2J1aWxkVGFyZ2V0O1xuICB9XG5cbiAgaXNCdWlsZGluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNCdWlsZGluZztcbiAgfVxuXG4gIGdldFJ1bGVUeXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2J1aWxkUnVsZVR5cGU7XG4gIH1cblxuICBnZXRCdWlsZFByb2dyZXNzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2J1aWxkUHJvZ3Jlc3M7XG4gIH1cblxuICBpc1JlYWN0TmF0aXZlQXBwKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc1JlYWN0TmF0aXZlQXBwO1xuICB9XG5cbiAgaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNSZWFjdE5hdGl2ZUFwcCgpICYmIHRoaXMuX2lzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlO1xuICB9XG5cbiAgYXN5bmMgbG9hZEFsaWFzZXMoKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gICAgY29uc3QgYnVja1Byb2plY3QgPSB0aGlzLl9tb3N0UmVjZW50QnVja1Byb2plY3Q7XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgfVxuXG4gICAgLy8gQ2FjaGUgYWxpYXNlcyBmb3IgYSBwcm9qZWN0IGJlY2F1c2UgaW52b2tpbmcgYnVjayBqdXN0IHRvIGxpc3QgYWxpYXNlcyB0aGF0IGFyZSBoaWdobHlcbiAgICAvLyB1bmxpa2VseSB0byBjaGFuZ2UgaXMgd2FzdGVmdWwuXG4gICAgbGV0IGFsaWFzZXMgPSB0aGlzLl9hbGlhc2VzQnlQcm9qZWN0LmdldChidWNrUHJvamVjdCk7XG4gICAgaWYgKCFhbGlhc2VzKSB7XG4gICAgICBhbGlhc2VzID0gYXdhaXQgYnVja1Byb2plY3QubGlzdEFsaWFzZXMoKTtcbiAgICAgIHRoaXMuX2FsaWFzZXNCeVByb2plY3Quc2V0KGJ1Y2tQcm9qZWN0LCBhbGlhc2VzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWxpYXNlcztcbiAgfVxuXG4gIGFzeW5jIF9nZXRSZWFjdE5hdGl2ZVNlcnZlckNvbW1hbmQoKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgY29uc3QgYnVja1Byb2plY3QgPSB0aGlzLl9tb3N0UmVjZW50QnVja1Byb2plY3Q7XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHNlcnZlckNvbW1hbmQgPSBhd2FpdCBidWNrUHJvamVjdC5nZXRCdWNrQ29uZmlnKCdyZWFjdC1uYXRpdmUnLCAnc2VydmVyJyk7XG4gICAgaWYgKHNlcnZlckNvbW1hbmQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHJlcG9Sb290ID0gYXdhaXQgYnVja1Byb2plY3QuZ2V0UGF0aCgpO1xuICAgIGlmIChyZXBvUm9vdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHBhdGguam9pbihyZXBvUm9vdCwgc2VydmVyQ29tbWFuZCk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlUHJvamVjdChlZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBudWNsaWRlVXJpID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIW51Y2xpZGVVcmkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGJ1Y2tQcm9qZWN0ID0gdGhpcy5fdGV4dEVkaXRvclRvQnVja1Byb2plY3QuZ2V0KGVkaXRvcik7XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgYnVja1Byb2plY3QgPSBhd2FpdCBidWNrUHJvamVjdFJvb3RGb3JQYXRoKG51Y2xpZGVVcmkpO1xuICAgICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yVG9CdWNrUHJvamVjdC5zZXQoZWRpdG9yLCBidWNrUHJvamVjdCk7XG4gICAgfVxuICAgIHRoaXMuX21vc3RSZWNlbnRCdWNrUHJvamVjdCA9IGJ1Y2tQcm9qZWN0O1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZUJ1aWxkVGFyZ2V0KGJ1aWxkVGFyZ2V0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBidWlsZFRhcmdldCA9IGJ1aWxkVGFyZ2V0LnRyaW0oKTtcbiAgICB0aGlzLl9idWlsZFRhcmdldCA9IGJ1aWxkVGFyZ2V0O1xuXG4gICAgdGhpcy5fYnVpbGRSdWxlVHlwZSA9IGF3YWl0IHRoaXMuX2ZpbmRSdWxlVHlwZSgpO1xuICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIHRoaXMuX2lzUmVhY3ROYXRpdmVBcHAgPSBhd2FpdCB0aGlzLl9maW5kSXNSZWFjdE5hdGl2ZUFwcCgpO1xuICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICB9XG5cbiAgYXN5bmMgX2ZpbmRSdWxlVHlwZSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0ID0gdGhpcy5fbW9zdFJlY2VudEJ1Y2tQcm9qZWN0O1xuICAgIGNvbnN0IGJ1aWxkVGFyZ2V0ID0gdGhpcy5fYnVpbGRUYXJnZXQ7XG5cbiAgICBsZXQgYnVpbGRSdWxlVHlwZSA9ICcnO1xuICAgIGlmIChidWlsZFRhcmdldCAmJiBidWNrUHJvamVjdCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYnVpbGRSdWxlVHlwZSA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmJ1aWxkUnVsZVR5cGVGb3IoYnVpbGRUYXJnZXQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBNb3N0IGxpa2VseSwgdGhpcyBpcyBhbiBpbnZhbGlkIHRhcmdldCwgc28gZG8gbm90aGluZy5cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJ1aWxkUnVsZVR5cGU7XG4gIH1cblxuICBhc3luYyBfZmluZElzUmVhY3ROYXRpdmVBcHAoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgYnVpbGRSdWxlVHlwZSA9IHRoaXMuX2J1aWxkUnVsZVR5cGU7XG4gICAgaWYgKGJ1aWxkUnVsZVR5cGUgIT09ICdhcHBsZV9idW5kbGUnICYmIGJ1aWxkUnVsZVR5cGUgIT09ICdhbmRyb2lkX2JpbmFyeScpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgYnVja1Byb2plY3QgPSB0aGlzLl9tb3N0UmVjZW50QnVja1Byb2plY3Q7XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHJlYWN0TmF0aXZlUnVsZSA9IGJ1aWxkUnVsZVR5cGUgPT09ICdhcHBsZV9idW5kbGUnXG4gICAgPyAnaW9zX3JlYWN0X25hdGl2ZV9saWJyYXJ5J1xuICAgIDogJ2FuZHJvaWRfcmVhY3RfbmF0aXZlX2xpYnJhcnknO1xuXG4gICAgY29uc3QgYnVpbGRUYXJnZXQgPSB0aGlzLl9idWlsZFRhcmdldDtcbiAgICBjb25zdCBtYXRjaGVzID0gYXdhaXQgYnVja1Byb2plY3QucXVlcnlXaXRoQXJncyhcbiAgICAgIGBraW5kKCcke3JlYWN0TmF0aXZlUnVsZX0nLCBkZXBzKCclcycpKWAsXG4gICAgICBbYnVpbGRUYXJnZXRdLFxuICAgICk7XG4gICAgcmV0dXJuIG1hdGNoZXNbYnVpbGRUYXJnZXRdLmxlbmd0aCA+IDA7XG4gIH1cblxuICBhc3luYyBfZG9EZWJ1ZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBUT0RPKG5hdHRodSk6IFJlc3RvcmUgdmFsaWRhdGlvbiBsb2dpYyB0byBtYWtlIHN1cmUgdGhlIHRhcmdldCBpcyBpbnN0YWxsYWJsZS5cbiAgICAvLyBGb3Igbm93LCBsZXQncyBsZWF2ZSB0aGF0IHRvIEJ1Y2suXG5cbiAgICAvLyBTdG9wIGFueSBleGlzdGluZyBkZWJ1Z2dpbmcgc2Vzc2lvbnMsIGFzIGluc3RhbGwgaGFuZ3MgaWYgYW4gZXhpc3RpbmdcbiAgICAvLyBhcHAgdGhhdCdzIGJlaW5nIG92ZXJ3cml0dGVuIGlzIGJlaW5nIGRlYnVnZ2VkLlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c3RvcC1kZWJ1Z2dpbmcnKTtcblxuICAgIGNvbnN0IGluc3RhbGxSZXN1bHQgPSBhd2FpdCB0aGlzLl9kb0J1aWxkKHRydWUsIHRydWUpO1xuICAgIGlmICghaW5zdGFsbFJlc3VsdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7YnVja1Byb2plY3QsIHBpZH0gPSBpbnN0YWxsUmVzdWx0O1xuXG4gICAgaWYgKHBpZCkge1xuICAgICAgLy8gVXNlIGNvbW1hbmRzIGhlcmUgdG8gdHJpZ2dlciBwYWNrYWdlIGFjdGl2YXRpb24uXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdudWNsaWRlLWRlYnVnZ2VyOnNob3cnKTtcbiAgICAgIGNvbnN0IGRlYnVnZ2VyU2VydmljZSA9IGF3YWl0IHJlcXVpcmUoJy4uLy4uLy4uL3NlcnZpY2UtaHViLXBsdXMnKVxuICAgICAgICAgIC5jb25zdW1lRmlyc3RQcm92aWRlcignbnVjbGlkZS1kZWJ1Z2dlci5yZW1vdGUnKTtcbiAgICAgIGNvbnN0IGJ1Y2tQcm9qZWN0UGF0aCA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmdldFBhdGgoKTtcbiAgICAgIGRlYnVnZ2VyU2VydmljZS5kZWJ1Z0xMREIocGlkLCBidWNrUHJvamVjdFBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9kb0J1aWxkKFxuICAgIHJ1bjogYm9vbGVhbixcbiAgICBkZWJ1ZzogYm9vbGVhbixcbiAgKTogUHJvbWlzZTw/e2J1Y2tQcm9qZWN0OiBCdWNrUHJvamVjdCwgYnVpbGRUYXJnZXQ6IHN0cmluZywgcGlkOiA/bnVtYmVyfT4ge1xuICAgIGNvbnN0IGJ1aWxkVGFyZ2V0ID0gdGhpcy5fYnVpbGRUYXJnZXQ7XG4gICAgY29uc3Qgc2ltdWxhdG9yID0gdGhpcy5fc2ltdWxhdG9yO1xuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0ID0gdGhpcy5fbW9zdFJlY2VudEJ1Y2tQcm9qZWN0O1xuICAgIGlmICghdGhpcy5fYnVpbGRUYXJnZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgdGhpcy5fbm90aWZ5RXJyb3IoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgYXBwQXJncyA9IFtdO1xuICAgIGlmIChydW4gJiYgdGhpcy5pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSgpKSB7XG4gICAgICBjb25zdCBzZXJ2ZXJDb21tYW5kID0gYXdhaXQgdGhpcy5fZ2V0UmVhY3ROYXRpdmVTZXJ2ZXJDb21tYW5kKCk7XG4gICAgICBpZiAoc2VydmVyQ29tbWFuZCkge1xuICAgICAgICB0aGlzLl9yZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuc3RhcnRTZXJ2ZXIoc2VydmVyQ29tbWFuZCk7XG4gICAgICAgIGFwcEFyZ3MgPSBSRUFDVF9OQVRJVkVfQVBQX0ZMQUdTO1xuICAgICAgICB0aGlzLl9yZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuc3RhcnROb2RlRXhlY3V0b3JTZXJ2ZXIoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBjb21tYW5kID0gYGJ1Y2sgJHtydW4gPyAnaW5zdGFsbCcgOiAnYnVpbGQnfSAke2J1aWxkVGFyZ2V0fWA7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oYCR7Y29tbWFuZH0gc3RhcnRlZC5gKTtcbiAgICBjb25zdCB3cyA9IGF3YWl0IHRoaXMuX3NldHVwV2ViU29ja2V0KGJ1Y2tQcm9qZWN0LCBidWlsZFRhcmdldCk7XG5cbiAgICB0aGlzLl9idWlsZFByb2dyZXNzID0gMDtcbiAgICB0aGlzLl9pc0J1aWxkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcblxuICAgIGNvbnN0IHtwaWR9ID0gYXdhaXQgdGhpcy5fcnVuQnVja0NvbW1hbmRJbk5ld1BhbmUoXG4gICAgICAgIHtidWNrUHJvamVjdCwgYnVpbGRUYXJnZXQsIHNpbXVsYXRvciwgcnVuLCBkZWJ1ZywgY29tbWFuZCwgYXBwQXJnc30pO1xuXG4gICAgdGhpcy5faXNCdWlsZGluZyA9IGZhbHNlO1xuICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIGlmICh3cykge1xuICAgICAgd3MuY2xvc2UoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge2J1Y2tQcm9qZWN0LCBidWlsZFRhcmdldCwgcGlkfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIEFuIE9iamVjdCB3aXRoIHNvbWUgZGV0YWlscyBhYm91dCB0aGUgb3V0cHV0IG9mIHRoZSBjb21tYW5kOlxuICAgKiAgIHBpZDogVGhlIHByb2Nlc3MgaWQgb2YgdGhlIHJ1bm5pbmcgYXBwLCBpZiAncnVuJyB3YXMgdHJ1ZS5cbiAgICovXG4gIGFzeW5jIF9ydW5CdWNrQ29tbWFuZEluTmV3UGFuZShidWNrUGFyYW1zOiB7XG4gICAgYnVja1Byb2plY3Q6IEJ1Y2tQcm9qZWN0LFxuICAgIGJ1aWxkVGFyZ2V0OiBzdHJpbmcsXG4gICAgc2ltdWxhdG9yOiA/c3RyaW5nLFxuICAgIHJ1bjogYm9vbGVhbixcbiAgICBkZWJ1ZzogYm9vbGVhbixcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXBwQXJnczogQXJyYXk8c3RyaW5nPixcbiAgfSk6IFByb21pc2U8QnVja1J1bkRldGFpbHM+IHtcbiAgICBjb25zdCB7YnVja1Byb2plY3QsIGJ1aWxkVGFyZ2V0LCBzaW11bGF0b3IsIHJ1biwgZGVidWcsIGNvbW1hbmQsIGFwcEFyZ3N9ID0gYnVja1BhcmFtcztcblxuICAgIGNvbnN0IGdldFJ1bkNvbW1hbmRJbk5ld1BhbmUgPSByZXF1aXJlKCcuLi8uLi8uLi9wcm9jZXNzL291dHB1dCcpO1xuICAgIGNvbnN0IHtydW5Db21tYW5kSW5OZXdQYW5lLCBkaXNwb3NhYmxlfSA9IGdldFJ1bkNvbW1hbmRJbk5ld1BhbmUoKTtcblxuICAgIGNvbnN0IHJ1blByb2Nlc3NXaXRoSGFuZGxlcnMgPSBhc3luYyAoZGF0YUhhbmRsZXJPcHRpb25zOiBQcm9jZXNzT3V0cHV0RGF0YUhhbmRsZXJzKSA9PiB7XG4gICAgICBjb25zdCB7c3Rkb3V0LCBzdGRlcnIsIGVycm9yLCBleGl0fSA9IGRhdGFIYW5kbGVyT3B0aW9ucztcbiAgICAgIGxldCBvYnNlcnZhYmxlO1xuICAgICAgaW52YXJpYW50KGJ1Y2tQcm9qZWN0KTtcbiAgICAgIGlmIChydW4pIHtcbiAgICAgICAgb2JzZXJ2YWJsZSA9IGF3YWl0IGJ1Y2tQcm9qZWN0Lmluc3RhbGxXaXRoT3V0cHV0KFxuICAgICAgICAgICAgW2J1aWxkVGFyZ2V0XSwgc2ltdWxhdG9yLCB7cnVuLCBkZWJ1ZywgYXBwQXJnc30pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2JzZXJ2YWJsZSA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmJ1aWxkV2l0aE91dHB1dChbYnVpbGRUYXJnZXRdKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG9uTmV4dCA9IChkYXRhOiB7c3RkZXJyPzogc3RyaW5nOyBzdGRvdXQ/OiBzdHJpbmd9KSA9PiB7XG4gICAgICAgIGlmIChkYXRhLnN0ZG91dCkge1xuICAgICAgICAgIHN0ZG91dChkYXRhLnN0ZG91dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RkZXJyKGRhdGEuc3RkZXJyIHx8ICcnKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNvbnN0IG9uRXJyb3IgPSAoZGF0YTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGVycm9yKG5ldyBFcnJvcihkYXRhKSk7XG4gICAgICAgIGV4aXQoMSk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgJHtidWlsZFRhcmdldH0gZmFpbGVkIHRvIGJ1aWxkLmApO1xuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBvbkV4aXQgPSAoKSA9PiB7XG4gICAgICAgIC8vIG9uRXhpdCB3aWxsIG9ubHkgYmUgY2FsbGVkIGlmIHRoZSBwcm9jZXNzIGNvbXBsZXRlcyBzdWNjZXNzZnVsbHksXG4gICAgICAgIC8vIGkuZS4gd2l0aCBleGl0IGNvZGUgMC4gVW5mb3J0dW5hdGVseSBhbiBPYnNlcnZhYmxlIGNhbm5vdCBwYXNzIGFuXG4gICAgICAgIC8vIGFyZ3VtZW50IChlLmcuIGFuIGV4aXQgY29kZSkgb24gY29tcGxldGlvbi5cbiAgICAgICAgZXhpdCgwKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoYCR7Y29tbWFuZH0gc3VjY2VlZGVkLmApO1xuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBvYnNlcnZhYmxlLnN1YnNjcmliZShvbk5leHQsIG9uRXJyb3IsIG9uRXhpdCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGtpbGwoKSB7XG4gICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGNvbnN0IGJ1Y2tSdW5Qcm9taXNlOiBQcm9taXNlPEJ1Y2tSdW5EZXRhaWxzPiA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHtQcm9jZXNzT3V0cHV0U3RvcmV9ID0gcmVxdWlyZSgnLi4vLi4vLi4vcHJvY2Vzcy9vdXRwdXQtc3RvcmUnKTtcbiAgICAgIGNvbnN0IHByb2Nlc3NPdXRwdXRTdG9yZSA9IG5ldyBQcm9jZXNzT3V0cHV0U3RvcmUocnVuUHJvY2Vzc1dpdGhIYW5kbGVycyk7XG4gICAgICBjb25zdCB7aGFuZGxlQnVja0Fuc2lPdXRwdXR9ID0gcmVxdWlyZSgnLi4vLi4vLi4vcHJvY2Vzcy9vdXRwdXQtaGFuZGxlcicpO1xuXG4gICAgICB0aGlzLl9idWNrUHJvY2Vzc091dHB1dFN0b3JlID0gcHJvY2Vzc091dHB1dFN0b3JlO1xuICAgICAgY29uc3QgZXhpdFN1YnNjcmlwdGlvbiA9IHByb2Nlc3NPdXRwdXRTdG9yZS5vblByb2Nlc3NFeGl0KChleGl0Q29kZTogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChleGl0Q29kZSA9PT0gMCAmJiBydW4pIHtcbiAgICAgICAgICAvLyBHZXQgdGhlIHByb2Nlc3MgSUQuXG4gICAgICAgICAgY29uc3QgYWxsQnVpbGRPdXRwdXQgPSBwcm9jZXNzT3V0cHV0U3RvcmUuZ2V0U3Rkb3V0KCkgfHwgJyc7XG4gICAgICAgICAgY29uc3QgcGlkTWF0Y2ggPSBhbGxCdWlsZE91dHB1dC5tYXRjaChCVUNLX1BST0NFU1NfSURfUkVHRVgpO1xuICAgICAgICAgIGlmIChwaWRNYXRjaCkge1xuICAgICAgICAgICAgLy8gSW5kZXggMSBpcyB0aGUgY2FwdHVyZWQgcGlkLlxuICAgICAgICAgICAgcmVzb2x2ZSh7cGlkOiBwYXJzZUludChwaWRNYXRjaFsxXSwgMTApfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoe30pO1xuICAgICAgICB9XG4gICAgICAgIGV4aXRTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9idWNrUHJvY2Vzc091dHB1dFN0b3JlID0gbnVsbDtcbiAgICAgIH0pO1xuXG4gICAgICBydW5Db21tYW5kSW5OZXdQYW5lKHtcbiAgICAgICAgdGFiVGl0bGU6ICdidWNrJyxcbiAgICAgICAgcHJvY2Vzc091dHB1dFN0b3JlLFxuICAgICAgICBwcm9jZXNzT3V0cHV0SGFuZGxlcjogaGFuZGxlQnVja0Fuc2lPdXRwdXQsXG4gICAgICAgIGRlc3Ryb3lFeGlzdGluZ1BhbmU6IHRydWUsXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhd2FpdCBidWNrUnVuUHJvbWlzZTtcbiAgfVxuXG4gIGFzeW5jIF9zZXR1cFdlYlNvY2tldChidWNrUHJvamVjdDogQnVja1Byb2plY3QsIGJ1aWxkVGFyZ2V0OiBzdHJpbmcpOiBQcm9taXNlPD9XZWJTb2NrZXQ+IHtcbiAgICBjb25zdCBodHRwUG9ydCA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmdldFNlcnZlclBvcnQoKTtcbiAgICBpZiAoaHR0cFBvcnQgPD0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgdXJpID0gYHdzOi8vbG9jYWxob3N0OiR7aHR0cFBvcnR9L3dzL2J1aWxkYDtcbiAgICBjb25zdCB3cyA9IG5ldyBXZWJTb2NrZXQodXJpKTtcbiAgICBsZXQgYnVpbGRJZDogP3N0cmluZyA9IG51bGw7XG4gICAgbGV0IGlzRmluaXNoZWQgPSBmYWxzZTtcblxuICAgIHdzLm9ubWVzc2FnZSA9IChlKSA9PiB7XG4gICAgICBsZXQgbWVzc2FnZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoXG4gICAgICAgICAgICBgQnVjayB3YXMgbGlrZWx5IGtpbGxlZCB3aGlsZSBidWlsZGluZyAke2J1aWxkVGFyZ2V0fS5gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgdHlwZSA9IG1lc3NhZ2VbJ3R5cGUnXTtcbiAgICAgIGlmIChidWlsZElkID09PSBudWxsKSB7XG4gICAgICAgIGlmICh0eXBlID09PSAnQnVpbGRTdGFydGVkJykge1xuICAgICAgICAgIGJ1aWxkSWQgPSBtZXNzYWdlWydidWlsZElkJ107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChidWlsZElkICE9PSBtZXNzYWdlWydidWlsZElkJ10pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZSA9PT0gJ0J1aWxkUHJvZ3Jlc3NVcGRhdGVkJyB8fCB0eXBlID09PSAnUGFyc2luZ1Byb2dyZXNzVXBkYXRlZCcpIHtcbiAgICAgICAgdGhpcy5fYnVpbGRQcm9ncmVzcyA9IG1lc3NhZ2UucHJvZ3Jlc3NWYWx1ZTtcbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdCdWlsZEZpbmlzaGVkJykge1xuICAgICAgICB0aGlzLl9idWlsZFByb2dyZXNzID0gMS4wO1xuICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICAgIHdzLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHdzLm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIWlzRmluaXNoZWQpIHtcbiAgICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoXG4gICAgICAgICAgICBgV2ViU29ja2V0IGNsb3NlZCBiZWZvcmUgJHtidWlsZFRhcmdldH0gZmluaXNoZWQgYnVpbGRpbmcuYCk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gd3M7XG4gIH1cblxuICBfbm90aWZ5RXJyb3IoKSB7XG4gICAgY29uc3QgYWN0aXZlRWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmICghYWN0aXZlRWRpdG9yKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICBgQ291bGQgbm90IGJ1aWxkOiBtdXN0IG5hdmlnYXRlIHRvIGEgZmlsZSB0aGF0IGlzIHBhcnQgb2YgYSBCdWNrIHByb2plY3QuYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZU5hbWUgPSBhY3RpdmVFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICBgQ291bGQgbm90IGJ1aWxkOiBmaWxlICcke2ZpbGVOYW1lfScgaXMgbm90IHBhcnQgb2YgYSBCdWNrIHByb2plY3QuYCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCdWNrVG9vbGJhclN0b3JlO1xuIl19