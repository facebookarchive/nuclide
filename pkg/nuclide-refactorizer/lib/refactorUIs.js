'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  RefactorUIFactory,
  Store,
  RefactorState,
} from './types';

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {React, ReactDOM} from 'react-for-atom';

import {MainRefactorComponent} from './components/MainRefactorComponent';
import * as Actions from './refactorActions';

const refactorUIFactories: Array<RefactorUIFactory> = [
  genericRefactorUI,
  renameShortcut,
];

export function initRefactorUIs(store: Store): IDisposable {
  const disposables = refactorUIFactories.map(uiFn => uiFn(store));
  return new UniversalDisposable(...disposables);
}

function genericRefactorUI(store: Store): IDisposable {
  const renderer: GenericUIRenderer = new GenericUIRenderer(store);
  const disposeFn: () => void = store.subscribe(() => {
    const state = store.getState();
    if (state.type === 'closed' || (state.type === 'open' && state.ui === 'generic')) {
      renderer.renderState(state);
    }
  });
  return new UniversalDisposable(disposeFn);
}

function renameShortcut(store: Store): IDisposable {
  const renderer: GenericUIRenderer = new GenericUIRenderer(store);
  return new UniversalDisposable(
    store.subscribe(() => {
      const state = store.getState();
      if (state.type === 'closed') {
        renderer.renderState(state);
        return;
      }
      if (state.ui === 'rename') {
        const {phase} = state;
        switch (phase.type) {
          case 'pick':
            let renameRefactoring = null;
            for (const refactoring of phase.availableRefactorings) {
              if (refactoring.kind === 'rename') {
                renameRefactoring = refactoring;
              }
            }
            if (renameRefactoring == null) {
              // TODO display a message here
              store.dispatch(Actions.close());
            } else {
              store.dispatch(Actions.pickedRefactor(renameRefactoring));
            }
            break;
          default:
            renderer.renderState(state);
        }
      }
    }),
  );
}

class GenericUIRenderer {
  _panel: ?atom$Panel;
  _store: Store;

  constructor(store: Store) {
    this._store = store;
  }

  renderState(state: RefactorState) {
    if (state.type === 'open') {
      if (this._panel == null) {
        const element = document.createElement('div');
        this._panel = atom.workspace.addModalPanel({item: element});
      }
      ReactDOM.render(
        <MainRefactorComponent
          appState={state}
          store={this._store}
        />,
        this._panel.getItem(),
      );
    } else {
      if (this._panel != null) {
        const panel = this._panel;
        ReactDOM.unmountComponentAtNode(panel.getItem());
        panel.destroy();
        this._panel = null;
      }
    }
  }
}
