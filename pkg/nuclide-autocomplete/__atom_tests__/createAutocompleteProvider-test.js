"use strict";

function _createAutocompleteProvider() {
  const data = _interopRequireDefault(require("../lib/createAutocompleteProvider"));

  _createAutocompleteProvider = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
jest.unmock("../../../modules/nuclide-commons/analytics");
describe('getSuggestions', () => {
  const fakeRequest = {
    bufferPosition: {},
    editor: {
      getPath: () => ''
    }
  };
  const autocompleteProviderThatThrowsExecption = (0, _createAutocompleteProvider().default)({
    selector: '',

    getSuggestions() {
      throw new Error();
    },

    analytics: {
      eventName: 'test',
      shouldLogInsertedSuggestion: false
    }
  });
  const autocompleteProviderThatTimeOut = (0, _createAutocompleteProvider().default)({
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
    trackSpy = jest.spyOn(require("../../../modules/nuclide-commons/analytics"), 'track');
  });
  it('returns null when it throws an exception', async () => {
    expect((await autocompleteProviderThatThrowsExecption.getSuggestions(Object.assign({}, fakeRequest, {
      activatedManually: false
    })))).toBe(null);
    expect((await autocompleteProviderThatThrowsExecption.getSuggestions(Object.assign({}, fakeRequest, {
      activatedManually: true
    })))).toBe(null);
  });
  it('tracks when it throws an exception', async () => {
    await autocompleteProviderThatThrowsExecption.getSuggestions(fakeRequest);
    (0, _waits_for().default)(() => trackSpy.mock.calls.length > 0);
    expect(trackSpy.mock.calls).toHaveLength(1);
    expect(trackSpy.mock.calls[0][0]).toBe('test:autocomplete:error-on-get-suggestions');
  });
  it('tracks when it times out', async () => {
    expect((await autocompleteProviderThatTimeOut.getSuggestions(fakeRequest))).toBe(null);
    expect(trackSpy.mock.calls.length).toBe(1);
    expect(trackSpy.mock.calls[0][0]).toBe('test:autocomplete:timeout-on-get-suggestions');
  });
});