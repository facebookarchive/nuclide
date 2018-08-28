"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AndroidDeviceProcessesProvider = void 0;

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
class AndroidDeviceProcessesProvider {
  getType() {
    return 'Android';
  }

  observe(host, device) {
    const intervalTime = 3000;
    return _RxMin.Observable.interval(intervalTime).startWith(0).switchMap(() => (0, _utils().getAdbServiceByNuclideUri)(host).getProcesses(device.identifier, intervalTime).refCount().catch(() => _RxMin.Observable.of([])));
  }

}

exports.AndroidDeviceProcessesProvider = AndroidDeviceProcessesProvider;