'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nuclideFuzzyNative;

function _load_nuclideFuzzyNative() {
  return _nuclideFuzzyNative = require('../../../nuclide-fuzzy-native');
}

/**
 * This class batches all adds/removes from the same tick into one batch add/remove call.
 * Since the Matcher class is a native node module, this is several orders of magnitude
 * faster when dealing with large sets of files (> 10000).
 */
class ExportMatcher {
  constructor() {
    this._matcher = new (_nuclideFuzzyNative || _load_nuclideFuzzyNative()).Matcher([]);
    this._batchScheduled = false;
    this._batch = new Map();

    this._performBatch = () => {
      const toAdd = [];
      const toRemove = [];
      this._batch.forEach((added, item) => {
        if (added) {
          toAdd.push(item);
        } else {
          toRemove.push(item);
        }
      });
      this._matcher.addCandidates(toAdd);
      this._matcher.removeCandidates(toRemove);
      this._batch.clear();
      this._batchScheduled = false;
    };
  }

  // true = add, false = delete


  add(item) {
    this._batch.set(item, true);
    this._schedule();
  }

  remove(item) {
    this._batch.set(item, false);
    this._schedule();
  }

  match(query, options) {
    // In practice, it's unlikely that we look for a match and mutate in the same tick.
    // But just in case...
    this._performBatch();
    return this._matcher.match(query, options);
  }

  _schedule() {
    if (!this._batchScheduled) {
      this._batchScheduled = true;
      process.nextTick(this._performBatch);
    }
  }

}
exports.default = ExportMatcher; /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  * @format
                                  */