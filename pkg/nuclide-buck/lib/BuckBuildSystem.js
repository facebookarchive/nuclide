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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _flux2;

function _flux() {
  return _flux2 = require('flux');
}

var _shellQuote2;

function _shellQuote() {
  return _shellQuote2 = require('shell-quote');
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _commonsNodeObservableToBuildTaskInfo2;

function _commonsNodeObservableToBuildTaskInfo() {
  return _commonsNodeObservableToBuildTaskInfo2 = require('../../commons-node/observableToBuildTaskInfo');
}

var _nuclideBuckBase2;

function _nuclideBuckBase() {
  return _nuclideBuckBase2 = require('../../nuclide-buck-base');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideReactNativeLibPackagerStartPackager2;

function _nuclideReactNativeLibPackagerStartPackager() {
  return _nuclideReactNativeLibPackagerStartPackager2 = require('../../nuclide-react-native/lib/packager/startPackager');
}

var _commonsAtomConsumeFirstProvider2;

function _commonsAtomConsumeFirstProvider() {
  return _commonsAtomConsumeFirstProvider2 = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _uiBuckIcon2;

function _uiBuckIcon() {
  return _uiBuckIcon2 = require('./ui/BuckIcon');
}

var _BuckToolbarStore2;

function _BuckToolbarStore() {
  return _BuckToolbarStore2 = _interopRequireDefault(require('./BuckToolbarStore'));
}

var _BuckToolbarActions2;

function _BuckToolbarActions() {
  return _BuckToolbarActions2 = _interopRequireDefault(require('./BuckToolbarActions'));
}

var _uiCreateExtraUiComponent2;

function _uiCreateExtraUiComponent() {
  return _uiCreateExtraUiComponent2 = require('./ui/createExtraUiComponent');
}

var _BuckEventStream2;

function _BuckEventStream() {
  return _BuckEventStream2 = require('./BuckEventStream');
}

var LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;

var BuckBuildSystem = (function () {
  function BuckBuildSystem(initialState) {
    _classCallCheck(this, BuckBuildSystem);

    this.id = 'buck';
    this.name = 'Buck';
    this._initialState = initialState;
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._outputMessages = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subject();
    this._disposables.add(new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(this._outputMessages));
  }

  // Make sure that TaskType reflects the types listed below.

  _createClass(BuckBuildSystem, [{
    key: 'getTasks',
    value: function getTasks() {
      var _getFlux2 = this._getFlux();

      var store = _getFlux2.store;

      var allEnabled = store.getCurrentBuckRoot() != null && Boolean(store.getBuildTarget());
      return TASKS.map(function (task) {
        var enabled = allEnabled;
        if (task.type === 'run' || task.type === 'debug') {
          enabled = enabled && store.isInstallableRule();
        }
        return _extends({}, task, {
          enabled: enabled
        });
      });
    }
  }, {
    key: 'observeTasks',
    value: function observeTasks(cb) {
      var _this = this;

      if (this._tasks == null) {
        var _getFlux3 = this._getFlux();

        var _store = _getFlux3.store;

        this._tasks = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.concat((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(this.getTasks()), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(_store.subscribe.bind(_store)).map(function () {
          return _this.getTasks();
        }));
      }
      return new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(this._tasks.subscribe({ next: cb }));
    }
  }, {
    key: 'getExtraUi',
    value: function getExtraUi() {
      if (this._extraUi == null) {
        var _getFlux4 = this._getFlux();

        var _store2 = _getFlux4.store;
        var _actions = _getFlux4.actions;

        this._extraUi = (0, (_uiCreateExtraUiComponent2 || _uiCreateExtraUiComponent()).createExtraUiComponent)(_store2, _actions);
      }
      return this._extraUi;
    }
  }, {
    key: 'getIcon',
    value: function getIcon() {
      return (_uiBuckIcon2 || _uiBuckIcon()).BuckIcon;
    }
  }, {
    key: 'getOutputMessages',
    value: function getOutputMessages() {
      return this._outputMessages;
    }
  }, {
    key: 'updateCwd',
    value: function updateCwd(path) {
      this._getFlux().actions.updateProjectPath(path);
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
        var dispatcher = new (_flux2 || _flux()).Dispatcher();
        var _store3 = new (_BuckToolbarStore2 || _BuckToolbarStore()).default(dispatcher, this._initialState);
        var _actions2 = new (_BuckToolbarActions2 || _BuckToolbarActions()).default(dispatcher, _store3);
        this._disposables.add(_store3);
        this._flux = { store: _store3, actions: _actions2 };
      }
      return this._flux;
    }
  }, {
    key: 'runTask',
    value: function runTask(taskType) {
      var _this2 = this;

      (0, (_assert2 || _assert()).default)(taskType === 'build' || taskType === 'test' || taskType === 'run' || taskType === 'debug', 'Invalid task type');

      var resultStream = this._runTaskType(taskType);
      var taskInfo = (0, (_commonsNodeObservableToBuildTaskInfo2 || _commonsNodeObservableToBuildTaskInfo()).observableToBuildTaskInfo)(resultStream);
      (0, (_assert2 || _assert()).default)(taskInfo.observeProgress != null);
      return {
        // Flow can't check ...taskInfo due to the optional args.
        observeProgress: taskInfo.observeProgress,
        onDidComplete: taskInfo.onDidComplete,
        onDidError: taskInfo.onDidError,
        cancel: function cancel() {
          _this2._logOutput('Build cancelled.', 'warning');
          taskInfo.cancel();
        },
        getTrackingData: function getTrackingData() {
          var _getFlux5 = _this2._getFlux();

          var store = _getFlux5.store;

          return {
            buckRoot: store.getCurrentBuckRoot(),
            buildTarget: store.getBuildTarget(),
            taskSettings: store.getTaskSettings()
          };
        }
      };
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
        taskSettings: store.getTaskSettings()
      };
    }
  }, {
    key: '_runTaskType',
    value: function _runTaskType(taskType) {
      var _this3 = this;

      var _getFlux6 = this._getFlux();

      var store = _getFlux6.store;

      var buckRoot = store.getCurrentBuckRoot();
      var buildTarget = store.getBuildTarget();
      if (buckRoot == null || buildTarget == null) {
        // All tasks should have been disabled.
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
      }

      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');
      var settings = store.getTaskSettings()[taskType] || {};

      var subcommand = taskType === 'run' || taskType === 'debug' ? 'install' : taskType;
      var argString = '';
      if (settings.arguments != null && settings.arguments.length > 0) {
        argString = ' ' + (0, (_shellQuote2 || _shellQuote()).quote)(settings.arguments);
      }
      this._logOutput('Starting "buck ' + subcommand + ' ' + buildTarget + argString + '"', 'log');

      var buckProject = (0, (_nuclideBuckBase2 || _nuclideBuckBase()).createBuckProject)(buckRoot);
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(buckProject.getHTTPServerPort()).catch(function (err) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().warn('Failed to get httpPort for ' + buildTarget, err);
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(-1);
      }).switchMap(function (httpPort) {
        var socketEvents = null;
        if (httpPort > 0) {
          socketEvents = (0, (_BuckEventStream2 || _BuckEventStream()).getEventsFromSocket)(buckProject.getWebSocketStream(httpPort)).share();
        } else {
          _this3._logOutput('Enable httpserver in your .buckconfig for better output.', 'warning');
        }

        var processEvents = _this3._runBuckCommand(buckProject, buildTarget, subcommand, settings.arguments || [], taskType === 'debug');

        var mergedEvents = undefined;
        if (socketEvents == null) {
          // Without a websocket, just pipe the Buck output directly.
          mergedEvents = processEvents;
        } else {
          mergedEvents = (0, (_BuckEventStream2 || _BuckEventStream()).combineEventStreams)(subcommand, socketEvents, processEvents);
        }

        return mergedEvents.switchMap(function (event) {
          if (event.type === 'progress') {
            return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
              kind: 'progress',
              progress: event.progress
            });
          } else if (event.type === 'log') {
            _this3._logOutput(event.message, event.level);
          }
          return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
        });
      }).finally(function () {
        return buckProject.dispose();
      }).share();
    }
  }, {
    key: '_runBuckCommand',
    value: function _runBuckCommand(buckProject, buildTarget, subcommand, args, debug) {
      var _getFlux7 = this._getFlux();

      var store = _getFlux7.store;

      if (debug) {
        // Stop any existing debugging sessions, as install hangs if an existing
        // app that's being overwritten is being debugged.
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:stop-debugging');
      }

      var buckObservable = undefined;
      if (subcommand === 'install') {
        var rnObservable = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
        var isReactNativeServerMode = store.isReactNativeServerMode();
        if (isReactNativeServerMode) {
          rnObservable = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.concat((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise((0, (_nuclideReactNativeLibPackagerStartPackager2 || _nuclideReactNativeLibPackagerStartPackager()).startPackager)()), (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.defer(function () {
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-react-native:start-debugging');
            return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
          })).ignoreElements();
        }
        buckObservable = rnObservable.concat(buckProject.installWithOutput([buildTarget], args.concat(isReactNativeServerMode ? ['--', '-executor-override', 'RCTWebSocketExecutor'] : []), store.getSimulator(), {
          run: true,
          debug: debug
        }));
      } else if (subcommand === 'build') {
        buckObservable = buckProject.buildWithOutput([buildTarget], args);
      } else if (subcommand === 'test') {
        buckObservable = buckProject.testWithOutput([buildTarget], args);
      } else {
        throw Error('Unknown subcommand: ' + subcommand);
      }

      var lldbPid = undefined;
      return (0, (_BuckEventStream2 || _BuckEventStream()).getEventsFromProcess)(buckObservable).do({
        next: function next(event) {
          // For debug builds, watch for the lldb process ID.
          if (debug && event.type === 'log') {
            var pidMatch = event.message.match(LLDB_PROCESS_ID_REGEX);
            if (pidMatch != null) {
              lldbPid = parseInt(pidMatch[1], 10);
            }
          }
        },
        complete: _asyncToGenerator(function* () {
          if (lldbPid != null) {
            // Use commands here to trigger package activation.
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
            var debuggerService = yield (0, (_commonsAtomConsumeFirstProvider2 || _commonsAtomConsumeFirstProvider()).default)('nuclide-debugger.remote');
            var buckProjectPath = yield buckProject.getPath();
            debuggerService.debugLLDB(lldbPid, buckProjectPath);
          }
        })
      }).share();
    }
  }]);

  return BuckBuildSystem;
})();

exports.BuckBuildSystem = BuckBuildSystem;
var TASKS = [{
  type: 'build',
  label: 'Build',
  description: 'Build the specified Buck target',
  enabled: true,
  icon: 'tools'
}, {
  type: 'run',
  label: 'Run',
  description: 'Run the specfied Buck target',
  enabled: true,
  icon: 'triangle-right'
}, {
  type: 'test',
  label: 'Test',
  description: 'Test the specfied Buck target',
  enabled: true,
  icon: 'checklist'
}, {
  type: 'debug',
  label: 'Debug',
  description: 'Debug the specfied Buck target',
  enabled: true,
  icon: 'plug'
}];