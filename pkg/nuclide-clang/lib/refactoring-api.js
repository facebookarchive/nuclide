'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TextEdit} from '../../nuclide-textedit/lib/rpc-types';

export type RefactoringsRenameResponse = {
  kind: 'rename',
  symbolAtPoint: {
    name: string,
    range: atom$Range,
  },
};

// Will contain more in the future.
export type RefactoringsResponse = RefactoringsRenameResponse;

export type RenameRequest = {
  kind: 'rename',
  editor: atom$TextEditor,
  point: atom$Point,
  newName: string,
};

export type RefactorRequest = RenameRequest;

export type RefactorResponse = {
  // Grouped together by filename.
  edits: Map<string, Array<TextEdit>>,
};

export type RefactoringProvider = {
  grammarScopes: Array<string>,
  refactoringsAtPoint: (
    editor: atom$TextEditor,
    point: atom$Point,
  ) => Promise<Array<RefactoringsResponse>>,
  refactor: (request: RefactorRequest) => Promise<?RefactorResponse>,
};
