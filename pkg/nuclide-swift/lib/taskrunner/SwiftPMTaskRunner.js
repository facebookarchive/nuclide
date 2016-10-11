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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../../commons-node/UniversalDisposable'));
}

var _commonsNodeFsPromise;

function _load_commonsNodeFsPromise() {
  return _commonsNodeFsPromise = _interopRequireDefault(require('../../../commons-node/fsPromise'));
}

var _commonsNodeProcess;

function _load_commonsNodeProcess() {
  return _commonsNodeProcess = require('../../../commons-node/process');
}

var _commonsNodeTasks;

function _load_commonsNodeTasks() {
  return _commonsNodeTasks = require('../../../commons-node/tasks');
}

var _SwiftPMTaskRunnerStore;

function _load_SwiftPMTaskRunnerStore() {
  return _SwiftPMTaskRunnerStore = _interopRequireDefault(require('./SwiftPMTaskRunnerStore'));
}

var _SwiftPMTaskRunnerActions;

function _load_SwiftPMTaskRunnerActions() {
  return _SwiftPMTaskRunnerActions = _interopRequireDefault(require('./SwiftPMTaskRunnerActions'));
}

var _SwiftPMTaskRunnerDispatcher;

function _load_SwiftPMTaskRunnerDispatcher() {
  return _SwiftPMTaskRunnerDispatcher = _interopRequireDefault(require('./SwiftPMTaskRunnerDispatcher'));
}

var _SwiftPMTaskRunnerCommands;

function _load_SwiftPMTaskRunnerCommands() {
  return _SwiftPMTaskRunnerCommands = require('./SwiftPMTaskRunnerCommands');
}

var _SwiftPMTaskRunnerTaskMetadata;

function _load_SwiftPMTaskRunnerTaskMetadata() {
  return _SwiftPMTaskRunnerTaskMetadata = require('./SwiftPMTaskRunnerTaskMetadata');
}

var _toolbarSwiftPMTaskRunnerToolbar;

function _load_toolbarSwiftPMTaskRunnerToolbar() {
  return _toolbarSwiftPMTaskRunnerToolbar = _interopRequireDefault(require('./toolbar/SwiftPMTaskRunnerToolbar'));
}

var _providersSwiftPMAutocompletionProvider;

function _load_providersSwiftPMAutocompletionProvider() {
  return _providersSwiftPMAutocompletionProvider = _interopRequireDefault(require('./providers/SwiftPMAutocompletionProvider'));
}

var _uiSwiftIcon;

function _load_uiSwiftIcon() {
  return _uiSwiftIcon = require('../ui/SwiftIcon');
}

/**
 * nuclide-swift makes use of the Flux design pattern. The SwiftPMTaskRunner is
 * responsible for kicking off SwiftPM tasks such as building a package. How it
 * builds the package is determined by the state of the
 * SwiftPMTaskRunnerToolbar -- the path to the package, whether a build path is
 * specified, etc. -- and that state is maintained by the
 * SwiftPMTaskRunnerStore. Updates to the toolbar UI options trigger actions,
 * defined in SwiftPMTaskRunnerActions, which update the state of the store.
 * Actions are routed to the store via a Flux.Dispatcher (instantiated by
 * SwiftPMTaskRunner).
 */

/**
 * The primary controller for spawning SwiftPM tasks, such as building a
 * package, or running its tests. This class conforms to Nuclide's TaskRunner
 * interface.
 */

