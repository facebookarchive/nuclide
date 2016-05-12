Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.incompleteObservableFromPromise = incompleteObservableFromPromise;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rxjs2;

function _rxjs() {
  return _rxjs2 = _interopRequireDefault(require('rxjs'));
}

/**
 * Like `Rx.Observable.fromPromise`, but the resulting Observable sequence does not automatically
 * complete once the promise resolves.
 */
// $FlowIssue Rx.Observable.never should not influence merged type

function incompleteObservableFromPromise(promise) {
  return (_rxjs2 || _rxjs()).default.Observable.fromPromise(promise).merge((_rxjs2 || _rxjs()).default.Observable.never());
}