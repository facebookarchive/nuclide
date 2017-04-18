'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setDevicesEpic = setDevicesEpic;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

    const deviceMap = Promise.all(Array.from(state.deviceFetchers).map(fetcher => {
      return fetcher.fetch(state.host).then(deviceList => [fetcher.getType(), deviceList]);
    })).then(deviceLists => new Map(deviceLists));

    return _rxjsBundlesRxMinJs.Observable.fromPromise(deviceMap).switchMap(devices => _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setDevices(devices)));
  });
}