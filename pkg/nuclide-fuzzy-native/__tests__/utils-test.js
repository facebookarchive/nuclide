'use strict';

var _utils;

function _load_utils() {
  return _utils = require('../lib/utils');
}

describe('utils', () => {
  describe('scoreComparator', () => {
    it('returns >1 when the first score is greater', () => {
      expect((0, (_utils || _load_utils()).scoreComparator)({ score: 2, value: '' }, { score: 1, value: '' })).toBeGreaterThan(0);
      expect((0, (_utils || _load_utils()).scoreComparator)({ score: 2, value: 'A' }, { score: 2, value: 'a' })).toBeGreaterThan(0);
    });

    it('returns <1 when the second score is greater', () => {
      expect((0, (_utils || _load_utils()).scoreComparator)({ score: 1, value: '' }, { score: 2, value: '' })).toBeLessThan(0);
      expect((0, (_utils || _load_utils()).scoreComparator)({ score: 2, value: 'a' }, { score: 2, value: 'A' })).toBeLessThan(0);
    });

    it('returns 0 when the scores are equal', () => {
      expect((0, (_utils || _load_utils()).scoreComparator)({ score: 1, value: '' }, { score: 1, value: '' })).toBe(0);
      expect((0, (_utils || _load_utils()).scoreComparator)({ score: 2, value: 'A' }, { score: 2, value: 'A' })).toBe(0);
    });
  });

  describe('valueComparator', () => {
    it('alpha-sorts and breaks ties with capital letters first', () => {
      expect((0, (_utils || _load_utils()).valueComparator)('A', 'A')).toBe(0);
      expect((0, (_utils || _load_utils()).valueComparator)('a', 'a')).toBe(0);
      expect((0, (_utils || _load_utils()).valueComparator)('A', 'a')).toBeLessThan(0);
      expect((0, (_utils || _load_utils()).valueComparator)('a', 'A')).toBeGreaterThan(0);
    });

    it('shorter string sorts first', () => {
      expect((0, (_utils || _load_utils()).valueComparator)('Bb', 'Bba')).toBeLessThan(0);
      expect((0, (_utils || _load_utils()).valueComparator)('Bba', 'Bb')).toBeGreaterThan(0);
    });

    it('tiebreaker applied only for first non-matching character', () => {
      expect((0, (_utils || _load_utils()).valueComparator)('CAT', 'CaT')).toBeLessThan(0);
      expect((0, (_utils || _load_utils()).valueComparator)('CaT', 'CAT')).toBeGreaterThan(0);
    });

    it('behaves like localeCompare', () => {
      expect((0, (_utils || _load_utils()).valueComparator)('apple', 'CAT')).toBeLessThan(0);
      expect((0, (_utils || _load_utils()).valueComparator)('CAT', 'Cat')).toBeLessThan(0);
    });
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict
     * @format
     */