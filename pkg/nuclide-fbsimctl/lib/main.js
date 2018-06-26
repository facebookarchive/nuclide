'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDevices = getDevices;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const poller = createPoller(); /**
                                * Copyright (c) 2015-present, Facebook, Inc.
                                * All rights reserved.
                                *
                                * This source code is licensed under the license found in the LICENSE file in
                                * the root directory of this source tree.
                                *
                                * 
                                * @format
                                */

function getDevices() {
  return poller;
}

function createPoller() {
  return _rxjsBundlesRxMinJs.Observable.interval(2000).startWith(0).switchMap(() => _rxjsBundlesRxMinJs.Observable.defer(() => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFbsimctlServiceByNuclideUri)('').getDevices()).catch(error => {
    const friendlyError = new Error("Can't fetch iOS devices. Make sure that fbsimctl is in your $PATH and that it works properly.");
    if (error.code !== 'ENOENT') {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-fbsimctl:error', { error });
      (0, (_log4js || _load_log4js()).getLogger)().error(error);
    } else {
      // Keep the code so tooling higher up knows this is due to the tool missing.
      friendlyError.code = 'ENOENT';
    }
    return _rxjsBundlesRxMinJs.Observable.of(friendlyError);
  })).distinctUntilChanged((a, b) => {
    if (Array.isArray(a) && Array.isArray(b)) {
      return (0, (_collection || _load_collection()).arrayEqual)(a, b, (_shallowequal || _load_shallowequal()).default);
    } else if (a instanceof Error && b instanceof Error) {
      return a.message === b.message;
    } else {
      return false;
    }
  }).catch(error => {
    (0, (_log4js || _load_log4js()).getLogger)().error(error);
    return _rxjsBundlesRxMinJs.Observable.of([]);
  }).publishReplay(1).refCount();
}