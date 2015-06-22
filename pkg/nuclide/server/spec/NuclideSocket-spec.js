'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var NuclideClient = require('../lib/NuclideClient');
var NuclideServer = require('../lib/NuclideServer');
var NuclideRemoteEventbus = require('../lib/NuclideRemoteEventbus');

var server: NuclideServer;
var client: NuclideClient;
var socket: NuclideSocket;

describe('NuclideSocket test suite', () => {
  beforeEach(() => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;
    waitsForPromise(async () => {
      server = new NuclideServer({port: 8176});
      await server.connect();
      client = new NuclideClient('test', new NuclideRemoteEventbus('http://localhost:8176'));
      socket = client.eventbus.socket;
    });

    // Use spec-helper.coffee utils to test the the heartbeat interval.
    window.setInterval = window.fakeSetInterval;
    window.clearInterval = window.fakeClearInterval;
  });

  afterEach(() => {
    socket.close();
    server.close();
  });

  it('can connect', () => {
    waitsForPromise(() => socket.waitForConnect());
  });

  it('disconnects on close', () => {
    waitsForPromise(async () => {
      await socket.waitForConnect();
      var disconnectHandler = jasmine.createSpy();
      socket.on('disconnect', disconnectHandler);
      socket.close();
      waitsFor(() => disconnectHandler.callCount > 0);
    });
  });

  describe('xhrRequest()', () => {
    it('gets the server version', () => {
      waitsForPromise(async () => {
        var version = await socket.xhrRequest({uri: 'server/version', method: 'POST'});
        expect(version).toBeDefined();
      });
    });
  });

  describe('heartbeat()', () => {
    it('checks and emits heartbeat every 5 seconds', () => {
      var heartbeatHandler = jasmine.createSpy();
      // There was an initial heartbeat, but we can't be sure if it went before or after we do listen here.
      socket.on('heartbeat', heartbeatHandler);
      window.advanceClock(5050); // Advance the heartbeat interval.
      waitsFor(() => heartbeatHandler.callCount > 0);
      window.advanceClock(5050); // Advance the heartbeat interval.
      waitsFor(() => heartbeatHandler.callCount > 1);
    });

    it('on ECONNREFUSED, emits PORT_NOT_ACCESSIBLE, when the server was never accessible', () => {
      var heartbeatErrorHandler = jasmine.createSpy();
      socket.on('heartbeat.error', heartbeatErrorHandler);
      // Assume the hearbeat didn't happen.
      socket.on('heartbeat', () => { socket._heartbeatConnectedOnce = false; });
      server.close();
      window.advanceClock(5050); // Advance the heartbeat interval.
      waitsFor(() => heartbeatErrorHandler.callCount > 0);
      runs(() => expect(heartbeatErrorHandler.argsForCall[0][0].code).toBe('PORT_NOT_ACCESSIBLE'));
    });

    it('on ECONNREFUSED, emits SERVER_CRASHED, when the server was once reachable', () => {
      var heartbeatErrorHandler = jasmine.createSpy();
      socket.on('heartbeat.error', heartbeatErrorHandler);
      socket._heartbeatConnectedOnce = true;
      server.close();
      window.advanceClock(5050); // Advance the heartbeat interval.
      waitsFor(() => heartbeatErrorHandler.callCount > 0);
      runs(() => expect(heartbeatErrorHandler.argsForCall[0][0].code).toBe('SERVER_CRASHED'));
    });

    it('on ENOTFOUND, emits NETWORK_AWAY error, when the server can not be located', () => {
      var heartbeatErrorHandler = jasmine.createSpy();
      socket.on('heartbeat.error', heartbeatErrorHandler);
      socket._serverUri = 'http://not.existing.uri.conf:8657';
      window.advanceClock(5050); // Advance the heartbeat interval.
      waitsFor(() => heartbeatErrorHandler.callCount > 0);
      runs(() => expect(heartbeatErrorHandler.argsForCall[0][0].code).toBe('NETWORK_AWAY'));
    });
  });

  describe('reconnect flow', () => {
    it('the socket would send the cached messages on reconnect', () => {
      var reconnectHandler = jasmine.createSpy();
      socket.on('reconnect', reconnectHandler);
      spyOn(server, '_onSocketMessage');

      var message0 = {foo0: 'bar0'};
      var message1 = {foo1: 'bar1'};
      var message2 = {foo2: 'bar2'};
      var message3 = {foo3: 'bar3'};
      var message4 = {foo4: 'bar4'};

      waitsForPromise(() => socket.waitForConnect());
      runs(() => socket.send(message0));
      waitsFor(() => server._onSocketMessage.calls.length === 1);

      runs(() => {
        // This call will error, because the socket will be closed on the next statement synchronously.
        socket.send(message1); // The messages will be cached and sent in order.
        socket._cleanWebSocket();

        socket.send(message2); // The messages will be cached and sent in order.
        // Make sure a close event on the old socket doesn't have any effect on the reconnect with a new socket.
        window.advanceClock(31 * 1000); // The default WebSocket's close timeout is 30 seconds.
        socket.send(message3); // The messages will be cached and sent in order.
        socket._scheduleReconnect();
        socket.send(message4); // The messages will be cached and sent in order.
        window.advanceClock(6000); // The maximum reconnect time is 5 seconds.
      });
      waitsFor(() => reconnectHandler.callCount > 0);
      waitsFor(() => server._onSocketMessage.calls.length === 5);
      runs(() => {
        expect(server._onSocketMessage.calls[0].args[1]).toEqual(JSON.stringify(message0));
        expect(server._onSocketMessage.calls[1].args[1]).toEqual(JSON.stringify(message1));
        expect(server._onSocketMessage.calls[2].args[1]).toEqual(JSON.stringify(message2));
        expect(server._onSocketMessage.calls[3].args[1]).toEqual(JSON.stringify(message3));
        expect(server._onSocketMessage.calls[4].args[1]).toEqual(JSON.stringify(message4));
      });
    });
  });
});
