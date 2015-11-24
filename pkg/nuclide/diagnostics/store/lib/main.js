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

import {Disposable, CompositeDisposable} from 'atom';

const legacyLinterSetting = 'nuclide-diagnostics-store.consumeLegacyLinters';

const legacyLintOnTheFlySetting = 'nuclide-diagnostics-store.legacyLintOnTheFly';

let disposables = null;
let diagnosticStore = null;
let diagnosticUpdater = null;

function addDisposable(disposable: atom$IDisposable) {
  if (disposables) {
    disposables.add(disposable);
  } else {
    const logger = require('nuclide-logging').getLogger();
    logger.error('disposables is null');
  }
}

function getDiagnosticStore(): DiagnosticStore {
  if (!diagnosticStore) {
    diagnosticStore = new (require('nuclide-diagnostics-base').DiagnosticStore)();
  }
  return diagnosticStore;
}

/**
 * @return A wrapper around the methods on DiagnosticStore that allow reading data.
 */
function getDiagnosticUpdater(): DiagnosticUpdater {
  if (!diagnosticUpdater) {
    const store = getDiagnosticStore();
    diagnosticUpdater = {
      onFileMessagesDidUpdate: store.onFileMessagesDidUpdate.bind(store),
      onProjectMessagesDidUpdate: store.onProjectMessagesDidUpdate.bind(store),
      onAllMessagesDidUpdate: store.onAllMessagesDidUpdate.bind(store),
    };
  }
  return diagnosticUpdater;
}

let consumeLegacyLinters = false;
let lintOnTheFly = false;
const allLinterAdapters = new Set();

module.exports = {
  // $FlowIssue https://github.com/facebook/flow/issues/620
  config: require('../package.json').nuclide.config,

  activate(state: ?Object): void {
    if (!disposables) {
      disposables = new CompositeDisposable();
    }

    // Returns mixed so a cast is necessary.
    consumeLegacyLinters = ((atom.config.get(legacyLinterSetting): any): boolean);
    atom.config.observe(legacyLinterSetting, newValue => {
      // To make this really solid, we should also probably trigger the linter
      // for the active text editor. Possibly more trouble than it's worth,
      // though, since this may be a temporary option.
      consumeLegacyLinters = newValue;
      allLinterAdapters.forEach(adapter => adapter.setEnabled(newValue));
    });

    lintOnTheFly = ((atom.config.get(legacyLintOnTheFlySetting): any): boolean);
    atom.config.observe(legacyLintOnTheFlySetting, newValue => {
      lintOnTheFly = newValue;
      allLinterAdapters.forEach(adapter => adapter.setLintOnFly(newValue));
    });
  },

  consumeLinterProvider(provider: LinterProvider | Array<LinterProvider>): atom$IDisposable {
    const {createAdapters} = require('./LinterAdapterFactory');
    const newAdapters = createAdapters(provider);
    const adapterDisposables = new CompositeDisposable();
    for (const adapter of newAdapters) {
      adapter.setEnabled(consumeLegacyLinters);
      adapter.setLintOnFly(lintOnTheFly);
      allLinterAdapters.add(adapter);
      const diagnosticDisposable = this.consumeDiagnosticProvider(adapter);
      const adapterDisposable = new Disposable(() => {
        diagnosticDisposable.dispose();
        adapter.dispose();
        allLinterAdapters.delete(adapter);
      });
      adapterDisposables.add(adapterDisposable);
      addDisposable(adapter);
    }
    return adapterDisposables;
  },

  consumeDiagnosticProvider(provider: DiagnosticProvider): atom$IDisposable {
    const store = getDiagnosticStore();
    // Register the diagnostic store for updates from the new provider.
    const compositeDisposable = new CompositeDisposable();
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
    compositeDisposable.add(new Disposable(() => {
      store.invalidateMessages(provider, { scope: 'all' });
    }));
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
  },
};
