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

export type TunnelVisionProvider = {
  isVisible: () => boolean;
  toggle: () => void;
};

class Activation {
  _disposables: CompositeDisposable;

  _providers: Set<TunnelVisionProvider>;
  // non-null iff we are in tunnel vision mode. The set of providers to show when we exit tunnel
  // vision mode.
  _restoreState: ?Set<TunnelVisionProvider>;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
    this._providers = new Set();
    this._restoreState = null;

    atom.commands.add(
      atom.views.getView(atom.workspace),
      'nuclide-tunnel-vision:toggle',
      this._toggleTunnelVision.bind(this),
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeTunnelVisionProvider(provider: TunnelVisionProvider): IDisposable {
    this._providers.add(provider);
    return new Disposable(() => {
      this._providers.delete(provider);
    });
  }

  _toggleTunnelVision(): void {
    if (this._isInTunnelVision()) {
      this._exitTunnelVision();
    } else {
      this._enterTunnelVision();
    }
  }

  _isInTunnelVision() {
    return this._restoreState != null;
  }

  _enterTunnelVision(): void {
    const restoreState = new Set();
    for (const provider of this._providers) {
      if (provider.isVisible()) {
        provider.toggle();
        restoreState.add(provider);
      }
    }
    this._restoreState = restoreState;
  }

  _exitTunnelVision(): void {
    const restoreState = this._restoreState;
    invariant(restoreState != null);
    for (const provider of restoreState) {
      if (!provider.isVisible()) {
        provider.toggle();
      }
    }
    this._restoreState = null;
  }
}

let activation: ?Activation = null;

export function activate(state: ?Object) {
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

export function consumeTunnelVisionProvider(provider: TunnelVisionProvider): IDisposable {
  invariant(activation != null);
  return activation.consumeTunnelVisionProvider(provider);
}
