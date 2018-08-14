"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = trackStalls;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _observeStalls() {
  const data = _interopRequireDefault(require("../../commons-atom/observeStalls"));

  _observeStalls = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
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
function trackStalls() {
  const histogram = new (_nuclideAnalytics().HistogramTracker)('event-loop-blocked',
  /* max */
  1000,
  /* buckets */
  10);
  return new (_UniversalDisposable().default)(histogram, (0, _observeStalls().default)().subscribe(duration => histogram.track(duration)));
}