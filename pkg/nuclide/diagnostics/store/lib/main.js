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
var diagnosticUpdater = null;

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

/**
 * @return A wrapper around the methods on DiagnosticStore that allow reading data.
 */
function getDiagnosticUpdater(): DiagnosticUpdater {
  if (!diagnosticUpdater) {
    var store = getDiagnosticStore();
    diagnosticUpdater = {
      onFileMessagesDidUpdate: store.onFileMessagesDidUpdate.bind(store),
      onProjectMessagesDidUpdate: store.onProjectMessagesDidUpdate.bind(store),
      onAllMessagesDidUpdate: store.onAllMessagesDidUpdate.bind(store),
      getFileMessages: store.getFileMessages.bind(store),
      getProjectMessages: store.getProjectMessages.bind(store),
      getAllMessages: store.getAllMessages.bind(store),
    };
  }
  return diagnosticUpdater;
}

var consumeLegacyLinters = false;
var adapters = new Set();

module.exports = {
  config: {
    consumeLegacyLinters: {
      type: 'boolean',
      default: false,
    },
  },

  activate(state: ?Object): void {
    if (!disposables) {
      disposables = new CompositeDisposable();
    }
    var settingName = 'nuclide-diagnostics-store.consumeLegacyLinters';
    consumeLegacyLinters = ((atom.config.get(settingName): any): boolean);  // returns mixed so a cast is necessary
    atom.config.observe(settingName, newValue => {
      // To make this really solid, we should also probably trigger the linter
      // for the active text editor. Possibly more trouble than it's worth,
      // though, since this may be a temporary option.
      consumeLegacyLinters = newValue;
      adapters.forEach(adapter => adapter.setEnabled(newValue));
    });
  },

  consumeLinterProvider(provider: LinterProvider): atom$IDisposable {
    var LinterAdapter = require('./LinterAdapter');
    var adapter = new LinterAdapter(provider);
    adapter.setEnabled(consumeLegacyLinters);
    adapters.add(adapter);
    var diagnosticDisposable = this.consumeDiagnosticProvider(adapter);
    var adapterDisposable = new Disposable(() => {
      diagnosticDisposable.dispose();
      adapter.dispose();
      adapters.delete(adapter);
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

  provideDiagnosticUpdates(): DiagnosticUpdater {
    return getDiagnosticUpdater();
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
    diagnosticUpdater = null;
  }
};
