/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import invariant from 'assert';
import fs from 'fs';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {runCommand} from 'nuclide-commons/process';
import {generateFixture} from 'nuclide-commons/test-helpers';
import {fileSearchForDirectory} from '../lib/process/FileSearch';
import * as watchmanHelpers from 'nuclide-watchman-helpers';

jest.setTimeout(30000);

function aFileSearchShould(typename, dirPathFn) {
  describe(`A ${typename} folder`, () => {
    let dirPath;

    // Don't create a real PathSearchUpdater that relies on watchman.
    const mockPathSetUpdater: Object = {
      startUpdatingPathSet: () => Promise.resolve({dispose: () => {}}),
    };

    beforeEach(async () => {
      // Block Watchman usage by preventing client creation.
      jest.spyOn(watchmanHelpers, 'WatchmanClient').mockImplementation(() => {
        throw new Error();
      });
      await (async () => {
        dirPath = await dirPathFn();
      })();
    });

    // Score values are difficult to test.
    function values(results) {
      return results.map(x => x.path);
    }

    // Correct for dirPath, which is essentially a random string.
    function indexes(results) {
      return results.map(x =>
        x.matchIndexes.map(idx => idx - dirPath.length - 1),
      );
    }

    describe('a FileSearch at the root of a project', () => {
      let search;
      beforeEach(async () => {
        await (async () => {
          search = await fileSearchForDirectory(dirPath, mockPathSetUpdater);
        })();
      });

      it('should return an easy match in the root directory', async () => {
        await (async () => {
          invariant(search);
          invariant(dirPath);
          const results = await search.query('test');
          expect(values(results)).toEqual([nuclideUri.join(dirPath, 'test')]);
          expect(indexes(results)).toEqual([[0, 1, 2, 3]]);
        })();
      });

      it('should return an easy match in the deeper directory', async () => {
        await (async () => {
          invariant(search);
          invariant(dirPath);
          const results = await search.query('deeper');
          expect(values(results)).toEqual([
            nuclideUri.join(dirPath, 'deeper/deeper'),
          ]);
          expect(indexes(results)).toEqual([[7, 8, 9, 10, 11, 12]]);
        })();
      });

      it('should handle searches for full paths', async () => {
        await (async () => {
          const fullpath = nuclideUri.join(dirPath, 'deeper/deeper');
          let results = await search.query(fullpath);
          expect(values(results)).toEqual([fullpath]);
          results = await search.query(
            nuclideUri.join(nuclideUri.basename(dirPath), 'deeper/deeper'),
          );
          expect(values(results)).toEqual([fullpath]);
        })();
      });
    });

    describe('a subdirectory FileSearch', () => {
      let deeperSearch;
      beforeEach(async () => {
        await (async () => {
          deeperSearch = await fileSearchForDirectory(
            nuclideUri.join(dirPath, 'deeper'),
            mockPathSetUpdater,
          );
        })();
      });

      it('should return results relative to the deeper path', async () => {
        await (async () => {
          invariant(deeperSearch);
          invariant(dirPath);
          const results = await deeperSearch.query('deeper');
          expect(values(results)).toEqual([
            nuclideUri.join(dirPath, 'deeper/deeper'),
          ]);
          expect(indexes(results)).toEqual([[7, 8, 9, 10, 11, 12]]);
        })();
      });

      it('should not return results in a subdirectory', async () => {
        await (async () => {
          invariant(deeperSearch);
          const results = await deeperSearch.query('test');
          expect(results).toEqual([]);
        })();
      });
    });

    describe('a FileSearch with ignoredNames', () => {
      let search;
      beforeEach(async () => {
        await (async () => {
          search = await fileSearchForDirectory(dirPath, mockPathSetUpdater, [
            'deeper/**',
          ]);
        })();
      });

      it("should not match ignored patterns if it's not an exact-match", async () => {
        await (async () => {
          const results = await search.query('');
          expect(values(results)).toEqual([nuclideUri.join(dirPath, 'test')]);
        })();
      });

      it('should match ignored patterns if it is an exact-match', async () => {
        if (typename === 'Vanilla (No VCS)') {
          // This test makes no sense for Vanilla searches =)
          return;
        }

        const querySuites = [
          './ignored',
          'ignored',
          nuclideUri.join(dirPath, 'ignored'),
        ];
        for (const querySuite of querySuites) {
          await (async () => {
            const results = await search.query(querySuite);
            expect(values(results)).toEqual([
              nuclideUri.join(dirPath, 'ignored'),
            ]);
          })();
        }
      });
    });
  });
}

async function createTestFolder(): Promise<string> {
  const folder = await generateFixture(
    'fuzzy-file-search-rpc',
    new Map([['project/test', ''], ['project/deeper/deeper', '']]),
  );
  // The basename of the root folder is included for search purposes.
  // Since fixtures have random folders, add a top level "project" dir
  // to prevent this from causing false search results.
  return nuclideUri.join(folder, 'project');
}

async function hgTestFolder(): Promise<string> {
  const folder = await createTestFolder();

  await runCommand('hg', ['init'], {cwd: folder}).toPromise();
  await runCommand('hg', ['addremove'], {cwd: folder}).toPromise();

  // After adding the existing files to hg, add an ignored file to
  // prove we're using hg to populate the list.
  const ignoredFile = 'ignored';
  fs.writeFileSync(nuclideUri.join(folder, ignoredFile), '');
  fs.writeFileSync(
    nuclideUri.join(folder, '.hgignore'),
    `.hgignore\n${ignoredFile}`,
  );

  return folder;
}

async function gitTestFolder(): Promise<string> {
  const folder = await createTestFolder();

  await runCommand('git', ['init'], {cwd: folder}).toPromise();
  await runCommand('git', ['add', '*'], {cwd: folder}).toPromise();

  // After adding the existing files to git, add an ignored file to
  // prove we're using git to populate the list.
  const ignoredFile = 'ignored';
  fs.writeFileSync(nuclideUri.join(folder, ignoredFile), '');
  fs.writeFileSync(
    nuclideUri.join(folder, '.gitignore'),
    `.gitignore\n${ignoredFile}`,
  );

  return folder;
}

aFileSearchShould('Mercurial', hgTestFolder);
aFileSearchShould('Git', gitTestFolder);
aFileSearchShould('Vanilla (No VCS)', createTestFolder);
