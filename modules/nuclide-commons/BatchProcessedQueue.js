"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});


// A Queue which will process elements at intervals, only if the
// queue contains any elements.
class BatchProcessedQueue {

  constructor(batchPeriod, handler) {
    this._batchPeriod = batchPeriod;
    this._handler = handler;
    this._timeoutId = null;
    this._items = [];
  }

  add(item) {
    this._items.push(item);
    if (this._timeoutId === null) {
      this._timeoutId = setTimeout(() => {
        this._handleBatch();
      }, this._batchPeriod);
    }
  }

  _handleBatch() {
    this._timeoutId = null;
    const batch = this._items;
    this._items = [];
    this._handler(batch);
  }

  dispose() {
    if (this._timeoutId !== null) {
      clearTimeout(this._timeoutId);
      this._handleBatch();
    }
  }
}
exports.default = BatchProcessedQueue; /**
                                        * Copyright (c) 2017-present, Facebook, Inc.
                                        * All rights reserved.
                                        *
                                        * This source code is licensed under the BSD-style license found in the
                                        * LICENSE file in the root directory of this source tree. An additional grant
                                        * of patent rights can be found in the PATENTS file in the same directory.
                                        *
                                        * 
                                        * @format
                                        */