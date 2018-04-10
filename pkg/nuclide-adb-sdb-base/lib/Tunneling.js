'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let openTunnels = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (host) {
    const tunnelService = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide.ssh-tunnel');
    if (tunnelService == null) {
      throw new Error('No package to open a tunnel to the remote host available.');
    }
    const tunnels = [{
      description: 'adb',
      from: { host: (_nuclideUri || _load_nuclideUri()).default.getHostname(host), port: 5037, family: 4 },
      to: { host: 'localhost', port: 5037, family: 4 }
    }, {
      description: 'emulator console',
      from: { host: (_nuclideUri || _load_nuclideUri()).default.getHostname(host), port: 5554, family: 4 },
      to: { host: 'localhost', port: 5554, family: 4 }
    }, {
      description: 'emulator adb',
      from: { host: (_nuclideUri || _load_nuclideUri()).default.getHostname(host), port: 5555, family: 4 },
      to: { host: 'localhost', port: 5555, family: 4 }
    }, {
      description: 'exopackage',
      from: { host: (_nuclideUri || _load_nuclideUri()).default.getHostname(host), port: 2829, family: 4 },
      to: { host: 'localhost', port: 2829, family: 4 }
    }];

    const rejectedErrors = [];
    return Promise.all(tunnels.map(function (tunnel) {
      return _requestTunnelFromService(tunnel, tunnelService).catch(function (error) {
        rejectedErrors.push(error);
        return new (_UniversalDisposable || _load_UniversalDisposable()).default();
      });
    })).then(function (disposables) {
      if (rejectedErrors.length > 0) {
        disposables.forEach(function (disposable) {
          return disposable.dispose();
        });
        return Promise.reject(new Error(rejectedErrors));
      }
      return disposables;
    });
  });

  return function openTunnels(_x) {
    return _ref.apply(this, arguments);
  };
})();

let _requestTunnelFromService = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (tunnel, service) {
    return new Promise(function (resolve, reject) {
      const disposable = service.openTunnel(tunnel, function (error) {
        if (error == null) {
          resolve(disposable);
        } else {
          reject(new Error(error));
        }
      }, function () {});
    });
  });

  return function _requestTunnelFromService(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

exports.startTunnelingAdb = startTunnelingAdb;
exports.stopTunnelingAdb = stopTunnelingAdb;
exports.isAdbTunneled = isAdbTunneled;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _cache;

function _load_cache() {
  return _cache = require('../../commons-node/cache');
}

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
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

function startTunnelingAdb(uri) {
  if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(uri)) {
    return Promise.resolve();
  }
  const { onReady } = activeTunnels.getOrCreate(uri, (_, serviceUri) => {
    if (!(typeof serviceUri === 'string')) {
      throw new Error('Invariant violation: "typeof serviceUri === \'string\'"');
    }

    const adbService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getAdbServiceByNuclideUri)(serviceUri);
    const tunnelsOpen = adbService.killServer().then(() => {
      return openTunnels(serviceUri);
    });
    return {
      onReady: tunnelsOpen.then(() => {}),
      dispose: () => {
        tunnelsOpen.then(disposables => disposables.forEach(d => d.dispose()));
      }
    };
  });
  changes.next();

  return onReady.catch(error => {
    // We don't want to keep a failed open tunnel in the cache, otherwise
    // when there's an error we're not able to retry the operation.
    activeTunnels.delete(uri);
    throw error;
  });
}

function stopTunnelingAdb(uri) {
  activeTunnels.delete(uri);
  changes.next();
}

function isAdbTunneled(uri) {
  return changes.startWith(undefined).map(() => activeTunnels.get(uri) != null).distinctUntilChanged();
}

const activeTunnels = new (_cache || _load_cache()).Cache({
  keyFactory: uri => (_nuclideUri || _load_nuclideUri()).default.createRemoteUri((_nuclideUri || _load_nuclideUri()).default.getHostname(uri), '/'),
  dispose: value => value.dispose()
});
const changes = new _rxjsBundlesRxMinJs.Subject();