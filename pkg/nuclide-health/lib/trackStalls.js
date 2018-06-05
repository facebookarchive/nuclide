'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = trackStalls;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _observeStalls;

function _load_observeStalls() {
  return _observeStalls = _interopRequireDefault(require('../../commons-atom/observeStalls'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function trackStalls() {
  const histogram = new (_nuclideAnalytics || _load_nuclideAnalytics()).HistogramTracker('event-loop-blocked',
  /* max */1000,
  /* buckets */10);

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(histogram, (0, (_observeStalls || _load_observeStalls()).default)().subscribe(duration => histogram.track(duration)));
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */