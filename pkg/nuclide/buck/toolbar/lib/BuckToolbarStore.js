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
//# sourceMappingURL=data:application/json;base64,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QU8sS0FBSyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDbEMsaUJBQU87U0FDUjs7QUFFRCxZQUFJLElBQUksS0FBSyxzQkFBc0IsSUFBSSxJQUFJLEtBQUssd0JBQXdCLEVBQUU7QUFDeEUsaUJBQUssY0FBYyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7QUFDNUMsaUJBQUssVUFBVSxFQUFFLENBQUM7U0FDbkIsTUFBTSxJQUFJLElBQUksS0FBSyxlQUFlLEVBQUU7QUFDbkMsaUJBQUssY0FBYyxHQUFHLEdBQUcsQ0FBQztBQUMxQixpQkFBSyxVQUFVLEVBQUUsQ0FBQztBQUNsQixvQkFBVSxHQUFHLElBQUksQ0FBQztBQUNsQixZQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDWjtPQUNGLENBQUM7O0FBRUYsUUFBRSxDQUFDLE9BQU8sR0FBRyxZQUFNO0FBQ2pCLFlBQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixtQkFBUyxFQUFFLENBQUMsS0FBSyw4QkFDYyxXQUFXLHlCQUFzQixDQUFDO1NBQ2xFO09BQ0YsQ0FBQztBQUNGLGFBQU8sRUFBRSxDQUFDO0tBQ1g7OztXQUVXLHdCQUFHO0FBQ2IsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzFELFVBQUksQ0FBQyxZQUFZLEVBQUU7QUFDakIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLDRFQUNrRCxDQUFDO0FBQ2hGLGVBQU87T0FDUjs7QUFFRCxVQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDeEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLDhCQUNDLFFBQVEsdUNBQW1DLENBQUM7S0FDM0U7OztTQTliRyxnQkFBZ0I7OztBQWljdEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyIsImZpbGUiOiJCdWNrVG9vbGJhclN0b3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxubGV0IGxvZ2dlcjtcbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgaWYgKCFsb2dnZXIpIHtcbiAgICBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gIH1cbiAgcmV0dXJuIGxvZ2dlcjtcbn1cblxuY29uc3QgaW52YXJpYW50ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5jb25zdCB7RGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3Qge0Rpc3BhdGNoZXJ9ID0gcmVxdWlyZSgnZmx1eCcpO1xuY29uc3Qge2J1Y2tQcm9qZWN0Um9vdEZvclBhdGh9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuY29uc3QgQnVja1Rvb2xiYXJBY3Rpb25zID0gcmVxdWlyZSgnLi9CdWNrVG9vbGJhckFjdGlvbnMnKTtcblxudHlwZSBCdWNrUnVuRGV0YWlscyA9IHtcbiAgcGlkPzogbnVtYmVyO1xufTtcbmltcG9ydCB0eXBlIHtQcm9jZXNzT3V0cHV0U3RvcmUgYXMgUHJvY2Vzc091dHB1dFN0b3JlVHlwZX0gZnJvbSAnLi4vLi4vLi4vcHJvY2Vzcy9vdXRwdXQtc3RvcmUnO1xuaW1wb3J0IHR5cGUge1Byb2Nlc3NPdXRwdXREYXRhSGFuZGxlcnN9IGZyb20gJy4uLy4uLy4uL3Byb2Nlc3Mvb3V0cHV0LXN0b3JlL2xpYi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7QnVja1Byb2plY3R9IGZyb20gJy4uLy4uL2Jhc2UvbGliL0J1Y2tQcm9qZWN0JztcbmltcG9ydCBSZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXIgZnJvbSAnLi9SZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXInO1xuaW1wb3J0IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyBmcm9tICcuL1JlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyc7XG5cbmNvbnN0IEJVQ0tfUFJPQ0VTU19JRF9SRUdFWCA9IC9sbGRiIC1wIChbMC05XSspLztcbmNvbnN0IFJFQUNUX05BVElWRV9BUFBfRkxBR1MgPSBbXG4gICctZXhlY3V0b3Itb3ZlcnJpZGUnLCAnUkNUV2ViU29ja2V0RXhlY3V0b3InLFxuICAnLXdlYnNvY2tldC1leGVjdXRvci1uYW1lJywgJ051Y2xpZGUnLFxuICAnLXdlYnNvY2tldC1leGVjdXRvci1wb3J0JywgJzgwOTAnLFxuXTtcblxudHlwZSBJbml0aWFsU3RhdGUgPSB7XG4gIGlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlPzogYm9vbGVhbjtcbn07XG5cbmNsYXNzIEJ1Y2tUb29sYmFyU3RvcmUge1xuXG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3JlYWN0TmF0aXZlU2VydmVyQWN0aW9uczogUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zO1xuICBfcmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyOiBSZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXI7XG4gIF9tb3N0UmVjZW50QnVja1Byb2plY3Q6ID9CdWNrUHJvamVjdDtcbiAgX3RleHRFZGl0b3JUb0J1Y2tQcm9qZWN0OiBXZWFrTWFwPFRleHRFZGl0b3IsIEJ1Y2tQcm9qZWN0PjtcbiAgX2lzQnVpbGRpbmc6IGJvb2xlYW47XG4gIF9idWlsZFRhcmdldDogc3RyaW5nO1xuICBfYnVpbGRQcm9ncmVzczogbnVtYmVyO1xuICBfYnVpbGRSdWxlVHlwZTogc3RyaW5nO1xuICBfc2ltdWxhdG9yOiA/c3RyaW5nO1xuICBfaXNQYW5lbFZpc2libGU6IGJvb2xlYW47XG4gIF9pc1JlYWN0TmF0aXZlQXBwOiBib29sZWFuO1xuICBfaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGU6IGJvb2xlYW47XG4gIF9idWNrUHJvY2Vzc091dHB1dFN0b3JlOiA/UHJvY2Vzc091dHB1dFN0b3JlVHlwZTtcbiAgX2FsaWFzZXNCeVByb2plY3Q6IFdlYWtNYXA8QnVja1Byb2plY3QsIEFycmF5PHN0cmluZz4+O1xuXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIGluaXRpYWxTdGF0ZTogSW5pdGlhbFN0YXRlID0ge30pIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB0aGlzLl9yZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMgPSBuZXcgUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zKGRpc3BhdGNoZXIpO1xuICAgIHRoaXMuX3JlYWN0TmF0aXZlU2VydmVyTWFuYWdlciA9IG5ldyBSZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXIoXG4gICAgICBkaXNwYXRjaGVyLFxuICAgICAgdGhpcy5fcmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zLFxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fdGV4dEVkaXRvclRvQnVja1Byb2plY3QgPSBuZXcgV2Vha01hcCgpO1xuICAgIHRoaXMuX2FsaWFzZXNCeVByb2plY3QgPSBuZXcgV2Vha01hcCgpO1xuICAgIHRoaXMuX2luaXRTdGF0ZShpbml0aWFsU3RhdGUpO1xuICAgIHRoaXMuX3NldHVwQWN0aW9ucygpO1xuICB9XG5cbiAgX2luaXRTdGF0ZShpbml0aWFsU3RhdGU6IEluaXRpYWxTdGF0ZSkge1xuICAgIHRoaXMuX2lzQnVpbGRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9idWlsZFRhcmdldCA9IGluaXRpYWxTdGF0ZS5idWlsZFRhcmdldCB8fCAnJztcbiAgICB0aGlzLl9idWlsZFByb2dyZXNzID0gMDtcbiAgICB0aGlzLl9idWlsZFJ1bGVUeXBlID0gJyc7XG4gICAgdGhpcy5faXNQYW5lbFZpc2libGUgPSBpbml0aWFsU3RhdGUuaXNQYW5lbFZpc2libGUgfHwgZmFsc2U7XG4gICAgdGhpcy5faXNSZWFjdE5hdGl2ZUFwcCA9IGZhbHNlO1xuICAgIHRoaXMuX2lzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlID0gaW5pdGlhbFN0YXRlLmlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlIHx8IGZhbHNlO1xuICB9XG5cbiAgX3NldHVwQWN0aW9ucygpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLnJlZ2lzdGVyKGFjdGlvbiA9PiB7XG4gICAgICBzd2l0Y2ggKGFjdGlvbi5hY3Rpb25UeXBlKSB7XG4gICAgICAgIGNhc2UgQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX1BST0pFQ1Q6XG4gICAgICAgICAgdGhpcy5fdXBkYXRlUHJvamVjdChhY3Rpb24uZWRpdG9yKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfQlVJTERfVEFSR0VUOlxuICAgICAgICAgIHRoaXMuX3VwZGF0ZUJ1aWxkVGFyZ2V0KGFjdGlvbi5idWlsZFRhcmdldCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuVVBEQVRFX1NJTVVMQVRPUjpcbiAgICAgICAgICB0aGlzLl9zaW11bGF0b3IgPSBhY3Rpb24uc2ltdWxhdG9yO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLlVQREFURV9SRUFDVF9OQVRJVkVfU0VSVkVSX01PREU6XG4gICAgICAgICAgdGhpcy5faXNSZWFjdE5hdGl2ZVNlcnZlck1vZGUgPSBhY3Rpb24uc2VydmVyTW9kZTtcbiAgICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5CVUlMRDpcbiAgICAgICAgICB0aGlzLl9kb0J1aWxkKGZhbHNlLCBmYWxzZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQnVja1Rvb2xiYXJBY3Rpb25zLkFjdGlvblR5cGUuUlVOOlxuICAgICAgICAgIHRoaXMuX2RvQnVpbGQodHJ1ZSwgZmFsc2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEJ1Y2tUb29sYmFyQWN0aW9ucy5BY3Rpb25UeXBlLkRFQlVHOlxuICAgICAgICAgIHRoaXMuX2RvRGVidWcoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5UT0dHTEVfUEFORUxfVklTSUJJTElUWTpcbiAgICAgICAgICB0aGlzLl9pc1BhbmVsVmlzaWJsZSA9ICF0aGlzLl9pc1BhbmVsVmlzaWJsZTtcbiAgICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBCdWNrVG9vbGJhckFjdGlvbnMuQWN0aW9uVHlwZS5VUERBVEVfUEFORUxfVklTSUJJTElUWTpcbiAgICAgICAgICB0aGlzLl9pc1BhbmVsVmlzaWJsZSA9IGFjdGlvbi5pc1BhbmVsVmlzaWJsZTtcbiAgICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fcmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5fYnVja1Byb2Nlc3NPdXRwdXRTdG9yZSkge1xuICAgICAgdGhpcy5fYnVja1Byb2Nlc3NPdXRwdXRTdG9yZS5zdG9wUHJvY2VzcygpO1xuICAgIH1cbiAgfVxuXG4gIHN1YnNjcmliZShjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdjaGFuZ2UnLCBjYWxsYmFjayk7XG4gIH1cblxuICBlbWl0Q2hhbmdlKCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnY2hhbmdlJyk7XG4gIH1cblxuICBnZXRCdWlsZFRhcmdldCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9idWlsZFRhcmdldDtcbiAgfVxuXG4gIGlzQnVpbGRpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQnVpbGRpbmc7XG4gIH1cblxuICBnZXRSdWxlVHlwZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9idWlsZFJ1bGVUeXBlO1xuICB9XG5cbiAgZ2V0QnVpbGRQcm9ncmVzcygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9idWlsZFByb2dyZXNzO1xuICB9XG5cbiAgaXNQYW5lbFZpc2libGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzUGFuZWxWaXNpYmxlO1xuICB9XG5cbiAgaXNSZWFjdE5hdGl2ZUFwcCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNSZWFjdE5hdGl2ZUFwcDtcbiAgfVxuXG4gIGlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzUmVhY3ROYXRpdmVBcHAoKSAmJiB0aGlzLl9pc1JlYWN0TmF0aXZlU2VydmVyTW9kZTtcbiAgfVxuXG4gIGFzeW5jIGxvYWRBbGlhc2VzKCk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0ID0gdGhpcy5fbW9zdFJlY2VudEJ1Y2tQcm9qZWN0O1xuICAgIGlmICghYnVja1Byb2plY3QpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgIH1cblxuICAgIC8vIENhY2hlIGFsaWFzZXMgZm9yIGEgcHJvamVjdCBiZWNhdXNlIGludm9raW5nIGJ1Y2sganVzdCB0byBsaXN0IGFsaWFzZXMgdGhhdCBhcmUgaGlnaGx5XG4gICAgLy8gdW5saWtlbHkgdG8gY2hhbmdlIGlzIHdhc3RlZnVsLlxuICAgIGxldCBhbGlhc2VzID0gdGhpcy5fYWxpYXNlc0J5UHJvamVjdC5nZXQoYnVja1Byb2plY3QpO1xuICAgIGlmICghYWxpYXNlcykge1xuICAgICAgYWxpYXNlcyA9IGF3YWl0IGJ1Y2tQcm9qZWN0Lmxpc3RBbGlhc2VzKCk7XG4gICAgICB0aGlzLl9hbGlhc2VzQnlQcm9qZWN0LnNldChidWNrUHJvamVjdCwgYWxpYXNlcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFsaWFzZXM7XG4gIH1cblxuICBhc3luYyBfZ2V0UmVhY3ROYXRpdmVTZXJ2ZXJDb21tYW5kKCk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0ID0gdGhpcy5fbW9zdFJlY2VudEJ1Y2tQcm9qZWN0O1xuICAgIGlmICghYnVja1Byb2plY3QpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzZXJ2ZXJDb21tYW5kID0gYXdhaXQgYnVja1Byb2plY3QuZ2V0QnVja0NvbmZpZygncmVhY3QtbmF0aXZlJywgJ3NlcnZlcicpO1xuICAgIGlmIChzZXJ2ZXJDb21tYW5kID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCByZXBvUm9vdCA9IGF3YWl0IGJ1Y2tQcm9qZWN0LmdldFBhdGgoKTtcbiAgICBpZiAocmVwb1Jvb3QgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBwYXRoLmpvaW4ocmVwb1Jvb3QsIHNlcnZlckNvbW1hbmQpO1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZVByb2plY3QoZWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbnVjbGlkZVVyaSA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKCFudWNsaWRlVXJpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBidWNrUHJvamVjdCA9IHRoaXMuX3RleHRFZGl0b3JUb0J1Y2tQcm9qZWN0LmdldChlZGl0b3IpO1xuICAgIGlmICghYnVja1Byb2plY3QpIHtcbiAgICAgIGJ1Y2tQcm9qZWN0ID0gYXdhaXQgYnVja1Byb2plY3RSb290Rm9yUGF0aChudWNsaWRlVXJpKTtcbiAgICAgIGlmICghYnVja1Byb2plY3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fdGV4dEVkaXRvclRvQnVja1Byb2plY3Quc2V0KGVkaXRvciwgYnVja1Byb2plY3QpO1xuICAgIH1cbiAgICB0aGlzLl9tb3N0UmVjZW50QnVja1Byb2plY3QgPSBidWNrUHJvamVjdDtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVCdWlsZFRhcmdldChidWlsZFRhcmdldDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYnVpbGRUYXJnZXQgPSBidWlsZFRhcmdldC50cmltKCk7XG4gICAgdGhpcy5fYnVpbGRUYXJnZXQgPSBidWlsZFRhcmdldDtcblxuICAgIHRoaXMuX2J1aWxkUnVsZVR5cGUgPSBhd2FpdCB0aGlzLl9maW5kUnVsZVR5cGUoKTtcbiAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICB0aGlzLl9pc1JlYWN0TmF0aXZlQXBwID0gYXdhaXQgdGhpcy5fZmluZElzUmVhY3ROYXRpdmVBcHAoKTtcbiAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgfVxuXG4gIGFzeW5jIF9maW5kUnVsZVR5cGUoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBidWNrUHJvamVjdCA9IHRoaXMuX21vc3RSZWNlbnRCdWNrUHJvamVjdDtcbiAgICBjb25zdCBidWlsZFRhcmdldCA9IHRoaXMuX2J1aWxkVGFyZ2V0O1xuXG4gICAgbGV0IGJ1aWxkUnVsZVR5cGUgPSAnJztcbiAgICBpZiAoYnVpbGRUYXJnZXQgJiYgYnVja1Byb2plY3QpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGJ1aWxkUnVsZVR5cGUgPSBhd2FpdCBidWNrUHJvamVjdC5idWlsZFJ1bGVUeXBlRm9yKGJ1aWxkVGFyZ2V0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gTW9zdCBsaWtlbHksIHRoaXMgaXMgYW4gaW52YWxpZCB0YXJnZXQsIHNvIGRvIG5vdGhpbmcuXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBidWlsZFJ1bGVUeXBlO1xuICB9XG5cbiAgYXN5bmMgX2ZpbmRJc1JlYWN0TmF0aXZlQXBwKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGJ1aWxkUnVsZVR5cGUgPSB0aGlzLl9idWlsZFJ1bGVUeXBlO1xuICAgIGlmIChidWlsZFJ1bGVUeXBlICE9PSAnYXBwbGVfYnVuZGxlJyAmJiBidWlsZFJ1bGVUeXBlICE9PSAnYW5kcm9pZF9iaW5hcnknKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0ID0gdGhpcy5fbW9zdFJlY2VudEJ1Y2tQcm9qZWN0O1xuICAgIGlmICghYnVja1Byb2plY3QpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCByZWFjdE5hdGl2ZVJ1bGUgPSBidWlsZFJ1bGVUeXBlID09PSAnYXBwbGVfYnVuZGxlJ1xuICAgID8gJ2lvc19yZWFjdF9uYXRpdmVfbGlicmFyeSdcbiAgICA6ICdhbmRyb2lkX3JlYWN0X25hdGl2ZV9saWJyYXJ5JztcblxuICAgIGNvbnN0IGJ1aWxkVGFyZ2V0ID0gdGhpcy5fYnVpbGRUYXJnZXQ7XG4gICAgY29uc3QgbWF0Y2hlcyA9IGF3YWl0IGJ1Y2tQcm9qZWN0LnF1ZXJ5V2l0aEFyZ3MoXG4gICAgICBga2luZCgnJHtyZWFjdE5hdGl2ZVJ1bGV9JywgZGVwcygnJXMnKSlgLFxuICAgICAgW2J1aWxkVGFyZ2V0XSxcbiAgICApO1xuICAgIHJldHVybiBtYXRjaGVzW2J1aWxkVGFyZ2V0XS5sZW5ndGggPiAwO1xuICB9XG5cbiAgYXN5bmMgX2RvRGVidWcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gVE9ETyhuYXR0aHUpOiBSZXN0b3JlIHZhbGlkYXRpb24gbG9naWMgdG8gbWFrZSBzdXJlIHRoZSB0YXJnZXQgaXMgaW5zdGFsbGFibGUuXG4gICAgLy8gRm9yIG5vdywgbGV0J3MgbGVhdmUgdGhhdCB0byBCdWNrLlxuXG4gICAgLy8gU3RvcCBhbnkgZXhpc3RpbmcgZGVidWdnaW5nIHNlc3Npb25zLCBhcyBpbnN0YWxsIGhhbmdzIGlmIGFuIGV4aXN0aW5nXG4gICAgLy8gYXBwIHRoYXQncyBiZWluZyBvdmVyd3JpdHRlbiBpcyBiZWluZyBkZWJ1Z2dlZC5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnN0b3AtZGVidWdnaW5nJyk7XG5cbiAgICBjb25zdCBpbnN0YWxsUmVzdWx0ID0gYXdhaXQgdGhpcy5fZG9CdWlsZCh0cnVlLCB0cnVlKTtcbiAgICBpZiAoIWluc3RhbGxSZXN1bHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge2J1Y2tQcm9qZWN0LCBwaWR9ID0gaW5zdGFsbFJlc3VsdDtcblxuICAgIGlmIChwaWQpIHtcbiAgICAgIC8vIFVzZSBjb21tYW5kcyBoZXJlIHRvIHRyaWdnZXIgcGFja2FnZSBhY3RpdmF0aW9uLlxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnbnVjbGlkZS1kZWJ1Z2dlcjpzaG93Jyk7XG4gICAgICBjb25zdCBkZWJ1Z2dlclNlcnZpY2UgPSBhd2FpdCByZXF1aXJlKCcuLi8uLi8uLi9zZXJ2aWNlLWh1Yi1wbHVzJylcbiAgICAgICAgICAuY29uc3VtZUZpcnN0UHJvdmlkZXIoJ251Y2xpZGUtZGVidWdnZXIucmVtb3RlJyk7XG4gICAgICBjb25zdCBidWNrUHJvamVjdFBhdGggPSBhd2FpdCBidWNrUHJvamVjdC5nZXRQYXRoKCk7XG4gICAgICBkZWJ1Z2dlclNlcnZpY2UuZGVidWdMTERCKHBpZCwgYnVja1Byb2plY3RQYXRoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfZG9CdWlsZChcbiAgICBydW46IGJvb2xlYW4sXG4gICAgZGVidWc6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8P3tidWNrUHJvamVjdDogQnVja1Byb2plY3QsIGJ1aWxkVGFyZ2V0OiBzdHJpbmcsIHBpZDogP251bWJlcn0+IHtcbiAgICBjb25zdCBidWlsZFRhcmdldCA9IHRoaXMuX2J1aWxkVGFyZ2V0O1xuICAgIGNvbnN0IHNpbXVsYXRvciA9IHRoaXMuX3NpbXVsYXRvcjtcbiAgICBjb25zdCBidWNrUHJvamVjdCA9IHRoaXMuX21vc3RSZWNlbnRCdWNrUHJvamVjdDtcbiAgICBpZiAoIXRoaXMuX2J1aWxkVGFyZ2V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghYnVja1Byb2plY3QpIHtcbiAgICAgIHRoaXMuX25vdGlmeUVycm9yKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGFwcEFyZ3MgPSBbXTtcbiAgICBpZiAocnVuICYmIHRoaXMuaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGUoKSkge1xuICAgICAgY29uc3Qgc2VydmVyQ29tbWFuZCA9IGF3YWl0IHRoaXMuX2dldFJlYWN0TmF0aXZlU2VydmVyQ29tbWFuZCgpO1xuICAgICAgaWYgKHNlcnZlckNvbW1hbmQpIHtcbiAgICAgICAgdGhpcy5fcmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zLnN0YXJ0U2VydmVyKHNlcnZlckNvbW1hbmQpO1xuICAgICAgICBhcHBBcmdzID0gUkVBQ1RfTkFUSVZFX0FQUF9GTEFHUztcbiAgICAgICAgdGhpcy5fcmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zLnN0YXJ0Tm9kZUV4ZWN1dG9yU2VydmVyKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgY29tbWFuZCA9IGBidWNrICR7cnVuID8gJ2luc3RhbGwnIDogJ2J1aWxkJ30gJHtidWlsZFRhcmdldH1gO1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKGAke2NvbW1hbmR9IHN0YXJ0ZWQuYCk7XG4gICAgY29uc3Qgd3MgPSBhd2FpdCB0aGlzLl9zZXR1cFdlYlNvY2tldChidWNrUHJvamVjdCwgYnVpbGRUYXJnZXQpO1xuXG4gICAgdGhpcy5fYnVpbGRQcm9ncmVzcyA9IDA7XG4gICAgdGhpcy5faXNCdWlsZGluZyA9IHRydWU7XG4gICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG5cbiAgICBjb25zdCB7cGlkfSA9IGF3YWl0IHRoaXMuX3J1bkJ1Y2tDb21tYW5kSW5OZXdQYW5lKFxuICAgICAgICB7YnVja1Byb2plY3QsIGJ1aWxkVGFyZ2V0LCBzaW11bGF0b3IsIHJ1biwgZGVidWcsIGNvbW1hbmQsIGFwcEFyZ3N9KTtcblxuICAgIHRoaXMuX2lzQnVpbGRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICBpZiAod3MpIHtcbiAgICAgIHdzLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtidWNrUHJvamVjdCwgYnVpbGRUYXJnZXQsIHBpZH07XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiBBbiBPYmplY3Qgd2l0aCBzb21lIGRldGFpbHMgYWJvdXQgdGhlIG91dHB1dCBvZiB0aGUgY29tbWFuZDpcbiAgICogICBwaWQ6IFRoZSBwcm9jZXNzIGlkIG9mIHRoZSBydW5uaW5nIGFwcCwgaWYgJ3J1bicgd2FzIHRydWUuXG4gICAqL1xuICBhc3luYyBfcnVuQnVja0NvbW1hbmRJbk5ld1BhbmUoYnVja1BhcmFtczoge1xuICAgIGJ1Y2tQcm9qZWN0OiBCdWNrUHJvamVjdCxcbiAgICBidWlsZFRhcmdldDogc3RyaW5nLFxuICAgIHNpbXVsYXRvcjogP3N0cmluZyxcbiAgICBydW46IGJvb2xlYW4sXG4gICAgZGVidWc6IGJvb2xlYW4sXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIGFwcEFyZ3M6IEFycmF5PHN0cmluZz4sXG4gIH0pOiBQcm9taXNlPEJ1Y2tSdW5EZXRhaWxzPiB7XG4gICAgY29uc3Qge2J1Y2tQcm9qZWN0LCBidWlsZFRhcmdldCwgc2ltdWxhdG9yLCBydW4sIGRlYnVnLCBjb21tYW5kLCBhcHBBcmdzfSA9IGJ1Y2tQYXJhbXM7XG5cbiAgICBjb25zdCBnZXRSdW5Db21tYW5kSW5OZXdQYW5lID0gcmVxdWlyZSgnLi4vLi4vLi4vcHJvY2Vzcy9vdXRwdXQnKTtcbiAgICBjb25zdCB7cnVuQ29tbWFuZEluTmV3UGFuZSwgZGlzcG9zYWJsZX0gPSBnZXRSdW5Db21tYW5kSW5OZXdQYW5lKCk7XG5cbiAgICBjb25zdCBydW5Qcm9jZXNzV2l0aEhhbmRsZXJzID0gYXN5bmMgKGRhdGFIYW5kbGVyT3B0aW9uczogUHJvY2Vzc091dHB1dERhdGFIYW5kbGVycykgPT4ge1xuICAgICAgY29uc3Qge3N0ZG91dCwgc3RkZXJyLCBlcnJvciwgZXhpdH0gPSBkYXRhSGFuZGxlck9wdGlvbnM7XG4gICAgICBsZXQgb2JzZXJ2YWJsZTtcbiAgICAgIGludmFyaWFudChidWNrUHJvamVjdCk7XG4gICAgICBpZiAocnVuKSB7XG4gICAgICAgIG9ic2VydmFibGUgPSBhd2FpdCBidWNrUHJvamVjdC5pbnN0YWxsV2l0aE91dHB1dChcbiAgICAgICAgICAgIFtidWlsZFRhcmdldF0sIHNpbXVsYXRvciwge3J1biwgZGVidWcsIGFwcEFyZ3N9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9ic2VydmFibGUgPSBhd2FpdCBidWNrUHJvamVjdC5idWlsZFdpdGhPdXRwdXQoW2J1aWxkVGFyZ2V0XSk7XG4gICAgICB9XG4gICAgICBjb25zdCBvbk5leHQgPSAoZGF0YToge3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nfSkgPT4ge1xuICAgICAgICBpZiAoZGF0YS5zdGRvdXQpIHtcbiAgICAgICAgICBzdGRvdXQoZGF0YS5zdGRvdXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ZGVycihkYXRhLnN0ZGVyciB8fCAnJyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjb25zdCBvbkVycm9yID0gKGRhdGE6IHN0cmluZykgPT4ge1xuICAgICAgICBlcnJvcihuZXcgRXJyb3IoZGF0YSkpO1xuICAgICAgICBleGl0KDEpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYCR7YnVpbGRUYXJnZXR9IGZhaWxlZCB0byBidWlsZC5gKTtcbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICB9O1xuICAgICAgY29uc3Qgb25FeGl0ID0gKCkgPT4ge1xuICAgICAgICAvLyBvbkV4aXQgd2lsbCBvbmx5IGJlIGNhbGxlZCBpZiB0aGUgcHJvY2VzcyBjb21wbGV0ZXMgc3VjY2Vzc2Z1bGx5LFxuICAgICAgICAvLyBpLmUuIHdpdGggZXhpdCBjb2RlIDAuIFVuZm9ydHVuYXRlbHkgYW4gT2JzZXJ2YWJsZSBjYW5ub3QgcGFzcyBhblxuICAgICAgICAvLyBhcmd1bWVudCAoZS5nLiBhbiBleGl0IGNvZGUpIG9uIGNvbXBsZXRpb24uXG4gICAgICAgIGV4aXQoMCk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKGAke2NvbW1hbmR9IHN1Y2NlZWRlZC5gKTtcbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICB9O1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gb2JzZXJ2YWJsZS5zdWJzY3JpYmUob25OZXh0LCBvbkVycm9yLCBvbkV4aXQpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBraWxsKCkge1xuICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH07XG5cbiAgICBjb25zdCBidWNrUnVuUHJvbWlzZTogUHJvbWlzZTxCdWNrUnVuRGV0YWlscz4gPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB7UHJvY2Vzc091dHB1dFN0b3JlfSA9IHJlcXVpcmUoJy4uLy4uLy4uL3Byb2Nlc3Mvb3V0cHV0LXN0b3JlJyk7XG4gICAgICBjb25zdCBwcm9jZXNzT3V0cHV0U3RvcmUgPSBuZXcgUHJvY2Vzc091dHB1dFN0b3JlKHJ1blByb2Nlc3NXaXRoSGFuZGxlcnMpO1xuICAgICAgY29uc3Qge2hhbmRsZUJ1Y2tBbnNpT3V0cHV0fSA9IHJlcXVpcmUoJy4uLy4uLy4uL3Byb2Nlc3Mvb3V0cHV0LWhhbmRsZXInKTtcblxuICAgICAgdGhpcy5fYnVja1Byb2Nlc3NPdXRwdXRTdG9yZSA9IHByb2Nlc3NPdXRwdXRTdG9yZTtcbiAgICAgIGNvbnN0IGV4aXRTdWJzY3JpcHRpb24gPSBwcm9jZXNzT3V0cHV0U3RvcmUub25Qcm9jZXNzRXhpdCgoZXhpdENvZGU6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoZXhpdENvZGUgPT09IDAgJiYgcnVuKSB7XG4gICAgICAgICAgLy8gR2V0IHRoZSBwcm9jZXNzIElELlxuICAgICAgICAgIGNvbnN0IGFsbEJ1aWxkT3V0cHV0ID0gcHJvY2Vzc091dHB1dFN0b3JlLmdldFN0ZG91dCgpIHx8ICcnO1xuICAgICAgICAgIGNvbnN0IHBpZE1hdGNoID0gYWxsQnVpbGRPdXRwdXQubWF0Y2goQlVDS19QUk9DRVNTX0lEX1JFR0VYKTtcbiAgICAgICAgICBpZiAocGlkTWF0Y2gpIHtcbiAgICAgICAgICAgIC8vIEluZGV4IDEgaXMgdGhlIGNhcHR1cmVkIHBpZC5cbiAgICAgICAgICAgIHJlc29sdmUoe3BpZDogcGFyc2VJbnQocGlkTWF0Y2hbMV0sIDEwKX0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKHt9KTtcbiAgICAgICAgfVxuICAgICAgICBleGl0U3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5fYnVja1Byb2Nlc3NPdXRwdXRTdG9yZSA9IG51bGw7XG4gICAgICB9KTtcblxuICAgICAgcnVuQ29tbWFuZEluTmV3UGFuZSh7XG4gICAgICAgIHRhYlRpdGxlOiAnYnVjaycsXG4gICAgICAgIHByb2Nlc3NPdXRwdXRTdG9yZSxcbiAgICAgICAgcHJvY2Vzc091dHB1dEhhbmRsZXI6IGhhbmRsZUJ1Y2tBbnNpT3V0cHV0LFxuICAgICAgICBkZXN0cm95RXhpc3RpbmdQYW5lOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYXdhaXQgYnVja1J1blByb21pc2U7XG4gIH1cblxuICBhc3luYyBfc2V0dXBXZWJTb2NrZXQoYnVja1Byb2plY3Q6IEJ1Y2tQcm9qZWN0LCBidWlsZFRhcmdldDogc3RyaW5nKTogUHJvbWlzZTw/V2ViU29ja2V0PiB7XG4gICAgY29uc3QgaHR0cFBvcnQgPSBhd2FpdCBidWNrUHJvamVjdC5nZXRTZXJ2ZXJQb3J0KCk7XG4gICAgaWYgKGh0dHBQb3J0IDw9IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHVyaSA9IGB3czovL2xvY2FsaG9zdDoke2h0dHBQb3J0fS93cy9idWlsZGA7XG4gICAgY29uc3Qgd3MgPSBuZXcgV2ViU29ja2V0KHVyaSk7XG4gICAgbGV0IGJ1aWxkSWQ6ID9zdHJpbmcgPSBudWxsO1xuICAgIGxldCBpc0ZpbmlzaGVkID0gZmFsc2U7XG5cbiAgICB3cy5vbm1lc3NhZ2UgPSAoZSkgPT4ge1xuICAgICAgbGV0IG1lc3NhZ2U7XG4gICAgICB0cnkge1xuICAgICAgICBtZXNzYWdlID0gSlNPTi5wYXJzZShlLmRhdGEpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGdldExvZ2dlcigpLmVycm9yKFxuICAgICAgICAgICAgYEJ1Y2sgd2FzIGxpa2VseSBraWxsZWQgd2hpbGUgYnVpbGRpbmcgJHtidWlsZFRhcmdldH0uYCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHR5cGUgPSBtZXNzYWdlWyd0eXBlJ107XG4gICAgICBpZiAoYnVpbGRJZCA9PT0gbnVsbCkge1xuICAgICAgICBpZiAodHlwZSA9PT0gJ0J1aWxkU3RhcnRlZCcpIHtcbiAgICAgICAgICBidWlsZElkID0gbWVzc2FnZVsnYnVpbGRJZCddO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoYnVpbGRJZCAhPT0gbWVzc2FnZVsnYnVpbGRJZCddKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUgPT09ICdCdWlsZFByb2dyZXNzVXBkYXRlZCcgfHwgdHlwZSA9PT0gJ1BhcnNpbmdQcm9ncmVzc1VwZGF0ZWQnKSB7XG4gICAgICAgIHRoaXMuX2J1aWxkUHJvZ3Jlc3MgPSBtZXNzYWdlLnByb2dyZXNzVmFsdWU7XG4gICAgICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnQnVpbGRGaW5pc2hlZCcpIHtcbiAgICAgICAgdGhpcy5fYnVpbGRQcm9ncmVzcyA9IDEuMDtcbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgICAgIGlzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgICB3cy5jbG9zZSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB3cy5vbmNsb3NlID0gKCkgPT4ge1xuICAgICAgaWYgKCFpc0ZpbmlzaGVkKSB7XG4gICAgICAgIGdldExvZ2dlcigpLmVycm9yKFxuICAgICAgICAgICAgYFdlYlNvY2tldCBjbG9zZWQgYmVmb3JlICR7YnVpbGRUYXJnZXR9IGZpbmlzaGVkIGJ1aWxkaW5nLmApO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIHdzO1xuICB9XG5cbiAgX25vdGlmeUVycm9yKCkge1xuICAgIGNvbnN0IGFjdGl2ZUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoIWFjdGl2ZUVkaXRvcikge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICAgYENvdWxkIG5vdCBidWlsZDogbXVzdCBuYXZpZ2F0ZSB0byBhIGZpbGUgdGhhdCBpcyBwYXJ0IG9mIGEgQnVjayBwcm9qZWN0LmApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVOYW1lID0gYWN0aXZlRWRpdG9yLmdldFBhdGgoKTtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgYENvdWxkIG5vdCBidWlsZDogZmlsZSAnJHtmaWxlTmFtZX0nIGlzIG5vdCBwYXJ0IG9mIGEgQnVjayBwcm9qZWN0LmApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnVja1Rvb2xiYXJTdG9yZTtcbiJdfQ==