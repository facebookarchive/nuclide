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
  let MessageTranslator;
  let HhvmDebuggerProxyService;
  let translater;
  let serverMessageCallback;
  let notificationObservable;

  beforeEach(() => {
    translater = jasmine.createSpyObj(
      'MessageTranslator',
      ['onSessionEnd', 'dispose', 'handleCommand']
    );
    MessageTranslator = spyOn(require('../lib/MessageTranslator'), 'MessageTranslator').andCallFake(
      (socketArg, handler, observable) => {
        serverMessageCallback = handler;
        notificationObservable = observable;
        return translater;
      });

    HhvmDebuggerProxyService =
      uncachedRequire(require, '../lib/HhvmDebuggerProxyService').HhvmDebuggerProxyService;
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
      targetUri: '/tmp/foo.php',
    };

    waitsForPromise(async () => {
      var proxy = new HhvmDebuggerProxyService();

      const onServerMessageNotify = jasmine.createSpy('onServerMessageNotify');
      const onServerMessageError = jasmine.createSpy('onServerMessageError');
      const onSessionEnd = jasmine.createSpy('onSessionEnd');
      proxy.getServerMessageObservable().subscribe(
        onServerMessageNotify,
        onServerMessageError,
        onSessionEnd,
      );

      const onNotificationMessage = jasmine.createSpy('onNotificationMessage');
      const onNotificationError = jasmine.createSpy('onNotificationError');
      const onNotificationEnd = jasmine.createSpy('onNotificationEnd');
      proxy.getNotificationObservable().subscribe(
        onNotificationMessage,
        onNotificationError,
        onNotificationEnd,
      );

      var connectionPromise = proxy.attach(config);

      var result = await connectionPromise;

      expect(MessageTranslator).toHaveBeenCalledWith(
        config,
        jasmine.any(Function),
        jasmine.any(Object)
      );
      expect(translater.onSessionEnd).toHaveBeenCalledWith(jasmine.any(Function));

      expect(result).toBe('HHVM connected');

      var command = {command: 42};
      proxy.sendCommand(command);
      expect(translater.handleCommand).toHaveBeenCalledWith(command);

      var message = {message: 43};
      serverMessageCallback(message);
      expect(onServerMessageNotify).toHaveBeenCalledWith(message);

      const notificationMessage = {
        type: 'info',
        message: 'info message',
      };
      notificationObservable.onNext(notificationMessage);
      expect(onNotificationMessage).toHaveBeenCalledWith(notificationMessage);
      notificationObservable.onCompleted(notificationMessage);
      expect(onNotificationEnd).toHaveBeenCalledWith();

      proxy.dispose();
      expect(onSessionEnd).toHaveBeenCalledWith();
      expect(translater.dispose).toHaveBeenCalledWith();
    });
  });
});
