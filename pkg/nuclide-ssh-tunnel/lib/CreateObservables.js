"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createObservableForTunnels = createObservableForTunnels;
exports.createObservableForTunnel = createObservableForTunnel;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _shallowequal() {
  const data = _interopRequireDefault(require("shallowequal"));

  _shallowequal = function () {
    return data;
  };

  return data;
}

function _Normalization() {
  const data = require("./Normalization");

  _Normalization = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

  const highOrder = _RxMin.Observable.from(observables); // $FlowFixMe combineAll


  return highOrder.combineAll().mapTo('ready');
}

function createObservableForTunnel(tunnel, store) {
  const resolved = (0, _Normalization().resolveTunnel)(tunnel);

  if ((0, _shallowequal().default)(resolved.from, resolved.to)) {
    // Identical source/destination tunnels are always immediately ready, never close.
    // Makes it easy for users to call this function without branching on whether they need to.
    return _RxMin.Observable.of('ready').concat(_RxMin.Observable.never());
  }

  return _RxMin.Observable.create(observer => {
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
    store.dispatch(Actions().subscribeToTunnel(subscription, resolved, error => {
      if (error == null) {
        observer.next('ready');
      } else {
        observer.error(error);
      }
    }));
    return new (_UniversalDisposable().default)(() => store.dispatch(Actions().unsubscribeFromTunnel(subscription, resolved)));
  });
}