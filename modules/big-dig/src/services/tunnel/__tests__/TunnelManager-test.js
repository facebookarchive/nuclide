"use strict";

function _serverPort() {
  const data = require("../../../../../nuclide-commons/serverPort");

  _serverPort = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _TunnelManager() {
  const data = require("../TunnelManager");

  _TunnelManager = function () {
    return data;
  };

  return data;
}

var _net = _interopRequireDefault(require("net"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */

/**
 * Returns a client and server transports connected, which can be used to
 * simulate a BigDig connection.
 */
function createTransport() {
  const clientStream = new _RxMin.Subject();
  const serverStream = new _RxMin.Subject();
  return {
    client: {
      send(message) {
        serverStream.next(message);
      },

      onMessage() {
        return clientStream;
      }

    },
    server: {
      send(message) {
        clientStream.next(message);
      },

      onMessage() {
        return serverStream;
      }

    }
  };
}
/**
 * Returns a server listening in `port`, which echo back received messages
 */


function createEchoServer(port) {
  return new Promise((resolve, reject) => {
    const server = _net.default.createServer(connection => {
      connection.on('end', () => {});
      connection.pipe(connection);
    });

    server.on('error', err => {
      throw err;
    });
    server.listen(String(port), () => {
      resolve(server);
    });
  });
}
/**
 * Sends a message `value` to the server in `port` and returns its response.
 */


function echo(port, value) {
  return new Promise((resolve, reject) => {
    let hasReceivedEcho = false;

    const client = _net.default.createConnection({
      port
    }, () => {
      client.write(value);
    });

    client.on('data', data => {
      hasReceivedEcho = true;
      resolve(data.toString());
      client.end();
    });
    client.on('error', err => {
      reject(err);
    });
    client.on('end', () => {
      if (!hasReceivedEcho) {
        reject(new Error('Connection closed before receive response'));
      }
    });
  });
}

test('creates a tunnel', async () => {
  const tunnelTransport = createTransport();
  const serverTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.server);
  const clientTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.client);
  const localPort = await (0, _serverPort().getAvailableServerPort)();
  const remotePort = await (0, _serverPort().getAvailableServerPort)();
  const server = await createEchoServer(remotePort);
  const tunnel = await clientTunnelManager.createTunnel(localPort, remotePort);
  expect((await echo(localPort, 'message1'))).toBe('message1');
  expect((await echo(localPort, 'message2'))).toBe('message2');
  server.close();
  tunnel.close();
  serverTunnelManager.close();
  clientTunnelManager.close();
});
test('creates a reverse tunnel', async () => {
  const tunnelTransport = createTransport();
  const serverTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.server);
  const clientTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.client);
  const localPort = await (0, _serverPort().getAvailableServerPort)();
  const remotePort = await (0, _serverPort().getAvailableServerPort)();
  const server = await createEchoServer(localPort);
  const tunnel = await clientTunnelManager.createReverseTunnel(localPort, remotePort);
  expect((await echo(remotePort, 'message1'))).toBe('message1');
  expect((await echo(remotePort, 'message2'))).toBe('message2');
  server.close();
  tunnel.close();
  serverTunnelManager.close();
  clientTunnelManager.close();
});
test('creates multiple tunnels', async () => {
  const tunnelTransport = createTransport();
  const serverTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.server);
  const clientTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.client);
  const localPort1 = await (0, _serverPort().getAvailableServerPort)();
  const remotePort1 = await (0, _serverPort().getAvailableServerPort)();
  const server1 = await createEchoServer(remotePort1);
  const tunnel1 = await clientTunnelManager.createTunnel(localPort1, remotePort1);
  expect((await echo(localPort1, 'message1'))).toBe('message1');
  expect((await echo(localPort1, 'message2'))).toBe('message2');
  const localPort2 = await (0, _serverPort().getAvailableServerPort)();
  const remotePort2 = await (0, _serverPort().getAvailableServerPort)();
  const server2 = await createEchoServer(remotePort2);
  const tunnel2 = await clientTunnelManager.createTunnel(localPort2, remotePort2);
  expect((await echo(localPort2, 'message3'))).toBe('message3');
  expect((await echo(localPort2, 'message4'))).toBe('message4');
  server1.close();
  tunnel1.close();
  server2.close();
  tunnel2.close();
  serverTunnelManager.close();
  clientTunnelManager.close();
});
test('throws an error if tunnel manager is closed', async () => {
  const tunnelTransport = createTransport();
  const serverTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.server);
  const clientTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.client);
  clientTunnelManager.close();
  const localPort = await (0, _serverPort().getAvailableServerPort)();
  const remotePort = await (0, _serverPort().getAvailableServerPort)();
  const server = await createEchoServer(localPort);
  await expect(clientTunnelManager.createTunnel(localPort, remotePort)).rejects.toThrowErrorMatchingSnapshot();
  await expect(clientTunnelManager.createReverseTunnel(remotePort, localPort)).rejects.toThrowErrorMatchingSnapshot();
  server.close();
  serverTunnelManager.close();
});
test('throws an error if either port is already bound', async () => {
  const tunnelTransport = createTransport();
  const serverTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.server);
  const clientTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.client);
  const localPort = await (0, _serverPort().getAvailableServerPort)();
  const remotePort = await (0, _serverPort().getAvailableServerPort)();
  const localServer = await createEchoServer(localPort);
  await expect(clientTunnelManager.createTunnel(localPort, remotePort)).rejects.toThrow('listen EADDRINUSE :::' + localPort);
  await new Promise((res, rej) => localServer.close(() => res())); // TODO: cvreateReverseTunnel should throw an instance of error

  const remoteServer = await createEchoServer(remotePort);
  await expect(clientTunnelManager.createReverseTunnel(localPort, remotePort)).rejects.toEqual({
    code: 'EADDRINUSE',
    errno: 'EADDRINUSE',
    syscall: 'listen',
    address: '::',
    port: remotePort
  });
  localServer.close();
  remoteServer.close();
  serverTunnelManager.close();
  clientTunnelManager.close();
});
test('should return an the existing tunnel if it already exists', async () => {
  const tunnelTransport = createTransport();
  const serverTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.server);
  const clientTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.client);
  const localPort = await (0, _serverPort().getAvailableServerPort)();
  const remotePort = await (0, _serverPort().getAvailableServerPort)();
  const server = await createEchoServer(remotePort);
  const tunnel1 = await clientTunnelManager.createTunnel(localPort, remotePort);
  const tunnel2 = await clientTunnelManager.createTunnel(localPort, remotePort);
  expect(tunnel1).toEqual(tunnel2);
  server.close();
  tunnel1.close();
  tunnel2.close();
  serverTunnelManager.close();
  clientTunnelManager.close();
});
test('should not close a tunnel until all references are removed', async () => {
  const tunnelTransport = createTransport();
  const serverTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.server);
  const clientTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.client);
  const localPort = await (0, _serverPort().getAvailableServerPort)();
  const remotePort = await (0, _serverPort().getAvailableServerPort)();
  const server = await createEchoServer(remotePort);
  const tunnel1 = await clientTunnelManager.createTunnel(localPort, remotePort);
  const tunnel2 = await clientTunnelManager.createTunnel(localPort, remotePort);
  expect(tunnel1).toEqual(tunnel2);
  expect((await echo(localPort, 'message1'))).toBe('message1');
  tunnel1.close();
  expect((await echo(localPort, 'message2'))).toBe('message2');
  tunnel2.close();
  await expect(echo(localPort, 'message3')).rejects.toThrow(new RegExp(`connect ECONNREFUSED .*:${localPort}`));
  server.close();
  serverTunnelManager.close();
  clientTunnelManager.close();
});
test('should correctly close tunnels when the tunnel manager is closed', async () => {
  const tunnelTransport = createTransport();
  const serverTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.server);
  const clientTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.client);
  const localPort = await (0, _serverPort().getAvailableServerPort)();
  const remotePort = await (0, _serverPort().getAvailableServerPort)();
  const server = await createEchoServer(remotePort);
  const tunnel = await clientTunnelManager.createTunnel(localPort, remotePort);
  clientTunnelManager.close();
  await expect(echo(localPort, 'message3')).rejects.toThrow(new RegExp(`connect ECONNREFUSED .*:${localPort}`));
  server.close();
  tunnel.close();
  serverTunnelManager.close();
  clientTunnelManager.close();
});