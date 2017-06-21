'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATDeviceListProvider = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

class ATDeviceListProvider {

  constructor(bridge) {
    this._bridge = bridge;
  }

  getType() {
    return this._bridge.name;
  }

  observe(host) {
    return this._bridge.observeDevicesX(host);
  }
}
exports.ATDeviceListProvider = ATDeviceListProvider; /**
                                                      * Copyright (c) 2015-present, Facebook, Inc.
                                                      * All rights reserved.
                                                      *
                                                      * This source code is licensed under the license found in the LICENSE file in
                                                      * the root directory of this source tree.
                                                      *
                                                      * 
                                                      * @format
                                                      */