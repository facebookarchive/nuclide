'use strict';

var _syncAtomCommands;

function _load_syncAtomCommands() {
  return _syncAtomCommands = _interopRequireDefault(require('../../commons-atom/sync-atom-commands'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _LocalStorageJsonTable;

function _load_LocalStorageJsonTable() {
  return _LocalStorageJsonTable = require('../../commons-atom/LocalStorageJsonTable');
}

var _PanelRenderer;

function _load_PanelRenderer() {
  return _PanelRenderer = _interopRequireDefault(require('../../commons-atom/PanelRenderer'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('nuclide-commons/redux-observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
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
  return _Reducers = _interopRequireWildcard(require('./redux/Reducers'));
}

var _trackingMiddleware;

function _load_trackingMiddleware() {
  return _trackingMiddleware = require('./trackingMiddleware');
}

var _createPanelItem;

function _load_createPanelItem() {
  return _createPanelItem = require('./ui/createPanelItem');
}

var _atom = require('atom');

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: use a more general versioning mechanism.
// Perhaps Atom should provide packages with some way of doing this.
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

const SERIALIZED_VERSION = 2;
// These match task types with shortcuts defined in nuclide-task-runner.json
const COMMON_TASK_TYPES = ['build', 'run', 'test', 'debug'];

function getVisible(event) {
  if (event.detail != null && typeof event.detail === 'object') {
    const { visible } = event.detail;
    return visible != null ? Boolean(visible) : null;
  }
  return null;
}

class Activation {

  constructor(rawState) {
    let serializedState = rawState;
    if (serializedState != null && serializedState.version !== SERIALIZED_VERSION) {
      serializedState = null;
    }

    // The serialized state that Atom gives us here is based on the open roots. However, users often
    // open an empty window and then add a root (especially with remote projects). We need to go
    // outside of Atom's normal serialization mechanism to account for this.
    const preferencesForWorkingRoots = new (_LocalStorageJsonTable || _load_LocalStorageJsonTable()).LocalStorageJsonTable('nuclide:nuclide-task-runner:working-root-preferences');

    const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
    const epicOptions = { preferencesForWorkingRoots };
    const rootEpic = (actions, store) => (0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics)(actions, store, epicOptions);
    this._store = (0, (_redux || _load_redux()).createStore)((0, (_redux || _load_redux()).combineReducers)(_Reducers || _load_Reducers()), {
      visible: getInitialVisibility(serializedState, preferencesForWorkingRoots)
    }, (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)(rootEpic), (_trackingMiddleware || _load_trackingMiddleware()).trackingMiddleware));
    const states = _rxjsBundlesRxMinJs.Observable.from(this._store).filter(state => state.taskRunnersReady).distinctUntilChanged().share();
    this._actionCreators = (0, (_redux || _load_redux()).bindActionCreators)(_Actions || _load_Actions(), this._store.dispatch);
    this._panelRenderer = new (_PanelRenderer || _load_PanelRenderer()).default({
      location: 'top',
      createItem: () => (0, (_createPanelItem || _load_createPanelItem()).createPanelItem)(this._store)
    });

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(preferencesForWorkingRoots, activateInitialPackagesObservable().subscribe(() => {
      this._store.dispatch((_Actions || _load_Actions()).didActivateInitialPackages());
    }), this._panelRenderer, atom.commands.add('atom-workspace', {
      'nuclide-task-runner:toggle-toolbar-visibility': event => {
        this._actionCreators.requestToggleToolbarVisibility(getVisible(event));
      }
    }),
    // Add a command for each enabled task in each enabled task runner
    (0, (_syncAtomCommands || _load_syncAtomCommands()).default)(states.map(state => state.statesForTaskRunners).distinctUntilChanged().map(statesForTaskRunners => {
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
          this._actionCreators.runTask(Object.assign({}, taskMeta, { taskRunner }));
        }
      }
    })),
    // Add a command for each enabled common task with mapped keyboard shortcuts
    (0, (_syncAtomCommands || _load_syncAtomCommands()).default)(states.map(state => {
      const { activeTaskRunner, isUpdatingTaskRunners } = state;
      if (isUpdatingTaskRunners || !activeTaskRunner) {
        return [];
      }
      const taskRunnerState = state.statesForTaskRunners.get(activeTaskRunner);
      if (!taskRunnerState) {
        return [];
      }
      return taskRunnerState.tasks;
    }).distinctUntilChanged((_collection || _load_collection()).arrayEqual).map(tasks => new Set(tasks.filter(task => task.disabled !== true && COMMON_TASK_TYPES.includes(task.type)))), taskMeta => ({
      'atom-workspace': {
        [`nuclide-task-runner:${taskMeta.type}`]: () => {
          this._actionCreators.runTask(Object.assign({}, taskMeta, {
            taskRunner: this._store.getState().activeTaskRunner
          }));
        }
      }
    })),
    // Add a toggle command for each enabled task runner
    (0, (_syncAtomCommands || _load_syncAtomCommands()).default)(states.map(state => state.statesForTaskRunners).distinctUntilChanged().map(statesForTaskRunners => {
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
      this._panelRenderer.render({ visible });
    }),
    // Add a "stop" command when a task is running.
    states.map(state => state.runningTask != null).distinctUntilChanged().switchMap(taskIsRunning => taskIsRunning ? _rxjsBundlesRxMinJs.Observable.create(() => new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-workspace',
    // eslint-disable-next-line nuclide-internal/atom-apis
    'nuclide-task-runner:stop-task', () => {
      this._actionCreators.stopTask();
    }))) : _rxjsBundlesRxMinJs.Observable.empty()).subscribe());
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeCurrentWorkingDirectory(api) {
    this._disposables.add(api.observeCwd(directory => {
      this._actionCreators.setProjectRoot(directory);
    }));
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-task-runner');
    toolBar.addSpacer({
      priority: 400
    });
    const { element } = toolBar.addButton({
      callback: 'nuclide-task-runner:toggle-toolbar-visibility',
      tooltip: 'Toggle Task Runner Toolbar',
      iconset: 'ion',
      icon: 'play',
      priority: 401
    });
    element.className += ' nuclide-task-runner-tool-bar-button';

    const buttonUpdatesDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    // $FlowFixMe: Update rx defs to accept ish with Symbol.observable
    _rxjsBundlesRxMinJs.Observable.from(this._store).subscribe(state => {
      if (state.taskRunners.length > 0) {
        element.removeAttribute('hidden');
      } else {
        element.setAttribute('hidden', 'hidden');
      }
    }));

    // Remove the button from the toolbar.
    const buttonPresenceDisposable = new _atom.Disposable(() => {
      toolBar.removeItems();
    });

    // If this package is disabled, stop updating the button and remove it from the toolbar.
    this._disposables.add(buttonUpdatesDisposable, buttonPresenceDisposable);

    // If tool-bar is disabled, stop updating the button state and remove tool-bar related cleanup
    // from this package's disposal actions.
    return new _atom.Disposable(() => {
      buttonUpdatesDisposable.dispose();
      this._disposables.remove(buttonUpdatesDisposable);
      this._disposables.remove(buttonPresenceDisposable);
    });
  }

  consumeConsole(service) {
    this._actionCreators.setConsoleService(service);
    return new _atom.Disposable(() => this._actionCreators.setConsoleService(null));
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
        return new _atom.Disposable(() => {
          if (pkg != null) {
            pkg._actionCreators.unregisterTaskRunner(taskRunner);
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
          throw new Error('Invariant violation: "pkg != null"');
        }

        return pkg._store.getState().visible;
      },
      toggle() {
        if (!(pkg != null)) {
          throw new Error('Invariant violation: "pkg != null"');
        }

        pkg._actionCreators.requestToggleToolbarVisibility();
      }
    };
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);

function activateInitialPackagesObservable() {
  // flowlint-next-line sketchy-null-mixed:off
  if (atom.packages.hasActivatedInitialPackages) {
    return _rxjsBundlesRxMinJs.Observable.of(undefined);
  }
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.packages.onDidActivateInitialPackages.bind(atom.packages));
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