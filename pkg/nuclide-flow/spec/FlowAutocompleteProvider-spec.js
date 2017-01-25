/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {shouldFilter, updateResults} from '../lib/FlowAutocompleteProvider';

describe('FlowAutocompleteProvider', () => {
  describe('shouldFilter', () => {
    function fakeRequest(prefix: string): atom$AutocompleteRequest {
      // Right now shouldFilter only uses the prefix. If it changes this will need to be updated.
      return ({prefix}: any);
    }

    it('should filter after a dot', () => {
      expect(shouldFilter(fakeRequest('.'), fakeRequest('f'))).toBe(true);
    });

    it('should not filter after a dot if the next prefix is more than one character', () => {
      expect(shouldFilter(fakeRequest('.'), fakeRequest('fo'))).toBe(false);
    });

    it('should filter when the prefix is one character longer and a valid identifier', () => {
      expect(shouldFilter(fakeRequest('asdf'), fakeRequest('asdfg'))).toBe(true);
      expect(shouldFilter(fakeRequest('_9asdf'), fakeRequest('_9asdf$'))).toBe(true);
    });

    it("should not filter if the current prefix doesn't start with the last prefix", () => {
      expect(shouldFilter(fakeRequest('asdf'), fakeRequest('bsdfg'))).toBe(false);
    });

    it('should not filter if the prefix is not a valid identifier', () => {
      expect(shouldFilter(fakeRequest('a-df'), fakeRequest('a-dfg'))).toBe(false);
      expect(shouldFilter(fakeRequest('9asdf'), fakeRequest('9asdfg'))).toBe(false);
    });

    it('should not filter if the current prefix is more than one character longer', () => {
      expect(shouldFilter(fakeRequest('asdf'), fakeRequest('asdfgh'))).toBe(false);
    });

    // If autocomplete is activated manually (ctrl+space), you can get a blank prefix for the first
    // request. Then, we should filter when the first character is typed.
    it('should filter on the first character typed', () => {
      expect(shouldFilter(fakeRequest(''), fakeRequest('a'))).toBe(true);
    });
  });

  describe('updateResults', () => {
    let prefix: string = (null: any);

    let resultsToUpdate: ?Array<atom$AutocompleteSuggestion> = null;

    beforeEach(() => {
      const resultNames = [
        'Foo',
        'foo',
        'Bar',
        'BigLongNameTwo',
        'BigLongNameOne',
      ];
      resultsToUpdate = resultNames.map(name => ({displayText: name, type: 'foo'}));
    });

    function run() {
      // Currently updateResults only uses the prefix, so we cast through any to avoid having to
      // provide dummy values for other properties.
      const request = ({
        prefix,
      }: any);
      return updateResults(request, resultsToUpdate);
    }

    function getNames() {
      const results = run();
      return results == null ? null : results.map(result => result.displayText);
    }

    it('should not filter suggestions if the prefix is a .', () => {
      prefix = '.';
      expect(getNames()).toEqual([
        'Foo',
        'foo',
        'Bar',
        'BigLongNameTwo',
        'BigLongNameOne',
      ]);
    });

    it('should filter suggestions by the prefix', () => {
      prefix = 'bln';
      expect(getNames()).toEqual([
        'BigLongNameTwo',
        'BigLongNameOne',
      ]);
    });

    it('should not filter suggestions if the prefix is not a valid id', () => {
      prefix = '{';
      expect(getNames()).toEqual([
        'Foo',
        'foo',
        'Bar',
        'BigLongNameTwo',
        'BigLongNameOne',
      ]);
    });

    it('should rank better matches higher', () => {
      prefix = 'one';
      expect(getNames()).toEqual([
        'BigLongNameOne',
        'BigLongNameTwo',
      ]);
    });
  });
});
