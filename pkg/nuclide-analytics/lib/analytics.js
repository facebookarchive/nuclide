"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.track = track;
exports.isTrackSupported = isTrackSupported;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 */
// This is a stubbed implementation that other packages use to record analytics data & performance.
function track(eventName, values, immediate) {} // Other packages can check this to avoid doing work that will be ignored
// anyway by the stubbed track implementation.


function isTrackSupported() {
  return false;
}