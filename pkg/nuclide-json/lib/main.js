'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HyperclickProvider} from '../../hyperclick/lib/types';
import type {Outline, OutlineProvider} from '../../nuclide-outline-view';

import {CompositeDisposable} from 'atom';

import {getOutline} from './JSONOutlineProvider';
import {getNPMHyperclickProvider} from './NPMHyperclickProvider';

class Activation {
  _disposables: CompositeDisposable;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
  }

  dispose(): void {
    this._disposables.dispose();
  }
}

let activation: ?Activation = null;

export function activate(state: ?Object): void {
  if (activation == null) {
    activation = new Activation(state);
  }
}

export function deactivate(): void {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

export function provideOutlines(): OutlineProvider {
  return {
    grammarScopes: ['source.json'],
    priority: 1,
    name: 'Nuclide JSON',
    getOutline(editor: atom$TextEditor): Promise<?Outline> {
      return Promise.resolve(getOutline(editor.getText()));
    },
  };
}

export function getHyperclickProvider(): HyperclickProvider {
  return getNPMHyperclickProvider();
}
