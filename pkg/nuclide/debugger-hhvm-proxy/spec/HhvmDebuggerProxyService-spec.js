'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  HhvmDebuggerProxyService as HhvmDebuggerProxyServiceType,
} from '../lib/HhvmDebuggerProxyService';

import {uncachedRequire, clearRequireCache} from '../../test-helpers';

describe('debugger-hhvm-proxy proxy', () => {
  let MessageTranslator: any;
  let HhvmDebuggerProxyService: any;
  let translater: any;
  let clientCallback: any;

  beforeEach(() => {
    translater = jasmine.createSpyObj(
      'MessageTranslator',
      ['onSessionEnd', 'dispose', 'handleCommand']
    );
    MessageTranslator = spyOn(require('../lib/MessageTranslator'), 'MessageTranslator').andCallFake(
      (socketArg, callback) => {
        clientCallback = callback;
        return translater;
      });

    HhvmDebuggerProxyService = ((
      uncachedRequire(require, '../lib/HhvmDebuggerProxyService'): any
    ): {HhvmDebuggerProxyService: () => HhvmDebuggerProxyServiceType}).HhvmDebuggerProxyService;
  });

  afterEach(() => {
    jasmine.unspy(require('../lib/MessageTranslator'), 'MessageTranslator');
    clearRequireCache(require, '../lib/HhvmDebuggerProxyService');
  });

  it('attach', () => {
    const port = 7782;

    const config = {
      xdebugPort: port,
      pid: null,
      idekeyRegex: null,
      scriptRegex: null,
      targetUri: '/tmp/foo.php',
    };

    waitsForPromise(async () => {
      const proxy = new HhvmDebuggerProxyService();

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

      const connectionPromise = proxy.attach(config);

      const result = await connectionPromise;

      expect(MessageTranslator).toHaveBeenCalledWith(
        config,
        clientCallback
      );
      expect(translater.onSessionEnd).toHaveBeenCalledWith(jasmine.any(Function));

      expect(result).toBe('HHVM connected');

      const command = {command: 42};
      proxy.sendCommand(command);
      expect(translater.handleCommand).toHaveBeenCalledWith(command);

      clientCallback.replyToCommand(43, 'reply message');
      expect(onServerMessageNotify).toHaveBeenCalledWith('{"id":43,"result":"reply message"}');

      proxy.dispose();
      expect(onSessionEnd).toHaveBeenCalledWith();
      expect(translater.dispose).toHaveBeenCalledWith();
    });
  });
});
