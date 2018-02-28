'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteSocket = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.createTunnel = createTunnel;
exports.tunnelDescription = tunnelDescription;
exports.shortenHostname = shortenHostname;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _net = _interopRequireDefault(require('net'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LOG_DELTA = 500000; // log for every half megabyte of transferred data

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

function createTunnel(td, cf) {
  var _this = this;

  const logStatsIfNecessary = getStatLogger(LOG_DELTA);
  let bytesReceived = 0;
  let bytesWritten = 0;

  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    const descriptor = td;
    trace(`Tunnel: creating tunnel -- ${tunnelDescription(descriptor)}`);

    const { port, family } = descriptor.from;
    const connections = new Map();

    // set up server to start listening for connections
    // on client_connected
    const listener = _net.default.createServer((() => {
      var _ref = (0, _asyncToGenerator.default)(function* (socket) {
        const clientPort = socket.remotePort;

        trace('Tunnel: client connected on remote port ' + clientPort);
        observer.next({ type: 'client_connected', clientPort });

        // create outgoing connection using connection factory
        const localSocket = new LocalSocket(socket);
        localSocket.onWrite(function (count) {
          bytesWritten += count;
          logStatsIfNecessary(bytesWritten, bytesReceived);
        });
        const remoteSocket = new RemoteSocket(localSocket);
        const connectionPromise = cf.createConnection(td.to, remoteSocket);
        connections.set(clientPort, connectionPromise);

        // set up socket listeners
        socket.on('timeout', function () {
          trace(`Tunnel: timeout (port: ${clientPort}, ${_this.toString()})`);
        });

        socket.on('end', function () {
          trace(`Tunnel: end (port: ${clientPort}, ${tunnelDescription(descriptor)})`);
        });

        socket.on('error', function (err) {
          trace(`Tunnel: error (port: ${clientPort}, ${tunnelDescription(descriptor)})`);
          trace(`Tunnel: error (server: ${port}, client: ${clientPort}): ${err}`);
          socket.destroy(err);
        });

        // on data from incoming client
        // write data to the outgoing connection
        socket.on('data', function (data) {
          connectionPromise.then(function (connection) {
            connection.write(data);
            bytesReceived += data.length;
            logStatsIfNecessary(bytesWritten, bytesReceived);
          });
        });

        socket.on('close', function () {
          // on client_disconnect remove and dispose the connection
          trace(`Tunnel: close (port: ${clientPort}, ${tunnelDescription(descriptor)})`);
          connectionPromise.then(function (connection) {
            connection.dispose();
            connections.delete(clientPort);
          });
          observer.next({ type: 'client_disconnected', clientPort });
        });
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })());

    listener.on('error', err => {
      observer.error(err);
    });

    listener.listen({ host: family === 6 ? '::' : '0.0.0.0', port }, () => {
      trace('Tunnel: server listening on port ' + port);
      observer.next({ type: 'server_started' });
    });

    return () => {
      trace('Tunnel: shutting down tunnel');
      connections.forEach(connectionPromise => connectionPromise.then(conn => {
        conn.dispose();
      }));
      connections.clear();
      cf.dispose();
      listener.close();
    };
  }).publish();
}

function tunnelDescription(tunnel) {
  return `${shortenHostname(tunnel.from.host)}:${tunnel.from.port}->${shortenHostname(tunnel.to.host)}:${tunnel.to.port}`;
}

function shortenHostname(host) {
  let result = host;
  if (result.endsWith('.facebook.com')) {
    result = result.slice(0, host.length - '.facebook.com'.length);
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
  (0, (_log4js || _load_log4js()).getLogger)('SocketService').trace(message);
}