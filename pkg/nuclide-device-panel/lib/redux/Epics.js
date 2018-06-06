'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pollDevicesEpic = pollDevicesEpic;
exports.pollProcessesEpic = pollProcessesEpic;
exports.setDeviceEpic = setDeviceEpic;
exports.setDeviceTypesEpic = setDeviceTypesEpic;
exports.setDeviceTypeEpic = setDeviceTypeEpic;
exports.setProcessesEpic = setProcessesEpic;
exports.setAppInfoEpic = setAppInfoEpic;
exports.setDeviceTypeComponentsEpic = setDeviceTypeComponentsEpic;

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _collection;

function _load_collection() {
  return _collection = require('../../../../modules/nuclide-commons/collection');
}

var _SimpleCache;

function _load_SimpleCache() {
  return _SimpleCache = require('../../../../modules/nuclide-commons/SimpleCache');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _providers;

function _load_providers() {
  return _providers = require('../providers');
}

var _DeviceTask;

function _load_DeviceTask() {
  return _DeviceTask = require('../DeviceTask');
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function pollDevicesEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).TOGGLE_DEVICE_POLLING).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).TOGGLE_DEVICE_POLLING)) {
      throw new Error('Invariant violation: "action.type === Actions.TOGGLE_DEVICE_POLLING"');
    }

    return [store.getState(), action.payload.isActive];
  }).distinctUntilChanged(([stateA, isActiveA], [stateB, isActiveB]) => stateA.deviceType === stateB.deviceType && stateA.host === stateB.host && isActiveA === isActiveB).switchMap(([state, isActive]) => {
    if (state.deviceType == null || !isActive) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    for (const fetcher of (0, (_providers || _load_providers()).getProviders)().deviceList) {
      if (fetcher.getType() === state.deviceType) {
        return fetcher.observe(state.host).map(devices => (_Actions || _load_Actions()).setDevices(devices));
      }
    }
    return _rxjsBundlesRxMinJs.Observable.empty();
  });
}

function pollProcessesEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).TOGGLE_PROCESS_POLLING).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).TOGGLE_PROCESS_POLLING)) {
      throw new Error('Invariant violation: "action.type === Actions.TOGGLE_PROCESS_POLLING"');
    }

    return _rxjsBundlesRxMinJs.Observable.of([store.getState(), action.payload.isActive]);
  }).distinctUntilChanged(([stateA, isActiveA], [stateB, isActiveB]) => stateA.deviceType === stateB.deviceType && stateA.host === stateB.host && (0, (_shallowequal || _load_shallowequal()).default)(stateA.device, stateB.device) && isActiveA === isActiveB).switchMap(([state, isActive]) => {
    const device = state.device;
    if (device == null || !isActive) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    const providers = Array.from((0, (_providers || _load_providers()).getProviders)().deviceProcesses).filter(provider => provider.getType() === state.deviceType);
    if (providers[0] != null) {
      return providers[0].observe(state.host, device).map(processes => (_Actions || _load_Actions()).setProcesses(processes));
    }
    return _rxjsBundlesRxMinJs.Observable.empty();
  });
}

function setDeviceEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_DEVICE).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_DEVICE)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_DEVICE"');
    }

    const state = store.getState();
    return _rxjsBundlesRxMinJs.Observable.merge(getInfoTables(state).switchMap(infoTables => _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setInfoTables(infoTables))), getProcessTasks(state).switchMap(processTasks => _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setProcessTasks(processTasks))), getDeviceTasks(state).switchMap(deviceTasks => _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setDeviceTasks(deviceTasks))));
  });
}

function setDeviceTypesEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_DEVICE_TYPES).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_DEVICE_TYPES)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_DEVICE_TYPES"');
    }

    const state = store.getState();
    const deviceType = state.deviceType != null ? state.deviceType : state.deviceTypes[0];
    return _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setDeviceType(deviceType)), _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).toggleDevicePolling(state.isPollingDevices)));
  });
}

const deviceTypeTaskCache = new (_SimpleCache || _load_SimpleCache()).SimpleCache({
  keyFactory: ([state, providerName]) => JSON.stringify([state.host, state.deviceType, providerName])
});

function setDeviceTypeEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_DEVICE_TYPE).switchMap(action => {
    const state = store.getState();
    return _rxjsBundlesRxMinJs.Observable.of(Array.from((0, (_providers || _load_providers()).getProviders)().deviceTypeTask).filter(provider => provider.getType() === state.deviceType).map(provider => deviceTypeTaskCache.getOrCreate([state, provider.getName()], () => new (_DeviceTask || _load_DeviceTask()).DeviceTask(() => provider.getTask(state.host), provider.getName())))).map(tasks => (_Actions || _load_Actions()).setDeviceTypeTasks(tasks.sort((a, b) => a.getName().localeCompare(b.getName()))));
  });
}

function setProcessesEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_PROCESSES).switchMap(action => {
    const state = store.getState();
    return getProcessTasks(state).switchMap(processTasks => _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setProcessTasks(processTasks)));
  });
}

function setAppInfoEpic(actions, store) {
  return observeProcessNamesOfInterest(actions, store).switchMap(processNames => {
    const { device, host } = store.getState();
    if (device == null || processNames.length === 0) {
      return _rxjsBundlesRxMinJs.Observable.of(new Map());
    }
    const providers = Array.from((0, (_providers || _load_providers()).getProviders)().appInfo);
    return observeAppInfoTables(processNames, providers, host, device);
  }).map(appInfoTables => (_Actions || _load_Actions()).setAppInfoTables(appInfoTables));
}

function setDeviceTypeComponentsEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_DEVICE_TYPE).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_DEVICE_TYPE)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_DEVICE_TYPE"');
    }

    const { deviceType } = action.payload;
    const { host } = store.getState();
    if (deviceType == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    const providers = Array.from((0, (_providers || _load_providers()).getProviders)().deviceTypeComponent).filter(provider => provider.getType() === deviceType);
    if (providers.length === 0) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    const combinedComponents = _rxjsBundlesRxMinJs.Observable.from(providers.map(provider => _rxjsBundlesRxMinJs.Observable.create(observer => {
      const disposable = provider.observe(host, component => {
        observer.next(component);
      });
      return () => {
        disposable.dispose();
      };
    }).startWith(null).catch(e => {
      (_log4js || _load_log4js()).default.getLogger().error(e);
      return _rxjsBundlesRxMinJs.Observable.of(null);
    }))
    // $FlowFixMe add combineAll to flow
    ).combineAll();

    const groupedComponents = combinedComponents.map(components => (_immutable || _load_immutable()).List(components).filter(c => c != null).map(c => {
      if (!(c != null)) {
        throw new Error('Invariant violation: "c != null"');
      }

      return c;
    }).groupBy(c => c.position));

    return groupedComponents.map(value => (_Actions || _load_Actions()).setDeviceTypeComponents((_immutable || _load_immutable()).Map(value)));
  });
}

function uniqueArray(array) {
  return Array.from(new Set(array));
}

// Returns an observable to an array of process names. Only process names that
// are needed by the AppInfo providers are observed. A new value is produced
// every time the list of process names changes (a new process started running
// or a running process was shut down).
function observeProcessNamesOfInterest(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_PROCESSES).map(action => {
    const providers = Array.from((0, (_providers || _load_providers()).getProviders)().appInfo);
    const processNamesOfInterest = new Set(providers.map(provider => provider.getProcessName()));
    const processes = store.getState().processes.getOrDefault([]);
    return uniqueArray(processes.filter(process => processNamesOfInterest.has(process.name)).map(process => process.name));
  }).distinctUntilChanged((_collection || _load_collection()).arrayEqual);
}

// Given a list of process names and providers it returns an observable for a
// Map. Only providers for the given process names are subscribed to. The Map
// is keyed by application name and maps to an array of AppInfoRow. The
// AppInfoRow contains the values observed on each provider for the
// corresponding application name.
// This observable only emits a value when any of value is changed.
function observeAppInfoTables(processNames, providers, host, device) {
  const observables = processNames.map(processName => {
    const providersForProcess = providers.filter(provider => provider.getProcessName() === processName);
    return observeAppInfoTable(providersForProcess, host, device);
  });

  const resultSelector = (...multipleAppInfoRows) =>
  // Creates a Map that groups by all appInfoRow by appName:
  // Map<appName, Array<AppInfoRow>>
  (0, (_collection || _load_collection()).collect)((0, (_collection || _load_collection()).arrayFlatten)(multipleAppInfoRows).map(appInfoRow => [appInfoRow.appName, appInfoRow]));

  // $FlowFixMe - combineLatest type spec doesn't support spread operator.
  return _rxjsBundlesRxMinJs.Observable.combineLatest(...observables, resultSelector);
}

function observeAppInfoTable(tableProviders, host, device) {
  return observeAppInfoProviderValues(tableProviders, host, device).map(values => {
    return tableProviders.map((provider, index) => Object.assign({
      appName: provider.getAppName(),
      name: provider.getName()
    }, values[index], { // {value, isError?}
      canUpdate: provider.canUpdate(),
      update: provider.update
    }));
  });
}

// Given an array of providers it subscribes to the values of all of them. It
// returns an observer to an array of all the produced values from the
// providers. A new array is produced every time any of values changes.
const APP_INFO_UPDATE_INTERVAL = 3000;
function observeAppInfoProviderValues(providers, host, device) {
  const observables = providers.map(provider => _rxjsBundlesRxMinJs.Observable.timer(0, APP_INFO_UPDATE_INTERVAL).switchMap(() => {
    return provider.observe(host, device).map(value => ({ value })).catch(error => _rxjsBundlesRxMinJs.Observable.of({ value: error.message, isError: true }));
  }).distinctUntilChanged((_shallowequal || _load_shallowequal()).default).do(item => {
    if (item.isError) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsActions.APPINFOTABLES_DATA_ERROR, item);
    } else {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsActions.APPINFOTABLES_DATA_VALUE, item);
    }
  }));
  // $FlowFixMe - combineLatest type spec doesn't support spread operator.
  return _rxjsBundlesRxMinJs.Observable.combineLatest(...observables);
}

function getInfoTables(state) {
  const device = state.device;
  if (device == null) {
    return _rxjsBundlesRxMinJs.Observable.of(new Map());
  }
  return _rxjsBundlesRxMinJs.Observable.merge(...Array.from((0, (_providers || _load_providers()).getProviders)().deviceInfo).filter(provider => provider.getType() === state.deviceType).map(provider => {
    return provider.isSupported(state.host).switchMap(isSupported => {
      if (!isSupported) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      return provider.fetch(state.host, device).map(list => ({
        title: provider.getTitle(),
        list,
        priority: provider.getPriority === undefined ? -1 : provider.getPriority()
      }));
    }).catch(() => _rxjsBundlesRxMinJs.Observable.empty());
  })).toArray().map(infoTables => infoTables.sort((a, b) => b.priority - a.priority).map(table => [table.title, table.list])).map(infoTables => new Map(infoTables));
}

function getProcessTasks(state) {
  const device = state.device;
  if (device == null) {
    return _rxjsBundlesRxMinJs.Observable.of([]);
  }
  return _rxjsBundlesRxMinJs.Observable.merge(...Array.from((0, (_providers || _load_providers()).getProviders)().processTask).filter(provider => provider.getType() === state.deviceType).map(provider => {
    const processes = state.processes.isError ? [] : state.processes.value;
    return provider.getSupportedPIDs(state.host, device, processes).map(supportedSet => {
      return {
        type: provider.getTaskType(),
        run: proc => provider.run(state.host, device, proc),
        isSupported: proc => supportedSet.has(proc.pid),
        name: provider.getName()
      };
    });
  })).toArray();
}

// The actual device tasks are cached so that if a task is running when the store switches back and
// forth from the device associated with that task, the same running task is used
const deviceTaskCache = new (_SimpleCache || _load_SimpleCache()).SimpleCache({
  keyFactory: ([state, providerName]) => JSON.stringify([state.host, state.deviceType, providerName])
});
function getDeviceTasks(state) {
  const device = state.device;
  if (device == null) {
    return _rxjsBundlesRxMinJs.Observable.of([]);
  }
  return _rxjsBundlesRxMinJs.Observable.merge(...Array.from((0, (_providers || _load_providers()).getProviders)().deviceTask).filter(provider => provider.getType() === state.deviceType).map(provider => {
    return provider.isSupported(state.host).switchMap(isSupported => {
      if (!isSupported) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      return _rxjsBundlesRxMinJs.Observable.of(deviceTaskCache.getOrCreate([state, provider.getName()], () => new (_DeviceTask || _load_DeviceTask()).DeviceTask(() => provider.getTask(state.host, device), provider.getName())));
    }).catch(() => _rxjsBundlesRxMinJs.Observable.empty());
  })).toArray().map(actions => actions.sort((a, b) => a.getName().localeCompare(b.getName())));
}