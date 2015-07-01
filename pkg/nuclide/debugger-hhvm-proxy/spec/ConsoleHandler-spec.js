'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var ConsoleHandler = require('../lib/ConsoleHandler');

describe('debugger-hhvm-proxy ConsoleHandler', () => {
    var callback;
    var handler;

    beforeEach(() => {
      callback = jasmine.createSpyObj('callback', ['replyToCommand', 'replyWithError', 'sendMethod']);
      handler = new ConsoleHandler(callback);
    });

    it('enable', () => {
      waitsForPromise(async () => {
        await handler.handleMethod(1, 'enable');
        expect(callback.replyToCommand).toHaveBeenCalledWith(1, {}, undefined);
      });
    });

    it('disable', () => {
      waitsForPromise(async () => {
        await handler.handleMethod(2, 'disable');
        expect(callback.replyToCommand).toHaveBeenCalledWith(2, {}, undefined);
      });
    });

    it('clearMessages', () => {
      waitsForPromise(async () => {
        await handler.handleMethod(3, 'clearMessages');
        expect(callback.sendMethod).toHaveBeenCalledWith('Console.messagesCleared', undefined);
      });
    });

    it('unknown', () => {
      waitsForPromise(async () => {
        await handler.handleMethod(4, 'unknown');
        expect(callback.replyWithError).toHaveBeenCalledWith(4, jasmine.any(String));
      });
    });
});
