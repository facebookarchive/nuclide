"use strict";

var _atom = require("atom");

function _HgRepositoryClient() {
  const data = require("../lib/HgRepositoryClient");

  _HgRepositoryClient = function () {
    return data;
  };

  return data;
}

function _MockHgService() {
  const data = _interopRequireDefault(require("../../nuclide-hg-rpc/__mocks__/MockHgService"));

  _MockHgService = function () {
    return data;
  };

  return data;
}

function _hgConstants() {
  const data = require("../../nuclide-hg-rpc/lib/hg-constants");

  _hgConstants = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
    return data;
  };

  return data;
}

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
 * @emails oncall+nuclide
 */
_temp().default.track();

describe('HgRepositoryClient', () => {
  const tempDir = _temp().default.mkdirSync('testproj');

  const tempSubDir = _temp().default.mkdirSync({
    dir: tempDir
  });

  const repoPath = _nuclideUri().default.join(tempDir, '.hg');

  const projectDirectory = new _atom.Directory(tempSubDir);
  const repoOptions = {
    originURL: 'http://test.com/testproj',
    workingDirectoryPath: tempDir,
    projectDirectoryPath: tempSubDir
  }; // Manufactures the absolute path of a file that should pass as being
  // within the repo.

  const createFilePath = filename => {
    return _nuclideUri().default.join(projectDirectory.getPath(), filename);
  }; // Some test "absolute" paths.


  const PATH_1 = createFilePath('test1.js');
  const PATH_2 = createFilePath('test2.js');
  const PATH_3 = createFilePath('test3.js');
  const PATH_4 = createFilePath('test4.js');
  const PATH_5 = createFilePath('test5.js');
  const PATH_6 = createFilePath('test6.js');
  const PATH_7 = createFilePath('test7.js');
  const PATH_CALLED_NULL = createFilePath('null');
  const PATH_CALLED_UNDEFINED = createFilePath('undefined');
  let mockHgService = null;
  let repo = null;
  beforeEach(() => {
    mockHgService = new (_MockHgService().default)();
    repo = new (_HgRepositoryClient().HgRepositoryClient)(repoPath, mockHgService, repoOptions);
  });
  describe('::getType()', () => {
    it('returns "hg"', () => {
      expect(repo.getType()).toBe('hg');
    });
  });
  describe('::getProjectDirectory', () => {
    it('returns the path of the root project folder in Atom that this Client provides information' + ' about.', () => {
      expect(repo.getProjectDirectory()).toBe(projectDirectory.getPath());
    });
  });
  describe('::isPathIgnored', () => {
    it('returns true if the path is marked ignored in the cache.', () => {
      // Force the state of the cache.
      repo._sharedMembers.hgStatusCache = new Map([[PATH_1, _hgConstants().StatusCodeNumber.IGNORED]]);
      expect(repo.isPathIgnored(PATH_1)).toBe(true);
    });
    it('returns true if the path is, or is within, the .hg directory.', () => {
      expect(repo.isPathIgnored(repoPath)).toBe(true);
      expect(repo.isPathIgnored(_nuclideUri().default.join(repoPath, 'blah'))).toBe(true);
    });
    it('returns false if the path is not in the cache and is not the .hg directory.', () => {
      expect(repo.isPathIgnored('/A/Random/Path')).toBe(false);

      const parsedPath = _nuclideUri().default.parsePath(repoPath);

      expect(repo.isPathIgnored(parsedPath.root)).toBe(false);
      expect(repo.isPathIgnored(parsedPath.dir)).toBe(false);
    });
    it('returns false if the path is null or undefined, but handles files with those' + ' names.', () => {
      // Force the state of the cache.
      repo._sharedMembers.hgStatusCache = new Map([[PATH_CALLED_NULL, _hgConstants().StatusCodeNumber.IGNORED], [PATH_CALLED_UNDEFINED, _hgConstants().StatusCodeNumber.IGNORED]]);
      expect(repo.isPathIgnored(null)).toBe(false);
      expect(repo.isPathIgnored(undefined)).toBe(false);
      expect(repo.isPathIgnored(PATH_CALLED_NULL)).toBe(true);
      expect(repo.isPathIgnored(PATH_CALLED_UNDEFINED)).toBe(true);
    });
  });
  describe('::isPathNew', () => {
    it('returns false if the path is null or undefined, but handles files with those' + ' names.', () => {
      // Force the state of the cache.
      repo._sharedMembers.hgStatusCache = new Map([[PATH_CALLED_NULL, _hgConstants().StatusCodeNumber.ADDED], [PATH_CALLED_UNDEFINED, _hgConstants().StatusCodeNumber.ADDED]]);
      expect(repo.isPathNew(null)).toBe(false);
      expect(repo.isPathNew(undefined)).toBe(false);
      expect(repo.isPathNew(PATH_CALLED_NULL)).toBe(true);
      expect(repo.isPathNew(PATH_CALLED_UNDEFINED)).toBe(true);
    });
  });
  describe('::isPathModified', () => {
    it('returns false if the path is null or undefined, but handles files with those' + ' names.', () => {
      // Force the state of the cache.
      repo._sharedMembers.hgStatusCache = new Map([[PATH_CALLED_NULL, _hgConstants().StatusCodeNumber.MODIFIED], [PATH_CALLED_UNDEFINED, _hgConstants().StatusCodeNumber.MODIFIED]]);
      expect(repo.isPathModified(null)).toBe(false);
      expect(repo.isPathModified(undefined)).toBe(false);
      expect(repo.isPathModified(PATH_CALLED_NULL)).toBe(true);
      expect(repo.isPathModified(PATH_CALLED_UNDEFINED)).toBe(true);
    });
  });
  describe('::isPathAdded', () => {
    it('returns false if the path is null, untracked, modified or deleted' + ' names.', () => {
      // Force the state of the cache.
      repo._sharedMembers.hgStatusCache = new Map([[PATH_CALLED_NULL, _hgConstants().StatusCodeNumber.ADDED], [PATH_CALLED_UNDEFINED, _hgConstants().StatusCodeNumber.ADDED], [PATH_1, _hgConstants().StatusCodeNumber.ADDED], [PATH_2, _hgConstants().StatusCodeNumber.CLEAN], [PATH_3, _hgConstants().StatusCodeNumber.IGNORED], [PATH_4, _hgConstants().StatusCodeNumber.MISSING], [PATH_5, _hgConstants().StatusCodeNumber.MODIFIED], [PATH_6, _hgConstants().StatusCodeNumber.REMOVED], [PATH_7, _hgConstants().StatusCodeNumber.UNTRACKED]]);
      expect(repo.isPathAdded(null)).toBe(false);
      expect(repo.isPathAdded(undefined)).toBe(false);
      expect(repo.isPathAdded(PATH_CALLED_NULL)).toBe(true);
      expect(repo.isPathAdded(PATH_CALLED_UNDEFINED)).toBe(true);
      expect(repo.isPathAdded(PATH_1)).toBe(true);
      expect(repo.isPathAdded(PATH_2)).toBe(false);
      expect(repo.isPathAdded(PATH_3)).toBe(false);
      expect(repo.isPathAdded(PATH_4)).toBe(false);
      expect(repo.isPathAdded(PATH_5)).toBe(false);
      expect(repo.isPathAdded(PATH_6)).toBe(false);
      expect(repo.isPathAdded(PATH_7)).toBe(false);
    });
  });
  describe('::isPathUntracked', () => {
    it('returns false if the path is null, untracked, modified or deleted' + ' names.', () => {
      // Force the state of the cache.
      repo._sharedMembers.hgStatusCache = new Map([[PATH_CALLED_NULL, _hgConstants().StatusCodeNumber.UNTRACKED], [PATH_CALLED_UNDEFINED, _hgConstants().StatusCodeNumber.UNTRACKED], [PATH_1, _hgConstants().StatusCodeNumber.UNTRACKED], [PATH_2, _hgConstants().StatusCodeNumber.CLEAN], [PATH_3, _hgConstants().StatusCodeNumber.IGNORED], [PATH_4, _hgConstants().StatusCodeNumber.MISSING], [PATH_5, _hgConstants().StatusCodeNumber.MODIFIED], [PATH_6, _hgConstants().StatusCodeNumber.REMOVED], [PATH_7, _hgConstants().StatusCodeNumber.ADDED]]);
      expect(repo.isPathUntracked(null)).toBe(false);
      expect(repo.isPathUntracked(undefined)).toBe(false);
      expect(repo.isPathUntracked(PATH_CALLED_NULL)).toBe(true);
      expect(repo.isPathUntracked(PATH_CALLED_UNDEFINED)).toBe(true);
      expect(repo.isPathUntracked(PATH_1)).toBe(true);
      expect(repo.isPathUntracked(PATH_2)).toBe(false);
      expect(repo.isPathUntracked(PATH_3)).toBe(false);
      expect(repo.isPathUntracked(PATH_4)).toBe(false);
      expect(repo.isPathUntracked(PATH_5)).toBe(false);
      expect(repo.isPathUntracked(PATH_6)).toBe(false);
      expect(repo.isPathUntracked(PATH_7)).toBe(false);
    });
  });
  describe('::getCachedPathStatus', () => {
    beforeEach(() => {
      repo._sharedMembers.hgStatusCache = new Map([[PATH_1, _hgConstants().StatusCodeNumber.MODIFIED], [PATH_2, _hgConstants().StatusCodeNumber.IGNORED]]);
    });
    it('retrieves cached hg status.', () => {
      // Force the state of the cache.
      const status = repo.getCachedPathStatus(PATH_1);
      expect(repo.isStatusModified(status)).toBe(true);
      expect(repo.isStatusNew(status)).toBe(false);
    });
    it('retrieves cached hg ignore status.', () => {
      const status = repo.getCachedPathStatus(PATH_2); // The status codes have no meaning; just test the expected translated
      // meanings.

      expect(repo.isStatusModified(status)).toBe(false);
      expect(repo.isStatusNew(status)).toBe(false);
    });
    it('returns a clean status by default.', () => {
      const status = repo.getCachedPathStatus('path-not-in-cache'); // The status codes have no meaning; just test the expected translated
      // meanings.

      expect(repo.isStatusModified(status)).toBe(false);
      expect(repo.isStatusNew(status)).toBe(false);
    });
  });
  describe('::getCachedPathStatus/::getPathStatus', () => {
    it('handles a null or undefined input "path" but handles paths with those names.', () => {
      // Force the state of the cache.
      repo._sharedMembers.hgStatusCache = new Map([[PATH_CALLED_NULL, _hgConstants().StatusCodeNumber.MODIFIED], [PATH_CALLED_UNDEFINED, _hgConstants().StatusCodeNumber.MODIFIED]]);
      expect(repo.getCachedPathStatus(null)).toBe(_hgConstants().StatusCodeNumber.CLEAN);
      expect(repo.getCachedPathStatus(undefined)).toBe(_hgConstants().StatusCodeNumber.CLEAN);
      expect(repo.getCachedPathStatus(PATH_CALLED_NULL)).toBe(_hgConstants().StatusCodeNumber.MODIFIED);
      expect(repo.getCachedPathStatus(PATH_CALLED_UNDEFINED)).toBe(_hgConstants().StatusCodeNumber.MODIFIED);
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
  describe('::destroy', () => {
    it('should do cleanup without throwing an exception.', () => {
      const spy = jest.fn();
      repo.onDidDestroy(spy);
      repo.destroy();
      expect(spy).toHaveBeenCalled();
    });
  });
});