'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {
  filterEmptyResults,
  flattenResults,
} = require('../lib/searchResultHelpers');

var SEARCH_RESULTS_FIXTURE = {
  searchService: {
    shouldNotAppearInOutputFolder: {
      items: []
    },
    folderB: {
      items: [1, 2, 3]
    },
  },
  symbolService: {
    folderA: {
      items: [4, 5, 6],
    },
    shouldNotAppearInOutputFolder: {
      items: [],
    },
  },
  shouldNotAppearInOutputService: {
    folderA: {
      items: [],
    },
    folderB: {
      items: [],
    },
  }
};

describe('searchResultHelper', () => {
  describe('emptyResults', () => {
    it('does not include empty folders', () => {
      var filteredResults = filterEmptyResults(SEARCH_RESULTS_FIXTURE);

      expect(filteredResults).toEqual({
        searchService: {
          folderB: {
            items: [1, 2, 3],
          },
        },
        symbolService: {
          folderA: {
            items: [4, 5, 6],
          },
        },
      });
    });
  });

  describe('flattenResults', () => {
    it('returns an array of flattened results', () => {
      expect(flattenResults(SEARCH_RESULTS_FIXTURE)).toEqual(
        [1, 2, 3, 4, 5, 6]
      );
    });
  });
});
