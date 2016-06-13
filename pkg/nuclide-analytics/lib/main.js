'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Rx from 'rxjs';

import invariant from 'assert';
import {DisposableSubscription} from '../../commons-node/stream';
import {isPromise} from '../../commons-node/promise';
import {track as rawTrack} from './track';
import {HistogramTracker} from './HistogramTracker';

export type TrackingEvent = {
  type: string;
  data?: Object;
};

function track(eventName: string, values?: {[key: string]: mixed}): Promise<mixed> {
  invariant(rawTrack);
  return rawTrack(eventName, values || {});
}

/**
 * Track an analytics event and send it off immediately.
 * The returned promise will resolve when the request completes (or reject on failure).
 */
function trackImmediate(eventName: string, values?: {[key: string]: mixed}): Promise<mixed> {
  invariant(rawTrack);
  return rawTrack(eventName, values || {}, true);
}

/**
 * An alternative interface for `track` that accepts a single event object. This is particularly
 * useful when dealing with streams (Observables).
 */
function trackEvent(event: TrackingEvent): Promise<mixed> {
  return track(event.type, event.data);
}

/**
 * Track each event in a stream of TrackingEvents.
 */
function trackEvents(events: Rx.Observable<TrackingEvent>): IDisposable {
  return new DisposableSubscription(events.subscribe(trackEvent));
}

/**
 * A decorator factory (https://github.com/wycats/javascript-decorators) who measures the execution
 * time of an asynchronous/synchronous function which belongs to either a Class or an Object.
 * Usage:
 *
 * ```
 * Class Test{
 *   @trackTiming()
 *   foo(...) {...}
 *
 *   @trackTiming()
 *   bar(...): Promise {...}
 * }
 *
 * const obj = {
 *   @trackTiming('fooEvent')
 *   foo(...) {...}
 * }
 * ```
 *
 * @param eventName Name of the event to be tracked. It's optional and default value is
 *    `$className.$methodName` for Class method or `Object.$methodName` for Object method.
 * @returns A decorator.
 */
function trackTiming(eventName: ?string = null): any {

  return (target: any, name: string, descriptor: any) => {
    const originalMethod = descriptor.value;

    // We can't use arrow function here as it will bind `this` to the context of enclosing function
    // which is trackTiming, whereas what needed is context of originalMethod.
    descriptor.value = function(...args) {
      if (!eventName) {
        const constructorName = this.constructor ? this.constructor.name : undefined;
        eventName = `${constructorName}.${name}`;
      }

      return trackOperationTiming(eventName,
        // Must use arrow here to get correct 'this'
        () => originalMethod.apply(this, args));
    };
  };
}

/**
 * Obtain a monotonically increasing timestamp in milliseconds, if possible.
 * If `window.performance` is unavailable (e.g. in Node), use process.hrtime.
 * Fall back to `Date.now` otherwise – note that `Date.now` does not guarantee timestamps to
 * increase monotonically, and is thus subject to system clock updates.
 *
 * Wrapped in a function rather than a module constant to facilitate testing.
 */
const getTimestamp = (): number => {
  const timingFunction = (global.performance != null)
    ? () => Math.round(global.performance.now())
    : (process != null && typeof process.hrtime === 'function')
      ? () => {
        const hr = process.hrtime();
        return Math.round((hr[0] * 1e9 + hr[1]) / 1e6);
      }
      : Date.now;
  return timingFunction();
};

const PERFORMANCE_EVENT = 'performance';

class TimingTracker {
  _eventName: string;
  _startTime: number;

  constructor(eventName: string) {
    this._eventName = eventName;
    this._startTime = getTimestamp();
  }

  onError(error: Error): Promise<any> {
    return this._trackTimingEvent(error);
  }

  onSuccess(): Promise<any> {
    return this._trackTimingEvent(/* error */ null);
  }

  _trackTimingEvent(exception: ?Error): Promise<any> {
    return track(PERFORMANCE_EVENT, {
      duration: (getTimestamp() - this._startTime).toString(),
      eventName: this._eventName,
      error: exception ? '1' : '0',
      exception: exception ? exception.toString() : '',
    });
  }
}

function startTracking(eventName: string): TimingTracker {
  return new TimingTracker(eventName);
}

/**
 * Reports analytics including timing for a single operation.
 *
 * Usage:
 *
 * analytics.trackOperationTiming('my-package-some-long-operation' () => doit());
 *
 * Returns (or throws) the result of the operation.
 */
function trackOperationTiming<T>(eventName: string, operation: () => T): T {

  const tracker = startTracking(eventName);

  try {
    const result = operation();

    if (isPromise(result)) {
      // Atom uses a different Promise implementation than Nuclide, so the following is not true:
      // invariant(result instanceof Promise);

      // For the method returning a Promise, track the time after the promise is resolved/rejected.
      return (result: any).then(value => {
        tracker.onSuccess();
        return value;
      }, reason => {
        tracker.onError(reason instanceof Error ? reason : new Error(reason));
        return Promise.reject(reason);
      });
    } else {
      tracker.onSuccess();
      return result;
    }
  } catch (error) {
    tracker.onError(error);
    throw error;
  }
}

module.exports = {
  track,
  trackImmediate,
  trackEvent,
  trackEvents,
  trackOperationTiming,
  startTracking,
  TimingTracker,
  trackTiming,
  HistogramTracker,
};
