'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Directory} = require('atom');
var HgRepositoryClient = require('../lib/HgRepositoryClient');
var MockHgService = require('nuclide-hg-repository-base').MockHgService;
var {HgStatusOption, StatusCodeId, StatusCodeNumber} = require('nuclide-hg-repository-base').hgConstants;
var path = require('path');
var temp = require('temp').track();


describe('HgRepositoryClient', () => {
  var tempDir = temp.mkdirSync('testproj');
  var tempSubDir = temp.mkdirSync({dir: tempDir});

  var repoPath = path.join(tempDir, '.hg');
  var workingDirectory = new Directory(tempDir);
  var projectDirectory = new Directory(tempSubDir);
  var repoOptions = {
    originURL: 'http://test.com/testproj',
    workingDirectory,
    projectRootDirectory: projectDirectory,
  };

  // Manufactures the absolute path of a file that should pass as being
  // within the repo.
  var createFilePath = (filename) => {
    return path.join(projectDirectory.getPath(), filename);
  };

  // Some test "absolute" paths.
  var PATH_1 = createFilePath('test1.js');
  var PATH_2 = createFilePath('test2.js');
  var PATH_3 = createFilePath('test3.js');
  var PATH_4 = createFilePath('test4.js');
  var PATH_5 = createFilePath('test5.js');
  var PATH_6 = createFilePath('test6.js');
  var PATH_7 = createFilePath('test7.js');
  var PATH_CALLED_NULL = createFilePath('null');
  var PATH_CALLED_UNDEFINED = createFilePath('undefined');

  var mockHgService;
  var repo;

  beforeEach(() => {
    mockHgService = new MockHgService();
    repo = new HgRepositoryClient(repoPath, mockHgService, repoOptions);
  });

  describe('::getType()', () => {
    it('returns "hg"', () => {
      expect(repo.getType()).toBe('hg');
    });
  });

  describe('::getProjectDirectory', () => {
    it('returns the path of the root project folder in Atom that this Client provides information about.', () => {
      expect(repo.getProjectDirectory()).toBe(projectDirectory.getPath());
    });
  });

  describe('::getStatuses', () => {
    beforeEach(() => {
      // Test setup: Mock out the dependency on HgRepository::_updateStatuses, and set up the cache state.
      var mockFetchedStatuses = {[PATH_1]: StatusCodeId.ADDED};
      spyOn(repo, '_updateStatuses').andCallFake((paths, options) => {
        var statuses = {};
        paths.forEach((filePath) => {
          statuses[filePath] = mockFetchedStatuses[filePath];
        });
        return Promise.resolve(statuses);
      });
      repo._hgStatusCache = {
        [PATH_2]: StatusCodeId.IGNORED,
        [PATH_3]: StatusCodeId.MODIFIED,
      };
    });

    it('returns statuses from the cache when possible, and only fetches the status for cache misses.', () => {
      var hgStatusOptions = {hgStatusOption: HgStatusOption.ALL_STATUSES};
      waitsForPromise(async () => {
        var statusMap = await repo.getStatuses([PATH_1, PATH_2], hgStatusOptions);
        expect(repo._updateStatuses).toHaveBeenCalledWith([PATH_1], hgStatusOptions);
        expect(statusMap).toEqual({
          [PATH_1]: StatusCodeNumber.ADDED,
          [PATH_2]: StatusCodeNumber.IGNORED,
        });
      });
    });

    it('when reading from the cache, it respects the hgStatusOption.', () => {
      waitsForPromise(async () => {
        var statusMap = await repo.getStatuses([PATH_2, PATH_3], {hgStatusOption: HgStatusOption.ONLY_NON_IGNORED});
        expect(repo._updateStatuses).not.toHaveBeenCalled();
        expect(statusMap).toEqual({
          [PATH_3]: StatusCodeNumber.MODIFIED,
        });
      });

      waitsForPromise(async () => {
        var statusMap = await repo.getStatuses([PATH_2, PATH_3], {hgStatusOption: HgStatusOption.ONLY_IGNORED});
        expect(repo._updateStatuses).not.toHaveBeenCalled();
        expect(statusMap).toEqual({
          [PATH_2]: StatusCodeNumber.IGNORED,
        });
      });
    });
  });

  describe('::_updateStatuses', () => {
    var nonIgnoredOption = {hgStatusOption: HgStatusOption.ONLY_NON_IGNORED};
    var onlyIgnoredOption = {hgStatusOption: HgStatusOption.ONLY_IGNORED};
    var mockHgStatusFetchData = new Map([
      [PATH_1, StatusCodeId.ADDED],
      [PATH_2, StatusCodeId.UNTRACKED],
      [PATH_3, StatusCodeId.CLEAN],
      [PATH_6, StatusCodeId.CLEAN],
      [PATH_7, StatusCodeId.MODIFIED],
    ]);
    var mockOldCacheState;

    beforeEach(() => {
      mockOldCacheState = {
        [PATH_1]: StatusCodeId.IGNORED,
        [PATH_2]: StatusCodeId.UNTRACKED,
        [PATH_3]: StatusCodeId.MODIFIED,
        [PATH_4]: StatusCodeId.IGNORED,
        [PATH_5]: StatusCodeId.MODIFIED,
      };

      spyOn(repo._service, 'fetchStatuses').andCallFake((paths, options) => {
        var statusMap = {};
        paths.forEach((filePath) => {
          var fetchedStatus = mockHgStatusFetchData.get(filePath);
          if (fetchedStatus) {
            statusMap[filePath] = fetchedStatus;
          }
        });
        return Promise.resolve(statusMap);
      });
      repo._hgStatusCache = {};
      Object.keys(mockOldCacheState).forEach((filePath) => {
        repo._hgStatusCache[filePath] = mockOldCacheState[filePath];
      });
      // Make it so all of the test paths are deemed within the repo.
      spyOn(workingDirectory, 'contains').andCallFake(() => {
        return true;
      });
    });

    it('does a fresh fetch for the hg status for all paths it is passed, and returns them.', () => {
      var paths = [PATH_1, PATH_2];
      waitsForPromise(async () => {
        var output = await repo._updateStatuses(paths, nonIgnoredOption);
        expect(repo._service.fetchStatuses).toHaveBeenCalledWith(paths, nonIgnoredOption);
        var expectedStatus = {
          [PATH_1]: mockHgStatusFetchData.get(PATH_1),
          [PATH_2]: mockHgStatusFetchData.get(PATH_2),
        };
        expect(output).toEqual(expectedStatus);
      });
    });

    describe(`it removes a path from the cache if the fetch indicates its status is unknown but incorrect in the cache,
        as informed by the hgStatusOption passed in`, () => {
      var pathsWithNoStatusReturned = [PATH_4, PATH_5];

      it('Case 1: HgStatusOption.ONLY_NON_IGNORED', () => {
        waitsForPromise(async () => {
          await repo._updateStatuses(pathsWithNoStatusReturned, nonIgnoredOption);
          // PATH_4 was queried for but not returned, but the fetch was for non-ignored files.
          //   We have no evidence that its status is out of date, so it should remain 'ignored' in the cache.
          // PATH_5 was queried for but not returned, and the fetch was for non-ignored files.
          //   This means its state is no longer 'modified', as it was listed in the cache.
          expect(repo._hgStatusCache[PATH_4]).toBe(StatusCodeId.IGNORED);
          expect(repo._hgStatusCache[PATH_5]).toBeUndefined();
        });
      });

      it('Case 2: HgStatusOption.ONLY_IGNORED', () => {
        waitsForPromise(async () => {
          await repo._updateStatuses(pathsWithNoStatusReturned, onlyIgnoredOption);
          // PATH_5 was queried for but not returned, but the fetch was for ignored files.
          //   We have no evidence that its status is out of date, so it should remain 'modified' in the cache.
          // PATH_4 was queried for but not returned, and the fetch was for ignored files.
          //   This means its state is no longer 'ignored', as it was listed in the cache.
          expect(repo._hgStatusCache[PATH_5]).toBe(StatusCodeId.MODIFIED);
          expect(repo._hgStatusCache[PATH_4]).toBeUndefined();
        });
      });
    });

    it ('does not add "clean" files to the cache and removes them if they are in the cache.', () => {
      var pathsWithCleanStatusReturned = [PATH_3, PATH_6];
      waitsForPromise(async () => {
        await repo._updateStatuses(pathsWithCleanStatusReturned, {hgStatusOption: HgStatusOption.ALL_STATUSES});
        // PATH_3 was previously in the cache. PATH_6 was never in the cache.
        expect(repo._hgStatusCache[PATH_3]).toBeUndefined();
        expect(repo._hgStatusCache[PATH_6]).toBeUndefined();
      });
    });

    it('triggers the callbacks registered through ::onDidChangeStatuses and ::onDidChangeStatus.', () => {
      var callbackSpyForStatuses = jasmine.createSpy('::onDidChangeStatuses spy');
      repo.onDidChangeStatuses(callbackSpyForStatuses);
      var callbackSpyForStatus = jasmine.createSpy('::onDidChangeStatus spy');
      repo.onDidChangeStatus(callbackSpyForStatus);

      // File existed in the cache, and its status changed.
      var expectedChangeEvent1 = {
        path: PATH_1,
        pathStatus: StatusCodeNumber.ADDED,
      };

      // File did not exist in the cache, and its status is modified.
      var expectedChangeEvent2 = {
        path: PATH_7,
        pathStatus: StatusCodeNumber.MODIFIED,
      };

      waitsForPromise(async () => {
        // We must pass in the updated filenames to catch the case when a cached status turns to 'clean'.
        await repo._updateStatuses([PATH_1, PATH_2, PATH_6, PATH_7], {hgStatusOption: HgStatusOption.ALL_STATUSES});
        expect(callbackSpyForStatuses.calls.length).toBe(1);
        expect(callbackSpyForStatus.calls.length).toBe(2);
        // PATH_2 existed in the cache, and its status did not change, so it shouldn't generate an event.
        // PATH_6 did not exist in the cache, but its status is clean, so it shouldn't generate an event.
        expect(callbackSpyForStatus).toHaveBeenCalledWith(expectedChangeEvent1);
        expect(callbackSpyForStatus).toHaveBeenCalledWith(expectedChangeEvent2);
      });
    });
  });

  describe('::_filesDidChange', () => {
    it('triggers an update to the status of a file listed in the update, iff that file is in the project directory.', () => {
      var path_not_in_project = '/Random/Path';

      var mockUpdate = [PATH_1, path_not_in_project];
      spyOn(repo, '_updateStatuses');

      waitsForPromise(async () => {
        await repo._filesDidChange(mockUpdate);
        expect(repo._updateStatuses).toHaveBeenCalledWith(
            [PATH_1], {hgStatusOption: HgStatusOption.ALL_STATUSES});
      });
    });
  });

  describe('_refreshStatusesOfAllFilesInCache', () => {
    it('refreshes the status of all paths currently in the cache.', () => {
      // Test setup: force the state of the repo.
      var testRepoState = {
        [PATH_1]: StatusCodeId.IGNORED,
        [PATH_2]: StatusCodeId.MODIFIED,
        [PATH_3]: StatusCodeId.ADDED,
      };
      repo._hgStatusCache = testRepoState;
      spyOn(repo, '_updateStatuses').andCallFake((filePaths, options) => {
        // The cache should be cleared before being fully refreshed.
        expect(repo._hgStatusCache).toEqual({});
      });

      repo._refreshStatusesOfAllFilesInCache();
      expect(repo._updateStatuses).toHaveBeenCalledWith(
        Object.keys(testRepoState),
        {hgStatusOption: HgStatusOption.ALL_STATUSES}
      );
    });
  });

  describe('::isPathIgnored', () => {
    it('returns true if the path is marked ignored in the cache.', () => {
      // Force the state of the cache.
      repo._hgStatusCache = {
        [PATH_1]: StatusCodeId.IGNORED,
      };
      expect(repo.isPathIgnored(PATH_1)).toBe(true);
    });

    it('returns true if the path is, or is within, the .hg directory.', () => {
      expect(repo.isPathIgnored(repoPath)).toBe(true);
      expect(repo.isPathIgnored(path.join(repoPath, 'blah'))).toBe(true);
    });

    it('returns false if the path is not in the cache and is not the .hg directory.', () => {
      expect(repo.isPathIgnored('/A/Random/Path')).toBe(false);
      var parsedPath = path.parse(repoPath);
      expect(repo.isPathIgnored(parsedPath.root)).toBe(false);
      expect(repo.isPathIgnored(parsedPath.dir)).toBe(false);
    });

    it('returns false if the path is null or undefined, but handles files with those names.', () => {
      // Force the state of the cache.
      repo._hgStatusCache = {
        [PATH_CALLED_NULL]: StatusCodeId.IGNORED,
        [PATH_CALLED_UNDEFINED]: StatusCodeId.IGNORED,
      };
      expect(repo.isPathIgnored(null)).toBe(false);
      expect(repo.isPathIgnored(undefined)).toBe(false);
      expect(repo.isPathIgnored(PATH_CALLED_NULL)).toBe(true);
      expect(repo.isPathIgnored(PATH_CALLED_UNDEFINED)).toBe(true);
    });
  });

  describe('::isPathNew', () => {
    it('returns false if the path is null or undefined, but handles files with those names.', () => {
      // Force the state of the cache.
      repo._hgStatusCache = {
        [PATH_CALLED_NULL]: StatusCodeId.ADDED,
        [PATH_CALLED_UNDEFINED]: StatusCodeId.ADDED,
      };
      expect(repo.isPathNew(null)).toBe(false);
      expect(repo.isPathNew(undefined)).toBe(false);
      expect(repo.isPathNew(PATH_CALLED_NULL)).toBe(true);
      expect(repo.isPathNew(PATH_CALLED_UNDEFINED)).toBe(true);
    });
  });

  describe('::isPathModified', () => {
    it('returns false if the path is null or undefined, but handles files with those names.', () => {
      // Force the state of the cache.
      repo._hgStatusCache = {
        [PATH_CALLED_NULL]: StatusCodeId.MODIFIED,
        [PATH_CALLED_UNDEFINED]: StatusCodeId.MODIFIED,
      };
      expect(repo.isPathModified(null)).toBe(false);
      expect(repo.isPathModified(undefined)).toBe(false);
      expect(repo.isPathModified(PATH_CALLED_NULL)).toBe(true);
      expect(repo.isPathModified(PATH_CALLED_UNDEFINED)).toBe(true);
    });
  });

  describe('::getCachedPathStatus', () => {
    beforeEach(() => {
      repo._hgStatusCache = {
        [PATH_1]: StatusCodeId.MODIFIED,
        [PATH_2]: StatusCodeId.IGNORED,
      };
    });

    it('retrieves cached hg status.', () => {
      // Force the state of the cache.
      var status = repo.getCachedPathStatus(PATH_1);
      expect(repo.isStatusModified(status)).toBe(true);
      expect(repo.isStatusNew(status)).toBe(false);
    });

    it ('retrieves cached hg ignore status.', () => {
      var status = repo.getCachedPathStatus(PATH_2);
      // The status codes have no meaning; just test the expected translated
      // meanings.
      expect(repo.isStatusModified(status)).toBe(false);
      expect(repo.isStatusNew(status)).toBe(false);
    });

    it ('returns a clean status by default.', () => {
      var status = repo.getCachedPathStatus('path-not-in-cache');
      // The status codes have no meaning; just test the expected translated
      // meanings.
      expect(repo.isStatusModified(status)).toBe(false);
      expect(repo.isStatusNew(status)).toBe(false);
    });
  });

  describe('the hgDiffCache', () => {
    beforeEach(() => {
      // Unfortunately, when the temp files in these tests are opened in the editor,
      // editor.getPath() returns the original file path with '/private/' appended
      // to it. Thus, the path returned from editor.getPath() (which is what is
      // used in HgRepository) would fail a real 'contains' method. So we override
      // this to the expected path.
      var workingDirectoryClone = new Directory(tempDir);
      spyOn(workingDirectory, 'contains').andCallFake((filePath) => {
        var prefix = '/private';
        if (filePath.startsWith(prefix)) {
          var prefixRemovedPath = filePath.slice(prefix.length);
          return workingDirectoryClone.contains(prefixRemovedPath);
        }
        return workingDirectoryClone.contains(filePath);
      });

      var projectDirectoryClone = new Directory(tempSubDir);
      spyOn(projectDirectory, 'contains').andCallFake((filePath) => {
        var prefix = '/private';
        if (filePath.startsWith(prefix)) {
          var prefixRemovedPath = filePath.slice(prefix.length);
          return projectDirectoryClone.contains(prefixRemovedPath);
        }
        return projectDirectoryClone.contains(filePath);
      });
    });

    it('is updated when the active pane item changes to an editor, if the editor file is in the project.', () => {
      spyOn(repo, '_updateDiffInfo');
      var file = temp.openSync({dir: projectDirectory.getPath()});
      waitsForPromise(async () => {
        var editor = await atom.workspace.open(file.path);
        expect(repo._updateDiffInfo.calls.length).toBe(1);
        expect(repo._updateDiffInfo).toHaveBeenCalledWith(editor.getPath());
      });
    });

    it('is not updated when the active pane item changes to an editor whose file is not in the repo.', () => {
      spyOn(repo, '_updateDiffInfo');
      var file = temp.openSync();
      waitsForPromise(async () => {
        await atom.workspace.open(file.path);
        expect(repo._updateDiffInfo.calls.length).toBe(0);
      });
    });

    it('marks a file to be removed from the cache after its editor is closed, if the file is in the project.', () => {
      spyOn(repo, '_updateDiffInfo');
      var file = temp.openSync({dir: projectDirectory.getPath()});
      waitsForPromise(async () => {
        var editor = await atom.workspace.open(file.path);
        expect(repo._hgDiffCacheFilesToClear.size).toBe(0);
        editor.destroy();
        var expectedSet = new Set([editor.getPath()]);
        expect(repo._hgDiffCacheFilesToClear).toEqual(expectedSet);
      });
    });
  });

  describe('Diff Info Getters', () => {
    var mockDiffStats;
    var mockLineDiffs;
    var mockDiffInfo;

    beforeEach(() => {
      // Test setup: Mock out the dependency on HgRepository::_updateDiffInfo,
      // and set up the cache state.
      mockDiffStats = {
        added: 2,
        deleted: 11,
      };
      mockLineDiffs = [{
        oldStart: 150,
        oldLines: 11,
        newStart: 150,
        newLines: 2,
      }];
      mockDiffInfo = {
        added: mockDiffStats.added,
        deleted: mockDiffStats.deleted,
        lineDiffs: mockLineDiffs,
      };
      var mockFetchedDiffInfo = {[PATH_1]: mockDiffInfo};
      spyOn(repo, '_updateDiffInfo').andCallFake((filePath, options) => {
        var diffInfo = mockFetchedDiffInfo[filePath];
        return Promise.resolve(diffInfo);
      });
      repo._hgDiffCache = {
        [PATH_2]: mockDiffInfo,
      };
    });

    describe('::getDiffStatsForPath', () => {
      it('returns diff stats from the cache when possible, and only fetches new diff info for cache misses.', () => {
        waitsForPromise(async () => {
          var diffInfo_1 = await repo.getDiffStatsForPath(PATH_1);
          expect(repo._updateDiffInfo).toHaveBeenCalledWith(PATH_1);
          expect(diffInfo_1).toEqual(mockDiffStats);
          var diffInfo_2 = await repo.getDiffStatsForPath(PATH_2);
          expect(repo._updateDiffInfo).not.toHaveBeenCalledWith(PATH_2);
          expect(diffInfo_2).toEqual(mockDiffStats);
        });
      });
    });

    describe('::getLineDiffsForPath', () => {
      it('returns line diffs from the cache when possible, and only fetches new diff info for cache misses.', () => {
        waitsForPromise(async () => {
          var diffInfo_1 = await repo.getLineDiffsForPath(PATH_1);
          expect(repo._updateDiffInfo).toHaveBeenCalledWith(PATH_1);
          expect(diffInfo_1).toEqual(mockLineDiffs);
          var diffInfo_2 = await repo.getLineDiffsForPath(PATH_2);
          expect(repo._updateDiffInfo).not.toHaveBeenCalledWith(PATH_2);
          expect(diffInfo_2).toEqual(mockLineDiffs);
        });
      });
    });
  });

  describe('::_updateDiffInfo', () => {
    var mockDiffInfo = {
      added: 2,
      deleted: 11,
      lineDiffs: [{
        oldStart: 150,
        oldLines: 11,
        newStart: 150,
        newLines: 2,
      }],
    };

    beforeEach(() => {
      spyOn(repo._service, 'fetchDiffInfo').andCallFake((args, options) => {
        return Promise.resolve(mockDiffInfo);
      });
      spyOn(workingDirectory, 'contains').andCallFake(() => {
        return true;
      });
    });

    it('updates the cache when the path to update is not already being updated.', () => {
      waitsForPromise(async () => {
        expect(repo._hgDiffCache[PATH_1]).toBeUndefined();
        await repo._updateDiffInfo(PATH_1);
        expect(repo._hgDiffCache[PATH_1]).toEqual(mockDiffInfo);
      });
    });

    it('does not update the cache when the path to update is already being updated.', () => {
      waitsForPromise(async () => {
        repo._updateDiffInfo(PATH_1);
        // This second call should not kick off a second `hg diff` call, because
        // the first one should be still running.
        repo._updateDiffInfo(PATH_1);
        expect(repo._service.fetchDiffInfo.calls.length).toBe(1);
      });
    });

    it('removes paths that are marked for removal from the cache.', () => {
      // Set up some mock paths to be removed. One already exists in the cache,
      // the other is going to be attempted to be updated. Both should be removed.
      var testPathToRemove1 = PATH_1;
      var testPathToRemove2 = PATH_2;
      repo._hgDiffCache[testPathToRemove1] = 'fake data';
      repo._hgDiffCacheFilesToClear.add(testPathToRemove1);
      repo._hgDiffCacheFilesToClear.add(testPathToRemove2);

      waitsForPromise(async () => {
        await repo._updateDiffInfo(testPathToRemove2);
        expect(repo._hgDiffCache[testPathToRemove1]).not.toBeDefined();
        expect(repo._hgDiffCache[testPathToRemove2]).not.toBeDefined();
      });
    });
  });

  describe('::getDirectoryStatus', () => {
    var testDir = createFilePath('subDirectory');
    var directoriesBetween = path.join('dir1', 'dir2');
    var path_1 = path.join(testDir, directoriesBetween, 'test1.js');
    var path_2 = path.join(testDir, directoriesBetween, 'test2.js');
    var path_3 = path.join(testDir, directoriesBetween, 'test3.js');

    it('marks a directory as modified if there is any modified file within it.', () => {
      // Force the state of the hgStatusCache.
      repo._hgStatusCache = {
        [path_1]: StatusCodeId.MODIFIED,
        [path_2]: StatusCodeId.ADDED,
      };
      expect(repo.getDirectoryStatus(testDir)).toBe(StatusCodeNumber.MODIFIED);
      expect(repo.getDirectoryStatus(path.join(testDir, 'dir1'))).toBe(StatusCodeNumber.MODIFIED);
      expect(repo.getDirectoryStatus(path.join(testDir, 'dir1', 'dir2'))).toBe(StatusCodeNumber.MODIFIED);
    });

    it('marks a directory as clean if there are no modified files within it.', () => {
      // Force the state of the hgStatusCache.
      repo._hgStatusCache = {
        [path_1]: StatusCodeId.ADDED,
        [path_2]: StatusCodeId.IGNORED,
        [path_3]: StatusCodeId.UNTRACKED,
      };
      expect(repo.getDirectoryStatus(testDir)).toBe(StatusCodeNumber.CLEAN);
      expect(repo.getDirectoryStatus(path.join(testDir, 'dir1'))).toBe(StatusCodeNumber.CLEAN);
      expect(repo.getDirectoryStatus(path.join(testDir, 'dir1', 'dir2'))).toBe(StatusCodeNumber.CLEAN);
    });

    it('handles a null or undefined input "path" but handles paths with those names.', () => {
      var dir_called_null = createFilePath('null');
      var dir_called_undefined = createFilePath('undefined');
      var path_within_null = path.join(dir_called_null, 'test1.js');
      var path_within_undefined = path.join(dir_called_undefined, 'test1.js');

      // Force the state of the cache.
      repo._hgStatusCache = {
        [path_within_null]: StatusCodeId.MODIFIED,
        [path_within_undefined]: StatusCodeId.MODIFIED,
      };
      expect(repo.getDirectoryStatus(null)).toBe(StatusCodeNumber.CLEAN);
      expect(repo.getDirectoryStatus(undefined)).toBe(StatusCodeNumber.CLEAN);
      expect(repo.getDirectoryStatus(dir_called_null)).toBe(StatusCodeNumber.MODIFIED);
      expect(repo.getDirectoryStatus(dir_called_undefined)).toBe(StatusCodeNumber.MODIFIED);
    });
  });

  describe('::getCachedPathStatus/::getPathStatus', () => {
    it('handles a null or undefined input "path" but handles paths with those names.', () => {
      // Force the state of the cache.
      repo._hgStatusCache = {
        [PATH_CALLED_NULL]: StatusCodeId.MODIFIED,
        [PATH_CALLED_UNDEFINED]: StatusCodeId.MODIFIED,
      };
      expect(repo.getCachedPathStatus(null)).toBe(StatusCodeNumber.CLEAN);
      expect(repo.getCachedPathStatus(undefined)).toBe(StatusCodeNumber.CLEAN);
      expect(repo.getCachedPathStatus(PATH_CALLED_NULL)).toBe(StatusCodeNumber.MODIFIED);
      expect(repo.getCachedPathStatus(PATH_CALLED_UNDEFINED)).toBe(StatusCodeNumber.MODIFIED);
    });
  });

  describe('::isStatusModified', () => {
    it('returns false for a null or undefined input.', () => {
      expect(repo.isStatusModified(null)).toBe(false);
      expect(repo.isStatusModified(undefined)).toBe(false);
    });
  });

  describe('::isStatusNew', () => {
    it('returns false for a null or undefined input.', () => {
      expect(repo.isStatusNew(null)).toBe(false);
      expect(repo.isStatusNew(undefined)).toBe(false);
    });
  });

  describe('::getDiffStats', () => {
    it('returns clean stats if the path is null or undefined, but handles paths with those names.', () => {
      var mockDiffInfo = {
        added: 1,
        deleted: 1,
        lineDiffs: [{
          oldStart: 2,
          oldLines: 1,
          newStart: 2,
          newLines: 1,
        }],
      };
      // Force the state of the cache.
      repo._hgDiffCache = {
        [PATH_CALLED_NULL]: mockDiffInfo,
        [PATH_CALLED_UNDEFINED]: mockDiffInfo,
      };
      var cleanStats = {added: 0, deleted: 0};
      var expectedChangeStats = {added: 1, deleted: 1};
      expect(repo.getDiffStats(null)).toEqual(cleanStats);
      expect(repo.getDiffStats(undefined)).toEqual(cleanStats);
      expect(repo.getDiffStats(PATH_CALLED_NULL)).toEqual(expectedChangeStats);
      expect(repo.getDiffStats(PATH_CALLED_UNDEFINED)).toEqual(expectedChangeStats);
    });
  });

  describe('::getLineDiffs', () => {
    it('returns an empty array if the path is null or undefined, but handles paths with those names.', () => {
      var mockDiffInfo = {
        added: 1,
        deleted: 1,
        lineDiffs: [{
          oldStart: 2,
          oldLines: 1,
          newStart: 2,
          newLines: 1,
        }],
      };
      // Force the state of the cache.
      repo._hgDiffCache = {
        [PATH_CALLED_NULL]: mockDiffInfo,
        [PATH_CALLED_UNDEFINED]: mockDiffInfo,
      };
      // For now the second argument, 'text', is not used.
      expect(repo.getLineDiffs(null, null)).toEqual([]);
      expect(repo.getLineDiffs(undefined, null)).toEqual([]);
      expect(repo.getLineDiffs(PATH_CALLED_NULL, null)).toEqual(mockDiffInfo.lineDiffs);
      expect(repo.getLineDiffs(PATH_CALLED_UNDEFINED, null)).toEqual(mockDiffInfo.lineDiffs);
    });
  });

  describe('::destroy', () => {
    it('should do cleanup without throwing an exception.', () => {
      var spy = jasmine.createSpy();
      repo.onDidDestroy(spy);
      repo.destroy();
      expect(spy).toHaveBeenCalled();
    });
  });

});
