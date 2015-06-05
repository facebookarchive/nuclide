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
    client.eventbus.socket.close();
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
});
