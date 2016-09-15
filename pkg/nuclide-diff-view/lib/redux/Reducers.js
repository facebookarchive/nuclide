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
  AppState,
  RepositoryState,
} from '../types';

import * as ActionTypes from './ActionTypes';
import invariant from 'assert';
import {
  DiffOption,
} from '../constants';

export function app(
  state: AppState,
  action: Action,
): AppState {
  switch (action.type) {
    case ActionTypes.SET_DIFF_OPTION: {
      const {repository} = action.payload;
      const oldRepositoryState = state.repositoriesStates.get(repository);
      invariant(oldRepositoryState != null);
      return {
        ...state,
        repositoriesStates: new Map(state.repositoriesStates)
          .set(repository, reduceRepositoryAction(oldRepositoryState, action)),
      };
    }
    case ActionTypes.ADD_REPOSITORY: {
      const {repository} = action.payload;
      return {
        ...state,
        repositoriesStates: new Map(state.repositoriesStates)
          .set(repository, getEmptyRepositoryState()),
      };
    }
    default: {
      return state;
    }
  }
}

function getEmptyRepositoryState(): RepositoryState {
  return {
    diffOption: DiffOption.DIRTY,
    revisionStatuses: new Map(),
    dirtyFileChanges: new Map(),
    headToForkBaseRevisions: [],
    headRevision: null,
    revisions: [],
    selectedFileChanges: new Map(),
  };
}

function reduceRepositoryAction(
  repositoryState: RepositoryState,
  action: Action,
): RepositoryState {
  switch (action.type) {
    case ActionTypes.SET_DIFF_OPTION: {
      return {
        ...repositoryState,
        diffOption: action.payload.diffOption,
      };
    }
    default: {
      throw new Error('Invalid Repository Action!');
    }
  }
}
