'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DiagnosticStore} from 'nuclide-diagnostics-base';
import type {LinterProvider} from './LinterAdapter';

var {Disposable, CompositeDisposable} = require('atom');

var disposables = null;
var diagnosticStore = null;

function addDisposable(disposable: atom$IDisposable) {
  if (disposables) {
    disposables.add(disposable);
  } else {
    var logger = require('nuclide-logging').getLogger();
    logger.error('disposables is null');
  }
}

function getDiagnosticStore(): DiagnosticStore {
  if (!diagnosticStore) {
    var {DiagnosticStore} = require('nuclide-diagnostics-base');
    diagnosticStore = new DiagnosticStore();
  }
  return diagnosticStore;
}

module.exports = {

  activate(state: ?Object): void {
    if (!disposables) {
      disposables = new CompositeDisposable();
    }
  },

  consumeLinterProvider(provider: LinterProvider): atom$IDisposable {
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

  consumeDiagnosticProvider(provider: DiagnosticProvider): atom$IDisposable {
    var store = getDiagnosticStore();
    // Register the diagnostic store for updates from the new provider.
    var compositeDisposable = new CompositeDisposable();
    compositeDisposable.add(
      provider.onMessageUpdate((update: DiagnosticProviderUpdate) => {
        store.updateMessages(provider, update);
      })
    );
    compositeDisposable.add(
      provider.onMessageInvalidation((invalidationMessage: InvalidationMessage) => {
        store.invalidateMessages(provider, invalidationMessage);
      })
    );
    addDisposable(compositeDisposable);
    return compositeDisposable;
  },

  deactivate() {
    if (disposables) {
      disposables.dispose();
      disposables = null;
    }
    if (diagnosticStore) {
      diagnosticStore.dispose();
      diagnosticStore = null;
    }
  }
};
