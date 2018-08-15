"use strict";

function _SymbolSearch() {
  const data = require("../lib/SymbolSearch");

  _SymbolSearch = function () {
    return data;
  };

  return data;
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
 * @emails oncall+nuclide
 */
describe('Hack Symbol Search', () => {
  describe('convertSearchResults', () => {
    it('empty results are returned when getSearchResults() returns null', () => {
      expect((0, _SymbolSearch().convertSearchResults)('/hackroot', null)).toEqual([]);
    });
  });
  describe('parseQueryString', () => {
    it('normal query', () => {
      expect((0, _SymbolSearch().parseQueryString)('asdf')).toEqual({
        queryString: 'asdf',
        searchPostfix: null
      });
    });
    it('function query', () => {
      expect((0, _SymbolSearch().parseQueryString)('@asdf')).toEqual({
        queryString: 'asdf',
        searchPostfix: '-function'
      });
    });
    it('class query', () => {
      expect((0, _SymbolSearch().parseQueryString)('#asdf')).toEqual({
        queryString: 'asdf',
        searchPostfix: '-class'
      });
    });
    it('constant query', () => {
      expect((0, _SymbolSearch().parseQueryString)('%asdf')).toEqual({
        queryString: 'asdf',
        searchPostfix: '-constant'
      });
    });
  });
});