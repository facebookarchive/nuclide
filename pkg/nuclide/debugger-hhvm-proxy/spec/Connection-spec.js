'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Connection as ConnectionType} from '../lib/Connection';
import type {DbgpSocket as DbgpSocketType} from '../lib/DbgpSocket';
import type {DataCache as DataCacheType} from '../lib/DataCache';
import type {Socket} from 'net';

type DataCacheConstructorType = () => DataCacheType;
type ConnectionConstuctorType = () => ConnectionType;
type DbgpSocketConstructorType = () => DbgpSocketType;
const {uncachedRequire, clearRequireCache} = require('../../test-helpers');

describe('debugger-hhvm-proxy Connection', () => {
  let DbgpSocketConstructor: DbgpSocketConstructorType = (null: any);
  let DataCacheConstructor: DataCacheConstructorType = (null: any);
  let ConnectionConstuctor: ConnectionConstuctorType = (null: any);

  let socket: Socket = (null: any);
  let dbgpSocket: DbgpSocketType = (null: any);
  let dataCache: DataCacheType = (null: any);
  let connection: ConnectionType = (null: any);

  beforeEach(() => {
    socket = ((jasmine.createSpyObj('socket', ['write', 'end', 'destroy']): any): Socket);

    dbgpSocket = ((jasmine.createSpyObj('dbgpSocket',
      ['onStatus',
      'setBreakpoint',
      'setExceptionBreakpoint',
      'removeBreakpoint',
      'getStackFrames',
      'getStatus',
      'sendContinuationCommand',
      'sendBreakCommand',
      'dispose']
    ): any): DbgpSocketType);
    DbgpSocketConstructor = (
      (spyOn(require('../lib/DbgpSocket'), 'DbgpSocket').andReturn(dbgpSocket): any)
      : DbgpSocketConstructorType
    );

    dataCache = ((jasmine.createSpyObj('dataCache', [
      'evaluateOnCallFrame', 'getProperties', 'getScopesForFrame']
    ): any): DataCacheType);
    DataCacheConstructor = (
      (spyOn(require('../lib/DataCache'), 'DataCache').andReturn(dataCache): any)
      : DataCacheConstructorType
    );
    ConnectionConstuctor = ((
      uncachedRequire(require, '../lib/Connection'): any
    ): {Connection: ConnectionConstuctor}).Connection;
    connection = new ConnectionConstuctor(socket);
  });

  afterEach(() => {
    unspy(require('../lib/DbgpSocket'), 'DbgpSocket');
    unspy(require('../lib/DataCache'), 'DataCache');
    clearRequireCache(require, '../lib/Connection');
  });

  it('constructor', () => {
    expect(DbgpSocketConstructor).toHaveBeenCalledWith(socket);
    expect(DataCacheConstructor).toHaveBeenCalledWith(dbgpSocket);
  });

  it('onStatus', () => {
    function onStatus(status: string) {}
    connection.onStatus(onStatus);
    expect(dbgpSocket.onStatus).toHaveBeenCalledWith(onStatus);
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

  it('setExceptionBreakpoint', () => {
    connection.setExceptionBreakpoint('exceptionName');
    expect(dbgpSocket.setExceptionBreakpoint).toHaveBeenCalledWith('exceptionName');
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
