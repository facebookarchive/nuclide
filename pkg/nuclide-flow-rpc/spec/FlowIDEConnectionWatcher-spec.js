/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {FlowIDEConnection} from '../lib/FlowIDEConnection';

import invariant from 'assert';

import {FlowIDEConnectionWatcher} from '../lib/FlowIDEConnectionWatcher';

describe('FlowIDEConnectionWatcher', () => {
  let processFactory: () => Promise<?child_process$ChildProcess> = (null: any);
  let processFactoryReturn: Promise<?child_process$ChildProcess> = (null: any);

  let ideConnectionCallback: JasmineSpy = (null: any);

  let ideConnectionFactory: JasmineSpy = (null: any);
  let currentFakeIDEConnection: ?{[string]: JasmineSpy} = null;

  let watcher: FlowIDEConnectionWatcher = (null: any);

  let currentTime: number = (null: any);
  let waitingPromises: Set<{dueTime: number, resolve: () => void}> = (null: any);

  // Apparently Jasmine doesn't mock Date.now(), and for whatever reason, using the Jasmine clock
  // mocks didn't properly call setTimeout (which sleep relies upon), which caused things to hang.
  // So I rolled my own.
  const tick: number => void = millis => {
    currentTime += millis;
    for (const item of waitingPromises) {
      if (currentTime >= item.dueTime) {
        item.resolve();
        waitingPromises.delete(item);
      }
    }
  };

  const sleep: (millis: number) => Promise<void> = millis => {
    let resolve = null;
    const promise = new Promise(r => { resolve = r; });
    invariant(resolve != null);
    const dueTime = currentTime + millis;
    waitingPromises.add({dueTime, resolve});
    return promise;
  };

  function createFakeIDEConnection(): FlowIDEConnection {
    return (jasmine.createSpyObj('FlowIDEconnection', [
      'onWillDispose',
      'dispose',
    ]): any);
  }

  beforeEach(() => {
    processFactory = jasmine.createSpy('processFactory').andCallFake(() => processFactoryReturn);
    // We can use a stub value here because it's just passed through to the ideConnectionFactory
    processFactoryReturn = Promise.resolve(({}: any));

    ideConnectionCallback = jasmine.createSpy('ideConnectionCallback');

    ideConnectionFactory = jasmine
      .createSpy('ideConnectionFactory')
      .andCallFake((...args) => {
        currentFakeIDEConnection = createFakeIDEConnection(...args);
        return currentFakeIDEConnection;
      });
    currentFakeIDEConnection = null;

    watcher = new FlowIDEConnectionWatcher(
      // Additional indirection so the callbacks can be reassigned in tests after the creation of
      // this object
      (...args) => processFactory(...args),
      (...args) => ideConnectionCallback(...args),
      (...args) => ideConnectionFactory(...args),
    );

    currentTime = 42;
    waitingPromises = new Set();
    spyOn(watcher, '_getTimeMS').andCallFake(() => currentTime);
    spyOn(watcher, '_sleep').andCallFake(sleep);
  });

  it('should correctly start and keep alive an IDE connection', () => {
    runs(() => {
      watcher.start();
    });
    waitsFor(() => currentFakeIDEConnection != null);
    runs(() => {
      expect(ideConnectionCallback.calls[0].args).toEqual([currentFakeIDEConnection]);
      expect(ideConnectionCallback.callCount).toBe(1);
      invariant(currentFakeIDEConnection != null);
      expect(currentFakeIDEConnection.onWillDispose).toHaveBeenCalled();

      // TODO check that when the underlying connection dies, it gets re-established
      const onWillDisposeHandler: any = currentFakeIDEConnection.onWillDispose.calls[0].args[0];
      onWillDisposeHandler();
    });
    waitsFor(() => ideConnectionCallback.callCount === 3);
    runs(() => {
      expect(ideConnectionCallback.calls[1].args).toEqual([null]);
      expect(ideConnectionCallback.calls[2].args).toEqual([currentFakeIDEConnection]);
      invariant(currentFakeIDEConnection != null);
      watcher.dispose();
      expect(currentFakeIDEConnection.dispose).toHaveBeenCalled();
    });
  });

  it('should retry when the IDE process fails to start', () => {
    // Obviously, this will have to be updated if the number of retries is changed
    const processFactoryReturns = [null, null, {}];
    runs(() => {
      let currentCall = 0;
      processFactory = jasmine.createSpy('processFactory').andCallFake(() => {
        invariant(currentCall < processFactoryReturns.length);
        const result = processFactoryReturns[currentCall];
        currentCall++;
        tick(7 * 60 * 1000);
        return result;
      });
    });
    waitsForPromise(() => watcher.start());
    runs(() => {
      expect(ideConnectionCallback.callCount).toBe(1);
      expect(ideConnectionFactory.callCount).toBe(1);
      expect(ideConnectionFactory.calls[0].args[0]).toBe(processFactoryReturns[2]);
      expect(processFactory.callCount).toBe(3);
      watcher.dispose();
    });
  });

  it('should give up when the IDE process fails to start too many times', () => {
    // Obviously, this will have to be updated if the number of retries is changed
    const processFactoryReturns = [null, null, null, {}];
    runs(() => {
      let currentCall = 0;
      processFactory = jasmine.createSpy('processFactory').andCallFake(() => {
        invariant(currentCall < processFactoryReturns.length);
        const result = processFactoryReturns[currentCall];
        currentCall++;
        tick(7 * 60 * 1000);
        return result;
      });
    });
    waitsForPromise(() => watcher.start());
    runs(() => {
      expect(processFactory.callCount).toBe(3);
      expect(ideConnectionCallback.callCount).toBe(0);
      expect(ideConnectionFactory.callCount).toBe(0);
      watcher.dispose();
    });
  });

  it('should throttle attempts to start the IDE process', () => {
    waitsForPromise(async () => {
      processFactory = jasmine.createSpy('processFactory').andReturn(Promise.resolve(null));
      watcher.start();

      await new Promise(resolve => setImmediate(resolve));
      expect(processFactory.callCount).toBe(1);

      tick(1100);

      await new Promise(resolve => setImmediate(resolve));
      expect(processFactory.callCount).toBe(2);
    });
  });
});
