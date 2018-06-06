'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AndroidBridge = undefined;

var _AdbDevicePoller;

function _load_AdbDevicePoller() {
  return _AdbDevicePoller = require('../../../../modules/nuclide-adb/lib/AdbDevicePoller');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('../redux/Actions'));
}

var _utils;

function _load_utils() {
  return _utils = require('../../../../modules/nuclide-adb/lib/utils');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class AndroidBridge {

  constructor(store) {
    this.debugBridge = 'adb';
    this.name = 'Android';

    this._store = store;
  }

  getService(host) {
    return (0, (_utils || _load_utils()).getAdbServiceByNuclideUri)(host);
  }

  getCustomDebugBridgePath(host) {
    return this._store.getState().customAdbPaths.get(host);
  }

  setCustomDebugBridgePath(host, path) {
    this._store.dispatch((_Actions || _load_Actions()).setCustomAdbPath(host, path));
  }

  getFullConfig(host) {
    return this.getService(host).getFullConfig();
  }

  observeDevicesX(host) {
    return (0, (_AdbDevicePoller || _load_AdbDevicePoller()).observeAndroidDevicesX)(host);
  }
}
exports.AndroidBridge = AndroidBridge;