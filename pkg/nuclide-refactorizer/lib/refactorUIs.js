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
} from './types';

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {React, ReactDOM} from 'react-for-atom';

import {MainRefactorComponent} from './components/MainRefactorComponent';

const refactorUIFactories: Array<RefactorUIFactory> = [
  genericRefactorUI,
];

export function initRefactorUIs(store: Store): IDisposable {
  const disposables = refactorUIFactories.map(uiFn => uiFn(store));
  return new UniversalDisposable(...disposables);
}

function genericRefactorUI(store: Store): IDisposable {
  let panel;
  const disposeFn: () => void = store.subscribe(() => {
    const state = store.getState();
    if (state.type === 'open') {
      if (panel == null) {
        const element = document.createElement('div');
        panel = atom.workspace.addModalPanel({item: element});
      }
      ReactDOM.render(
        <MainRefactorComponent
          appState={state}
          store={store}
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
  });
  return new UniversalDisposable(disposeFn);
}
