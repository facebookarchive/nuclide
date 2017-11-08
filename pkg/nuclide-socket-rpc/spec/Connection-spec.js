/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {Connection, ConnectionFactory} from '../lib/Connection';
import net from 'net';
import invariant from 'assert';
import {getLogger} from 'log4js';
import {RemoteSocket} from '../lib/Tunnel';

const TEST_PORT = 5004;
const TEST_TUNNEL_HOST = {
  host: 'localhost',
  port: TEST_PORT,
  family: 6,
};

describe('Connection', () => {
  const connectionFactory = new ConnectionFactory();
  let remoteSocket: RemoteSocket;
  let remoteServer;

  beforeEach(done => {
    getLogger('SocketService-spec').debug('--SPEC START--');
    waitsForPromise(async () => {
      remoteServer = await createServer(TEST_PORT + 1);
      remoteSocket = await createRemoteSocket(TEST_PORT + 1);
      invariant(done);
      done();
    });
  });

  afterEach(done => {
    waitsForPromise(async () => {
      await closeRemoteSocket(remoteSocket, remoteServer.server);
      await closeServer(remoteServer.server);
      getLogger('SocketService-spec').debug('--SPEC END--');
      invariant(done);
      done();
    });
  });

  it('should create a connection to an already listening server', done => {
    const connectionSpy = jasmine.createSpy('connectionSpy');
    let localServer: net.Server;
    let connection: Connection;

    waitsForPromise(async () => {
      const port = TEST_PORT;

      await new Promise(resolve => {
        localServer = net.createServer(connectionSpy);
        localServer.listen({port}, resolve);
      });

      connection = await connectionFactory.createConnection(
        TEST_TUNNEL_HOST,
        remoteSocket,
      );

      waitsFor(() => connectionSpy.callCount > 0);

      runs(() => {
        expect(connectionSpy).toHaveBeenCalled();
        connection.dispose();
        localServer.close(done);
      });
    });
  });

  it('should write to the remote server when the local server responds', done => {
    const remoteServerWriteSpy = jasmine.createSpy('remoteServerSpy');
    const connectionSpy = jasmine.createSpy('connectionSpy');
    let localServer: net.Server;
    let connection: Connection;

    remoteServer.socket.on('data', remoteServerWriteSpy);

    waitsForPromise(async () => {
      const port = TEST_PORT;

      await new Promise(resolve => {
        // echo server
        localServer = net.createServer(socket => {
          connectionSpy();
          socket.pipe(socket);
        });
        localServer.listen({port}, resolve);
      });

      connection = await connectionFactory.createConnection(
        TEST_TUNNEL_HOST,
        remoteSocket,
      );

      waitsFor(() => connectionSpy.callCount > 0);

      runs(() => {
        expect(connectionSpy).toHaveBeenCalled();
        connection.write(new Buffer('hello world'));
      });

      waitsFor(() => remoteServerWriteSpy.callCount > 0);

      runs(() => {
        expect(remoteServerWriteSpy).toHaveBeenCalled();
        connection.dispose();
        localServer.close(done);
      });
    });
  });
});

async function createRemoteSocket(port: number): Promise<RemoteSocket> {
  return new Promise(resolve => {
    const socket = net.createConnection({port, family: 6}, () => {
      resolve(new RemoteSocket(socket));
    });
  });
}

async function closeRemoteSocket(
  remoteSocket: RemoteSocket,
  remoteServer: net.Server,
): Promise<void> {
  remoteSocket.dispose();
  await closeServer(remoteServer);
}

async function createServer(port: number): Promise<Object> {
  const result = {};
  return new Promise(resolve => {
    const server: net.Server = net.createServer(socket => {
      result.socket = socket;
    });

    result.server = server;
    invariant(server);
    server.listen({host: '::', port}, () => {
      resolve(result);
    });
  });
}

async function closeServer(server: net.Server): Promise<void> {
  return new Promise(resolve => {
    server.close(resolve);
  });
}
