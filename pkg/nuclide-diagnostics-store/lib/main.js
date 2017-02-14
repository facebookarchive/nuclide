'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.provideDiagnosticUpdates = provideDiagnosticUpdates;
exports.provideObservableDiagnosticUpdates = provideObservableDiagnosticUpdates;
exports.activate = activate;
exports.consumeLinterProvider = consumeLinterProvider;
exports.consumeDiagnosticsProviderV1 = consumeDiagnosticsProviderV1;
exports.consumeDiagnosticsProviderV2 = consumeDiagnosticsProviderV2;
exports.deactivate = deactivate;

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

let disposables = null;
let diagnosticStore = null;
let diagnosticUpdater = null;
let observableDiagnosticUpdater;

function addDisposable(disposable) {
  if (disposables) {
    disposables.add(disposable);
  } else {
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('disposables is null');
  }
}

function getDiagnosticStore() {
  if (!diagnosticStore) {
    diagnosticStore = new (_nuclideDiagnosticsCommon || _load_nuclideDiagnosticsCommon()).DiagnosticStore();
  }
  return diagnosticStore;
}

/**
 * @return A wrapper around the methods on DiagnosticStore that allow reading data.
 */
function provideDiagnosticUpdates() {
  if (!diagnosticUpdater) {
    const store = getDiagnosticStore();
    diagnosticUpdater = {
      onFileMessagesDidUpdate: store.onFileMessagesDidUpdate.bind(store),
      onProjectMessagesDidUpdate: store.onProjectMessagesDidUpdate.bind(store),
      onAllMessagesDidUpdate: store.onAllMessagesDidUpdate.bind(store),
      applyFix: store.applyFix.bind(store),
      applyFixesForFile: store.applyFixesForFile.bind(store)
    };
  }
  return diagnosticUpdater;
}

function provideObservableDiagnosticUpdates() {
  if (observableDiagnosticUpdater == null) {
    const store = getDiagnosticStore();
    observableDiagnosticUpdater = {
      getFileMessageUpdates: path => store.getFileMessageUpdates(path),
      projectMessageUpdates: store.getProjectMessageUpdates(),
      allMessageUpdates: store.getAllMessageUpdates(),
      applyFix: message => store.applyFix(message),
      applyFixesForFile: file => store.applyFixesForFile(file)
    };
  }
  return observableDiagnosticUpdater;
}

let consumeLegacyLinters = false;
let lintOnTheFly = false;
const allLinterAdapters = new Set();

function activate(state) {
  if (!disposables) {
    disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  // Returns mixed so a cast is necessary.
  consumeLegacyLinters = (_featureConfig || _load_featureConfig()).default.get(legacyLinterSetting);
  (_featureConfig || _load_featureConfig()).default.observe(legacyLinterSetting, newValue => {
    // To make this really solid, we should also probably trigger the linter
    // for the active text editor. Possibly more trouble than it's worth,
    // though, since this may be a temporary option.
    consumeLegacyLinters = newValue;
    allLinterAdapters.forEach(adapter => adapter.setEnabled(newValue));
  });

  lintOnTheFly = (_featureConfig || _load_featureConfig()).default.get(legacyLintOnTheFlySetting);
  (_featureConfig || _load_featureConfig()).default.observe(legacyLintOnTheFlySetting, newValue => {
    lintOnTheFly = newValue;
    allLinterAdapters.forEach(adapter => adapter.setLintOnFly(newValue));
  });
}

function consumeLinterProvider(provider) {
  const newAdapters = (0, (_LinterAdapterFactory || _load_LinterAdapterFactory()).createAdapters)(provider);
  const adapterDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  for (const adapter of newAdapters) {
    adapter.setEnabled(consumeLegacyLinters);
    adapter.setLintOnFly(lintOnTheFly);
    allLinterAdapters.add(adapter);
    const diagnosticDisposable = consumeDiagnosticsProviderV1(adapter);
    adapterDisposables.add(() => {
      diagnosticDisposable.dispose();
      adapter.dispose();
      allLinterAdapters.delete(adapter);
    });
    addDisposable(adapter);
  }
  return adapterDisposables;
}

function consumeDiagnosticsProviderV1(provider) {
  // Register the diagnostic store for updates from the new provider.
  const observableProvider = {
    updates: (0, (_event || _load_event()).observableFromSubscribeFunction)(provider.onMessageUpdate.bind(provider)),
    invalidations: (0, (_event || _load_event()).observableFromSubscribeFunction)(provider.onMessageInvalidation.bind(provider))
  };
  const disposable = consumeDiagnosticsProviderV2(observableProvider);
  addDisposable(disposable);
  return disposable;
}

function consumeDiagnosticsProviderV2(provider) {
  const compositeDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  const store = getDiagnosticStore();

  compositeDisposable.add(provider.updates.subscribe(update => store.updateMessages(provider, update), error => {
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Error: updates.subscribe ${error}`);
  }, () => {
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('updates.subscribe completed');
  }), provider.invalidations.subscribe(invalidation => store.invalidateMessages(provider, invalidation), error => {
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Error: invalidations.subscribe ${error}`);
  }, () => {
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('invalidations.subscribe completed');
  }), () => {
    store.invalidateMessages(provider, { scope: 'all' });
  });

  return compositeDisposable;
}

function deactivate() {
  if (disposables) {
    disposables.dispose();
    disposables = null;
  }
  if (diagnosticStore) {
    diagnosticStore.dispose();
    diagnosticStore = null;
  }
  diagnosticUpdater = null;
  observableDiagnosticUpdater = null;
}