"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AndroidDeviceStopProcessProvider = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _utils() {
  const data = require("../../../../modules/nuclide-adb/lib/utils");

  _utils = function () {
    return data;
  };

  return data;
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
    return _RxMin.Observable.of(new Set(procs.map(proc => proc.pid)));
  }

  async run(host, device, proc) {
    return (0, _utils().getAdbServiceByNuclideUri)(host).stopProcess(device.identifier, proc.name, proc.pid);
  }

}

exports.AndroidDeviceStopProcessProvider = AndroidDeviceStopProcessProvider;