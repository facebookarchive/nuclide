'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {compareHackCompletions} from '../lib/AutocompleteProvider';

function createCompletion(text: string, prefix: string = ''): atom$AutocompleteSuggestion {
  return {
    snippet: text + '()',
    displayText: text,
    rightLabel: 'function',
    replacementPrefix: prefix,
  };
}

const c1:atom$AutocompleteSuggestion = createCompletion('GetAaa');
const c2:atom$AutocompleteSuggestion = createCompletion('getAzzz');
const c3:atom$AutocompleteSuggestion = createCompletion('aa_getaaa');
const c4:atom$AutocompleteSuggestion = createCompletion('zz_getAaa');
const c5:atom$AutocompleteSuggestion = createCompletion('aa_getAaa');
const c6:atom$AutocompleteSuggestion = createCompletion('_aa_getAaa');
const c7:atom$AutocompleteSuggestion = createCompletion('zz_getaaaa');

describe('utils', () => {

  describe('compareHackCompletions()', () => {

    it('prefers prefix case sensitive matches to prefix case insensitive + alphabetical'
      + ' order', () => {
      const completions = [c1, c2];
      const compartor = compareHackCompletions('getA');
      expect(completions.sort(compartor)).toEqual(
        [c2, c1]
      );
    });

    it('prefers prefix case insensitive matches to case insensitive non-prefix matches +'
      + ' alphabetical order', () => {
      const completions = [c3, c2];
      const compartor = compareHackCompletions('getA');
      expect(completions.sort(compartor)).toEqual(
        [c2, c3]
      );
    });

    it('prefers non-prefix case sensitive matches to case insensitive non-prefix matches +'
      + ' alphabetical order', () => {
      const completions = [c3, c4];
      const compartor = compareHackCompletions('getA');
      expect(completions.sort(compartor)).toEqual(
        [c4, c3]
      );
    });

    it('prefers alphabetical order when both are of the same type', () => {
      const completions = [c4, c5];
      const compartor = compareHackCompletions('getA');
      expect(completions.sort(compartor)).toEqual(
        [c5, c4]
      );
    });

    it('penalizes a match if is private function, even if matching with case sensitivity', () => {
      const completions = [c6, c7];
      const compartor = compareHackCompletions('getA');
      expect(completions.sort(compartor)).toEqual(
        [c7, c6]
      );
    });

    it('prefer completions with longer prefixes', () => {
      const comp1 = createCompletion(':foo', ':f');
      const comp2 = createCompletion('foo', 'f');
      const completions = [comp2, comp1];
      const compartor = compareHackCompletions('f');
      expect(completions.sort(compartor)).toEqual(
        [comp1, comp2]
      );
    });

    it('sorts the completion results in a meaningful order', () => {
      const comps = [
        createCompletion('_getAbc()'),
        createCompletion('_getAab()'),
        createCompletion('getAppend()'),
        createCompletion('getAddendum()'),
        createCompletion('doOrGetACup()'),
        createCompletion('_doOrGetACup()'),
      ];
      const compartor = compareHackCompletions('getA');
      expect(comps.sort(compartor)).toEqual([
        createCompletion('getAddendum()'),
        createCompletion('getAppend()'),
        createCompletion('doOrGetACup()'),
        createCompletion('_getAab()'),
        createCompletion('_getAbc()'),
        createCompletion('_doOrGetACup()'),
      ]);
    });
  });
});
