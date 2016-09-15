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
  AddRepositoryAction,
  DiffOptionType,
  DummyAction,
  SetDiffOptionAction,
} from '../types';
import type {HgRepositoryClient} from '../../../nuclide-hg-repository-client';

import {
  SET_DIFF_OPTION,
  ADD_REPOSITORY,
  DUMMY,
} from './ActionTypes';

export function addRepository(
  repository: HgRepositoryClient,
): AddRepositoryAction {
  return {
    type: ADD_REPOSITORY,
    payload: {
      repository,
    },
  };
}

export function setDiffOption(
  repository: HgRepositoryClient,
  diffOption: DiffOptionType,
): SetDiffOptionAction {
  return {
    type: SET_DIFF_OPTION,
    payload: {
      repository,
      diffOption,
    },
  };
}

export function updateDirtyFiles(
  repository: HgRepositoryClient,
): DummyAction {
  // TODO(most): return and handle the real action.
  return {
    type: DUMMY,
  };
}

export function removeRepository(
  repository: HgRepositoryClient,
): DummyAction {
  // TODO(most): return and handle the real action.
  return {
    type: DUMMY,
  };
}
