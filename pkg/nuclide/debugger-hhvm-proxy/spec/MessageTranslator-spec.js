'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {MessageTranslator} = require('../lib/MessageTranslator');

describe('debugger-hhvm-proxy MessageTranslator', () => {
    var callback;
    var connectionMultiplexer;
    var translater;

    beforeEach(() => {
      callback = jasmine.createSpy('callback');
      connectionMultiplexer = jasmine.createSpyObj('connectionMultiplexer', ['dispose', 'onStatus']);
      translater = new MessageTranslator(connectionMultiplexer, callback);
    });

    it('constructor', () => {
      expect(connectionMultiplexer.onStatus).toHaveBeenCalled();
    });

    it('handleCommand', () => {
      waitsForPromise(async () => {
        await translater.handleCommand('{"id": 1, "method": "Page.enable"}');
        expect(callback).toHaveBeenCalledWith('{"id":1,"result":{}}');
      });
    });

    it('handleCommand - bad domain', () => {
      waitsForPromise(async () => {
        await translater.handleCommand('{"id": 1, "method": "foo.enable"}');
        expect(callback).toHaveBeenCalledWith('{"id":1,"result":{},"error":"Unknown domain: {\\\"id\\\": 1, \\\"method\\\": \\\"foo.enable\\\"}"}');
      });
    });

    it('dispose', () => {
      translater.dispose();
      expect(connectionMultiplexer.dispose).toHaveBeenCalledWith();
    });
});
