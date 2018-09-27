"use strict";

function _Connection() {
  const data = require("../lib/Connection");

  _Connection = function () {
    return data;
  };

  return data;
}

var _net = _interopRequireDefault(require("net"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _Tunnel() {
  const data = require("../lib/Tunnel");

  _Tunnel = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

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
 * @emails oncall+nuclide
 */
const TEST_PORT = 5004;
const TEST_TUNNEL_HOST = {
  host: 'localhost',
  port: TEST_PORT,
  family: 6
};
describe.skip('Connection', () => {
  const connectionFactory = new (_Connection().ConnectionFactory)();
  let remoteSocket;
  let remoteServer;
  beforeEach(async () => {
    (0, _log4js().getLogger)('SocketService-spec').debug('--SPEC START--');
    remoteServer = await createServer(TEST_PORT + 1);
    remoteSocket = await createRemoteSocket(TEST_PORT + 1);
  });
  afterEach(async () => {
    await closeRemoteSocket(remoteSocket, remoteServer.server);
    await closeServer(remoteServer.server);
    (0, _log4js().getLogger)('SocketService-spec').debug('--SPEC END--');
  });
  it('should create a connection to an already listening server', async () => {
    const connectionSpy = jest.fn();
    let localServer;
    const port = TEST_PORT;
    await new Promise(resolve => {
      localServer = _net.default.createServer(connectionSpy);
      localServer.listen({
        port
      }, resolve);
    });
    const connection = await connectionFactory.createConnection(TEST_TUNNEL_HOST, remoteSocket);
    await (0, _waits_for().default)(() => connectionSpy.mock.calls.length > 0);
    expect(connectionSpy).toHaveBeenCalled();
    connection.dispose();
    await new Promise(r => {
      localServer.close(r);
    });
  });
  it.skip('should write to the remote server when the local server responds', async done => {
    const remoteServerWriteSpy = jest.fn();
    const connectionSpy = jest.fn();
    let localServer;
    remoteServer.socket.on('data', remoteServerWriteSpy);
    const port = TEST_PORT;
    await new Promise(resolve => {
      // echo server
      localServer = _net.default.createServer(socket => {
        connectionSpy();
        socket.pipe(socket);
      });
      localServer.listen({
        port
      }, resolve);
    });
    const connection = await connectionFactory.createConnection(TEST_TUNNEL_HOST, remoteSocket);
    await (0, _waits_for().default)(() => connectionSpy.mock.calls.length > 0);
    expect(connectionSpy).toHaveBeenCalled();
    connection.write(new Buffer('hello world'));
    await (0, _waits_for().default)(() => remoteServerWriteSpy.mock.calls.length > 0);
    expect(remoteServerWriteSpy).toHaveBeenCalled();
    connection.dispose(); // $FlowFixMe

    localServer.close(done);
  });
});

async function createRemoteSocket(port) {
  return new Promise(resolve => {
    const socket = _net.default.createConnection({
      port,
      family: 6
    }, () => {
      resolve(new (_Tunnel().RemoteSocket)(socket));
    });
  });
}

async function closeRemoteSocket(remoteSocket, remoteServer) {
  remoteSocket.dispose();
  await closeServer(remoteServer);
}

async function createServer(port) {
  const result = {};
  return new Promise(resolve => {
    const server = _net.default.createServer(socket => {
      result.socket = socket;
    });

    result.server = server;

    if (!server) {
      throw new Error("Invariant violation: \"server\"");
    }

    server.listen({
      host: '::',
      port
    }, () => {
      resolve(result);
    });
  });
}

async function closeServer(server) {
  return new Promise(resolve => {
    server.close(resolve);
  });
}