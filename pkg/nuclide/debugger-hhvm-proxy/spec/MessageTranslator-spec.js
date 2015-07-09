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

describe('debugger-hhvm-proxy DebuggerHandler', () => {
    var callback;
    var socket;
    var translater;

    beforeEach(() => {
      callback = jasmine.createSpy('callback');
      socket = jasmine.createSpyObj('socket', ['write', 'end', 'destroy', 'on']);
      translater = new MessageTranslator(socket, callback);
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
      expect(socket.end).toHaveBeenCalled();
      expect(socket.destroy).toHaveBeenCalled();
    });
});
