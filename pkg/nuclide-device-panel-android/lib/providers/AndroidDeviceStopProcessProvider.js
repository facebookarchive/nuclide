'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AndroidDeviceStopProcessProvider = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _utils;

function _load_utils() {
  return _utils = require('../../../../modules/nuclide-adb/lib/utils');
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

class AndroidDeviceStopProcessProvider {
  getType() {
    return 'Android';
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
    return (0, (_utils || _load_utils()).getAdbServiceByNuclideUri)(host).stopProcess(device.name, proc.name, proc.pid);
  }
}
exports.AndroidDeviceStopProcessProvider = AndroidDeviceStopProcessProvider;