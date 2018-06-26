'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BuckTaskRunner = exports.CONSOLE_VIEW_URI = exports.TASKS = undefined;
exports.isDebugTask = isDebugTask;
exports.getBuckSubcommandForTaskType = getBuckSubcommandForTaskType;

var _DeploymentTarget;

function _load_DeploymentTarget() {
  return _DeploymentTarget = require('./DeploymentTarget');
}

var _PlatformService;

function _load_PlatformService() {
  return _PlatformService = require('./PlatformService');
}

var _reduxMin;

function _load_reduxMin() {
  return _reduxMin = require('redux/dist/redux.min.js');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _tasks;

function _load_tasks() {
  return _tasks = require('../../commons-node/tasks');
}

var _nuclideArtillery;

function _load_nuclideArtillery() {
  return _nuclideArtillery = require('../../nuclide-artillery');
}

var _BuckBuildSystem;

function _load_BuckBuildSystem() {
  return _BuckBuildSystem = require('./BuckBuildSystem');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('../../../modules/nuclide-commons/redux-observable');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../../modules/nuclide-commons-ui/bindObservableAsProps');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('../../../modules/nuclide-commons-ui/Icon');
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
  return _Reducers = _interopRequireDefault(require('./redux/Reducers'));
}

var _BuckToolbar;

function _load_BuckToolbar() {
  return _BuckToolbar = _interopRequireDefault(require('./BuckToolbar'));
}

var _react = _interopRequireWildcard(require('react'));

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TASKS = exports.TASKS = [{
  type: 'build',
  label: 'Build',
  description: 'Build the specified Buck target',
  icon: 'tools'
}, {
  type: 'run',
  label: 'Run',
  description: 'Run the specified Buck target',
  icon: 'triangle-right'
}, {
  type: 'test',
  label: 'Test',
  description: 'Test the specified Buck target',
  icon: 'check'
}, {
  type: 'debug',
  label: 'Build and launch debugger',
  description: 'Build, launch and debug the specified Buck target',
  icon: 'nuclicon-debugger'
}, {
  type: 'debug-launch-no-build',
  label: 'Launch debugger (skip build)',
  description: 'Launch and debug the specified Buck target (skip building)',
  icon: 'nuclicon-debugger'
}, {
  type: 'debug-attach',
  label: 'Attach Debugger',
  description: 'Attach the debugger to the specified Buck target',
  icon: 'nuclicon-debugger'
}];

// This must match URI defined in ../../nuclide-console/lib/ui/ConsoleContainer
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

const CONSOLE_VIEW_URI = exports.CONSOLE_VIEW_URI = 'atom://nuclide/console';

function shouldEnableTask(taskType, ruleType) {
  switch (taskType) {
    case 'build':
    case 'test':
      return true;
    case 'run':
      return ruleType.endsWith('binary');
    case 'debug':
    case 'debug-attach':
    case 'debug-launch-no-build':
      return ruleType.endsWith('binary') || ruleType.endsWith('test');
    default:
      return false;
  }
}

function isDebugTask(taskType) {
  return taskType.startsWith('debug');
}

function getBuckSubcommandForTaskType(taskType) {
  if (!(taskType === 'build' || taskType === 'run' || taskType === 'test')) {
    throw new Error('Invariant violation: "taskType === \'build\' || taskType === \'run\' || taskType === \'test\'"');
  }

  return taskType;
}

class BuckTaskRunner {

  constructor(initialState) {
    this.id = 'buck';
    this.name = 'Buck';
    this._buildSystem = new (_BuckBuildSystem || _load_BuckBuildSystem()).BuckBuildSystem();
    this._serializedState = initialState;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._platformService = new (_PlatformService || _load_PlatformService()).PlatformService();
    this._completedTasksObservable = new _rxjsBundlesRxMinJs.Subject();
  }

  getExtraUi() {
    if (this._extraUi == null) {
      const store = this._getStore();
      const boundActions = {
        setBuildTarget: buildTarget => store.dispatch((_Actions || _load_Actions()).setBuildTarget(buildTarget)),
        setDeploymentTarget: deploymentTarget => store.dispatch((_Actions || _load_Actions()).setDeploymentTarget(deploymentTarget)),
        setTaskSettings: settings => store.dispatch((_Actions || _load_Actions()).setTaskSettings(settings))
      };
      this._extraUi = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(
      // $FlowFixMe: type symbol-observable
      _rxjsBundlesRxMinJs.Observable.from(store).map(appState => Object.assign({ appState }, boundActions)).filter(props => props.appState.buckRoot != null), (_BuckToolbar || _load_BuckToolbar()).default);
    }
    return this._extraUi;
  }

  getIcon() {
    return () => _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'nuclicon-buck', className: 'nuclide-buck-task-runner-icon' });
  }

  getBuildSystem() {
    return this._buildSystem;
  }

  getPlatformService() {
    return this._platformService;
  }

  getBuildTarget() {
    return this._getStore().getState().buildTarget;
  }

  getCompletedTasks() {
    return this._completedTasksObservable;
  }

  setBuildTarget(buildTarget) {
    this._getStore().dispatch((_Actions || _load_Actions()).setBuildTarget(buildTarget));
  }

  setProjectRoot(projectRoot, callback) {
    // $FlowFixMe: type symbol-observable
    const storeReady = _rxjsBundlesRxMinJs.Observable.from(this._getStore()).distinctUntilChanged().filter(state => !state.isLoadingBuckProject && state.projectRoot === projectRoot).share();

    const enabledObservable = storeReady.map(state => state.buckRoot != null).distinctUntilChanged();

    const tasksObservable = storeReady.map(state => {
      const { buildRuleType, platformGroups, selectedDeploymentTarget } = state;

      const tasksFromPlatform = new Set();
      if (selectedDeploymentTarget != null && selectedDeploymentTarget.platform.isMobile) {
        selectedDeploymentTarget.platform.tasksForDevice(selectedDeploymentTarget.device).forEach(taskType => tasksFromPlatform.add(taskType));
      } else if (buildRuleType != null) {
        const ruleType = buildRuleType;
        platformGroups.forEach(platformGroup => {
          platformGroup.platforms.forEach(platform => {
            if (!platform.isMobile) {
              platform.tasksForBuildRuleType(ruleType).forEach(taskType => tasksFromPlatform.add(taskType));
            }
          });
        });
      }
      return TASKS.map(task => {
        const enabled = !state.isLoadingPlatforms && buildRuleType != null && (tasksFromPlatform.size > 0 ? tasksFromPlatform.has(task.type) : shouldEnableTask(task.type, buildRuleType.type));

        return Object.assign({}, task, { disabled: !enabled });
      });
    }).distinctUntilChanged((a, b) => (0, (_collection || _load_collection()).arrayEqual)(a, b, (_shallowequal || _load_shallowequal()).default));

    const subscription = _rxjsBundlesRxMinJs.Observable.combineLatest(enabledObservable, tasksObservable).subscribe(([enabled, tasks]) => callback(enabled, tasks));

    this._getStore().dispatch((_Actions || _load_Actions()).setProjectRoot(projectRoot));

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(subscription);
  }

  _getStore() {
    if (this._store == null) {
      if (!(this._serializedState != null)) {
        throw new Error('Invariant violation: "this._serializedState != null"');
      }

      const initialState = {
        platformGroups: [],
        platformService: this._platformService,
        projectRoot: null,
        buckRoot: null,
        buckversionFileContents: null,
        isLoadingBuckProject: false,
        isLoadingRule: false,
        isLoadingPlatforms: false,
        buildTarget: this._serializedState.buildTarget || '',
        buildRuleType: null,
        selectedDeploymentTarget: null,
        userSelectedDeploymentTarget: null,
        taskSettings: this._serializedState.taskSettings || {},
        platformProviderUi: null,
        lastSessionPlatformGroupName: this._serializedState.selectedPlatformGroupName,
        lastSessionPlatformName: this._serializedState.selectedPlatformName,
        lastSessionDeviceGroupName: this._serializedState.selectedDeviceGroupName,
        lastSessionDeviceName: this._serializedState.selectedDeviceName
      };
      const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
      const rootEpic = (actions, store) => (0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics)(actions, store)
      // Log errors and continue.
      .catch((err, stream) => {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-buck').error(err);
        return stream;
      });
      this._store = (0, (_reduxMin || _load_reduxMin()).createStore)((_Reducers || _load_Reducers()).default, initialState, (0, (_reduxMin || _load_reduxMin()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)(rootEpic)));
    }
    return this._store;
  }

  getCompilationDatabaseParamsForCurrentContext() {
    const { selectedDeploymentTarget } = this._getStore().getState();
    const empty = { flavorsForTarget: [], args: [], useDefaultPlatform: true };
    if (selectedDeploymentTarget == null) {
      return empty;
    }
    const { platform } = selectedDeploymentTarget;
    if (typeof platform.getCompilationDatabaseParams === 'function') {
      return platform.getCompilationDatabaseParams();
    }
    return empty;
  }

  runTask(taskType) {
    // eslint-disable-next-line nuclide-internal/atom-apis
    atom.workspace.open(CONSOLE_VIEW_URI, { searchAllPanes: true });

    const state = this._getStore().getState();
    const {
      buckRoot,
      buildRuleType,
      buildTarget,
      selectedDeploymentTarget,
      taskSettings
    } = state;

    if (!(buckRoot != null)) {
      throw new Error('Invariant violation: "buckRoot != null"');
    }

    if (!buildRuleType) {
      throw new Error('Invariant violation: "buildRuleType"');
    }

    const deploymentTargetString = (0, (_DeploymentTarget || _load_DeploymentTarget()).formatDeploymentTarget)(selectedDeploymentTarget);
    const deploymentString = deploymentTargetString === '' ? '' : ` on "${deploymentTargetString}"`;

    const task = (0, (_tasks || _load_tasks()).taskFromObservable)(_rxjsBundlesRxMinJs.Observable.concat((0, (_tasks || _load_tasks()).createMessage)(`Resolving ${taskType} command for "${buildTarget}"${deploymentString}`, 'log'), _rxjsBundlesRxMinJs.Observable.defer(() => {
      const trace = (_nuclideArtillery || _load_nuclideArtillery()).NuclideArtilleryTrace.begin('nuclide_buck', taskType);
      if (selectedDeploymentTarget) {
        const { platform, device } = selectedDeploymentTarget;
        return platform.runTask(this._buildSystem, taskType, buildRuleType.buildTarget, taskSettings, device).do({
          error() {
            trace.end();
          },
          complete() {
            trace.end();
          }
        });
      } else {
        let subcommand;
        if (isDebugTask(taskType)) {
          if (buildRuleType.type.endsWith('test')) {
            subcommand = 'test';
          } else {
            subcommand = 'build';
          }
        } else {
          subcommand = getBuckSubcommandForTaskType(taskType);
        }
        return this._buildSystem.runSubcommand(buckRoot, subcommand, buildRuleType.buildTarget, taskSettings, isDebugTask(taskType), null).do({
          error() {
            trace.end();
          },
          complete() {
            trace.end();
          }
        });
      }
    })));

    task.onDidComplete(() => {
      this._completedTasksObservable.next({
        buckRoot,
        buildRuleType,
        buildTarget,
        deploymentTarget: selectedDeploymentTarget,
        taskSettings
      });
    });

    return Object.assign({}, task, {
      getTrackingData: () => ({
        buildTarget,
        deploymentTarget: deploymentTargetString,
        ruleType: buildRuleType.type,
        taskSettings: state.taskSettings
      })
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize() {
    // If we haven't had to load and create the Flux stuff yet, don't do it now.
    if (this._store == null) {
      return;
    }
    const state = this._store.getState();
    const { buildTarget, taskSettings } = state;
    const target = state.selectedDeploymentTarget;
    let selectedPlatformGroupName;
    let selectedPlatformName;
    let selectedDeviceGroupName;
    let selectedDeviceName;
    if (target != null) {
      selectedPlatformGroupName = target.platformGroup.name;
      selectedPlatformName = target.platform.name;
      selectedDeviceGroupName = target.deviceGroup != null ? target.deviceGroup.name : null;
      selectedDeviceName = target.device != null ? target.device.name : null;
    } else {
      // In case the user quits before the session is restored, forward the session restoration.
      selectedPlatformGroupName = state.lastSessionPlatformGroupName;
      selectedPlatformName = state.lastSessionPlatformName;
      selectedDeviceGroupName = state.lastSessionDeviceGroupName;
      selectedDeviceName = state.lastSessionDeviceName;
    }

    return {
      buildTarget,
      taskSettings,
      selectedPlatformGroupName,
      selectedPlatformName,
      selectedDeviceGroupName,
      selectedDeviceName
    };
  }
}
exports.BuckTaskRunner = BuckTaskRunner;