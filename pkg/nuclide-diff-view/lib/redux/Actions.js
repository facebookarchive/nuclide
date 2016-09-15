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
  DiffOptionType,
  SetDiffOptionAction,
} from '../types';
import type {HgRepositoryClient} from '../../../nuclide-hg-repository-client';

import {SET_DIFF_OPTION} from './ActionTypes';

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
