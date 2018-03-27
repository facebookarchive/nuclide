'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.requestTunnelEpic = requestTunnelEpic;
exports.openTunnelEpic = openTunnelEpic;

var _Whitelist;

function _load_Whitelist() {
  return _Whitelist = require('../Whitelist');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../../nuclide-remote-connection/');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _Tunnel;

function _load_Tunnel() {
  return _Tunnel = require('../../../nuclide-socket-rpc/lib/Tunnel');
}

var _nuclideSocketRpc;

function _load_nuclideSocketRpc() {
  return _nuclideSocketRpc = _interopRequireWildcard(require('../../../nuclide-socket-rpc'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function requestTunnelEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).REQUEST_TUNNEL).mergeMap((() => {
    var _ref = (0, _asyncToGenerator.default)(function* (action) {
      if (!(action.type === (_Actions || _load_Actions()).REQUEST_TUNNEL)) {
        throw new Error('Invariant violation: "action.type === Actions.REQUEST_TUNNEL"');
      }

      const { tunnel, onOpen, onClose } = action.payload;
      const { from, to } = tunnel;
      const tunnelDescriptor = {
        from: {
          host: from.host,
          port: from.port,
          family: from.family || 6
        },
        to: {
          host: to.host,
          port: to.port,
          family: to.family || 6
        }
      };
      const friendlyString = `${(0, (_Tunnel || _load_Tunnel()).tunnelDescription)(tunnelDescriptor)} (${tunnel.description})`;

      if (!(yield (0, (_Whitelist || _load_Whitelist()).validateTunnel)(tunnel))) {
        onOpen(new Error(`Trying to open a tunnel on a non-whitelisted port: ${to.port}\n\n` + 'Contact the Nuclide team if you would like this port to be available.'));
        return null;
      }

      const fromService = getSocketServiceByHost(from.host);
      const toService = getSocketServiceByHost(to.host);
      let clientCount = 0;
      const connectionFactory = yield toService.getConnectionFactory();

      let subscription;

      let isTunnelOpen = false;
      const open = function () {
        const events = fromService.createTunnel(tunnelDescriptor, connectionFactory);
        subscription = events.refCount().subscribe({
          next: function (event) {
            if (event.type === 'server_started') {
              store.getState().consoleOutput.next({
                text: `Opened tunnel: ${friendlyString}`,
                level: 'info'
              });
              isTunnelOpen = true;
              store.dispatch((_Actions || _load_Actions()).setTunnelState(tunnel, 'ready'));
              onOpen();
            } else if (event.type === 'client_connected') {
              clientCount++;
              store.dispatch((_Actions || _load_Actions()).setTunnelState(tunnel, 'active'));
            } else if (event.type === 'client_disconnected') {
              clientCount--;
              if (clientCount === 0) {
                store.dispatch((_Actions || _load_Actions()).setTunnelState(tunnel, 'ready'));
              }
            }
          },
          error: function (error) {
            if (!isTunnelOpen) {
              onOpen(error);
            }
            store.dispatch((_Actions || _load_Actions()).closeTunnel(tunnel, error));
          }
        });
      };

      const close = function (error) {
        subscription.unsubscribe();
        if (!isTunnelOpen) {
          return;
        }
        let message;
        if (error == null) {
          message = {
            text: `Closed tunnel: ${friendlyString}`,
            level: 'info'
          };
        } else {
          message = {
            text: `Tunnel error: ${friendlyString}\n${error.message}`,
            level: 'error'
          };
        }
        store.getState().consoleOutput.next(message);
        onClose(error);
      };

      return (_Actions || _load_Actions()).openTunnel(tunnel, open, close);
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })()).switchMap(action => {
    if (action == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    } else {
      return _rxjsBundlesRxMinJs.Observable.of(action);
    }
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

function openTunnelEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).OPEN_TUNNEL).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).OPEN_TUNNEL)) {
      throw new Error('Invariant violation: "action.type === Actions.OPEN_TUNNEL"');
    }

    action.payload.open();
  }).ignoreElements();
}

function getSocketServiceByHost(host) {
  if (host === 'localhost') {
    // Bypass the RPC framework to avoid extra marshal/unmarshaling.
    return _nuclideSocketRpc || _load_nuclideSocketRpc();
  } else {
    const uri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(host, '/');
    return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSocketServiceByNuclideUri)(uri);
  }
}