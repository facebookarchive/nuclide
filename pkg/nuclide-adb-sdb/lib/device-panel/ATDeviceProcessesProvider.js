'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATDeviceProcessesProvider = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

class ATDeviceProcessesProvider {

  constructor(bridge) {
    this._bridge = bridge;
  }

  getType() {
    return this._bridge.name;
  }

  observe(host, device) {
    const intervalTime = 3000;
    return _rxjsBundlesRxMinJs.Observable.interval(intervalTime).startWith(0).switchMap(() => this._bridge.getService(host).getProcesses(device, intervalTime).refCount().catch(() => _rxjsBundlesRxMinJs.Observable.of([])));
  }
}
exports.ATDeviceProcessesProvider = ATDeviceProcessesProvider;