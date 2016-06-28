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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideDiagnosticsBase2;

function _nuclideDiagnosticsBase() {
  return _nuclideDiagnosticsBase2 = require('../../nuclide-diagnostics-base');
}

var _LinterAdapterFactory2;

function _LinterAdapterFactory() {
  return _LinterAdapterFactory2 = require('./LinterAdapterFactory');
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
    (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('disposables is null');
  }
}

function getDiagnosticStore() {
  if (!diagnosticStore) {
    diagnosticStore = new (_nuclideDiagnosticsBase2 || _nuclideDiagnosticsBase()).DiagnosticStore();
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
    disposables = new (_atom2 || _atom()).CompositeDisposable();
  }

  // Returns mixed so a cast is necessary.
  consumeLegacyLinters = (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get(legacyLinterSetting);
  (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.observe(legacyLinterSetting, function (newValue) {
    // To make this really solid, we should also probably trigger the linter
    // for the active text editor. Possibly more trouble than it's worth,
    // though, since this may be a temporary option.
    consumeLegacyLinters = newValue;
    allLinterAdapters.forEach(function (adapter) {
      return adapter.setEnabled(newValue);
    });
  });

  lintOnTheFly = (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get(legacyLintOnTheFlySetting);
  (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.observe(legacyLintOnTheFlySetting, function (newValue) {
    lintOnTheFly = newValue;
    allLinterAdapters.forEach(function (adapter) {
      return adapter.setLintOnFly(newValue);
    });
  });
}

function consumeLinterProvider(provider) {
  var newAdapters = (0, (_LinterAdapterFactory2 || _LinterAdapterFactory()).createAdapters)(provider);
  var adapterDisposables = new (_atom2 || _atom()).CompositeDisposable();

  var _loop = function (adapter) {
    adapter.setEnabled(consumeLegacyLinters);
    adapter.setLintOnFly(lintOnTheFly);
    allLinterAdapters.add(adapter);
    var diagnosticDisposable = consumeDiagnosticsProviderV1(adapter);
    var adapterDisposable = new (_atom2 || _atom()).Disposable(function () {
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
    updates: (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(provider.onMessageUpdate.bind(provider)),
    invalidations: (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(provider.onMessageInvalidation.bind(provider))
  };
  var disposable = consumeDiagnosticsProviderV2(observableProvider);
  addDisposable(disposable);
  return disposable;
}

function consumeDiagnosticsProviderV2(provider) {
  var compositeDisposable = new (_atom2 || _atom()).CompositeDisposable();
  var store = getDiagnosticStore();

  compositeDisposable.add(new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(provider.updates.subscribe(function (update) {
    return store.updateMessages(provider, update);
  })));
  compositeDisposable.add(new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(provider.invalidations.subscribe(function (invalidation) {
    return store.invalidateMessages(provider, invalidation);
  })));
  compositeDisposable.add(new (_atom2 || _atom()).Disposable(function () {
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
}