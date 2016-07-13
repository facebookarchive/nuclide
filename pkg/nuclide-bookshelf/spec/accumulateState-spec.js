'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  AddProjectRepositoryAction,
  BookShelfRepositoryState,
  BookShelfState,
  RemoveProjectRepositoryAction,
} from '../lib/types';

import {accumulateState} from '../lib/accumulateState';
import {ActionType, EMPTY_SHORTHEAD} from '../lib/constants';
import {getEmptBookShelfState} from '../lib/utils';
import Immutable from 'immutable';

describe('BookShelf accumulateState', () => {

  let fakeRepository: atom$Repository = (null: any);
  const REPO_PATH_1 = '/fake/path_1';
  const SHOTHEAD_1_1 = 'foo';
  const SHOTHEAD_1_2 = 'bar';
  const ACTIVE_SHOTHEAD_1 = 'bar';
  const REPO_STATE_1 = {
    activeShortHead: ACTIVE_SHOTHEAD_1,
    isRestoring: false,
    shortHeadsToFileList: Immutable.Map([
      [SHOTHEAD_1_1, ['c.txt', 'd.txt']],
      [SHOTHEAD_1_2, ['e.txt']],
    ]),
  };

  let emptyState: BookShelfState = (null: any);
  let oneRepoState: BookShelfState = (null: any);

  beforeEach(() => {
    fakeRepository = ({getWorkingDirectory: jasmine.createSpy().andReturn(REPO_PATH_1)}: any);
    // a deepFreeze utility would have been better here.
    emptyState = Object.freeze(getEmptBookShelfState());

    oneRepoState = Object.freeze({
      repositoryPathToState: Immutable.Map([[REPO_PATH_1, REPO_STATE_1]]),
    });
  });

  describe('ADD_PROJECT_REPOSITORY', () => {
    it('adds an empty repository to the bookshelf state', () => {
      const addRepositoryAction: AddProjectRepositoryAction = {
        payload: {
          repository: fakeRepository,
        },
        type: ActionType.ADD_PROJECT_REPOSITORY,
      };
      const newState = accumulateState(emptyState, addRepositoryAction);
      expect(fakeRepository.getWorkingDirectory).toHaveBeenCalled();
      expect(emptyState.repositoryPathToState.size).toBe(0);
      expect(newState.repositoryPathToState.size).toBe(1);
      const addedRepoState: BookShelfRepositoryState
        = newState.repositoryPathToState.get(REPO_PATH_1);
      expect(addedRepoState).toBeDefined();
      expect(addedRepoState.activeShortHead).toBe(EMPTY_SHORTHEAD);
      expect(addedRepoState.isRestoring).toBeFalsy();
      expect(addedRepoState.shortHeadsToFileList.size).toBe(0);
    });

    it('keeps the existing state when it\'s there', () => {
      expect(oneRepoState.repositoryPathToState.size).toBe(1);
      const addRepositoryAction: AddProjectRepositoryAction = {
        payload: {
          repository: fakeRepository,
        },
        type: ActionType.ADD_PROJECT_REPOSITORY,
      };
      const newState = accumulateState(oneRepoState, addRepositoryAction);
      expect(fakeRepository.getWorkingDirectory).toHaveBeenCalled();
      expect(newState.repositoryPathToState.size).toBe(1);
      const keptRepoState: BookShelfRepositoryState
        = newState.repositoryPathToState.get(REPO_PATH_1);
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
      const removeRepositoryAction: RemoveProjectRepositoryAction = {
        payload: {
          repository: fakeRepository,
        },
        type: ActionType.REMOVE_PROJECT_REPOSITORY,
      };
      const newState = accumulateState(emptyState, removeRepositoryAction);
      expect(fakeRepository.getWorkingDirectory).toHaveBeenCalled();
      expect(oneRepoState.repositoryPathToState.size).toBe(1);
      expect(newState.repositoryPathToState.size).toBe(0);
    });

    it('no-op when no existing tracked state', () => {
      const removeRepositoryAction: RemoveProjectRepositoryAction = {
        payload: {
          repository: fakeRepository,
        },
        type: ActionType.REMOVE_PROJECT_REPOSITORY,
      };
      const newState = accumulateState(emptyState, removeRepositoryAction);
      expect(fakeRepository.getWorkingDirectory).toHaveBeenCalled();
      expect(newState.repositoryPathToState).toBe(emptyState.repositoryPathToState);
    });
  });
});
