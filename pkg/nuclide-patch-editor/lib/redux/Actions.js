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
 RegisterPatchEditorAction,
 DeregisterPatchEditorAction,
} from '../types';

import * as ActionTypes from './ActionTypes';

export function registerPatchEditor(
  editorPath: string,
  patchData: Array<diffparser$FileDiff>,
): RegisterPatchEditorAction {
  return {
    type: ActionTypes.REGISTER_PATCH_EDITOR,
    payload: {
      editorPath,
      patchData,
    },
  };
}

export function deregisterPatchEditor(editorPath: string): DeregisterPatchEditorAction {
  return {
    type: ActionTypes.DEREGISTER_PATCH_EDITOR,
    payload: {
      editorPath,
    },
  };
}
