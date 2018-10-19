"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PlatformService = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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
const PROVIDER_TIMEOUT = 5000; // 5s

class PlatformService {
  constructor() {
    this._registeredProviders = [];
    this._providersChanged = new _RxMin.Subject();
  }

  register(platformProvider) {
    this._registeredProviders.push(platformProvider);

    this._providersChanged.next();

    return new (_UniversalDisposable().default)(() => {
      const index = this._registeredProviders.indexOf(platformProvider);

      this._registeredProviders.splice(index, 1);

      this._providersChanged.next();
    });
  }

  getPlatformGroups(buckRoot, ruleType, buildTarget) {
    return this._providersChanged.startWith(undefined).switchMap(() => {
      const observables = this._registeredProviders.map(provider => provider(buckRoot, ruleType, buildTarget).race(_RxMin.Observable.timer(PROVIDER_TIMEOUT).switchMap(() => _RxMin.Observable.throw('Timed out'))).catch(error => {
        (0, _log4js().getLogger)('nuclide-buck').error(`Getting buck platform groups from ${provider.name} failed:`, error);
        return _RxMin.Observable.of(null);
      }).defaultIfEmpty(null));

      return _RxMin.Observable.from(observables) // $FlowFixMe: type combineAll
      .combineAll().map(platformGroups => {
        return platformGroups.filter(p => p != null).sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
      });
    });
  }

}

exports.PlatformService = PlatformService;