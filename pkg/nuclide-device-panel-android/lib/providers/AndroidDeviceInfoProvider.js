'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.AndroidDeviceInfoProvider = undefined;














var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _nuclideRemoteConnection;
function _load_nuclideRemoteConnection() {return _nuclideRemoteConnection = require('../../../nuclide-remote-connection');}

class AndroidDeviceInfoProvider {
  getType() {
    return 'Android';
  }

  fetch(host, device) {
    return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getAdbServiceByNuclideUri)(host).
    getDeviceInfo(device).
    refCount().
    map(props => {
      const infoMap = new Map();
      for (const [key, value] of props) {
        const beautifulKey = key.toLowerCase().replace('_', ' ');
        infoMap.set(
        beautifulKey.charAt(0).toUpperCase() + beautifulKey.slice(1),
        value);

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
  }}exports.AndroidDeviceInfoProvider = AndroidDeviceInfoProvider; /**
                                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                                    * All rights reserved.
                                                                    *
                                                                    * This source code is licensed under the license found in the LICENSE file in
                                                                    * the root directory of this source tree.
                                                                    *
                                                                    * 
                                                                    * @format
                                                                    */