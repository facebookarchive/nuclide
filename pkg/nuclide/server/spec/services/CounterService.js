'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var counters: Array<Counter> = [];

export class Counter {
  _count: number;

  // Create a new counter with the given initial count.
  constructor(initialCount: number) {
    this._count = initialCount;
    counters.push(this);
  }
  // Get the current value of a counter.
  async getCount(): Promise<number> {
    return this._count;
  }
  // Add the specified value to the counter's count.
  async addCount(x: number): Promise<void> {
    this._count += x;
  }
  // List all of the counters that have been created.
  static async listCounters(): Promise<Array<Counter>> {
    return counters;
  }

  // A static method that takes a Counter object as an argument.
  static async indexOf(counter: Counter): Promise<number> {
    return counters.indexOf(counter);
  }

  // Dispose function that removes this counter from the global list.
  async dispose(): Promise<void> {
    counters.splice(counters.indexOf(this), 1);
  }
}
