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

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

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
  const data = require("../../../modules/nuclide-analytics");

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
 *  strict-local
 * @format
 */
// $FlowIgnore untyped import
const poller = createPoller();

function observeIosDevices() {
  return poller;
}

function createPoller(serviceUri = '') {
  return _rxjsCompatUmdMin.Observable.interval(2000).startWith(0).exhaustMap(() => {
    const service = (0, _nuclideRemoteConnection().getFbsimctlServiceByNuclideUri)(serviceUri);

    if (service == null) {
      // Gracefully handle a lost remote connection
      return _rxjsCompatUmdMin.Observable.of(_expected().Expect.pending());
    }

    return _rxjsCompatUmdMin.Observable.fromPromise(service.getDevices()).map(devices => _expected().Expect.value(devices)).catch(error => {
      let message;

      if (error.code === 'ENOENT') {
        message = "'fbsimctl' not found in $PATH.";
      } else if (typeof error.message === 'string' && (error.message.includes('plist does not exist') || error.message.includes('No Xcode Directory at'))) {
        message = "Xcode path is invalid, use 'xcode-select' in a terminal to select path to an Xcode installation.";
      } else if ( // RPC call timed out
      error.name === 'RpcTimeoutError' || // RPC call succeeded, but the fbsimctl call itself timed out
      error.message === 'Timeout has occurred') {
        message = 'Request timed out, retrying...';
      } else if (error.message === 'Connection Closed') {
        return _rxjsCompatUmdMin.Observable.of(_expected().Expect.pending());
      } else {
        message = error.message;
      }

      const newError = new Error("Can't fetch iOS devices. " + message); // $FlowIgnore

      newError.originalError = error;
      return _rxjsCompatUmdMin.Observable.of(_expected().Expect.error(newError));
    });
  }).distinctUntilChanged((a, b) => (0, _expected().expectedEqual)(a, b, (v1, v2) => (0, _collection().arrayEqual)(v1, v2, _shallowequal().default), (e1, e2) => e1.message === e2.message)).do(async value => {
    if (value.isError) {
      const {
        error
      } = value;
      const logger = (0, _log4js().getLogger)('nuclide-fbsimctl');
      let extras = {
        error
      };

      try {
        if ( // $FlowIgnore
        error.originalError != null && // $FlowIgnore
        error.originalError.code === 'ENOENT') {
          const serverEnv = await (0, _nuclideRemoteConnection().getInfoServiceByNuclideUri)(serviceUri).getServerEnvironment();
          extras = Object.assign({}, extras, {
            pathEnv: serverEnv.PATH
          });
        }
      } finally {
        logger.warn(value.error.message);
        (0, _nuclideAnalytics().track)('nuclide-fbsimctl:device-poller:error', extras);
      }
    }
  }).publishReplay(1).refCount();
}