'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let _requestTunnelFromService = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (tunnel, service) {
    return new Promise(function (resolve, reject) {
      const disposable = service.openTunnel(tunnel, function (error) {
        if (error == null) {
          resolve(disposable);
        } else {
          reject(error);
        }
      }, function () {});
    });
  });

  return function _requestTunnelFromService(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
})();

exports.startTunnelingAdb = startTunnelingAdb;
exports.isAdbTunneled = isAdbTunneled;
exports.stopTunnelingAdb = stopTunnelingAdb;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function startTunnelingAdb(host) {
  stopTunnelingAdb();
  const adbService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getAdbServiceByNuclideUri)(host);
  _rxjsBundlesRxMinJs.Observable.fromPromise(adbService.killServer()).switchMap((0, _asyncToGenerator.default)(function* () {
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
    return Promise.all(tunnels.map(function (t) {
      return _requestTunnelFromService(t, tunnelService);
    }));
  })).subscribe(result => {
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    result.forEach(d => disposable.add(d));
    activeTunnels.next({ host, disposable });
  });
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

function isAdbTunneled(host) {
  return activeTunnels.publishReplay(1).refCount().map(active => active != null && active.host === host);
}

function stopTunnelingAdb() {
  const active = activeTunnels.getValue();
  if (active != null) {
    active.disposable.dispose();
    activeTunnels.next(null);
  }
}

const activeTunnels = new _rxjsBundlesRxMinJs.BehaviorSubject(null);