'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export default class CircularBuffer<T> {
  /** The maximum number of elements this CircularBuffer can hold. */
  _capacity: number;
  _elements: Array<T>;
  _nextInsertIndex: number;

  /** Whether this CircularBuffer has reached its capacity. */
  _isFull: boolean;

  /**
   * Represents the state of the CircularBuffer when an Iterator for it is created. If the
   * state of the CircularBuffer changes while it is being iterated, it will throw an exception.
   */
  _generation: number;

  /**
   * @param capacity is the maximum number of elements this CircularBuffer can hold. It must be an
   *   integer greater than zero.
   */
  constructor(capacity: number) {
    if (!Number.isInteger(capacity)) {
      throw new Error(`capacity must be an integer, but was ${capacity}.`);
    }
    if (capacity <= 0) {
      throw new Error(`capacity must be greater than zero, but was ${capacity}.`);
    }
    this._capacity = capacity;
    this._elements = new Array(capacity);
    this._nextInsertIndex = 0;
    this._isFull = false;
    this._generation = 0;
  }

  /**
   * The maximum number of elements this CircularBuffer can hold.
   */
  get capacity(): number {
    return this._capacity;
  }

  push(element: T): void {
    ++this._generation;
    this._elements[this._nextInsertIndex] = element;
    const nextIndex = this._nextInsertIndex + 1;
    this._nextInsertIndex = nextIndex % this._capacity;
    if (this._nextInsertIndex === 0 && !this._isFull) {
      this._isFull = true;
    }
  }

  /**
   * @return an `Iterator` that iterates through the last N elements added to the buffer where N
   *   is <= `capacty`. If the buffer is modified while it is being iterated, an Error will be
   *   thrown.
   */
  // $FlowIssue: t6187050
  [Symbol.iterator](): Iterator<T> {
    const generation = this._generation;
    let index = this._isFull ? this._nextInsertIndex : 0;
    let numIterations = this._isFull ? this._capacity : this._nextInsertIndex;

    const next = (): {done: boolean; value: ?T} => {
      if (numIterations === 0) {
        return {done: true, value: undefined};
      }
      if (generation !== this._generation) {
        throw new Error('CircularBuffer was modified during iteration.');
      }
      --numIterations;
      const value = this._elements[index];
      index = (index + 1) % this._capacity;
      return {done: false, value};
    };

    return {next};
  }
}
