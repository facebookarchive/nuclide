'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileSearch, FileSearchResult} from '../../path-search';
import * as pathSearch from '../../path-search';
import {fsPromise} from '../../commons';
const result: Array<FileSearchResult> = [];

const fileSearch: FileSearch = {
  query: (query) => {
    return Promise.resolve(result);
  },
  dispose() {},
};

// $FlowIgnore #yolo
pathSearch.fileSearchForDirectory = function() {
  return Promise.resolve(fileSearch);
};
fsPromise.exists = () => {
  return Promise.resolve(true);
};

fsPromise.stat = () => {
  return Promise.resolve({
    isDirectory() {
      return Promise.resolve(true);
    },
  });
};

import {
  queryFuzzyFile,
  isFuzzySearchAvailableFor,
} from '../lib/FuzzyFileSearchService';

describe('FuzzyFileSearchService', function() {
  it('returns true for isFuzzySearchAvailableFor', function() {
    waitsForPromise(async () => {
      expect(await isFuzzySearchAvailableFor('anything')).toBe(true);
    });
  });

  it('returns true for queryFuzzyFile', function() {
    waitsForPromise(async () => {
      expect(await queryFuzzyFile('anything', 'anything')).toEqual([]);
    });
  });
});
