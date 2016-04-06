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
