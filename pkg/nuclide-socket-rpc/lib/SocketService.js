'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAvailableServerPort = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getAvailableServerPort = exports.getAvailableServerPort = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    return (0, (_serverPort || _load_serverPort()).getAvailableServerPort)();
  });

  return function getAvailableServerPort() {
    return _ref.apply(this, arguments);
  };
})();

exports.startListening = startListening;
exports.stopListening = stopListening;
exports.writeToClient = writeToClient;
exports.clientError = clientError;
exports.closeClient = closeClient;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _net = _interopRequireDefault(require('net'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _serverPort;

function _load_serverPort() {
  return _serverPort = require('../../commons-node/serverPort');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const serverSockets = new Map(); /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  * @format
                                  */

function startListening(serverPort, family = 6) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    trace(`rpc: start server (server: ${serverPort})`);
    if (serverSockets.get(serverPort) != null) {
      observer.error(new Error(`Socket on port ${serverPort} already bound`));
      return;
    }

    const clients = new Map();

    const server = _net.default.createServer(clientSocket => {
      const clientPort = clientSocket.remotePort;
      trace(`client: connect (server: ${serverPort}, client: ${clientPort})`);
      clients.set(clientPort, clientSocket);
      observer.next({ type: 'client_connected', clientPort });
      clientSocket.on('data', data => {
        observer.next({ type: 'data', clientPort, data });
      });
      clientSocket.on('close', hadError => {
        trace(`client: close (server: ${serverPort}, client: ${clientPort})`);
        clients.delete(clientPort);
        observer.next({ type: 'client_disconnected', clientPort });
      });
      clientSocket.on('error', error => {
        trace(`client: error (server: ${serverPort}, client: ${clientPort}): ${error}`);
        clientSocket.end();
      });
      clientSocket.on('timeout', () => {
        trace(`client: timeout (server: ${serverPort}, client: ${clientPort})`);
        clientSocket.end();
      });
    });
    server.on('error', error => {
      _stopListening(serverPort);
      observer.error(error);
    });
    server.listen({ host: family === 6 ? '::' : '0.0.0.0', port: serverPort }, () => {
      observer.next({ type: 'server_started' });
    });
    serverSockets.set(serverPort, { clients, server, observer });
  }).publish();
}

function stopListening(serverPort) {
  trace(`rpc: stop server (server: ${serverPort})`);
  _stopListening(serverPort);
}

function _stopListening(serverPort) {
  const serverSocket = getServerSocket(serverPort);
  const { clients, server, observer } = serverSocket;
  clients.forEach(client => client.destroy());
  observer.next({ type: 'server_stopping' });
  server.close(() => {
    serverSockets.delete(serverPort);
    observer.complete();
  });
}

function writeToClient(serverPort, clientPort, data) {
  const serverSocket = getServerSocket(serverPort);
  const clientSocket = serverSocket.clients.get(clientPort);
  if (clientSocket != null) {
    clientSocket.write(data);
  }
}

function clientError(serverPort, clientPort, error) {
  const serverSocket = getServerSocket(serverPort);
  const clientSocket = serverSocket.clients.get(clientPort);
  trace(`rpc: client error (server: ${serverPort}, client: ${clientPort}): ${error}`);
  if (clientSocket != null) {
    clientSocket.destroy(new Error(error));
  }
}

function closeClient(serverPort, clientPort) {
  trace(`rpc: close client (server: ${serverPort}, client: ${clientPort})`);
  const serverSocket = getServerSocket(serverPort);
  const clientSocket = serverSocket.clients.get(clientPort);
  if (clientSocket != null) {
    clientSocket.end();
  }
}

function getServerSocket(serverPort) {
  const socket = serverSockets.get(serverPort);
  if (socket == null) {
    throw new Error(`Server on port ${serverPort} not started`);
  }
  return socket;
}

function trace(message) {
  (0, (_log4js || _load_log4js()).getLogger)('SocketService').trace(message);
}