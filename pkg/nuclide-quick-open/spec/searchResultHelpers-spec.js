'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GroupedResult} from '../lib/types';

import {
  filterEmptyResults,
  flattenResults,
} from '../lib/searchResultHelpers';

const SEARCH_RESULTS_FIXTURE: GroupedResult = {
  searchService: {
    results: {
      shouldNotAppearInOutputFolder: {
        results: [],
        loading: false,
        error: null,
      },
      folderB: {
        results: [{path: 'foo'}],
        loading: false,
        error: null,
      },
    },
    title: 'searchService',
  },
  symbolService: {
    results: {
      folderA: {
        results: [{path: 'bar'}],
        loading: false,
        error: null,
      },
      shouldNotAppearInOutputFolder: {
        results: [],
        loading: false,
        error: null,
      },
    },
    title: 'symbolService',
  },
  shouldNotAppearInOutputService: {
    results: {
      folderA: {
        results: [],
        loading: false,
        error: null,
      },
      folderB: {
        results: [],
        loading: false,
        error: null,
      },
    },
    title: 'shouldNotAppearInOutputService',
  },
};

describe('searchResultHelper', () => {
  describe('emptyResults', () => {
    it('does not include empty folders', () => {
      const filteredResults: GroupedResult = filterEmptyResults(SEARCH_RESULTS_FIXTURE);

      expect(filteredResults).toEqual({
        searchService: {
          results: {
            folderB: {
              results: [{path: 'foo'}],
              loading: false,
              error: null,
            },
          },
        },
        symbolService: {
          results: {
            folderA: {
              results: [{path: 'bar'}],
              loading: false,
              error: null,
            },
          },
        },
      });
    });
  });

  describe('flattenResults', () => {
    it('returns an array of flattened results', () => {
      expect(flattenResults(SEARCH_RESULTS_FIXTURE)).toEqual(
        [{path: 'foo'}, {path: 'bar'}],
      );
    });
  });
});
