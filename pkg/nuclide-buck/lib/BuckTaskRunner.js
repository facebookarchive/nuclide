"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isDebugTask = isDebugTask;
exports.getBuckSubcommandForTaskType = getBuckSubcommandForTaskType;
exports.BuckTaskRunner = exports.CONSOLE_VIEW_URI = exports.TASKS = void 0;

function _DeploymentTarget() {
  const data = require("./DeploymentTarget");

  _DeploymentTarget = function () {
    return data;
  };

  return data;
}

function _PlatformService() {
  const data = require("./PlatformService");

  _PlatformService = function () {
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

function _tasks() {
  const data = require("../../commons-node/tasks");

  _tasks = function () {
    return data;
  };

  return data;
}

function _nuclideArtillery() {
  const data = require("../../nuclide-artillery");

  _nuclideArtillery = function () {
    return data;
  };

  return data;
}

function _BuckBuildSystem() {
  const data = require("./BuckBuildSystem");

  _BuckBuildSystem = function () {
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

function _reduxObservable() {
  const data = require("../../../modules/nuclide-commons/redux-observable");

  _reduxObservable = function () {
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

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("../../../modules/nuclide-commons-ui/Icon");

  _Icon = function () {
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

function _Reducers() {
  const data = _interopRequireDefault(require("./redux/Reducers"));

  _Reducers = function () {
    return data;
  };

  return data;
}

function _BuckToolbar() {
  const data = _interopRequireDefault(require("./BuckToolbar"));

  _BuckToolbar = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _shallowequal() {
  const data = _interopRequireDefault(require("shallowequal"));

  _shallowequal = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const TASKS = [{
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
}]; // This must match URI defined in ../../nuclide-console/lib/ui/ConsoleContainer

exports.TASKS = TASKS;
const CONSOLE_VIEW_URI = 'atom://nuclide/console';
exports.CONSOLE_VIEW_URI = CONSOLE_VIEW_URI;

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
    throw new Error("Invariant violation: \"taskType === 'build' || taskType === 'run' || taskType === 'test'\"");
  }

  return taskType;
}

class BuckTaskRunner {
  constructor(initialState) {
    this.id = 'buck';
    this.name = 'Buck';
    this._buildSystem = new (_BuckBuildSystem().BuckBuildSystem)();
    this._serializedState = initialState;
    this._disposables = new (_UniversalDisposable().default)();
    this._platformService = new (_PlatformService().PlatformService)();
    this._completedTasksObservable = new _RxMin.Subject();
  }

  getExtraUi() {
    if (this._extraUi == null) {
      const store = this._getStore();

      const boundActions = {
        setBuildTarget: buildTarget => store.dispatch(Actions().setBuildTarget(buildTarget)),
        setDeploymentTarget: deploymentTarget => store.dispatch(Actions().setDeploymentTarget(deploymentTarget)),
        setTaskSettings: settings => store.dispatch(Actions().setTaskSettings(settings))
      };
      this._extraUi = (0, _bindObservableAsProps().bindObservableAsProps)( // $FlowFixMe: type symbol-observable
      _RxMin.Observable.from(store).map(appState => Object.assign({
        appState
      }, boundActions)).filter(props => props.appState.buckRoot != null), _BuckToolbar().default);
    }

    return this._extraUi;
  }

  getIcon() {
    return () => React.createElement(_Icon().Icon, {
      icon: "nuclicon-buck",
      className: "nuclide-buck-task-runner-icon"
    });
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
    this._getStore().dispatch(Actions().setBuildTarget(buildTarget));
  }

  setDeploymentTarget(preferredNames) {
    const store = this._getStore();

    const target = (0, _DeploymentTarget().selectValidDeploymentTarget)(preferredNames, store.getState().platformGroups);

    if (target != null) {
      store.dispatch(Actions().setDeploymentTarget(target));
    }
  }

  setProjectRoot(projectRoot, callback) {
    // $FlowFixMe: type symbol-observable
    const storeReady = _RxMin.Observable.from(this._getStore()).distinctUntilChanged().filter(state => !state.isLoadingBuckProject && state.projectRoot === projectRoot).share();

    const enabledObservable = storeReady.map(state => state.buckRoot != null).distinctUntilChanged();
    const tasksObservable = storeReady.map(state => {
      const {
        buildRuleType,
        platformGroups,
        selectedDeploymentTarget
      } = state;
      const tasksFromPlatform = new Set();

      if (selectedDeploymentTarget != null && selectedDeploymentTarget.platform.isMobile) {
        if (selectedDeploymentTarget.device != null) {
          selectedDeploymentTarget.platform.tasksForDevice(selectedDeploymentTarget.device).forEach(taskType => tasksFromPlatform.add(taskType));
        }
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
        return Object.assign({}, task, {
          disabled: !enabled
        });
      });
    }).distinctUntilChanged((a, b) => (0, _collection().arrayEqual)(a, b, _shallowequal().default));

    const subscription = _RxMin.Observable.combineLatest(enabledObservable, tasksObservable).subscribe(([enabled, tasks]) => callback(enabled, tasks));

    this._getStore().dispatch(Actions().setProjectRoot(projectRoot));

    return new (_UniversalDisposable().default)(subscription);
  }

  _getStore() {
    if (this._store == null) {
      if (!(this._serializedState != null)) {
        throw new Error("Invariant violation: \"this._serializedState != null\"");
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
      const epics = Object.keys(Epics()).map(k => Epics()[k]).filter(epic => typeof epic === 'function');

      const rootEpic = (actions, store) => (0, _reduxObservable().combineEpics)(...epics)(actions, store) // Log errors and continue.
      .catch((err, stream) => {
        (0, _log4js().getLogger)('nuclide-buck').error(err);
        return stream;
      });

      this._store = (0, _reduxMin().createStore)(_Reducers().default, initialState, (0, _reduxMin().applyMiddleware)((0, _reduxObservable().createEpicMiddleware)(rootEpic)));
    }

    return this._store;
  }

  getCompilationDatabaseParamsForCurrentContext() {
    const {
      selectedDeploymentTarget
    } = this._getStore().getState();

    const empty = {
      flavorsForTarget: [],
      args: [],
      useDefaultPlatform: true
    };

    if (selectedDeploymentTarget == null) {
      return empty;
    }

    const {
      platform
    } = selectedDeploymentTarget;

    if (typeof platform.getCompilationDatabaseParams === 'function') {
      return platform.getCompilationDatabaseParams();
    }

    return empty;
  }

  runTask(taskType) {
    // eslint-disable-next-line nuclide-internal/atom-apis
    atom.workspace.open(CONSOLE_VIEW_URI, {
      searchAllPanes: true
    });

    const state = this._getStore().getState();

    const {
      buckRoot,
      buildRuleType,
      buildTarget,
      selectedDeploymentTarget,
      taskSettings
    } = state;

    if (!(buckRoot != null)) {
      throw new Error("Invariant violation: \"buckRoot != null\"");
    }

    if (!buildRuleType) {
      throw new Error("Invariant violation: \"buildRuleType\"");
    }

    const deploymentTargetString = (0, _DeploymentTarget().formatDeploymentTarget)(selectedDeploymentTarget);
    const deploymentString = deploymentTargetString === '' ? '' : ` on "${deploymentTargetString}"`;
    const task = (0, _tasks().taskFromObservable)(_RxMin.Observable.concat((0, _tasks().createMessage)(`Resolving ${taskType} command for "${buildTarget}"${deploymentString}`, 'log'), _RxMin.Observable.defer(() => {
      const trace = _nuclideArtillery().NuclideArtilleryTrace.begin('nuclide_buck', taskType);

      if (selectedDeploymentTarget) {
        const {
          platform,
          device
        } = selectedDeploymentTarget;
        let runTask;

        if (platform.isMobile) {
          if (!device) {
            throw new Error("Invariant violation: \"device\"");
          }

          runTask = () => platform.runTask(this._buildSystem, taskType, buildRuleType.buildTarget, taskSettings, device);
        } else {
          runTask = () => platform.runTask(this._buildSystem, taskType, buildRuleType.buildTarget, taskSettings);
        }

        return runTask().finally(() => trace.end());
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

    const {
      buildTarget,
      taskSettings
    } = state;
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