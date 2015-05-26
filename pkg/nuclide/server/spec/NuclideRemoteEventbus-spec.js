'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var NuclideServer = require('../lib/NuclideServer');
var NuclideRemoteEventbus = require('../lib/NuclideRemoteEventbus');
var {EventEmitter} = require('events');

var server: NuclideServer;
var eventbus: NuclideRemoteEventbus;

describe('NuclideRemoteEventbus test suite', function () {
  beforeEach(() => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;
    waitsForPromise(async () => {
      server = new NuclideServer({port: 8168});
      await server.connect();
      eventbus = new NuclideRemoteEventbus('http://localhost:8168');
      await eventbus.socket.waitForConnect();
      // Wait for the client to handshake the server with his clientId.
      waits(10);
    });
  });

  afterEach(() => {
    eventbus.socket.close();
    server.close();
  });

  describe('subscribeToChannel()', () => {
    it('subscribes to a channel and a service is publishing to it while being called', () => {
      waitsForPromise(async () => {
        server._registerService('/abc/def', async function() {
          this.publish('foo', 'bar');
          return {data: 'response'};
        });

        var event = null;
        await eventbus.subscribeToChannel('foo', (_event) => {
          event = _event;
        });

        var response = await eventbus.callMethod('abc', 'def');
        var data = JSON.parse(response).data;
        expect(data).toBe('response');

        waitsFor(() => !!event);
        runs(() => {
          expect(event).toBe('bar');
        });
      });
    });
  });

  describe('Server: registerEventEmitter & Client: subscribeToEventEmitter()', () => {
    it('subscribes to a service call event emitter and consumes it from the client', () => {
      waitsForPromise(async () => {
        // Example service that uses the registerEventEmitter eventbus server API.
        server._registerService('/abc/def', async function() {
          var eventEmitter = new EventEmitter();

          setTimeout(() => {
            eventEmitter.emit('data', 'foo');
          }, 100);

          setTimeout(() => {
            eventEmitter.emit('data', 'bar');
            eventEmitter.emit('other', 'nooo');
          }, 200);

          setTimeout(() => {
            eventEmitter.emit('end');
          }, 300);
          return this.registerEventEmitter(eventEmitter);
        });

        // Example client usage of calling a service and consuming its event emitters.
        var eventEmitterId = await eventbus.callMethod('abc', 'def');
        var clientEventEmitter = await eventbus.consumeEventEmitter(eventEmitterId, ['data', 'end'], ['end']);
        var eventHandler = jasmine.createSpy();
        var eventDisposeHandler = jasmine.createSpy();
        clientEventEmitter.on('data', eventHandler);
        clientEventEmitter.on('end', eventDisposeHandler);
        expect(eventbus._eventEmitters[eventEmitterId]).toBeDefined();
        expect(eventHandler.callCount).toBe(0);
        expect(eventDisposeHandler.callCount).toBe(0);
        window.advanceClock(110);
        // wait for the message to come.
        waits(10);
        // The first event called.
        runs(() => {
          expect(eventDisposeHandler.callCount).toBe(0);
          expect(eventHandler.callCount).toBe(1);
          expect(eventHandler.argsForCall[0][0]).toBe('foo');
          window.advanceClock(110);
        });
        // wait for the message to come.
        waits(10);
        // The second event called.
        runs(() => {
          expect(eventDisposeHandler.callCount).toBe(0);
          expect(eventHandler.callCount).toBe(2);
          expect(eventHandler.argsForCall[1][0]).toBe('bar');
          window.advanceClock(110);
        });
        // wait for the message to come.
        waits(10);
        // The dispose event called and the cleanup happened.
        runs(() => {
          expect(eventDisposeHandler.callCount).toBe(1);
          expect(eventHandler.callCount).toBe(2);
          expect(eventbus._eventEmitters[eventEmitterId]).toBeUndefined();
        });
      });
    });
  });
});
