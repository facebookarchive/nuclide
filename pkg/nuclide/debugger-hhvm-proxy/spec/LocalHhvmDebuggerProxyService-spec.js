'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {uncachedRequire, clearRequireCache} = require('nuclide-test-helpers');

describe('debugger-hhvm-proxy proxy', () => {
  var DbgpConnector;
  var MessageTranslator;
  var LocalHhvmDebuggerProxyService;
  var translater;
  var connector;
  var socket;
  var onNotify;
  var onSessionEnd;
  var notify;

  beforeEach(() => {
    socket = new (require('events').EventEmitter)();
    spyOn(socket, 'on');

    connector = jasmine.createSpyObj('DbgpConnector', ['attach', 'dispose']);
    DbgpConnector = spyOn(require('../lib/connect'), 'DbgpConnector').andReturn(connector);

    translater = jasmine.createSpyObj('MessageTranslator', ['onSessionEnd', 'dispose', 'handleCommand']);
    MessageTranslator = spyOn(require('../lib/MessageTranslator'), 'MessageTranslator').andCallFake(
      (socketArg, handler) => {
        notify = handler;
        return translater;
      });

    LocalHhvmDebuggerProxyService =
      uncachedRequire(require, '../lib/LocalHhvmDebuggerProxyService');

    onNotify = jasmine.createSpy('onNotify');
    onSessionEnd = jasmine.createSpy('onSessionEnd');

  });

  afterEach(() => {
    unspy(require('../lib/connect'), 'DbgpConnector');
    unspy(require('../lib/MessageTranslator'), 'MessageTranslator');
    clearRequireCache(require, '../lib/LocalHhvmDebuggerProxyService');
  });

  it('attach', () => {
    var port = 7782;

    var config = {
      xdebugPort: port,
      pid: null,
      idekeyRegex: null,
      scriptRegex: null,
    };

    waitsForPromise(async () => {
      connector.attach.andReturn(Promise.resolve(socket));
      var proxy = new LocalHhvmDebuggerProxyService();
      proxy.onSessionEnd(onSessionEnd);
      proxy.onNotify(onNotify);
      var connectionPromise = proxy.attach(config);

      expect(DbgpConnector).toHaveBeenCalledWith(config);
      expect(connector.attach).toHaveBeenCalledWith();

      var result = await connectionPromise;

      expect(socket.on).toHaveBeenCalledWith('end', jasmine.any(Function));
      expect(socket.on).toHaveBeenCalledWith('error', jasmine.any(Function));
      expect(MessageTranslator).toHaveBeenCalledWith(socket, jasmine.any(Function));
      expect(translater.onSessionEnd).toHaveBeenCalledWith(jasmine.any(Function));

      expect(result).toBe('HHVM connected');

      var command = {command: 42};
      proxy.sendCommand(command);

      expect(translater.handleCommand).toHaveBeenCalledWith(command);

      var message = {message: 43};
      notify(message);

      expect(onNotify).toHaveBeenCalledWith(message);

      proxy.dispose();

      expect(onSessionEnd).toHaveBeenCalledWith();
      expect(connector.dispose).toHaveBeenCalledWith();
      expect(translater.dispose).toHaveBeenCalledWith();
    });
  });
});
