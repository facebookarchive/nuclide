'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {
  CompositeDisposable,
  Disposable,
} = require('atom');

class Activation {
  _disposables: CompositeDisposable;
  store: ?Object;

  constructor(state: ?Object) {
     // Assign all fields here so they are non-nullable for
     // the lifetime of Activation.
     this._disposables = new CompositeDisposable();
  }

  activate() {
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'sample-quickopen-provider-example:toggle-provider': () => {
          if (this.store) {
            this.store.toggleProvider(require('./ExampleProvider'));
          }
        },
      })
    );
  }

  setStore(store) {
    this.store = store;
  }

  dispose() {
     this._disposables.dispose();
  }
}

var activation: ?Activation = null;
module.exports = {

  registerProvider() {
    return require('./ExampleProvider');
  },

  registerStore(store: Provider): atom$Disposable {
    if (!activation) {
      this.activate();
    }
    // Keep a reference to ResultsStore, so that the example provider can set itself as active.
    activation.setStore(store);
    return new Disposable(() => this.setStore(null));
  },

  activate(state: ?Object) {
    if (!activation) {
      activation = new Activation(state);
      activation.activate();
    }
  },

  deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  },
};
