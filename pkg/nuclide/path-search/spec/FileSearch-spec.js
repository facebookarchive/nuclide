'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {asyncExecute} = require('nuclide-commons');
var fs = require('fs');
var path = require('path');
var temp = require('temp').track();
var url = require('url');

var {fileSearchForDirectory} = require('../lib/FileSearch');

function aFileSearchShould(typename) {
  describe(`A ${typename} folder`, () => {
    var dirPath, dirPathFn, search, deeperSearch, uriSearch;

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
        var mockPathSetUpdater = {
          startUpdatingPathSet: () => Promise.resolve({dispose: () => {}}),
        };

        dirPath = await dirPathFn();
        search = await fileSearchForDirectory(dirPath, mockPathSetUpdater);
        deeperSearch = await fileSearchForDirectory(path.join(dirPath, 'deeper'), mockPathSetUpdater);
        uriSearch = await fileSearchForDirectory(url.format({protocol: 'http',
                                                             host: 'somehost.fb.com',
                                                             pathname: dirPath}),
                                                 mockPathSetUpdater);
      });
    });

    describe('a FileSearch at the root of a project', () => {
      function correctIndexes(indexes): Array<number> {
        return indexes.map((index) => index + dirPath.length + 1);
      }

      it('should return an easy match in the root directory', () => {
        waitsForPromise(async () => {
          var results = await search.query('test');
          expect(results).toEqual([{score: 171,
                                    path: path.join(dirPath, 'test'),
                                    matchIndexes: correctIndexes([0, 1, 2, 3])}]);
        });
      });

      it('should return an easy match in the deeper directory', () => {
        waitsForPromise(async () => {
          var results = await search.query('deeper');
          expect(results).toEqual([{score: 208.75,
                                    path: path.join(dirPath, 'deeper/deeper'),
                                    matchIndexes: correctIndexes([7, 8, 9, 10, 11, 12])}]);
        });
      });

      it('should only contain two file entries', () => {
        waitsForPromise(async () => {
          var results = await search.query('');
          expect(results.length).toEqual(2);
        });
      });
    });

    describe('a subdirectory FileSearch', () => {
      function correctIndexes(indexes): Array<number> {
        return indexes.map((index) => index + uriSearch.getLocalDirectory().length);
      }

      it('should return results relative to the deeper path', () => {
        waitsForPromise(async () => {
          var results = await deeperSearch.query('deeper');
          expect(results).toEqual([{score: 235,
                                    path: path.join(dirPath, 'deeper/deeper'),
                                    matchIndexes: correctIndexes([0, 1, 2, 3, 4, 5])}]);
        });
      });

      it ('should not return results in a subdirectory', () => {
        waitsForPromise(async () => {
          var results = await deeperSearch.query('test');
          expect(results).toEqual([]);
        });
      });

      it('should only contain one file', () => {
        waitsForPromise(async () => {
          var results = await deeperSearch.query('');
          expect(results.length).toEqual(1);
        });
      });
    });

    describe('a FileSearch with a hostname', () => {
      function correctIndexes(indexes): Array<number> {
        return indexes.map((index) => index + uriSearch.getFullBaseUri().length + 1);
      }

      it('should return an easy match in the root directory', () => {
        waitsForPromise(async () => {
          var results = await uriSearch.query('test');
          expect(results).toEqual([{score: 171,
                                    path: `http://somehost.fb.com${dirPath}/test`,
                                    matchIndexes: correctIndexes([0, 1, 2, 3])}]);
        });
      });

      it('should return an easy match in the deeper directory', () => {
        waitsForPromise(async () => {
          var results = await uriSearch.query('deeper');
          expect(results).toEqual([{score: 208.75,
                                    path: `http://somehost.fb.com${dirPath}/deeper/deeper`,
                                    matchIndexes: correctIndexes([7, 8, 9, 10, 11, 12])}]);
        });
      });

      it('should only contain two file entries', () => {
        waitsForPromise(async () => {
          var results = await uriSearch.query('');
          expect(results.length).toEqual(2);
        });
      });
    });
  });
}

function createTestFolder(): string {
  var folder = temp.mkdirSync();

  fs.writeFileSync(path.join(folder, 'test'));

  fs.mkdirSync(path.join(folder, 'deeper'));
  fs.writeFileSync(path.join(folder, 'deeper', 'deeper'));

  return folder;
}

async function hgTestFolder(): string {
  var folder = createTestFolder();

  await asyncExecute('hg', ['init'], {cwd: folder});
  await asyncExecute('hg', ['addremove'], {cwd: folder});

  // After adding the existing files to hg, add an untracked file to
  // prove we're using hg to populate the list.
  fs.writeFileSync(path.join(folder, 'untracked'));

  return folder;
}

async function gitTestFolder(): string {
  var folder = createTestFolder();

  await asyncExecute('git', ['init'], {cwd: folder});
  await asyncExecute('git', ['add', '*'], {cwd: folder});

  // After adding the existing files to git, add an untracked file to
  // prove we're using git to populate the list.
  fs.writeFileSync(path.join(folder, 'untracked'));

  return folder;
}

aFileSearchShould('Mercurial');
aFileSearchShould('Git');
aFileSearchShould('Vanilla (No VCS)');
