'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.aFileSearchShould = aFileSearchShould;
exports.createTestFolder = createTestFolder;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons/test-helpers');
}

var _nuclideWatchmanHelpers;

function _load_nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers = _interopRequireWildcard(require('../../../modules/nuclide-watchman-helpers'));
}

var _FileSearch;

function _load_FileSearch() {
  return _FileSearch = require('../lib/process/FileSearch');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
 */

function aFileSearchShould(typename, dirPathFn) {
  describe(`A ${typename} folder`, () => {
    let dirPath;

    // Don't create a real PathSearchUpdater that relies on watchman.
    const mockPathSetUpdater = {
      startUpdatingPathSet: () => Promise.resolve({ dispose: () => {} })
    };

    beforeEach(async () => {
      // Block Watchman usage by preventing client creation.
      jest.spyOn(_nuclideWatchmanHelpers || _load_nuclideWatchmanHelpers(), 'WatchmanClient').mockImplementation(() => {
        throw new Error();
      });
      dirPath = await dirPathFn();
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
      let search;
      beforeEach(async () => {
        await (async () => {
          search = await (0, (_FileSearch || _load_FileSearch()).fileSearchForDirectory)(dirPath, mockPathSetUpdater);
        })();
      });

      it('should return an easy match in the root directory', async () => {
        if (!search) {
          throw new Error('Invariant violation: "search"');
        }

        if (!dirPath) {
          throw new Error('Invariant violation: "dirPath"');
        }

        const results = await search.query('test');
        expect(values(results)).toEqual([(_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'test')]);
        expect(indexes(results)).toEqual([[0, 1, 2, 3]]);
      });

      it('should return an easy match in the deeper directory', async () => {
        if (!search) {
          throw new Error('Invariant violation: "search"');
        }

        if (!dirPath) {
          throw new Error('Invariant violation: "dirPath"');
        }

        const results = await search.query('deeper');
        expect(values(results)).toEqual([(_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'deeper/deeper')]);
        expect(indexes(results)).toEqual([[7, 8, 9, 10, 11, 12]]);
      });

      it('should handle searches for full paths', async () => {
        const fullpath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'deeper/deeper');
        let results = await search.query(fullpath);
        expect(values(results)).toEqual([fullpath]);
        results = await search.query((_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.basename(dirPath), 'deeper/deeper'));
        expect(values(results)).toEqual([fullpath]);
      });
    });

    describe('a subdirectory FileSearch', () => {
      let deeperSearch;
      beforeEach(async () => {
        deeperSearch = await (0, (_FileSearch || _load_FileSearch()).fileSearchForDirectory)((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'deeper'), mockPathSetUpdater);
      });

      it('should return results relative to the deeper path', async () => {
        if (!deeperSearch) {
          throw new Error('Invariant violation: "deeperSearch"');
        }

        if (!dirPath) {
          throw new Error('Invariant violation: "dirPath"');
        }

        const results = await deeperSearch.query('deeper');
        expect(values(results)).toEqual([(_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'deeper/deeper')]);
        expect(indexes(results)).toEqual([[7, 8, 9, 10, 11, 12]]);
      });

      it('should not return results in a subdirectory', async () => {
        if (!deeperSearch) {
          throw new Error('Invariant violation: "deeperSearch"');
        }

        const results = await deeperSearch.query('test');
        expect(results).toEqual([]);
      });
    });

    describe('a FileSearch with ignoredNames', () => {
      let search;
      beforeEach(async () => {
        search = await (0, (_FileSearch || _load_FileSearch()).fileSearchForDirectory)(dirPath, mockPathSetUpdater, ['deeper/**']);
      });

      it("should not match ignored patterns if it's not an exact-match", async () => {
        const results = await search.query('');
        expect(values(results)).toEqual([(_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'test')]);
      });

      it('should match ignored patterns if it is an exact-match', async () => {
        if (typename === 'Vanilla (No VCS)') {
          // This test makes no sense for Vanilla searches =)
          return;
        }

        const querySuites = ['./ignored', 'ignored', (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'ignored')];
        for (const querySuite of querySuites) {
          await (async () => {
            const results = await search.query(querySuite);
            expect(values(results)).toEqual([(_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'ignored')]);
          })();
        }
      });
    });
  });
}

async function createTestFolder() {
  const folder = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('fuzzy-file-search-rpc', new Map([['project/test', ''], ['project/deeper/deeper', '']]));
  // The basename of the root folder is included for search purposes.
  // Since fixtures have random folders, add a top level "project" dir
  // to prevent this from causing false search results.
  return (_nuclideUri || _load_nuclideUri()).default.join(folder, 'project');
}