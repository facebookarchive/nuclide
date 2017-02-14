'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeStream = observeStream;
exports.observeRawStream = observeRawStream;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * Observe a stream like stdout or stderr.
 */
function observeStream(stream) {
  return observeRawStream(stream).map(data => data.toString());
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function observeRawStream(stream) {
  const error = _rxjsBundlesRxMinJs.Observable.fromEvent(stream, 'error').flatMap(_rxjsBundlesRxMinJs.Observable.throw);
  return _rxjsBundlesRxMinJs.Observable.fromEvent(stream, 'data').merge(error).takeUntil(_rxjsBundlesRxMinJs.Observable.fromEvent(stream, 'end'));
}