'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {ContextViewPanelState} from './ContextViewPanelState';

import {CompositeDisposable} from 'atom';

const INITIAL_PANEL_WIDTH: number = 30;
const INITIAL_PANEL_VISIBILITY: boolean = true;

/**
 * Encapsulates the package into one Activation object, so that
 * in atom's activate() and deactivate() functions, only the Activation
 * object must be instantiated/disposed of.
 */
class Activation {

  _disposables: CompositeDisposable;
  _panelState: ContextViewPanelState;

  constructor() {
    this._disposables = new CompositeDisposable();

    const panelState = this._panelState = new ContextViewPanelState(
      INITIAL_PANEL_WIDTH,
      INITIAL_PANEL_VISIBILITY);
    this._disposables.add(panelState);

    // Bind toggle command
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-context-view:toggle',
        this._panelState.toggle.bind(this._panelState)
      )
    );

    // Bind show command
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-context-view:show',
        this._panelState.show.bind(this._panelState)
      )
    );

    // Bind hide command
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-context-view:hide',
        this._panelState.hide.bind(this._panelState)
      )
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize() {

  }

  _bindShortcuts() {

  }
}

let activation: ?Activation = null;

export function activate() {
  if (!activation) {
    activation = new Activation();
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

export function serialize() {
  if (activation != null) {
    return activation.serialize();
  }
}
