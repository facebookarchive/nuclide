'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _FileFamilyAggregator;

function _load_FileFamilyAggregator() {
  return _FileFamilyAggregator = _interopRequireDefault(require('./FileFamilyAggregator'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class Activation {
  constructor() {
    var _this = this;

    this._providers = new _rxjsBundlesRxMinJs.BehaviorSubject(new Set());
    this._toggleAlternate = (0, _asyncToGenerator.default)(function* () {
      const provider = _this._aggregator;
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

      const graph = yield provider.getRelatedFiles(activeUri);
      const testRelation = graph.relations.find(function (r) {
        return r.from === activeUri && (r.labels.has('test') || r.labels.has('alternate'));
      });
      if (testRelation != null) {
        yield (0, (_goToLocation || _load_goToLocation()).goToLocation)(testRelation.to);
      }
    });
  }

  activate() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-workspace', {
      'file:open-alternate': this._toggleAlternate
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  provideFileFamilyService() {
    if (this._aggregator) {
      return this._aggregator;
    }

    const aggregator = new (_FileFamilyAggregator || _load_FileFamilyAggregator()).default(this._providers.asObservable());
    this._aggregator = aggregator;
    this._disposables.add(aggregator);
    return aggregator;
  }

  consumeFileFamilyProvider(provider) {
    const newProviders = new Set(this._providers.getValue());
    newProviders.add(provider);
    this._providers.next(newProviders);

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      const withoutProvider = new Set(this._providers.getValue());
      withoutProvider.delete(provider);
      this._providers.next(withoutProvider);
    });
  }

}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);