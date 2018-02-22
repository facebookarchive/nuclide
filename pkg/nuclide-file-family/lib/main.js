'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
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

class Activation {

  constructor() {
    this._providers = new _rxjsBundlesRxMinJs.BehaviorSubject(new Set());

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  dispose() {
    this._disposables.dispose();
  }

  provideFileFamilyService() {
    return new (_FileFamilyAggregator || _load_FileFamilyAggregator()).default(this._providers.asObservable());
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
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);