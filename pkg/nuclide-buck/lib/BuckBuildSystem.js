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

var _commonsNodeTasks2;

function _commonsNodeTasks() {
  return _commonsNodeTasks2 = require('../../commons-node/tasks');
}

var _nuclideBuckBase2;

function _nuclideBuckBase() {
  return _nuclideBuckBase2 = require('../../nuclide-buck-base');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideReactNativeBase2;

function _nuclideReactNativeBase() {
  return _nuclideReactNativeBase2 = require('../../nuclide-react-native-base');
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

var _LLDBEventStream2;

function _LLDBEventStream() {
  return _LLDBEventStream2 = require('./LLDBEventStream');
}

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

function getSubcommand(taskType, store) {
  switch (taskType) {
    case 'run':
      return 'install';
    case 'debug':
      // For mobile builds, install the build on the device.
      // Otherwise, run a regular build and invoke the debugger on the output.
      return store.isInstallableRule() ? 'install' : 'build';
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
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._outputMessages = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subject();
    this._disposables.add(new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(this._outputMessages));
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
          enabled: hasBuildTarget && shouldEnableTask(task.type, store)
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

        this._tasks = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.concat((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(this.getTaskList()), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(_store.subscribe.bind(_store)).map(function () {
          return _this.getTaskList();
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
    key: 'setProjectRoot',
    value: function setProjectRoot(projectRoot) {
      var path = projectRoot == null ? null : projectRoot.getPath();
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
      var task = (0, (_commonsNodeTasks2 || _commonsNodeTasks()).taskFromObservable)(resultStream);
      return _extends({}, task, {
        cancel: function cancel() {
          _this2._logOutput('Build cancelled.', 'warning');
          task.cancel();
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

      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:toggle', { visible: true });
      var settings = store.getTaskSettings()[taskType] || {};

      var subcommand = getSubcommand(taskType, store);
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

        var isDebug = taskType === 'debug';
        var processMessages = _this3._runBuckCommand(buckProject, buildTarget, subcommand, settings.arguments || [], isDebug).share();
        var processEvents = (0, (_BuckEventStream2 || _BuckEventStream()).getEventsFromProcess)(processMessages).share();

        var mergedEvents = undefined;
        if (socketEvents == null) {
          // Without a websocket, just pipe the Buck output directly.
          mergedEvents = processEvents;
        } else {
          mergedEvents = (0, (_BuckEventStream2 || _BuckEventStream()).combineEventStreams)(subcommand, socketEvents, processEvents);
        }

        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge(mergedEvents, isDebug && subcommand === 'install' ? (0, (_LLDBEventStream2 || _LLDBEventStream()).getLLDBInstallEvents)(processMessages, buckProject) : (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty(), isDebug && subcommand === 'build' ? (0, (_LLDBEventStream2 || _LLDBEventStream()).getLLDBBuildEvents)(processMessages, buckProject, buildTarget) : (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty()).switchMap(function (event) {
          if (event.type === 'progress') {
            return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(event);
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

      if (subcommand === 'install') {
        var rnObservable = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
        var isReactNativeServerMode = store.isReactNativeServerMode();
        if (isReactNativeServerMode) {
          rnObservable = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.concat((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise((0, (_nuclideReactNativeBase2 || _nuclideReactNativeBase()).startPackager)()), (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.defer(function () {
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-react-native:start-debugging');
            return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
          })).ignoreElements();
        }
        return rnObservable.concat(buckProject.installWithOutput([buildTarget], args.concat(isReactNativeServerMode ? ['--', '-executor-override', 'RCTWebSocketExecutor'] : []), store.getSimulator(), {
          run: true,
          debug: debug
        }));
      } else if (subcommand === 'build') {
        return buckProject.buildWithOutput([buildTarget], args);
      } else if (subcommand === 'test') {
        return buckProject.testWithOutput([buildTarget], args);
      } else {
        throw Error('Unknown subcommand: ' + subcommand);
      }
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