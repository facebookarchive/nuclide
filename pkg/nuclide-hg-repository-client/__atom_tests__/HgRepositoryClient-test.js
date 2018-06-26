'use strict';

var _atom = require('atom');

var _HgRepositoryClient;

function _load_HgRepositoryClient() {
  return _HgRepositoryClient = require('../lib/HgRepositoryClient');
}

var _MockHgService;

function _load_MockHgService() {
  return _MockHgService = _interopRequireDefault(require('../../nuclide-hg-rpc/__mocks__/MockHgService'));
}

var _hgConstants;

function _load_hgConstants() {
  return _hgConstants = require('../../nuclide-hg-rpc/lib/hg-constants');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(_temp || _load_temp()).default.track(); /**
                                          * Copyright (c) 2015-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the license found in the LICENSE file in
                                          * the root directory of this source tree.
                                          *
                                          * 
                                          * @format
                                          */

describe('HgRepositoryClient', () => {
  const tempDir = (_temp || _load_temp()).default.mkdirSync('testproj');
  const tempSubDir = (_temp || _load_temp()).default.mkdirSync({ dir: tempDir });

  const repoPath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, '.hg');
  const workingDirectory = new _atom.Directory(tempDir);
  const projectDirectory = new _atom.Directory(tempSubDir);
  const repoOptions = {
    originURL: 'http://test.com/testproj',
    workingDirectoryPath: tempDir,
    projectDirectoryPath: tempSubDir
  };

  // Manufactures the absolute path of a file that should pass as being
  // within the repo.
  const createFilePath = filename => {
    return (_nuclideUri || _load_nuclideUri()).default.join(projectDirectory.getPath(), filename);
  };

  // Some test "absolute" paths.
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
    mockHgService = new (_MockHgService || _load_MockHgService()).default();
    repo = new (_HgRepositoryClient || _load_HgRepositoryClient()).HgRepositoryClient(repoPath, mockHgService, repoOptions);
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
      repo._sharedMembers.hgStatusCache = new Map([[PATH_1, (_hgConstants || _load_hgConstants()).StatusCodeNumber.IGNORED]]);
      expect(repo.isPathIgnored(PATH_1)).toBe(true);
    });

    it('returns true if the path is, or is within, the .hg directory.', () => {
      expect(repo.isPathIgnored(repoPath)).toBe(true);
      expect(repo.isPathIgnored((_nuclideUri || _load_nuclideUri()).default.join(repoPath, 'blah'))).toBe(true);
    });

    it('returns false if the path is not in the cache and is not the .hg directory.', () => {
      expect(repo.isPathIgnored('/A/Random/Path')).toBe(false);
      const parsedPath = (_nuclideUri || _load_nuclideUri()).default.parsePath(repoPath);
      expect(repo.isPathIgnored(parsedPath.root)).toBe(false);
      expect(repo.isPathIgnored(parsedPath.dir)).toBe(false);
    });

    it('returns false if the path is null or undefined, but handles files with those' + ' names.', () => {
      // Force the state of the cache.
      repo._sharedMembers.hgStatusCache = new Map([[PATH_CALLED_NULL, (_hgConstants || _load_hgConstants()).StatusCodeNumber.IGNORED], [PATH_CALLED_UNDEFINED, (_hgConstants || _load_hgConstants()).StatusCodeNumber.IGNORED]]);
      expect(repo.isPathIgnored(null)).toBe(false);
      expect(repo.isPathIgnored(undefined)).toBe(false);
      expect(repo.isPathIgnored(PATH_CALLED_NULL)).toBe(true);
      expect(repo.isPathIgnored(PATH_CALLED_UNDEFINED)).toBe(true);
    });
  });

  describe('::isPathNew', () => {
    it('returns false if the path is null or undefined, but handles files with those' + ' names.', () => {
      // Force the state of the cache.
      repo._sharedMembers.hgStatusCache = new Map([[PATH_CALLED_NULL, (_hgConstants || _load_hgConstants()).StatusCodeNumber.ADDED], [PATH_CALLED_UNDEFINED, (_hgConstants || _load_hgConstants()).StatusCodeNumber.ADDED]]);
      expect(repo.isPathNew(null)).toBe(false);
      expect(repo.isPathNew(undefined)).toBe(false);
      expect(repo.isPathNew(PATH_CALLED_NULL)).toBe(true);
      expect(repo.isPathNew(PATH_CALLED_UNDEFINED)).toBe(true);
    });
  });

  describe('::isPathModified', () => {
    it('returns false if the path is null or undefined, but handles files with those' + ' names.', () => {
      // Force the state of the cache.
      repo._sharedMembers.hgStatusCache = new Map([[PATH_CALLED_NULL, (_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED], [PATH_CALLED_UNDEFINED, (_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED]]);
      expect(repo.isPathModified(null)).toBe(false);
      expect(repo.isPathModified(undefined)).toBe(false);
      expect(repo.isPathModified(PATH_CALLED_NULL)).toBe(true);
      expect(repo.isPathModified(PATH_CALLED_UNDEFINED)).toBe(true);
    });
  });

  describe('::isPathAdded', () => {
    it('returns false if the path is null, untracked, modified or deleted' + ' names.', () => {
      // Force the state of the cache.
      repo._sharedMembers.hgStatusCache = new Map([[PATH_CALLED_NULL, (_hgConstants || _load_hgConstants()).StatusCodeNumber.ADDED], [PATH_CALLED_UNDEFINED, (_hgConstants || _load_hgConstants()).StatusCodeNumber.ADDED], [PATH_1, (_hgConstants || _load_hgConstants()).StatusCodeNumber.ADDED], [PATH_2, (_hgConstants || _load_hgConstants()).StatusCodeNumber.CLEAN], [PATH_3, (_hgConstants || _load_hgConstants()).StatusCodeNumber.IGNORED], [PATH_4, (_hgConstants || _load_hgConstants()).StatusCodeNumber.MISSING], [PATH_5, (_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED], [PATH_6, (_hgConstants || _load_hgConstants()).StatusCodeNumber.REMOVED], [PATH_7, (_hgConstants || _load_hgConstants()).StatusCodeNumber.UNTRACKED]]);
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
      repo._sharedMembers.hgStatusCache = new Map([[PATH_CALLED_NULL, (_hgConstants || _load_hgConstants()).StatusCodeNumber.UNTRACKED], [PATH_CALLED_UNDEFINED, (_hgConstants || _load_hgConstants()).StatusCodeNumber.UNTRACKED], [PATH_1, (_hgConstants || _load_hgConstants()).StatusCodeNumber.UNTRACKED], [PATH_2, (_hgConstants || _load_hgConstants()).StatusCodeNumber.CLEAN], [PATH_3, (_hgConstants || _load_hgConstants()).StatusCodeNumber.IGNORED], [PATH_4, (_hgConstants || _load_hgConstants()).StatusCodeNumber.MISSING], [PATH_5, (_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED], [PATH_6, (_hgConstants || _load_hgConstants()).StatusCodeNumber.REMOVED], [PATH_7, (_hgConstants || _load_hgConstants()).StatusCodeNumber.ADDED]]);
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
      repo._sharedMembers.hgStatusCache = new Map([[PATH_1, (_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED], [PATH_2, (_hgConstants || _load_hgConstants()).StatusCodeNumber.IGNORED]]);
    });

    it('retrieves cached hg status.', () => {
      // Force the state of the cache.
      const status = repo.getCachedPathStatus(PATH_1);
      expect(repo.isStatusModified(status)).toBe(true);
      expect(repo.isStatusNew(status)).toBe(false);
    });

    it('retrieves cached hg ignore status.', () => {
      const status = repo.getCachedPathStatus(PATH_2);
      // The status codes have no meaning; just test the expected translated
      // meanings.
      expect(repo.isStatusModified(status)).toBe(false);
      expect(repo.isStatusNew(status)).toBe(false);
    });

    it('returns a clean status by default.', () => {
      const status = repo.getCachedPathStatus('path-not-in-cache');
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
      (_featureConfig || _load_featureConfig()).default.set('nuclide-hg-repository.enableDiffStats', true);
      const workingDirectoryClone = new _atom.Directory(tempDir);
      jest.spyOn(workingDirectory, 'contains').mockImplementation(filePath => {
        const prefix = '/private';
        if (filePath.startsWith(prefix)) {
          const prefixRemovedPath = filePath.slice(prefix.length);
          return workingDirectoryClone.contains(prefixRemovedPath);
        }
        return workingDirectoryClone.contains(filePath);
      });

      const projectDirectoryClone = new _atom.Directory(tempSubDir);
      jest.spyOn(projectDirectory, 'contains').mockImplementation(filePath => {
        const prefix = '/private';
        if (filePath.startsWith(prefix)) {
          const prefixRemovedPath = filePath.slice(prefix.length);
          return projectDirectoryClone.contains(prefixRemovedPath);
        }
        return projectDirectoryClone.contains(filePath);
      });

      jest.spyOn(repo, '_updateDiffInfo').mockReturnValue(_rxjsBundlesRxMinJs.Observable.of('fake'));
      jest.spyOn(repo, '_observePaneItemVisibility').mockReturnValue(_rxjsBundlesRxMinJs.Observable.of(true));
    });
  });

  describe('::_updateDiffInfo', () => {
    const mockDiffInfo = {
      added: 2,
      deleted: 11,
      lineDiffs: [{
        oldStart: 150,
        oldLines: 11,
        newStart: 150,
        newLines: 2
      }]
    };

    beforeEach(() => {
      jest.spyOn(repo, '_getCurrentHeadId').mockReturnValue(_rxjsBundlesRxMinJs.Observable.of('test'));
      jest.spyOn(repo._sharedMembers.service, 'fetchFileContentAtRevision').mockImplementation(filePath => {
        return new _rxjsBundlesRxMinJs.Observable.of('test').publish();
      });
      jest.spyOn(repo, '_getFileDiffs').mockImplementation(pathsToFetch => {
        const diffs = [];
        for (const filePath of pathsToFetch) {
          diffs.push([filePath, mockDiffInfo]);
        }
        return _rxjsBundlesRxMinJs.Observable.of(diffs);
      });
      jest.spyOn(workingDirectory, 'contains').mockImplementation(() => {
        return true;
      });
    });
  });

  describe('::getCachedPathStatus/::getPathStatus', () => {
    it('handles a null or undefined input "path" but handles paths with those names.', () => {
      // Force the state of the cache.
      repo._sharedMembers.hgStatusCache = new Map([[PATH_CALLED_NULL, (_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED], [PATH_CALLED_UNDEFINED, (_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED]]);
      expect(repo.getCachedPathStatus(null)).toBe((_hgConstants || _load_hgConstants()).StatusCodeNumber.CLEAN);
      expect(repo.getCachedPathStatus(undefined)).toBe((_hgConstants || _load_hgConstants()).StatusCodeNumber.CLEAN);
      expect(repo.getCachedPathStatus(PATH_CALLED_NULL)).toBe((_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED);
      expect(repo.getCachedPathStatus(PATH_CALLED_UNDEFINED)).toBe((_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED);
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