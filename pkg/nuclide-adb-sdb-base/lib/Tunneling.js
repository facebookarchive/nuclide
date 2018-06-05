'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startTunnelingAdb = startTunnelingAdb;
exports.stopTunnelingAdb = stopTunnelingAdb;
exports.isAdbTunneled = isAdbTunneled;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _SimpleCache;

function _load_SimpleCache() {
  return _SimpleCache = require('../../../modules/nuclide-commons/SimpleCache');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/consumeFirstProvider'));
}

var _nuclideAdb;

function _load_nuclideAdb() {
  return _nuclideAdb = require('../../../modules/nuclide-adb');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function startTunnelingAdb(uri, options = {}) {
  if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(uri)) {
    return _rxjsBundlesRxMinJs.Observable.of('ready').concat(_rxjsBundlesRxMinJs.Observable.never());
  }
  const { tunnels } = activeTunnels.getOrCreate(uri, (_, serviceUri) => {
    if (!(typeof serviceUri === 'string')) {
      throw new Error('Invariant violation: "typeof serviceUri === \'string\'"');
    }

    const adbService = (0, (_nuclideAdb || _load_nuclideAdb()).getAdbServiceByNuclideUri)(serviceUri);
    const localAdbService = (0, (_nuclideAdb || _load_nuclideAdb()).getAdbServiceByNuclideUri)('');

    const observable = _rxjsBundlesRxMinJs.Observable.defer(async () => {
      const [adbVersion, localAdbVersion] = await Promise.all([adbService.getVersion(), localAdbService.getVersion()]);
      if (adbVersion !== localAdbVersion) {
        throw new Error(`Your remote adb version differs from the local one: ${adbVersion} (remote) != ${localAdbVersion} (local).\n\n${options.adbMismatchErrorMessage || ''}`);
      }
      return adbService.checkMuxStatus();
    }).switchMap(useAdbmux => useAdbmux ? checkInToAdbmux(serviceUri) : openTunnelsManually(serviceUri)).catch(e => {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-adb-sdb-base').error(e);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-adb-sdb-base:tunneling:error', { host: uri, error: e });
      return _rxjsBundlesRxMinJs.Observable.empty();
    }).publishReplay(1);

    let adbmuxPort;
    const subscription = observable.subscribe(port => adbmuxPort = port).add(() => {
      if (adbmuxPort != null) {
        adbService.checkOutMuxPort(adbmuxPort);
        adbmuxPort = null;
      }
      stopTunnelingAdb(uri);
    })
    // Start everything!
    .add(observable.connect());

    return {
      subscription,
      tunnels: observable
    };
  });
  changes.next();

  return tunnels.mapTo('ready');
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

function stopTunnelingAdb(uri) {
  activeTunnels.delete(uri);
  changes.next();
}

function isAdbTunneled(uri) {
  return changes.startWith(undefined).map(() => activeTunnels.get(uri) != null).distinctUntilChanged();
}

const activeTunnels = new (_SimpleCache || _load_SimpleCache()).SimpleCache({
  keyFactory: uri => (_nuclideUri || _load_nuclideUri()).default.createRemoteUri((_nuclideUri || _load_nuclideUri()).default.getHostname(uri), '/'),
  dispose: value => value.subscription.unsubscribe()
});
const changes = new _rxjsBundlesRxMinJs.Subject();

function checkInToAdbmux(host) {
  return _rxjsBundlesRxMinJs.Observable.defer(async () => {
    const service = await (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide.ssh-tunnel');

    if (!service) {
      throw new Error('Invariant violation: "service"');
    }

    const port = await service.getAvailableServerPort(host);
    return { service, port };
  }).switchMap(({ service, port }) => service.openTunnels([{
    description: 'adbmux',
    from: { host, port, family: 4 },
    to: { host: 'localhost', port: 5037, family: 4 }
  }, {
    description: 'exopackage',
    from: { host, port: 2829, family: 4 },
    to: { host: 'localhost', port: 2829, family: 4 }
  }]).mapTo(port)).switchMap(async port => {
    const service = (0, (_nuclideAdb || _load_nuclideAdb()).getAdbServiceByNuclideUri)(host);
    await service.checkInMuxPort(port);
    return port;
  });
}

function openTunnelsManually(host) {
  let retries = 3;
  return _rxjsBundlesRxMinJs.Observable.defer(async () => {
    await (0, (_nuclideAdb || _load_nuclideAdb()).getAdbServiceByNuclideUri)(host).killServer();

    const service = await (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide.ssh-tunnel');

    if (!service) {
      throw new Error('Invariant violation: "service"');
    }

    return service;
  }).timeout(5000).switchMap(service => service.openTunnels([{
    description: 'adb',
    from: { host, port: 5037, family: 4 },
    to: { host: 'localhost', port: 5037, family: 4 }
  }, {
    description: 'emulator console',
    from: { host, port: 5554, family: 4 },
    to: { host: 'localhost', port: 5554, family: 4 }
  }, {
    description: 'emulator adb',
    from: { host, port: 5555, family: 4 },
    to: { host: 'localhost', port: 5555, family: 4 }
  }, {
    description: 'exopackage',
    from: { host, port: 2829, family: 4 },
    to: { host: 'localhost', port: 2829, family: 4 }
  }])).retryWhen(errors => {
    return errors.do(error => {
      if (retries-- <= 0) {
        throw error;
      }
    });
  }).mapTo(null);
}