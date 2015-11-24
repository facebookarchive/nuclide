'use babel';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import {CircularBuffer} from '../lib/main';

describe('CircularBuffer', () => {

  describe('empty buffer', () => {
    it('verify ordinary API use for CircularBuffer with no elements added', () => {
      const buffer = new CircularBuffer(4);
      expect(buffer.capacity).toBe(4);

      // This verifies that CircularBuffer implements Iterable correctly by demonstrating that it
      // works with for/of.
      for (const element of buffer) { // eslint-disable-line no-unused-vars
        throw new Error('Should not iterate anything when empty.');
      }
    });
  });

  describe('singleton buffer', () => {
    it('verify ordinary API use for CircularBuffer with one element', () => {
      const buffer = new CircularBuffer(1);
      expect(buffer.capacity).toBe(1);

      // This verifies that CircularBuffer implements Iterable correctly by demonstrating that it
      // works with for/of.
      buffer.push('foo');
      const elements1 = [];
      for (const element of buffer) {
        elements1.push(element);
      }
      expect(elements1).toEqual(['foo']);

      // Because the buffer is of capacty 1, inserting one more element effectively
      // overwrites the entire contents.
      const elements2 = [];
      buffer.push('bar');
      for (const element of buffer) {
        elements2.push(element);
      }
      expect(elements2).toEqual(['bar']);
    });
  });

  describe('that is not at capacity', () => {
    it('iterator works correctly when the buffer is half full', () => {
      const buffer = new CircularBuffer(4);
      expect(buffer.capacity).toBe(4);

      buffer.push('A');
      buffer.push('B');
      const elements = [];
      for (const element of buffer) {
        elements.push(element);
      }
      expect(elements).toEqual(['A', 'B']);
    });
  });

  describe('that is at capacity', () => {
    it('iterator works correctly when the buffer is exactly full', () => {
      const buffer = new CircularBuffer(4);
      expect(buffer.capacity).toBe(4);

      buffer.push('A');
      buffer.push('B');
      buffer.push('C');
      buffer.push('D');
      const elements = [];
      for (const element of buffer) {
        elements.push(element);
      }
      expect(elements).toEqual(['A', 'B', 'C', 'D']);
    });
  });

  describe('that is just over capacity', () => {
    it('iterator works correctly when the buffer has had to wrap around', () => {
      const buffer = new CircularBuffer(4);
      expect(buffer.capacity).toBe(4);

      buffer.push('A');
      buffer.push('B');
      buffer.push('C');
      buffer.push('D');
      buffer.push('E');
      const elements = [];
      for (const element of buffer) {
        elements.push(element);
      }
      expect(elements).toEqual(['B', 'C', 'D', 'E']);
    });
  });

  describe('that has wrapped around more than once', () => {
    it('iterator works correctly when the buffer has had to wrap around', () => {
      const buffer = new CircularBuffer(4);
      expect(buffer.capacity).toBe(4);

      buffer.push('A');
      buffer.push('B');
      buffer.push('C');
      buffer.push('D');
      buffer.push('1');
      buffer.push('2');
      buffer.push('3');
      buffer.push('4');
      buffer.push('E');
      buffer.push('F');
      const elements = [];
      for (const element of buffer) {
        elements.push(element);
      }
      expect(elements).toEqual(['3', '4', 'E', 'F']);
    });
  });

  it('throws when modified during iteration', () => {
    expect(() => {
      const buffer = new CircularBuffer(4);
      buffer.push('A');
      buffer.push('B');
      for (const element of buffer) { // eslint-disable-line no-unused-vars
        buffer.push('C');
      }
    })
    .toThrow(new Error('CircularBuffer was modified during iteration.'));
  });

  describe('rejects bad constructor arguments', () => {
    it('rejects an empty buffer', () => {
      expect(() => new CircularBuffer(0)).toThrow(
        new Error('capacity must be greater than zero, but was 0.'));
    });

    it('rejects a negative capacity', () => {
      expect(() => new CircularBuffer(-1)).toThrow(
        new Error('capacity must be greater than zero, but was -1.'));
    });

    it('rejects a non-integer capacity', () => {
      expect(() => new CircularBuffer(1.5)).toThrow(
        new Error('capacity must be an integer, but was 1.5.'));
    });
  });
});
