"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _passesGK() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/passesGK"));

  _passesGK = function () {
    return data;
  };

  return data;
}

function _createAutocompleteProvider() {
  const data = _interopRequireDefault(require("./createAutocompleteProvider"));

  _createAutocompleteProvider = function () {
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

/**
 * Autocomplete is extremely critical to the user experience!
 * Don't tolerate anything longer than AUTOCOMPLETE_TIMEOUT seconds; just fail
 * fast and let the fallback providers provide something at least.
 *
 * NOTE: We keep a higher time limit for only testing envirnoment since the
 * autocomplete check happens right after you open the file and providers don't
 * have enough time to initialize.
 */
const DEFAULT_AUTOCOMPLETE_TIMEOUT = atom.inSpecMode() ? 3000 : 500;

class Activation {
  constructor() {
    this._timeoutValue = DEFAULT_AUTOCOMPLETE_TIMEOUT;
    this._disposables = new (_UniversalDisposable().default)( // If we pass the configurable timeout gk, then update the timeout value
    // when configuration changes.
    _rxjsCompatUmdMin.Observable.combineLatest(_rxjsCompatUmdMin.Observable.fromPromise((0, _passesGK().default)('nuclide_autocomplete_configurable_timeout')), _featureConfig().default.observeAsStream('nuclide-autocomplete.timeout')).subscribe(([gkResult, value]) => {
      if (gkResult) {
        // value is an integer, as defined in package.json.
        this._timeoutValue = Number(value);
      }
    }));
  }

  consumeProvider(_provider) {
    const providers = Array.isArray(_provider) ? _provider : [_provider];
    const disposables = providers.map(provider => atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', (0, _createAutocompleteProvider().default)(provider, () => this._timeoutValue)));
    return new (_UniversalDisposable().default)(...disposables);
  }

  dispose() {
    this._disposables.dispose();
  }

}

(0, _createPackage().default)(module.exports, Activation);