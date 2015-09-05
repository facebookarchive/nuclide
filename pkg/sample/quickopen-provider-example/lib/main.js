'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Store} from 'nuclide-quick-open-interfaces';

var {
  CompositeDisposable,
  Disposable,
} = require('atom');

var providerInstance;
function getProviderInstance() {
  if (providerInstance == null) {
    var ExampleProvider = require('./ExampleProvider');
    providerInstance = {...ExampleProvider};
  }
  return providerInstance;
}

class Activation {
  _disposables: CompositeDisposable;
  store: ?Store;

  constructor(state: ?Object) {
     this._disposables = new CompositeDisposable();
  }

  activate() {
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'sample-quickopen-provider-example:toggle-provider': () => {
          if (this.store) {
            this.store.toggleProvider(getProviderInstance());
          }
        },
      })
    );
  }

  setStore(store: Store): void {
    this.store = store;
  }

  dispose() {
    this.store = null;
    this._disposables.dispose();
  }
}

var activation: ?Activation = null;
function getActivation() {
  if (activation == null) {
    activation = new Activation();
    activation.activate();
  }
  return activation;
}

module.exports = {

  registerProvider() {
    return getProviderInstance();
  },

  registerStore(store: Store): atom$Disposable {
    // Keep a reference to Store, so that the example provider can set itself as active.
    getActivation().setStore(store);
    return new Disposable(() => getActivation().dispose());
  },

  activate(state: ?Object) {
    getActivation();
  },

  deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  },
};
