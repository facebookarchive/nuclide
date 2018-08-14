"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeAndroidDevices = observeAndroidDevices;
exports.adbDeviceForIdentifier = adbDeviceForIdentifier;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _SimpleCache() {
  const data = require("../../nuclide-commons/SimpleCache");

  _SimpleCache = function () {
    return data;
  };

  return data;
}

function _shallowequal() {
  const data = _interopRequireDefault(require("shallowequal"));

  _shallowequal = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _expected() {
  const data = require("../../nuclide-commons/expected");

  _expected = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = require("../../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
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
// $FlowIgnore untyped import
function observeAndroidDevices(host) {
  const serviceUri = _nuclideUri().default.isRemote(host) ? _nuclideUri().default.createRemoteUri(_nuclideUri().default.getHostname(host), '/') : '';
  return pollersForUris.getOrCreate(serviceUri, () => {
    return _RxMin.Observable.interval(2000).startWith(0).exhaustMap(() => {
      const service = (0, _utils().getAdbServiceByNuclideUri)(serviceUri);

      if (service == null) {
        // Gracefully handle a lost remote connection
        return _RxMin.Observable.of(_expected().Expect.pending());
      }

      return _RxMin.Observable.fromPromise(service.getDeviceList()).map(devices => _expected().Expect.value(devices)).catch(error => {
        const message = error.code !== 'ENOENT' ? error.message : "'adb' not found in $PATH.";
        return _RxMin.Observable.of(_expected().Expect.error(new Error("Can't fetch Android devices. " + message)));
      });
    }).distinctUntilChanged((a, b) => (0, _expected().expectedEqual)(a, b, (v1, v2) => (0, _collection().arrayEqual)(v1, v2, _shallowequal().default), (e1, e2) => e1.message === e2.message)).do(value => {
      if (value.isError) {
        const logger = (0, _log4js().getLogger)('nuclide-adb');
        logger.warn(value.error.message);
        (0, _analytics().track)('nuclide-adb:device-poller:error', {
          error: value.error,
          host: serviceUri
        });
      }
    }).publishReplay(1).refCount();
  });
} // This is a convenient way for any device panel plugins of type Android to get from Device to
// to the strongly typed AdbDevice.


async function adbDeviceForIdentifier(host, identifier) {
  const devices = await observeAndroidDevices(host).take(1).toPromise();
  return devices.getOrDefault([]).find(d => d.serial === identifier);
}

const pollersForUris = new (_SimpleCache().SimpleCache)();