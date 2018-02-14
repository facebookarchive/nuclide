'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openTunnel = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

let openTunnel = exports.openTunnel = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (serviceUri, behavior) {
    if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(serviceUri) || behavior === 'do_not_open_tunnel') {
      return null;
    }
    const tunnelService = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide.ssh-tunnel');
    if (tunnelService == null) {
      throw new Error('No package to open a tunnel to the remote host available.');
    }
    const desired = {
      description: 'Metro',
      from: {
        host: 'localhost',
        port: 8081
      },
      to: { host: (_nuclideUri || _load_nuclideUri()).default.getHostname(serviceUri), port: 8081 }
    };
    for (const tunnel of tunnelService.getOpenTunnels()) {
      const { from, to } = tunnel;
      if (from.port === desired.from.port && from.host === desired.from.host) {
        if (to.host !== desired.to.host) {
          throw new Error('You have a tunnel open from `localhost:8081` to a different host than your ' + 'Current Working Root. Close the tunnel in the SSH tunnels panel and try again.');
        }
        return null;
      }
    }
    if (behavior === 'ask_about_tunnel') {
      return _askToRequestTunnel(tunnelService, desired);
    } else {
      const disposable = yield _requestTunnelFromService(tunnelService, desired);
      return disposable;
    }
  });

  return function openTunnel(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _askToRequestTunnel(service, tunnel) {
  return new Promise(resolve => {
    let disposable = null;
    const notification = atom.notifications.addSuccess('Open tunnel?', {
      detail: 'Open a new tunnel so Metro becomes available at localhost:8081?',
      icon: 'milestone',
      dismissable: true,
      buttons: [{
        text: 'Open tunnel',
        onDidClick: (() => {
          var _ref2 = (0, _asyncToGenerator.default)(function* () {
            disposable = yield _requestTunnelFromService(service, tunnel);
            notification.dismiss();
          });

          return function onDidClick() {
            return _ref2.apply(this, arguments);
          };
        })()
      }, {
        text: 'Dismiss',
        onDidClick: () => notification.dismiss()
      }]
    });
    notification.onDidDismiss(() => resolve(disposable));
  });
}

function _requestTunnelFromService(service, tunnel) {
  return new Promise((resolve, reject) => {
    const disposable = service.openTunnel(tunnel, error => {
      if (error == null) {
        resolve(disposable);
      } else {
        reject(error);
      }
    }, () => {});
  });
}