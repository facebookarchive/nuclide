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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _shellQuote;

function _load_shellQuote() {
  return _shellQuote = require('shell-quote');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _commonsNodeObservable;

function _load_commonsNodeObservable() {
  return _commonsNodeObservable = require('../../commons-node/observable');
}

var _commonsNodeTasks;

function _load_commonsNodeTasks() {
  return _commonsNodeTasks = require('../../commons-node/tasks');
}

var _nuclideBuckBase;

function _load_nuclideBuckBase() {
  return _nuclideBuckBase = require('../../nuclide-buck-base');
}

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideReactNativeBase;

function _load_nuclideReactNativeBase() {
  return _nuclideReactNativeBase = require('../../nuclide-react-native-base');
}

var _uiBuckIcon;

function _load_uiBuckIcon() {
  return _uiBuckIcon = require('./ui/BuckIcon');
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

var _uiCreateExtraUiComponent;

function _load_uiCreateExtraUiComponent() {
  return _uiCreateExtraUiComponent = require('./ui/createExtraUiComponent');
}

var _BuckEventStream;

function _load_BuckEventStream() {
  return _BuckEventStream = require('./BuckEventStream');
}

var _LLDBEventStream;

function _load_LLDBEventStream() {
  return _LLDBEventStream = require('./LLDBEventStream');
}

var SOCKET_TIMEOUT = 30000;

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

var BuckBuildSystem = (function () {
  function BuckBuildSystem(initialState) {
    _classCallCheck(this, BuckBuildSystem);

    this.id = 'buck';
    this.name = 'Buck';
    this._initialState = initialState;
    this._disposables = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();
    this._outputMessages = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._diagnosticUpdates = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._diagnosticInvalidations = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._disposables.add(this._outputMessages);
  }

  // Make sure that TaskType reflects the types listed below.

  _createClass(BuckBuildSystem, [{
    key: 'getTaskList',
    value: function getTaskList() {
      var _getFlux2 = this._getFlux();

      var store = _getFlux2.store;

      var buckRoot = store.getCurrentBuckRoot();
      var hasBuildTarget = buckRoot != null && Boolean(store.getBuildTarget());
      return TASKS.map(function (task) {
        return _extends({}, task, {
          disabled: buckRoot == null,
          runnable: hasBuildTarget && shouldEnableTask(task.type, store)
        });
      });
    }
  }, {
    key: 'observeTaskList',
    value: function observeTaskList(cb) {
      var _this = this;

      if (this._tasks == null) {
        var _getFlux3 = this._getFlux();

        var _store = _getFlux3.store;

        this._tasks = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(this.getTaskList()), (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(_store.subscribe.bind(_store)).map(function () {
          return _this.getTaskList();
        }));
      }
      return new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(this._tasks.subscribe({ next: cb }));
    }
  }, {
    key: 'getExtraUi',
    value: function getExtraUi() {
      if (this._extraUi == null) {
        var _getFlux4 = this._getFlux();

        var _store2 = _getFlux4.store;
        var _actions = _getFlux4.actions;

        this._extraUi = (0, (_uiCreateExtraUiComponent || _load_uiCreateExtraUiComponent()).createExtraUiComponent)(_store2, _actions);
      }
      return this._extraUi;
    }
  }, {
    key: 'getIcon',
    value: function getIcon() {
      return (_uiBuckIcon || _load_uiBuckIcon()).BuckIcon;
    }
  }, {
    key: 'getOutputMessages',
    value: function getOutputMessages() {
      return this._outputMessages;
    }
  }, {
    key: 'getDiagnosticProvider',
    value: function getDiagnosticProvider() {
      return {
        updates: this._diagnosticUpdates,
        invalidations: this._diagnosticInvalidations
      };
    }
  }, {
    key: 'setProjectRoot',
    value: function setProjectRoot(projectRoot) {
      var path = projectRoot == null ? null : projectRoot.getPath();
      this._getFlux().actions.updateProjectRoot(path);
    }
  }, {
    key: '_logOutput',
    value: function _logOutput(text, level) {
      this._outputMessages.next({ text: text, level: level });
    }

    /**
     * Lazily create the flux stuff.
     */
  }, {
    key: '_getFlux',
    value: function _getFlux() {
      if (this._flux == null) {
        // Set up flux stuff.
        var dispatcher = new (_BuckToolbarDispatcher || _load_BuckToolbarDispatcher()).default();
        var _store3 = new (_BuckToolbarStore || _load_BuckToolbarStore()).default(dispatcher, this._initialState);
        var _actions2 = new (_BuckToolbarActions || _load_BuckToolbarActions()).default(dispatcher, _store3);
        this._disposables.add(_store3);
        this._flux = { store: _store3, actions: _actions2 };
      }
      return this._flux;
    }
  }, {
    key: 'runTask',
    value: function runTask(taskType) {
      var _this2 = this;

      (0, (_assert || _load_assert()).default)(taskType === 'build' || taskType === 'test' || taskType === 'run' || taskType === 'debug', 'Invalid task type');

      var _getFlux5 = this._getFlux();

      var store = _getFlux5.store;

      var resultStream = this._runTaskType(taskType, store.getCurrentBuckRoot(), store.getBuildTarget(), store.getTaskSettings()[taskType] || {}, store.isInstallableRule(), store.isReactNativeServerMode(), store.getSimulator());
      var task = (0, (_commonsNodeTasks || _load_commonsNodeTasks()).taskFromObservable)(resultStream);
      return _extends({}, task, {
        cancel: function cancel() {
          _this2._logOutput('Build cancelled.', 'warning');
          task.cancel();
        },
        getTrackingData: function getTrackingData() {
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
  }, {
    key: 'buildArtifact',
    value: function buildArtifact(opts) {
      var _this3 = this;

      var root = opts.root;
      var target = opts.target;

      var pathToArtifact = null;
      var buckService = (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckService)(root);
      (0, (_assert || _load_assert()).default)(buckService != null, 'Buck service is not available');

      var task = (0, (_commonsNodeTasks || _load_commonsNodeTasks()).taskFromObservable)((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat(this._runTaskType('build', root, target, {}, false, false, null),

      // Don't complete until we've determined the artifact path.
      (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.defer(function () {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(buckService.showOutput(root, target));
      }).do(function (output) {
        var outputPath = undefined;
        if (output == null || output[0] == null || output[0]['buck.outputPath'] == null || (outputPath = output[0]['buck.outputPath'].trim()) === '') {
          throw new Error("Couldn't determine binary path from Buck output!");
        }
        (0, (_assert || _load_assert()).default)(outputPath != null);
        pathToArtifact = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(root, outputPath);
      }).ignoreElements()));
      return _extends({}, task, {
        cancel: function cancel() {
          _this3._logOutput('Build cancelled.', 'warning');
          task.cancel();
        },
        getPathToBuildArtifact: function getPathToBuildArtifact() {
          if (pathToArtifact == null) {
            throw new Error('No build artifact!');
          }
          return pathToArtifact;
        }
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      // If we haven't had to load and create the Flux stuff yet, don't do it now.
      if (this._flux == null) {
        return;
      }
      var store = this._flux.store;

      return {
        buildTarget: store.getBuildTarget(),
        isReactNativeServerMode: store.isReactNativeServerMode(),
        taskSettings: store.getTaskSettings(),
        simulator: store.getSimulator()
      };
    }
  }, {
    key: '_runTaskType',
    value: function _runTaskType(taskType, buckRoot, buildTarget, settings, isInstallableRule, isReactNativeServerMode, simulator) {
      var _this4 = this;

      // Clear Buck diagnostics every time we run build.
      this._diagnosticInvalidations.next({ scope: 'all' });

      if (buckRoot == null || buildTarget == null) {
        // All tasks should have been disabled.
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
      }

      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:toggle', { visible: true });

      var subcommand = getSubcommand(taskType, isInstallableRule);
      var argString = '';
      if (settings.arguments != null && settings.arguments.length > 0) {
        argString = ' ' + (0, (_shellQuote || _load_shellQuote()).quote)(settings.arguments);
      }
      this._logOutput('Starting "buck ' + subcommand + ' ' + buildTarget + argString + '"', 'log');

      var buckService = (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckService)(buckRoot);
      (0, (_assert || _load_assert()).default)(buckService != null, 'Buck service is not available');

      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(buckService.getHTTPServerPort(buckRoot)).catch(function (err) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn('Failed to get httpPort for ' + buildTarget, err);
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(-1);
      }).switchMap(function (httpPort) {
        var socketEvents = null;
        if (httpPort > 0) {
          socketEvents = (0, (_BuckEventStream || _load_BuckEventStream()).getEventsFromSocket)(buckService.getWebSocketStream(buckRoot, httpPort).refCount()).share();
        } else {
          _this4._logOutput('Enable httpserver in your .buckconfig for better output.', 'warning');
        }

        var isDebug = taskType === 'debug';
        var processMessages = runBuckCommand(buckService, buckRoot, buildTarget, subcommand, settings.arguments || [], isDebug, isReactNativeServerMode, simulator).share();
        var processEvents = (0, (_BuckEventStream || _load_BuckEventStream()).getEventsFromProcess)(processMessages).share();

        var mergedEvents = undefined;
        if (socketEvents == null) {
          // Without a websocket, just pipe the Buck output directly.
          mergedEvents = processEvents;
        } else {
          mergedEvents = (0, (_BuckEventStream || _load_BuckEventStream()).combineEventStreams)(subcommand, socketEvents, processEvents).share();
        }

        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat(
        // Wait until the socket starts up before triggering the Buck process.
        socketEvents == null ? (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty() : socketEvents.filter(function (event) {
          return event.type === 'socket-connected';
        }).take(1).timeout(SOCKET_TIMEOUT, Error('Timed out connecting to Buck server.')).ignoreElements(), _this4._consumeEventStream((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge(mergedEvents, (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.get('nuclide-buck.compileErrorDiagnostics') ? (0, (_BuckEventStream || _load_BuckEventStream()).getDiagnosticEvents)(mergedEvents, buckRoot) : (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty(), isDebug && subcommand === 'install' ? (0, (_LLDBEventStream || _load_LLDBEventStream()).getLLDBInstallEvents)(processMessages, buckRoot) : (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty(), isDebug && subcommand === 'build' ? (0, (_LLDBEventStream || _load_LLDBEventStream()).getLLDBBuildEvents)(processMessages, buckService, buckRoot, buildTarget, settings.runArguments || []) : (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty())));
      }).share();
    }

    /**
     * Processes side effects (console output and diagnostics).
     * Returns only the progress events.
     */
  }, {
    key: '_consumeEventStream',
    value: function _consumeEventStream(events) {
      var _this5 = this;

      // TODO: the Diagnostics API does not allow emitting one message at a time.
      // We have to accumulate messages per-file and emit them all.
      var fileDiagnostics = new Map();
      // Save error messages until the end so diagnostics have a chance to finish.
      // Real exceptions will not be handled by this, of course.
      var errorMessage = null;
      return (0, (_commonsNodeObservable || _load_commonsNodeObservable()).compact)(events.do({
        next: function next(event) {
          // Side effects: emit console output and diagnostics
          if (event.type === 'log') {
            _this5._logOutput(event.message, event.level);
          } else if (event.type === 'diagnostics') {
            (function () {
              var diagnostics = event.diagnostics;

              // Update only the files that changed in this message.
              // Since emitting messages for a file invalidates it, we have to
              // be careful to emit all previous messages for it as well.
              var changedFiles = new Map();
              diagnostics.forEach(function (diagnostic) {
                var messages = fileDiagnostics.get(diagnostic.filePath);
                if (messages == null) {
                  messages = [];
                  fileDiagnostics.set(diagnostic.filePath, messages);
                }
                messages.push(diagnostic);
                changedFiles.set(diagnostic.filePath, messages);
              });
              _this5._diagnosticUpdates.next({ filePathToMessages: changedFiles });
            })();
          } else if (event.type === 'error') {
            errorMessage = event.message;
          }
        },
        complete: function complete() {
          if (errorMessage != null) {
            throw Error(errorMessage);
          }
        }
      })
      // Let progress events flow through to the task runner.
      .map(function (event) {
        return event.type === 'progress' ? event : null;
      }).finally(function () {
        if (fileDiagnostics.size > 0) {
          _this5._logOutput('Compilation errors detected: open the Diagnostics pane to jump to them.', 'info');
        }
      }));
    }
  }]);

  return BuckBuildSystem;
})();

exports.BuckBuildSystem = BuckBuildSystem;
var TASKS = [{
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
    var rnObservable = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
    if (isReactNativeServerMode) {
      rnObservable = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise((0, (_nuclideReactNativeBase || _load_nuclideReactNativeBase()).startPackager)()), (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.defer(function () {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-react-native:start-debugging');
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
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
    throw Error('Unknown subcommand: ' + subcommand);
  }
}