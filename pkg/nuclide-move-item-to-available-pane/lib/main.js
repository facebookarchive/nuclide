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
import {moveDown, moveLeft, moveRight, moveUp} from './move';

class Activation {
  _disposables: CompositeDisposable;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
  }

  activate() {
    this._disposables.add(atom.commands.add(
      'atom-text-editor',
      {
        // Pass the eta expansion of these functions to defer the loading of move.js.
        'nuclide-move-item-to-available-pane:right': () => moveRight(),
        'nuclide-move-item-to-available-pane:left': () => moveLeft(),
        'nuclide-move-item-to-available-pane:up': () => moveUp(),
        'nuclide-move-item-to-available-pane:down': () => moveDown(),
      },
    ));
  }

  dispose() {
    this._disposables.dispose();
  }
}

let activation: ?Activation = null;

export function activate(state: ?Object) {
  if (activation == null) {
    activation = new Activation(state);
    activation.activate();
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}
