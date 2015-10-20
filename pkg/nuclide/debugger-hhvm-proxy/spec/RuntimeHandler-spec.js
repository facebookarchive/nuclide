'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {RuntimeHandler} = require('../lib/RuntimeHandler');

describe('debugger-hhvm-proxy RuntimeHandler', () => {
  let chromeCallback;
  let notificationCallback;
  let connectionMultiplexer;
  let handler;

  beforeEach(() => {
    connectionMultiplexer = jasmine.createSpyObj('connectionMultiplexer', ['getProperties']);
    chromeCallback = jasmine.createSpyObj(
      'chromeCallback',
      ['replyToCommand', 'replyWithError', 'sendMethod']
    );
    notificationCallback = jasmine.createSpyObj(
      'notificationCallback',
      ['sendInfo', 'sendWarning', 'sendError', 'sendFatalError']
    );
    handler = new RuntimeHandler(chromeCallback, notificationCallback, connectionMultiplexer);
  });

  it('enable', () => {
    handler.handleMethod(1, 'enable');
    expect(chromeCallback.sendMethod).toHaveBeenCalledWith(
      'Runtime.executionContextCreated',
      {
        'context': {
          'id': 1,
          'frameId': 'Frame.0',
          'name': 'hhvm: TODO: mangle in pid, idekey, script from connection',
        },
      });
  });

  it('getProperties', () => {
    waitsForPromise(async () => {
      connectionMultiplexer.getProperties = jasmine.createSpy('getProperties').
        andReturn(Promise.resolve('the-result'));

      var objectId = 'object-id';
      var ownProperties = false;
      var generatePreview = false;
      var accessorPropertiesOnly = false;
      await handler.handleMethod(1, 'getProperties',
        {objectId, ownProperties, accessorPropertiesOnly, generatePreview});
      expect(connectionMultiplexer.getProperties).toHaveBeenCalledWith(objectId);
      expect(chromeCallback.replyToCommand).toHaveBeenCalledWith(
        1,
        {result: 'the-result'}, undefined
      );
    });
  });

  it('unknown', () => {
    waitsForPromise(async () => {
      await handler.handleMethod(4, 'unknown');
      expect(chromeCallback.replyWithError).toHaveBeenCalledWith(4, jasmine.any(String));
    });
  });
});
