'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

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
});
