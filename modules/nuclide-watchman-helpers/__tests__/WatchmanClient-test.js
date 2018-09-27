"use strict";

var _fs = _interopRequireDefault(require("fs"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _fbWatchman() {
  const data = _interopRequireDefault(require("fb-watchman"));

  _fbWatchman = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _WatchmanClient() {
  const data = _interopRequireWildcard(require("../lib/WatchmanClient"));

  _WatchmanClient = function () {
    return data;
  };

  return data;
}

function _testHelpers() {
  const data = require("../../nuclide-commons/test-helpers");

  _testHelpers = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
jest.setTimeout(15000);
const FILE_MODE = 33188;

const sleep = n => new Promise(r => setTimeout(r, n));

describe.skip('WatchmanClient test suite', () => {
  let dirPath = '';
  let client = null;
  beforeEach(async () => {
    client = new (_WatchmanClient().default)();
    dirPath = await (0, _testHelpers().generateFixture)('watchman_helpers_test', new Map([// Many people use restrict_root_files so watchman only will watch folders
    // that have those listed files in them. watchmanconfig is always a root
    // file.
    ['.watchmanconfig', '{}'], ['test.txt', 'abc'], ['non-used-file.txt', 'def'], ['nested/nested-test.txt', 'ghi']])); // TODO(hansonw): This is a big change in Watchman behavior- figure out what
    // this means for Nuclide's use.

    dirPath = _fs.default.realpathSync(dirPath);
    await sleep(1010);
  });
  afterEach(() => {
    client.dispose();
  });
  describe('restore subscriptions', () => {
    async function testRestoreSubscriptions(onRestoreChange) {
      // First watchman init can be slow and flaky.
      const filePath = _nuclideUri().default.join(dirPath, 'test.txt');

      const watcher = await client.watchDirectoryRecursive(dirPath) // Give it two retries.
      .catch(() => client.watchDirectoryRecursive(dirPath)).catch(() => client.watchDirectoryRecursive(dirPath));
      const changeHandler = jest.fn();
      watcher.on('change', changeHandler);
      await sleep(1010);

      _fs.default.writeFileSync(filePath, 'def');

      await (0, _waits_for().default)(() => changeHandler.mock.calls.length > 0);
      expect(changeHandler.mock.calls.length).toBe(1);
      expect(changeHandler.mock.calls[0][0]).toEqual([{
        name: 'test.txt',
        mode: FILE_MODE,
        new: false,
        exists: true
      }]);
      const internalClient = await client._clientPromise;
      onRestoreChange(internalClient);
      internalClient.end();
      await sleep(1000); // Wait for watchman to watch the directory.

      advanceClock(3000); // Pass the settle filesystem time.

      await sleep(1000); // Wait for the client to restore subscriptions.

      _fs.default.unlinkSync(filePath);

      await (0, _waits_for().default)(() => changeHandler.mock.calls.length > 1);
      expect(changeHandler.mock.calls.length).toBe(2);
      expect(changeHandler.mock.calls[1][0]).toEqual([{
        name: 'test.txt',
        mode: FILE_MODE,
        new: false,
        exists: false
      }]); // Cleanup watch resources.

      await (() => client.unwatch(dirPath))();
    }

    it('restores subscriptions on client end', async () => {
      await testRestoreSubscriptions(watchmanClient => {
        // End the socket client to watchman to trigger restore subscriptions.
        watchmanClient.end();
      });
    });
    it('restores subscriptions on client error', async () => {
      await testRestoreSubscriptions(watchmanClient => {
        // End the socket client to watchman to trigger restore subscriptions.
        watchmanClient.emit('error', new Error('fake error'));
      });
    });
    /**
     * This simulates the case where:
     * 1. watchman fails, and then
     * 2. the reconnection fails on startup
     * 3. subsequent reconnections can still succeed.
     *
     * We need to make sure we don't end up in a deadlock where the first reconnection
     * attempt blocks subsequent ones.
     */

    it('restores subscriptions on client startup failure', async () => {
      await testRestoreSubscriptions(watchmanClient => {
        let counter = 0;

        const oldConnect = _fbWatchman().default.Client.prototype.connect;

        jest.spyOn(_fbWatchman().default.Client.prototype, 'connect').mockImplementation(function () {
          if (counter++ === 0) {
            this.emit('error', new Error('startup error'));
          } else {
            oldConnect.apply(this);
          }
        });
        watchmanClient.emit('error', new Error('fake error'));
      });
    });
  });
  describe('cleanup watchers after unwatch', () => {
    it('unwatch cleans up watchman subscriptions resources', async () => {
      const dirRealPath = _fs.default.realpathSync(dirPath);

      await client.watchDirectoryRecursive(dirPath);
      const watchList = await client._watchList();
      expect(watchList.indexOf(dirRealPath)).not.toBe(-1); // $FlowIssue

      client.dispose = () => {};

      await client.unwatch(dirPath);
      expect(client.hasSubscription(dirPath)).toBeFalsy(); // Didn't remove it from the watched directories.

      const noWatchListCleanup = await client._watchList();
      expect(noWatchListCleanup.indexOf(dirRealPath)).not.toBe(-1);
    });
  });
  describe('watchProject()', () => {
    it('should be able to watch nested project folders, but cleanup watchRoot', async () => {
      const dirRealPath = _fs.default.realpathSync(dirPath);

      const nestedDirPath = _nuclideUri().default.join(dirPath, 'nested');

      const {
        watch: watchRoot,
        relative_path: relativePath
      } = await client._watchProject(nestedDirPath);
      expect(watchRoot).toBe(dirRealPath);
      expect(relativePath).toBe('nested');
    });
  });
});
describe('WatchmanClient', () => {
  it('delays reconnecting with exponential backoff', async () => {
    jest.useFakeTimers();
    const functionsMap = {};
    const mockWatchmanClient = {
      on: (name, func) => {
        functionsMap[name] = func;
      },
      emit: (name, ...values) => {
        functionsMap[name](...values);
      },
      removeAllListeners: jest.fn(),
      end: jest.fn(),
      command: (args, callback) => callback(false, 'my response')
    };
    jest.spyOn(_fbWatchman().default, 'Client').mockImplementation(() => {
      return Promise.resolve(mockWatchmanClient);
    });
    const client = new (_WatchmanClient().default)();
    const reconnectSpy = jest.spyOn(client, '_reconnectClient');
    jest.advanceTimersByTime(500); // wait for debouncing

    expect(reconnectSpy.mock.calls.length).toBe(0);
    await client.watchDirectoryRecursive('someDir', 'mySubscriptionName');
    jest.spyOn(client, '_reconnectClient').mockImplementationOnce(async () => {
      return Promise.reject(new Error('test failure'));
    }).mockImplementationOnce(async () => {
      return Promise.reject(new Error('test failure 2'));
    });

    const reconnectDelay = _WatchmanClient().DEFAULT_WATCHMAN_RECONNECT_DELAY_MS;

    expect(client._reconnectDelayMs).toBe(reconnectDelay); // mock disconnecting twice, expect exponential backoff

    mockWatchmanClient.emit('end');
    jest.advanceTimersByTime(500);
    await (0, _promise().nextTick)();
    expect(reconnectSpy.mock.calls.length).toBe(1);
    jest.advanceTimersByTime(100);
    await (0, _promise().nextTick)();
    expect(client._reconnectDelayMs).toBe(2 * reconnectDelay);
    mockWatchmanClient.emit('end');
    jest.advanceTimersByTime(500);
    await (0, _promise().nextTick)();
    expect(reconnectSpy.mock.calls.length).toBe(2);
    jest.advanceTimersByTime(100);
    await (0, _promise().nextTick)();
    expect(client._reconnectDelayMs).toBe(4 * reconnectDelay); // now succeed, expect reconnect delay to be reset

    mockWatchmanClient.emit('end');
    jest.advanceTimersByTime(1000);
    await (0, _promise().nextTick)();
    expect(reconnectSpy.mock.calls.length).toBe(3);
    jest.useRealTimers(); // for some reason, jest mock clocks stop working here

    await sleep(3000);
    await (0, _promise().nextTick)();
    expect(client._reconnectDelayMs).toBe(reconnectDelay);
  });
});