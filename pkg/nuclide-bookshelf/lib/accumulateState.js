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
  BookShelfState,
} from './types';

export function accumulateState(
  state: BookShelfState,
  action: Action,
): BookShelfState {
  switch (action.type) {
    default:
      return state;
  }
}
