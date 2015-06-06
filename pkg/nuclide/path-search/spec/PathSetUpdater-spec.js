'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');
var PathSet = require('../lib/PathSet');
var PathSetUpdater = require('../lib/PathSetUpdater');
var {WatchmanSubscription} = require('nuclide-watchman-helpers');

describe('PathSetUpdater', () => {
  var MOCK_WATCHMAN_PROJECT_ROOT = '/Mock/Root';
  var INITIAL_PATHS = {
    'a': true,
    'b': true,
  };
  var TEST_DIRECTORY = '/Mock/Root/To/Test/Dir';
  var RELATIVE_PATH = path.relative(MOCK_WATCHMAN_PROJECT_ROOT, TEST_DIRECTORY);
  var pathSet;
  var pathSetUpdater;

  var createMockWatchmanSubscription = (directoryPath: string) => {
    return Promise.resolve(new WatchmanSubscription(
      /*subscriptionRoot*/ MOCK_WATCHMAN_PROJECT_ROOT,
      /*pathFromSubscriptionRootToSubscriptionPath*/ RELATIVE_PATH,
      /*subscriptionPath*/ TEST_DIRECTORY,
      /*subscriptionCount*/ 1,
      /*subscriptionOptions*/ null // Not used in this test.
    ));
  };
  var mockWatchmanClient = {
    watchDirectoryRecursive: createMockWatchmanSubscription,
    unwatch: null,
  };

  var emitMockWatchmanUpdate = (update: any) => {
    var subscription = pathSetUpdater._pathSetToSubscription.get(pathSet);
    if (!subscription) {
      return;
    }
    subscription.emit('change', update);
  };


  beforeEach(() => {
    pathSet = new PathSet({paths: INITIAL_PATHS});
    pathSetUpdater = new PathSetUpdater();
  });

  describe('startUpdatingPathSet', () => {
    it('starts updating the pathSet, and returns a Disposable that can stop the updating.', () => {
      // Mock out the dependency on fb-watchman.
      spyOn(pathSetUpdater, '_setupWatcherService').andCallFake(() => {
        pathSetUpdater._watchmanClient = mockWatchmanClient;
        spyOn(mockWatchmanClient, 'watchDirectoryRecursive').andCallThrough();
        spyOn(mockWatchmanClient, 'unwatch');
      });

      waitsForPromise(async () => {
        // Attach the pathSetUpdater to the pathSet.
        var disposable = await pathSetUpdater.startUpdatingPathSet(pathSet, TEST_DIRECTORY);
        expect(mockWatchmanClient.watchDirectoryRecursive).toHaveBeenCalledWith(TEST_DIRECTORY);

        // Trigger mock 'file add' and 'file remove' events, and check that they
        // result in changes to the pathSet.
        var mockChanges = [
          {
            name: path.join(RELATIVE_PATH, 'c'),
            new: true,
            exists: true,
            mode: 1234,
          },
          {
            name: path.join(RELATIVE_PATH, 'a'),
            new: false,
            exists: false,
            mode: 1234,
          },
        ];
        emitMockWatchmanUpdate(mockChanges);
        var newValues = [];
        await pathSet.submit(aPath => newValues.push(aPath));
        expect(newValues.sort()).toEqual(['b', 'c']);

        // Verify that disposing the Disposable stops updates to the pathSet.
        disposable.dispose();
        expect(mockWatchmanClient.unwatch).toHaveBeenCalledWith(TEST_DIRECTORY);
        var unnoticedChanges = [
          {
            name: path.join(RELATIVE_PATH, 'd'),
            new: true,
            exists: true,
            mode: 1234,
          },
          {
            name: path.join(RELATIVE_PATH, 'b'),
            new: false,
            exists: false,
            mode: 1234,
          },
        ];
        emitMockWatchmanUpdate(unnoticedChanges);
        var unchangedValues = [];
        await pathSet.submit(aPath => unchangedValues.push(aPath));
        expect(unchangedValues.sort()).toEqual(newValues);
      });
    });
  });

});
