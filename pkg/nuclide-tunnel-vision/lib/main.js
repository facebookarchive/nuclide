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

import {TunnelVision} from './TunnelVision';

export type TunnelVisionProvider = {
  // Should be the unique to all providers. Recommended to be the package name.
  name: string;
  isVisible: () => boolean;
  toggle: () => void;
};

export type TunnelVisionState = {
  // Serialize the restore state via an array of provider names.
  restoreState: ?Array<string>;
}

class Activation {
  _disposables: CompositeDisposable;
  _tunnelVision: TunnelVision;

  constructor(state: ?TunnelVisionState) {
    this._disposables = new CompositeDisposable();
    this._tunnelVision = new TunnelVision(state);
    this._disposables.add(atom.commands.add(
      atom.views.getView(atom.workspace),
      'nuclide-tunnel-vision:toggle',
      this._tunnelVision.toggleTunnelVision.bind(this._tunnelVision),
    ));
  }

  dispose(): void {
    this._disposables.dispose();
  }

  serialize(): TunnelVisionState {
    return this._tunnelVision.serialize();
  }

  consumeTunnelVisionProvider(provider: TunnelVisionProvider): IDisposable {
    return this._tunnelVision.consumeTunnelVisionProvider(provider);
  }

  consumeToolBar(getToolBar: (group: string) => Object): void {
    const toolBar = getToolBar('nuclide-tunnel-vision');
    toolBar.addButton({
      icon: 'eye',
      callback: 'nuclide-tunnel-vision:toggle',
      tooltip: 'Toggle tunnel vision',
      priority: 600,
    });
    this._disposables.add(new Disposable(() => {
      toolBar.removeItems();
    }));
  }
}

let activation: ?Activation = null;

export function activate(state: ?TunnelVisionState) {
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

export function serialize(): TunnelVisionState {
  invariant(activation != null);
  return activation.serialize();
}

export function consumeTunnelVisionProvider(provider: TunnelVisionProvider): IDisposable {
  invariant(activation != null);
  return activation.consumeTunnelVisionProvider(provider);
}

export function consumeToolBar(getToolBar: (group: string) => Object): void {
  invariant(activation != null);
  activation.consumeToolBar(getToolBar);
}
