'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getInfoTables = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (state) {
    const device = state.device;
    if (device == null) {
      return new Map();
    }
    const sortedProviders = Array.from((0, (_providers || _load_providers()).getProviders)().deviceInfo).filter(function (provider) {
      return provider.getType() === state.deviceType;
    }).sort(function (a, b) {
      const pa = a.getPriority === undefined ? -1 : a.getPriority();
      const pb = b.getPriority === undefined ? -1 : b.getPriority();
      return pb - pa;
    });
    const infoTables = yield Promise.all(sortedProviders.map((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (provider) {
        try {
          if (!(yield provider.isSupported(state.host))) {
            return null;
          }
          return [provider.getTitle(), yield provider.fetch(state.host, device.name)];
        } catch (e) {
          return null;
        }
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })()));
    return new Map((0, (_collection || _load_collection()).arrayCompact)(infoTables));
  });

  return function getInfoTables(_x) {
    return _ref.apply(this, arguments);
  };
})();

let getProcessTasks = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (state) {
    const device = state.device;
    if (device == null) {
      return [];
    }
    return Promise.all(Array.from((0, (_providers || _load_providers()).getProviders)().processTask).filter(function (provider) {
      return provider.getType() === state.deviceType;
    }).map((() => {
      var _ref4 = (0, _asyncToGenerator.default)(function* (provider) {
        const supportedSet = yield provider.getSupportedPIDs(state.host, device.name, state.processes);
        return {
          type: provider.getTaskType(),
          run: function (proc) {
            return provider.run(state.host, device.name, proc);
          },
          isSupported: function (proc) {
            return supportedSet.has(proc.pid);
          },
          name: provider.getName()
        };
      });

      return function (_x4) {
        return _ref4.apply(this, arguments);
      };
    })()));
  });

  return function getProcessTasks(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

// The actual device tasks are cached so that if a task is running when the store switches back and
// forth from the device associated with that task, the same running task is used


let getDeviceTasks = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (state) {
    const device = state.device;
    if (device == null) {
      return [];
    }
    const actions = yield Promise.all(Array.from((0, (_providers || _load_providers()).getProviders)().deviceTask).filter(function (provider) {
      return provider.getType() === state.deviceType;
    }).map((() => {
      var _ref6 = (0, _asyncToGenerator.default)(function* (provider) {
        try {
          if (!(yield provider.isSupported(state.host))) {
            return null;
          }
          return deviceTaskCache.getOrCreate(`${state.host}-${device.name}-${provider.getName()}`, function () {
            return new (_DeviceTask || _load_DeviceTask()).DeviceTask(function () {
              return provider.getTask(state.host, device.name);
            }, provider.getName());
          });
        } catch (e) {
          return null;
        }
      });

      return function (_x6) {
        return _ref6.apply(this, arguments);
      };
    })()));
    return (0, (_collection || _load_collection()).arrayCompact)(actions).sort(function (a, b) {
      return a.getName().localeCompare(b.getName());
    });
  });

  return function getDeviceTasks(_x5) {
    return _ref5.apply(this, arguments);
  };
})();

exports.setDeviceEpic = setDeviceEpic;
exports.setProcessesEpic = setProcessesEpic;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _providers;

function _load_providers() {
  return _providers = require('../providers');
}

var _DeviceTask;

function _load_DeviceTask() {
  return _DeviceTask = require('../DeviceTask');
}

var _Cache;

function _load_Cache() {
  return _Cache = require('../Cache');
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

function setDeviceEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_DEVICE).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_DEVICE)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_DEVICE"');
    }

    const state = store.getState();
    return _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.fromPromise(getInfoTables(state)).switchMap(infoTables => _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setInfoTables(infoTables))), _rxjsBundlesRxMinJs.Observable.fromPromise(getProcessTasks(state)).switchMap(processTasks => _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setProcessTasks(processTasks))), _rxjsBundlesRxMinJs.Observable.fromPromise(getDeviceTasks(state)).switchMap(deviceTasks => _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setDeviceTasks(deviceTasks))));
  });
}

function setProcessesEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_PROCESSES).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_PROCESSES)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_PROCESSES"');
    }

    const state = store.getState();
    return _rxjsBundlesRxMinJs.Observable.fromPromise(getProcessTasks(state)).switchMap(processTasks => _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setProcessTasks(processTasks)));
  });
}

const deviceTaskCache = (0, (_Cache || _load_Cache()).createCache)();