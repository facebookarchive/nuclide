'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.


















observeAndroidDevices = observeAndroidDevices;exports.



observeAndroidDevicesX = observeAndroidDevicesX;var _utils;function _load_utils() {return _utils = require('../../../modules/nuclide-adb/lib/utils');}var _DevicePoller;function _load_DevicePoller() {return _DevicePoller = require('./DevicePoller');} /**
                                                                                                                                                                                                                                                           * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                                           * All rights reserved.
                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                           * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                                                           * the root directory of this source tree.
                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                           *  strict-local
                                                                                                                                                                                                                                                           * @format
                                                                                                                                                                                                                                                           */function observeAndroidDevices(host) {return observeAndroidDevicesX(host).map(devices => devices.getOrDefault([]));}function observeAndroidDevicesX(host) {return (0, (_DevicePoller || _load_DevicePoller()).observeDevices)('adb', (0, (_utils || _load_utils()).getAdbServiceByNuclideUri)(host), host);}