'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var net = require('net');
var {makeDbgpMessage} = require('../lib/utils');
var {DbgpConnector} = require('../lib/connect');
var {EventEmitter} = require('events');
var {uncachedRequire, clearRequireCache} = require('nuclide-test-helpers');

var payload1 =
`<init
  xmlns="urn:debugger_protocol_v1"
  xmlns:xdebug="http://xdebug.org/dbgp/xdebug"
  fileuri="file:///test1.php"
  language="PHP"
  protocol_version="1.0"
  appid="1"
  idekey="username1">

  <engine version=""><![CDATA[xdebug]]></engine>
  <author>
    <![CDATA[HHVM]]>
  </author>
  <url>
    <![CDATA[http://hhvm.com/]]>
  </url>
  <copyright>
    <![CDATA[Copyright (c) 2002-2013 by Derick Rethans]]>
  </copyright>
</init>`;

var payload2 =
`<init
  xmlns="urn:debugger_protocol_v1"
  xmlns:xdebug="http://xdebug.org/dbgp/xdebug"
  fileuri="file:///test2.php"
  language="PHP"
  protocol_version="1.0"
  appid="2"
  idekey="username2">

  <engine version=""><![CDATA[xdebug]]></engine>
  <author>
    <![CDATA[HHVM]]>
  </author>
  <url>
    <![CDATA[http://hhvm.com/]]>
  </url>
  <copyright>
    <![CDATA[Copyright (c) 2002-2013 by Derick Rethans]]>
  </copyright>
</init>`;

describe('debugger-hhvm-proxy connect', () => {
    var server;
    var socket;

    function createSocketSpy() {
      var result = new EventEmitter();
      spyOn(result, 'on').andCallThrough();
      spyOn(result, 'once').andCallThrough();
      return result;
    }

    beforeEach(() => {
      server = new EventEmitter();
      spyOn(server, 'on').andCallThrough();
      server.close = jasmine.createSpy('close').andCallFake(() => server.emit('close'));
      server.listen = jasmine.createSpy('listen');

      socket = createSocketSpy();

      spyOn(net, 'createServer').andReturn(server);
      uncachedRequire(require, '../lib/connect');
    });

    afterEach(() => {
      unspy(net, 'createServer');
      clearRequireCache(require, '../lib/connect');
    });

    it('no filtering', () => {
      var port = 7779;

      var config = {
        xdebugPort: port,
        pid: null,
        idekeyRegex: null,
        scriptRegex: null,
      };

      var hadError = false;
      var hadConnection = false;

      var connectionPromise;

      waitsForPromise(async () => {
        var connector = new DbgpConnector(config);
        connectionPromise = connector.attach();

        expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));
        expect(server.listen).toHaveBeenCalledWith(port, jasmine.any(Function));
        expect(server.on).toHaveBeenCalledWith('error', jasmine.any(Function));
        expect(server.on).toHaveBeenCalledWith('connection', jasmine.any(Function));
        expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));

        var emitted = server.emit('connection', socket);
        expect(emitted).toBe(true);
        expect(socket.once).toHaveBeenCalledWith('data', jasmine.any(Function));

        socket.emit('data', makeDbgpMessage(payload1));

        var socketResult = await connectionPromise;

        expect(socketResult).toBe(socket);
        expect(server.close).toHaveBeenCalledWith();

        connector.dispose();
      });
    });

    it('filtering', () => {
      var port = 7780;

      var config = {
        xdebugPort: port,
        pid: null,
        idekeyRegex: 'username2',
        scriptRegex: 'test2.php',
      };

      waitsForPromise(async () => {
        var connector = new DbgpConnector(config);
        var connectionPromise = connector.attach();

        expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));
        expect(server.listen).toHaveBeenCalledWith(port, jasmine.any(Function));
        expect(server.on).toHaveBeenCalledWith('error', jasmine.any(Function));
        expect(server.on).toHaveBeenCalledWith('connection', jasmine.any(Function));
        expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));

        var socket1 = createSocketSpy();
        socket1.end = jasmine.createSpy();
        socket1.destroy = jasmine.createSpy();

        var emitted = server.emit('connection', socket1);
        expect(emitted).toBe(true);
        expect(socket1.once).toHaveBeenCalledWith('data', jasmine.any(Function));

        socket1.emit('data', makeDbgpMessage(payload1));
        expect(socket1.end).toHaveBeenCalledWith();
        expect(socket1.destroy).toHaveBeenCalledWith();

        var emitted = server.emit('connection', socket);
        expect(emitted).toBe(true);
        expect(socket.once).toHaveBeenCalledWith('data', jasmine.any(Function));

        socket.emit('data', makeDbgpMessage(payload2));

        var socketResult = await connectionPromise;

        expect(socketResult).toBe(socket);
        expect(server.close).toHaveBeenCalledWith();

        connector.dispose();
      });
    });

    it('abort connection', () => {
      var port = 7781;

      var config = {
        xdebugPort: port,
        pid: null,
        idekeyRegex: null,
        scriptRegex: null,
      };

      waitsForPromise(async () => {
        var connector = new DbgpConnector(config);
        var connectionPromise = connector.attach();

        expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));
        expect(server.listen).toHaveBeenCalledWith(port, jasmine.any(Function));
        expect(server.on).toHaveBeenCalledWith('error', jasmine.any(Function));
        expect(server.on).toHaveBeenCalledWith('connection', jasmine.any(Function));
        expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));

        connector.dispose();
        expect(server.close).toHaveBeenCalledWith();

        var {expectAsyncFailure} = require('nuclide-test-helpers');
        await expectAsyncFailure(connectionPromise,
          error => {
            expect(error).toBe('Connection aborted.');
          });
      });
    });
});
