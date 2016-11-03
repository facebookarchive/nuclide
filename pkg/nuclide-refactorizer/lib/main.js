'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*
 * WARNING: This package is still experimental and in early development. Use it at your own risk.
 */

import type {TextEdit} from '../../nuclide-textedit/lib/rpc-types';

import type {
  Store,
} from './types';

import type {NuclideUri} from '../../commons-node/nuclideUri';

import {Disposable} from 'atom';

import ProviderRegistry from '../../commons-atom/ProviderRegistry';
import createPackage from '../../commons-atom/createPackage';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

import * as Actions from './refactorActions';
import {getStore} from './refactorStore';
import {initRefactorUIs} from './refactorUIs';

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
  originalPoint: atom$Point,
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
  _disposables: UniversalDisposable;
  _store: Store;
  _providerRegistry: ProviderRegistry<RefactorProvider>;

  constructor() {
    this._providerRegistry = new ProviderRegistry();

    this._store = getStore(this._providerRegistry);

    this._disposables = new UniversalDisposable(
      initRefactorUIs(this._store),
      atom.commands.add('atom-workspace', 'nuclide-refactorizer:refactorize', () => {
        this._store.dispatch(Actions.open());
      }),
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeRefactorProvider(provider: RefactorProvider): IDisposable {
    this._providerRegistry.addProvider(provider);
    return new Disposable(() => {
      this._providerRegistry.removeProvider(provider);
    });
  }
}

export default createPackage(Activation);
