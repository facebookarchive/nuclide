'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PlatformService = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
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
    this._providersChanged = new _rxjsBundlesRxMinJs.Subject();
  }

  register(platformProvider) {
    this._registeredProviders.push(platformProvider);
    this._providersChanged.next();
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      const index = this._registeredProviders.indexOf(platformProvider);
      this._registeredProviders.splice(index, 1);
      this._providersChanged.next();
    });
  }

  getPlatformGroups(buckRoot, ruleType, buildTarget) {
    return this._providersChanged.startWith(undefined).switchMap(() => {
      const observables = this._registeredProviders.map(provider => provider(buckRoot, ruleType, buildTarget).race(_rxjsBundlesRxMinJs.Observable.timer(PROVIDER_TIMEOUT).switchMap(() => _rxjsBundlesRxMinJs.Observable.throw('Timed out'))).catch(error => {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-buck').error(`Getting buck platform groups from ${provider.name} failed:`, error);
        return _rxjsBundlesRxMinJs.Observable.of(null);
      }).defaultIfEmpty(null));
      return _rxjsBundlesRxMinJs.Observable.from(observables)
      // $FlowFixMe: type combineAll
      .combineAll().map(platformGroups => {
        return platformGroups.filter(p => p != null).sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
      });
    });
  }
}
exports.PlatformService = PlatformService;