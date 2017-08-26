'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _MessageRangeTracker;

function _load_MessageRangeTracker() {
  return _MessageRangeTracker = _interopRequireDefault(require('./MessageRangeTracker'));
}

var _DiagnosticUpdater;

function _load_DiagnosticUpdater() {
  return _DiagnosticUpdater = _interopRequireDefault(require('./services/DiagnosticUpdater'));
}

var _IndieLinterRegistry;

function _load_IndieLinterRegistry() {
  return _IndieLinterRegistry = _interopRequireDefault(require('./services/IndieLinterRegistry'));
}

var _LinterAdapterFactory;

function _load_LinterAdapterFactory() {
  return _LinterAdapterFactory = require('./services/LinterAdapterFactory');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./redux/Actions'));
}

var _createStore;

function _load_createStore() {
  return _createStore = _interopRequireDefault(require('./redux/createStore'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor() {
    this._allLinterAdapters = new Set();

    const messageRangeTracker = new (_MessageRangeTracker || _load_MessageRangeTracker()).default();
    this._store = (0, (_createStore || _load_createStore()).default)(messageRangeTracker);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(messageRangeTracker, () => {
      this._allLinterAdapters.forEach(adapter => adapter.dispose());
      this._allLinterAdapters.clear();
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  /**
   * @return A wrapper around the methods on DiagnosticStore that allow reading data.
   */
  provideDiagnosticUpdates() {
    return new (_DiagnosticUpdater || _load_DiagnosticUpdater()).default(this._store);
  }

  provideIndie() {
    const registry = new (_IndieLinterRegistry || _load_IndieLinterRegistry()).default();
    this._disposables.add(registry);
    return config => {
      const delegate = registry.register(config);
      const disposable = this.consumeDiagnosticsProviderV2(delegate);
      delegate.onDidDestroy(() => {
        disposable.dispose();
      });
      return delegate;
    };
  }

  consumeLinterProvider(provider) {
    const newAdapters = (0, (_LinterAdapterFactory || _load_LinterAdapterFactory()).createAdapters)(provider);
    const adapterDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    for (const adapter of newAdapters) {
      this._allLinterAdapters.add(adapter);
      const diagnosticDisposable = this.consumeDiagnosticsProviderV2({
        updates: adapter.getUpdates(),
        invalidations: adapter.getInvalidations()
      });
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
    this._store.dispatch((_Actions || _load_Actions()).addProvider(provider));
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._store.dispatch((_Actions || _load_Actions()).removeProvider(provider));
    });
  }
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
   */

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);