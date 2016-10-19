Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.observeStream = observeStream;
exports.observeRawStream = observeRawStream;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

/**
 * Observe a stream like stdout or stderr.
 */

function observeStream(stream) {
  return observeRawStream(stream).map(function (data) {
    return data.toString();
  });
}

function observeRawStream(stream) {
  var error = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromEvent(stream, 'error').flatMap((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw);
  return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromEvent(stream, 'data').merge(error).takeUntil((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromEvent(stream, 'end'));
}