'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.


















observeTizenDevices = observeTizenDevices;exports.



observeTizenDevicesX = observeTizenDevicesX;var _nuclideRemoteConnection;function _load_nuclideRemoteConnection() {return _nuclideRemoteConnection = require('../../nuclide-remote-connection');}var _DevicePoller;function _load_DevicePoller() {return _DevicePoller = require('./DevicePoller');} /**
                                                                                                                                                                                                                                                                                                      * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                      * All rights reserved.
                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                      * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                                                                                                      * the root directory of this source tree.
                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                      * 
                                                                                                                                                                                                                                                                                                      * @format
                                                                                                                                                                                                                                                                                                      */function observeTizenDevices(host) {return observeTizenDevicesX(host).map(devices => devices.getOrDefault([]));}function observeTizenDevicesX(host) {return (0, (_DevicePoller || _load_DevicePoller()).observeDevices)('sdb', (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSdbServiceByNuclideUri)(host), host);}