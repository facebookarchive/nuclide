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
var {MessageTranslator} = require('../lib/MessageTranslator');

describe('debugger-hhvm-proxy MessageTranslator', () => {
  var callback;
  var connectionMultiplexer;
  var ConnectionMultiplexer;
  var translater;
  let notificationObservable;

  var config = {
    xdebugPort: 9000,
    pid: null,
    idekeyRegex: null,
    scriptRegex: null,
  };

  beforeEach(() => {
    callback = jasmine.createSpy('callback');
    connectionMultiplexer = jasmine.createSpyObj(
      'connectionMultiplexer',
      ['dispose', 'onStatus', 'onConnectionError']
    );
    ConnectionMultiplexer = spyOn(require('../lib/ConnectionMultiplexer'), 'ConnectionMultiplexer')
      .andReturn(connectionMultiplexer);
    notificationObservable = jasmine.createSpy(
      'notificationObservable',
      ['onNext', 'onError', 'onCompleted'],
    );

    MessageTranslator = uncachedRequire(require, '../lib/MessageTranslator').MessageTranslator;
    translater = new MessageTranslator(config, callback, notificationObservable);
  });

  afterEach(() => {
    unspy(require('../lib/ConnectionMultiplexer'), 'ConnectionMultiplexer');
    clearRequireCache(require, '../lib/MessageTranslator');
  });

  it('constructor', () => {
    expect(ConnectionMultiplexer).toHaveBeenCalledWith(config);
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
      expect(callback).toHaveBeenCalledWith(
        '{"id":1,"result":{},"error":' +
        '"Unknown domain: {\\\"id\\\": 1, \\\"method\\\": \\\"foo.enable\\\"}"}'
      );
    });
  });

  it('dispose', () => {
    translater.dispose();
    expect(connectionMultiplexer.dispose).toHaveBeenCalledWith();
  });
});
