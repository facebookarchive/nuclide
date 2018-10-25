"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _FileFamilyAggregator() {
  const data = _interopRequireDefault(require("./FileFamilyAggregator"));

  _FileFamilyAggregator = function () {
    return data;
  };

  return data;
}

function _FileFamilyDashProvider() {
  const data = _interopRequireDefault(require("./FileFamilyDashProvider"));

  _FileFamilyDashProvider = function () {
    return data;
  };

  return data;
}

function _FileFamilyQuickOpenProvider() {
  const data = _interopRequireDefault(require("./FileFamilyQuickOpenProvider"));

  _FileFamilyQuickOpenProvider = function () {
    return data;
  };

  return data;
}

function _FileFamilyUtils() {
  const data = require("./FileFamilyUtils");

  _FileFamilyUtils = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
// $FlowFB
class Activation {
  constructor() {
    this._aggregators = new _RxMin.BehaviorSubject();
    this._cwds = new _RxMin.BehaviorSubject();
    this._providers = new _RxMin.BehaviorSubject(new Set());

    this._toggleAlternate = async () => {
      const provider = this._aggregator;

      if (provider == null) {
        return;
      }

      const activeEditor = atom.workspace.getActiveTextEditor();

      if (activeEditor == null) {
        return;
      }

      const activeUri = activeEditor.getURI();

      if (activeUri == null) {
        return;
      }

      const graph = await provider.getRelatedFiles(activeUri);
      const alternates = (0, _FileFamilyUtils().getAlternatesFromGraph)(graph, activeUri);

      if (alternates.length === 0) {
        atom.notifications.addError('Unable to locate any alternates for this file');
      } else if (alternates.length === 1) {
        await (0, _goToLocation().goToLocation)(alternates[0]);
      } else {
        atom.commands.dispatch(atom.workspace.getElement(), 'file-family-dash-provider:toggle-provider');
      }
    };
  }

  activate() {
    this._disposables = new (_UniversalDisposable().default)(atom.commands.add('atom-workspace', {
      'file:open-alternate': this._toggleAlternate
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  registerQuickOpenProvider() {
    return new (_FileFamilyQuickOpenProvider().default)(this._aggregators, this._cwds);
  }

  provideFileFamilyService() {
    if (this._aggregator) {
      return this._aggregator;
    }

    const aggregator = new (_FileFamilyAggregator().default)(this._providers.asObservable());
    this._aggregator = aggregator;

    this._aggregators.next(aggregator);

    this._disposables.add(aggregator);

    return aggregator;
  }

  consumeFileFamilyProvider(provider) {
    if (provider == null) {
      return new (_UniversalDisposable().default)();
    }

    const newProviders = new Set(this._providers.getValue());
    newProviders.add(provider);

    this._providers.next(newProviders);

    return new (_UniversalDisposable().default)(() => {
      const withoutProvider = new Set(this._providers.getValue());
      withoutProvider.delete(provider);

      this._providers.next(withoutProvider);
    });
  }

  consumeCwd(service) {
    this._cwds.next(service);
  }

  consumeDash(registerProvider) {
    const registerDisposable = registerProvider(new (_FileFamilyDashProvider().default)(this._aggregators, this._cwds));

    this._disposables.add(registerDisposable);
  }

}

(0, _createPackage().default)(module.exports, Activation);