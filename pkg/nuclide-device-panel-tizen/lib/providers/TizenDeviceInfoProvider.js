'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TizenDeviceInfoProvider = undefined;

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

class TizenDeviceInfoProvider {
  getType() {
    return 'Tizen';
  }

  fetch(host, device) {
    return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSdbServiceByNuclideUri)(host).getDeviceInfo(device).refCount().map(props => {
      const infoMap = new Map();
      for (const [key, value] of props) {
        let beautifulKey = key.toLowerCase().replace('_', ' ');
        beautifulKey = beautifulKey.charAt(0).toUpperCase() + beautifulKey.slice(1);
        infoMap.set(beautifulKey, value);
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
exports.TizenDeviceInfoProvider = TizenDeviceInfoProvider;