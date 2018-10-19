"use strict";

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideTestHelpers() {
  const data = require("../../nuclide-test-helpers");

  _nuclideTestHelpers = function () {
    return data;
  };

  return data;
}

function _nuclideWatchmanHelpers() {
  const data = require("../../../modules/nuclide-watchman-helpers");

  _nuclideWatchmanHelpers = function () {
    return data;
  };

  return data;
}

function _PathSet() {
  const data = require("../lib/process/PathSet");

  _PathSet = function () {
    return data;
  };

  return data;
}

function _PathSetUpdater() {
  const data = _interopRequireDefault(require("../lib/process/PathSetUpdater"));

  _PathSetUpdater = function () {
    return data;
  };

  return data;
}

function hgUtils() {
  const data = _interopRequireWildcard(require("../../nuclide-hg-rpc/lib/hg-utils"));

  hgUtils = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
jest.setTimeout(20000);
describe('PathSetUpdater', () => {
  const INITIAL_PATHS = ['a', 'b'];
  let pathSet;
  let pathSetUpdater;
  let mockRepoPath;

  const createMockWatchmanSubscription = directoryPath => {
    return Promise.resolve(new (_nuclideWatchmanHelpers().WatchmanSubscription)(
    /* subscriptionRoot */
    mockRepoPath,
    /* pathFromSubscriptionRootToSubscriptionPath */
    '.',
    /* subscriptionPath */
    mockRepoPath,
    /* subscriptionName */
    mockRepoPath,
    /* subscriptionCount */
    1,
    /* subscriptionOptions */
    {
      fields: [],
      since: ''
    }) // Not used in this test.
    );
  };

  const mockWatchmanClient = {
    watchDirectoryRecursive: createMockWatchmanSubscription,
    unwatch: null
  };

  const emitMockWatchmanUpdate = update => {
    if (!pathSetUpdater) {
      throw new Error("Invariant violation: \"pathSetUpdater\"");
    }

    if (!pathSet) {
      throw new Error("Invariant violation: \"pathSet\"");
    }

    const subscription = pathSetUpdater._pathSetToSubscription.get(pathSet);

    if (!subscription) {
      return;
    }

    subscription.emit('change', update);
  };

  beforeEach(async () => {
    pathSet = new (_PathSet().PathSet)(INITIAL_PATHS, [], '');
    pathSetUpdater = new (_PathSetUpdater().default)();
    jest.useFakeTimers();
    mockRepoPath = await (0, _nuclideTestHelpers().generateHgRepo1Fixture)();
  });
  describe('startUpdatingPathSet', () => {
    it('starts updating the pathSet, and returns a Disposable that can stop the updating.', async () => {
      // Mock out the dependency on fb-watchman.
      if (!pathSetUpdater) {
        throw new Error("Invariant violation: \"pathSetUpdater\"");
      }

      jest.spyOn(pathSetUpdater, '_setupWatcherService').mockImplementation(() => {
        if (!pathSetUpdater) {
          throw new Error("Invariant violation: \"pathSetUpdater\"");
        }

        pathSetUpdater._watchmanClient = mockWatchmanClient;
        jest.spyOn(mockWatchmanClient, 'watchDirectoryRecursive');
        mockWatchmanClient.unwatch = jest.fn();
      });
      jest.spyOn(hgUtils(), 'hgRunCommand').mockImplementation(() => _RxMin.Observable.of('[{ "path": "e", "status": "I"}]')); // Attach the pathSetUpdater to the pathSet.

      if (!pathSetUpdater) {
        throw new Error("Invariant violation: \"pathSetUpdater\"");
      }

      if (!pathSet) {
        throw new Error("Invariant violation: \"pathSet\"");
      }

      const disposable = await pathSetUpdater.startUpdatingPathSet(pathSet, mockRepoPath);
      expect(mockWatchmanClient.watchDirectoryRecursive).toHaveBeenCalledWith(mockRepoPath); // Trigger mock 'file add' and 'file remove' events, and check that they
      // result in changes to the pathSet.

      const mockChanges = [{
        name: 'c',
        new: true,
        exists: true,
        mode: 1234
      }, {
        name: 'a',
        new: false,
        exists: false,
        mode: 1234
      }, {
        name: 'dir',
        new: true,
        exists: true,
        // This is a directory, and should be ignored.
        mode: 16384
      }, {
        name: 'e',
        // This is in .hgignore and should be ignored.
        new: true,
        exists: true,
        mode: 1234
      }];
      emitMockWatchmanUpdate(mockChanges);
      jest.advanceTimersByTime(5000);
      let newValues = (await pathSet.query('')).map(x => x.path);
      expect(newValues.sort()).toEqual(['/b', '/c']); // This is a no-op.

      emitMockWatchmanUpdate([{
        name: 'x',
        new: true,
        exists: false,
        mode: 1234
      }, {
        name: 'e',
        // This is in .hgignore and should be ignored.
        new: false,
        exists: false,
        mode: 1234
      }]);
      newValues = (await pathSet.query('')).map(x => x.path);
      expect(newValues.sort()).toEqual(['/b', '/c']); // Verify that disposing the Disposable stops updates to the pathSet.

      disposable.dispose();
      expect(mockWatchmanClient.unwatch).toHaveBeenCalledWith(mockRepoPath);
      const unnoticedChanges = [{
        name: 'd',
        new: true,
        exists: true,
        mode: 1234
      }, {
        name: 'b',
        new: false,
        exists: false,
        mode: 1234
      }];
      emitMockWatchmanUpdate(unnoticedChanges);
      const unchangedValues = (await pathSet.query('')).map(x => x.path);
      expect(unchangedValues.sort()).toEqual(newValues);
    });
  });
});