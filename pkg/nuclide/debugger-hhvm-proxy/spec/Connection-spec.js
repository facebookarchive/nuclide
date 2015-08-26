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
    socket = jasmine.createSpyObj('socket', ['write', 'end', 'destroy']);

    dbgpSocket = jasmine.createSpyObj('dbgpSocket', [
        'setBreakpoint',
        'removeBreakpoint',
        'getStackFrames',
        'getStatus',
        'sendContinuationCommand',
        'sendBreakCommand',
        'dispose',
      ]);
    DbgpSocket = spyOn(require('../lib/DbgpSocket'), 'DbgpSocket').andReturn(dbgpSocket);

    dataCache = jasmine.createSpyObj('dataCache', [
        'evaluateOnCallFrame', 'getProperties', 'getScopesForFrame']);
    DataCache = spyOn(require('../lib/DataCache'), 'DataCache').andReturn(dataCache);

    var {Connection} =
      uncachedRequire(require, '../lib/Connection');
    connection = new Connection(socket);
  });

  afterEach(() => {
    unspy(require('../lib/DbgpSocket'), 'DbgpSocket');
    unspy(require('../lib/DataCache'), 'DataCache');
    clearRequireCache(require, '../lib/Connection');
  });

  it('constructor', () => {
    expect(DbgpSocket).toHaveBeenCalledWith(socket);
    expect(DataCache).toHaveBeenCalledWith(dbgpSocket);
  });

  it('dispose', () => {
    connection.dispose();
    expect(dbgpSocket.dispose).toHaveBeenCalledWith();
  });

  it('evaluateOnCallFrame', () => {
    connection.evaluateOnCallFrame(42, 'hello');
    expect(dataCache.evaluateOnCallFrame).toHaveBeenCalledWith(42, 'hello');
  });

  it('getProperties', () => {
    connection.getProperties('remoteId');
    expect(dataCache.getProperties).toHaveBeenCalledWith('remoteId');
  });

  it('getScopesForFrame', () => {
    connection.getScopesForFrame(42);
    expect(dataCache.getScopesForFrame).toHaveBeenCalledWith(42);
  });

  it('setBreakpoint', () => {
    connection.setBreakpoint('filename', 42);
    expect(dbgpSocket.setBreakpoint).toHaveBeenCalledWith('filename', 42);
  });

  it('removeBreakpoint', () => {
    connection.removeBreakpoint('breakpointId');
    expect(dbgpSocket.removeBreakpoint).toHaveBeenCalledWith('breakpointId');
  });

  it('getStackFrames', () => {
    connection.getStackFrames();
    expect(dbgpSocket.getStackFrames).toHaveBeenCalledWith();
  });

  it('getStatus', () => {
    connection.getStatus();
    expect(dbgpSocket.getStatus).toHaveBeenCalledWith();
  });

  it('sendContinuationCommand', () => {
    connection.sendContinuationCommand('step_into');
    expect(dbgpSocket.sendContinuationCommand).toHaveBeenCalledWith('step_into');
  });

  it('sendBreakCommand', () => {
    connection.sendBreakCommand();
    expect(dbgpSocket.sendBreakCommand).toHaveBeenCalledWith();
  });
});
