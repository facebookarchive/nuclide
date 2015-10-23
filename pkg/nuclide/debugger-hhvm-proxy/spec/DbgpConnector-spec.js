'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import net from 'net';
import {makeDbgpMessage} from '../lib/helpers';
import {DbgpConnector} from '../lib/DbgpConnector';
import {EventEmitter} from 'events';
import {uncachedRequire, clearRequireCache} from 'nuclide-test-helpers';

const payload1 =
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

const payload2 =
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

describe('debugger-hhvm-proxy DbgpConnector', () => {
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
    uncachedRequire(require, '../lib/DbgpConnector');
  });

  afterEach(() => {
    unspy(net, 'createServer');
    clearRequireCache(require, '../lib/DbgpConnector');
  });

  it('no filtering', () => {
    var port = 7779;

    var config = {
      xdebugPort: port,
      pid: null,
      idekeyRegex: null,
      scriptRegex: null,
    };

    var onAttach = jasmine.createSpy('onAttach').andCallFake(
      attachedSocket => {
        expect(socket.once).toHaveBeenCalledWith('data', jasmine.any(Function));

        expect(attachedSocket).toBe(socket);

        connector.dispose();
        expect(server.close).toHaveBeenCalledWith();
        expect(onClose).toHaveBeenCalledWith(undefined);
      });
    var onClose = jasmine.createSpy('onClose');

    var connector = new DbgpConnector(config);
    connector.listen();
    connector.onClose(onClose);
    connector.onAttach(onAttach);

    expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));
    expect(server.listen).toHaveBeenCalledWith(port, jasmine.any(Function));
    expect(server.on).toHaveBeenCalledWith('error', jasmine.any(Function));
    expect(server.on).toHaveBeenCalledWith('connection', jasmine.any(Function));
    expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));

    var emitted = server.emit('connection', socket);
    expect(emitted).toBe(true);

    expect(onClose).not.toHaveBeenCalledWith();
    expect(onAttach).not.toHaveBeenCalledWith();

    socket.emit('data', makeDbgpMessage(payload1));

    expect(onAttach).toHaveBeenCalled();
  });

  it('filtering', () => {
    var port = 7780;

    var config = {
      xdebugPort: port,
      pid: null,
      idekeyRegex: 'username2',
      scriptRegex: 'test2.php',
    };

    var onClose = jasmine.createSpy('onClose');
    var onAttach = jasmine.createSpy('onAttach').andCallFake(
      attachedSocket => {
        expect(attachedSocket).toBe(socket);
      });

    var connector = new DbgpConnector(config);
    connector.listen();
    connector.onClose(onClose);
    connector.onAttach(onAttach);

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
    expect(onAttach).not.toHaveBeenCalled();

    var emitted = server.emit('connection', socket);
    expect(emitted).toBe(true);
    expect(socket.once).toHaveBeenCalledWith('data', jasmine.any(Function));

    expect(onAttach).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    socket.emit('data', makeDbgpMessage(payload2));
    expect(onAttach).toHaveBeenCalled();
  });

  it('abort connection', () => {
    var port = 7781;

    var config = {
      xdebugPort: port,
      pid: null,
      idekeyRegex: null,
      scriptRegex: null,
    };

    var onClose = jasmine.createSpy('onClose');

    var connector = new DbgpConnector(config);
    connector.listen();
    connector.onClose(onClose);

    expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));
    expect(server.listen).toHaveBeenCalledWith(port, jasmine.any(Function));
    expect(server.on).toHaveBeenCalledWith('error', jasmine.any(Function));
    expect(server.on).toHaveBeenCalledWith('connection', jasmine.any(Function));
    expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));

    expect(server.close).not.toHaveBeenCalledWith();
    expect(onClose).not.toHaveBeenCalledWith();
    connector.dispose();
    expect(server.close).toHaveBeenCalledWith();
    expect(onClose).toHaveBeenCalledWith(undefined);
  });

  it('connection error - EADDRINUSE', () => {
    const port = 7781;
    const config = {
      xdebugPort: port,
      pid: null,
      idekeyRegex: null,
      scriptRegex: null,
    };

    const onClose = jasmine.createSpy('onClose');
    const onError = jasmine.createSpy('onError');

    const connector = new DbgpConnector(config);
    connector.listen();
    connector.onClose(onClose);
    connector.onError(onError);

    expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));
    expect(server.listen).toHaveBeenCalledWith(port, jasmine.any(Function));
    expect(server.on).toHaveBeenCalledWith('error', jasmine.any(Function));
    expect(server.on).toHaveBeenCalledWith('connection', jasmine.any(Function));
    expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));

    expect(server.close).not.toHaveBeenCalledWith();
    expect(onClose).not.toHaveBeenCalledWith();

    // Trigger error.
    const emitted = server.emit('error', {
      code: 'EADDRINUSE',
    });

    expect(emitted).toBe(true);
    expect(onError).toHaveBeenCalledWith(
      `Can't start debugging because port ${port} is being used by another process. ` +
      `Try running 'killall node' on your devserver and then restarting Nuclide.`
    );
    expect(server.close).toHaveBeenCalledWith();
    expect(onClose).toHaveBeenCalledWith(undefined);
  });

  it('connection error - unknown error', () => {
    const port = 7781;
    const config = {
      xdebugPort: port,
      pid: null,
      idekeyRegex: null,
      scriptRegex: null,
    };

    const onClose = jasmine.createSpy('onClose');
    const onError = jasmine.createSpy('onError');

    const connector = new DbgpConnector(config);
    connector.listen();
    connector.onClose(onClose);
    connector.onError(onError);

    expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));
    expect(server.listen).toHaveBeenCalledWith(port, jasmine.any(Function));
    expect(server.on).toHaveBeenCalledWith('error', jasmine.any(Function));
    expect(server.on).toHaveBeenCalledWith('connection', jasmine.any(Function));
    expect(server.on).toHaveBeenCalledWith('close', jasmine.any(Function));

    expect(server.close).not.toHaveBeenCalledWith();
    expect(onClose).not.toHaveBeenCalledWith();

    // Trigger error.
    const errorCode = 'something is wrong';
    const emitted = server.emit('error', {
      code: errorCode,
    });

    expect(emitted).toBe(true);
    expect(onError).toHaveBeenCalledWith(
      `Unknown debugger socket error: ${errorCode}.`
    );
    expect(server.close).toHaveBeenCalledWith();
    expect(onClose).toHaveBeenCalledWith(undefined);
  });
});