var SwiftPMTaskRunner = (function () {
  function SwiftPMTaskRunner(initialState) {
    _classCallCheck(this, SwiftPMTaskRunner);

    this.id = 'swiftpm';
    this.name = 'Swift';
    this._initialState = initialState;
    this._disposables = new (_atom || _load_atom()).CompositeDisposable();
    this._outputMessages = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._disposables.add(new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(this._outputMessages));
  }

  _createClass(SwiftPMTaskRunner, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return this._getFlux().store.serialize();
    }
  }, {
    key: 'getExtraUi',
    value: function getExtraUi() {
      var _getFlux2 = this._getFlux();

      var store = _getFlux2.store;
      var actions = _getFlux2.actions;

      return (function (_React$Component) {
        _inherits(ExtraUi, _React$Component);

        function ExtraUi() {
          _classCallCheck(this, ExtraUi);

          _get(Object.getPrototypeOf(ExtraUi.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(ExtraUi, [{
          key: 'render',
          value: function render() {
            return (_reactForAtom || _load_reactForAtom()).React.createElement((_toolbarSwiftPMTaskRunnerToolbar || _load_toolbarSwiftPMTaskRunnerToolbar()).default, {
              store: store,
              actions: actions,
              activeTaskType: this.props.activeTaskType
            });
          }
        }]);

        return ExtraUi;
      })((_reactForAtom || _load_reactForAtom()).React.Component);
    }
  }, {
    key: 'observeTaskList',
    value: function observeTaskList(callback) {
      callback((_SwiftPMTaskRunnerTaskMetadata || _load_SwiftPMTaskRunnerTaskMetadata()).SwiftPMTaskRunnerTaskMetadata);
      return new (_atom || _load_atom()).Disposable();
    }
  }, {
    key: 'getIcon',
    value: function getIcon() {
      return (_uiSwiftIcon || _load_uiSwiftIcon()).SwiftIcon;
    }
  }, {
    key: 'runTask',
    value: function runTask(taskName) {
      var _this = this;

      var store = this._getFlux().store;
      var chdir = store.getChdir();
      var configuration = store.getConfiguration();
      var buildPath = store.getBuildPath();

      var command = undefined;
      switch (taskName) {
        case (_SwiftPMTaskRunnerTaskMetadata || _load_SwiftPMTaskRunnerTaskMetadata()).SwiftPMTaskRunnerBuildTaskMetadata.type:
          command = (0, (_SwiftPMTaskRunnerCommands || _load_SwiftPMTaskRunnerCommands()).buildCommand)(chdir, configuration, store.getXcc(), store.getXlinker(), store.getXswiftc(), buildPath);
          break;
        case (_SwiftPMTaskRunnerTaskMetadata || _load_SwiftPMTaskRunnerTaskMetadata()).SwiftPMTaskRunnerTestTaskMetadata.type:
          command = (0, (_SwiftPMTaskRunnerCommands || _load_SwiftPMTaskRunnerCommands()).testCommand)(chdir, buildPath);
          break;
        default:
          throw new Error('Unknown task name: ' + taskName);
      }

      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:toggle', { visible: true });
      this._logOutput(command.command + ' ' + command.args.join(' '), 'log');

      var observable = (0, (_commonsNodeProcess || _load_commonsNodeProcess()).observeProcess)(function () {
        return (0, (_commonsNodeProcess || _load_commonsNodeProcess()).safeSpawn)(command.command, command.args);
      }).do(function (message) {
        switch (message.kind) {
          case 'stderr':
          case 'stdout':
            _this._logOutput(message.data, 'log');
            break;
          case 'exit':
            if (message.exitCode === 0) {
              _this._logOutput(command.command + ' exited successfully.', 'success');
              _this._getFlux().actions.updateCompileCommands(chdir, configuration, buildPath);
            } else {
              _this._logOutput(command.command + ' failed with ' + (0, (_commonsNodeProcess || _load_commonsNodeProcess()).exitEventToMessage)(message), 'error');
            }
            break;
          default:
            break;
        }
      }).ignoreElements();

      var task = (0, (_commonsNodeTasks || _load_commonsNodeTasks()).taskFromObservable)(observable);
      return _extends({}, task, {
        cancel: function cancel() {
          _this._logOutput('Task cancelled.', 'warning');
          task.cancel();
        }
      });
    }
  }, {
    key: 'getAutocompletionProvider',
    value: function getAutocompletionProvider() {
      if (!this._autocompletionProvider) {
        this._autocompletionProvider = new (_providersSwiftPMAutocompletionProvider || _load_providersSwiftPMAutocompletionProvider()).default(this._getFlux().store);
      }
      return this._autocompletionProvider;
    }
  }, {
    key: 'getOutputMessages',
    value: function getOutputMessages() {
      return this._outputMessages;
    }
  }, {
    key: 'setProjectRoot',
    value: function setProjectRoot(projectRoot) {
      var _this2 = this;

      if (projectRoot) {
        (function () {
          var path = projectRoot.getPath();
          (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.exists(path + '/Package.swift').then(function (fileExists) {
            if (fileExists) {
              _this2._getFlux().actions.updateChdir(path);
            }
          });
        })();
      }
    }
  }, {
    key: '_logOutput',
    value: function _logOutput(text, level) {
      this._outputMessages.next({ text: text, level: level });
    }
  }, {
    key: '_getFlux',
    value: function _getFlux() {
      if (!this._flux) {
        var dispatcher = new (_SwiftPMTaskRunnerDispatcher || _load_SwiftPMTaskRunnerDispatcher()).default();
        var _store = new (_SwiftPMTaskRunnerStore || _load_SwiftPMTaskRunnerStore()).default(dispatcher, this._initialState);
        this._disposables.add(_store);
        var _actions = new (_SwiftPMTaskRunnerActions || _load_SwiftPMTaskRunnerActions()).default(dispatcher);
        this._flux = { store: _store, actions: _actions };
      }
      return this._flux;
    }
  }]);

  return SwiftPMTaskRunner;
})();

exports.SwiftPMTaskRunner = SwiftPMTaskRunner;