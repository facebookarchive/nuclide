/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  Action,
  AppState,
} from '../types';

import {createEmptyAppState} from './createEmptyAppState';
import * as ActionTypes from './ActionTypes';

export function rootReducer(
  state?: AppState,
  action: Action,
): AppState {
  if (state == null) {
    return createEmptyAppState();
  }
  switch (action.type) {
    case ActionTypes.REGISTER_PATCH_EDITOR: {
      const patchEditors = new Map(state.patchEditors);
      patchEditors.set(action.payload.editorPath, {});
      return {
        ...state,
        patchEditors,
      };
    }

    case ActionTypes.DEREGISTER_PATCH_EDITOR: {
      const patchEditors = new Map(state.patchEditors);
      patchEditors.delete(action.payload.editorPath);
      return {
        ...state,
        patchEditors,
      };
    }
  }
  return state;
}
