'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.observeAndroidDevices = observeAndroidDevices;
exports.observeTizenDevices = observeTizenDevices;

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DevicePoller {

  constructor(type) {
    this._dbAvailable = new Map();
    this._observables = new Map();

    this._type = type;
  }

  observe(host) {
    let observable = this._observables.get(host);
    if (observable != null) {
      return observable;
    }
    observable = _rxjsBundlesRxMinJs.Observable.interval(3000).startWith(0).switchMap(() => _rxjsBundlesRxMinJs.Observable.fromPromise(this.fetch(host))).publishReplay(1).refCount();
    this._observables.set(host, observable);
    return observable;
  }

  fetch(host) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const rpc = _this._type === 'adb' ? (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getAdbServiceByNuclideUri)(host) : (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSdbServiceByNuclideUri)(host);

      let dbAvailable = _this._dbAvailable.get(host);
      if (dbAvailable == null) {
        dbAvailable = rpc.startServer();
        _this._dbAvailable.set(host, dbAvailable);
        if (!(yield dbAvailable)) {
          atom.notifications.addError(`Couldn't start the ${_this._type} server. Check if ${_this._type} is in your $PATH and that it works properly.`, { dismissable: true });
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
      displayName,
      architecture: device.architecture
    };
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

const pollers = new Map();

function observeDevices(type, host) {
  let poller = pollers.get(type);
  if (poller == null) {
    poller = new DevicePoller(type);
    pollers.set(type, poller);
  }
  return poller.observe(host);
}

function observeAndroidDevices(host) {
  return observeDevices('adb', host);
}

function observeTizenDevices(host) {
  return observeDevices('sdb', host);
}