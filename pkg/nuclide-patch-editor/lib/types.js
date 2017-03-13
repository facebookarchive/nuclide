/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

export type AppState = {
  patchEditors: Map<string, PatchData>,
};

export type PatchData = {};

export type Store = {
  getState(): AppState,
  dispatch(action: Action): void,
};

export type RegisterPatchEditorAction = {
  type: 'REGISTER_PATCH_EDITOR',
  payload: {
    editorPath: string,
    patchData: Array<diffparser$FileDiff>,
  },
};

export type DeregisterPatchEditorAction = {
  type: 'DEREGISTER_PATCH_EDITOR',
  payload: {
    editorPath: string,
  },
};

export type Action = RegisterPatchEditorAction
| DeregisterPatchEditorAction
;
