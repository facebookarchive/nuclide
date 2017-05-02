'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATDeviceListProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ATDeviceListProvider {

  constructor(type, rpcFactory) {
    this._type = type;
    this._rpcFactory = rpcFactory;
    this._dbAvailable = new Map();
  }

  getType() {
    return this._type;
  }

  fetch(host) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const rpc = _this._rpcFactory(host);

      let dbAvailable = _this._dbAvailable.get(host);
      if (dbAvailable == null) {
        dbAvailable = rpc.startServer();
        _this._dbAvailable.set(host, dbAvailable);
        if (!(yield dbAvailable)) {
          const db = _this._type === 'android' ? 'adb' : 'sdb';
          atom.notifications.addError(`Couldn't start the ${db} server. Check if ${db} is in your $PATH and that it works ` + 'properly.', { dismissable: true });
        }
      }
      if (yield dbAvailable) {
        return rpc.getDeviceList().then(function (devices) {
          return devices.map(function (device) {
            return _this.parseRawDevice(device);
          });
        });
      }
      return [];
    })();
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