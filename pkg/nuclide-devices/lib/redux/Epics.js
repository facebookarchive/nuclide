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
    const sortedProviders = Array.from(state.deviceInfoProviders).filter(function (provider) {
      return provider.getType() === state.deviceType;
    }).sort(function (a, b) {
      const pa = a.getPriority === undefined ? -1 : a.getPriority();
      const pb = b.getPriority === undefined ? -1 : b.getPriority();
      return pb - pa;
    });
    const infoTables = yield Promise.all(sortedProviders.map((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (provider) {
        return [provider.getTitle(), yield provider.fetch(state.host, device.name)];
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })()));
    return new Map(infoTables);
  });

  return function getInfoTables(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.setDevicesEpic = setDevicesEpic;
exports.setDeviceEpic = setDeviceEpic;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
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
 */

function setDevicesEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).REFRESH_DEVICES).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).REFRESH_DEVICES)) {
      throw new Error('Invariant violation: "action.type === Actions.REFRESH_DEVICES"');
    }

    const state = store.getState();
    for (const fetcher of state.deviceFetchers) {
      if (fetcher.getType() === state.deviceType) {
        return _rxjsBundlesRxMinJs.Observable.fromPromise(fetcher.fetch(state.host)).switchMap(devices => _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setDevices(devices)));
      }
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
    return _rxjsBundlesRxMinJs.Observable.fromPromise(getInfoTables(state)).switchMap(infoTables => _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setInfoTables(infoTables)));
  });
}