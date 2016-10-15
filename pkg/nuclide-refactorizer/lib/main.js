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
import {React, ReactDOM} from 'react-for-atom';

import ProviderRegistry from '../../commons-atom/ProviderRegistry';
import createPackage from '../../commons-atom/createPackage';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

import * as Actions from './refactorActions';
import {getStore} from './refactorStore';
import {MainRefactorComponent} from './components/MainRefactorComponent';

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
  _disposables: UniversalDisposable;
  _store: Store;
  _providerRegistry: ProviderRegistry<RefactorProvider>;

  constructor() {
    this._providerRegistry = new ProviderRegistry();

    this._store = getStore(this._providerRegistry);

    let panel = null;
    this._disposables = new UniversalDisposable(
      this._store.subscribe(() => {
        const state = this._store.getState();
        if (state.type === 'open') {
          if (panel == null) {
            const element = document.createElement('div');
            panel = atom.workspace.addModalPanel({item: element});
          }
          ReactDOM.render(
            <MainRefactorComponent
              appState={state}
              store={this._store}
            />,
            panel.getItem(),
          );
        } else {
          if (panel != null) {
            ReactDOM.unmountComponentAtNode(panel.getItem());
            panel.destroy();
            panel = null;
          }
        }
      }),
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
