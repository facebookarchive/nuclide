'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DistractionFreeModeProvider} from '../../nuclide-distraction-free-mode';
import type {DefinitionService} from '../../nuclide-definition-service';

import {CompositeDisposable, Disposable} from 'atom';
import {CodePreviewState} from './CodePreviewState';
import invariant from 'assert';

let currentService: ?DefinitionService = null;

type CodePreviewConfig = {
  width: number;
  visible: boolean;
};

const DEFAULT_WIDTH = 300; // px
const DEFAULT_CONFIG: CodePreviewConfig = {
  width: DEFAULT_WIDTH,
  visible: false,
};

class Activation {
  _disposables: CompositeDisposable;
  _state: CodePreviewState;

  constructor(config?: CodePreviewConfig = DEFAULT_CONFIG) {
    this._disposables = new CompositeDisposable();
    this._state = new CodePreviewState(config.width, config.visible);
    this.updateService();
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-definition-preview:toggle',
        () => this._state.toggle()
      )
    );
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-definition-preview:show',
        () => this._state.show()
      )
    );
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-definition-preview:hide',
        () => this._state.hide()
      )
    );
  }

  updateService(): void {
    this._state.setDefinitionService(currentService);
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize(): CodePreviewConfig {
    return {
      width: this._state.getWidth(),
      visible: this._state.isVisible(),
    };
  }

  getDistractionFreeModeProvider(): DistractionFreeModeProvider {
    return {
      name: 'nuclide-definition-preview',
      isVisible: () => this._state.isVisible(),
      toggle: () => this._state.toggle(),
    };
  }
}

let activation: ?Activation = null;

export function activate(state: Object | void) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
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

export function serialize(): ?CodePreviewConfig {
  if (activation != null) {
    return activation.serialize();
  }
}

export function getDistractionFreeModeProvider(): DistractionFreeModeProvider {
  invariant(activation != null);
  return activation.getDistractionFreeModeProvider();
}
