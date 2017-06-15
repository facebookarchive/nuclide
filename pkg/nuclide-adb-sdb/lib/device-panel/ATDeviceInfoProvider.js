'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATDeviceInfoProvider = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

class ATDeviceInfoProvider {

  constructor(type, rpcFactory) {
    this._type = type;
    this._rpcFactory = rpcFactory;
  }

  fetch(host, device) {
    return this._rpcFactory(host).getDeviceInfo(device).refCount().map(props => {
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

  getType() {
    return this._type;
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