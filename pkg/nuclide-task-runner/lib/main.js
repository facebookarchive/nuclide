"use strict";

function _memoize2() {
  const data = _interopRequireDefault(require("lodash/memoize"));

  _memoize2 = function () {
    return data;
  };

  return data;
}

function _bindObservableAsProps() {
  const data = require("../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _renderReactRoot() {
  const data = require("../../../modules/nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

function _syncAtomCommands() {
  const data = _interopRequireDefault(require("../../commons-atom/sync-atom-commands"));

  _syncAtomCommands = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _LocalStorageJsonTable() {
  const data = require("../../commons-atom/LocalStorageJsonTable");

  _LocalStorageJsonTable = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _reduxObservable() {
  const data = require("../../../modules/nuclide-commons/redux-observable");

  _reduxObservable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function Epics() {
  const data = _interopRequireWildcard(require("./redux/Epics"));

  Epics = function () {
    return data;
  };

  return data;
}

function Reducers() {
  const data = _interopRequireWildcard(require("./redux/Reducers"));

  Reducers = function () {
    return data;
  };

  return data;
}

function _getToolbarProps() {
  const data = _interopRequireDefault(require("./ui/getToolbarProps"));

  _getToolbarProps = function () {
    return data;
  };

  return data;
}

function _Toolbar() {
  const data = _interopRequireDefault(require("./ui/Toolbar"));

  _Toolbar = function () {
    return data;
  };

  return data;
}

function _reduxMin() {
  const data = require("redux/dist/redux.min.js");

  _reduxMin = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: use a more general versioning mechanism.
// Perhaps Atom should provide packages with some way of doing this.
const SERIALIZED_VERSION = 2; // These match task types with shortcuts defined in nuclide-task-runner.json

const COMMON_TASK_TYPES = ['build', 'run', 'test', 'debug'];

function getVisible(event) {
  // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
  if (event.detail != null && typeof event.detail === 'object') {
    const {
      visible
    } = event.detail;
    return visible != null ? Boolean(visible) : null;
  }

  return null;
}

class Activation {
  constructor(rawState) {
    let serializedState = rawState;

    if (serializedState != null && serializedState.version !== SERIALIZED_VERSION) {
      serializedState = null;
    } // The serialized state that Atom gives us here is based on the open roots. However, users often
    // open an empty window and then add a root (especially with remote projects). We need to go
    // outside of Atom's normal serialization mechanism to account for this.


    const preferencesForWorkingRoots = new (_LocalStorageJsonTable().LocalStorageJsonTable)('nuclide:nuclide-task-runner:working-root-preferences');
    const initialVisibility = getInitialVisibility(serializedState, preferencesForWorkingRoots);
    (0, _nuclideAnalytics().track)('nuclide-task-runner:initialized', {
      visible: initialVisibility
    });
    const epics = Object.keys(Epics()).map(k => Epics()[k]).filter(epic => typeof epic === 'function');
    const epicOptions = {
      preferencesForWorkingRoots
    };

    const rootEpic = (actions, store) => (0, _reduxObservable().combineEpics)(...epics)(actions, store, epicOptions);

    this._store = (0, _reduxMin().createStore)((0, _reduxMin().combineReducers)(Reducers()), {
      visible: initialVisibility
    }, (0, _reduxMin().applyMiddleware)((0, _reduxObservable().createEpicMiddleware)(rootEpic)));

    const states = _RxMin.Observable.from(this._store).filter(state => state.initialPackagesActivated).distinctUntilChanged().share();

    this._actionCreators = (0, _reduxMin().bindActionCreators)(Actions(), this._store.dispatch);
    this._panel = atom.workspace.addTopPanel({
      item: {
        getElement: (0, _memoize2().default)(() => {
          const props = (0, _getToolbarProps().default)(this._store);
          const StatefulToolbar = (0, _bindObservableAsProps().bindObservableAsProps)(props, _Toolbar().default);
          return (0, _renderReactRoot().renderReactRoot)(React.createElement(StatefulToolbar, null));
        })
      },
      visible: false
    });
    this._disposables = new (_UniversalDisposable().default)(preferencesForWorkingRoots, activateInitialPackagesObservable().subscribe(() => {
      this._store.dispatch(Actions().didActivateInitialPackages());
    }), () => {
      this._panel.destroy();
    }, atom.commands.add('atom-workspace', {
      'nuclide-task-runner:toggle-toolbar-visibility': event => {
        this._actionCreators.requestToggleToolbarVisibility(getVisible(event));
      }
    }), // Add a command for each enabled task in each enabled task runner
    (0, _syncAtomCommands().default)(states.map(state => state.statesForTaskRunners).distinctUntilChanged().map(statesForTaskRunners => {
      const taskRunnersAndTasks = new Set();
      statesForTaskRunners.forEach((state, taskRunner) => {
        state.tasks.forEach(task => {
          if (task.disabled !== true) {
            taskRunnersAndTasks.add([taskRunner, task]);
          }
        });
      });
      return taskRunnersAndTasks;
    }), ([taskRunner, taskMeta]) => ({
      'atom-workspace': {
        [`nuclide-task-runner:${taskRunner.name.toLowerCase().replace(' ', '-')}-${taskMeta.type}`]: () => {
          this._actionCreators.runTask(Object.assign({}, taskMeta, {
            taskRunner
          }));
        }
      }
    })), // Add a command for each enabled common task with mapped keyboard shortcuts
    (0, _syncAtomCommands().default)(states.map(state => {
      const {
        activeTaskRunner,
        readyTaskRunners,
        taskRunners
      } = state;

      if (taskRunners.count() > readyTaskRunners.count() || !activeTaskRunner) {
        return [];
      }

      const taskRunnerState = state.statesForTaskRunners.get(activeTaskRunner);

      if (!taskRunnerState) {
        return [];
      }

      return taskRunnerState.tasks;
    }).distinctUntilChanged(_collection().arrayEqual).map(tasks => new Set(tasks.filter(task => task.disabled !== true && COMMON_TASK_TYPES.includes(task.type)))), taskMeta => ({
      'atom-workspace': {
        [`nuclide-task-runner:${taskMeta.type}`]: () => {
          this._actionCreators.runTask(Object.assign({}, taskMeta, {
            taskRunner: this._store.getState().activeTaskRunner
          }));
        }
      }
    })), // Add a toggle command for each enabled task runner
    (0, _syncAtomCommands().default)(states.map(state => state.statesForTaskRunners).distinctUntilChanged().map(statesForTaskRunners => {
      const taskRunners = new Set();
      statesForTaskRunners.forEach((state, runner) => {
        if (state.enabled) {
          taskRunners.add(runner);
        }
      });
      return taskRunners;
    }), taskRunner => ({
      'atom-workspace': {
        [`nuclide-task-runner:toggle-${taskRunner.name.toLowerCase()}-toolbar`]: event => {
          this._actionCreators.requestToggleToolbarVisibility(getVisible(event), taskRunner);
        }
      }
    }), taskRunner => taskRunner.id), states.map(state => state.visible).distinctUntilChanged().subscribe(visible => {
      if (visible) {
        this._panel.show();
      } else {
        this._panel.hide();
      }
    }), // Add a "stop" command when a task is running.
    states.map(state => state.runningTask != null).distinctUntilChanged().switchMap(taskIsRunning => taskIsRunning ? _RxMin.Observable.create(() => new (_UniversalDisposable().default)(atom.commands.add('atom-workspace', // eslint-disable-next-line nuclide-internal/atom-apis
    'nuclide-task-runner:stop-task', () => {
      this._actionCreators.stopTask();
    }))) : _RxMin.Observable.empty()).subscribe());
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeCurrentWorkingDirectory(api) {
    let pkg = this;
    const cwdSubscription = api.observeCwd(directory => {
      if (!(pkg != null)) {
        throw new Error('callback invoked after package deactivated');
      }

      pkg._actionCreators.setProjectRoot(directory);
    });

    this._disposables.add(cwdSubscription, () => {
      pkg = null;
    });

    return new (_UniversalDisposable().default)(() => {
      if (pkg != null) {
        cwdSubscription.dispose();

        pkg._disposables.remove(cwdSubscription);

        pkg._actionCreators.setProjectRoot(null);
      }
    });
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-task-runner');
    toolBar.addSpacer({
      priority: 400
    });
    const {
      element
    } = toolBar.addButton({
      callback: 'nuclide-task-runner:toggle-toolbar-visibility',
      tooltip: 'Toggle Task Runner Toolbar',
      iconset: 'ion',
      icon: 'play',
      priority: 401
    });
    element.className += ' nuclide-task-runner-tool-bar-button';
    const buttonUpdatesDisposable = new (_UniversalDisposable().default)( // $FlowFixMe: Update rx defs to accept ish with Symbol.observable
    _RxMin.Observable.from(this._store).subscribe(state => {
      if (state.taskRunners.count() > 0) {
        element.removeAttribute('hidden');
      } else {
        element.setAttribute('hidden', 'hidden');
      }
    })); // Remove the button from the toolbar.

    const buttonPresenceDisposable = new (_UniversalDisposable().default)(() => {
      toolBar.removeItems();
    }); // If this package is disabled, stop updating the button and remove it from the toolbar.

    this._disposables.add(buttonUpdatesDisposable, buttonPresenceDisposable); // If tool-bar is disabled, stop updating the button state and remove tool-bar related cleanup
    // from this package's disposal actions.


    return new (_UniversalDisposable().default)(() => {
      buttonUpdatesDisposable.dispose();

      this._disposables.remove(buttonUpdatesDisposable);

      this._disposables.remove(buttonPresenceDisposable);
    });
  }

  consumeConsole(service) {
    let pkg = this;

    this._disposables.add(() => {
      pkg = null;
    });

    this._actionCreators.setConsoleService(service);

    return new (_UniversalDisposable().default)(() => {
      if (pkg != null) {
        pkg._actionCreators.setConsoleService(null);
      }
    });
  }

  provideTaskRunnerServiceApi() {
    let pkg = this;

    this._disposables.add(() => {
      pkg = null;
    });

    return {
      register: taskRunner => {
        if (!(pkg != null)) {
          throw new Error('Task runner service API used after deactivation');
        }

        pkg._actionCreators.registerTaskRunner(taskRunner);

        return new (_UniversalDisposable().default)(() => {
          if (pkg != null) {
            pkg._actionCreators.unregisterTaskRunner(taskRunner);
          }
        });
      },
      printToConsole: (message, taskRunner) => {
        if (!(pkg != null)) {
          throw new Error('Task runner service API used after deactivation');
        }

        this._store.dispatch({
          type: Actions().TASK_MESSAGE,
          payload: {
            taskRunner,
            message
          }
        });
      }
    };
  }

  serialize() {
    const state = this._store.getState();

    return {
      previousSessionVisible: state.visible,
      version: SERIALIZED_VERSION
    };
  }

  getDistractionFreeModeProvider() {
    let pkg = this;

    this._disposables.add(() => {
      pkg = null;
    });

    return {
      name: 'nuclide-task-runner',

      isVisible() {
        if (!(pkg != null)) {
          throw new Error("Invariant violation: \"pkg != null\"");
        }

        return pkg._store.getState().visible;
      },

      toggle() {
        if (!(pkg != null)) {
          throw new Error("Invariant violation: \"pkg != null\"");
        }

        pkg._actionCreators.requestToggleToolbarVisibility();
      }

    };
  }

}

(0, _createPackage().default)(module.exports, Activation);

function activateInitialPackagesObservable() {
  // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
  if (atom.packages.hasActivatedInitialPackages) {
    return _RxMin.Observable.of(undefined);
  }

  return (0, _event().observableFromSubscribeFunction)(atom.packages.onDidActivateInitialPackages.bind(atom.packages));
}

function getInitialVisibility(serializedState, preferencesForWorkingRoots) {
  // Unfortunately, since we haven't yet been connected to the current working directory service,
  //  we don't know what root to check the previous visibility of. We could just assume it's
  // `atom.project.getDirectories()[0]`, but using explicitly serialized package state is better.
  if (serializedState && typeof serializedState.previousSessionVisible === 'boolean') {
    return serializedState.previousSessionVisible;
  } else {
    // This collection of roots wasn't seen before.
    // Just fall back to the state of the last known session.
    const entries = preferencesForWorkingRoots.getEntries();
    const lastEntry = entries[entries.length - 1];

    if (!lastEntry || !lastEntry.value) {
      return false;
    }

    return lastEntry.value.visible;
  }
}