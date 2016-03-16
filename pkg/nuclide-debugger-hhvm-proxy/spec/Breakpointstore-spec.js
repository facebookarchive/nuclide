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
const {BreakpointStore} = require('../lib/BreakpointStore');

describe('debugger-hhvm-proxy BreakpointStore', () => {
  let store;
  let connection1, connection2;
  let onStatus1;

  function createIdGenerator(prefix) {
    let id = 0;
    return () => {
      id++;
      return prefix + id;
    };
  }

  beforeEach(() => {
    store = new BreakpointStore();
    const con1IdGenerator = createIdGenerator('con1prefix');
    const con2IdGenerator = createIdGenerator('con2prefix');

    connection1 = (({
      setBreakpoint: jasmine.createSpy().andCallFake(con1IdGenerator),
      setExceptionBreakpoint: jasmine.createSpy().andCallFake(con1IdGenerator),
      onStatus: jasmine.createSpy().andCallFake(callback => { onStatus1 = callback; }),
      removeBreakpoint: jasmine.createSpy(),
    }: any): ConnectionType);
    connection2 = (({
      setBreakpoint: jasmine.createSpy().andCallFake(con2IdGenerator),
      setExceptionBreakpoint: jasmine.createSpy().andCallFake(con2IdGenerator),
      onStatus: jasmine.createSpy().andCallFake(callback => { onStatus1 = callback; }),
      removeBreakpoint: jasmine.createSpy(),
    }: any): ConnectionType);
  });

  it('add connection - then bps', () => {
    waitsForPromise(async () => {
      store.addConnection(connection1);

      const id1 = store.setBreakpoint('file1', 42);
      expect(connection1.setBreakpoint).toHaveBeenCalledWith('file1', 42);

      const id2 = store.setBreakpoint('file1', 43);
      expect(connection1.setBreakpoint).toHaveBeenCalledWith('file1', 43);
      expect(id1).not.toEqual(id2);

      const id3 = store.setPauseOnExceptions('all');
      expect(connection1.setExceptionBreakpoint).toHaveBeenCalledWith('*');
      expect(id3).not.toEqual(id2);

      await store.removeBreakpoint(id2);
      expect(connection1.removeBreakpoint).toHaveBeenCalledWith('con1prefix2');

      await store.removeBreakpoint(id1);
      expect(connection1.removeBreakpoint).toHaveBeenCalledWith('con1prefix1');

      await store.setPauseOnExceptions('none');
      expect(connection1.removeBreakpoint).toHaveBeenCalledWith('con1prefix3');
    });
  });

  it('add bps - then connections', () => {
    waitsForPromise(async () => {

      const id1 = store.setBreakpoint('file1', 42);
      const id2 = store.setBreakpoint('file1', 43);
      const id3 = store.setPauseOnExceptions('all');

      store.addConnection(connection1);
      expect(connection1.setBreakpoint).toHaveBeenCalledWith('file1', 42);
      expect(connection1.setBreakpoint).toHaveBeenCalledWith('file1', 43);
      expect(connection1.setExceptionBreakpoint).toHaveBeenCalledWith('*');
      expect(id1).not.toEqual(id2);
      expect(id2).not.toEqual(id3);

      await store.removeBreakpoint(id2);
      expect(connection1.removeBreakpoint).toHaveBeenCalledWith('con1prefix2');

      onStatus1('stopped');

      store.addConnection(connection2);
      expect(connection2.setBreakpoint).toHaveBeenCalledWith('file1', 42);
      expect(connection2.setExceptionBreakpoint).toHaveBeenCalledWith('*');

      await store.removeBreakpoint(id1);
      expect(connection1.removeBreakpoint).not.toHaveBeenCalledWith('con1prefix1');
      expect(connection2.removeBreakpoint).toHaveBeenCalledWith('con2prefix1');

      await store.setPauseOnExceptions('none');
      expect(connection1.removeBreakpoint).not.toHaveBeenCalledWith('con1prefix3');
      expect(connection2.removeBreakpoint).toHaveBeenCalledWith('con2prefix2');
    });
  });
});
