'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This is a stubbed implementation that other packages use to record analytics data & performance.
module.exports = {

  /**
  * Track a set of values against a named event.
  * @param eventName Name of the event to be tracked.
  * @param values The object containing the data to track.
  */
  track(key: string, values: any) {},

  /**
  * Measure the execution time of a synchronous function and track its duration.
  * @param eventName Name of the event to be tracked.
  * @param functionToTrack The zero argument function or lambda whose execution will be timed.
  * @returns The result of functionToTrack.
  */
  trackTimingAndCall(eventName: string, functionToTrack: () => ?any): ?any {
    return functionToTrack();
  },

  /**
  * Measure the execution time of an asynchronous function (returning a Promise) and track its duration.
  * @param eventName Name of the event to be tracked.
  * @param functionToTrack The zero argument function or lambda whose resolution or rejection will be timed.
  * @returns The result of functionToTrack.
  */
  trackTimingAndCallAsync(eventName: string, asyncFunctionToTrack: () => Promise): Promise {
    return asyncFunctionToTrack();
  },

};
