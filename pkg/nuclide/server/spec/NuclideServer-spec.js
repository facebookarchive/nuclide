'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */



const WebSocket = require('ws');
const {EventEmitter} = require('events');
const NuclideServer = require('../lib/NuclideServer');
const {getVersion} = require('nuclide-version');
import ClientComponent from '../lib/serviceframework/ClientComponent';
import NuclideSocket from '../lib/NuclideSocket';

let server;
let client;
let socket;

describe('Nuclide Server test suite', () => {
  beforeEach(() => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;

    waitsForPromise(async () => {
      server = new NuclideServer({port: 8176});
      await server.connect();
      socket = new NuclideSocket('http://localhost:8176');
      client = new ClientComponent(socket);
    });
  });

  afterEach(() => {
    client.close();
    server.close();
  });

  it('websocket is connected with the server', () => {
    const websocket = new WebSocket('ws://localhost:8176');
    let opened = false;
    websocket.once('open', () => {
      opened = true;
    });
    waitsFor(() => opened);
  });

  xdescribe('reconnect websocket flow', () => {
    it('server sent messages, while disconnected will still be delievered', () => {
      // Here is the initial message.
      const nuclideSocket = socket;
      const messageHandler = jasmine.createSpy();
      const reconnectHandler = jasmine.createSpy();
      nuclideSocket.on('reconnect', reconnectHandler);
      nuclideSocket.on('message', messageHandler);
      // The maximum reconnect time is 5 seconds - advance clock to sip the reconnect time.
      nuclideSocket.on('disconnect', () => process.nextTick(() => window.advanceClock(6000)));

      waitsForPromise(() => nuclideSocket.waitForConnect());

      const message1 = {foo1: 'bar1'};
      const message2 = {foo2: 'bar2'};
      const message3 = {foo3: 'bar3'};
      const message4 = {foo4: 'bar4'};

      // Wait for the connection to exist on the server.
      waits(() => Object.keys(server._clients).length === 1);

      let serverSocketClient = null;
      runs(() => {
        const clientId = Object.keys(server._clients)[0];
        serverSocketClient = server._clients[clientId];
        expect(serverSocketClient.id).toBe(clientId);

        server._sendSocketMessage(serverSocketClient, message1);
      });

      waitsFor(() => messageHandler.callCount === 1);
      runs(() => {
        // Close the client socket and start a reconnect trial, send a message in between.
        // A server socket close will trigger a client disconnect and a scheduled reconnect.
        serverSocketClient.socket.close();
        server._sendSocketMessage(serverSocketClient, message2);
        // The default WebSocket's close timeout is 30 seconds.
        window.advanceClock(31 * 1000);
        server._sendSocketMessage(serverSocketClient, message3);
      });

      waitsFor(() => reconnectHandler.callCount === 1);
      runs(() => server._sendSocketMessage(serverSocketClient, message4));

      waitsFor(() => messageHandler.callCount === 4);
      runs(() => {
        expect(messageHandler.argsForCall[0][0]).toEqual(message1); // Received on the first stable websocket connection.
        expect(messageHandler.argsForCall[1][0]).toEqual(message2); // Cached in the queue when disconnected.
        expect(messageHandler.argsForCall[2][0]).toEqual(message3); // Cached in the queue when disconnected.
        expect(messageHandler.argsForCall[3][0]).toEqual(message4); // Received on the reconnected stable websocket connection.
      });
    });
  });
});
