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

var _shellQuote;

function _load_shellQuote() {
  return _shellQuote = require('shell-quote');
}

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

var _LLDBEventStream;

function _load_LLDBEventStream() {
  return _LLDBEventStream = require('./LLDBEventStream');
}

var _observeBuildCommands;

function _load_observeBuildCommands() {
  return _observeBuildCommands = _interopRequireDefault(require('./observeBuildCommands'));
}

var _reactForAtom = require('react-for-atom');

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

const INSTALLABLE_RULES = new Set(['apple_bundle', 'apk_genrule']);

const DEBUGGABLE_RULES = new Set([
// $FlowFixMe: spreadable sets
...INSTALLABLE_RULES, 'cxx_binary', 'cxx_test']);

function isInstallableRule(ruleType) {
  return INSTALLABLE_RULES.has(ruleType);
}

function isDebuggableRule(ruleType) {
  return DEBUGGABLE_RULES.has(ruleType);
}

function shouldEnableTask(taskType, ruleType) {
  switch (taskType) {
    case 'run':
      return ruleType != null && isInstallableRule(ruleType);
    case 'debug':
      return ruleType != null && isDebuggableRule(ruleType);
    default:
      return true;
  }
}

function getSubcommand(taskType, isInstallable) {
  switch (taskType) {
    case 'run':
      return 'install';
    case 'debug':
      // For mobile builds, install the build on the device.
      // Otherwise, run a regular build and invoke the debugger on the output.
      return isInstallable ? 'install' : 'build';
    default:
      return taskType;
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

  getTaskList() {
    const { buckRoot, buildTarget, buildRuleType } = this._getStore().getState();
    return TASKS.map(task => Object.assign({}, task, {
      disabled: buckRoot == null,
      runnable: buckRoot != null && Boolean(buildTarget) && shouldEnableTask(task.type, buildRuleType)
    }));
  }

  observeTaskList(cb) {
    if (this._tasks == null) {
      // $FlowFixMe: type symbol-observable
      this._tasks = _rxjsBundlesRxMinJs.Observable.from(this._getStore())
      // Wait until we're done loading the buck project.
      .filter(state => !state.isLoadingBuckProject).map(() => this.getTaskList());
    }
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._tasks.subscribe({ next: cb }));
  }

  getExtraUi() {
    if (this._extraUi == null) {
      const store = this._getStore();
      const boundActions = {
        setBuildTarget: buildTarget => store.dispatch((_Actions || _load_Actions()).setBuildTarget(buildTarget)),
        setDeploymentTarget: deploymentTarget => store.dispatch((_Actions || _load_Actions()).setDeploymentTarget(deploymentTarget)),
        setTaskSettings: (taskType, settings) => store.dispatch((_Actions || _load_Actions()).setTaskSettings(taskType, settings))
      };
      this._extraUi = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(
      // $FlowFixMe: type symbol-observable
      _rxjsBundlesRxMinJs.Observable.from(store).map(appState => Object.assign({ appState }, boundActions)), (_BuckToolbar || _load_BuckToolbar()).default);
    }
    return this._extraUi;
  }

  getIcon() {
    return () => _reactForAtom.React.createElement((_Icon || _load_Icon()).Icon, { icon: 'nuclicon-buck', className: 'nuclide-buck-task-runner-icon' });
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

  setProjectRoot(projectRoot) {
    const path = projectRoot == null ? null : projectRoot.getPath();
    this._getStore().dispatch((_Actions || _load_Actions()).setProjectRoot(path));
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
        selectedDeploymentTarget: this._serializedState.selectedDeploymentTarget,
        taskSettings: this._serializedState.taskSettings || {}
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

    const state = this._getStore().getState();
    const { selectedDeploymentTarget } = state;
    let fullTargetName = state.buildTarget;
    let udid = null;
    if (selectedDeploymentTarget) {
      const separator = !fullTargetName.includes('#') ? '#' : ',';
      fullTargetName += separator + selectedDeploymentTarget.platform.flavor;
      if (selectedDeploymentTarget.device) {
        udid = selectedDeploymentTarget.device.udid;
      }
    }
    const resultStream = this._runTaskType(taskType, state.buckRoot, fullTargetName, state.taskSettings[taskType] || {}, isInstallableRule(state.buildRuleType), udid);
    const task = (0, (_tasks || _load_tasks()).taskFromObservable)(resultStream);
    return Object.assign({}, task, {
      cancel: () => {
        this._logOutput('Build cancelled.', 'warning');
        task.cancel();
      },
      getTrackingData: () => {
        const { buckRoot, buildTarget, taskSettings } = this._getStore().getState();
        return { buckRoot, buildTarget, taskSettings };
      }
    });
  }

  /**
   * Builds the specified target and notifies the caller of the artifact. This isn't part of the
   * TaskRunner API.
   */
  buildArtifact(opts) {
    const { root, target } = opts;
    let pathToArtifact = null;
    const buckService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(root);

    const task = (0, (_tasks || _load_tasks()).taskFromObservable)(_rxjsBundlesRxMinJs.Observable.concat(this._runTaskType('build', root, target, {}, false, null),

    // Don't complete until we've determined the artifact path.
    _rxjsBundlesRxMinJs.Observable.defer(() => buckService.showOutput(root, target)).do(output => {
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
      cancel: () => {
        this._logOutput('Build cancelled.', 'warning');
        task.cancel();
      },
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
    const { buildTarget, taskSettings, selectedDeploymentTarget } = this._store.getState();
    return { buildTarget, taskSettings, selectedDeploymentTarget };
  }

  _runTaskType(taskType, buckRoot, buildTarget, settings, isInstallable, deviceUdid) {
    // Clear Buck diagnostics every time we run build.
    this._diagnosticInvalidations.next({ scope: 'all' });

    if (buckRoot == null || buildTarget == null) {
      // All tasks should have been disabled.
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:toggle', { visible: true });

    const subcommand = getSubcommand(taskType, isInstallable);
    let argString = '';
    if (settings.arguments != null && settings.arguments.length > 0) {
      argString = ' ' + (0, (_shellQuote || _load_shellQuote()).quote)(settings.arguments);
    }
    this._logOutput(`Starting "buck ${ subcommand } ${ buildTarget }${ argString }"`, 'log');

    const buckService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(buckRoot);

    return _rxjsBundlesRxMinJs.Observable.fromPromise(buckService.getHTTPServerPort(buckRoot)).catch(err => {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn(`Failed to get httpPort for ${ buildTarget }`, err);
      return _rxjsBundlesRxMinJs.Observable.of(-1);
    }).switchMap(httpPort => {
      let socketEvents = null;
      if (httpPort > 0) {
        socketEvents = (0, (_BuckEventStream || _load_BuckEventStream()).getEventsFromSocket)(buckService.getWebSocketStream(buckRoot, httpPort).refCount()).share();
      } else {
        this._logOutput('Enable httpserver in your .buckconfig for better output.', 'warning');
      }

      const isDebug = taskType === 'debug';
      const processMessages = runBuckCommand(buckService, buckRoot, buildTarget, subcommand, settings.arguments || [], isDebug, deviceUdid).share();
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
      }).ignoreElements(), this._consumeEventStream(_rxjsBundlesRxMinJs.Observable.merge(mergedEvents, (_featureConfig || _load_featureConfig()).default.get('nuclide-buck.compileErrorDiagnostics') ? (0, (_BuckEventStream || _load_BuckEventStream()).getDiagnosticEvents)(mergedEvents, buckRoot) : _rxjsBundlesRxMinJs.Observable.empty(), isDebug && subcommand === 'install' ? (0, (_LLDBEventStream || _load_LLDBEventStream()).getLLDBInstallEvents)(processMessages, buckRoot) : _rxjsBundlesRxMinJs.Observable.empty(), isDebug && subcommand === 'build' ? (0, (_LLDBEventStream || _load_LLDBEventStream()).getLLDBBuildEvents)(processMessages, buckService, buckRoot, buildTarget, settings.runArguments || []) : _rxjsBundlesRxMinJs.Observable.empty())));
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
    .map(event => event.type === 'progress' ? event : null).finally(() => {
      if (fileDiagnostics.size > 0) {
        this._logOutput('Compilation errors detected: open the Diagnostics pane to jump to them.', 'info');
      }
    }));
  }
}

exports.BuckBuildSystem = BuckBuildSystem; // Make sure that TaskType reflects the types listed below.

const TASKS = [{
  type: 'build',
  label: 'Build',
  description: 'Build the specified Buck target',
  runnable: true,
  icon: 'tools'
}, {
  type: 'run',
  label: 'Run',
  description: 'Run the specfied Buck target',
  runnable: true,
  icon: 'triangle-right'
}, {
  type: 'test',
  label: 'Test',
  description: 'Test the specfied Buck target',
  runnable: true,
  icon: 'check'
}, {
  type: 'debug',
  label: 'Debug',
  description: 'Debug the specfied Buck target',
  runnable: true,
  icon: 'nuclicon-debugger'
}];

function runBuckCommand(buckService, buckRoot, buildTarget, subcommand, args, debug, simulator) {
  if (debug) {
    // Stop any existing debugging sessions, as install hangs if an existing
    // app that's being overwritten is being debugged.
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:stop-debugging');
  }

  if (subcommand === 'install') {
    return buckService.installWithOutput(buckRoot, [buildTarget], args, simulator, {
      run: true,
      debug
    }).refCount();
  } else if (subcommand === 'build') {
    return buckService.buildWithOutput(buckRoot, [buildTarget], args).refCount();
  } else if (subcommand === 'test') {
    return buckService.testWithOutput(buckRoot, [buildTarget], args).refCount();
  } else {
    throw Error(`Unknown subcommand: ${ subcommand }`);
  }
}