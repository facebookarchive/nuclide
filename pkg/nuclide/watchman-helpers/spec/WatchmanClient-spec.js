'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
var path = require('path');
var temp = require('temp').track();
var WatchmanClient = require('../lib/WatchmanClient');

var FILE_MODE = 33188;

// TODO: #7344702 Re-enable and don't depend on watchman.
xdescribe('WatchmanClient test suite', () => {

  var dirPath;
  var client;
  var filePath;

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    client = new WatchmanClient();
    dirPath = temp.mkdirSync();
    filePath = path.join(dirPath, 'test.txt');
    fs.writeFileSync(filePath, 'abc');
    waits(1010);
  });

  afterEach(() => {
    client.dispose();
  });

  describe('restore subscriptions', () => {
    it('restores subscriptions on client end', () => {
      waitsForPromise(async () => {
        var watcher = await client.watchDirectoryRecursive(dirPath);
        var changeHandler = jasmine.createSpy();
        watcher.on('change', changeHandler);
        waits(1010);
        runs(() => fs.writeFileSync(filePath, 'def'));
        waitsFor(() => changeHandler.callCount > 0);
        runs(async () => {
          expect(changeHandler.callCount).toBe(1);
          expect(changeHandler.argsForCall[0][0]).toEqual([{name: 'test.txt', mode: FILE_MODE, new: false, exists: true}]);
          // End the socket client to watchman to trigger restore subscriptions.
          var internalClient = await client._clientPromise;
          internalClient.end();
        });
        waits(1000); // Wait for WatchmanClient to restore subscriptions.
        runs(() => fs.unlinkSync(filePath));
        waitsFor(() => changeHandler.callCount > 1);
        runs(() => {
          expect(changeHandler.callCount).toBe(2);
          expect(changeHandler.argsForCall[1][0]).toEqual([{name: 'test.txt', mode: FILE_MODE, new: false, exists: false}]);
        });
      });
      // Cleanup watch resources.
      waitsForPromise(() => client.unwatch(dirPath));
    });
  });

  describe('cleanup watchers after unwatch', () => {
    it('unwatch cleans up watchman watchlist resources', () => {
      waitsForPromise(async () => {
        var dirRealPath = fs.realpathSync(dirPath);
        await client.watchDirectoryRecursive(dirPath);
        var watchList = await client._watchList();
        expect(watchList.indexOf(dirRealPath)).not.toBe(-1);
        await client.unwatch(dirPath);
        var afterCleanupWatchList = await client._watchList();
        expect(afterCleanupWatchList.indexOf(dirRealPath)).toBe(-1);
      });
    });
  });

  describe('version()', () => {
    it('We need version 3.1.0 or bigger', () => {
      waitsForPromise(async () => {
        var version = await client.version();
        expect(version).toBeGreaterThan('3.0.999');
      });
    });
  });

  describe('watchProject()', () => {
    it('should be able to watch nested project folders, but cleanup watchRoot', () => {
      waitsForPromise(async () => {
        var dirRealPath = fs.realpathSync(dirPath);
        // The .watchmanconfig file, amonst others that could also be configured
        // define the project root directory.
        fs.writeFileSync(path.join(dirPath, '.watchmanconfig'), '');
        var nestedDirPath = path.join(dirPath, 'nested');
        fs.mkdirSync(nestedDirPath);
        var {watch: watchRoot, relative_path: relativePath} = await client._watchProject(nestedDirPath);
        expect(watchRoot).toBe(dirRealPath);
        expect(relativePath).toBe('nested');
        await client._deleteWatcher(watchRoot);
      });
    });

    it('fails with meaningful error when the version is < 3.1.0', () => {
      client._watchmanVersionPromise = Promise.resolve('1.0.0');
      waitsForPromise(async () => {
        var watchVersionError;
        try {
          await client._watchProject(dirPath)
        } catch (error) {
          watchVersionError = error;
        }
        expect(watchVersionError).toBeDefined();
        expect(watchVersionError.message).toMatch(/^Watchman version/);
      });
    });
  });
});
