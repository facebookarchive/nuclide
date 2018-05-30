'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createObservableForTunnels = createObservableForTunnels;
exports.createObservableForTunnel = createObservableForTunnel;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

var _Normalization;

function _load_Normalization() {
  return _Normalization = require('./Normalization');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./redux/Actions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function createObservableForTunnels(tunnels, store) {
  const observables = tunnels.map(t => createObservableForTunnel(t, store));
  const highOrder = _rxjsBundlesRxMinJs.Observable.from(observables);
  // $FlowFixMe combineAll
  return highOrder.combineAll().mapTo('ready');
}

function createObservableForTunnel(tunnel, store) {
  const resolved = (0, (_Normalization || _load_Normalization()).resolveTunnel)(tunnel);
  if ((0, (_shallowequal || _load_shallowequal()).default)(resolved.from, resolved.to)) {
    // Identical source/destination tunnels are always immediately ready, never close.
    // Makes it easy for users to call this function without branching on whether they need to.
    return _rxjsBundlesRxMinJs.Observable.of('ready').concat(_rxjsBundlesRxMinJs.Observable.never());
  }

  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    const subscription = {
      description: tunnel.description,
      onTunnelClose: error => {
        if (error == null) {
          observer.complete();
        } else {
          observer.error(error);
        }
      }
    };
    store.dispatch((_Actions || _load_Actions()).subscribeToTunnel(subscription, resolved, error => {
      if (error == null) {
        observer.next('ready');
      } else {
        observer.error(error);
      }
    }));

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => store.dispatch((_Actions || _load_Actions()).unsubscribeFromTunnel(subscription, resolved)));
  });
}