"use strict";

function _sink() {
  const data = require("../lib/sink");

  _sink = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */
describe('sink', () => {
  describe('removePrefixSink', () => {
    const prefix = '\x1bprefix';
    let callCount;
    let output;
    let sink;
    beforeEach(() => {
      callCount = 0;
      output = '';
      sink = (0, _sink().removePrefixSink)(prefix, data => {
        output += data;
        callCount++;
      });
    });
    it('removes prefix when sent a single chunk', () => {
      sink(prefix + 'suffix');
      expect(output).toEqual('suffix');
    });
    it('removes prefix when sent one character at a time', () => {
      for (let i = 0; i < prefix.length; i++) {
        sink(prefix.charAt(i));
        expect(output).toEqual('');
      }

      expect(callCount).toEqual(0);
      sink('_');
      expect(output).toEqual('_');
    });
    it('avoids removing unrelated non-prefix', () => {
      const data = prefix.slice(0, -1) + 'abc';
      sink(data);
      expect(output).toEqual(data);
    });
    it('removes only one of two prefixes', () => {
      sink(prefix + prefix);
      expect(output).toEqual(prefix);
    });
  });
  describe('patternCounterSink', () => {
    let enabled;
    let counter;
    let output;

    function notify() {
      counter++;
      return enabled;
    }

    function next(data) {
      output += data;
    }

    beforeEach(() => {
      enabled = true;
      counter = 0;
      output = '';
    });
    it('does not match a non-match', () => {
      const sink = (0, _sink().patternCounterSink)('needle', notify, next);
      sink('haystack');
      expect(counter).toEqual(0);
      expect(output).toEqual('haystack');
    });
    it('matches a unique pattern exactly', () => {
      const sink = (0, _sink().patternCounterSink)('abc', notify, next);
      sink('abc');
      expect(counter).toEqual(1);
      expect(output).toEqual('abc');
    });
    it('matches multiple occurrences of a pattern', () => {
      const sink = (0, _sink().patternCounterSink)('abc', notify, next);
      sink('abc abc abc');
      expect(counter).toEqual(3);
    });
    it('matches overlapping occurrences of a pattern', () => {
      const sink = (0, _sink().patternCounterSink)('aba', notify, next);
      sink('ababababa');
      expect(counter).toEqual(4);
    });
    it('matches odd characters', () => {
      const sink = (0, _sink().patternCounterSink)('\x1b\n ', notify, next);
      sink('  \x1b\n  ');
      expect(counter).toEqual(1);
    });
    it('matches small chunks', () => {
      const sink = (0, _sink().patternCounterSink)('aaa', notify, next);
      sink('b');
      expect(counter).toEqual(0);
      sink('a');
      expect(counter).toEqual(0);
      sink('a');
      expect(counter).toEqual(0);
      sink('a');
      expect(counter).toEqual(1);
      sink('a');
      expect(counter).toEqual(2);
      sink('a');
      expect(counter).toEqual(3);
      sink('b');
      expect(counter).toEqual(3);
      sink('a');
      expect(counter).toEqual(3);
      sink('a');
      expect(counter).toEqual(3);
      sink('a');
      expect(counter).toEqual(4);
    });
    it('Returning enabled=false has no subsequent notifications', () => {
      const sink = (0, _sink().patternCounterSink)('a', notify, next);
      sink('a');
      expect(counter).toEqual(1);
      enabled = false;
      sink('a');
      expect(counter).toEqual(2);
      sink('a');
      expect(counter).toEqual(2);
      sink('a');
      expect(counter).toEqual(2);
    });
  });
});