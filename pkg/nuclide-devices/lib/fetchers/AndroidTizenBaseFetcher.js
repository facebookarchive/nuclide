'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class AndroidTizenBaseFetcher {

  constructor(type, rpcFactory) {
    this._type = type;
    this._rpcFactory = rpcFactory;
  }

  getType() {
    return this._type;
  }

  fetch(host) {
    return this._rpcFactory(host).getDeviceList().then(devices => devices.map(device => this.parseRawDevice(device)));
  }

  parseRawDevice(device) {
    const deviceArchitecture = device.architecture.startsWith('arm64') ? 'arm64' : device.architecture.startsWith('arm') ? 'arm' : device.architecture;

    const displayName = (device.name.startsWith('emulator') ? device.name : device.model).concat(` (${deviceArchitecture}, API ${device.apiVersion})`);

    return {
      name: device.name,
      displayName
    };
  }
}
exports.AndroidTizenBaseFetcher = AndroidTizenBaseFetcher; /**
                                                            * Copyright (c) 2015-present, Facebook, Inc.
                                                            * All rights reserved.
                                                            *
                                                            * This source code is licensed under the license found in the LICENSE file in
                                                            * the root directory of this source tree.
                                                            *
                                                            * 
                                                            */