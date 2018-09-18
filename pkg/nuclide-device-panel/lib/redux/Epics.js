"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pollDevicesEpic = pollDevicesEpic;
exports.setDevicesEpic = setDevicesEpic;
exports.pollProcessesEpic = pollProcessesEpic;
exports.setDeviceEpic = setDeviceEpic;
exports.setDeviceTypesEpic = setDeviceTypesEpic;
exports.setDeviceTypeEpic = setDeviceTypeEpic;
exports.setProcessesEpic = setProcessesEpic;
exports.setAppInfoEpic = setAppInfoEpic;
exports.setDeviceTypeComponentsEpic = setDeviceTypeComponentsEpic;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _SimpleCache() {
  const data = require("../../../../modules/nuclide-commons/SimpleCache");

  _SimpleCache = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideAnalytics() {
  const data = require("../../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _DevicePanelTask() {
  const data = require("../DevicePanelTask");

  _DevicePanelTask = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _providers() {
  const data = require("../providers");

  _providers = function () {
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

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
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
function pollDevicesEpic(actions, store) {
  return actions.ofType(Actions().TOGGLE_DEVICE_POLLING).map(action => {
    if (!(action.type === Actions().TOGGLE_DEVICE_POLLING)) {
      throw new Error("Invariant violation: \"action.type === Actions.TOGGLE_DEVICE_POLLING\"");
    }

    return [store.getState(), action.payload.isActive];
  }).distinctUntilChanged(([stateA, isActiveA], [stateB, isActiveB]) => stateA.deviceType === stateB.deviceType && stateA.host === stateB.host && isActiveA === isActiveB).switchMap(([state, isActive]) => {
    if (state.deviceType == null || !isActive) {
      return _RxMin.Observable.empty();
    }

    for (const fetcher of (0, _providers().getProviders)().deviceList) {
      if (fetcher.getType() === state.deviceType) {
        return fetcher.observe(state.host).map(devices => Actions().setDevices(devices));
      }
    }

    return _RxMin.Observable.empty();
  });
}

function setDevicesEpic(actions, store) {
  return actions.ofType(Actions().SET_DEVICES).switchMap(action => {
    return getDeviceTasks(store.getState()).catch(error => {
      (0, _log4js().getLogger)().error(error);
      (0, _nuclideAnalytics().track)('nuclide-device-panel:device-tasks:error', {
        error
      });
      return _RxMin.Observable.of(new Map());
    });
  }).map(tasks => Actions().setDeviceTasks(tasks));
}

function pollProcessesEpic(actions, store) {
  return actions.ofType(Actions().TOGGLE_PROCESS_POLLING).switchMap(action => {
    if (!(action.type === Actions().TOGGLE_PROCESS_POLLING)) {
      throw new Error("Invariant violation: \"action.type === Actions.TOGGLE_PROCESS_POLLING\"");
    }

    return _RxMin.Observable.of([store.getState(), action.payload.isActive]);
  }).distinctUntilChanged(([stateA, isActiveA], [stateB, isActiveB]) => stateA.deviceType === stateB.deviceType && stateA.host === stateB.host && (0, _shallowequal().default)(stateA.device, stateB.device) && isActiveA === isActiveB).switchMap(([state, isActive]) => {
    const device = state.device;

    if (device == null || !isActive) {
      return _RxMin.Observable.empty();
    }

    const providers = Array.from((0, _providers().getProviders)().deviceProcesses).filter(provider => provider.getType() === state.deviceType);

    if (providers[0] != null) {
      return providers[0].observe(state.host, device).map(processes => Actions().setProcesses(processes));
    }

    return _RxMin.Observable.empty();
  });
}

function setDeviceEpic(actions, store) {
  return actions.ofType(Actions().SET_DEVICE).switchMap(action => {
    if (!(action.type === Actions().SET_DEVICE)) {
      throw new Error("Invariant violation: \"action.type === Actions.SET_DEVICE\"");
    }

    const state = store.getState();
    return _RxMin.Observable.merge(getInfoTables(state).switchMap(infoTables => _RxMin.Observable.of(Actions().setInfoTables(infoTables))), getProcessTasks(state).switchMap(processTasks => _RxMin.Observable.of(Actions().setProcessTasks(processTasks))));
  });
}

function setDeviceTypesEpic(actions, store) {
  return actions.ofType(Actions().SET_DEVICE_TYPES).switchMap(action => {
    if (!(action.type === Actions().SET_DEVICE_TYPES)) {
      throw new Error("Invariant violation: \"action.type === Actions.SET_DEVICE_TYPES\"");
    }

    const state = store.getState();
    const deviceType = state.deviceType != null ? state.deviceType : state.deviceTypes[0];
    return _RxMin.Observable.merge(_RxMin.Observable.of(Actions().setDeviceType(deviceType)), _RxMin.Observable.of(Actions().toggleDevicePolling(state.isPollingDevices)));
  });
}

const deviceTypeTaskCache = new (_SimpleCache().SimpleCache)({
  keyFactory: ([state, providerName]) => JSON.stringify([state.host, state.deviceType, providerName])
});

function setDeviceTypeEpic(actions, store) {
  return actions.ofType(Actions().SET_DEVICE_TYPE).switchMap(action => {
    const state = store.getState();
    return _RxMin.Observable.of(Array.from((0, _providers().getProviders)().deviceTypeTask).filter(provider => provider.getType() === state.deviceType).map(provider => deviceTypeTaskCache.getOrCreate([state, provider.getName()], () => new (_DevicePanelTask().DevicePanelTask)(() => provider.getDeviceTypeTask(state.host), provider.getName())))).map(tasks => Actions().setDeviceTypeTasks(tasks.sort((a, b) => a.getName().localeCompare(b.getName()))));
  });
}

function setProcessesEpic(actions, store) {
  return actions.ofType(Actions().SET_PROCESSES).switchMap(action => {
    const state = store.getState();
    return getProcessTasks(state).switchMap(processTasks => _RxMin.Observable.of(Actions().setProcessTasks(processTasks)));
  });
}

function setAppInfoEpic(actions, store) {
  return observeProcessNamesOfInterest(actions, store).switchMap(processNames => {
    const {
      device,
      host
    } = store.getState();

    if (device == null || processNames.length === 0) {
      return _RxMin.Observable.of(new Map());
    }

    const providers = Array.from((0, _providers().getProviders)().appInfo);
    return observeAppInfoTables(processNames, providers, host, device);
  }).map(appInfoTables => Actions().setAppInfoTables(appInfoTables));
}

function setDeviceTypeComponentsEpic(actions, store) {
  return actions.ofType(Actions().SET_DEVICE_TYPE).switchMap(action => {
    if (!(action.type === Actions().SET_DEVICE_TYPE)) {
      throw new Error("Invariant violation: \"action.type === Actions.SET_DEVICE_TYPE\"");
    }

    const {
      deviceType
    } = action.payload;
    const {
      host
    } = store.getState();

    if (deviceType == null) {
      return _RxMin.Observable.empty();
    }

    const providers = Array.from((0, _providers().getProviders)().deviceTypeComponent).filter(provider => provider.getType() === deviceType);

    if (providers.length === 0) {
      return _RxMin.Observable.empty();
    }

    const combinedComponents = _RxMin.Observable.from(providers.map(provider => _RxMin.Observable.create(observer => {
      const disposable = provider.observe(host, component => {
        observer.next(component);
      });
      return () => {
        disposable.dispose();
      };
    }).startWith(null).catch(e => {
      (0, _log4js().getLogger)().error(e);
      return _RxMin.Observable.of(null);
    })) // $FlowFixMe add combineAll to flow
    ).combineAll();

    const groupedComponents = combinedComponents.map(components => Immutable().List(components).filter(c => c != null).map(c => {
      if (!(c != null)) {
        throw new Error("Invariant violation: \"c != null\"");
      }

      return c;
    }).groupBy(c => c.position));
    return groupedComponents.map(value => Actions().setDeviceTypeComponents(Immutable().Map(value)));
  });
}

function uniqueArray(array) {
  return Array.from(new Set(array));
} // Returns an observable to an array of process names. Only process names that
// are needed by the AppInfo providers are observed. A new value is produced
// every time the list of process names changes (a new process started running
// or a running process was shut down).


function observeProcessNamesOfInterest(actions, store) {
  return actions.ofType(Actions().SET_PROCESSES).map(action => {
    const providers = Array.from((0, _providers().getProviders)().appInfo);
    const processNamesOfInterest = new Set(providers.map(provider => provider.getProcessName()));
    const processes = store.getState().processes.getOrDefault([]);
    return uniqueArray(processes.filter(process => processNamesOfInterest.has(process.name)).map(process => process.name));
  }).distinctUntilChanged(_collection().arrayEqual);
} // Given a list of process names and providers it returns an observable for a
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

  const resultSelector = (...multipleAppInfoRows) => // Creates a Map that groups by all appInfoRow by appName:
  // Map<appName, Array<AppInfoRow>>
  (0, _collection().collect)((0, _collection().arrayFlatten)(multipleAppInfoRows).map(appInfoRow => [appInfoRow.appName, appInfoRow])); // $FlowFixMe - combineLatest type spec doesn't support spread operator.


  return _RxMin.Observable.combineLatest(...observables, resultSelector);
}

function observeAppInfoTable(tableProviders, host, device) {
  return observeAppInfoProviderValues(tableProviders, host, device).map(values => {
    return tableProviders.map((provider, index) => Object.assign({
      appName: provider.getAppName(),
      name: provider.getName()
    }, values[index], {
      // {value, isError?}
      canUpdate: provider.canUpdate(),
      update: provider.update
    }));
  });
} // Given an array of providers it subscribes to the values of all of them. It
// returns an observer to an array of all the produced values from the
// providers. A new array is produced every time any of values changes.


const APP_INFO_UPDATE_INTERVAL = 3000;

function observeAppInfoProviderValues(providers, host, device) {
  const observables = providers.map(provider => _RxMin.Observable.timer(0, APP_INFO_UPDATE_INTERVAL).switchMap(() => {
    return provider.observe(host, device).map(value => ({
      value
    })).catch(error => _RxMin.Observable.of({
      value: error.message,
      isError: true
    }));
  }).distinctUntilChanged(_shallowequal().default).do(item => {
    if (item.isError) {
      (0, _nuclideAnalytics().track)(_constants().AnalyticsActions.APPINFOTABLES_DATA_ERROR, item);
    } else {
      (0, _nuclideAnalytics().track)(_constants().AnalyticsActions.APPINFOTABLES_DATA_VALUE, item);
    }
  })); // $FlowFixMe - combineLatest type spec doesn't support spread operator.

  return _RxMin.Observable.combineLatest(...observables);
}

function getInfoTables(state) {
  const device = state.device;

  if (device == null) {
    return _RxMin.Observable.of(new Map());
  }

  return _RxMin.Observable.merge(...Array.from((0, _providers().getProviders)().deviceInfo).filter(provider => provider.getType() === state.deviceType).map(provider => {
    return provider.isSupported(state.host).switchMap(isSupported => {
      if (!isSupported) {
        return _RxMin.Observable.empty();
      }

      return provider.fetch(state.host, device).map(list => ({
        title: provider.getTitle(),
        list,
        priority: provider.getPriority === undefined ? -1 : provider.getPriority()
      }));
    }).catch(() => _RxMin.Observable.empty());
  })).toArray().map(infoTables => infoTables.sort((a, b) => b.priority - a.priority).map(table => [table.title, table.list])).map(infoTables => new Map(infoTables));
}

function getProcessTasks(state) {
  const device = state.device;

  if (device == null) {
    return _RxMin.Observable.of([]);
  }

  return _RxMin.Observable.merge(...Array.from((0, _providers().getProviders)().processTask).filter(provider => provider.getType() === state.deviceType).map(provider => {
    const processes = state.processes.getOrDefault([]);
    return provider.getSupportedPIDs(state.host, device, processes).map(supportedSet => {
      return {
        type: provider.getTaskType(),
        run: proc => provider.run(state.host, device, proc),
        isSupported: proc => supportedSet.has(proc.pid),
        name: provider.getName()
      };
    });
  })).toArray();
} // Generates a map of device tasks for each device identifier.


function getDeviceTasks(state) {
  const {
    devices,
    deviceType,
    host
  } = state;

  if (deviceType == null) {
    return _RxMin.Observable.empty();
  }

  const providers = Array.from((0, _providers().getProviders)().deviceTask).filter(provider => provider.getType() === deviceType);
  const observablePerDevice = devices.getOrDefault([]).map(device => getDeviceTasksForDevice(providers, device, host));

  const combinedMapPairs = // $FlowIgnore combineAll
  _RxMin.Observable.from(observablePerDevice).combineAll();

  return combinedMapPairs.map(pairs => new Map(pairs));
} // Generates a pair of device identifier + tasks for it. The identifier is always for the device passed in.
// It's convenient to make a Map out of these tuples.


function getDeviceTasksForDevice(providers, device, host) {
  // A single observable per each provider for this device.
  const perProviderAndDevice = providers.map(provider => getDeviceTasksForProvider(device, provider, host)); // $FlowIgnore combineAll

  const combinedForDevice = _RxMin.Observable.from(perProviderAndDevice).combineAll(); // Flatten the array (merge tasks from all providers into a single flat array)
  // and put that array it into a tuple with identifier for this device.


  return combinedForDevice.map(array => array.reduce((acc, element) => {
    return acc.concat(element);
  }, [])).map(tasks => [device.identifier, tasks.sort((a, b) => a.getName().localeCompare(b.getName()))]);
}

function getDeviceTasksForProvider(device, provider, host) {
  return provider.getDeviceTasks(host, device).catch(() => _RxMin.Observable.of([])).defaultIfEmpty([]).map(tasks => {
    return tasks.map( // TODO: Keep track of tasks after starting them
    t => new (_DevicePanelTask().DevicePanelTask)(() => t.getEvents(), t.getName()));
  });
}