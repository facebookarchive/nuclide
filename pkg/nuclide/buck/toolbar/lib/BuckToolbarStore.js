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
            _this._doBuild(false, false);
            break;
          case BuckToolbarActions.ActionType.RUN:
            _this._doBuild(true, false);
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
//# sourceMappingURL=data:application/json;base64,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QVMsQ0FBQyxFQUFFO0FBQ2xDLGlCQUFPO1NBQ1I7O0FBRUQsWUFBSSxJQUFJLEtBQUssc0JBQXNCLElBQUksSUFBSSxLQUFLLHdCQUF3QixFQUFFO0FBQ3hFLGlCQUFLLGNBQWMsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO0FBQzVDLGlCQUFLLFVBQVUsRUFBRSxDQUFDO1NBQ25CLE1BQU0sSUFBSSxJQUFJLEtBQUssZUFBZSxFQUFFO0FBQ25DLGlCQUFLLGNBQWMsR0FBRyxHQUFHLENBQUM7QUFDMUIsaUJBQUssVUFBVSxFQUFFLENBQUM7QUFDbEIsb0JBQVUsR0FBRyxJQUFJLENBQUM7QUFDbEIsWUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ1o7T0FDRixDQUFDOztBQUVGLFFBQUUsQ0FBQyxPQUFPLEdBQUcsWUFBTTtBQUNqQixZQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2YsbUJBQVMsRUFBRSxDQUFDLEtBQUssOEJBQ2MsV0FBVyx5QkFBc0IsQ0FBQztTQUNsRTtPQUNGLENBQUM7QUFDRixhQUFPLEVBQUUsQ0FBQztLQUNYOzs7V0FFVyx3QkFBRztBQUNiLFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUMxRCxVQUFJLENBQUMsWUFBWSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSw0RUFDa0QsQ0FBQztBQUNoRixlQUFPO09BQ1I7O0FBRUQsVUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3hDLFVBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSw4QkFDQyxRQUFRLHVDQUFtQyxDQUFDO0tBQzNFOzs7U0E5YkcsZ0JBQWdCOzs7QUFpY3RCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUMiLCJmaWxlIjoiQnVja1Rvb2xiYXJTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmxldCBsb2dnZXI7XG5mdW5jdGlvbiBnZXRMb2dnZXIoKSB7XG4gIGlmICghbG9nZ2VyKSB7XG4gICAgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICB9XG4gIHJldHVybiBsb2dnZXI7XG59XG5cbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuY29uc3Qge0VtaXR0ZXJ9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHtEaXNwYXRjaGVyfSA9IHJlcXVpcmUoJ2ZsdXgnKTtcbmNvbnN0IHtidWNrUHJvamVjdFJvb3RGb3JQYXRofSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKTtcbmNvbnN0IEJ1Y2tUb29sYmFyQWN0aW9ucyA9IHJlcXVpcmUoJy4vQnVja1Rvb2xiYXJBY3Rpb25zJyk7XG5cbnR5cGUgQnVja1J1bkRldGFpbHMgPSB7XG4gIHBpZD86IG51bWJlcjtcbn07XG5pbXBvcnQgdHlwZSB7UHJvY2Vzc091dHB1dFN0b3JlIGFzIFByb2Nlc3NPdXRwdXRTdG9yZVR5cGV9IGZyb20gJy4uLy4uLy4uL3Byb2Nlc3Mvb3V0cHV0LXN0b3JlJztcbmltcG9ydCB0eXBlIHtQcm9jZXNzT3V0cHV0RGF0YUhhbmRsZXJzfSBmcm9tICcuLi8uLi8uLi9wcm9jZXNzL291dHB1dC1zdG9yZS9saWIvdHlwZXMnO1xuaW1wb3J0IHR5cGUge0J1Y2tQcm9qZWN0fSBmcm9tICcuLi8uLi9iYXNlL2xpYi9CdWNrUHJvamVjdCc7XG5pbXBvcnQgUmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyIGZyb20gJy4vUmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyJztcbmltcG9ydCBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMgZnJvbSAnLi9SZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMnO1xuXG5jb25zdCBCVUNLX1BST0NFU1NfSURfUkVHRVggPSAvbGxkYiAtcCAoWzAtOV0rKS87XG5jb25zdCBSRUFDVF9OQVRJVkVfQVBQX0ZMQUdTID0gW1xuICAnLWV4ZWN1dG9yLW92ZXJyaWRlJywgJ1JDVFdlYlNvY2tldEV4ZWN1dG9yJyxcbiAgJy13ZWJzb2NrZXQtZXhlY3V0b3ItbmFtZScsICdOdWNsaWRlJyxcbiAgJy13ZWJzb2NrZXQtZXhlY3V0b3ItcG9ydCcsICc4MDkwJyxcbl07XG5cbnR5cGUgSW5pdGlhbFN0YXRlID0ge1xuICBpc1JlYWN0TmF0aXZlU2VydmVyTW9kZT86IGJvb2xlYW47XG59O1xuXG5jbGFzcyBCdWNrVG9vbGJhclN0b3JlIHtcblxuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9yZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnM6IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucztcbiAgX3JlYWN0TmF0aXZlU2VydmVyTWFuYWdlcjogUmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyO1xuICBfbW9zdFJlY2VudEJ1Y2tQcm9qZWN0OiA/QnVja1Byb2plY3Q7XG4gIF90ZXh0RWRpdG9yVG9CdWNrUHJvamVjdDogV2Vha01hcDxUZXh0RWRpdG9yLCBCdWNrUHJvamVjdD47XG4gIF9pc0J1aWxkaW5nOiBib29sZWFuO1xuICBfYnVpbGRUYXJnZXQ6IHN0cmluZztcbiAgX2J1aWxkUHJvZ3Jlc3M6IG51bWJlcjtcbiAgX2J1aWxkUnVsZVR5cGU6IHN0cmluZztcbiAgX3NpbXVsYXRvcjogP3N0cmluZztcbiAgX2lzUGFuZWxWaXNpYmxlOiBib29sZWFuO1xuICBfaXNSZWFjdE5hdGl2ZUFwcDogYm9vbGVhbjtcbiAgX2lzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlOiBib29sZWFuO1xuICBfYnVja1Byb2Nlc3NPdXRwdXRTdG9yZTogP1Byb2Nlc3NPdXRwdXRTdG9yZVR5cGU7XG4gIF9hbGlhc2VzQnlQcm9qZWN0OiBXZWFrTWFwPEJ1Y2tQcm9qZWN0LCBBcnJheTxzdHJpbmc+PjtcblxuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyOiBEaXNwYXRjaGVyLCBpbml0aWFsU3RhdGU6IEluaXRpYWxTdGF0ZSA9IHt9KSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5fcmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zID0gbmV3IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyhkaXNwYXRjaGVyKTtcbiAgICB0aGlzLl9yZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXIgPSBuZXcgUmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyKFxuICAgICAgZGlzcGF0Y2hlcixcbiAgICAgIHRoaXMuX3JlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyxcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JUb0J1Y2tQcm9qZWN0ID0gbmV3IFdlYWtNYXAoKTtcbiAgICB0aGlzLl9hbGlhc2VzQnlQcm9qZWN0ID0gbmV3IFdlYWtNYXAoKTtcbiAgICB0aGlzLl9pbml0U3RhdGUoaW5pdGlhbFN0YXRlKTtcbiAgICB0aGlzLl9zZXR1cEFjdGlvbnMoKTtcbiAgfVxuXG4gIF9pbml0U3RhdGUoaW5pdGlhbFN0YXRlOiBJbml0aWFsU3RhdGUpIHtcbiAgICB0aGlzLl9pc0J1aWxkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5fYnVpbGRUYXJnZXQgPSBpbml0aWFsU3RhdGUuYnVpbGRUYXJnZXQgfHwgJyc7XG4gICAgdGhpcy5fYnVpbGRQcm9ncmVzcyA9IDA7XG4gICAgdGhpcy5fYnVpbGRSdWxlVHlwZSA9ICcnO1xuICAgIHRoaXMuX2lzUGFuZWxWaXNpYmxlID0gaW5pdGlhbFN0YXRlLmlzUGFuZWxWaXNpYmxlIHx8IGZhbHNlO1xuICAgIHRoaXMuX2lzUmVhY3ROYXRpdmVBcHAgPSBmYWxzZTtcbiAgICB0aGlzLl9pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSA9IGluaXRpYWxTdGF0ZS5pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSB8fCBmYWxzZTtcbiAgfVxuXG4gIF9zZXR1cEFjdGlvbnMoKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5yZWdpc3RlcihhY3Rpb24gPT4ge1xuICAgICAgc3dpdGNoIChhY3Rpb24uYWN0aW9uVHlwZSkge1xuICAgICAgICBjYXNlIEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlVQREFURV9QUk9KRUNUOlxuICAgICAgICAgIHRoaXMuX3VwZGF0ZVByb2plY3QoYWN0aW9uLmVkaXRvcik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX0JVSUxEX1RBUkdFVDpcbiAgICAgICAgICB0aGlzLl91cGRhdGVCdWlsZFRhcmdldChhY3Rpb24uYnVpbGRUYXJnZXQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlVQREFURV9TSU1VTEFUT1I6XG4gICAgICAgICAgdGhpcy5fc2ltdWxhdG9yID0gYWN0aW9uLnNpbXVsYXRvcjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfUkVBQ1RfTkFUSVZFX1NFUlZFUl9NT0RFOlxuICAgICAgICAgIHRoaXMuX2lzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlID0gYWN0aW9uLnNlcnZlck1vZGU7XG4gICAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuQlVJTEQ6XG4gICAgICAgICAgdGhpcy5fZG9CdWlsZChmYWxzZSwgZmFsc2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlJVTjpcbiAgICAgICAgICB0aGlzLl9kb0J1aWxkKHRydWUsIGZhbHNlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5ERUJVRzpcbiAgICAgICAgICB0aGlzLl9kb0RlYnVnKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVE9HR0xFX1BBTkVMX1ZJU0lCSUxJVFk6XG4gICAgICAgICAgdGhpcy5faXNQYW5lbFZpc2libGUgPSAhdGhpcy5faXNQYW5lbFZpc2libGU7XG4gICAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX1BBTkVMX1ZJU0lCSUxJVFk6XG4gICAgICAgICAgdGhpcy5faXNQYW5lbFZpc2libGUgPSBhY3Rpb24uaXNQYW5lbFZpc2libGU7XG4gICAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3JlYWN0TmF0aXZlU2VydmVyTWFuYWdlci5kaXNwb3NlKCk7XG4gICAgaWYgKHRoaXMuX2J1Y2tQcm9jZXNzT3V0cHV0U3RvcmUpIHtcbiAgICAgIHRoaXMuX2J1Y2tQcm9jZXNzT3V0cHV0U3RvcmUuc3RvcFByb2Nlc3MoKTtcbiAgICB9XG4gIH1cblxuICBzdWJzY3JpYmUoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2NoYW5nZScsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGVtaXRDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjaGFuZ2UnKTtcbiAgfVxuXG4gIGdldEJ1aWxkVGFyZ2V0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2J1aWxkVGFyZ2V0O1xuICB9XG5cbiAgaXNCdWlsZGluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNCdWlsZGluZztcbiAgfVxuXG4gIGdldFJ1bGVUeXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2J1aWxkUnVsZVR5cGU7XG4gIH1cblxuICBnZXRCdWlsZFByb2dyZXNzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2J1aWxkUHJvZ3Jlc3M7XG4gIH1cblxuICBpc1BhbmVsVmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNQYW5lbFZpc2libGU7XG4gIH1cblxuICBpc1JlYWN0TmF0aXZlQXBwKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc1JlYWN0TmF0aXZlQXBwO1xuICB9XG5cbiAgaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNSZWFjdE5hdGl2ZUFwcCgpICYmIHRoaXMuX2lzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlO1xuICB9XG5cbiAgYXN5bmMgbG9hZEFsaWFzZXMoKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gICAgY29uc3QgYnVja1Byb2plY3QgPSB0aGlzLl9tb3N0UmVjZW50QnVja1Byb2plY3Q7XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgfVxuXG4gICAgLy8gQ2FjaGUgYWxpYXNlcyBmb3IgYSBwcm9qZWN0IGJlY2F1c2UgaW52b2tpbmcgYnVjayBqdXN0IHRvIGxpc3QgYWxpYXNlcyB0aGF0IGFyZSBoaWdobHlcbiAgICAvLyB1bmxpa2VseSB0byBjaGFuZ2UgaXMgd2FzdGVmdWwuXG4gICAgbGV0IGFsaWFzZXMgPSB0aGlzLl9hbGlhc2VzQnlQcm9qZWN0LmdldChidWNrUHJvamVjdCk7XG4gICAgaWYgKCFhbGlhc2VzKSB7XG4gICAgICBhbGlhc2VzID0gYXdhaXQgYnVja1Byb2plY3QubGlzdEFsaWFzZXMoKTtcbiAgICAgIHRoaXMuX2FsaWFzZXNCeVByb2plY3Quc2V0KGJ1Y2tQcm9qZWN0LCBhbGlhc2VzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWxpYXNlcztcbiAgfVxuXG4gIGFzeW5jIF9nZXRSZWFjdE5hdGl2ZVNlcnZlckNvbW1hbmQoKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgY29uc3QgYnVja1Byb2plY3QgPSB0aGlzLl9tb3N0UmVjZW50QnVja1Byb2plY3Q7XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHNlcnZlckNvbW1hbmQgPSBhd2FpdCBidWNrUHJvamVjdC5nZXRCdWNrQ29uZmlnKCdyZWFjdC1uYXRpdmUnLCAnc2VydmVyJyk7XG4gICAgaWYgKHNlcnZlckNvbW1hbmQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHJlcG9Sb290ID0gYXdhaXQgYnVja1Byb2plY3QuZ2V0UGF0aCgpO1xuICAgIGlmIChyZXBvUm9vdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHBhdGguam9pbihyZXBvUm9vdCwgc2VydmVyQ29tbWFuZCk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlUHJvamVjdChlZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBudWNsaWRlVXJpID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIW51Y2xpZGVVcmkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGJ1Y2tQcm9qZWN0ID0gdGhpcy5fdGV4dEVkaXRvclRvQnVja1Byb2plY3QuZ2V0KGVkaXRvcik7XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgYnVja1Byb2plY3QgPSBhd2FpdCBidWNrUHJvamVjdFJvb3RGb3JQYXRoKG51Y2xpZGVVcmkpO1xuICAgICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yVG9CdWNrUHJvamVjdC5zZXQoZWRpdG9yLCBidWNrUHJvamVjdCk7XG4gICAgfVxuICAgIHRoaXMuX21vc3RSZWNlbnRCdWNrUHJvamVjdCA9IGJ1Y2tQcm9qZWN0O1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZUJ1aWxkVGFyZ2V0KGJ1aWxkVGFyZ2V0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBidWlsZFRhcmdldCA9IGJ1aWxkVGFyZ2V0LnRyaW0oKTtcbiAgICB0aGlzLl9idWlsZFRhcmdldCA9IGJ1aWxkVGFyZ2V0O1xuXG4gICAgdGhpcy5fYnVpbGRSdWxlVHlwZSA9IGF3YWl0IHRoaXMuX2ZpbmRSdWxlVHlwZSgpO1xuICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIHRoaXMuX2lzUmVhY3ROYXRpdmVBcHAgPSBhd2FpdCB0aGlzLl9maW5kSXNSZWFjdE5hdGl2ZUFwcCgpO1xuICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICB9XG5cbiAgYXN5bmMgX2ZpbmRSdWxlVHlwZSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0ID0gdGhpcy5fbW9zdFJlY2VudEJ1Y2tQcm9qZWN0O1xuICAgIGNvbnN0IGJ1aWxkVGFyZ2V0ID0gdGhpcy5fYnVpbGRUYXJnZXQ7XG5cbiAgICBsZXQgYnVpbGRSdWxlVHlwZSA9ICcnO1xuICAgIGlmIChidWlsZFRhcmdldCAmJiBidWNrUHJvamVjdCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYnVpbGRSdWxlVHlwZSA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmJ1aWxkUnVsZVR5cGVGb3IoYnVpbGRUYXJnZXQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBNb3N0IGxpa2VseSwgdGhpcyBpcyBhbiBpbnZhbGlkIHRhcmdldCwgc28gZG8gbm90aGluZy5cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJ1aWxkUnVsZVR5cGU7XG4gIH1cblxuICBhc3luYyBfZmluZElzUmVhY3ROYXRpdmVBcHAoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgYnVpbGRSdWxlVHlwZSA9IHRoaXMuX2J1aWxkUnVsZVR5cGU7XG4gICAgaWYgKGJ1aWxkUnVsZVR5cGUgIT09ICdhcHBsZV9idW5kbGUnICYmIGJ1aWxkUnVsZVR5cGUgIT09ICdhbmRyb2lkX2JpbmFyeScpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgYnVja1Byb2plY3QgPSB0aGlzLl9tb3N0UmVjZW50QnVja1Byb2plY3Q7XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHJlYWN0TmF0aXZlUnVsZSA9IGJ1aWxkUnVsZVR5cGUgPT09ICdhcHBsZV9idW5kbGUnXG4gICAgPyAnaW9zX3JlYWN0X25hdGl2ZV9saWJyYXJ5J1xuICAgIDogJ2FuZHJvaWRfcmVhY3RfbmF0aXZlX2xpYnJhcnknO1xuXG4gICAgY29uc3QgYnVpbGRUYXJnZXQgPSB0aGlzLl9idWlsZFRhcmdldDtcbiAgICBjb25zdCBtYXRjaGVzID0gYXdhaXQgYnVja1Byb2plY3QucXVlcnlXaXRoQXJncyhcbiAgICAgIGBraW5kKCcke3JlYWN0TmF0aXZlUnVsZX0nLCBkZXBzKCclcycpKWAsXG4gICAgICBbYnVpbGRUYXJnZXRdLFxuICAgICk7XG4gICAgcmV0dXJuIG1hdGNoZXNbYnVpbGRUYXJnZXRdLmxlbmd0aCA+IDA7XG4gIH1cblxuICBhc3luYyBfZG9EZWJ1ZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBUT0RPKG5hdHRodSk6IFJlc3RvcmUgdmFsaWRhdGlvbiBsb2dpYyB0byBtYWtlIHN1cmUgdGhlIHRhcmdldCBpcyBpbnN0YWxsYWJsZS5cbiAgICAvLyBGb3Igbm93LCBsZXQncyBsZWF2ZSB0aGF0IHRvIEJ1Y2suXG5cbiAgICAvLyBTdG9wIGFueSBleGlzdGluZyBkZWJ1Z2dpbmcgc2Vzc2lvbnMsIGFzIGluc3RhbGwgaGFuZ3MgaWYgYW4gZXhpc3RpbmdcbiAgICAvLyBhcHAgdGhhdCdzIGJlaW5nIG92ZXJ3cml0dGVuIGlzIGJlaW5nIGRlYnVnZ2VkLlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c3RvcC1kZWJ1Z2dpbmcnKTtcblxuICAgIGNvbnN0IGluc3RhbGxSZXN1bHQgPSBhd2FpdCB0aGlzLl9kb0J1aWxkKHRydWUsIHRydWUpO1xuICAgIGlmICghaW5zdGFsbFJlc3VsdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7YnVja1Byb2plY3QsIHBpZH0gPSBpbnN0YWxsUmVzdWx0O1xuXG4gICAgaWYgKHBpZCkge1xuICAgICAgLy8gVXNlIGNvbW1hbmRzIGhlcmUgdG8gdHJpZ2dlciBwYWNrYWdlIGFjdGl2YXRpb24uXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdudWNsaWRlLWRlYnVnZ2VyOnNob3cnKTtcbiAgICAgIGNvbnN0IGRlYnVnZ2VyU2VydmljZSA9IGF3YWl0IHJlcXVpcmUoJy4uLy4uLy4uL3NlcnZpY2UtaHViLXBsdXMnKVxuICAgICAgICAgIC5jb25zdW1lRmlyc3RQcm92aWRlcignbnVjbGlkZS1kZWJ1Z2dlci5yZW1vdGUnKTtcbiAgICAgIGNvbnN0IGJ1Y2tQcm9qZWN0UGF0aCA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmdldFBhdGgoKTtcbiAgICAgIGRlYnVnZ2VyU2VydmljZS5kZWJ1Z0xMREIocGlkLCBidWNrUHJvamVjdFBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9kb0J1aWxkKFxuICAgIHJ1bjogYm9vbGVhbixcbiAgICBkZWJ1ZzogYm9vbGVhbixcbiAgKTogUHJvbWlzZTw/e2J1Y2tQcm9qZWN0OiBCdWNrUHJvamVjdCwgYnVpbGRUYXJnZXQ6IHN0cmluZywgcGlkOiA/bnVtYmVyfT4ge1xuICAgIGNvbnN0IGJ1aWxkVGFyZ2V0ID0gdGhpcy5fYnVpbGRUYXJnZXQ7XG4gICAgY29uc3Qgc2ltdWxhdG9yID0gdGhpcy5fc2ltdWxhdG9yO1xuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0ID0gdGhpcy5fbW9zdFJlY2VudEJ1Y2tQcm9qZWN0O1xuICAgIGlmICghdGhpcy5fYnVpbGRUYXJnZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFidWNrUHJvamVjdCkge1xuICAgICAgdGhpcy5fbm90aWZ5RXJyb3IoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgYXBwQXJncyA9IFtdO1xuICAgIGlmIChydW4gJiYgdGhpcy5pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSgpKSB7XG4gICAgICBjb25zdCBzZXJ2ZXJDb21tYW5kID0gYXdhaXQgdGhpcy5fZ2V0UmVhY3ROYXRpdmVTZXJ2ZXJDb21tYW5kKCk7XG4gICAgICBpZiAoc2VydmVyQ29tbWFuZCkge1xuICAgICAgICB0aGlzLl9yZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuc3RhcnRTZXJ2ZXIoc2VydmVyQ29tbWFuZCk7XG4gICAgICAgIGFwcEFyZ3MgPSBSRUFDVF9OQVRJVkVfQVBQX0ZMQUdTO1xuICAgICAgICB0aGlzLl9yZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMuc3RhcnROb2RlRXhlY3V0b3JTZXJ2ZXIoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBjb21tYW5kID0gYGJ1Y2sgJHtydW4gPyAnaW5zdGFsbCcgOiAnYnVpbGQnfSAke2J1aWxkVGFyZ2V0fWA7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oYCR7Y29tbWFuZH0gc3RhcnRlZC5gKTtcbiAgICBjb25zdCB3cyA9IGF3YWl0IHRoaXMuX3NldHVwV2ViU29ja2V0KGJ1Y2tQcm9qZWN0LCBidWlsZFRhcmdldCk7XG5cbiAgICB0aGlzLl9idWlsZFByb2dyZXNzID0gMDtcbiAgICB0aGlzLl9pc0J1aWxkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcblxuICAgIGNvbnN0IHtwaWR9ID0gYXdhaXQgdGhpcy5fcnVuQnVja0NvbW1hbmRJbk5ld1BhbmUoXG4gICAgICAgIHtidWNrUHJvamVjdCwgYnVpbGRUYXJnZXQsIHNpbXVsYXRvciwgcnVuLCBkZWJ1ZywgY29tbWFuZCwgYXBwQXJnc30pO1xuXG4gICAgdGhpcy5faXNCdWlsZGluZyA9IGZhbHNlO1xuICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIGlmICh3cykge1xuICAgICAgd3MuY2xvc2UoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge2J1Y2tQcm9qZWN0LCBidWlsZFRhcmdldCwgcGlkfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIEFuIE9iamVjdCB3aXRoIHNvbWUgZGV0YWlscyBhYm91dCB0aGUgb3V0cHV0IG9mIHRoZSBjb21tYW5kOlxuICAgKiAgIHBpZDogVGhlIHByb2Nlc3MgaWQgb2YgdGhlIHJ1bm5pbmcgYXBwLCBpZiAncnVuJyB3YXMgdHJ1ZS5cbiAgICovXG4gIGFzeW5jIF9ydW5CdWNrQ29tbWFuZEluTmV3UGFuZShidWNrUGFyYW1zOiB7XG4gICAgYnVja1Byb2plY3Q6IEJ1Y2tQcm9qZWN0LFxuICAgIGJ1aWxkVGFyZ2V0OiBzdHJpbmcsXG4gICAgc2ltdWxhdG9yOiA/c3RyaW5nLFxuICAgIHJ1bjogYm9vbGVhbixcbiAgICBkZWJ1ZzogYm9vbGVhbixcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXBwQXJnczogQXJyYXk8c3RyaW5nPixcbiAgfSk6IFByb21pc2U8QnVja1J1bkRldGFpbHM+IHtcbiAgICBjb25zdCB7YnVja1Byb2plY3QsIGJ1aWxkVGFyZ2V0LCBzaW11bGF0b3IsIHJ1biwgZGVidWcsIGNvbW1hbmQsIGFwcEFyZ3N9ID0gYnVja1BhcmFtcztcblxuICAgIGNvbnN0IGdldFJ1bkNvbW1hbmRJbk5ld1BhbmUgPSByZXF1aXJlKCcuLi8uLi8uLi9wcm9jZXNzL291dHB1dCcpO1xuICAgIGNvbnN0IHtydW5Db21tYW5kSW5OZXdQYW5lLCBkaXNwb3NhYmxlfSA9IGdldFJ1bkNvbW1hbmRJbk5ld1BhbmUoKTtcblxuICAgIGNvbnN0IHJ1blByb2Nlc3NXaXRoSGFuZGxlcnMgPSBhc3luYyAoZGF0YUhhbmRsZXJPcHRpb25zOiBQcm9jZXNzT3V0cHV0RGF0YUhhbmRsZXJzKSA9PiB7XG4gICAgICBjb25zdCB7c3Rkb3V0LCBzdGRlcnIsIGVycm9yLCBleGl0fSA9IGRhdGFIYW5kbGVyT3B0aW9ucztcbiAgICAgIGxldCBvYnNlcnZhYmxlO1xuICAgICAgaW52YXJpYW50KGJ1Y2tQcm9qZWN0KTtcbiAgICAgIGlmIChydW4pIHtcbiAgICAgICAgb2JzZXJ2YWJsZSA9IGF3YWl0IGJ1Y2tQcm9qZWN0Lmluc3RhbGxXaXRoT3V0cHV0KFxuICAgICAgICAgICAgW2J1aWxkVGFyZ2V0XSwgc2ltdWxhdG9yLCB7cnVuLCBkZWJ1ZywgYXBwQXJnc30pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2JzZXJ2YWJsZSA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmJ1aWxkV2l0aE91dHB1dChbYnVpbGRUYXJnZXRdKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG9uTmV4dCA9IChkYXRhOiB7c3RkZXJyPzogc3RyaW5nOyBzdGRvdXQ/OiBzdHJpbmd9KSA9PiB7XG4gICAgICAgIGlmIChkYXRhLnN0ZG91dCkge1xuICAgICAgICAgIHN0ZG91dChkYXRhLnN0ZG91dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RkZXJyKGRhdGEuc3RkZXJyIHx8ICcnKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNvbnN0IG9uRXJyb3IgPSAoZGF0YTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGVycm9yKG5ldyBFcnJvcihkYXRhKSk7XG4gICAgICAgIGV4aXQoMSk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgJHtidWlsZFRhcmdldH0gZmFpbGVkIHRvIGJ1aWxkLmApO1xuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBvbkV4aXQgPSAoKSA9PiB7XG4gICAgICAgIC8vIG9uRXhpdCB3aWxsIG9ubHkgYmUgY2FsbGVkIGlmIHRoZSBwcm9jZXNzIGNvbXBsZXRlcyBzdWNjZXNzZnVsbHksXG4gICAgICAgIC8vIGkuZS4gd2l0aCBleGl0IGNvZGUgMC4gVW5mb3J0dW5hdGVseSBhbiBPYnNlcnZhYmxlIGNhbm5vdCBwYXNzIGFuXG4gICAgICAgIC8vIGFyZ3VtZW50IChlLmcuIGFuIGV4aXQgY29kZSkgb24gY29tcGxldGlvbi5cbiAgICAgICAgZXhpdCgwKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoYCR7Y29tbWFuZH0gc3VjY2VlZGVkLmApO1xuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBvYnNlcnZhYmxlLnN1YnNjcmliZShvbk5leHQsIG9uRXJyb3IsIG9uRXhpdCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGtpbGwoKSB7XG4gICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGNvbnN0IGJ1Y2tSdW5Qcm9taXNlOiBQcm9taXNlPEJ1Y2tSdW5EZXRhaWxzPiA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHtQcm9jZXNzT3V0cHV0U3RvcmV9ID0gcmVxdWlyZSgnLi4vLi4vLi4vcHJvY2Vzcy9vdXRwdXQtc3RvcmUnKTtcbiAgICAgIGNvbnN0IHByb2Nlc3NPdXRwdXRTdG9yZSA9IG5ldyBQcm9jZXNzT3V0cHV0U3RvcmUocnVuUHJvY2Vzc1dpdGhIYW5kbGVycyk7XG4gICAgICBjb25zdCB7aGFuZGxlQnVja0Fuc2lPdXRwdXR9ID0gcmVxdWlyZSgnLi4vLi4vLi4vcHJvY2Vzcy9vdXRwdXQtaGFuZGxlcicpO1xuXG4gICAgICB0aGlzLl9idWNrUHJvY2Vzc091dHB1dFN0b3JlID0gcHJvY2Vzc091dHB1dFN0b3JlO1xuICAgICAgY29uc3QgZXhpdFN1YnNjcmlwdGlvbiA9IHByb2Nlc3NPdXRwdXRTdG9yZS5vblByb2Nlc3NFeGl0KChleGl0Q29kZTogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChleGl0Q29kZSA9PT0gMCAmJiBydW4pIHtcbiAgICAgICAgICAvLyBHZXQgdGhlIHByb2Nlc3MgSUQuXG4gICAgICAgICAgY29uc3QgYWxsQnVpbGRPdXRwdXQgPSBwcm9jZXNzT3V0cHV0U3RvcmUuZ2V0U3Rkb3V0KCkgfHwgJyc7XG4gICAgICAgICAgY29uc3QgcGlkTWF0Y2ggPSBhbGxCdWlsZE91dHB1dC5tYXRjaChCVUNLX1BST0NFU1NfSURfUkVHRVgpO1xuICAgICAgICAgIGlmIChwaWRNYXRjaCkge1xuICAgICAgICAgICAgLy8gSW5kZXggMSBpcyB0aGUgY2FwdHVyZWQgcGlkLlxuICAgICAgICAgICAgcmVzb2x2ZSh7cGlkOiBwYXJzZUludChwaWRNYXRjaFsxXSwgMTApfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoe30pO1xuICAgICAgICB9XG4gICAgICAgIGV4aXRTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9idWNrUHJvY2Vzc091dHB1dFN0b3JlID0gbnVsbDtcbiAgICAgIH0pO1xuXG4gICAgICBydW5Db21tYW5kSW5OZXdQYW5lKHtcbiAgICAgICAgdGFiVGl0bGU6ICdidWNrJyxcbiAgICAgICAgcHJvY2Vzc091dHB1dFN0b3JlLFxuICAgICAgICBwcm9jZXNzT3V0cHV0SGFuZGxlcjogaGFuZGxlQnVja0Fuc2lPdXRwdXQsXG4gICAgICAgIGRlc3Ryb3lFeGlzdGluZ1BhbmU6IHRydWUsXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhd2FpdCBidWNrUnVuUHJvbWlzZTtcbiAgfVxuXG4gIGFzeW5jIF9zZXR1cFdlYlNvY2tldChidWNrUHJvamVjdDogQnVja1Byb2plY3QsIGJ1aWxkVGFyZ2V0OiBzdHJpbmcpOiBQcm9taXNlPD9XZWJTb2NrZXQ+IHtcbiAgICBjb25zdCBodHRwUG9ydCA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmdldFNlcnZlclBvcnQoKTtcbiAgICBpZiAoaHR0cFBvcnQgPD0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgdXJpID0gYHdzOi8vbG9jYWxob3N0OiR7aHR0cFBvcnR9L3dzL2J1aWxkYDtcbiAgICBjb25zdCB3cyA9IG5ldyBXZWJTb2NrZXQodXJpKTtcbiAgICBsZXQgYnVpbGRJZDogP3N0cmluZyA9IG51bGw7XG4gICAgbGV0IGlzRmluaXNoZWQgPSBmYWxzZTtcblxuICAgIHdzLm9ubWVzc2FnZSA9IChlKSA9PiB7XG4gICAgICBsZXQgbWVzc2FnZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoXG4gICAgICAgICAgICBgQnVjayB3YXMgbGlrZWx5IGtpbGxlZCB3aGlsZSBidWlsZGluZyAke2J1aWxkVGFyZ2V0fS5gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgdHlwZSA9IG1lc3NhZ2VbJ3R5cGUnXTtcbiAgICAgIGlmIChidWlsZElkID09PSBudWxsKSB7XG4gICAgICAgIGlmICh0eXBlID09PSAnQnVpbGRTdGFydGVkJykge1xuICAgICAgICAgIGJ1aWxkSWQgPSBtZXNzYWdlWydidWlsZElkJ107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChidWlsZElkICE9PSBtZXNzYWdlWydidWlsZElkJ10pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZSA9PT0gJ0J1aWxkUHJvZ3Jlc3NVcGRhdGVkJyB8fCB0eXBlID09PSAnUGFyc2luZ1Byb2dyZXNzVXBkYXRlZCcpIHtcbiAgICAgICAgdGhpcy5fYnVpbGRQcm9ncmVzcyA9IG1lc3NhZ2UucHJvZ3Jlc3NWYWx1ZTtcbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdCdWlsZEZpbmlzaGVkJykge1xuICAgICAgICB0aGlzLl9idWlsZFByb2dyZXNzID0gMS4wO1xuICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICAgIHdzLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHdzLm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIWlzRmluaXNoZWQpIHtcbiAgICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoXG4gICAgICAgICAgICBgV2ViU29ja2V0IGNsb3NlZCBiZWZvcmUgJHtidWlsZFRhcmdldH0gZmluaXNoZWQgYnVpbGRpbmcuYCk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gd3M7XG4gIH1cblxuICBfbm90aWZ5RXJyb3IoKSB7XG4gICAgY29uc3QgYWN0aXZlRWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmICghYWN0aXZlRWRpdG9yKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICBgQ291bGQgbm90IGJ1aWxkOiBtdXN0IG5hdmlnYXRlIHRvIGEgZmlsZSB0aGF0IGlzIHBhcnQgb2YgYSBCdWNrIHByb2plY3QuYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZU5hbWUgPSBhY3RpdmVFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICBgQ291bGQgbm90IGJ1aWxkOiBmaWxlICcke2ZpbGVOYW1lfScgaXMgbm90IHBhcnQgb2YgYSBCdWNrIHByb2plY3QuYCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCdWNrVG9vbGJhclN0b3JlO1xuIl19