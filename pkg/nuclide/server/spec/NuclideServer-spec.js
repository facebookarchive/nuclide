'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
var path = require('path');
var WebSocket = require('ws');
var {EventEmitter} = require('events');
var NuclideServer = require('../lib/NuclideServer');
var NuclideRemoteEventbus = require('../lib/NuclideRemoteEventbus');
var NuclideClient = require('../lib/NuclideClient');
var {getVersion} = require('nuclide-version');

var server;
var client;

describe('Nuclide Server test suite', () => {
  beforeEach(() => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;

    waitsForPromise(async () => {
      server = new NuclideServer({port: 8176});
      await server.connect();
      client = new NuclideClient('test', new NuclideRemoteEventbus('http://localhost:8176'));
    });
  });

  afterEach(() => {
    client.close();
    server.close();
  });

  it('responds to version', () => {
    waitsForPromise(async () => {
      var version = await client.version();
      expect(version.toString()).toEqual(getVersion());
    });
  });

  it('websocket is connected with the server', () => {
    var websocket = new WebSocket('ws://localhost:8176');
    var opened = false;
    websocket.once('open', () => {
      opened = true;
    });
    waitsFor(() => opened);
  });

  describe('eventbus API', () => {
    it('can publish and subscribe', () => {
      var event = null;
      server.subscribe('foo', (_event) => {
        event = _event;
      });

      waitsFor(() => !!event);
      server.publish('foo', 'bar');
      expect(event).toBe('bar');
    });

    it('can wrap and consume an event emitter', () => {
      var eventEmitter = new EventEmitter();
      var eventEmitterId = server.registerEventEmitter(eventEmitter);
      server._consumeEventEmitter(eventEmitterId, 'foo/bar', ['change']);

      var eventHandler = jasmine.createSpy();
      server.eventbus.on('foo/bar', eventHandler);
      eventEmitter.emit('change', 'def');
      eventEmitter.emit('other', 'abc');
      expect(eventHandler.callCount).toBe(1);
      expect(eventHandler.argsForCall[0][0]).toEqual({eventEmitterId, type: 'change', args: ['def']});
    });
  });

  describe('reconnect websocket flow', () => {
    it('server sent messages, while disconnected will still be delievered', () => {
      // Here is the initial message.
      var nuclideSocket = client.eventbus.socket;
      var messageHandler = jasmine.createSpy();
      var reconnectHandler = jasmine.createSpy();
      nuclideSocket.on('reconnect', reconnectHandler);
      nuclideSocket.on('message', messageHandler);
      // The maximum reconnect time is 5 seconds - advance clock to sip the reconnect time.
      nuclideSocket.on('disconnect', () => process.nextTick(() => window.advanceClock(6000)));

      waitsForPromise(() => nuclideSocket.waitForConnect());

      var message1 = {foo1: 'bar1'};
      var message2 = {foo2: 'bar2'};
      var message3 = {foo3: 'bar3'};
      var message4 = {foo4: 'bar4'};

      // Wait for the connection to exist on the server.
      waits(() => Object.keys(server._clients).length === 1);

      var serverSocketClient = null;
      runs(() => {
        var clientId = Object.keys(server._clients)[0];
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
