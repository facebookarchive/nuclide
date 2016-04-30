'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fs from 'fs';
import path from 'path';
import invariant from 'assert';
import temp from 'temp';
import watchman from 'fb-watchman';
import WatchmanClient from '../lib/WatchmanClient';

temp.track();

const FILE_MODE = 33188;

describe('WatchmanClient test suite', () => {

  let dirPath: string = '';
  let client: any;
  let filePath: string = '';

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    client = new WatchmanClient();
    dirPath = temp.mkdirSync();
    filePath = path.join(dirPath, 'test.txt');
    fs.writeFileSync(path.join(dirPath, 'non-used-file.txt'), 'def');
    fs.writeFileSync(filePath, 'abc');
    // Many people use restrict_root_files so watchman only will watch folders
    // that have those listed files in them.  This list of root files almost
    // always has .git in it.
    const watchmanRootPath = path.join(dirPath, '.git');
    fs.mkdirSync(watchmanRootPath);
    waits(1010);
  });

  afterEach(() => {
    client.dispose();
  });

  describe('restore subscriptions', () => {

    function testRestoreSubscriptions(onRestoreChange: (watchmanClient: watchman.Client) => void) {
      waitsForPromise(async () => {
        const watcher = await client.watchDirectoryRecursive(dirPath);
        const changeHandler = jasmine.createSpy();
        watcher.on('change', changeHandler);
        waits(1010);
        runs(() => fs.writeFileSync(filePath, 'def'));
        waitsFor(() => changeHandler.callCount > 0);
        runs(async () => {
          expect(changeHandler.callCount).toBe(1);
          expect(changeHandler.argsForCall[0][0]).toEqual([{
            name: 'test.txt',
            mode: FILE_MODE,
            new: false,
            exists: true,
          }]);
          const internalClient = await client._clientPromise;
          onRestoreChange(internalClient);
          internalClient.end();
        });
        waits(1000); // Wait for watchman to watch the directory.
        runs(() => window.advanceClock(3000)); // Pass the settle filesystem time.
        waits(1000); // Wait for the client to restore subscriptions.
        runs(() => fs.unlinkSync(filePath));
        waitsFor(() => changeHandler.callCount > 1);
        runs(() => {
          expect(changeHandler.callCount).toBe(2);
          expect(changeHandler.argsForCall[1][0]).toEqual([{
            name: 'test.txt',
            mode: FILE_MODE,
            new: false,
            exists: false,
          }]);
        });
      });
      // Cleanup watch resources.
      waitsForPromise(() => client.unwatch(dirPath));
    }

    it('restores subscriptions on client end', () => {
      testRestoreSubscriptions(watchmanClient => {
        // End the socket client to watchman to trigger restore subscriptions.
        watchmanClient.end();
      });
    });

    it('restores subscriptions on client error', () => {
      testRestoreSubscriptions(watchmanClient => {
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
    it('restores subscriptions on client startup failure', () => {
      testRestoreSubscriptions(watchmanClient => {
        let counter = 0;
        const oldConnect = watchman.Client.prototype.connect;
        spyOn(watchman.Client.prototype, 'connect').andCallFake(function() {
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
    it('unwatch cleans up watchman watchlist resources', () => {
      waitsForPromise(async () => {
        const dirRealPath = fs.realpathSync(dirPath);
        await client.watchDirectoryRecursive(dirPath);
        const watchList = await client._watchList();
        expect(watchList.indexOf(dirRealPath)).not.toBe(-1);
        client.dispose = () => {};
        await client.unwatch(dirPath);
        const afterCleanupWatchList = await client._watchList();
        expect(afterCleanupWatchList.indexOf(dirRealPath)).toBe(-1);
      });
    });
  });

  describe('version()', () => {
    it('We need version 3.1.0 or bigger', () => {
      waitsForPromise(async () => {
        const version = await client.version();
        expect(version > '3.0.999').toBe(true);
      });
    });
  });

  describe('watchProject()', () => {
    it('should be able to watch nested project folders, but cleanup watchRoot', () => {
      waitsForPromise(async () => {
        const dirRealPath = fs.realpathSync(dirPath);
        // The .watchmanconfig file, amonst others that could also be configured
        // define the project root directory.
        fs.writeFileSync(path.join(dirPath, '.watchmanconfig'), '');
        const nestedDirPath = path.join(dirPath, 'nested');
        fs.mkdirSync(nestedDirPath);
        const {
          watch: watchRoot,
          relative_path: relativePath,
        } = await client._watchProject(nestedDirPath);
        expect(watchRoot).toBe(dirRealPath);
        expect(relativePath).toBe('nested');
        await client._deleteWatcher(watchRoot);
      });
    });

    it('fails with meaningful error when the version is < 3.1.0', () => {
      client._watchmanVersionPromise = Promise.resolve('1.0.0');
      waitsForPromise(async () => {
        let watchVersionError;
        try {
          await client._watchProject(dirPath);
        } catch (error) {
          watchVersionError = error;
        }
        expect(watchVersionError).toBeDefined();
        invariant(watchVersionError);
        expect(watchVersionError.message).toMatch(/^Watchman version/);
      });
    });
  });
});
