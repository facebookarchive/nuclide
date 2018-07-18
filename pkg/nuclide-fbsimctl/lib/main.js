"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeIosDevices = observeIosDevices;

function _expected() {
  const data = require("../../../modules/nuclide-commons/expected");

  _expected = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
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

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const poller = createPoller();

function observeIosDevices() {
  return poller;
}

function createPoller() {
  return _RxMin.Observable.interval(2000).startWith(0).switchMap(() => _RxMin.Observable.defer(async () => _expected().Expect.value((await (0, _nuclideRemoteConnection().getFbsimctlServiceByNuclideUri)('').getDevices()))).catch(error => {
    const friendlyError = new Error("Can't fetch iOS devices. Make sure that fbsimctl is in your $PATH and that it works properly.");

    if (error.code !== 'ENOENT') {
      (0, _nuclideAnalytics().track)('nuclide-fbsimctl:error', {
        error
      });
      (0, _log4js().getLogger)().error(error);
    } else {
      // Keep the code so tooling higher up knows this is due to the tool missing.
      friendlyError.code = 'ENOENT';
    }

    return _RxMin.Observable.of(_expected().Expect.error(friendlyError));
  })).distinctUntilChanged((a, b) => (0, _expected().expectedEqual)(a, b, (v1, v2) => (0, _collection().arrayEqual)(v1, v2, _shallowequal().default), (e1, e2) => e1.message === e2.message)).publishReplay(1).refCount();
}