'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BuckBuildSystem = undefined;

var _PlatformService;

function _load_PlatformService() {
  return _PlatformService = require('./PlatformService');
}

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('../../commons-node/redux-observable');
}

var _observable;

function _load_observable() {
  return _observable = require('../../commons-node/observable');
}

var _tasks;

function _load_tasks() {
  return _tasks = require('../../commons-node/tasks');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('../../nuclide-ui/Icon');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./redux/Actions'));
}

var _Epics;

function _load_Epics() {
  return _Epics = _interopRequireWildcard(require('./redux/Epics'));
}

var _Reducers;

function _load_Reducers() {
  return _Reducers = _interopRequireDefault(require('./redux/Reducers'));
}

var _BuckToolbar;

function _load_BuckToolbar() {
  return _BuckToolbar = _interopRequireDefault(require('./BuckToolbar'));
}

var _BuckEventStream;

function _load_BuckEventStream() {
  return _BuckEventStream = require('./BuckEventStream');
}

var _DeployEventStream;

function _load_DeployEventStream() {
  return _DeployEventStream = require('./DeployEventStream');
}

var _observeBuildCommands;

function _load_observeBuildCommands() {
  return _observeBuildCommands = _interopRequireDefault(require('./observeBuildCommands'));
}

var _react = _interopRequireDefault(require('react'));

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SOCKET_TIMEOUT = 30000; /**
                               * Copyright (c) 2015-present, Facebook, Inc.
                               * All rights reserved.
                               *
                               * This source code is licensed under the license found in the LICENSE file in
                               * the root directory of this source tree.
                               *
                               * 
                               */

function shouldEnableTask(taskType, ruleType) {
  switch (taskType) {
    case 'run':
      return ruleType.endsWith('binary');
    case 'debug':
      return ruleType.endsWith('binary') || ruleType.endsWith('test');
    default:
      return true;
  }
}

class BuckBuildSystem {

  constructor(initialState) {
    this.id = 'buck';
    this.name = 'Buck';
    this._serializedState = initialState;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._outputMessages = new _rxjsBundlesRxMinJs.Subject();
    this._diagnosticUpdates = new _rxjsBundlesRxMinJs.Subject();
    this._diagnosticInvalidations = new _rxjsBundlesRxMinJs.Subject();
    this._disposables.add(this._outputMessages);
    this._platformService = new (_PlatformService || _load_PlatformService()).PlatformService();
  }

  getExtraUi() {
    if (this._extraUi == null) {
      const store = this._getStore();
      const boundActions = {
        setBuildTarget: buildTarget => store.dispatch((_Actions || _load_Actions()).setBuildTarget(buildTarget)),
        setDeploymentTarget: deploymentTarget => store.dispatch((_Actions || _load_Actions()).setDeploymentTarget(deploymentTarget)),
        setTaskSettings: settings => store.dispatch((_Actions || _load_Actions()).setTaskSettings(settings))
      };
      this._extraUi = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(
      // $FlowFixMe: type symbol-observable
      _rxjsBundlesRxMinJs.Observable.from(store).map(appState => Object.assign({ appState }, boundActions)), (_BuckToolbar || _load_BuckToolbar()).default);
    }
    return this._extraUi;
  }

  getIcon() {
    return () => _react.default.createElement((_Icon || _load_Icon()).Icon, { icon: 'nuclicon-buck', className: 'nuclide-buck-task-runner-icon' });
  }

  getOutputMessages() {
    return this._outputMessages;
  }

  getDiagnosticProvider() {
    return {
      updates: this._diagnosticUpdates,
      invalidations: this._diagnosticInvalidations
    };
  }

  getPlatformService() {
    return this._platformService;
  }

  setProjectRoot(projectRoot, callback) {
    const path = projectRoot == null ? null : projectRoot.getPath();

    // $FlowFixMe: type symbol-observable
    const storeReady = _rxjsBundlesRxMinJs.Observable.from(this._getStore()).distinctUntilChanged().filter(state => !state.isLoadingBuckProject && state.projectRoot === path).share();

    const enabledObservable = storeReady.map(state => state.buckRoot != null).distinctUntilChanged();

    const tasksObservable = storeReady.map(state => {
      const { buildRuleType, selectedDeploymentTarget } = state;
      const tasksFromPlatform = selectedDeploymentTarget ? selectedDeploymentTarget.platform.tasksForDevice(selectedDeploymentTarget.device) : null;
      return TASKS.map(task => {
        let disabled = state.isLoadingPlatforms || buildRuleType == null;
        if (!disabled) {
          if (tasksFromPlatform) {
            disabled = !tasksFromPlatform.has(task.type);
          } else {
            if (!buildRuleType) {
              throw new Error('Invariant violation: "buildRuleType"');
            }
            // No platform provider selected, fall back to default logic


            disabled = !shouldEnableTask(task.type, buildRuleType.type);
          }
        }
        return Object.assign({}, task, { disabled });
      });
    }).distinctUntilChanged((a, b) => (0, (_collection || _load_collection()).arrayEqual)(a, b, (_shallowequal || _load_shallowequal()).default));

    const subscription = _rxjsBundlesRxMinJs.Observable.combineLatest(enabledObservable, tasksObservable).subscribe(([enabled, tasks]) => callback(enabled, tasks));

    this._getStore().dispatch((_Actions || _load_Actions()).setProjectRoot(path));

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(subscription);
  }

