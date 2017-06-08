'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.observeAndroidDevices = observeAndroidDevices;
exports.observeTizenDevices = observeTizenDevices;
exports.observeAndroidDevicesX = observeAndroidDevicesX;
exports.observeTizenDevicesX = observeTizenDevicesX;

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideExpected;

function _load_nuclideExpected() {
  return _nuclideExpected = require('../../nuclide-expected');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DevicePoller {

  constructor(type) {
    this._observables = new Map();

    this._type = type;
  }

  _getPlatform() {
    return this._type === 'adb' ? 'android' : 'tizen';
  }

  observe(host) {
    let observable = this._observables.get(host);
    if (observable != null) {
      return observable;
    }
    observable = _rxjsBundlesRxMinJs.Observable.interval(3000).startWith(0).switchMap(() => _rxjsBundlesRxMinJs.Observable.fromPromise(this.fetch(host)).map(devices => (_nuclideExpected || _load_nuclideExpected()).Expect.value(devices)).catch(() => _rxjsBundlesRxMinJs.Observable.of((_nuclideExpected || _load_nuclideExpected()).Expect.error(new Error(`Can't fetch ${this._getPlatform()} devices. Make sure that ${this._type} is in your $PATH and that it works properly.`))))).publishReplay(1).refCount();
    this._observables.set(host, observable);
    return observable;
  }

  fetch(host) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const rpc = _this._type === 'adb' ? (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getAdbServiceByNuclideUri)(host) : (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSdbServiceByNuclideUri)(host);

      return rpc.getDeviceList().then(function (devices) {
        return devices.map(function (device) {
          return _this.parseRawDevice(device);
        });
      });
    })();
  }

  parseRawDevice(device) {
    let deviceArchitecture = '';
    for (const arch of ['arm64', 'arm', 'x86']) {
      if (device.architecture.startsWith(arch)) {
        deviceArchitecture = arch;
        break;
      }
    }
    let displayArch = deviceArchitecture;
    if (deviceArchitecture.length === 0) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-adb-sdb-base.unknown_device_arch', { deviceArchitecture });
      displayArch = device.architecture;
    }

    const displayName = (device.name.startsWith('emulator') ? device.name : device.model).concat(` (${displayArch}, API ${device.apiVersion})`);

    return {
      name: device.name,
      displayName,
      architecture: deviceArchitecture,
      rawArchitecture: device.architecture
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
  return observeDevices('adb', host).map(devices => devices.getOrDefault([]));
}

function observeTizenDevices(host) {
  return observeDevices('sdb', host).map(devices => devices.getOrDefault([]));
}

function observeAndroidDevicesX(host) {
  return observeDevices('adb', host);
}

function observeTizenDevicesX(host) {
  return observeDevices('sdb', host);
}