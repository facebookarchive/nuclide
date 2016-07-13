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
  BookShelfState,
  SerializedBookShelfState,
} from './types';

import Immutable from 'immutable';

export function getEmptBookShelfState(): BookShelfState {
  return {
    repositoryPathToState: Immutable.Map(),
  };
}

// Maps are serialized as key/value pairs array to match Map `enries` format.
export function serializeBookShelfState(
  bookShelfState: BookShelfState,
): SerializedBookShelfState {
  const {repositoryPathToState} = bookShelfState;
  const serializedRepositoryPathToState = Array.from(repositoryPathToState.entries())
    .map(([repositoryPath, repositoryState]) => {
      const serializedShortHeadToFileList = {
        activeShortHead: repositoryState.activeShortHead,
        shortHeadsToFileList: Array.from(repositoryState.shortHeadsToFileList.entries()),
      };
      return [repositoryPath, serializedShortHeadToFileList];
    }
  );
  return {
    repositoryPathToState: serializedRepositoryPathToState,
  };
}

export function deserializeBookShelfState(
  serializedBookShelfState: ?SerializedBookShelfState,
): BookShelfState {
  if (serializedBookShelfState == null) {
    return getEmptBookShelfState();
  }
  const repositoryPathToState = Immutable.Map(
    serializedBookShelfState.repositoryPathToState.map(([repositoryPath, repositoryState]) => {
      return [
        repositoryPath,
        {
          activeShortHead: repositoryState.activeShortHead,
          isRestoring: false,
          shortHeadsToFileList: Immutable.Map(repositoryState.shortHeadsToFileList),
        },
      ];
    })
  );
  return {
    repositoryPathToState,
  };
}
