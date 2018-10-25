"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Counter = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
class Counter {
  // Create a new counter with the given initial count.
  constructor(initialCount) {
    // Set initial count.
    this._count = initialCount; // Set the changes subscription observable.

    this._changes = new _RxMin.Subject();
  }

  static async createCounter(initialCount) {
    const counter = new Counter(initialCount); // Add this counter to global list.

    Counter._counters.push(counter); // Broadcast that this counter was created.


    Counter._newCounters.next(counter);

    return counter;
  } // Get the current value of a counter.


  async getCount() {
    return this._count;
  } // Add the specified value to the counter's count.


  async addCount(x) {
    // Broadcast an event.
    this._changes.next({
      type: 'add',
      oldValue: this._count,
      newValue: this._count + x
    });

    this._count += x;
  } // Subscribe to changes in this counter.


  watchChanges() {
    return this._changes.publish();
  } // Dispose function that removes this counter from the global list.


  async dispose() {
    // Remove this counter from the global list.
    Counter._counters.splice(Counter._counters.indexOf(this), 1); // Signal that the changes stream is over.


    this._changes.complete();
  }
  /** Static Methods */
  // List all of the counters that have been created.


  static async listCounters() {
    return Counter._counters;
  } // Returns a stream of counters as they are created.


  static watchNewCounters() {
    return Counter._newCounters.publish();
  } // A static method that takes a Counter object as an argument.


  static async indexOf(counter) {
    return Counter._counters.indexOf(counter);
  }

}

exports.Counter = Counter;
Counter._counters = [];
Counter._newCounters = new _RxMin.Subject();