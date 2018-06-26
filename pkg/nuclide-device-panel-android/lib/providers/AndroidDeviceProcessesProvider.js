'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AndroidDeviceProcessesProvider = undefined;

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

class AndroidDeviceProcessesProvider {
  getType() {
    return 'Android';
  }

  observe(host, device) {
    const intervalTime = 3000;
    return _rxjsBundlesRxMinJs.Observable.interval(intervalTime).startWith(0).switchMap(() => (0, (_utils || _load_utils()).getAdbServiceByNuclideUri)(host).getProcesses(device.name, intervalTime).refCount().catch(() => _rxjsBundlesRxMinJs.Observable.of([])));
  }
}
exports.AndroidDeviceProcessesProvider = AndroidDeviceProcessesProvider;