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
};

class Activation {
  _disposables: CompositeDisposable;
  _providers: Set<TunnelVisionProvider>;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
    this._providers = new Set();
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
