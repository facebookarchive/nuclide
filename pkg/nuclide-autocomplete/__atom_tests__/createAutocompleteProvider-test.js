'use strict';

var _createAutocompleteProvider;

function _load_createAutocompleteProvider() {
  return _createAutocompleteProvider = _interopRequireDefault(require('../lib/createAutocompleteProvider'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('getSuggestions', () => {
  const fakeRequest = {
    bufferPosition: {},
    editor: {
      getPath: () => ''
    }
  };
  const autocompleteProviderThatThrowsExecption = (0, (_createAutocompleteProvider || _load_createAutocompleteProvider()).default)({
    selector: '',
    getSuggestions() {
      throw new Error();
    },
    analytics: {
      eventName: 'test',
      shouldLogInsertedSuggestion: false
    }
  });

  const autocompleteProviderThatTimeOut = (0, (_createAutocompleteProvider || _load_createAutocompleteProvider()).default)({
    selector: '',
    getSuggestions() {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(null), 5000);
      });
    },
    analytics: {
      eventName: 'test',
      shouldLogInsertedSuggestion: false
    }
  });

  let trackSpy;
  beforeEach(() => {
    jest.restoreAllMocks();
    trackSpy = jest.spyOn(require('../../../modules/nuclide-commons/analytics'), 'track');
  });

  it('returns null when it throws an exception', async () => {
    await (async () => {
      expect((await autocompleteProviderThatThrowsExecption.getSuggestions(Object.assign({}, fakeRequest, { activatedManually: false })))).toBe(null);
      expect((await autocompleteProviderThatThrowsExecption.getSuggestions(Object.assign({}, fakeRequest, { activatedManually: true })))).toBe(null);
    })();
  });

  it('tracks when it throws an exception', async () => {
    await (async () => {
      await autocompleteProviderThatThrowsExecption.getSuggestions(fakeRequest);
      expect(trackSpy.mock.calls).toHaveLength(1);
      expect(trackSpy.mock.calls[0][0]).toBe('test:autocomplete:error-on-get-suggestions');
    })();
  });

  it('tracks when it times out', async () => {
    await (async () => {
      expect((await autocompleteProviderThatTimeOut.getSuggestions(fakeRequest))).toBe(null);
      expect(trackSpy.mock.calls.length).toBe(1);
      expect(trackSpy.mock.calls[0][0]).toBe('test:autocomplete:timeout-on-get-suggestions');
    })();
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */