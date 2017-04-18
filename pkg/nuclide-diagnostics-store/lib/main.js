'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideDiagnosticsCommon;

function _load_nuclideDiagnosticsCommon() {
  return _nuclideDiagnosticsCommon = require('../../nuclide-diagnostics-common');
}

var _LinterAdapterFactory;

function _load_LinterAdapterFactory() {
  return _LinterAdapterFactory = require('./LinterAdapterFactory');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const legacyLinterSetting = 'nuclide-diagnostics-store.consumeLegacyLinters'; /**
                                                                               * Copyright (c) 2015-present, Facebook, Inc.
                                                                               * All rights reserved.
                                                                               *
                                                                               * This source code is licensed under the license found in the LICENSE file in
                                                                               * the root directory of this source tree.
                                                                               *
                                                                               * 
                                                                               */

const legacyLintOnTheFlySetting = 'nuclide-diagnostics-store.legacyLintOnTheFly';

class Activation {

  constructor() {
    this._allLinterAdapters = new Set();

    // Returns mixed so a cast is necessary.
    this._consumeLegacyLinters = (_featureConfig || _load_featureConfig()).default.get(legacyLinterSetting);
    this._lintOnTheFly = (_featureConfig || _load_featureConfig()).default.get(legacyLintOnTheFlySetting);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((_featureConfig || _load_featureConfig()).default.observe(legacyLinterSetting, newValue => {
      // To make this really solid, we should also probably trigger the linter
      // for the active text editor. Possibly more trouble than it's worth,
      // though, since this may be a temporary option.
      this._consumeLegacyLinters = newValue;
      this._allLinterAdapters.forEach(adapter => adapter.setEnabled(newValue));
    }), (_featureConfig || _load_featureConfig()).default.observe(legacyLintOnTheFlySetting, newValue => {
      this._lintOnTheFly = newValue;
      this._allLinterAdapters.forEach(adapter => adapter.setLintOnFly(newValue));
    }));
  }

  dispose() {
    this._allLinterAdapters.forEach(adapter => adapter.dispose());
    this._allLinterAdapters.clear();
    this._disposables.dispose();
  }

  getDiagnosticStore() {
    if (this._diagnosticStore == null) {
      this._diagnosticStore = new (_nuclideDiagnosticsCommon || _load_nuclideDiagnosticsCommon()).DiagnosticStore();
      this._disposables.add(this._diagnosticStore);
    }
    return this._diagnosticStore;
  }

  /**
   * @return A wrapper around the methods on DiagnosticStore that allow reading data.
   */
  provideDiagnosticUpdates() {
    if (!this._diagnosticUpdater) {
      const store = this.getDiagnosticStore();
      this._diagnosticUpdater = {
        onFileMessagesDidUpdate: store.onFileMessagesDidUpdate.bind(store),
        onProjectMessagesDidUpdate: store.onProjectMessagesDidUpdate.bind(store),
        onAllMessagesDidUpdate: store.onAllMessagesDidUpdate.bind(store),
        applyFix: store.applyFix.bind(store),
        applyFixesForFile: store.applyFixesForFile.bind(store)
      };
    }
    return this._diagnosticUpdater;
  }

  provideObservableDiagnosticUpdates() {
    if (this._observableDiagnosticUpdater == null) {
      const store = this._diagnosticStore;
      this._observableDiagnosticUpdater = {
        getFileMessageUpdates: path => store.getFileMessageUpdates(path),
        projectMessageUpdates: store.getProjectMessageUpdates(),
        allMessageUpdates: store.getAllMessageUpdates(),
        applyFix: message => store.applyFix(message),
        applyFixesForFile: file => store.applyFixesForFile(file)
      };
    }
    return this._observableDiagnosticUpdater;
  }

  consumeLinterProvider(provider) {
    const newAdapters = (0, (_LinterAdapterFactory || _load_LinterAdapterFactory()).createAdapters)(provider);
    const adapterDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
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

  consumeDiagnosticsProviderV1(provider) {
    // Register the diagnostic store for updates from the new provider.
    const observableProvider = {
      updates: (0, (_event || _load_event()).observableFromSubscribeFunction)(provider.onMessageUpdate.bind(provider)),
      invalidations: (0, (_event || _load_event()).observableFromSubscribeFunction)(provider.onMessageInvalidation.bind(provider))
    };
    return this.consumeDiagnosticsProviderV2(observableProvider);
  }

  consumeDiagnosticsProviderV2(provider) {
    const store = this.getDiagnosticStore();

    const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(provider.updates.subscribe(update => store.updateMessages(provider, update), error => {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Error: updates.subscribe ${error}`);
    }, () => {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('updates.subscribe completed');
    }), provider.invalidations.subscribe(invalidation => store.invalidateMessages(provider, invalidation), error => {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Error: invalidations.subscribe ${error}`);
    }, () => {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('invalidations.subscribe completed');
    }));
    this._disposables.add(subscriptions);

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(
    // V1 providers have no way of terminating the streams, so unsubscribe just in case.
    subscriptions, () => {
      // When the provider package goes away, we need to invalidate its messages.
      store.invalidateMessages(provider, { scope: 'all' });
    });
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);