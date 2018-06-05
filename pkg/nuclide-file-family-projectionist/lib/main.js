'use strict';

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _ProjectionistFileFamilyProvider;

function _load_ProjectionistFileFamilyProvider() {
  return _ProjectionistFileFamilyProvider = _interopRequireDefault(require('./ProjectionistFileFamilyProvider'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {
  constructor() {
    this._cwdApis = new _rxjsBundlesRxMinJs.BehaviorSubject(null);
  }

  activate() {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  dispose() {
    (0, (_nullthrows || _load_nullthrows()).default)(this._subscriptions).dispose();
  }

  consumeCwdApi(cwdApi) {
    this._cwdApis.next(cwdApi);
  }

  provideFileFamilyService() {
    return new (_ProjectionistFileFamilyProvider || _load_ProjectionistFileFamilyProvider()).default(this._cwdApis.asObservable());
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