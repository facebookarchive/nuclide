/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  DiagnosticUpdater,
  CallbackDiagnosticProvider,
  LinterProvider,
  ObservableDiagnosticProvider,
  ObservableDiagnosticUpdater,
} from '../../nuclide-diagnostics-common';
import type {LinterAdapter} from './LinterAdapter';

import createPackage from '../../commons-atom/createPackage';
import featureConfig from '../../commons-atom/featureConfig';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {getLogger} from '../../nuclide-logging';
import {DiagnosticStore} from '../../nuclide-diagnostics-common';

import {createAdapters} from './LinterAdapterFactory';

const legacyLinterSetting = 'nuclide-diagnostics-store.consumeLegacyLinters';

const legacyLintOnTheFlySetting = 'nuclide-diagnostics-store.legacyLintOnTheFly';

class Activation {
  _disposables: UniversalDisposable;
  _diagnosticStore: DiagnosticStore;

  _diagnosticUpdater: ?DiagnosticUpdater;
  _observableDiagnosticUpdater: ?ObservableDiagnosticUpdater;

  _consumeLegacyLinters: boolean;
  _lintOnTheFly: boolean;
  _allLinterAdapters: Set<LinterAdapter>;

  constructor() {
    this._allLinterAdapters = new Set();

    // Returns mixed so a cast is necessary.
    this._consumeLegacyLinters = ((featureConfig.get(legacyLinterSetting): any): boolean);
    this._lintOnTheFly = ((featureConfig.get(legacyLintOnTheFlySetting): any): boolean);

    this._disposables = new UniversalDisposable(
      featureConfig.observe(legacyLinterSetting, (newValue: any) => {
        // To make this really solid, we should also probably trigger the linter
        // for the active text editor. Possibly more trouble than it's worth,
        // though, since this may be a temporary option.
        this._consumeLegacyLinters = newValue;
        this._allLinterAdapters.forEach(adapter => adapter.setEnabled(newValue));
      }),

      featureConfig.observe(legacyLintOnTheFlySetting, (newValue: any) => {
        this._lintOnTheFly = newValue;
        this._allLinterAdapters.forEach(adapter => adapter.setLintOnFly(newValue));
      }),
    );
  }

  dispose() {
    this._allLinterAdapters.forEach(adapter => adapter.dispose());
    this._allLinterAdapters.clear();
    this._disposables.dispose();
  }

  getDiagnosticStore() {
    if (this._diagnosticStore == null) {
      this._diagnosticStore = new DiagnosticStore();
      this._disposables.add(this._diagnosticStore);
    }
    return this._diagnosticStore;
  }

  /**
   * @return A wrapper around the methods on DiagnosticStore that allow reading data.
   */
  provideDiagnosticUpdates(): DiagnosticUpdater {
    if (!this._diagnosticUpdater) {
      const store = this.getDiagnosticStore();
      this._diagnosticUpdater = {
        onFileMessagesDidUpdate: store.onFileMessagesDidUpdate.bind(store),
        onProjectMessagesDidUpdate: store.onProjectMessagesDidUpdate.bind(store),
        onAllMessagesDidUpdate: store.onAllMessagesDidUpdate.bind(store),
        applyFix: store.applyFix.bind(store),
        applyFixesForFile: store.applyFixesForFile.bind(store),
      };
    }
    return this._diagnosticUpdater;
  }

  provideObservableDiagnosticUpdates(): ObservableDiagnosticUpdater {
    if (this._observableDiagnosticUpdater == null) {
      const store = this._diagnosticStore;
      this._observableDiagnosticUpdater = {
        getFileMessageUpdates: path => store.getFileMessageUpdates(path),
        projectMessageUpdates: store.getProjectMessageUpdates(),
        allMessageUpdates: store.getAllMessageUpdates(),
        applyFix: message => store.applyFix(message),
        applyFixesForFile: file => store.applyFixesForFile(file),
      };
    }
    return this._observableDiagnosticUpdater;
  }

  consumeLinterProvider(
    provider: LinterProvider | Array<LinterProvider>,
  ): IDisposable {
    const newAdapters = createAdapters(provider);
    const adapterDisposables = new UniversalDisposable();
    for (const adapter of newAdapters) {
      adapter.setEnabled(this._consumeLegacyLinters);
      adapter.setLintOnFly(this._lintOnTheFly);
      this._allLinterAdapters.add(adapter);
      const diagnosticDisposable = this.consumeDiagnosticsProviderV1(adapter);
      adapterDisposables.add(() => {
        diagnosticDisposable.dispose();
        adapter.dispose();
        this._allLinterAdapters.delete(adapter);
      });
    }
    return adapterDisposables;
  }

  consumeDiagnosticsProviderV1(provider: CallbackDiagnosticProvider): IDisposable {
    // Register the diagnostic store for updates from the new provider.
    const observableProvider = {
      updates: observableFromSubscribeFunction(provider.onMessageUpdate.bind(provider)),
      invalidations: observableFromSubscribeFunction(provider.onMessageInvalidation.bind(provider)),
    };
    return this.consumeDiagnosticsProviderV2(observableProvider);
  }

  consumeDiagnosticsProviderV2(provider: ObservableDiagnosticProvider): IDisposable {
    const store = this.getDiagnosticStore();

    const subscriptions = new UniversalDisposable(
      provider.updates.subscribe(
        update => store.updateMessages(provider, update),
        error => { getLogger().error(`Error: updates.subscribe ${error}`); },
        () => { getLogger().error('updates.subscribe completed'); },
      ),
      provider.invalidations.subscribe(
        invalidation => store.invalidateMessages(provider, invalidation),
        error => { getLogger().error(`Error: invalidations.subscribe ${error}`); },
        () => { getLogger().error('invalidations.subscribe completed'); },
      ),
    );
    this._disposables.add(subscriptions);

    return new UniversalDisposable(
      // V1 providers have no way of terminating the streams, so unsubscribe just in case.
      subscriptions,
      () => {
        // When the provider package goes away, we need to invalidate its messages.
        store.invalidateMessages(provider, {scope: 'all'});
      },
    );
  }
}

createPackage(module.exports, Activation);
