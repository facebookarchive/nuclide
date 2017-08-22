'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DistractionFreeMode = undefined;

var _atom = require('atom');

class DistractionFreeMode {
  // Non-null iff we have entered distraction-free mode without explicitly exiting it. See
  // _shouldRestore() and _enterDistractionFreeMode() for a more detailed explanation.
  constructor(state) {
    this._providers = new Set();
    this._restoreState = null;
    if (state != null && state.restoreState != null) {
      this._deserializationState = new Set(state.restoreState);
    }
  }

  // Set of names for providers that were hidden when Nuclide last exited, but have not yet been
  // consumed.


  serialize() {
    let restoreState = null;
    if (this._restoreState != null) {
      restoreState = Array.from(this._restoreState, provider => provider.name);
    }
    return {
      restoreState
    };
  }

  consumeDistractionFreeModeProvider(provider) {
    this._providers.add(provider);
    if (this._deserializationState != null && this._deserializationState.has(provider.name)) {
      this._addToRestoreState(provider);
    }
    return new _atom.Disposable(() => {
      this._providers.delete(provider);
    });
  }

  toggleDistractionFreeMode() {
    // Once the user has interacted with distraction-free mode it would be weird if another package
    // loading triggered a change in the state.
    this._deserializationState = null;
    if (this._shouldRestore()) {
      this._exitDistractionFreeMode();
    } else {
      this._enterDistractionFreeMode();
    }
  }

  _addToRestoreState(provider) {
    let restoreState = this._restoreState;
    if (restoreState == null) {
      this._restoreState = restoreState = new Set();
    }
    restoreState.add(provider);
  }

  _shouldRestore() {
    if (this._restoreState == null) {
      return false;
    }
    for (const provider of this._providers) {
      if (provider.isVisible()) {
        // If the user has manually shown any provider they have probably forgotten they are in
        // distraction-free mode, and intend to enter it.
        return false;
      }
    }
    return true;
  }

  _enterDistractionFreeMode() {
    // This will be non-null if the user has entered distraction-free mode without toggling it off,
    // but has manually opened one or more of the providers. In that case, we want to re-enter
    // distraction-free mode, hiding the currently-visible providers, but when we exit we want to
    // restore both the previously-hidden providers and the currently-visible providers.
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

  _exitDistractionFreeMode() {
    const restoreState = this._restoreState;

    if (!(restoreState != null)) {
      throw new Error('Invariant violation: "restoreState != null"');
    }

    for (const provider of restoreState) {
      if (!provider.isVisible()) {
        provider.toggle();
      }
    }
    this._restoreState = null;
  }
}
exports.DistractionFreeMode = DistractionFreeMode; /**
                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the license found in the LICENSE file in
                                                    * the root directory of this source tree.
                                                    *
                                                    * 
                                                    * @format
                                                    */