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

exports.activate = activate;
exports.consumeLinterProvider = consumeLinterProvider;
exports.consumeDiagnosticsProviderV1 = consumeDiagnosticsProviderV1;
exports.consumeDiagnosticsProviderV2 = consumeDiagnosticsProviderV2;
exports.provideDiagnosticUpdates = provideDiagnosticUpdates;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _nuclideCommons = require('../../nuclide-commons');

var observableFromSubscribeFunction = _nuclideCommons.event.observableFromSubscribeFunction;

var legacyLinterSetting = 'nuclide-diagnostics-store.consumeLegacyLinters';

var legacyLintOnTheFlySetting = 'nuclide-diagnostics-store.legacyLintOnTheFly';

var disposables = null;
var diagnosticStore = null;
var diagnosticUpdater = null;

function addDisposable(disposable) {
  if (disposables) {
    disposables.add(disposable);
  } else {
    var logger = require('../../nuclide-logging').getLogger();
    logger.error('disposables is null');
  }
}

function getDiagnosticStore() {
  if (!diagnosticStore) {
    diagnosticStore = new (require('../../nuclide-diagnostics-base').DiagnosticStore)();
  }
  return diagnosticStore;
}

/**
 * @return A wrapper around the methods on DiagnosticStore that allow reading data.
 */
function getDiagnosticUpdater() {
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

var consumeLegacyLinters = false;
var lintOnTheFly = false;
var allLinterAdapters = new Set();

function activate(state) {
  if (!disposables) {
    disposables = new _atom.CompositeDisposable();
  }

  // Returns mixed so a cast is necessary.
  consumeLegacyLinters = _nuclideFeatureConfig2['default'].get(legacyLinterSetting);
  _nuclideFeatureConfig2['default'].observe(legacyLinterSetting, function (newValue) {
    // To make this really solid, we should also probably trigger the linter
    // for the active text editor. Possibly more trouble than it's worth,
    // though, since this may be a temporary option.
    consumeLegacyLinters = newValue;
    allLinterAdapters.forEach(function (adapter) {
      return adapter.setEnabled(newValue);
    });
  });

  lintOnTheFly = _nuclideFeatureConfig2['default'].get(legacyLintOnTheFlySetting);
  _nuclideFeatureConfig2['default'].observe(legacyLintOnTheFlySetting, function (newValue) {
    lintOnTheFly = newValue;
    allLinterAdapters.forEach(function (adapter) {
      return adapter.setLintOnFly(newValue);
    });
  });
}

function consumeLinterProvider(provider) {
  var _this = this;

  var _require = require('./LinterAdapterFactory');

  var createAdapters = _require.createAdapters;

  var newAdapters = createAdapters(provider);
  var adapterDisposables = new _atom.CompositeDisposable();

  var _loop = function (adapter) {
    adapter.setEnabled(consumeLegacyLinters);
    adapter.setLintOnFly(lintOnTheFly);
    allLinterAdapters.add(adapter);
    var diagnosticDisposable = _this.consumeDiagnosticsProviderV1(adapter);
    var adapterDisposable = new _atom.Disposable(function () {
      diagnosticDisposable.dispose();
      adapter.dispose();
      allLinterAdapters['delete'](adapter);
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
    updates: observableFromSubscribeFunction(provider.onMessageUpdate.bind(provider)),
    invalidations: observableFromSubscribeFunction(provider.onMessageInvalidation.bind(provider))
  };
  var disposable = this.consumeDiagnosticsProviderV2(observableProvider);
  addDisposable(disposable);
  return disposable;
}

function consumeDiagnosticsProviderV2(provider) {
  var compositeDisposable = new _atom.CompositeDisposable();
  var store = getDiagnosticStore();

  compositeDisposable.add(new _nuclideCommons.DisposableSubscription(provider.updates.subscribe(function (update) {
    return store.updateMessages(provider, update);
  })));
  compositeDisposable.add(new _nuclideCommons.DisposableSubscription(provider.invalidations.subscribe(function (invalidation) {
    return store.invalidateMessages(provider, invalidation);
  })));
  compositeDisposable.add(new _atom.Disposable(function () {
    store.invalidateMessages(provider, { scope: 'all' });
  }));

  return compositeDisposable;
}

function provideDiagnosticUpdates() {
  return getDiagnosticUpdater();
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