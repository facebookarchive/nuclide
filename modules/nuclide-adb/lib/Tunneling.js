"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startTunnelingAdb = startTunnelingAdb;
exports.stopTunnelingAdb = stopTunnelingAdb;
exports.isAdbTunneled = isAdbTunneled;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _consumeFirstProvider() {
  const data = _interopRequireDefault(require("../../nuclide-commons-atom/consumeFirstProvider"));

  _consumeFirstProvider = function () {
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

function _analytics() {
  const data = require("../../nuclide-commons/analytics");

  _analytics = function () {
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
function startTunnelingAdb(uri, options = {}) {
  if (!_nuclideUri().default.isRemote(uri)) {
    return _RxMin.Observable.of('ready').concat(_RxMin.Observable.never());
  }

  const {
    tunnels
  } = activeTunnels.getOrCreate(uri, (_, serviceUri) => {
    if (!(typeof serviceUri === 'string')) {
      throw new Error("Invariant violation: \"typeof serviceUri === 'string'\"");
    }

    const adbService = (0, _utils().getAdbServiceByNuclideUri)(serviceUri);
    const localAdbService = (0, _utils().getAdbServiceByNuclideUri)('');

    const observable = _RxMin.Observable.defer(async () => {
      const [adbVersion, localAdbVersion] = await Promise.all([adbService.getVersion(), localAdbService.getVersion()]);

      if (adbVersion !== localAdbVersion) {
        throw new Error(`Your remote adb version differs from the local one: ${adbVersion} (remote) != ${localAdbVersion} (local).\n\n${options.adbMismatchErrorMessage || ''}`);
      }

      return adbService.checkMuxStatus();
    }).switchMap(useAdbmux => useAdbmux ? checkInToAdbmux(serviceUri) : openTunnelsManually(serviceUri)).catch(e => {
      (0, _log4js().getLogger)('nuclide-adb').error(e);
      (0, _analytics().track)('nuclide-adb:tunneling:error', {
        host: uri,
        error: e
      });
      throw e;
    }).publishReplay(1);

    let adbmuxPort;
    const subscription = observable.subscribe(port => adbmuxPort = port).add(() => {
      if (adbmuxPort != null) {
        adbService.checkOutMuxPort(adbmuxPort);
        adbmuxPort = null;
      }

      stopTunnelingAdb(uri);
    }) // Start everything!
    .add(observable.connect());
    return {
      subscription,
      tunnels: observable
    };
  });
  changes.next();
  return tunnels.mapTo('ready');
}

function stopTunnelingAdb(uri) {
  activeTunnels.delete(uri);
  changes.next();
}

function isAdbTunneled(uri) {
  return changes.startWith(undefined).map(() => activeTunnels.get(uri) != null).distinctUntilChanged();
}

const activeTunnels = new (_SimpleCache().SimpleCache)({
  keyFactory: uri => _nuclideUri().default.createRemoteUri(_nuclideUri().default.getHostname(uri), '/'),
  dispose: value => value.subscription.unsubscribe()
});
const changes = new _RxMin.Subject();

function checkInToAdbmux(host) {
  return _RxMin.Observable.defer(async () => {
    const service = await (0, _consumeFirstProvider().default)('nuclide.ssh-tunnel');

    if (!service) {
      throw new Error("Invariant violation: \"service\"");
    }

    const port = await service.getAvailableServerPort(host);
    return {
      service,
      port
    };
  }).switchMap(({
    service,
    port
  }) => service.openTunnels([{
    description: 'adbmux',
    from: {
      host,
      port,
      family: 4
    },
    to: {
      host: 'localhost',
      port: 5037,
      family: 4
    }
  }, {
    description: 'exopackage',
    from: {
      host,
      port: 2829,
      family: 4
    },
    to: {
      host: 'localhost',
      port: 2829,
      family: 4
    }
  }]).mapTo(port)).switchMap(async port => {
    const service = (0, _utils().getAdbServiceByNuclideUri)(host);
    await service.checkInMuxPort(port);
    return port;
  });
}

function openTunnelsManually(host) {
  let retries = 3;
  return _RxMin.Observable.defer(async () => {
    await (0, _utils().getAdbServiceByNuclideUri)(host).killServer();
    const service = await (0, _consumeFirstProvider().default)('nuclide.ssh-tunnel');

    if (!service) {
      throw new Error("Invariant violation: \"service\"");
    }

    return service;
  }).timeout(5000).switchMap(service => service.openTunnels([{
    description: 'adb',
    from: {
      host,
      port: 5037,
      family: 4
    },
    to: {
      host: 'localhost',
      port: 5037,
      family: 4
    }
  }, {
    description: 'emulator console',
    from: {
      host,
      port: 5554,
      family: 4
    },
    to: {
      host: 'localhost',
      port: 5554,
      family: 4
    }
  }, {
    description: 'emulator adb',
    from: {
      host,
      port: 5555,
      family: 4
    },
    to: {
      host: 'localhost',
      port: 5555,
      family: 4
    }
  }, {
    description: 'exopackage',
    from: {
      host,
      port: 2829,
      family: 4
    },
    to: {
      host: 'localhost',
      port: 2829,
      family: 4
    }
  }])).retryWhen(errors => {
    return errors.do(error => {
      if (retries-- <= 0) {
        throw error;
      }
    });
  }).mapTo(null);
}