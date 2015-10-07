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
  var MessageTranslator;
  var HhvmDebuggerProxyService;
  var translater;
  var onNotify;
  var onError;
  var onSessionEnd;
  var notify;

  beforeEach(() => {
    translater = jasmine.createSpyObj('MessageTranslator', ['onSessionEnd', 'dispose', 'handleCommand']);
    MessageTranslator = spyOn(require('../lib/MessageTranslator'), 'MessageTranslator').andCallFake(
      (socketArg, handler) => {
        notify = handler;
        return translater;
      });

    HhvmDebuggerProxyService =
      uncachedRequire(require, '../lib/HhvmDebuggerProxyService').HhvmDebuggerProxyService;

    onNotify = jasmine.createSpy('onNotify');
    onError = jasmine.createSpy('onError');
    onSessionEnd = jasmine.createSpy('onSessionEnd');
  });

  afterEach(() => {
    unspy(require('../lib/MessageTranslator'), 'MessageTranslator');
    clearRequireCache(require, '../lib/HhvmDebuggerProxyService');
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
      var proxy = new HhvmDebuggerProxyService();
      proxy.getNotificationObservable().subscribe(
        onNotify,
        onError,
        onSessionEnd,
      );
      var connectionPromise = proxy.attach(config);

      var result = await connectionPromise;

      expect(MessageTranslator).toHaveBeenCalledWith(config, jasmine.any(Function));
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
      expect(translater.dispose).toHaveBeenCalledWith();
    });
  });
});
