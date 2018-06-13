'use strict';

var _FlowIDEConnectionWatcher;

function _load_FlowIDEConnectionWatcher() {
  return _FlowIDEConnectionWatcher = require('../lib/FlowIDEConnectionWatcher');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('FlowIDEConnectionWatcher', () => {
  let processFactory = null;
  let processFactoryReturn = null;

  let ideConnectionCallback;

  let ideConnectionFactory;
  let currentFakeIDEConnection = null;
  let createFakeIDEConnection = null;

  let watcher = null;

  let currentTime = null;
  let waitingPromises = null;

  // Apparently Jasmine doesn't mock Date.now(), and for whatever reason, using the Jasmine clock
  // mocks didn't properly call setTimeout (which sleep relies upon), which caused things to hang.
  // So I rolled my own.
  const tick = millis => {
    currentTime += millis;
    for (const item of waitingPromises) {
      if (currentTime >= item.dueTime) {
        item.resolve();
        waitingPromises.delete(item);
      }
    }
  };

  const sleep = millis => {
    let resolve = null;
    const promise = new Promise(r => {
      resolve = r;
    });

    if (!(resolve != null)) {
      throw new Error('Invariant violation: "resolve != null"');
    }

    const dueTime = currentTime + millis;
    waitingPromises.add({ dueTime, resolve });
    return promise;
  };

  beforeEach(() => {
    createFakeIDEConnection = () => {
      return {
        onWillDispose: jest.fn(),
        dispose: jest.fn()
      };
    };
    processFactory = _rxjsBundlesRxMinJs.Observable.defer(() => _rxjsBundlesRxMinJs.Observable.of(processFactoryReturn));
    // We can use a stub value here because it's just passed through to the ideConnectionFactory
    processFactoryReturn = {};

    ideConnectionCallback = jest.fn();

    ideConnectionFactory = jest.fn().mockImplementation((...args) => {
      currentFakeIDEConnection = createFakeIDEConnection();
      return currentFakeIDEConnection;
    });
    currentFakeIDEConnection = null;

    watcher = new (_FlowIDEConnectionWatcher || _load_FlowIDEConnectionWatcher()).FlowIDEConnectionWatcher(
    // Additional indirection so the callbacks can be reassigned in tests after the creation of
    // this object
    _rxjsBundlesRxMinJs.Observable.defer(() => processFactory), null, /* File Cache */
    (...args) => ideConnectionCallback(...args), (...args) => ideConnectionFactory(...args));

    currentTime = 42;
    waitingPromises = new Set();
    jest.spyOn(watcher, '_getTimeMS').mockImplementation(() => currentTime);
    jest.spyOn(watcher, '_sleep').mockImplementation(sleep);
  });

  it('should correctly start and keep alive an IDE connection', async () => {
    watcher.start();
    await (0, (_waits_for || _load_waits_for()).default)(() => currentFakeIDEConnection != null);
    expect(ideConnectionCallback.mock.calls[0]).toEqual([currentFakeIDEConnection]);
    expect(ideConnectionCallback.mock.calls.length).toBe(1);

    if (!(currentFakeIDEConnection != null)) {
      throw new Error('Invariant violation: "currentFakeIDEConnection != null"');
    }

    expect(currentFakeIDEConnection.onWillDispose).toHaveBeenCalled();

    // TODO check that when the underlying connection dies, it gets re-established
    const onWillDisposeHandler = currentFakeIDEConnection.onWillDispose.mock.calls[0][0];
    onWillDisposeHandler();
    await (0, (_waits_for || _load_waits_for()).default)(() => ideConnectionCallback.mock.calls.length === 3);
    expect(ideConnectionCallback.mock.calls[1]).toEqual([null]);
    expect(ideConnectionCallback.mock.calls[2]).toEqual([currentFakeIDEConnection]);

    if (!(currentFakeIDEConnection != null)) {
      throw new Error('Invariant violation: "currentFakeIDEConnection != null"');
    }

    watcher.dispose();
    expect(currentFakeIDEConnection.dispose).toHaveBeenCalled();
  });

  it('should retry when the IDE process fails to start', async () => {
    // Obviously, this will have to be updated if the number of retries is changed
    const processFactoryReturns = [null, null, {}];
    let currentCall = 0;
    processFactory = _rxjsBundlesRxMinJs.Observable.defer(() => {
      if (!(currentCall < processFactoryReturns.length)) {
        throw new Error('Invariant violation: "currentCall < processFactoryReturns.length"');
      }

      const result = processFactoryReturns[currentCall];
      currentCall++;
      tick(7 * 60 * 1000);
      return _rxjsBundlesRxMinJs.Observable.of(result);
    });
    jest.spyOn(processFactory, 'subscribe');
    await watcher.start();
    expect(ideConnectionCallback.mock.calls.length).toBe(1);
    expect(ideConnectionFactory.mock.calls.length).toBe(1);
    expect(ideConnectionFactory.mock.calls[0][0]).toBe(processFactoryReturns[2]);
    expect(processFactory.subscribe.mock.calls.length).toBe(3);
    watcher.dispose();
  });

  it('should give up when the IDE process fails to start too many times', async () => {
    // Obviously, this will have to be updated if the number of retries is changed
    const processFactoryReturns = [null, null, null, {}];
    let currentCall = 0;
    processFactory = _rxjsBundlesRxMinJs.Observable.defer(() => {
      if (!(currentCall < processFactoryReturns.length)) {
        throw new Error('Invariant violation: "currentCall < processFactoryReturns.length"');
      }

      const result = processFactoryReturns[currentCall];
      currentCall++;
      tick(7 * 60 * 1000);
      return _rxjsBundlesRxMinJs.Observable.of(result);
    });
    jest.spyOn(processFactory, 'subscribe');
    await watcher.start();
    expect(processFactory.subscribe.mock.calls.length).toBe(3);
    expect(ideConnectionCallback.mock.calls.length).toBe(0);
    expect(ideConnectionFactory.mock.calls.length).toBe(0);
    watcher.dispose();
  });

  it('should throttle attempts to start the IDE process', async () => {
    processFactory = _rxjsBundlesRxMinJs.Observable.defer(() => Promise.resolve(null));
    jest.spyOn(processFactory, 'subscribe');
    watcher.start();

    await new Promise(resolve => setImmediate(resolve));
    expect(processFactory.subscribe.mock.calls.length).toBe(1);

    tick(1100);

    await new Promise(resolve => setImmediate(resolve));
    expect(processFactory.subscribe.mock.calls.length).toBe(2);
  });

  it('should give up after too many unhealthy connections', async () => {
    createFakeIDEConnection = () => {
      const spy = {
        onWillDispose: jest.fn(),
        dispose: jest.fn()
      };
      spy.onWillDispose = spy.onWillDispose.mockImplementation(cb => {
        cb();
      });
      return spy;
    };
    watcher.start();

    // After 20 unhealthy connections it should just give up entirely. Each connection leads to two
    // callbacks, since it calls the callback for the connection itself and then with `null` to
    // indicate that it has died.
    await (0, (_waits_for || _load_waits_for()).default)(() => ideConnectionCallback.mock.calls.length === 40);
    // Check again in a short while to make sure we haven't caught an intermediate state
    await new Promise(setImmediate);
    expect(ideConnectionCallback.mock.calls.length).toBe(40);
  });

  it('should only give up after too many *consecutive* unhealthy connections', async () => {
    let createCount = 0;
    createFakeIDEConnection = () => {
      const spy = {
        onWillDispose: jest.fn(),
        dispose: jest.fn()
      };

      spy.onWillDispose = spy.onWillDispose.mockImplementation(cb => {
        if (createCount === 5) {
          // This will cause this one to be marked as healthy, since it survived for long enough.
          tick(11000);
        }
        createCount++;
        cb();
      });
      return spy;
    };
    watcher.start();

    await (0, (_waits_for || _load_waits_for()).default)(() => ideConnectionCallback.mock.calls.length === 52);
    // Check again in a short while to make sure we haven't caught an intermediate state
    await new Promise(setImmediate);
    expect(ideConnectionCallback.mock.calls.length).toBe(52);
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */