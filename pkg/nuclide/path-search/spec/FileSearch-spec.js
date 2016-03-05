'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import fs from 'fs';
import path from 'path';
import {track} from 'temp';
const temp = track();
import url from 'url';

import {asyncExecute} from '../../commons';

import {fileSearchForDirectory} from '../lib/FileSearch';


function aFileSearchShould(typename) {
  describe(`A ${typename} folder`, () => {
    let dirPath, dirPathFn, search, deeperSearch, uriSearch;

    if (typename === 'Mercurial') {
      dirPathFn = hgTestFolder;
    } else if (typename === 'Git') {
      dirPathFn = gitTestFolder;
    } else if (typename === 'Vanilla (No VCS)') {
      dirPathFn = () => Promise.resolve(createTestFolder());
    } else {
      throw Error(`Unknown typename: ${typename}`);
    }

    beforeEach(() => {
      waitsForPromise(async () => {
        // Don't create a real PathSearchUpdater that relies on watchman.
        const mockPathSetUpdater: Object = {
          startUpdatingPathSet: () => Promise.resolve({dispose: () => {}}),
        };

        invariant(dirPathFn);
        dirPath = await dirPathFn();
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

    // Jasmine won't trigger temp's cleanup handler. Do it manually.
    // This is especially important since we create Watchman watches on the temp directories.
    afterEach(() => {
      temp.cleanupSync();
    });

    // Score values are difficult to test.
    function values(results) {
      return results.map(x => x.path);
    }

    // Correct for dirPath, which is essentially a random string.
    function indexes(results) {
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
}

function createTestFolder(): string {
  const folder = temp.mkdirSync();

  fs.writeFileSync(path.join(folder, 'test'), '');

  fs.mkdirSync(path.join(folder, 'deeper'));
  fs.writeFileSync(path.join(folder, 'deeper', 'deeper'), '');

  return folder;
}

async function hgTestFolder(): Promise<string> {
  const folder = createTestFolder();

  await asyncExecute('hg', ['init'], {cwd: folder});
  await asyncExecute('hg', ['addremove'], {cwd: folder});

  // After adding the existing files to hg, add an ignored file to
  // prove we're using hg to populate the list.
  const ignoredFile = 'ignored';
  fs.writeFileSync(path.join(folder, ignoredFile), '');
  fs.writeFileSync(path.join(folder, '.hgignore'), `.hgignore\n${ignoredFile}`);

  return folder;
}

async function gitTestFolder(): Promise<string> {
  const folder = createTestFolder();

  await asyncExecute('git', ['init'], {cwd: folder});
  await asyncExecute('git', ['add', '*'], {cwd: folder});

  // After adding the existing files to git, add an ignored file to
  // prove we're using git to populate the list.
  const ignoredFile = 'ignored';
  fs.writeFileSync(path.join(folder, ignoredFile), '');
  fs.writeFileSync(path.join(folder, '.gitignore'), `.gitignore\n${ignoredFile}`);

  return folder;
}

aFileSearchShould('Mercurial');
aFileSearchShould('Git');
aFileSearchShould('Vanilla (No VCS)');
