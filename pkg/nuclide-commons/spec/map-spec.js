'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {union} from '../lib/map';

describe('Map', () => {
  describe('union', () => {
    it('merges two unique maps', () => {
      const map1 = new Map([['key1', 'value1'], ['key2', 'value2']]);
      const map2 = new Map([['key3', 'value3'], ['key4', 'value4']]);
      const result = union(map1, map2);

      expect(result.size).toBe(4);
      expect(result.get('key1')).toBe('value1');
      expect(result.get('key2')).toBe('value2');
      expect(result.get('key3')).toBe('value3');
      expect(result.get('key4')).toBe('value4');
    });

    it('overrodes with the values of the latest maps', () => {
      const map1 = new Map([['commonKey', 'value1'], ['key2', 'value2']]);
      const map2 = new Map([['commonKey', 'value3'], ['key4', 'value4']]);
      const result = union(...[map1, map2]);

      expect(result.size).toBe(3);
      expect(result.get('commonKey')).toBe('value3');
      expect(result.get('key2')).toBe('value2');
      expect(result.get('key4')).toBe('value4');
    });
  });
});
