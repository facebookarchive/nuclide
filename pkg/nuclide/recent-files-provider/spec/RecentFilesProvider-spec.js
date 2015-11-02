'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {RecentFilesProvider} from '../lib/RecentFilesProvider';
const PROJECT_PATH = '/Users/testuser/';
const PROJECT_PATH2 = '/Users/something_else/';

const FILE_PATHS = [
  PROJECT_PATH + 'foo/bla/foo.js',
  PROJECT_PATH + 'foo/bla/bar.js',
  PROJECT_PATH + 'foo/bla/baz.js',
];

const FAKE_RECENT_FILES = FILE_PATHS.map((path, i) => ({
  path,
  timestamp: 1e8 - i * 1000,
}));

const FakeRecentFilesService = {
  getRecentFiles: () => FAKE_RECENT_FILES,
  touchFile: (path: string) => {},
};

let fakeGetProjectPathsImpl = () => [];
const fakeGetProjectPaths = () => fakeGetProjectPathsImpl();

describe('RecentFilesProvider', () => {
  let recentFilesProvider: any;

  beforeEach(() => {
    recentFilesProvider = {...RecentFilesProvider};
    recentFilesProvider.setRecentFilesService(FakeRecentFilesService);
    spyOn(atom.project, 'getPaths').andCallFake(fakeGetProjectPaths);
  });

  describe('getRecentFiles', () => {
    it('returns all recently opened files for currently mounted project directories', () => {
      waitsForPromise(async () => {
        fakeGetProjectPathsImpl = () => [PROJECT_PATH];
        expect(await recentFilesProvider.executeQuery('')).toEqual(FAKE_RECENT_FILES);
        fakeGetProjectPathsImpl = () => [PROJECT_PATH, PROJECT_PATH2];
        expect(await recentFilesProvider.executeQuery('')).toEqual(FAKE_RECENT_FILES);
      });
    });

    it('does not return files for project directories that are not currently mounted', () => {
      waitsForPromise(async () => {
        fakeGetProjectPathsImpl = () => [PROJECT_PATH2];
        expect(await recentFilesProvider.executeQuery('')).toEqual([]);

        fakeGetProjectPathsImpl = () => [];
        expect(await recentFilesProvider.executeQuery('')).toEqual([]);
      });
    });

    it('filters results according to the query string', () => {
      waitsForPromise(async () => {
        fakeGetProjectPathsImpl = () => [PROJECT_PATH];
        expect(await recentFilesProvider.executeQuery('ba')).toEqual([
          // 'foo/bla/foo.js' does not match 'ba', but `bar.js` and `baz.js` do:
          FAKE_RECENT_FILES[1],
          FAKE_RECENT_FILES[2],
        ]);
      });
    });
  });
});
