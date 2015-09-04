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

describe('debugger-hhvm-proxy ConnectionMultiplexer', () => {
  var socket;
  var dbgpSocket;
  var dataCache;
  var connection;

  var config = {
    xdebugPort: 9000,
    pid: null,
    idekeyRegex: null,
    scriptRegex: null,
  };

  beforeEach(() => {
    socket = jasmine.createSpyObj('socket', ['on']);
    connector = jasmine.createSpyObj('connector', [
        'attach',
        'dispose',
      ]);
    DbgpConnector = spyOn(require('../lib/DbgpConnector'), 'DbgpConnector').andReturn(connector);

    connection = jasmine.createSpyObj('connection', [
        'onStatus',
        'setBreakpoint',
        'removeBreakpoint',
        'getStackFrames',
        'getStatus',
        'sendContinuationCommand',
        'sendBreakCommand',
        'dispose',
      ]);
    Connection = spyOn(require('../lib/Connection'), 'Connection').andReturn(connection);

    breakpointStore = jasmine.createSpyObj('breakpointStore', [
      'addConnection',
      'removeConnection',
      'setBreakpoint',
      'removeBreakpoint',
    ]);
    BreakpointStore = spyOn(require('../lib/BreakpointStore'), 'BreakpointStore').andReturn(breakpointStore);

    var {ConnectionMultiplexer} =
      uncachedRequire(require, '../lib/ConnectionMultiplexer');
    connectionMultiplexer = new ConnectionMultiplexer(config);
  });

  afterEach(() => {
    unspy(require('../lib/DbgpConnector'), 'DbgpConnector');
    unspy(require('../lib/Connection'), 'Connection');
    unspy(require('../lib/BreakpointStore'), 'BreakpointStore');
    clearRequireCache(require, '../lib/ConnectionMultiplexer');
  });

  it('constructor', () => {
    expect(BreakpointStore).toHaveBeenCalledWith();
  });

  it('enable', () => {
    waitsForPromise(async () => {
      connector.attach = jasmine.createSpy('attach').
        andReturn(Promise.resolve(socket));

      await connectionMultiplexer.enable();

      expect(DbgpConnector).toHaveBeenCalledWith(config);
      expect(connector.attach).toHaveBeenCalledWith();
      expect(Connection).toHaveBeenCalledWith(socket);
      expect(breakpointStore.addConnection).toHaveBeenCalledWith(connection);
      expect(connection.onStatus).toHaveBeenCalledWith(jasmine.any(Function));
      expect(connection.getStatus).toHaveBeenCalledWith();
    });
  });

  it('setBreakpoint', () => {
    connectionMultiplexer.setBreakpoint('filename', 42);
    expect(breakpointStore.setBreakpoint).toHaveBeenCalledWith('filename', 42);
  });

  it('removeBreakpoint', () => {
    connectionMultiplexer.removeBreakpoint('breakpointId');
    expect(breakpointStore.removeBreakpoint).toHaveBeenCalledWith('breakpointId');
  });

});
