'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicePoller = undefined;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _collection;

function _load_collection() {
  return _collection = require('../../nuclide-commons/collection');
}

var _SimpleCache;

function _load_SimpleCache() {
  return _SimpleCache = require('../../nuclide-commons/SimpleCache');
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _expected;

function _load_expected() {
  return _expected = require('../../nuclide-commons/expected');
}

var _analytics;

function _load_analytics() {
  return _analytics = require('../../nuclide-commons/analytics');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pollers = new Map(); /**
                            * Copyright (c) 2017-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the BSD-style license found in the
                            * LICENSE file in the root directory of this source tree. An additional grant
                            * of patent rights can be found in the PATENTS file in the same directory.
                            *
                            * 
                            * @format
                            */

class DevicePoller {

  constructor(platform) {
    this._observables = new (_SimpleCache || _load_SimpleCache()).SimpleCache();

    this._platform = platform;
  }

  observe(_host) {
    const host = (_nuclideUri || _load_nuclideUri()).default.isRemote(_host) ? _host : '';
    let fetching = false;
    return this._observables.getOrCreate(host, () => _rxjsBundlesRxMinJs.Observable.interval(10 * 1000).startWith(0).filter(() => !fetching).switchMap(() => {
      fetching = true;
      return this.fetch(host).map(devices => (_expected || _load_expected()).Expect.value(devices)).catch(err => {
        const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-adb-sdb-base');
        if (err.stack.startsWith('TimeoutError')) {
          logger.debug(`Error polling for devices: ${err.message}`);
        } else {
          logger.warn(`Error polling for devices: ${err.message}`);
        }
        return _rxjsBundlesRxMinJs.Observable.of((_expected || _load_expected()).Expect.error(new Error(`Can't fetch ${this._platform.name} devices. Make sure that ${this._platform.command} is in your $PATH and that it works properly.`)));
      }).do(() => {
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
      return this._platform.getService(host).getDeviceList().refCount().map(devices => devices.map(device => this.parseRawDevice(device)));
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
    if (deviceArchitecture.length === 0) {
      (0, (_analytics || _load_analytics()).track)('nuclide-adb-sdb-base.unknown_device_arch', { deviceArchitecture });
    }

    const displayName = device.name.startsWith('emulator') ? device.name : device.model;

    return {
      name: device.name,
      port: device.port,
      displayName,
      architecture: deviceArchitecture,
      rawArchitecture: device.architecture
    };
  }

  static observeDevices(platform, host) {
    const pollerKey = `${platform.type}:${host}`;
    let poller = pollers.get(pollerKey);
    if (poller == null) {
      poller = new DevicePoller(platform);
      pollers.set(pollerKey, poller);
    }
    return poller.observe(host);
  }
}
exports.DevicePoller = DevicePoller;