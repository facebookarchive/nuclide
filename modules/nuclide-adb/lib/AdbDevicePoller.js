'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeAndroidDevices = observeAndroidDevices;
exports.observeAndroidDevicesX = observeAndroidDevicesX;

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

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../nuclide-commons/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

function observeAndroidDevices(host) {
  return observeAndroidDevicesX(host).map(devices => devices.getOrDefault([]));
}
// $FlowIgnore untyped import


const pollersForUris = new (_SimpleCache || _load_SimpleCache()).SimpleCache();

function observeAndroidDevicesX(host) {
  const serviceUri = (_nuclideUri || _load_nuclideUri()).default.isRemote(host) ? (_nuclideUri || _load_nuclideUri()).default.createRemoteUri((_nuclideUri || _load_nuclideUri()).default.getHostname(host), '/') : '';
  return pollersForUris.getOrCreate(serviceUri, () => {
    let fetching = false;
    return _rxjsBundlesRxMinJs.Observable.interval(2000).startWith(0).filter(() => !fetching).switchMap(() => {
      fetching = true;
      return _rxjsBundlesRxMinJs.Observable.fromPromise(fetch(serviceUri)).map(devices => (_expected || _load_expected()).Expect.value(devices)).catch(err => {
        const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-adb');
        if (err.stack.startsWith('TimeoutError')) {
          logger.debug('Error polling for devices: ' + err.message);
        } else {
          logger.warn('Error polling for devices: ' + err.message);
        }
        return _rxjsBundlesRxMinJs.Observable.of((_expected || _load_expected()).Expect.error(new Error("Can't fetch Android devices.\n\n" + err.message)));
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
    }).publishReplay(1).refCount();
  });
}

async function fetch(hostname) {
  try {
    const devices = await (0, (_utils || _load_utils()).getAdbServiceByNuclideUri)(hostname).getDeviceList();
    return devices.map(device => parseRawDevice(device));
  } catch (e) {
    // The remote host connection can go away while we are fetching if the user
    // removes it from the file tree or the network connection is lost.
    return [];
  }
}

function parseRawDevice(device) {
  const displayName = device.serial.startsWith('emulator') || device.serial.startsWith('localhost:') || device.model == null ? device.serial : device.model;

  return {
    name: device.serial,
    displayName,
    architecture: ''
  };
}