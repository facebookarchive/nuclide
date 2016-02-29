'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Mostly copied from FileSearch-spec.
 * We only test one project type (vanilla) since we don't need to test the others again.
 */

import type {FileSearchResult} from '../lib/FileSearch';

import invariant from 'assert';
import fs from 'fs';
import path from 'path';
import {track} from 'temp';
const temp = track();
import url from 'url';

import {fileSearchForDirectory} from '../lib/NativeFileSearch';

function createTestFolder(): string {
  const folder = temp.mkdirSync();

  fs.writeFileSync(path.join(folder, 'test'), '');

  fs.mkdirSync(path.join(folder, 'deeper'));
  fs.writeFileSync(path.join(folder, 'deeper', 'deeper'), '');

  return folder;
}

describe('NativeFileSearch', () => {
  let dirPath, search, deeperSearch, uriSearch;
  beforeEach(() => {
    waitsForPromise(async () => {
      // Don't create a real PathSearchUpdater that relies on watchman.
      const mockPathSetUpdater: Object = {
        startUpdatingPathSet: () => Promise.resolve({dispose: () => {}}),
      };

      dirPath = createTestFolder();
      invariant(fileSearchForDirectory);
      search = await fileSearchForDirectory(dirPath, mockPathSetUpdater);
      deeperSearch =
        await fileSearchForDirectory(path.join(dirPath, 'deeper'), mockPathSetUpdater);
      uriSearch = await fileSearchForDirectory(
        url.format({protocol: 'http', host: 'somehost.fb.com', pathname: dirPath}),
        mockPathSetUpdater,
      );
    });
  });

  afterEach(() => {
    temp.cleanupSync();
  });

  // Score values are difficult to test.
  function values(results: Array<FileSearchResult>) {
    return results.map(x => x.path);
  }

  // Correct for dirPath, which is essentially a random string.
  function indexes(results: Array<FileSearchResult>) {
    return results.map(x => x.matchIndexes.map(idx => idx - dirPath.length - 1));
  }

  describe('a FileSearch at the root of a project', () => {
    it('should return an easy match in the root directory', () => {
      waitsForPromise(async () => {
        invariant(search);
        invariant(dirPath);
        const results = await search.query('test');
        expect(values(results)).toEqual([
          path.join(dirPath, 'test'),
        ]);
        expect(indexes(results)).toEqual([
          [0, 1, 2, 3],
        ]);
      });
    });

    it('should return an easy match in the deeper directory', () => {
      waitsForPromise(async () => {
        invariant(search);
        invariant(dirPath);
        const results = await search.query('deeper');
        expect(values(results)).toEqual([
          path.join(dirPath, 'deeper/deeper'),
        ]);
        expect(indexes(results)).toEqual([
          [7, 8, 9, 10, 11, 12],
        ]);
      });
    });
  });

  describe('a subdirectory FileSearch', () => {
    it('should return results relative to the deeper path', () => {
      waitsForPromise(async () => {
        invariant(deeperSearch);
        invariant(dirPath);
        const results = await deeperSearch.query('deeper');
        expect(values(results)).toEqual([
          path.join(dirPath, 'deeper/deeper'),
        ]);
        expect(indexes(results)).toEqual([
          [7, 8, 9, 10, 11, 12],
        ]);
      });
    });

    it('should not return results in a subdirectory', () => {
      waitsForPromise(async () => {
        invariant(deeperSearch);
        const results = await deeperSearch.query('test');
        expect(results).toEqual([]);
      });
    });
  });

  describe('a FileSearch with a hostname', () => {
    it('should return an easy match in the root directory', () => {
      waitsForPromise(async () => {
        invariant(uriSearch);
        const results = await uriSearch.query('test');
        expect(values(results)).toEqual([
          `http://somehost.fb.com${dirPath}/test`,
        ]);
      });
    });

    it('should return an easy match in the deeper directory', () => {
      waitsForPromise(async () => {
        invariant(uriSearch);
        const results = await uriSearch.query('deeper');
        expect(values(results)).toEqual([
          `http://somehost.fb.com${dirPath}/deeper/deeper`,
        ]);
      });
    });
  });
});
