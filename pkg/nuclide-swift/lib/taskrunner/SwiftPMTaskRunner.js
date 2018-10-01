"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SwiftPMTaskRunner = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

var React = _interopRequireWildcard(require("react"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _tasks() {
  const data = require("../../../commons-node/tasks");

  _tasks = function () {
    return data;
  };

  return data;
}

function _SwiftPMTaskRunnerStore() {
  const data = _interopRequireDefault(require("./SwiftPMTaskRunnerStore"));

  _SwiftPMTaskRunnerStore = function () {
    return data;
  };

  return data;
}

function _SwiftPMTaskRunnerActions() {
  const data = _interopRequireDefault(require("./SwiftPMTaskRunnerActions"));

  _SwiftPMTaskRunnerActions = function () {
    return data;
  };

  return data;
}

function _SwiftPMTaskRunnerDispatcher() {
  const data = _interopRequireDefault(require("./SwiftPMTaskRunnerDispatcher"));

  _SwiftPMTaskRunnerDispatcher = function () {
    return data;
  };

  return data;
}

function _SwiftPMTaskRunnerCommands() {
  const data = require("./SwiftPMTaskRunnerCommands");

  _SwiftPMTaskRunnerCommands = function () {
    return data;
  };

  return data;
}

function _SwiftPMTaskRunnerTaskMetadata() {
  const data = require("./SwiftPMTaskRunnerTaskMetadata");

  _SwiftPMTaskRunnerTaskMetadata = function () {
    return data;
  };

  return data;
}

function _SwiftPMTaskRunnerToolbar() {
  const data = _interopRequireDefault(require("./toolbar/SwiftPMTaskRunnerToolbar"));

  _SwiftPMTaskRunnerToolbar = function () {
    return data;
  };

  return data;
}

function _SwiftPMAutocompletionProvider() {
  const data = _interopRequireDefault(require("./providers/SwiftPMAutocompletionProvider"));

  _SwiftPMAutocompletionProvider = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("../../../../modules/nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri.js"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
// This must match URI defined in ../../../nuclide-console/lib/ui/ConsoleContainer
const CONSOLE_VIEW_URI = 'atom://nuclide/console';
/**
 * The primary controller for spawning SwiftPM tasks, such as building a
 * package, or running its tests. This class conforms to Nuclide's TaskRunner
 * interface.
 */

class SwiftPMTaskRunner {
  constructor(initialState) {
    this.id = 'swiftpm';
    this.name = 'Swift';
    this._initialState = initialState;
    this._projectRoot = new _RxMin.Subject();
    this._disposables = new (_UniversalDisposable().default)(this._projectRoot.subscribe(path => this._getFlux().actions.updateProjectRoot(path)));
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize() {
    return this._getFlux().store.serialize();
  }

  getExtraUi() {
    const {
      store,
      actions
    } = this._getFlux();

    return class ExtraUi extends React.Component {
      render() {
        return React.createElement(_SwiftPMTaskRunnerToolbar().default, {
          store: store,
          actions: actions
        });
      }

    };
  }

  getIcon() {
    return () => React.createElement(_Icon().Icon, {
      icon: "nuclicon-swift",
      className: "nuclide-swift-task-runner-icon"
    });
  }

  runTask(taskName) {
    const store = this._getFlux().store;

    const chdir = (0, _nullthrows().default)(store.getProjectRoot());
    const configuration = store.getConfiguration();
    const buildPath = store.getBuildPath();
    let command;

    switch (taskName) {
      case _SwiftPMTaskRunnerTaskMetadata().SwiftPMTaskRunnerBuildTaskMetadata.type:
        command = (0, _SwiftPMTaskRunnerCommands().buildCommand)(chdir, configuration, store.getXcc(), store.getXlinker(), store.getXswiftc(), buildPath);
        break;

      case _SwiftPMTaskRunnerTaskMetadata().SwiftPMTaskRunnerTestTaskMetadata.type:
        command = (0, _SwiftPMTaskRunnerCommands().testCommand)(chdir, buildPath);
        break;

      default:
        throw new Error(`Unknown task name: ${taskName}`);
    } // eslint-disable-next-line nuclide-internal/atom-apis


    atom.workspace.open(CONSOLE_VIEW_URI, {
      searchAllPanes: true
    });
    const observable = (0, _tasks().createMessage)(`${command.command} ${command.args.join(' ')}`, 'log').concat((0, _process().observeProcess)(command.command, command.args, {
      /* TODO(T17353599) */
      isExitError: () => false
    }).catch(error => _RxMin.Observable.of({
      kind: 'error',
      error
    })) // TODO(T17463635)
    .flatMap(message => {
      switch (message.kind) {
        case 'stderr':
        case 'stdout':
          return (0, _tasks().createMessage)(message.data, 'log');

        case 'exit':
          if (message.exitCode === 0) {
            this._getFlux().actions.updateCompileCommands(chdir, configuration, buildPath);

            return (0, _tasks().createMessage)(`${command.command} exited successfully.`, 'success');
          } else {
            return (0, _tasks().createMessage)(`${command.command} failed with ${(0, _process().exitEventToMessage)(message)}`, 'error');
          }

        default:
          return _RxMin.Observable.empty();
      }
    }));
    return (0, _tasks().taskFromObservable)(observable);
  }

  getAutocompletionProvider() {
    if (!this._autocompletionProvider) {
      this._autocompletionProvider = new (_SwiftPMAutocompletionProvider().default)(this._getFlux().store);
    }

    return this._autocompletionProvider;
  }

  setProjectRoot(projectRoot, callback) {
    const storeReady = (0, _event().observableFromSubscribeFunction)(this._getFlux().store.subscribe.bind(this._getFlux().store)).map(() => this._getFlux().store).startWith(this._getFlux().store).filter(store => store.getProjectRoot() === projectRoot).share();
    const enabledObservable = storeReady.map(store => store.getProjectRoot()).distinctUntilChanged().switchMap(root => {
      // flowlint-next-line sketchy-null-string:off
      if (!root || _nuclideUri().default.isRemote(root)) {
        return _RxMin.Observable.of(false);
      }

      return this._packageFileExistsAtPath(root);
    }).distinctUntilChanged();
    const tasksObservable = storeReady.map(store => _SwiftPMTaskRunnerTaskMetadata().SwiftPMTaskRunnerTaskMetadata);

    const subscription = _RxMin.Observable.combineLatest(enabledObservable, tasksObservable).subscribe(([enabled, tasks]) => callback(enabled, tasks));

    this._projectRoot.next(projectRoot);

    return new (_UniversalDisposable().default)(subscription);
  }

  async _packageFileExistsAtPath(path) {
    return _fsPromise().default.exists(_nuclideUri().default.join(path, 'Package.swift'));
  }

  _getFlux() {
    if (!this._flux) {
      const dispatcher = new (_SwiftPMTaskRunnerDispatcher().default)();
      const store = new (_SwiftPMTaskRunnerStore().default)(dispatcher, this._initialState);

      this._disposables.add(store);

      const actions = new (_SwiftPMTaskRunnerActions().default)(dispatcher);
      this._flux = {
        store,
        actions
      };
    }

    return this._flux;
  }

}

exports.SwiftPMTaskRunner = SwiftPMTaskRunner;