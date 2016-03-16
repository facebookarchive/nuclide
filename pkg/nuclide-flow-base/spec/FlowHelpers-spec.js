'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  groupParamNames,
} from '../lib/FlowHelpers';

describe('FlowHelpers', () => {
  describe('groupParamNames', () => {
    it('should return a group for each argument', () => {
      const args = ['arg1', 'arg2'];
      expect(groupParamNames(args)).toEqual(args.map(arg => [arg]));
    });

    it('should group optional params', () => {
      const args = ['arg1', 'arg2?'];
      expect(groupParamNames(args)).toEqual([args]);
    });

    it('should only group optional params at the end', () => {
      // I have no idea why you are even allowed to have optional params in the middle, but I guess
      // we have to deal with it.
      const args = ['arg1', 'arg2?', 'arg3', 'arg4?'];
      const expectedGrouping = [['arg1'], ['arg2?'], ['arg3', 'arg4?']];
      expect(groupParamNames(args)).toEqual(expectedGrouping);
    });

    it('should group all params if they are all optional', () => {
      const args = ['arg1?', 'arg2?'];
      expect(groupParamNames(args)).toEqual([args]);
    });

    it('should return an empty array for no arguments', () =>  {
      expect(groupParamNames([])).toEqual([]);
    });
  });
});
