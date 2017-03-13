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
  // Mapped by editorPath
  patchEditors: Map<string, PatchData>,
};

export type PatchData = {
  // Mapped by changed fileName
  files: Map<string, FileData>,
};

export type FileData = {
  // Map from Hunk's oldStart line number to hunk
  chunks: ?Map<number, HunkData>,
  collapsed: boolean,
  countEnabledChunks: number,
  fileDiff: diffparser$FileDiff,
  selected: SelectedState,
};

export type HunkData = {
  collapsed: boolean,
  countAllChanges: number,
  countEnabledChanges: number,
  // All changes within a hunk are contiguous
  lines: Array<boolean>,
  selected: SelectedState,
};

export type SelectedState = 'all' | 'some' | 'none';

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

export type ClickCheckboxAction = {
  type: 'CLICK_CHECKBOX_ACTION',
  payload: {
    editorPath: string,
    fileName: string,
    hunkOldStartLine: ?number,
    line: ?number,
  },
};

export type Action = RegisterPatchEditorAction
| DeregisterPatchEditorAction
| ClickCheckboxAction
;
