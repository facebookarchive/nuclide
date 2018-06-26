'use strict';

var _Connection;

function _load_Connection() {
  return _Connection = require('../lib/Connection');
}

var _net = _interopRequireDefault(require('net'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _Tunnel;

function _load_Tunnel() {
  return _Tunnel = require('../lib/Tunnel');
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TEST_PORT = 5004; /**
                         * Copyright (c) 2015-present, Facebook, Inc.
                         * All rights reserved.
                         *
                         * This source code is licensed under the license found in the LICENSE file in
                         * the root directory of this source tree.
                         *
                         * 
                         * @format
                         */

const TEST_TUNNEL_HOST = {
  host: 'localhost',
  port: TEST_PORT,
  family: 6
};

describe.skip('Connection', () => {
  const connectionFactory = new (_Connection || _load_Connection()).ConnectionFactory();
  let remoteSocket;
  let remoteServer;

  beforeEach(async () => {
    (0, (_log4js || _load_log4js()).getLogger)('SocketService-spec').debug('--SPEC START--');
    remoteServer = await createServer(TEST_PORT + 1);
    remoteSocket = await createRemoteSocket(TEST_PORT + 1);
  });

  afterEach(async () => {
    await closeRemoteSocket(remoteSocket, remoteServer.server);
    await closeServer(remoteServer.server);
    (0, (_log4js || _load_log4js()).getLogger)('SocketService-spec').debug('--SPEC END--');
  });

  it('should create a connection to an already listening server', async () => {
    const connectionSpy = jest.fn();
    let localServer;
    let connection;

    const port = TEST_PORT;

    await new Promise(resolve => {
      localServer = _net.default.createServer(connectionSpy);
      localServer.listen({ port }, resolve);
    });

    connection = await connectionFactory.createConnection(TEST_TUNNEL_HOST, remoteSocket);

    await (0, (_waits_for || _load_waits_for()).default)(() => connectionSpy.mock.calls.length > 0);

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
    let connection;

    remoteServer.socket.on('data', remoteServerWriteSpy);

    const port = TEST_PORT;

    await new Promise(resolve => {
      // echo server
      localServer = _net.default.createServer(socket => {
        connectionSpy();
        socket.pipe(socket);
      });
      localServer.listen({ port }, resolve);
    });

    connection = await connectionFactory.createConnection(TEST_TUNNEL_HOST, remoteSocket);

    await (0, (_waits_for || _load_waits_for()).default)(() => connectionSpy.mock.calls.length > 0);

    expect(connectionSpy).toHaveBeenCalled();
    connection.write(new Buffer('hello world'));

    await (0, (_waits_for || _load_waits_for()).default)(() => remoteServerWriteSpy.mock.calls.length > 0);

    expect(remoteServerWriteSpy).toHaveBeenCalled();
    connection.dispose();
    // $FlowFixMe
    localServer.close(done);
  });
});

async function createRemoteSocket(port) {
  return new Promise(resolve => {
    const socket = _net.default.createConnection({ port, family: 6 }, () => {
      resolve(new (_Tunnel || _load_Tunnel()).RemoteSocket(socket));
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
      throw new Error('Invariant violation: "server"');
    }

    server.listen({ host: '::', port }, () => {
      resolve(result);
    });
  });
}

async function closeServer(server) {
  return new Promise(resolve => {
    server.close(resolve);
  });
}