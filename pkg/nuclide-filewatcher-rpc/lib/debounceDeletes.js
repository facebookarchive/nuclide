'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = debounceDeletes;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

const DELETE_DELAY = 1000;

/**
 * Editors and command-line tools (e.g. Mercurial) often do atomic file writes by doing:
 *
 *  mv x x.tmp
 *  mv newfile x
 *
 * Watchman registers this as a file delete followed by a create.
 * This causes unnecessary churn for the Nuclide client.
 *
 * Instead, delay all delete events and cancel them if a change event interrupts them.
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

function debounceDeletes(resultStream) {
  const shared = resultStream.share();
  return (0, (_observable || _load_observable()).takeWhileInclusive)(shared.mergeMap(change => {
    switch (change.type) {
      case 'change':
        return _rxjsBundlesRxMinJs.Observable.of(change);
      case 'delete':
        return _rxjsBundlesRxMinJs.Observable.of(change).delay(DELETE_DELAY).takeUntil(shared);
    }
    throw new Error('unknown change type');
  }), change => change.type !== 'delete');
}