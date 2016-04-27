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