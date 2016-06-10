'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {ContextViewState} from './ContextViewState';

import type {DefinitionService} from '../../nuclide-definition-service';
import invariant from 'assert';

import {Disposable, CompositeDisposable} from 'atom';

let currentService: ?DefinitionService = null;

type ContextViewConfig = {
  width: number;
  visible: boolean;
};

const INITIAL_PANEL_WIDTH: number = 300;
const INITIAL_PANEL_VISIBILITY: boolean = true;

const DEFAULT_CONFIG: ContextViewConfig = {
  width: INITIAL_PANEL_WIDTH,
  visible: INITIAL_PANEL_VISIBILITY,
};

/**
 * Encapsulates the package into one Activation object, so that
 * in atom's activate() and deactivate() functions, only the Activation
 * object must be instantiated/disposed of.
 */
class Activation {

  _disposables: CompositeDisposable;
  _panelState: ContextViewState;

  constructor(config?: ContextViewConfig = DEFAULT_CONFIG) {
    this._disposables = new CompositeDisposable();

    this._panelState = new ContextViewState(config.width, config.visible);
    this.updateService();
    this._bindShortcuts();
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize(): ContextViewConfig {
    return {
      width: this._panelState.getWidth(),
      visible: this._panelState.isVisible(),
    };
  }

  _bindShortcuts() {
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

  updateService(): void {

  }
}

let activation: ?Activation = null;

export function activate(state: Object | void) {
  if (!activation) {
    activation = new Activation(state);
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

function updateService(): void {
  if (activation != null) {
    activation.updateService();
  }
}

export function consumeDefinitionService(service: DefinitionService): IDisposable {
  invariant(currentService == null);
  currentService = service;
  updateService();
  return new Disposable(() => {
    invariant(currentService === service);
    currentService = null;
    updateService();
  });
}
