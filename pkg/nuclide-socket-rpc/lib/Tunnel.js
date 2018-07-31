"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTunnel = createTunnel;
exports.tunnelDescription = tunnelDescription;
exports.shortenHostname = shortenHostname;
exports.RemoteSocket = void 0;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

var _net = _interopRequireDefault(require("net"));

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
const LOG_DELTA = 500000; // log for every half megabyte of transferred data

const DEBUG_VERBOSE = false;
const activeTunnels = new Map();

function createTunnel(t, cf) {
  const logStatsIfNecessary = getStatLogger(LOG_DELTA);
  let bytesReceived = 0;
  let bytesWritten = 0; // We check if a tunnel already exists listening to the same port, if it
  // does we stop it so this one can take precedence. The onus on managing
  // this (not creating a tunnel if there's already one on this port) should be
  // on the consumer of this service.

  const tunnelKey = `${shortenHostname(t.from.host)}:${t.from.port}`;
  const existingTunnel = activeTunnels.get(tunnelKey);

  if (existingTunnel) {
    trace(`Tunnel: Stopping existing tunnel -- ${tunnelDescription(existingTunnel.tunnel)}`);
    existingTunnel.dispose();
  }

  return _RxMin.Observable.create(observer => {
    const tunnel = t;
    trace(`Tunnel: creating tunnel -- ${tunnelDescription(tunnel)}`);
    const {
      port,
      family
    } = tunnel.from;
    const connections = new Map(); // set up server to start listening for connections
    // on client_connected

    const listener = _net.default.createServer(async socket => {
      const clientPort = socket.remotePort;

      if (DEBUG_VERBOSE) {
        trace('Tunnel: client connected on remote port ' + clientPort);
      }

      observer.next({
        type: 'client_connected',
        clientPort
      }); // create outgoing connection using connection factory

      const localSocket = new LocalSocket(socket);
      localSocket.onWrite(count => {
        bytesWritten += count;

        if (DEBUG_VERBOSE) {
          logStatsIfNecessary(bytesWritten, bytesReceived);
        }
      });
      const remoteSocket = new RemoteSocket(localSocket);
      const connectionPromise = cf.createConnection(tunnel.to, remoteSocket);
      connections.set(clientPort, connectionPromise); // set up socket listeners

      socket.on('timeout', () => {
        trace(`Tunnel: timeout (port: ${clientPort}, ${this.toString()})`);
      });

      if (DEBUG_VERBOSE) {
        socket.on('end', () => {
          trace(`Tunnel: end (port: ${clientPort}, ${tunnelDescription(tunnel)})`);
        });
      }

      socket.on('error', err => {
        trace(`Tunnel: error (port: ${clientPort}, ${tunnelDescription(tunnel)})`);
        trace(`Tunnel: error (server: ${port}, client: ${clientPort}): ${err}`);
        socket.destroy(err);
      }); // on data from incoming client
      // write data to the outgoing connection

      socket.on('data', data => {
        connectionPromise.then(connection => {
          connection.write(data);
          bytesReceived += data.length;
          logStatsIfNecessary(bytesWritten, bytesReceived);
        });
      });
      socket.on('close', () => {
        // on client_disconnect remove and dispose the connection
        if (DEBUG_VERBOSE) {
          trace(`Tunnel: close (port: ${clientPort}, ${tunnelDescription(tunnel)})`);
        }

        connectionPromise.then(connection => {
          connection.dispose();
          connections.delete(clientPort);
        });
        observer.next({
          type: 'client_disconnected',
          clientPort
        });
      });
    });

    listener.on('error', err => {
      trace(`Tunnel: error listening on port ${port}): ${err}`);
      observer.error(err);
    });
    listener.listen({
      host: family === 6 ? '::' : '0.0.0.0',
      port
    }, () => {
      trace('Tunnel: server listening on port ' + port);
      observer.next({
        type: 'server_started'
      });
    });

    const dispose = () => {
      trace(`Tunnel: shutting down tunnel ${tunnelDescription(tunnel)}`);
      connections.forEach(connectionPromise => connectionPromise.then(conn => {
        conn.dispose();
      }));
      connections.clear();
      cf.dispose();
      listener.close();
      activeTunnels.delete(tunnelKey);
    };

    activeTunnels.set(tunnelKey, {
      dispose,
      tunnel
    });
    return dispose;
  }).publish();
}

function tunnelDescription(tunnel) {
  return `${shortenHostname(tunnel.from.host)}:${tunnel.from.port}->${shortenHostname(tunnel.to.host)}:${tunnel.to.port}`;
}

function shortenHostname(host) {
  let result = host;

  if (_nuclideUri().default.isRemote(result)) {
    result = _nuclideUri().default.getHostname(result);
  }

  if (result.endsWith('.facebook.com')) {
    result = result.slice(0, result.length - '.facebook.com'.length);
  }

  if (result.startsWith('our.')) {
    result = result.slice('our.'.length, result.length);
  }

  if (result.startsWith('twsvcscm.')) {
    result = result.slice('twsvcscm.'.length, result.length);
  }

  return result;
}

class LocalSocket {
  constructor(socket) {
    this._socket = socket;

    this._writeListener = byteCount => {};
  }

  onWrite(listener) {
    this._writeListener = listener;
  }

  write(data) {
    this._socket.write(data);

    this._writeListener(data.length);
  }

  end() {
    this._socket.end();
  }

}

class RemoteSocket {
  constructor(socket) {
    this._socket = socket;
  }

  write(data) {
    this._socket.write(data);
  }

  dispose() {
    this._socket.end();
  }

}

exports.RemoteSocket = RemoteSocket;

function getStatLogger(delta) {
  let lastLoggedBytes = 0;
  return (bytesWritten, bytesReceived) => {
    const totalBytes = bytesWritten + bytesReceived;

    if (totalBytes > lastLoggedBytes + delta) {
      lastLoggedBytes = totalBytes;
      logStats(bytesWritten, bytesReceived, totalBytes);
    }
  };
}

function logStats(bytesWritten, bytesReceived, totalBytes) {
  trace(`Tunnel: ${totalBytes} bytes transferred; ${bytesWritten} written, ${bytesReceived} received`);
}

function trace(message) {
  (0, _log4js().getLogger)('SocketService').trace(message);
}