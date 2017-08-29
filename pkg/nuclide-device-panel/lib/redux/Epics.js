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

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

var _cache;

function _load_cache() {
  return _cache = require('../../../commons-node/cache');
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
  return actions.ofType((_Actions || _load_Actions()).TOGGLE_DEVICE_POLLING).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).TOGGLE_DEVICE_POLLING)) {
      throw new Error('Invariant violation: "action.type === Actions.TOGGLE_DEVICE_POLLING"');
    }

    return _rxjsBundlesRxMinJs.Observable.of([store.getState(), action.payload.isActive]);
  }).distinctUntilChanged(([stateA, isActiveA], [stateB, isActiveB]) => stateA.deviceType === stateB.deviceType && stateA.host === stateB.host && isActiveA === isActiveB).switchMap(([state, isActive]) => {
    if (state.deviceType === null || !isActive) {
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

const deviceTypeTaskCache = new (_cache || _load_cache()).Cache({
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
    if (!(action.type === (_Actions || _load_Actions()).SET_PROCESSES)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_PROCESSES"');
    }

    const state = store.getState();
    return getProcessTasks(state).switchMap(processTasks => _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setProcessTasks(processTasks)));
  });
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
const deviceTaskCache = new (_cache || _load_cache()).Cache({
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