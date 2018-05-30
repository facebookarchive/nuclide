'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openTunnel = openTunnel;

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/consumeFirstProvider'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function openTunnel(serviceUri, behavior, port) {
  if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(serviceUri) || behavior === 'do_not_open_tunnel') {
    return _rxjsBundlesRxMinJs.Observable.of('ready').concat(_rxjsBundlesRxMinJs.Observable.never());
  }
  return _rxjsBundlesRxMinJs.Observable.defer(() => (0, (_nullthrows || _load_nullthrows()).default)((0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide.ssh-tunnel'))).switchMap(service => {
    const desired = _desiredTunnelTo(serviceUri, port);
    for (const tunnel of service.getOpenTunnels()) {
      const { from, to } = tunnel;
      if (from.port === desired.from.port && from.host === desired.from.host) {
        if ((_nuclideUri || _load_nuclideUri()).default.getHostname(to.host) !== (_nuclideUri || _load_nuclideUri()).default.getHostname(desired.to.host)) {
          throw new Error(`You have a tunnel open from \`localhost:${port}\` to a different host than your ` + 'Current Working Root. Close the tunnel in the SSH tunnels panel and try again.');
        }
      }
    }
    if (behavior === 'ask_about_tunnel') {
      return _askToRequestTunnel(service, desired);
    } else {
      return service.openTunnels([desired]);
    }
  }).share();
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

function _askToRequestTunnel(service, tunnel) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    let subscription;
    const notification = atom.notifications.addSuccess('Open tunnel?', {
      detail: `Open a new tunnel so Metro becomes available at localhost:${tunnel.from.port}?`,
      icon: 'milestone',
      dismissable: true,
      buttons: [{
        text: 'Open tunnel',
        onDidClick: () => {
          subscription = service.openTunnels([tunnel]).subscribe(observer);
          notification.dismiss();
        }
      }, {
        text: 'Dismiss',
        onDidClick: () => notification.dismiss()
      }]
    });

    return () => {
      if (subscription != null) {
        subscription.unsubscribe();
      }
      notification.dismiss();
    };
  });
}

function _desiredTunnelTo(uri, port) {
  return {
    description: 'Metro',
    from: {
      host: 'localhost',
      port
    },
    to: { host: uri, port }
  };
}