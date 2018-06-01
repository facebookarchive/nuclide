/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {UpdateWelcomePageVisibilityAction} from '../types';

import * as ActionTypes from './ActionTypes';

export function updateWelcomePageVisibility(
  isVisible: boolean,
): UpdateWelcomePageVisibilityAction {
  return {
    type: ActionTypes.UPDATE_WELCOME_PAGE_VISIBILITY,
    payload: {isVisible},
  };
}
