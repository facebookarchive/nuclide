'use strict';

var _accumulateState;

function _load_accumulateState() {
  return _accumulateState = require('../lib/accumulateState');
}

var _constants;

function _load_constants() {
  return _constants = require('../lib/constants');
}

var _utils;

function _load_utils() {
  return _utils = require('../lib/utils');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('BookShelf accumulateState', () => {
  let fakeRepository = null;
  const REPO_PATH_1 = '/fake/path_1';
  const SHOTHEAD_1_1 = 'foo';
  const SHOTHEAD_1_2 = 'bar';
  const ACTIVE_SHOTHEAD_1 = SHOTHEAD_1_1;
  const REPO_STATE_1 = {
    activeShortHead: ACTIVE_SHOTHEAD_1,
    isRestoring: false,
    shortHeadsToFileList: (_immutable || _load_immutable()).Map([[SHOTHEAD_1_1, ['c.txt', 'd.txt']], [SHOTHEAD_1_2, ['e.txt']]])
  };

  let emptyState = null;
  let oneRepoState = null;

  beforeEach(() => {
    fakeRepository = {
      getWorkingDirectory: jest.fn().mockReturnValue(REPO_PATH_1)
    };
    // a deepFreeze utility would have been better here.
    emptyState = Object.freeze((0, (_utils || _load_utils()).getEmptBookShelfState)());

    oneRepoState = Object.freeze({
      repositoryPathToState: (_immutable || _load_immutable()).Map([[REPO_PATH_1, REPO_STATE_1]])
    });
  });

  describe('ADD_PROJECT_REPOSITORY', () => {
    it('adds an empty repository to the bookshelf state', () => {
      const addRepositoryAction = {
        payload: {
          repository: fakeRepository
        },
        type: (_constants || _load_constants()).ActionType.ADD_PROJECT_REPOSITORY
      };
      const newState = (0, (_accumulateState || _load_accumulateState()).accumulateState)(emptyState, addRepositoryAction);
      expect(fakeRepository.getWorkingDirectory).toHaveBeenCalled();
      expect(emptyState.repositoryPathToState.size).toBe(0);
      expect(newState.repositoryPathToState.size).toBe(1);
      const addedRepoState = (0, (_nullthrows || _load_nullthrows()).default)(newState.repositoryPathToState.get(REPO_PATH_1));
      expect(addedRepoState).toBeDefined();
      expect(addedRepoState.activeShortHead).toBe((_constants || _load_constants()).EMPTY_SHORTHEAD);
      expect(addedRepoState.isRestoring).toBeFalsy();
      expect(addedRepoState.shortHeadsToFileList.size).toBe(0);
    });

    it("keeps the existing state when it's there", () => {
      expect(oneRepoState.repositoryPathToState.size).toBe(1);
      const addRepositoryAction = {
        payload: {
          repository: fakeRepository
        },
        type: (_constants || _load_constants()).ActionType.ADD_PROJECT_REPOSITORY
      };
      const newState = (0, (_accumulateState || _load_accumulateState()).accumulateState)(oneRepoState, addRepositoryAction);
      expect(fakeRepository.getWorkingDirectory).toHaveBeenCalled();
      expect(newState.repositoryPathToState.size).toBe(1);
      const keptRepoState = (0, (_nullthrows || _load_nullthrows()).default)(newState.repositoryPathToState.get(REPO_PATH_1));
      expect(keptRepoState).toBeDefined();
      expect(keptRepoState.activeShortHead).toBe(ACTIVE_SHOTHEAD_1);
      expect(keptRepoState.isRestoring).toBeFalsy();
      expect(keptRepoState.shortHeadsToFileList.size).toBe(2);
      expect(keptRepoState.shortHeadsToFileList.get(SHOTHEAD_1_1)).toEqual(['c.txt', 'd.txt']);
      expect(keptRepoState.shortHeadsToFileList.get(SHOTHEAD_1_2)).toEqual(['e.txt']);
    });
  });

  describe('REMOVE_PROJECT_REPOSITORY', () => {
    it('removes the managed state of the repository', () => {
      expect(oneRepoState.repositoryPathToState.size).toBe(1);
      const removeRepositoryAction = {
        payload: {
          repository: fakeRepository
        },
        type: (_constants || _load_constants()).ActionType.REMOVE_PROJECT_REPOSITORY
      };
      const newState = (0, (_accumulateState || _load_accumulateState()).accumulateState)(emptyState, removeRepositoryAction);
      expect(fakeRepository.getWorkingDirectory).toHaveBeenCalled();
      expect(oneRepoState.repositoryPathToState.size).toBe(1);
      expect(newState.repositoryPathToState.size).toBe(0);
    });

    it('no-op when no existing tracked state', () => {
      const removeRepositoryAction = {
        payload: {
          repository: fakeRepository
        },
        type: (_constants || _load_constants()).ActionType.REMOVE_PROJECT_REPOSITORY
      };
      const newState = (0, (_accumulateState || _load_accumulateState()).accumulateState)(emptyState, removeRepositoryAction);
      expect(fakeRepository.getWorkingDirectory).toHaveBeenCalled();
      expect(newState.repositoryPathToState).toBe(emptyState.repositoryPathToState);
    });
  });

  describe('UPDATE_REPOSITORY_BOOKMARKS', () => {
    it('creates a repository with bookmark state, if no one exists', () => {
      const updateBookmarksAction = {
        payload: {
          repository: fakeRepository,
          bookmarkNames: new Set(['a', 'b', 'c']),
          activeShortHead: 'a'
        },
        type: (_constants || _load_constants()).ActionType.UPDATE_REPOSITORY_BOOKMARKS
      };
      const newState = (0, (_accumulateState || _load_accumulateState()).accumulateState)(emptyState, updateBookmarksAction);
      expect(emptyState.repositoryPathToState.size).toBe(0);
      expect(newState.repositoryPathToState.size).toBe(1);
      const newRepositoryState = (0, (_nullthrows || _load_nullthrows()).default)(newState.repositoryPathToState.get(REPO_PATH_1));
      expect(newRepositoryState.activeShortHead).toBe('a');
      expect(newRepositoryState.isRestoring).toBe(false);
      expect(newRepositoryState.shortHeadsToFileList.size).toBe(0);
    });

    it('removes old cached short head data when its bookmarks are gone', () => {
      const updateBookmarksAction = {
        payload: {
          repository: fakeRepository,
          bookmarkNames: new Set([SHOTHEAD_1_2]),
          activeShortHead: SHOTHEAD_1_2
        },
        type: (_constants || _load_constants()).ActionType.UPDATE_REPOSITORY_BOOKMARKS
      };
      const oldRpositoryState = oneRepoState.repositoryPathToState.get(REPO_PATH_1);
      expect((0, (_nullthrows || _load_nullthrows()).default)(oldRpositoryState).shortHeadsToFileList.size).toBe(2);
      expect((0, (_nullthrows || _load_nullthrows()).default)(oldRpositoryState).shortHeadsToFileList.has(SHOTHEAD_1_1)).toBeTruthy();

      const newState = (0, (_accumulateState || _load_accumulateState()).accumulateState)(oneRepoState, updateBookmarksAction);
      expect(newState.repositoryPathToState.size).toBe(1);

      const newRepositoryState = (0, (_nullthrows || _load_nullthrows()).default)(newState.repositoryPathToState.get(REPO_PATH_1));
      expect(newRepositoryState.activeShortHead).toBe(SHOTHEAD_1_2);
      expect(newRepositoryState.isRestoring).toBe(false);
      expect(newRepositoryState.shortHeadsToFileList.size).toBe(1);
      expect(newRepositoryState.shortHeadsToFileList.has(SHOTHEAD_1_1)).toBeFalsy();
      expect(newRepositoryState.shortHeadsToFileList.get(SHOTHEAD_1_2)).toEqual((0, (_nullthrows || _load_nullthrows()).default)(oldRpositoryState).shortHeadsToFileList.get(SHOTHEAD_1_2));
    });
  });

  describe('UDATE_PANE_ITEM_STATE', () => {
    const OTHER_REPO_PARH = '/another/repo/path';
    let fakeEditor1 = null;
    let fakeEditor2 = null;
    let fakeEditor3 = null;

    function createFakeEditor(editorPath) {
      // $FlowFixMe
      return {
        getPath: jest.fn().mockReturnValue(editorPath)
      };
    }

    beforeEach(() => {
      fakeEditor1 = createFakeEditor('file1.txt');
      fakeEditor2 = createFakeEditor('file2.txt');
      fakeEditor3 = createFakeEditor('file3.txt');
    });

    it('updates the tracked repos states with the new pane item state', () => {
      const updatePaneItemAction = {
        payload: {
          repositoryPathToEditors: new Map([[REPO_PATH_1, [fakeEditor1, fakeEditor2]], [OTHER_REPO_PARH, [fakeEditor3]]])
        },
        type: (_constants || _load_constants()).ActionType.UPDATE_PANE_ITEM_STATE
      };
      const newState = (0, (_accumulateState || _load_accumulateState()).accumulateState)(oneRepoState, updatePaneItemAction);

      const oldShortHeadsToFileList = (0, (_nullthrows || _load_nullthrows()).default)(oneRepoState.repositoryPathToState.get(REPO_PATH_1)).shortHeadsToFileList;
      expect(oldShortHeadsToFileList.size).toBe(2);
      expect(oldShortHeadsToFileList.get(SHOTHEAD_1_1)).toEqual(['c.txt', 'd.txt']);

      // Doesn't add untracked repos.
      expect(newState.repositoryPathToState.size).toBe(1);

      const newShortHeadsToFileList = (0, (_nullthrows || _load_nullthrows()).default)(newState.repositoryPathToState.get(REPO_PATH_1)).shortHeadsToFileList;
      expect(newShortHeadsToFileList.size).toBe(2);
      expect(newShortHeadsToFileList.get(SHOTHEAD_1_1)).toEqual(['file1.txt', 'file2.txt']);
      expect(newShortHeadsToFileList.get(SHOTHEAD_1_2)).toEqual(['e.txt']);
    });
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */