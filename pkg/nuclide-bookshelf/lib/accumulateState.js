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
  Action,
  AddProjectRepositoryAction,
  BookShelfRepositoryState,
  BookShelfState,
  RemoveProjectRepositoryAction,
} from './types';

import {ActionType, EMPTY_SHORTHEAD} from './constants';
import Immutable from 'immutable';

function getEmptyRepositoryState(): BookShelfRepositoryState {
  return {
    activeShortHead: EMPTY_SHORTHEAD,
    isRestoring: false,
    shortHeadsToFileList: Immutable.Map(),
  };
}

export function accumulateState(
  state: BookShelfState,
  action: Action,
): BookShelfState {
  switch (action.type) {
    case ActionType.ADD_PROJECT_REPOSITORY:
      return accumulateAddProjectRepository(state, action);

    case ActionType.REMOVE_PROJECT_REPOSITORY:
      return accumulateRemoveProjectRepository(state, action);

    default:
      return state;
  }
}

function accumulateAddProjectRepository(
  state: BookShelfState,
  action: AddProjectRepositoryAction,
): BookShelfState {

  const repositoryPath = action.payload.repository.getWorkingDirectory();
  const newRepositoryState =
    state.repositoryPathToState.get(repositoryPath) ||
    getEmptyRepositoryState();
  return {
    ...state,
    repositoryPathToState: state.repositoryPathToState
        .set(repositoryPath, newRepositoryState),
  };
}

function accumulateRemoveProjectRepository(
  state: BookShelfState,
  action: RemoveProjectRepositoryAction,
): BookShelfState {

  const repositoryPath = action.payload.repository.getWorkingDirectory();
  return {
    ...state,
    repositoryPathToState: state.repositoryPathToState.delete(repositoryPath),
  };
}
