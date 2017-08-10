'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startListening = startListening;
exports.stopListening = stopListening;
exports.writeToClient = writeToClient;
exports.clientError = clientError;
exports.closeClient = closeClient;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _net = _interopRequireDefault(require('net'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const socketsForPorts = new Map(); /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    * @format
                                    */

function startListening(port) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    if (socketsForPorts.get(port) != null) {
      throw new Error(`Socket on port ${port} already bound`);
    }

    const clients = [];

    const server = _net.default.createServer(socket => {
      clients.push(socket);
      observer.next({ type: 'client_connected' });
      socket.on('data', data => {
        observer.next({ type: 'data', data });
      });
      socket.on('close', hadError => {
        clients.splice(clients.indexOf(socket), 1);
        observer.next({ type: 'client_disconnected' });
      });
      socket.on('error', error => {
        socket.end();
      });
      socket.on('timeout', () => {
        socket.end();
      });
    });
    server.on('error', error => {
      stopListening(port);
      observer.error(error);
    });
    server.maxConnections = 1;
    server.listen({ port }, () => {
      observer.next({ type: 'server_started' });
    });
    socketsForPorts.set(port, { clients, server, observer });
  }).publish();
}

function stopListening(port) {
  const openSocket = getOpenSocket(port);
  const { clients, server, observer } = openSocket;
  clients.forEach(client => client.destroy());
  observer.next({ type: 'server_stopping' });
  server.close(() => {
    socketsForPorts.delete(port);
    observer.complete();
  });
}

function writeToClient(port, data) {
  const openSocket = getOpenSocket(port);
  if (openSocket.clients.length === 1) {
    openSocket.clients[0].write(data);
  } else {
    openSocket.observer.error(`Tried to write on port ${port}, but no client found.`);
  }
}

function clientError(port, error) {
  const openSocket = getOpenSocket(port);
  if (openSocket.clients.length === 1) {
    openSocket.clients[0].destroy(new Error(error));
  } else {
    openSocket.observer.error(`Tried to send an error on port ${port}, but no client found.`);
  }
}

function closeClient(port) {
  const openSocket = getOpenSocket(port);
  if (openSocket.clients.length > 0) {
    openSocket.clients[0].end();
  } else {
    openSocket.observer.error(`Tried to close client on port ${port}, but no client found.`);
  }
}

function getOpenSocket(port) {
  const openSocket = socketsForPorts.get(port);
  if (openSocket == null) {
    throw new Error(`Server on port ${port} not started`);
  }
  return openSocket;
}