Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.provideDiagnosticUpdates = provideDiagnosticUpdates;
exports.provideObservableDiagnosticUpdates = provideObservableDiagnosticUpdates;
exports.activate = activate;
exports.consumeLinterProvider = consumeLinterProvider;
exports.consumeDiagnosticsProviderV1 = consumeDiagnosticsProviderV1;
exports.consumeDiagnosticsProviderV2 = consumeDiagnosticsProviderV2;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
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

var legacyLinterSetting = 'nuclide-diagnostics-store.consumeLegacyLinters';

var legacyLintOnTheFlySetting = 'nuclide-diagnostics-store.legacyLintOnTheFly';

var disposables = null;
var diagnosticStore = null;
var diagnosticUpdater = null;
var observableDiagnosticUpdater = undefined;

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
    var store = getDiagnosticStore();
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
    (function () {
      var store = getDiagnosticStore();
      observableDiagnosticUpdater = {
        getFileMessageUpdates: function getFileMessageUpdates(path) {
          return store.getFileMessageUpdates(path);
        },
        projectMessageUpdates: store.getProjectMessageUpdates(),
        allMessageUpdates: store.getAllMessageUpdates(),
        applyFix: function applyFix(message) {
          return store.applyFix(message);
        },
        applyFixesForFile: function applyFixesForFile(file) {
          return store.applyFixesForFile(file);
        }
      };
    })();
  }
  return observableDiagnosticUpdater;
}

var consumeLegacyLinters = false;
var lintOnTheFly = false;
var allLinterAdapters = new Set();

function activate(state) {
  if (!disposables) {
    disposables = new (_atom || _load_atom()).CompositeDisposable();
  }

  // Returns mixed so a cast is necessary.
  consumeLegacyLinters = (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.get(legacyLinterSetting);
  (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.observe(legacyLinterSetting, function (newValue) {
    // To make this really solid, we should also probably trigger the linter
    // for the active text editor. Possibly more trouble than it's worth,
    // though, since this may be a temporary option.
    consumeLegacyLinters = newValue;
    allLinterAdapters.forEach(function (adapter) {
      return adapter.setEnabled(newValue);
    });
  });

  lintOnTheFly = (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.get(legacyLintOnTheFlySetting);
  (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.observe(legacyLintOnTheFlySetting, function (newValue) {
    lintOnTheFly = newValue;
    allLinterAdapters.forEach(function (adapter) {
      return adapter.setLintOnFly(newValue);
    });
  });
}

function consumeLinterProvider(provider) {
  var newAdapters = (0, (_LinterAdapterFactory || _load_LinterAdapterFactory()).createAdapters)(provider);
  var adapterDisposables = new (_atom || _load_atom()).CompositeDisposable();

  var _loop = function (adapter) {
    adapter.setEnabled(consumeLegacyLinters);
    adapter.setLintOnFly(lintOnTheFly);
    allLinterAdapters.add(adapter);
    var diagnosticDisposable = consumeDiagnosticsProviderV1(adapter);
    var adapterDisposable = new (_atom || _load_atom()).Disposable(function () {
      diagnosticDisposable.dispose();
      adapter.dispose();
      allLinterAdapters.delete(adapter);
    });
    adapterDisposables.add(adapterDisposable);
    addDisposable(adapter);
  };

  for (var adapter of newAdapters) {
    _loop(adapter);
  }
  return adapterDisposables;
}

function consumeDiagnosticsProviderV1(provider) {
  // Register the diagnostic store for updates from the new provider.
  var observableProvider = {
    updates: (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(provider.onMessageUpdate.bind(provider)),
    invalidations: (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(provider.onMessageInvalidation.bind(provider))
  };
  var disposable = consumeDiagnosticsProviderV2(observableProvider);
  addDisposable(disposable);
  return disposable;
}

function consumeDiagnosticsProviderV2(provider) {
  var compositeDisposable = new (_atom || _load_atom()).CompositeDisposable();
  var store = getDiagnosticStore();

  compositeDisposable.add(new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(provider.updates.subscribe(function (update) {
    return store.updateMessages(provider, update);
  })));
  compositeDisposable.add(new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(provider.invalidations.subscribe(function (invalidation) {
    return store.invalidateMessages(provider, invalidation);
  })));
  compositeDisposable.add(new (_atom || _load_atom()).Disposable(function () {
    store.invalidateMessages(provider, { scope: 'all' });
  }));

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