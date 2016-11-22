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
exports.SwiftPMTaskRunner = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../commons-node/UniversalDisposable'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../commons-node/fsPromise'));
}

var _process;

function _load_process() {
  return _process = require('../../../commons-node/process');
}

var _tasks;

function _load_tasks() {
  return _tasks = require('../../../commons-node/tasks');
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

var _SwiftPMTaskRunnerToolbar;

function _load_SwiftPMTaskRunnerToolbar() {
  return _SwiftPMTaskRunnerToolbar = _interopRequireDefault(require('./toolbar/SwiftPMTaskRunnerToolbar'));
}

var _SwiftPMAutocompletionProvider;

function _load_SwiftPMAutocompletionProvider() {
  return _SwiftPMAutocompletionProvider = _interopRequireDefault(require('./providers/SwiftPMAutocompletionProvider'));
}

var _SwiftIcon;

function _load_SwiftIcon() {
  return _SwiftIcon = require('../ui/SwiftIcon');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The primary controller for spawning SwiftPM tasks, such as building a
 * package, or running its tests. This class conforms to Nuclide's TaskRunner
 * interface.
 */


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
let SwiftPMTaskRunner = exports.SwiftPMTaskRunner = class SwiftPMTaskRunner {

  constructor(initialState) {
    this.id = 'swiftpm';
    this.name = 'Swift';
    this._initialState = initialState;
    this._outputMessages = new _rxjsBundlesRxMinJs.Subject();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._outputMessages);
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize() {
    return this._getFlux().store.serialize();
  }

  getExtraUi() {
    var _getFlux = this._getFlux();

    const store = _getFlux.store,
          actions = _getFlux.actions;

    return class ExtraUi extends _reactForAtom.React.Component {

      render() {
        return _reactForAtom.React.createElement((_SwiftPMTaskRunnerToolbar || _load_SwiftPMTaskRunnerToolbar()).default, {
          store: store,
          actions: actions,
          activeTaskType: this.props.activeTaskType
        });
      }
    };
  }

  observeTaskList(callback) {
    callback((_SwiftPMTaskRunnerTaskMetadata || _load_SwiftPMTaskRunnerTaskMetadata()).SwiftPMTaskRunnerTaskMetadata);
    return new _atom.Disposable();
  }

  getIcon() {
    return (_SwiftIcon || _load_SwiftIcon()).SwiftIcon;
  }

  runTask(taskName) {
    const store = this._getFlux().store;
    const chdir = store.getChdir();
    const configuration = store.getConfiguration();
    const buildPath = store.getBuildPath();

    let command;
    switch (taskName) {
      case (_SwiftPMTaskRunnerTaskMetadata || _load_SwiftPMTaskRunnerTaskMetadata()).SwiftPMTaskRunnerBuildTaskMetadata.type:
        command = (0, (_SwiftPMTaskRunnerCommands || _load_SwiftPMTaskRunnerCommands()).buildCommand)(chdir, configuration, store.getXcc(), store.getXlinker(), store.getXswiftc(), buildPath);
        break;
      case (_SwiftPMTaskRunnerTaskMetadata || _load_SwiftPMTaskRunnerTaskMetadata()).SwiftPMTaskRunnerTestTaskMetadata.type:
        command = (0, (_SwiftPMTaskRunnerCommands || _load_SwiftPMTaskRunnerCommands()).testCommand)(chdir, buildPath);
        break;
      default:
        throw new Error(`Unknown task name: ${ taskName }`);
    }

    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:toggle', { visible: true });
    this._logOutput(`${ command.command } ${ command.args.join(' ') }`, 'log');

    const observable = (0, (_process || _load_process()).observeProcess)(() => (0, (_process || _load_process()).safeSpawn)(command.command, command.args)).do(message => {
      switch (message.kind) {
        case 'stderr':
        case 'stdout':
          this._logOutput(message.data, 'log');
          break;
        case 'exit':
          if (message.exitCode === 0) {
            this._logOutput(`${ command.command } exited successfully.`, 'success');
            this._getFlux().actions.updateCompileCommands(chdir, configuration, buildPath);
          } else {
            this._logOutput(`${ command.command } failed with ${ (0, (_process || _load_process()).exitEventToMessage)(message) }`, 'error');
          }
          break;
        default:
          break;
      }
    }).ignoreElements();

    const task = (0, (_tasks || _load_tasks()).taskFromObservable)(observable);
    return Object.assign({}, task, {
      cancel: () => {
        this._logOutput('Task cancelled.', 'warning');
        task.cancel();
      }
    });
  }

  getAutocompletionProvider() {
    if (!this._autocompletionProvider) {
      this._autocompletionProvider = new (_SwiftPMAutocompletionProvider || _load_SwiftPMAutocompletionProvider()).default(this._getFlux().store);
    }
    return this._autocompletionProvider;
  }

  getOutputMessages() {
    return this._outputMessages;
  }

  setProjectRoot(projectRoot) {
    if (projectRoot) {
      const path = projectRoot.getPath();
      (_fsPromise || _load_fsPromise()).default.exists(`${ path }/Package.swift`).then(fileExists => {
        if (fileExists) {
          this._getFlux().actions.updateChdir(path);
        }
      });
    }
  }

  _logOutput(text, level) {
    this._outputMessages.next({ text: text, level: level });
  }

  _getFlux() {
    if (!this._flux) {
      const dispatcher = new (_SwiftPMTaskRunnerDispatcher || _load_SwiftPMTaskRunnerDispatcher()).default();
      const store = new (_SwiftPMTaskRunnerStore || _load_SwiftPMTaskRunnerStore()).default(dispatcher, this._initialState);
      this._disposables.add(store);
      const actions = new (_SwiftPMTaskRunnerActions || _load_SwiftPMTaskRunnerActions()).default(dispatcher);
      this._flux = { store: store, actions: actions };
    }
    return this._flux;
  }
};