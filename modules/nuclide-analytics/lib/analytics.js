"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.track = track;
exports.isTrackSupported = isTrackSupported;
exports.setApplicationSessionObservable = setApplicationSessionObservable;

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

/**
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
// This is a stubbed implementation that other packages use to record analytics data & performance.
function track(eventName, values, immediate) {} // Other packages can check this to avoid doing work that will be ignored
// anyway by the stubbed track implementation.


function isTrackSupported() {
  return false;
}

function setApplicationSessionObservable(ob) {}