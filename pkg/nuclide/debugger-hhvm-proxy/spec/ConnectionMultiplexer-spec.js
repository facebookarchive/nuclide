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

var {
  STATUS_STARTING,
  STATUS_STOPPING,
  STATUS_STOPPED,
  STATUS_RUNNING,
  STATUS_BREAK,
  STATUS_ERROR,
  STATUS_END,
  COMMAND_RUN,
  COMMAND_STEP_INTO,
} = require('../lib/DbgpSocket');

describe('debugger-hhvm-proxy ConnectionMultiplexer', () => {
  var socket;
  var dbgpSocket;
  var dataCache;
  var connection;
  var onAttach;
  var onClose;
  var onStatus;

  var config = {
    xdebugPort: 9000,
    pid: null,
    idekeyRegex: null,
    scriptRegex: null,
  };

  beforeEach(() => {
    onStatus = jasmine.createSpy('onStatus');

    socket = jasmine.createSpyObj('socket', ['on']);
    connector = jasmine.createSpyObj('connector', [
        'listen',
        'onAttach',
        'onClose',
        'dispose',
      ]);
    connector.onAttach = jasmine.createSpy('onAttach').andCallFake(callback => { onAttach = callback; });
    connector.onClose = jasmine.createSpy('onClose').andCallFake(callback => { onClose = callback; });
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
    connectionMultiplexer.onStatus(onStatus);
  });

  afterEach(() => {
    unspy(require('../lib/DbgpConnector'), 'DbgpConnector');
    unspy(require('../lib/Connection'), 'Connection');
    unspy(require('../lib/BreakpointStore'), 'BreakpointStore');
    clearRequireCache(require, '../lib/ConnectionMultiplexer');
  });

  it('constructor', () => {
    expect(BreakpointStore).toHaveBeenCalledWith();
    expect(DbgpConnector).toHaveBeenCalledWith(config);
    expect(connector.onAttach).toHaveBeenCalledWith(onAttach);
    expect(connector.onClose).toHaveBeenCalledWith(onClose);
  });

  it('enable', () => {
    connectionMultiplexer.enable();

    expect(connector.listen).toHaveBeenCalledWith();
  });

  it('attach', () => {
    waitsForPromise(async () => {
      connection.getStatus = jasmine.createSpy('getStatus').andReturn(STATUS_STARTING);

      await onAttach(socket);

      expect(connector.dispose).toHaveBeenCalledWith();
      expect(Connection).toHaveBeenCalledWith(socket);
      expect(breakpointStore.addConnection).toHaveBeenCalledWith(connection);
      expect(connection.onStatus).toHaveBeenCalledWith(jasmine.any(Function));
      expect(connection.getStatus).toHaveBeenCalledWith();
      expect(connection.sendContinuationCommand).toHaveBeenCalledWith(COMMAND_STEP_INTO);
      expect(onStatus).not.toHaveBeenCalled();
    });
  });

  it('attach - fail to get status', () => {
    waitsForPromise(async () => {
      connection.getStatus = jasmine.createSpy('getStatus').andCallFake(() => {
        throw new Error('Failed to get status.');
      });

      await onAttach(socket);

      expect(connector.dispose).toHaveBeenCalledWith();
      expect(Connection).toHaveBeenCalledWith(socket);
      expect(breakpointStore.addConnection).toHaveBeenCalledWith(connection);
      expect(connection.onStatus).toHaveBeenCalledWith(jasmine.any(Function));
      expect(connection.getStatus).toHaveBeenCalledWith();
      expect(connection.sendContinuationCommand).not.toHaveBeenCalled();
      expect(onStatus).toHaveBeenCalledWith(STATUS_ERROR);
    });
  });

  it('onClose', () => {
    onClose();

    expect(connector.dispose).toHaveBeenCalledWith();
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
