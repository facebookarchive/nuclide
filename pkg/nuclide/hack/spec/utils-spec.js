'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {compareHackCompletions} = require('../lib/utils');

describe('utils', () => {

  describe('compareHackCompletions()', () => {

    it('prefers prefix case sensitive matches to prefix case insensitive + alphabetical order', () => {
      const matchTexts = ['GetAaa()', 'getAzzz()'];
      const compartor = compareHackCompletions('getA');
      expect(matchTexts.sort(compartor)).toEqual(
        ['getAzzz()', 'GetAaa()']
      );
    });

    it('prefers prefix case insensitive matches to case insensitive non-prefix matches + alphabetical order', () => {
      const matchTexts = ['aa_getAaa()', 'getAzzz()'];
      const compartor = compareHackCompletions('getA');
      expect(matchTexts.sort(compartor)).toEqual(
        ['getAzzz()', 'aa_getAaa()']
      );
    });

    it('prefers non-prefix case sensitive matches to case insensitive non-prefix matches + alphabetical order', () => {
      const matchTexts = ['aa_getaaa()', 'zz_getAaa()'];
      const compartor = compareHackCompletions('getA');
      expect(matchTexts.sort(compartor)).toEqual(
        ['zz_getAaa()', 'aa_getaaa()']
      );
    });

    it('prefers alphabetical order when both are of the same type', () => {
      const matchTexts = ['zz_getAaa()', 'aa_getAaa()'];
      const compartor = compareHackCompletions('getA');
      expect(matchTexts.sort(compartor)).toEqual(
        ['aa_getAaa()', 'zz_getAaa()']
      );
    });

    it('penalizes a match if is private function, even if matching with case sensitivity', () => {
      const matchTexts = ['_aa_getAaa()', 'zz_getaaaa()'];
      const compartor = compareHackCompletions('getA');
      expect(matchTexts.sort(compartor)).toEqual(
        ['zz_getaaaa()', '_aa_getAaa()']
      );
    });

    it('sorts the completion results in a meaningful order', () => {
      const matchTexts = ['_getAbc()', '_getAab()', 'getAppend()', 'getAddendum()', 'doOrGetACup()', '_doOrGetACup()'];
      const compartor = compareHackCompletions('getA');
      expect(matchTexts.sort(compartor)).toEqual(
        ['getAddendum()', 'getAppend()', 'doOrGetACup()', '_getAab()', '_getAbc()', '_doOrGetACup()']
      );
    });
  });
});
