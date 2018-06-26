'use strict';

var _SymbolSearch;

function _load_SymbolSearch() {
  return _SymbolSearch = require('../lib/SymbolSearch');
}

describe('Hack Symbol Search', () => {
  describe('convertSearchResults', () => {
    it('empty results are returned when getSearchResults() returns null', () => {
      expect((0, (_SymbolSearch || _load_SymbolSearch()).convertSearchResults)('/hackroot', null)).toEqual([]);
    });
  });

  describe('parseQueryString', () => {
    it('normal query', () => {
      expect((0, (_SymbolSearch || _load_SymbolSearch()).parseQueryString)('asdf')).toEqual({
        queryString: 'asdf',
        searchPostfix: null
      });
    });

    it('function query', () => {
      expect((0, (_SymbolSearch || _load_SymbolSearch()).parseQueryString)('@asdf')).toEqual({
        queryString: 'asdf',
        searchPostfix: '-function'
      });
    });

    it('class query', () => {
      expect((0, (_SymbolSearch || _load_SymbolSearch()).parseQueryString)('#asdf')).toEqual({
        queryString: 'asdf',
        searchPostfix: '-class'
      });
    });

    it('constant query', () => {
      expect((0, (_SymbolSearch || _load_SymbolSearch()).parseQueryString)('%asdf')).toEqual({
        queryString: 'asdf',
        searchPostfix: '-constant'
      });
    });
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */