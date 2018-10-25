"use strict";

function _simpleTextBuffer() {
  const data = _interopRequireWildcard(require("simple-text-buffer"));

  _simpleTextBuffer = function () {
    return data;
  };

  return data;
}

function _autocomplete() {
  const data = require("../lib/autocomplete");

  _autocomplete = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
function createCompletion(text, prefix = '') {
  return {
    snippet: text + '()',
    displayText: text,
    rightLabel: 'function',
    replacementPrefix: prefix
  };
}

const c1 = createCompletion('GetAaa');
const c2 = createCompletion('getAzzz');
const c3 = createCompletion('aa_getaaa');
const c4 = createCompletion('zz_getAaa');
const c5 = createCompletion('aa_getAaa');
const c6 = createCompletion('_aa_getAaa');
const c7 = createCompletion('zz_getaaaa');
describe('autocomplete', () => {
  describe('compareHackCompletions()', () => {
    it('prefers prefix case sensitive matches to prefix case insensitive + alphabetical' + ' order', () => {
      const completions = [c1, c2];
      const comparator = (0, _autocomplete().compareHackCompletions)('getA');
      expect(completions.sort(comparator)).toEqual([c2, c1]);
    });
    it('prefers prefix case insensitive matches to case insensitive non-prefix matches +' + ' alphabetical order', () => {
      const completions = [c3, c2];
      const comparator = (0, _autocomplete().compareHackCompletions)('getA');
      expect(completions.sort(comparator)).toEqual([c2, c3]);
    });
    it('prefers non-prefix case sensitive matches to case insensitive non-prefix matches +' + ' alphabetical order', () => {
      const completions = [c3, c4];
      const comparator = (0, _autocomplete().compareHackCompletions)('getA');
      expect(completions.sort(comparator)).toEqual([c4, c3]);
    });
    it('prefers alphabetical order when both are of the same type', () => {
      const completions = [c4, c5];
      const comparator = (0, _autocomplete().compareHackCompletions)('getA');
      expect(completions.sort(comparator)).toEqual([c5, c4]);
    });
    it('penalizes a match if is private function, even if matching with case sensitivity', () => {
      const completions = [c6, c7];
      const comparator = (0, _autocomplete().compareHackCompletions)('getA');
      expect(completions.sort(comparator)).toEqual([c7, c6]);
    });
    it('prefer completions with longer prefixes', () => {
      const comp1 = createCompletion(':foo', ':f');
      const comp2 = createCompletion('foo', 'f');
      const completions = [comp2, comp1];
      const comparator = (0, _autocomplete().compareHackCompletions)('f');
      expect(completions.sort(comparator)).toEqual([comp1, comp2]);
    });
    it('sorts the completion results in a meaningful order', () => {
      const comps = [createCompletion('_getAbc()'), createCompletion('_getAab()'), createCompletion('getAppend()'), createCompletion('getAddendum()'), createCompletion('doOrGetACup()'), createCompletion('_doOrGetACup()')];
      const comparator = (0, _autocomplete().compareHackCompletions)('getA');
      expect(comps.sort(comparator)).toEqual([createCompletion('getAddendum()'), createCompletion('getAppend()'), createCompletion('doOrGetACup()'), createCompletion('_getAab()'), createCompletion('_getAbc()'), createCompletion('_doOrGetACup()')]);
    });
  });
  describe('findHackPrefix()', () => {
    it('includes the $ in the prefix', () => {
      const buffer = new (_simpleTextBuffer().default)('$test1234');
      expect((0, _autocomplete().findHackPrefix)(buffer, new (_simpleTextBuffer().Point)(0, 9))).toBe('$test1234'); // Should cut off anything past the cursor.

      expect((0, _autocomplete().findHackPrefix)(buffer, new (_simpleTextBuffer().Point)(0, 5))).toBe('$test');
      expect((0, _autocomplete().findHackPrefix)(buffer, new (_simpleTextBuffer().Point)(0, 1))).toBe('$');
    });
    it('should not match invalid identifiers', () => {
      const buffer = new (_simpleTextBuffer().default)('C = !@#$%');
      expect((0, _autocomplete().findHackPrefix)(buffer, new (_simpleTextBuffer().Point)(0, 9))).toBe('');
      expect((0, _autocomplete().findHackPrefix)(buffer, new (_simpleTextBuffer().Point)(0, 1))).toBe('C');
      expect((0, _autocomplete().findHackPrefix)(buffer, new (_simpleTextBuffer().Point)(0, 2))).toBe('');
      expect((0, _autocomplete().findHackPrefix)(buffer, new (_simpleTextBuffer().Point)(0, 3))).toBe('');
    });
  });
});