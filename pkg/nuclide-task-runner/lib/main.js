'use strict';

var _memoize2;

function _load_memoize() {
  return _memoize2 = _interopRequireDefault(require('lodash/memoize'));
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../../modules/nuclide-commons-ui/bindObservableAsProps');
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../../modules/nuclide-commons-ui/renderReactRoot');
}

var _syncAtomCommands;

function _load_syncAtomCommands() {
  return _syncAtomCommands = _interopRequireDefault(require('../../commons-atom/sync-atom-commands'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _LocalStorageJsonTable;

function _load_LocalStorageJsonTable() {
  return _LocalStorageJsonTable = require('../../commons-atom/LocalStorageJsonTable');
}

var _event;

function _load_event() {
  return _event = require('../../../modules/nuclide-commons/event');
}

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('../../../modules/nuclide-commons/redux-observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
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

var _getToolbarProps;

function _load_getToolbarProps() {
  return _getToolbarProps = _interopRequireDefault(require('./ui/getToolbarProps'));
}

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = _interopRequireDefault(require('./ui/Toolbar'));
}

var _reduxMin;

function _load_reduxMin() {
  return _reduxMin = require('redux/dist/redux.min.js');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _ToolbarUtils;

function _load_ToolbarUtils() {
  return _ToolbarUtils = require('../../../modules/nuclide-commons-ui/ToolbarUtils');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: use a more general versioning mechanism.
// Perhaps Atom should provide packages with some way of doing this.
const SERIALIZED_VERSION = 2;
// These match task types with shortcuts defined in nuclide-task-runner.json
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

const COMMON_TASK_TYPES = ['build', 'run', 'test', 'debug'];

function getVisible(event) {
  // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
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

    const initialVisibility = getInitialVisibility(serializedState, preferencesForWorkingRoots);

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-task-runner:initialized', {
      visible: initialVisibility
    });

    const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
    const epicOptions = { preferencesForWorkingRoots };
    const rootEpic = (actions, store) => (0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics)(actions, store, epicOptions);
    this._store = (0, (_reduxMin || _load_reduxMin()).createStore)((0, (_reduxMin || _load_reduxMin()).combineReducers)(_Reducers || _load_Reducers()), { visible: initialVisibility }, (0, (_reduxMin || _load_reduxMin()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)(rootEpic)));
    const states = _rxjsBundlesRxMinJs.Observable.from(this._store).filter(state => state.initialPackagesActivated).distinctUntilChanged().share();
    this._actionCreators = (0, (_reduxMin || _load_reduxMin()).bindActionCreators)(_Actions || _load_Actions(), this._store.dispatch);
    this._panel = atom.workspace.addTopPanel({
      item: {
        getElement: (0, (_memoize2 || _load_memoize()).default)(() => {
          const props = (0, (_getToolbarProps || _load_getToolbarProps()).default)(this._store);
          const StatefulToolbar = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, (_Toolbar || _load_Toolbar()).default);
          return (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.createElement(StatefulToolbar, null));
        })
      },
      visible: false
    });

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(preferencesForWorkingRoots, activateInitialPackagesObservable().subscribe(() => {
      this._store.dispatch((_Actions || _load_Actions()).didActivateInitialPackages());
    }), () => {
      this._panel.destroy();
    }, atom.commands.add('atom-workspace', {
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
      const { activeTaskRunner, readyTaskRunners, taskRunners } = state;
      if (taskRunners.count() > readyTaskRunners.count() || !activeTaskRunner) {
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
      if (visible) {
        this._panel.show();
      } else {
        this._panel.hide();
      }
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
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
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
    const { element } = toolBar.addButton((0, (_ToolbarUtils || _load_ToolbarUtils()).makeToolbarButtonSpec)({
      callback: 'nuclide-task-runner:toggle-toolbar-visibility',
      tooltip: 'Toggle Task Runner Toolbar',
      iconset: 'ion',
      icon: 'play',
      priority: 401
    }));
    element.className += ' nuclide-task-runner-tool-bar-button';

    const buttonUpdatesDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    // $FlowFixMe: Update rx defs to accept ish with Symbol.observable
    _rxjsBundlesRxMinJs.Observable.from(this._store).subscribe(state => {
      if (state.taskRunners.count() > 0) {
        element.removeAttribute('hidden');
      } else {
        element.setAttribute('hidden', 'hidden');
      }
    }));

    // Remove the button from the toolbar.
    const buttonPresenceDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      toolBar.removeItems();
    });

    // If this package is disabled, stop updating the button and remove it from the toolbar.
    this._disposables.add(buttonUpdatesDisposable, buttonPresenceDisposable);

    // If tool-bar is disabled, stop updating the button state and remove tool-bar related cleanup
    // from this package's disposal actions.
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
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
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
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
        return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
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
          type: (_Actions || _load_Actions()).TASK_MESSAGE,
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
  // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
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