'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type ResultsStore = {
  toggleProvider: Function;
};

var {
  CompositeDisposable,
  Disposable,
} = require('atom');

var providerInstance;
function getProviderInstance() {
  if (providerInstance == null) {
    var HackSymbolProvider = require('./HackSymbolProvider');
    providerInstance = new HackSymbolProvider();
  }
  return providerInstance;
}

class Activation {
  _disposables: CompositeDisposable;
  _store: ?ResultsStore;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
  }

  activate() {
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'nuclide-hack-symbol-provider:toggle-provider': () => {
          if (this._store) {
            this._store.toggleProvider(getProviderInstance());
          }
        },
      })
    );
  }

  setStore(store): void {
    this._store = store;
  }

  dispose() {
    this._store = null;
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

  registerStore(store: ResultsStore): atom$Disposable {
    getActivation().setStore(store);
    return new Disposable(() => this.setStore(null));
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
