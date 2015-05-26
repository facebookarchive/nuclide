'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var QueryItem = require('../lib/QueryItem');

describe('QueryItem', () => {
  describe('"Hello"', () => {
    var item = new QueryItem('Hello');

    it('should return a score of 1 on no query', () => {
      expect(item.score('').score).toBe(1);
      expect(item.score('').matchIndexes).toEqual([]);
    });

    it('should return null on no match', () => {
      expect(item.score('z')).toBe(null);
    });

    it('should return null on non-sequential matches', () => {
      expect(item.score('lh')).toBe(null);
    });

    it('should ignore query case', () => {
      expect(item.score('He').score).toEqual(item.score('he').score);
    });

    it('should prefer matches where the letters are closer together', () => {
      expect(item.score('he').score).toBeGreaterThan(item.score('hl').score);
      expect(item.score('hl').score).toBeGreaterThan(item.score('ho').score);
    });
  });

  describe('Path Separator', () => {
    var item = new QueryItem('He/y/Hello', '/');

    it('should prefer matches after the last path separator', () => {
      expect(item.score('h').matchIndexes).toEqual([5]);
    });

    it('should return null if no matches appeared after the last path separator', () => {
      expect(item.score('hey')).toBe(null);
    });

    it('should still be able to match characters before the separator', () => {
      expect(item.score('heyh')).not.toBe(null);
    });
  });

  describe('Misc', () => {
    it('should prefer matches with an initialism', () => {
      var item = new QueryItem('AbBa');

      expect(item.score('ab').matchIndexes).toEqual([0, 2]);
    });

    it('should be able to fall back to substring match when an initialism skip fails', () => {
      var item = new QueryItem('AbBa');

      // If the query could initially trigger a skip then fail, still treturn a result.
      expect(item.score('bb')).not.toBe(null);
    });
  });

});
