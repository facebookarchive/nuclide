'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TizenDeviceStopProcessProvider = undefined;

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

class TizenDeviceStopProcessProvider {
  getType() {
    return 'Tizen';
  }

  getTaskType() {
    return 'KILL';
  }

  getName() {
    return 'Stop process/package';
  }

  isSupported(proc) {
    return true;
  }

  getSupportedPIDs(host, device, procs) {
    return _rxjsBundlesRxMinJs.Observable.of(new Set(procs.map(proc => proc.pid)));
  }

  async run(host, device, proc) {
    return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSdbServiceByNuclideUri)(host).stopProcess(device, proc.name, proc.pid);
  }
}
exports.TizenDeviceStopProcessProvider = TizenDeviceStopProcessProvider;