'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LinterProvider} from './LinterAdapter';

var {Disposable, CompositeDisposable} = require('atom');

var disposables = null;

function addDisposable(disposable: atom$Disposable) {
  if (disposables) {
    disposables.add(disposable);
  } else {
    var logger = require('nuclide-logging').getLogger();
    logger.error('disposables is null');
  }
}

module.exports = {

  activate(state: ?Object): void {
    if (!disposables) {
      disposables = new CompositeDisposable();
    }
  },

  consumeLinterProvider(provider: LinterProvider): atom$Disposable {
    var LinterAdapter = require('./LinterAdapter');
    var adapter = new LinterAdapter(provider);
    var diagnosticDisposable = this.consumeDiagnosticProvider(adapter);
    var adapterDisposable = new Disposable(() => {
      diagnosticDisposable.dispose();
      adapter.dispose();
    });
    addDisposable(adapter);
    return adapterDisposable;
  },

  consumeDiagnosticProvider(provider: DiagnosticProvider): atom$Disposable {
    // TODO consume the provider
    var disposable = new Disposable(() => {
      // TODO deregister for any other events we subscribe to

      // TODO remove the provider from anywhere we've stored it
    });
    addDisposable(disposable);
    return disposable;
  },

  deactivate() {
    if (disposables) {
      disposables.dispose();
      disposables = null;
    }
  }
};
