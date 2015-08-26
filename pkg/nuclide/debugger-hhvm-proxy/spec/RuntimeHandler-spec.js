'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var RuntimeHandler = require('../lib/RuntimeHandler');

describe('debugger-hhvm-proxy RuntimeHandler', () => {
    var callback;
    var connection;
    var handler;

    beforeEach(() => {
      connection = jasmine.createSpyObj('connection', ['getProperties']);
      callback = jasmine.createSpyObj('callback', ['replyToCommand', 'replyWithError', 'sendMethod']);
      handler = new RuntimeHandler(callback, connection);
    });

    it('enable', () => {
      handler.handleMethod(1, 'enable');
      expect(callback.sendMethod).toHaveBeenCalledWith(
        'Runtime.executionContextCreated',
        {
          'context': {
            'id': 1,
            'frameId': 'Frame.0',
            'name': 'hhvm: TODO: mangle in pid, idekey, script from connection',
          }
        });
    });

    it('getProperties', () => {
      waitsForPromise(async () => {
        connection.getProperties = jasmine.createSpy('getProperties').
          andReturn(Promise.resolve('the-result'));

        var objectId = 'object-id';
        var ownProperties = false;
        var generatePreview = false;
        var accessorPropertiesOnly = false;
        await handler.handleMethod(1, 'getProperties',
          {objectId, ownProperties, accessorPropertiesOnly, generatePreview});
        expect(connection.getProperties).toHaveBeenCalledWith(objectId);
        expect(callback.replyToCommand).toHaveBeenCalledWith(1, {result: 'the-result'}, undefined);
      });
    });

    it('unknown', () => {
      handler.handleMethod(4, 'unknown');
      expect(callback.replyWithError).toHaveBeenCalledWith(4, jasmine.any(String));
    });
});
