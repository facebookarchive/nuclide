'use strict';

var _searchResultHelpers;

function _load_searchResultHelpers() {
  return _searchResultHelpers = require('../lib/searchResultHelpers');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

const SEARCH_RESULTS_FIXTURE = {
  searchService: {
    results: {
      shouldNotAppearInOutputFolder: {
        results: [],
        loading: false,
        error: null
      },
      folderB: {
        results: [{
          resultType: 'FILE',
          path: 'foo'
        }],
        loading: false,
        error: null
      }
    },
    title: 'searchService',
    priority: 0,
    totalResults: 1
  },
  symbolService: {
    results: {
      folderA: {
        results: [{
          resultType: 'FILE',
          path: 'bar'
        }],
        loading: false,
        error: null
      },
      shouldNotAppearInOutputFolder: {
        results: [],
        loading: false,
        error: null
      }
    },
    title: 'symbolService',
    priority: 0,
    totalResults: 1
  },
  shouldNotAppearInOutputService: {
    results: {
      folderA: {
        results: [],
        loading: false,
        error: null
      },
      folderB: {
        results: [],
        loading: false,
        error: null
      }
    },
    title: 'shouldNotAppearInOutputService',
    priority: 0,
    totalResults: 0
  }
};

describe('searchResultHelper', () => {
  describe('emptyResults', () => {
    it('does not include empty folders', () => {
      const filteredResults = (0, (_searchResultHelpers || _load_searchResultHelpers()).filterEmptyResults)(SEARCH_RESULTS_FIXTURE);
      expect(filteredResults).toEqual({
        searchService: {
          results: {
            folderB: {
              results: [{
                resultType: 'FILE',
                path: 'foo'
              }],
              loading: false,
              error: null
            }
          }
        },
        symbolService: {
          results: {
            folderA: {
              results: [{
                resultType: 'FILE',
                path: 'bar'
              }],
              loading: false,
              error: null
            }
          }
        }
      });
    });
  });

  describe('flattenResults', () => {
    it('returns an array of flattened results', () => {
      expect((0, (_searchResultHelpers || _load_searchResultHelpers()).flattenResults)(SEARCH_RESULTS_FIXTURE)).toEqual([{ resultType: 'FILE', path: 'foo' }, { resultType: 'FILE', path: 'bar' }]);
    });
  });

  describe('getOuterResults', () => {
    it('works with top', () => {
      const topOuterResults = (0, (_searchResultHelpers || _load_searchResultHelpers()).getOuterResults)('top', SEARCH_RESULTS_FIXTURE);
      expect(topOuterResults).toEqual({
        serviceName: 'searchService',
        directoryName: 'folderB',
        results: [{
          resultType: 'FILE',
          path: 'foo'
        }]
      });
    });

    it('works with bottom', () => {
      const topOuterResults = (0, (_searchResultHelpers || _load_searchResultHelpers()).getOuterResults)('bottom', SEARCH_RESULTS_FIXTURE);
      expect(topOuterResults).toEqual({
        serviceName: 'symbolService',
        directoryName: 'folderA',
        results: [{
          resultType: 'FILE',
          path: 'bar'
        }]
      });
    });
  });
});