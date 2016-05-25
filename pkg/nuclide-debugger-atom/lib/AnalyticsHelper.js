Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.beginTimerTracking = beginTimerTracking;
exports.failTimerTracking = failTimerTracking;
exports.endTimerTracking = endTimerTracking;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var timer = null;

function beginTimerTracking(eventName) {
  timer = (0, (_nuclideAnalytics2 || _nuclideAnalytics()).startTracking)(eventName);
}

function failTimerTracking(err) {
  if (timer !== null) {
    timer.onError(err);
    timer = null;
  }
}

function endTimerTracking() {
  if (timer !== null) {
    timer.onSuccess();
    timer = null;
  }
}