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

import type {AppState, Action} from '../types';

import * as ActionTypes from './ActionTypes';

export default function rootReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case ActionTypes.UPDATE_WELCOME_PAGE_VISIBILITY:
      return {...state, isWelcomePageVisible: action.payload.isVisible};
  }

  return state;
}
