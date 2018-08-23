"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _MessageRangeTracker() {
  const data = _interopRequireDefault(require("./MessageRangeTracker"));

  _MessageRangeTracker = function () {
    return data;
  };

  return data;
}

function _DiagnosticUpdater() {
  const data = _interopRequireDefault(require("./services/DiagnosticUpdater"));

  _DiagnosticUpdater = function () {
    return data;
  };

  return data;
}

function _IndieLinterRegistry() {
  const data = _interopRequireDefault(require("./services/IndieLinterRegistry"));

  _IndieLinterRegistry = function () {
    return data;
  };

  return data;
}

function _LinterAdapterFactory() {
  const data = require("./services/LinterAdapterFactory");

  _LinterAdapterFactory = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _createStore() {
  const data = _interopRequireDefault(require("./redux/createStore"));

  _createStore = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class Activation {
  constructor() {
    this._allLinterAdapters = new Set();
    const messageRangeTracker = new (_MessageRangeTracker().default)();
    this._store = (0, _createStore().default)(messageRangeTracker);
    this._disposables = new (_UniversalDisposable().default)(messageRangeTracker, () => {
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
    return new (_DiagnosticUpdater().default)(this._store);
  }

  provideIndie() {
    const registry = new (_IndieLinterRegistry().default)();

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

  consumeBusySignal(service) {
    this._busySignalService = service;
    return new (_UniversalDisposable().default)(() => {
      this._busySignalService = null;
    });
  }

  _reportBusy(title) {
    if (this._busySignalService != null) {
      return this._busySignalService.reportBusy(title);
    }

    return new (_UniversalDisposable().default)();
  }

  consumeCodeActionFetcher(fetcher) {
    this._store.dispatch(Actions().setCodeActionFetcher(fetcher));

    return new (_UniversalDisposable().default)(() => {
      if (!(this._store.getState().codeActionFetcher === fetcher)) {
        throw new Error("Invariant violation: \"this._store.getState().codeActionFetcher === fetcher\"");
      }

      this._store.dispatch(Actions().setCodeActionFetcher(null));
    });
  }

  consumeLinterProvider(providers_) {
    const providers = Array.isArray(providers_) ? providers_ : [providers_];
    const adapterDisposables = new (_UniversalDisposable().default)();

    for (const provider of providers) {
      const adapter = (0, _LinterAdapterFactory().createAdapter)(provider, title => this._reportBusy(title));

      if (adapter == null) {
        continue;
      }

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
      updates: (0, _event().observableFromSubscribeFunction)(provider.onMessageUpdate.bind(provider)),
      invalidations: (0, _event().observableFromSubscribeFunction)(provider.onMessageInvalidation.bind(provider))
    };
    return this.consumeDiagnosticsProviderV2(observableProvider);
  }

  consumeDiagnosticsProviderV2(provider) {
    this._store.dispatch(Actions().addProvider(provider));

    return new (_UniversalDisposable().default)(() => {
      this._store.dispatch(Actions().removeProvider(provider));
    });
  }

}

(0, _createPackage().default)(module.exports, Activation);