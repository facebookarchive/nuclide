'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class NullTimingTracker {
  constructor(name) {}
  onError(error) {}
  onSuccess() {}
}

const NullService = {
  track(eventName, values) {},
  trackEvent(event) {},
  trackEvents(events) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();
  },
  trackImmediate(eventName, values) {
    return Promise.resolve();
  },
  startTracking(eventName) {
    return new NullTimingTracker(eventName);
  },
  trackTiming(eventName, operation) {
    return operation();
  },
  TimingTracker: NullTimingTracker
};

let service = NullService;
atom.packages.serviceHub.consume('nuclide-analytics', '0.0.0', analyticsService => {
  // es module export is a live binding, so modifying this updates the value
  // for the consumer
  service = analyticsService;
});

exports.default = service;