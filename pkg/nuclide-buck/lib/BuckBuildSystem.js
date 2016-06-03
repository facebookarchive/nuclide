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

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
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

var _ReactNativeServerManager2;

function _ReactNativeServerManager() {
  return _ReactNativeServerManager2 = _interopRequireDefault(require('./ReactNativeServerManager'));
}

var _ReactNativeServerActions2;

function _ReactNativeServerActions() {
  return _ReactNativeServerActions2 = _interopRequireDefault(require('./ReactNativeServerActions'));
}

var _runBuckCommandInNewPane2;

function _runBuckCommandInNewPane() {
  return _runBuckCommandInNewPane2 = _interopRequireDefault(require('./runBuckCommandInNewPane'));
}

var REACT_NATIVE_APP_FLAGS = ['-executor-override', 'RCTWebSocketExecutor', '-websocket-executor-name', 'Nuclide', '-websocket-executor-port', '8090'];

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

  _createClass(BuckBuildSystem, [{
    key: 'getTasks',
    value: function getTasks() {
      var _getFlux2 = this._getFlux();

      var store = _getFlux2.store;

      var allEnabled = store.getMostRecentBuckProject() != null && Boolean(store.getBuildTarget());
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
      if (!this.getTasks().some(function (task) {
        return task.type === taskType;
      })) {
        throw new Error('There\'s no Buck task named "' + taskType + '"');
      }

      var resultStream = this._runTaskType(taskType);
      return {
        cancel: function cancel() {
          // FIXME: How can we cancel Buck tasks?
        },
        observeProgress: function observeProgress(cb) {
          return new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(resultStream.subscribe({ next: cb, error: function error() {} }));
        },
        onDidError: function onDidError(cb) {
          return new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(resultStream.subscribe({ error: cb }));
        },
        onDidComplete: function onDidComplete(cb) {
          return new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(
          // Add an empty error handler to avoid the "Unhandled Error" message. (We're handling it
          // above via the onDidError interface.)
          resultStream.subscribe({ complete: cb, error: function error() {} }));
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
        isReactNativeServerMode: store.isReactNativeServerMode()
      };
    }
  }, {
    key: '_runTaskType',
    value: function _runTaskType(taskType) {
      var _this2 = this;

      var _getFlux5 = this._getFlux();

      var store = _getFlux5.store;

      var buckProject = store.getMostRecentBuckProject();
      var buildTarget = store.getBuildTarget();
      if (buckProject == null || buildTarget == null) {
        // All tasks should have been disabled.
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
      }

      var subcommand = taskType === 'run' || taskType === 'debug' ? 'install' : taskType;
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(buckProject.getHTTPServerPort()).catch(function (err) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().warn('Failed to get httpPort for ' + buildTarget, err);
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(-1);
      }).flatMap(function (httpPort) {
        var socketStream = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
        if (httpPort > 0) {
          socketStream = buckProject.getWebSocketStream(httpPort).flatMap(function (message) {
            switch (message.type) {
              case 'BuildProgressUpdated':
                return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(message.progressValue);
            }
            return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
          }).catch(function (err) {
            (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('Got Buck websocket error building ' + buildTarget, err);
            // Return to indeterminate progress.
            return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(null);
          });
        }
        var buckObservable = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(_this2._runBuckCommand(buckProject, buildTarget, subcommand));
        return socketStream.merge(buckObservable).takeUntil(buckObservable);
      }).share();
    }
  }, {
    key: '_runBuckCommand',
    value: _asyncToGenerator(function* (buckProject, buildTarget, subcommand) {
      var _getFlux6 = this._getFlux();

      var store = _getFlux6.store;

      var appArgs = [];
      if (subcommand === 'install' && store.isReactNativeServerMode()) {
        var serverCommand = yield this._getReactNativeServerCommand(buckProject);
        if (serverCommand) {
          var rnActions = this._getReactNativeServerActions();
          rnActions.startServer(serverCommand);
          rnActions.startNodeExecutorServer();
          appArgs = REACT_NATIVE_APP_FLAGS;
        }
      }

      if (subcommand === 'debug') {
        // Stop any existing debugging sessions, as install hangs if an existing
        // app that's being overwritten is being debugged.
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:stop-debugging');
      }

      var result = yield (0, (_runBuckCommandInNewPane2 || _runBuckCommandInNewPane()).default)({
        buckProject: buckProject,
        buildTarget: buildTarget,
        simulator: store.getSimulator(),
        subcommand: subcommand,
        debug: subcommand === 'debug',
        appArgs: appArgs
      });

      if (subcommand === 'debug' && result != null && result.pid != null) {
        // Use commands here to trigger package activation.
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
        var debuggerService = yield (0, (_commonsAtomConsumeFirstProvider2 || _commonsAtomConsumeFirstProvider()).default)('nuclide-debugger.remote');
        var buckProjectPath = yield buckProject.getPath();
        debuggerService.debugLLDB(result.pid, buckProjectPath);
      }
    })
  }, {
    key: '_getReactNativeServerCommand',
    value: _asyncToGenerator(function* (buckProject) {
      var serverCommand = yield buckProject.getBuckConfig('react-native', 'server');
      if (serverCommand == null) {
        return null;
      }
      var repoRoot = yield buckProject.getPath();
      if (repoRoot == null) {
        return null;
      }
      return (_path2 || _path()).default.join(repoRoot, serverCommand);
    })
  }, {
    key: '_getReactNativeServerActions',
    value: function _getReactNativeServerActions() {
      if (this._reactNativeServerActions != null) {
        return this._reactNativeServerActions;
      }

      var dispatcher = new (_flux2 || _flux()).Dispatcher();
      var actions = new (_ReactNativeServerActions2 || _ReactNativeServerActions()).default(dispatcher);
      this._reactNativeServerActions = actions;
      this._reactNativeServerManager = new (_ReactNativeServerManager2 || _ReactNativeServerManager()).default(dispatcher, actions);
      this._disposables.add(this._reactNativeServerManager);
      return actions;
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
  cancelable: false,
  icon: 'tools'
}, {
  type: 'run',
  label: 'Run',
  description: 'Run the specfied Buck target',
  enabled: true,
  cancelable: false,
  icon: 'triangle-right'
}, {
  type: 'test',
  label: 'Test',
  description: 'Test the specfied Buck target',
  enabled: true,
  cancelable: false,
  icon: 'checklist'
}, {
  type: 'debug',
  label: 'Debug',
  description: 'Debug the specfied Buck target',
  enabled: true,
  cancelable: false,
  icon: 'plug'
}];

// React Native server state.