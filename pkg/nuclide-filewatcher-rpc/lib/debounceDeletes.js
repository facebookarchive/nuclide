"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = debounceDeletes;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

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

function debounceDeletes(resultStream) {
  const shared = resultStream.share();
  return shared.mergeMap(change => {
    switch (change.type) {
      case 'change':
        return _RxMin.Observable.of(change);

      case 'delete':
        return _RxMin.Observable.of(change).delay(DELETE_DELAY).takeUntil(shared);
    }

    throw new Error('unknown change type');
  }).let((0, _observable().takeWhileInclusive)(change => change.type !== 'delete'));
}