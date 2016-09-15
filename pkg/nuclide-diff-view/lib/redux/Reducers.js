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
  RepositoryState,
} from '../types';

import * as ActionTypes from './ActionTypes';

export function reduceRepositoryAction(
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
