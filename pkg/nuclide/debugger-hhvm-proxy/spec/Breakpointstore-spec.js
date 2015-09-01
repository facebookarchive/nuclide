'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {BreakpointStore} = require('../lib/BreakpointStore');

describe('debugger-hhvm-proxy BreakpointStore', () => {
  var store;
  var connection1, connection2;
  var onStatus1;
  var onStatus2;

  function createIdGenerator(prefix) {
    var id = 0;
    return () => {
      id++;
      return prefix + id;
    }
  }

  beforeEach(() => {
    store = new BreakpointStore();
    connection1 = jasmine.createSpyObj('Connection1', ['setBreakpoint', 'removeBreakpoint', 'onStatus']);
    connection1.setBreakpoint = jasmine.createSpy('setBreakpoint1').
        andCallFake(createIdGenerator('con1prefix'));
    connection1.onStatus = jasmine.createSpy('onStatus1').
      andCallFake(callback => { onStatus1 = callback; });
    connection2 = jasmine.createSpyObj('Connection2', ['setBreakpoint', 'removeBreakpoint', 'onStatus']);
    connection2.setBreakpoint = jasmine.createSpy('setBreakpoint2').
        andCallFake(createIdGenerator('con2prefix'));
    connection2.onStatus = jasmine.createSpy('onStatus2').
      andCallFake(callback => { onStatus2 = callback; });
  });

  it('add connection - then bps', () => {
    waitsForPromise(async () => {
      store.addConnection(connection1);

      var id1 = store.setBreakpoint('file1', 42);
      expect(connection1.setBreakpoint).toHaveBeenCalledWith('file1', 42);

      var id2 = store.setBreakpoint('file1', 43);
      expect(connection1.setBreakpoint).toHaveBeenCalledWith('file1', 43);
      expect(id1).not.toEqual(id2);

      await store.removeBreakpoint(id2);
      expect(connection1.removeBreakpoint).toHaveBeenCalledWith('con1prefix2');

      await store.removeBreakpoint(id1);
      expect(connection1.removeBreakpoint).toHaveBeenCalledWith('con1prefix1');
    });
  });

  it('add bps - then connections', () => {
    waitsForPromise(async () => {

      var id1 = store.setBreakpoint('file1', 42);
      var id2 = store.setBreakpoint('file1', 43);

      store.addConnection(connection1);
      expect(connection1.setBreakpoint).toHaveBeenCalledWith('file1', 42);
      expect(connection1.setBreakpoint).toHaveBeenCalledWith('file1', 43);
      expect(id1).not.toEqual(id2);

      await store.removeBreakpoint(id2);
      expect(connection1.removeBreakpoint).toHaveBeenCalledWith('con1prefix2');

      onStatus1('stopped');

      store.addConnection(connection2);
      expect(connection2.setBreakpoint).toHaveBeenCalledWith('file1', 42);

      await store.removeBreakpoint(id1);
      expect(connection1.removeBreakpoint).not.toHaveBeenCalledWith('con1prefix1');
      expect(connection2.removeBreakpoint).toHaveBeenCalledWith('con2prefix1');
    });
  });
});
