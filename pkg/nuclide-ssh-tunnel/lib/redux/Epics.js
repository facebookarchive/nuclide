'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openTunnelEpic = openTunnelEpic;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../../nuclide-remote-connection/');
}

var _net = _interopRequireDefault(require('net'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const clientConnections = new Map();

function openTunnelEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).OPEN_TUNNEL).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).OPEN_TUNNEL)) {
      throw new Error('Invariant violation: "action.type === Actions.OPEN_TUNNEL"');
    }

    const { tunnel, onOpen, onClose } = action.payload;
    const { from, to } = tunnel;
    const fromUri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(from.host, '/');
    const remoteService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSocketServiceByNuclideUri)(fromUri);
    const remoteEvents = remoteService.startListening(from.port, from.family);
    const subscription = remoteEvents.subscribe({
      next: event => {
        const clients = clientConnections.get(tunnel);

        if (!clients) {
          throw new Error('Invariant violation: "clients"');
        }

        if (event.type === 'server_started') {
          store.dispatch((_Actions || _load_Actions()).setTunnelState(tunnel, 'ready'));
          onOpen();
        } else if (event.type === 'client_connected') {
          const { clientPort } = event;

          if (!(clients.get(clientPort) == null)) {
            throw new Error('Invariant violation: "clients.get(clientPort) == null"');
          }

          const socket = _net.default.createConnection({
            port: to.port,
            family: to.family || 6
          }, () => store.dispatch((_Actions || _load_Actions()).setTunnelState(tunnel, 'active')));
          socket.on('end', () => {
            trace(`client: end (port: ${clientPort}, ${tunnelDescription(tunnel)})`);
            clients.delete(clientPort);
            store.dispatch((_Actions || _load_Actions()).setTunnelState(tunnel, 'ready'));
          });
          socket.on('timeout', () => {
            trace(`client: timeout (port: ${clientPort}, ${tunnelDescription(tunnel)})`);

            if (!socket) {
              throw new Error('Invariant violation: "socket"');
            }

            socket.end();
          });
          socket.on('error', error => {
            trace(`client: error (port: ${clientPort}, ${tunnelDescription(tunnel)})`);
            remoteService.clientError(from.port, clientPort, error.toString());
          });
          socket.on('data', data => {
            remoteService.writeToClient(from.port, clientPort, data);
          });
          socket.on('close', () => {
            if (!(socket != null)) {
              throw new Error('Invariant violation: "socket != null"');
            }

            trace(`client: close (port: ${clientPort}, ${tunnelDescription(tunnel)})`);
            remoteService.closeClient(from.port, clientPort);
            socket.end();
          });
          clients.set(clientPort, socket);
        } else if (event.type === 'client_disconnected') {
          const { clientPort } = event;
          const socket = clients.get(clientPort);
          if (socket != null) {
            socket.end();
          }
        } else if (event.type === 'data') {
          const { clientPort } = event;
          const socket = clients.get(clientPort);

          if (!(socket != null)) {
            throw new Error('Invariant violation: "socket != null"');
          }

          socket.write(event.data);
        }
      },
      error: error => {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-ssh-tunnel').error(`tunnel: error (${tunnelDescription(tunnel)}): ${error}`);
        store.dispatch((_Actions || _load_Actions()).closeTunnel(tunnel, error));
      }
    });
    clientConnections.set(tunnel, new Map());
    remoteEvents.connect();
    return (_Actions || _load_Actions()).addOpenTunnel(tunnel, error => {
      const sockets = clientConnections.get(tunnel);

      if (!sockets) {
        throw new Error('Invariant violation: "sockets"');
      }

      for (const socket of sockets.values()) {
        socket.destroy();
      }
      remoteService.stopListening(from.port);
      subscription.unsubscribe();
      clientConnections.delete(tunnel);
      onClose(error);
    });
  });
}

function trace(message) {
  (0, (_log4js || _load_log4js()).getLogger)('nuclide-ssh-tunnel').trace(message);
}

function tunnelDescription(tunnel) {
  return `${tunnel.from.host}:${tunnel.from.port}->${tunnel.to.host}:${tunnel.to.port}`;
}