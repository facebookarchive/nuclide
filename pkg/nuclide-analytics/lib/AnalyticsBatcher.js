'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnalyticsBatcher = undefined;

var _BatchProcessedQueue;

function _load_BatchProcessedQueue() {
  return _BatchProcessedQueue = _interopRequireDefault(require('nuclide-commons/BatchProcessedQueue'));
}

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

const REPORTING_PERIOD = 1000;

class AnalyticsBatcher {

  constructor(track) {
    this._track = track;
    this._queue = new (_BatchProcessedQueue || _load_BatchProcessedQueue()).default(REPORTING_PERIOD, events => {
      this._handleBatch(events);
    });
  }

  _handleBatch(events) {
    this._track(events);
  }

  track(key, values) {
    this._queue.add({ key, values });
  }

  dispose() {
    this._queue.dispose();
  }
}
exports.AnalyticsBatcher = AnalyticsBatcher;