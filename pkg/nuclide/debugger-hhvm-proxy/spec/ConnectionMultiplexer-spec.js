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

describe('debugger-hhvm-proxy Connection', () => {
  var socket;
  var dbgpSocket;
  var dataCache;
  var connection;

  beforeEach(() => {
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

    breakpointStore = jasmine.createSpyObj('breakpointStore', [
      'addConnection',
      'removeConnection',
      'setBreakpoint',
      'removeBreakpoint',
    ]);
    BreakpointStore = spyOn(require('../lib/BreakpointStore'), 'BreakpointStore').andReturn(breakpointStore);

    var {ConnectionMultiplexer} =
      uncachedRequire(require, '../lib/ConnectionMultiplexer');
    connectionMultiplexer = new ConnectionMultiplexer(connection);
  });

  afterEach(() => {
    unspy(require('../lib/BreakpointStore'), 'BreakpointStore');
    clearRequireCache(require, '../lib/ConnectionMultiplexer');
  });

  it('constructor', () => {
    expect(BreakpointStore).toHaveBeenCalledWith();
    expect(breakpointStore.addConnection).toHaveBeenCalledWith(connection);
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
