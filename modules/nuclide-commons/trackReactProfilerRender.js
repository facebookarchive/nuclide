"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = trackReactProfilerRender;

function _analytics() {
  const data = require("./analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const SAMPLE_RATE = 10;

function trackReactProfilerRender(id, phase, actualTime, baseTime, startTime, commitTime) {
  (0, _analytics().trackSampled)('react-profiler', SAMPLE_RATE, {
    id,
    phase,
    actualTime,
    baseTime,
    startTime,
    commitTime
  });
}