'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable, Disposable} from 'atom';
import invariant from 'assert';

import {track} from '../../nuclide-analytics';

import {DistractionFreeMode} from './DistractionFreeMode';
import {getBuiltinProviders} from './BuiltinProviders';

export type DistractionFreeModeProvider = {
  // Should be the unique to all providers. Recommended to be the package name. This string is not
  // user-facing.
  name: string;
  isVisible: () => boolean;
  toggle: () => void;
};

export type DistractionFreeModeState = {
  // Serialize the restore state via an array of provider names.
  restoreState: ?Array<string>;
};

class Activation {
  _disposables: CompositeDisposable;
  _tunnelVision: DistractionFreeMode;

  constructor(state: ?DistractionFreeModeState) {
    this._disposables = new CompositeDisposable();
    this._tunnelVision = new DistractionFreeMode(state);
    this._disposables.add(atom.commands.add(
      atom.views.getView(atom.workspace),
      'nuclide-distraction-free-mode:toggle',
      () => {
        track('distraction-free-mode:toggle');
        this._tunnelVision.toggleDistractionFreeMode();
      }
    ));
  }

  dispose(): void {
    this._disposables.dispose();
  }

  serialize(): DistractionFreeModeState {
    return this._tunnelVision.serialize();
  }

  consumeDistractionFreeModeProvider(provider: DistractionFreeModeProvider): IDisposable {
    return this._tunnelVision.consumeDistractionFreeModeProvider(provider);
  }

  consumeToolBar(getToolBar: (group: string) => Object): void {
    const toolBar = getToolBar('nuclide-distraction-free-mode');
    toolBar.addButton({
      icon: 'eye',
      callback: 'nuclide-distraction-free-mode:toggle',
      tooltip: 'Toggle distraction-free mode',
      priority: 600,
    });
    this._disposables.add(new Disposable(() => {
      toolBar.removeItems();
    }));
  }
}

let activation: ?Activation = null;

export function activate(state: ?DistractionFreeModeState) {
  if (activation == null) {
    activation = new Activation(state);
    for (const provider of getBuiltinProviders()) {
      activation.consumeDistractionFreeModeProvider(provider);
    }
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

export function serialize(): DistractionFreeModeState {
  invariant(activation != null);
  return activation.serialize();
}

export function consumeDistractionFreeModeProvider(
  provider: DistractionFreeModeProvider
): IDisposable {
  invariant(activation != null);
  return activation.consumeDistractionFreeModeProvider(provider);
}

export function consumeToolBar(getToolBar: (group: string) => Object): void {
  invariant(activation != null);
  activation.consumeToolBar(getToolBar);
}
