'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SimpleModel = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _symbolObservable;

function _load_symbolObservable() {
  return _symbolObservable = _interopRequireDefault(require('symbol-observable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Exposes a simple, React-like OO API for a stateful model. Implements `Symbol.observable` so you
 * can easily convert to an observable stream.
 */
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

class SimpleModel {

  constructor() {
    this._states = new _rxjsBundlesRxMinJs.Subject();
    this._states.subscribe(state => {
      this.state = state;
    });

    // Create an observable that contains the current, and all future, states. Since the initial
    // state is set directly (assigned to `this.state`), we can't just use a ReplaySubject
    // TODO: Use a computed property key when that's supported.
    this[(_symbolObservable || _load_symbolObservable()).default] = () => _rxjsBundlesRxMinJs.Observable.of(this.state).concat(this._states);
  }

  setState(newState) {
    const nextState = Object.assign({}, this.state, newState);
    this._states.next(nextState);
  }
}
exports.SimpleModel = SimpleModel;