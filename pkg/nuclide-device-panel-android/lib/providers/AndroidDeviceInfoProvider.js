"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AndroidDeviceInfoProvider = void 0;

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
class AndroidDeviceInfoProvider {
  getType() {
    return 'Android';
  }

  fetch(host, device) {
    return (0, _utils().getAdbServiceByNuclideUri)(host).getDeviceInfo(device.identifier).refCount().map(props => {
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
    return _RxMin.Observable.of(true);
  }

}

exports.AndroidDeviceInfoProvider = AndroidDeviceInfoProvider;