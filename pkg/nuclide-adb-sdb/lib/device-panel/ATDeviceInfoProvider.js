'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATDeviceInfoProvider = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

class ATDeviceInfoProvider {

  constructor(bridge) {
    this._bridge = bridge;
  }

  getType() {
    return this._bridge.name;
  }

  fetch(host, device) {
    return this._bridge.getService(host).getDeviceInfo(device).refCount().map(props => {
      const infoMap = new Map();
      for (const [key, value] of props) {
        const beautifulKey = key.toLowerCase().replace('_', ' ');
        infoMap.set(beautifulKey.charAt(0).toUpperCase() + beautifulKey.slice(1), value);
      }
      return infoMap;
    });
  }

  getTitle() {
    return 'Device information';
  }

  getPriority() {
    return 100;
  }

  isSupported() {
    return _rxjsBundlesRxMinJs.Observable.of(true);
  }
}
exports.ATDeviceInfoProvider = ATDeviceInfoProvider; /**
                                                      * Copyright (c) 2015-present, Facebook, Inc.
                                                      * All rights reserved.
                                                      *
                                                      * This source code is licensed under the license found in the LICENSE file in
                                                      * the root directory of this source tree.
                                                      *
                                                      * 
                                                      * @format
                                                      */