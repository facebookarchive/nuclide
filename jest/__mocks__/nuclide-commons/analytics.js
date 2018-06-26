"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trackTiming = trackTiming;
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

const track = exports.track = jest.fn();

const startTracking = exports.startTracking = () => {
  const timingTracker = {
    onError: jest.fn(),
    onSuccess: jest.fn()
  };

  return timingTracker;
};

const trackImmediate = exports.trackImmediate = jest.fn();

const setRawAnalyticsService = exports.setRawAnalyticsService = jest.fn();

const trackTimingSampled = exports.trackTimingSampled = jest.fn((event, fn) => fn());

const trackSampled = exports.trackSampled = jest.fn();