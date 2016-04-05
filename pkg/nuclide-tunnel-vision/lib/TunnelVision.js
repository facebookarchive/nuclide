'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TunnelVisionProvider, TunnelVisionState} from '..';

import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';

export class TunnelVision {
  _disposables: CompositeDisposable;

  _providers: Set<TunnelVisionProvider>;
  // Non-null iff we have entered tunnel vision mode without explicitly exiting it. See
  // _shouldRestore() and _enterTunnelVision() for a more detailed explanation.
  _restoreState: ?Set<TunnelVisionProvider>;

  // Set of names for providers that were hidden when Nuclide last exited, but have not yet been
  // consumed.
  _deserializationState: ?Set<string>;

  constructor(state: ?TunnelVisionState) {
    this._disposables = new CompositeDisposable();
    this._providers = new Set();
    this._restoreState = null;
    if (state != null && state.restoreState != null) {
      this._deserializationState = new Set(state.restoreState);
    }
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize(): TunnelVisionState {
    let restoreState = null;
    if (this._restoreState != null) {
      restoreState = Array.from(this._restoreState, provider => provider.name);
    }
    return {
      restoreState,
    };
  }

  consumeTunnelVisionProvider(provider: TunnelVisionProvider): IDisposable {
    this._providers.add(provider);
    if (this._deserializationState != null && this._deserializationState.has(provider.name)) {
      this._addToRestoreState(provider);
    }
    return new Disposable(() => {
      this._providers.delete(provider);
    });
  }

  toggleTunnelVision(): void {
    // Once the user has interacted with tunnel vision it would be weird if another package loading
    // triggered a change in the state.
    this._deserializationState = null;
    if (this._shouldRestore()) {
      this._exitTunnelVision();
    } else {
      this._enterTunnelVision();
    }
  }

  _addToRestoreState(provider: TunnelVisionProvider): void {
    let restoreState = this._restoreState;
    if (restoreState == null) {
      this._restoreState = restoreState = new Set();
    }
    restoreState.add(provider);
  }

  _shouldRestore(): boolean {
    if (this._restoreState == null) {
      return false;
    }
    for (const provider of this._providers) {
      if (provider.isVisible()) {
        // If the user has manually shown any provider they have probably forgotten they are in
        // tunnel vision mode, and intend to enter it.
        return false;
      }
    }
    return true;
  }

  _enterTunnelVision(): void {
    // This will be non-null if the user has entered tunnel vision without toggling it off, but has
    // manually opened one or more of the providers. In that case, we want to re-enter tunnel
    // vision, hiding the currently-visible providers, but when we exit we want to restore both the
    // previously-hidden providers and the currently-visible providers.
    let newRestoreState = this._restoreState;
    if (newRestoreState == null) {
      newRestoreState = new Set();
    }
    for (const provider of this._providers) {
      if (provider.isVisible()) {
        provider.toggle();
        newRestoreState.add(provider);
      }
    }
    this._restoreState = newRestoreState;
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
