/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import createAutocompleteProvider from '../lib/createAutocompleteProvider';

describe('getSuggestions', () => {
  const fakeRequest: any = {};
  const autocompleteProviderThatThrowsExecption = createAutocompleteProvider({
    selector: '',
    getSuggestions() {
      throw new Error();
    },
    analytics: {
      eventName: 'test',
      shouldLogInsertedSuggestion: false,
    },
  });

  const autocompleteProviderThatTimeOut = createAutocompleteProvider({
    selector: '',
    getSuggestions() {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(null), 5000);
      });
    },
    analytics: {
      eventName: 'test',
      shouldLogInsertedSuggestion: false,
    },
  });

  let trackSpy;
  beforeEach(() => {
    jasmine.useRealClock();
    trackSpy = spyOn(require('../../nuclide-analytics'), 'track');
  });

  it('returns null when it throws an exception', () => {
    waitsForPromise(async () => {
      expect(
        await autocompleteProviderThatThrowsExecption.getSuggestions(
          ({activatedManually: false}: any),
        ),
      ).toBe(null);
      expect(
        await autocompleteProviderThatThrowsExecption.getSuggestions(
          ({activatedManually: true}: any),
        ),
      ).toBe(null);
    });
  });

  it('tracks when it throws an exception', () => {
    waitsForPromise(async () => {
      await autocompleteProviderThatThrowsExecption.getSuggestions(fakeRequest);
      expect(trackSpy.calls.length).toBe(1);
      expect(trackSpy.calls[0].args[0]).toBe(
        'test:autocomplete:error-on-get-suggestions',
      );
    });
  });

  it('tracks when it times out', () => {
    waitsForPromise(async () => {
      expect(
        await autocompleteProviderThatTimeOut.getSuggestions(fakeRequest),
      ).toBe(null);
      expect(trackSpy.calls.length).toBe(1);
      expect(trackSpy.calls[0].args[0]).toBe(
        'test:autocomplete:timeout-on-get-suggestions',
      );
    });
  });
});
