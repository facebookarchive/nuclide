'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';
/*
 * WARNING: This package is still experimental and in early development. Use it at your own risk.
 */

import type {TextEdit} from '../../nuclide-textedit/lib/rpc-types';

import type {NuclideUri} from '../../commons-node/nuclideUri';

import createPackage from '../../commons-atom/createPackage';

export type RenameRefactorKind = 'rename';

// Will be a union type when we add more
export type RefactorKind = RenameRefactorKind;

export type RenameRefactoring = {
  kind: RenameRefactorKind,
  symbolAtPoint: {
    text: string,
    range: atom$Range,
  },
};

// Will be a union type when we add more
export type AvailableRefactoring = RenameRefactoring;

export type RenameRequest = {
  kind: RenameRefactorKind,
  editor: atom$TextEditor,
  symbolAtPoint: {
    text: string,
    range: atom$Range,
  },
  newName: string,
};

export type RefactorRequest = RenameRequest;

export type RefactorResponse = {
  edits: Map<NuclideUri, Array<TextEdit>>,
};

export type RefactorProvider = {
  priority: number,
  grammarScopes: Array<string>,

  refactoringsAtPoint(
    editor: atom$TextEditor,
    point: atom$Point,
  ): Promise<Array<AvailableRefactoring>>,
  refactor(request: RefactorRequest): Promise<?RefactorResponse>,
};

class Activation {
  _disposables: CompositeDisposable;

  constructor() {
    this._disposables = new CompositeDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }
}


export default createPackage(Activation);
