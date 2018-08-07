"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trackTiming = trackTiming;
exports.trackSampled = exports.trackTimingSampled = exports.setRawAnalyticsService = exports.trackImmediate = exports.startTracking = exports.track = void 0;

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
function trackTiming(eventName, operation, values = {}) {
  return operation();
}

const track = jest.fn();
exports.track = track;

const startTracking = () => {
  const timingTracker = {
    onError: jest.fn(),
    onSuccess: jest.fn()
  };
  return timingTracker;
};

exports.startTracking = startTracking;
const trackImmediate = jest.fn();
exports.trackImmediate = trackImmediate;
const setRawAnalyticsService = jest.fn();
exports.setRawAnalyticsService = setRawAnalyticsService;
const trackTimingSampled = jest.fn((event, fn) => fn());
exports.trackTimingSampled = trackTimingSampled;
const trackSampled = jest.fn();
exports.trackSampled = trackSampled;