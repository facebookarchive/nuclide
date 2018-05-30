'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TizenDeviceProcessesProvider = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../../nuclide-remote-connection');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

class TizenDeviceProcessesProvider {
  getType() {
    return 'Tizen';
  }

  observe(host, device) {
    const intervalTime = 3000;
    return _rxjsBundlesRxMinJs.Observable.interval(intervalTime).startWith(0).switchMap(() => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSdbServiceByNuclideUri)(host).getProcesses(device, intervalTime).refCount().catch(() => _rxjsBundlesRxMinJs.Observable.of([])));
  }
}
exports.TizenDeviceProcessesProvider = TizenDeviceProcessesProvider;