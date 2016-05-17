

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var cachedResultForTrack = Promise.resolve();

// This is a stubbed implementation that other packages use to record analytics data & performance.
module.exports = {

  /**
   * Track a set of values against a named event.
   * @param eventName Name of the event to be tracked.
   * @param values The object containing the data to track.
   * @param immediate Bypass batching. The resulting promise will resolve on upload.
   */
  track: function track(eventName, values, immediate) {
    return cachedResultForTrack;
  }
};