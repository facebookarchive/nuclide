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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const socketsForTunnels = new Map(); /**
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
  return actions.ofType((_Actions || _load_Actions()).OPEN_TUNNEL).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).OPEN_TUNNEL)) {
      throw new Error('Invariant violation: "action.type === Actions.OPEN_TUNNEL"');
    }

    const { tunnel, onOpen, onClose } = action.payload;
    const { from, to } = tunnel;
    const fromUri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(from.host, '/');
    const remoteService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSocketServiceByNuclideUri)(fromUri);
    const remoteEvents = remoteService.startListening(from.port);
    const subscription = remoteEvents.subscribe({
      next: event => {
        let socket = socketsForTunnels.get(tunnel);
        if (event.type === 'server_started') {
          store.dispatch((_Actions || _load_Actions()).setTunnelState(tunnel, 'ready'));
          onOpen();
        } else if (event.type === 'client_connected') {
          if (!(socket == null)) {
            throw new Error('Invariant violation: "socket == null"');
          }

          socket = _net.default.createConnection({
            port: to.port,
            family: 6
          }, () => store.dispatch((_Actions || _load_Actions()).setTunnelState(tunnel, 'active')));
          socket.on('end', () => {
            socketsForTunnels.delete(tunnel);
            store.dispatch((_Actions || _load_Actions()).setTunnelState(tunnel, 'ready'));
          });
          socket.on('timeout', () => {
            if (!socket) {
              throw new Error('Invariant violation: "socket"');
            }

            socket.end();
          });
          socket.on('error', error => {
            remoteService.clientError(from.port, error.toString());
          });
          socket.on('data', data => {
            remoteService.writeToClient(from.port, data);
          });
          socket.on('close', () => {
            if (!(socket != null)) {
              throw new Error('Invariant violation: "socket != null"');
            }

            remoteService.closeClient(from.port);
            socket.end();
          });
          socketsForTunnels.set(tunnel, socket);
        } else if (event.type === 'client_disconnected') {
          if (socket != null) {
            socket.end();
          }
        } else if (event.type === 'data') {
          if (!(socket != null)) {
            throw new Error('Invariant violation: "socket != null"');
          }

          socket.write(event.data);
        }
      },
      error: error => store.dispatch((_Actions || _load_Actions()).closeTunnel(tunnel, error))
    });
    remoteEvents.connect();
    return (_Actions || _load_Actions()).addOpenTunnel(tunnel, error => {
      const socket = socketsForTunnels.get(tunnel);
      if (socket != null) {
        socket.destroy();
      }
      remoteService.stopListening(from.port);
      subscription.unsubscribe();
      onClose(error);
    });
  });
}