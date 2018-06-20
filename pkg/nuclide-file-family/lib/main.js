'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../modules/nuclide-commons-atom/go-to-location');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _FileFamilyAggregator;

function _load_FileFamilyAggregator() {
  return _FileFamilyAggregator = _interopRequireDefault(require('./FileFamilyAggregator'));
}

var _FileFamilyDashProvider;

function _load_FileFamilyDashProvider() {
  return _FileFamilyDashProvider = _interopRequireDefault(require('./FileFamilyDashProvider'));
}

var _FileFamilyQuickOpenProvider;

function _load_FileFamilyQuickOpenProvider() {
  return _FileFamilyQuickOpenProvider = _interopRequireDefault(require('./FileFamilyQuickOpenProvider'));
}

var _FileFamilyUtils;

function _load_FileFamilyUtils() {
  return _FileFamilyUtils = require('./FileFamilyUtils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {
  constructor() {
    this._aggregators = new _rxjsBundlesRxMinJs.BehaviorSubject();
    this._cwds = new _rxjsBundlesRxMinJs.BehaviorSubject();
    this._providers = new _rxjsBundlesRxMinJs.BehaviorSubject(new Set());

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
      const alternates = (0, (_FileFamilyUtils || _load_FileFamilyUtils()).getAlternatesFromGraph)(graph, activeUri);
      if (alternates.length === 0) {
        atom.notifications.addError('Unable to locate any alternates for this file');
      } else if (alternates.length === 1) {
        await (0, (_goToLocation || _load_goToLocation()).goToLocation)(alternates[0]);
      } else {
        atom.commands.dispatch(atom.workspace.getElement(), 'file-family-dash-provider:toggle-provider');
      }
    };
  }

  activate() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-workspace', {
      'file:open-alternate': this._toggleAlternate
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  registerQuickOpenProvider() {
    return new (_FileFamilyQuickOpenProvider || _load_FileFamilyQuickOpenProvider()).default(this._aggregators, this._cwds);
  }

  provideFileFamilyService() {
    if (this._aggregator) {
      return this._aggregator;
    }

    const aggregator = new (_FileFamilyAggregator || _load_FileFamilyAggregator()).default(this._providers.asObservable());
    this._aggregator = aggregator;
    this._aggregators.next(aggregator);
    this._disposables.add(aggregator);

    return aggregator;
  }

  consumeFileFamilyProvider(provider) {
    if (provider == null) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default();
    }

    const newProviders = new Set(this._providers.getValue());
    newProviders.add(provider);
    this._providers.next(newProviders);

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      const withoutProvider = new Set(this._providers.getValue());
      withoutProvider.delete(provider);
      this._providers.next(withoutProvider);
    });
  }

  consumeCwd(service) {
    this._cwds.next(service);
  }

  consumeDash(registerProvider) {
    const registerDisposable = registerProvider(new (_FileFamilyDashProvider || _load_FileFamilyDashProvider()).default(this._aggregators, this._cwds));
    this._disposables.add(registerDisposable);
  }

} /**
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


(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);