  _logOutput(text, level) {
    this._outputMessages.next({ text, level });
  }

  _getStore() {
    if (this._store == null) {
      if (!(this._serializedState != null)) {
        throw new Error('Invariant violation: "this._serializedState != null"');
      }

      const initialState = {
        platformGroups: [],
        platformService: this._platformService,
        projectRoot: null,
        buckRoot: null,
        isLoadingBuckProject: false,
        isLoadingRule: false,
        isLoadingPlatforms: false,
        buildTarget: this._serializedState.buildTarget || '',
        buildRuleType: null,
        selectedDeploymentTarget: null,
        taskSettings: this._serializedState.taskSettings || {},
        platformProviderUi: null,
        lastSessionPlatformName: this._serializedState.selectedPlatformName,
        lastSessionDeviceName: this._serializedState.selectedDeviceName
      };
      const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
      const rootEpic = (actions, store) => (0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics)(actions, store)
      // Log errors and continue.
      .catch((err, stream) => {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(err);
        return stream;
      });
      this._store = (0, (_redux || _load_redux()).createStore)((_Reducers || _load_Reducers()).default, initialState, (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)(rootEpic)));
      this._disposables.add((0, (_observeBuildCommands || _load_observeBuildCommands()).default)(this._store));
    }
    return this._store;
  }

  runTask(taskType) {
    if (!(taskType === 'build' || taskType === 'test' || taskType === 'run' || taskType === 'debug')) {
      throw new Error('Invalid task type');
    }

    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:toggle', { visible: true });

    const state = this._getStore().getState();
    const {
      buckRoot,
      buildRuleType,
      buildTarget,
      selectedDeploymentTarget
    } = state;

    if (!buckRoot) {
      throw new Error('Invariant violation: "buckRoot"');
    }

    if (!buildRuleType) {
      throw new Error('Invariant violation: "buildRuleType"');
    }

    const deploymentString = formatDeploymentTarget(selectedDeploymentTarget);
    this._logOutput(`Resolving ${taskType} command for "${buildTarget}"${deploymentString}`, 'log');

    const capitalizedTaskType = taskType.slice(0, 1).toUpperCase() + taskType.slice(1);
    const task = (0, (_tasks || _load_tasks()).taskFromObservable)(_rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.defer(() => {
      if (selectedDeploymentTarget) {
        const { platform, device } = selectedDeploymentTarget;
        return platform.runTask(this, taskType, buildRuleType.buildTarget, device);
      } else {
        const subcommand = taskType === 'debug' ? 'build' : taskType;
        return this.runSubcommand(subcommand, buildRuleType.buildTarget, { buildArguments: [] }, taskType === 'debug', null);
      }
    }), _rxjsBundlesRxMinJs.Observable.defer(() => {
      this._logOutput(`${capitalizedTaskType} succeeded.`, 'success');
      return _rxjsBundlesRxMinJs.Observable.empty();
    })));

    return Object.assign({}, task, {
      cancel: () => {
        this._logOutput(`${capitalizedTaskType} stopped.`, 'warning');
        task.cancel();
      },
      getTrackingData: () => ({
        buckRoot,
        buildTarget,
        taskSettings: state.taskSettings
      })
    });
  }

  /**
   * Builds the specified target and notifies the caller of the artifact. This isn't part of the
   * TaskRunner API.
   */
  buildArtifact(opts) {
    const { root, target, args } = opts;
    let pathToArtifact = null;
    const buckService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(root);
    const targetString = getCommandStringForResolvedBuildTarget(target);

    const task = (0, (_tasks || _load_tasks()).taskFromObservable)(_rxjsBundlesRxMinJs.Observable.concat(this.runSubcommand('build', target, { buildArguments: args }, false, null),
    // Don't complete until we've determined the artifact path.
    _rxjsBundlesRxMinJs.Observable.defer(() => buckService.showOutput(root, targetString, args)).do(output => {
      let outputPath;
      if (output == null || output[0] == null || output[0]['buck.outputPath'] == null || (outputPath = output[0]['buck.outputPath'].trim()) === '') {
        throw new Error("Couldn't determine binary path from Buck output!");
      }

      if (!(outputPath != null)) {
        throw new Error('Invariant violation: "outputPath != null"');
      }

      pathToArtifact = (_nuclideUri || _load_nuclideUri()).default.join(root, outputPath);
    }).ignoreElements()));
    return Object.assign({}, task, {
      getPathToBuildArtifact() {
        if (pathToArtifact == null) {
          throw new Error('No build artifact!');
        }
        return pathToArtifact;
      }
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize() {
    // If we haven't had to load and create the Flux stuff yet, don't do it now.
    if (this._store == null) {
      return;
    }
    const state = this._store.getState();
    const { buildTarget, taskSettings, selectedDeploymentTarget } = state;
    let selectedPlatformName;
    let selectedDeviceName;
    if (selectedDeploymentTarget) {
      selectedPlatformName = selectedDeploymentTarget.platform.name;
      selectedDeviceName = selectedDeploymentTarget.device ? selectedDeploymentTarget.device.name : null;
    } else {
      // In case the user quits before the session is restored, forward the session restoration.
      selectedPlatformName = state.lastSessionPlatformName;
      selectedDeviceName = state.lastSessionDeviceName;
    }

    return {
      buildTarget,
      taskSettings,
      selectedPlatformName,
      selectedDeviceName
    };
  }

  runSubcommand(subcommand, buildTarget, additionalSettings, isDebug, udid) {
    // Clear Buck diagnostics every time we run build.
    this._diagnosticInvalidations.next({ scope: 'all' });
    const { buckRoot, taskSettings } = this._getStore().getState();

    if (buckRoot == null || buildTarget == null) {
      // All tasks should have been disabled.
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    const targetString = getCommandStringForResolvedBuildTarget(buildTarget);
    const buildArguments = (taskSettings.buildArguments || []).concat(additionalSettings.buildArguments || []);
    const runArguments = (taskSettings.runArguments || []).concat(additionalSettings.runArguments || []);

    const buckService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(buckRoot);

    return _rxjsBundlesRxMinJs.Observable.fromPromise(buckService.getHTTPServerPort(buckRoot)).catch(err => {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn(`Failed to get httpPort for ${targetString}`, err);
      return _rxjsBundlesRxMinJs.Observable.of(-1);
    }).switchMap(httpPort => {
      let socketEvents = null;
      if (httpPort > 0) {
        socketEvents = (0, (_BuckEventStream || _load_BuckEventStream()).getEventsFromSocket)(buckService.getWebSocketStream(buckRoot, httpPort).refCount()).share();
      } else {
        this._logOutput('For better logs, set httpserver.port in your Buck config and restart Nuclide.', 'info');
      }

      const args = runArguments.length > 0 && (subcommand === 'run' || subcommand === 'install') ? buildArguments.concat(['--']).concat(runArguments) : buildArguments;

      const processMessages = runBuckCommand(buckService, buckRoot, targetString, subcommand, args, isDebug, udid).share();
      const processEvents = (0, (_BuckEventStream || _load_BuckEventStream()).getEventsFromProcess)(processMessages).share();

      let mergedEvents;
      if (socketEvents == null) {
        // Without a websocket, just pipe the Buck output directly.
        mergedEvents = processEvents;
      } else {
        mergedEvents = (0, (_BuckEventStream || _load_BuckEventStream()).combineEventStreams)(subcommand, socketEvents, processEvents).share();
      }

      return _rxjsBundlesRxMinJs.Observable.concat(
      // Wait until the socket starts up before triggering the Buck process.
      socketEvents == null ? _rxjsBundlesRxMinJs.Observable.empty() : socketEvents.filter(event => event.type === 'socket-connected').take(1).timeout(SOCKET_TIMEOUT).catch(err => {
        if (err instanceof _rxjsBundlesRxMinJs.TimeoutError) {
          throw Error('Timed out connecting to Buck server.');
        }
        throw err;
      }).ignoreElements(), this._consumeEventStream(_rxjsBundlesRxMinJs.Observable.merge(mergedEvents, (_featureConfig || _load_featureConfig()).default.get('nuclide-buck.compileErrorDiagnostics') ? (0, (_BuckEventStream || _load_BuckEventStream()).getDiagnosticEvents)(mergedEvents, buckRoot) : _rxjsBundlesRxMinJs.Observable.empty(), isDebug && subcommand === 'install' ? (0, (_DeployEventStream || _load_DeployEventStream()).getDeployInstallEvents)(processMessages, buckRoot) : _rxjsBundlesRxMinJs.Observable.empty(), isDebug && subcommand === 'build' ? (0, (_DeployEventStream || _load_DeployEventStream()).getDeployBuildEvents)(processMessages, buckService, buckRoot, targetString, runArguments) : _rxjsBundlesRxMinJs.Observable.empty(), isDebug && subcommand === 'test' ? (0, (_DeployEventStream || _load_DeployEventStream()).getDeployTestEvents)(processMessages, buckRoot) : _rxjsBundlesRxMinJs.Observable.empty())));
    }).share();
  }

  /**
   * Processes side effects (console output and diagnostics).
   * Returns only the progress events.
   */
  _consumeEventStream(events) {
    // TODO: the Diagnostics API does not allow emitting one message at a time.
    // We have to accumulate messages per-file and emit them all.
    const fileDiagnostics = new Map();
    // Save error messages until the end so diagnostics have a chance to finish.
    // Real exceptions will not be handled by this, of course.
    let errorMessage = null;
    return (0, (_observable || _load_observable()).compact)(events.do({
      next: event => {
        // Side effects: emit console output and diagnostics
        if (event.type === 'log') {
          this._logOutput(event.message, event.level);
        } else if (event.type === 'diagnostics') {
          const { diagnostics } = event;
          // Update only the files that changed in this message.
          // Since emitting messages for a file invalidates it, we have to
          // be careful to emit all previous messages for it as well.
          const changedFiles = new Map();
          diagnostics.forEach(diagnostic => {
            let messages = fileDiagnostics.get(diagnostic.filePath);
            if (messages == null) {
              messages = [];
              fileDiagnostics.set(diagnostic.filePath, messages);
            }
            messages.push(diagnostic);
            changedFiles.set(diagnostic.filePath, messages);
          });
          this._diagnosticUpdates.next({ filePathToMessages: changedFiles });
        } else if (event.type === 'error') {
          errorMessage = event.message;
        }
      },
      complete: () => {
        if (errorMessage != null) {
          throw Error(errorMessage);
        }
      }
    })
    // Let progress events flow through to the task runner.
    .map(event => {
      return event.type === 'progress' ? event : null;
    }).finally(() => {
      if (fileDiagnostics.size > 0) {
        this._logOutput('Compilation errors detected: open the Diagnostics pane to jump to them.', 'info');
      }
    }));
  }
}

exports.BuckBuildSystem = BuckBuildSystem;
const TASKS = [{
  type: 'build',
  label: 'Build',
  description: 'Build the specified Buck target',
  icon: 'tools'
}, {
  type: 'run',
  label: 'Run',
  description: 'Run the specfied Buck target',
  icon: 'triangle-right'
}, {
  type: 'test',
  label: 'Test',
  description: 'Test the specfied Buck target',
  icon: 'check'
}, {
  type: 'debug',
  label: 'Debug',
  description: 'Debug the specfied Buck target',
  icon: 'nuclicon-debugger'
}];

function runBuckCommand(buckService, buckRoot, buildTarget, subcommand, args, debug, simulator) {
  if (debug) {
    // Stop any existing debugging sessions, as install hangs if an existing
    // app that's being overwritten is being debugged.
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:stop-debugging');
  }

  if (subcommand === 'install') {
    return buckService.installWithOutput(buckRoot, splitTargets(buildTarget), args, simulator, true, debug).refCount();
  } else if (subcommand === 'build') {
    return buckService.buildWithOutput(buckRoot, splitTargets(buildTarget), args).refCount();
  } else if (subcommand === 'test') {
    return buckService.testWithOutput(buckRoot, splitTargets(buildTarget), args, debug).refCount();
  } else if (subcommand === 'run') {
    return buckService.runWithOutput(buckRoot, splitTargets(buildTarget), args).refCount();
  } else {
    throw Error(`Unknown subcommand: ${subcommand}`);
  }
}

function getCommandStringForResolvedBuildTarget(target) {
  const { qualifiedName, flavors } = target;
  const separator = flavors.length > 0 ? '#' : '';
  return `${qualifiedName}${separator}${flavors.join(',')}`;
}

function formatDeploymentTarget(deploymentTarget) {
  if (!deploymentTarget) {
    return '';
  }
  const { device, platform } = deploymentTarget;
  const deviceString = device ? `: ${device.name}` : '';
  return ` on "${platform.name}${deviceString}"`;
}

function splitTargets(buildTarget) {
  return buildTarget.trim().split(/\s+/);
}