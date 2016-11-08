'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BuckBuildSystem = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _shellQuote;

function _load_shellQuote() {
  return _shellQuote = require('shell-quote');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _observable;

function _load_observable() {
  return _observable = require('../../commons-node/observable');
}

var _tasks;

function _load_tasks() {
  return _tasks = require('../../commons-node/tasks');
}

var _nuclideBuckBase;

function _load_nuclideBuckBase() {
  return _nuclideBuckBase = require('../../nuclide-buck-base');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideReactNativeBase;

function _load_nuclideReactNativeBase() {
  return _nuclideReactNativeBase = require('../../nuclide-react-native-base');
}

var _BuckIcon;

function _load_BuckIcon() {
  return _BuckIcon = require('./ui/BuckIcon');
}

var _BuckToolbarStore;

function _load_BuckToolbarStore() {
  return _BuckToolbarStore = _interopRequireDefault(require('./BuckToolbarStore'));
}

var _BuckToolbarActions;

function _load_BuckToolbarActions() {
  return _BuckToolbarActions = _interopRequireDefault(require('./BuckToolbarActions'));
}

var _BuckToolbarDispatcher;

function _load_BuckToolbarDispatcher() {
  return _BuckToolbarDispatcher = _interopRequireDefault(require('./BuckToolbarDispatcher'));
}

var _createExtraUiComponent;

function _load_createExtraUiComponent() {
  return _createExtraUiComponent = require('./ui/createExtraUiComponent');
}

var _BuckEventStream;

function _load_BuckEventStream() {
  return _BuckEventStream = require('./BuckEventStream');
}

var _LLDBEventStream;

function _load_LLDBEventStream() {
  return _LLDBEventStream = require('./LLDBEventStream');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SOCKET_TIMEOUT = 30000;

function shouldEnableTask(taskType, store) {
  switch (taskType) {
    case 'run':
      return store.isInstallableRule();
    case 'debug':
      return store.isDebuggableRule();
    default:
      return true;
  }
}

function getSubcommand(taskType, isInstallableRule) {
  switch (taskType) {
    case 'run':
      return 'install';
    case 'debug':
      // For mobile builds, install the build on the device.
      // Otherwise, run a regular build and invoke the debugger on the output.
      return isInstallableRule ? 'install' : 'build';
    default:
      return taskType;
  }
}

let BuckBuildSystem = exports.BuckBuildSystem = class BuckBuildSystem {

  constructor(initialState) {
    this.id = 'buck';
    this.name = 'Buck';
    this._initialState = initialState;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._outputMessages = new _rxjsBundlesRxMinJs.Subject();
    this._diagnosticUpdates = new _rxjsBundlesRxMinJs.Subject();
    this._diagnosticInvalidations = new _rxjsBundlesRxMinJs.Subject();
    this._disposables.add(this._outputMessages);
  }

  getTaskList() {
    var _getFlux = this._getFlux();

    const store = _getFlux.store;

    const buckRoot = store.getCurrentBuckRoot();
    const hasBuildTarget = buckRoot != null && Boolean(store.getBuildTarget());
    return TASKS.map(task => Object.assign({}, task, {
      disabled: buckRoot == null,
      runnable: hasBuildTarget && shouldEnableTask(task.type, store)
    }));
  }

  observeTaskList(cb) {
    if (this._tasks == null) {
      var _getFlux2 = this._getFlux();

      const store = _getFlux2.store;

      this._tasks = _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of(this.getTaskList()), (0, (_event || _load_event()).observableFromSubscribeFunction)(store.subscribe.bind(store)).map(() => this.getTaskList()));
    }
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._tasks.subscribe({ next: cb }));
  }

  getExtraUi() {
    if (this._extraUi == null) {
      var _getFlux3 = this._getFlux();

      const store = _getFlux3.store,
            actions = _getFlux3.actions;

      this._extraUi = (0, (_createExtraUiComponent || _load_createExtraUiComponent()).createExtraUiComponent)(store, actions);
    }
    return this._extraUi;
  }

  getIcon() {
    return (_BuckIcon || _load_BuckIcon()).BuckIcon;
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

  setProjectRoot(projectRoot) {
    const path = projectRoot == null ? null : projectRoot.getPath();
    this._getFlux().actions.updateProjectRoot(path);
  }

  _logOutput(text, level) {
    this._outputMessages.next({ text: text, level: level });
  }

  /**
   * Lazily create the flux stuff.
   */
  _getFlux() {
    if (this._flux == null) {
      // Set up flux stuff.
      const dispatcher = new (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).default();
      const store = new (_BuckToolbarStore || _load_BuckToolbarStore()).default(dispatcher, this._initialState);
      const actions = new (_BuckToolbarActions || _load_BuckToolbarActions()).default(dispatcher, store);
      this._disposables.add(store);
      this._flux = { store: store, actions: actions };
    }
    return this._flux;
  }

  runTask(taskType) {
    if (!(taskType === 'build' || taskType === 'test' || taskType === 'run' || taskType === 'debug')) {
      throw new Error('Invalid task type');
    }

    var _getFlux4 = this._getFlux();

    const store = _getFlux4.store;

    const resultStream = this._runTaskType(taskType, store.getCurrentBuckRoot(), store.getBuildTarget(), store.getTaskSettings()[taskType] || {}, store.isInstallableRule(), store.isReactNativeServerMode(), store.getSimulator());
    const task = (0, (_tasks || _load_tasks()).taskFromObservable)(resultStream);
    return Object.assign({}, task, {
      cancel: () => {
        this._logOutput('Build cancelled.', 'warning');
        task.cancel();
      },
      getTrackingData: () => {
        return {
          buckRoot: store.getCurrentBuckRoot(),
          buildTarget: store.getBuildTarget(),
          taskSettings: store.getTaskSettings()
        };
      }
    });
  }

  /**
   * Builds the specified target and notifies the caller of the artifact. This isn't part of the
   * TaskRunner API.
   */
  buildArtifact(opts) {
    const root = opts.root,
          target = opts.target;

    let pathToArtifact = null;
    const buckService = (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckService)(root);

    if (!(buckService != null)) {
      throw new Error('Buck service is not available');
    }

    const task = (0, (_tasks || _load_tasks()).taskFromObservable)(_rxjsBundlesRxMinJs.Observable.concat(this._runTaskType('build', root, target, {}, false, false, null),

    // Don't complete until we've determined the artifact path.
    _rxjsBundlesRxMinJs.Observable.defer(() => _rxjsBundlesRxMinJs.Observable.fromPromise(buckService.showOutput(root, target))).do(output => {
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
      getPathToBuildArtifact: function () {
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
    if (this._flux == null) {
      return;
    }
    const store = this._flux.store;

    return {
      buildTarget: store.getBuildTarget(),
      isReactNativeServerMode: store.isReactNativeServerMode(),
      taskSettings: store.getTaskSettings(),
      simulator: store.getSimulator()
    };
  }

  _runTaskType(taskType, buckRoot, buildTarget, settings, isInstallableRule, isReactNativeServerMode, simulator) {
    // Clear Buck diagnostics every time we run build.
    this._diagnosticInvalidations.next({ scope: 'all' });

    if (buckRoot == null || buildTarget == null) {
      // All tasks should have been disabled.
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:toggle', { visible: true });

    const subcommand = getSubcommand(taskType, isInstallableRule);
    let argString = '';
    if (settings.arguments != null && settings.arguments.length > 0) {
      argString = ' ' + (0, (_shellQuote || _load_shellQuote()).quote)(settings.arguments);
    }
    this._logOutput(`Starting "buck ${ subcommand } ${ buildTarget }${ argString }"`, 'log');

    const buckService = (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckService)(buckRoot);

    if (!(buckService != null)) {
      throw new Error('Buck service is not available');
    }

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
      const processMessages = runBuckCommand(buckService, buckRoot, buildTarget, subcommand, settings.arguments || [], isDebug, isReactNativeServerMode, simulator).share();
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
      socketEvents == null ? _rxjsBundlesRxMinJs.Observable.empty() : socketEvents.filter(event => event.type === 'socket-connected').take(1).timeout(SOCKET_TIMEOUT, Error('Timed out connecting to Buck server.')).ignoreElements(), this._consumeEventStream(_rxjsBundlesRxMinJs.Observable.merge(mergedEvents, (_featureConfig || _load_featureConfig()).default.get('nuclide-buck.compileErrorDiagnostics') ? (0, (_BuckEventStream || _load_BuckEventStream()).getDiagnosticEvents)(mergedEvents, buckRoot) : _rxjsBundlesRxMinJs.Observable.empty(), isDebug && subcommand === 'install' ? (0, (_LLDBEventStream || _load_LLDBEventStream()).getLLDBInstallEvents)(processMessages, buckRoot) : _rxjsBundlesRxMinJs.Observable.empty(), isDebug && subcommand === 'build' ? (0, (_LLDBEventStream || _load_LLDBEventStream()).getLLDBBuildEvents)(processMessages, buckService, buckRoot, buildTarget, settings.runArguments || []) : _rxjsBundlesRxMinJs.Observable.empty())));
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
          const diagnostics = event.diagnostics;
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

};

// Make sure that TaskType reflects the types listed below.

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
  icon: 'checklist'
}, {
  type: 'debug',
  label: 'Debug',
  description: 'Debug the specfied Buck target',
  runnable: true,
  icon: 'plug'
}];

function runBuckCommand(buckService, buckRoot, buildTarget, subcommand, args, debug, isReactNativeServerMode, simulator) {

  if (debug) {
    // Stop any existing debugging sessions, as install hangs if an existing
    // app that's being overwritten is being debugged.
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:stop-debugging');
  }

  if (subcommand === 'install') {
    let rnObservable = _rxjsBundlesRxMinJs.Observable.empty();
    if (isReactNativeServerMode) {
      rnObservable = _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.fromPromise((0, (_nuclideReactNativeBase || _load_nuclideReactNativeBase()).startPackager)()), _rxjsBundlesRxMinJs.Observable.defer(() => {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-react-native:start-debugging');
        return _rxjsBundlesRxMinJs.Observable.empty();
      })).ignoreElements();
    }
    return rnObservable.concat(buckService.installWithOutput(buckRoot, [buildTarget], args.concat(isReactNativeServerMode ? ['--', '-executor-override', 'RCTWebSocketExecutor'] : []), simulator, {
      run: true,
      debug: debug
    }).refCount());
  } else if (subcommand === 'build') {
    return buckService.buildWithOutput(buckRoot, [buildTarget], args).refCount();
  } else if (subcommand === 'test') {
    return buckService.testWithOutput(buckRoot, [buildTarget], args).refCount();
  } else {
    throw Error(`Unknown subcommand: ${ subcommand }`);
  }
}