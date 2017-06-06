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

  constructor(type, rpcFactory) {
    this._type = type;
    this._rpcFactory = rpcFactory;
  }

  observe(host, device) {
    return _rxjsBundlesRxMinJs.Observable.interval(3000).startWith(0).switchMap(() => _rxjsBundlesRxMinJs.Observable.fromPromise(this._rpcFactory(host).getProcesses(device).catch(() => [])));
  }

  getType() {
    return this._type;
  }
}
exports.ATDeviceProcessesProvider = ATDeviceProcessesProvider;