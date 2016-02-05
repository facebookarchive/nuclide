'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Rx from 'rx';

import invariant from 'assert';
import {singleton} from '../../commons';
import {AnalyticsBatcher} from './AnalyticsBatcher';
import {track as rawTrack} from './track';

const ANALYTICS_BATCHER = 'analytics-batcher';

export type TrackingEvent = {
  type: string,
  data?: Object,
};

function getBatcher(): AnalyticsBatcher {
  return singleton.get(
    ANALYTICS_BATCHER, () => {
      invariant(rawTrack);
      return new AnalyticsBatcher(rawTrack);
    });
}

function resetBatcher(): void {
  getBatcher().dispose();
  return singleton.clear(ANALYTICS_BATCHER);
}

let batching = false;

function setBatching(newBatching: boolean): void {
  if (batching !== newBatching) {
    batching = newBatching;
    if (!batching) {
      resetBatcher();
    }
  }
}

function track(eventName: string, values?: {[key: string]: string}): Promise<mixed> {
  invariant(rawTrack);
  if (!batching) {
    return rawTrack(eventName, values || {});
  } else {
    getBatcher().track(eventName, values || {});
    return Promise.resolve();
  }
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
  return events.forEach(trackEvent);
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

  onError(error: Error): Promise {
    return this._trackTimingEvent(error);
  }

  onSuccess(): Promise {
    return this._trackTimingEvent(/* error */ null);
  }

  _trackTimingEvent(exception: ?Error): Promise {
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

    if (require('../../commons').promises.isPromise(result)) {
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
  trackEvent,
  trackEvents,
  trackOperationTiming,
  startTracking,
  TimingTracker,
  trackTiming,
  setBatching,
};
