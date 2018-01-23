'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeAndroidDevices = observeAndroidDevices;
exports.observeTizenDevices = observeTizenDevices;
exports.observeAndroidDevicesX = observeAndroidDevicesX;
exports.observeTizenDevicesX = observeTizenDevicesX;

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _expected;

function _load_expected() {
  return _expected = require('../../commons-node/expected');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _cache;

function _load_cache() {
  return _cache = require('../../commons-node/cache');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DevicePoller {

  constructor(type) {
    this._observables = new (_cache || _load_cache()).Cache();

    this._type = type;
  }

  _getPlatform() {
    return this._type === 'adb' ? 'Android' : 'Tizen';
  }

  observe(_host) {
    const host = (_nuclideUri || _load_nuclideUri()).default.isRemote(_host) ? _host : '';
    let fetching = false;
    return this._observables.getOrCreate(host, () => _rxjsBundlesRxMinJs.Observable.interval(10 * 1000).startWith(0).filter(() => !fetching).switchMap(() => {
      fetching = true;
      return this.fetch(host).map(devices => (_expected || _load_expected()).Expect.value(devices)).catch(() => _rxjsBundlesRxMinJs.Observable.of((_expected || _load_expected()).Expect.error(new Error(`Can't fetch ${this._getPlatform()} devices. Make sure that ${this._type} is in your $PATH and that it works properly.`)))).do(() => {
        fetching = false;
      });
    }).distinctUntilChanged((a, b) => {
      if (a.isError && b.isError) {
        return a.error.message === b.error.message;
      } else if (a.isPending && b.isPending) {
        return true;
      } else if (!a.isError && !b.isError && !a.isPending && !b.isPending) {
        return (0, (_collection || _load_collection()).arrayEqual)(a.value, b.value, (_shallowequal || _load_shallowequal()).default);
      } else {
        return false;
      }
    }).publishReplay(1).refCount());
  }

  fetch(host) {
    try {
      const rpc = this._type === 'adb' ? (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getAdbServiceByNuclideUri)(host) : (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSdbServiceByNuclideUri)(host);

      return rpc.getDeviceList().refCount().map(devices => devices.map(device => this.parseRawDevice(device)));
    } catch (e) {
      // The remote host connection can go away while we are fetching if the user
      // removes it from the file tree or the network connection is lost.
      return _rxjsBundlesRxMinJs.Observable.of([]);
    }
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
      port: device.port,
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