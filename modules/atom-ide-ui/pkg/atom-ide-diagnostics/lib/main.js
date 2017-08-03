/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {
  CallbackDiagnosticProvider,
  LinterProvider,
  ObservableDiagnosticProvider,
  ObservableDiagnosticUpdater,
  RegisterIndieLinter,
} from './types';
import type {LinterAdapter} from './services/LinterAdapter';

import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';

import DiagnosticStore from './DiagnosticStore';
import DiagnosticUpdater from './services/DiagnosticUpdater';
import {createAdapters} from './services/LinterAdapterFactory';
import IndieLinterRegistry from './services/IndieLinterRegistry';

class Activation {
  _disposables: UniversalDisposable;
  _diagnosticStore: DiagnosticStore;

  _observableDiagnosticUpdater: ?ObservableDiagnosticUpdater;

  _allLinterAdapters: Set<LinterAdapter>;
  _indieRegistry: ?IndieLinterRegistry;

  constructor() {
    this._allLinterAdapters = new Set();
    this._diagnosticStore = new DiagnosticStore();

    this._disposables = new UniversalDisposable(this._diagnosticStore, () => {
      this._allLinterAdapters.forEach(adapter => adapter.dispose());
      this._allLinterAdapters.clear();
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  _getIndieRegistry(): IndieLinterRegistry {
    if (this._indieRegistry == null) {
      const registry = new IndieLinterRegistry();
      this._disposables.add(registry);
      this._indieRegistry = registry;
      return registry;
    }
    return this._indieRegistry;
  }

  /**
   * @return A wrapper around the methods on DiagnosticStore that allow reading data.
   */
  provideDiagnosticUpdates(): DiagnosticUpdater {
    return new DiagnosticUpdater(this._diagnosticStore);
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

  provideIndie(): RegisterIndieLinter {
    return config => {
      const delegate = this._getIndieRegistry().register(config);
      const disposable = this.consumeDiagnosticsProviderV2(delegate);
      delegate.onDidDestroy(() => {
        disposable.dispose();
      });
      return delegate;
    };
  }

  consumeLinterProvider(
    provider: LinterProvider | Array<LinterProvider>,
  ): IDisposable {
    const newAdapters = createAdapters(provider);
    const adapterDisposables = new UniversalDisposable();
    for (const adapter of newAdapters) {
      this._allLinterAdapters.add(adapter);
      const diagnosticDisposable = this.consumeDiagnosticsProviderV2({
        updates: adapter.getUpdates(),
        invalidations: adapter.getInvalidations(),
      });
      adapterDisposables.add(() => {
        diagnosticDisposable.dispose();
        adapter.dispose();
        this._allLinterAdapters.delete(adapter);
      });
    }
    return adapterDisposables;
  }

  consumeDiagnosticsProviderV1(
    provider: CallbackDiagnosticProvider,
  ): IDisposable {
    // Register the diagnostic store for updates from the new provider.
    const observableProvider = {
      updates: observableFromSubscribeFunction(
        provider.onMessageUpdate.bind(provider),
      ),
      invalidations: observableFromSubscribeFunction(
        provider.onMessageInvalidation.bind(provider),
      ),
    };
    return this.consumeDiagnosticsProviderV2(observableProvider);
  }

  consumeDiagnosticsProviderV2(
    provider: ObservableDiagnosticProvider,
  ): IDisposable {
    return this._diagnosticStore.addProvider(provider);
  }
}

createPackage(module.exports, Activation);
