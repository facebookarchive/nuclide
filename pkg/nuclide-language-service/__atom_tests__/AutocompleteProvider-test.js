'use strict';

var _atom = require('atom');

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons-atom/test-helpers');
}

var _;

function _load_() {
  return _ = require('..');
}

var _AutocompleteCacher;

function _load_AutocompleteCacher() {
  return _AutocompleteCacher = _interopRequireDefault(require('../../commons-atom/AutocompleteCacher'));
}

var _AutocompleteProvider;

function _load_AutocompleteProvider() {
  return _AutocompleteProvider = require('../lib/AutocompleteProvider');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _path = _interopRequireDefault(require('path'));

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
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
 */

describe.skip('AutocompleteProvider', () => {
  let editor;
  let disposables;
  let onDidInsertSuggestionSpy;

  async function runAutocompleteTest(suggestions, resolver, startingText, mainCursorPos, secondaryCursorPos, expectedText, expectedEndingCursorPos) {
    onDidInsertSuggestionSpy = jest.fn();

    const mockCache = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache(connection => {
      return {
        getAutocompleteSuggestions() {
          return Promise.resolve({
            isIncomplete: false,
            items: suggestions
          });
        },
        resolveAutocompleteSuggestion(completion) {
          const result = resolver(completion);
          if (result == null) {
            return Promise.resolve(result);
          }

          // Delete the provider to simulate this being an RPC call (since we
          // can't move that across RPC), and text edits aren't applied if there
          // isn't a provider (autocomplete-plus internals, but it's bitten us).
          delete result.provider;
          return Promise.resolve(result);
        }
      };
    });

    disposables.add((_AutocompleteProvider || _load_AutocompleteProvider()).AutocompleteProvider.register('test', ['text.plain.null-grammar'], {
      inclusionPriority: 99,
      suggestionPriority: 99,
      disableForSelector: null,
      excludeLowerPriority: true,
      analytics: {
        eventName: 'test',
        shouldLogInsertedSuggestion: false
      },
      autocompleteCacherConfig: null,
      supportsResolve: true
    }, onDidInsertSuggestionSpy, mockCache));

    editor = await atom.workspace.open('test.txt');
    await atom.packages.activatePackage('autocomplete-plus');
    atom.packages.loadPackage(_path.default.join(__dirname, '../../nuclide-autocomplete'));
    await atom.packages.activatePackage('nuclide-autocomplete');

    // Insert some text...
    let expectedUndoText;
    editor.setText(startingText);
    editor.setCursorBufferPosition(mainCursorPos);
    for (const secondaryCursor of secondaryCursorPos) {
      editor.addCursorAtBufferPosition(secondaryCursor);
    }
    editor.insertText('_');
    expectedUndoText = editor.getText();
    await (0, (_promise || _load_promise()).nextTick)();
    atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', { activatedManually: false });

    let suggestionList;
    await (0, (_waits_for || _load_waits_for()).default)(() => {
      const view = atom.views.getView(atom.workspace);
      const autocompleteView = view.querySelector('.autocomplete-plus');
      if (autocompleteView == null) {
        return false;
      }
      suggestionList = autocompleteView.querySelectorAll('li');
      return suggestionList.length > 0;
    });

    // $FlowFixMe
    expect(suggestionList.length).toEqual(suggestions.length);
    // $FlowFixMe
    for (let i = 0; i < suggestionList.length; i++) {
      const displayText = suggestions[i].displayText;

      if (!(displayText != null)) {
        throw new Error('Invariant violation: "displayText != null"');
      }
      // $FlowFixMe


      expect(suggestionList[i].innerText).toMatch(new RegExp(displayText));
    }

    // Confirm the autocomplete suggestion.
    atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:confirm');
    expect(onDidInsertSuggestionSpy).toHaveBeenCalled();
    expect(editor.getText()).toBe(expectedText);
    expect(editor.getCursorBufferPositions().map(point => point.toArray())).toEqual(expectedEndingCursorPos);

    // Make sure that the edits were atomic.
    atom.commands.dispatch(atom.views.getView(editor), 'core:undo');
    expect(editor.getText()).toBe(expectedUndoText);
  }

  beforeEach(() => {
    (0, (_testHelpers || _load_testHelpers()).attachWorkspace)();
    disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  });

  afterEach(() => {
    disposables.dispose();
    if (editor) {
      editor.destroy();
      editor = null;
    }
  });

  it('works with text edits', async () => {
    let calledResolve = false;
    const suggestion1 = {
      displayText: 'editSuggestion',
      textEdits: [{
        oldRange: new _atom.Range([0, 0], [0, 9]),
        newText: 'test range updating'
      }],
      // should be ignored
      text: 'blah',
      snippet: 'blah',

      // Add extra data to the completion to make sure that it gets returned as
      // well, rather than Atom making a fresh copy.
      notInSpec: 'blah'
    };
    const suggestion2 = {
      displayText: 'editSuggestion2',
      textEdits: [],
      // should be ignored
      text: 'blah',
      snippet: 'blah'
    };
    function resolver(completion) {
      calledResolve = true;
      expect(completion).toBe(suggestion1);
      return Object.assign({}, suggestion1, {
        textEdits: [{
          oldRange: new _atom.Range([1, 0], [2, 0]),
          newText: ''
        }, {
          // This TextEdit is identical to the one above, except that its
          // range is shorter. This simulates some of our language
          // services that use autocomplete caching, but have to send the
          // original autocomplete (without the cache's range updating) to
          // the server in order to resolve it properly.
          oldRange: new _atom.Range([0, 0], [0, 4]),
          newText: 'test range updating'
        }]
      });
    }
    await runAutocompleteTest([suggestion1, suggestion2], resolver, 'testtest\nsecond line\nthird line\n', [0, 4], [[2, 3]], 'test range updating\nthi_rd line\n', [[0, 19], [1, 4]]);
    runs(() => {
      expect(calledResolve).toBeTruthy();
    });
  });

  it('will duplicate text edits if there is one text edit and multiple cursors', async () => {
    const suggestion = {
      displayText: 'editSuggestion',
      textEdits: [{
        oldRange: new _atom.Range([0, 6], [0, 11]),
        newText: 'test'
      }]
    };
    const resolver = completion => null;
    await runAutocompleteTest([suggestion], resolver, 'first line\nsecond line\nthird line\nfourth line', [0, 10], [[1, 2], [2, 5], [3, 11]], 'first test\nse_cond line\nttest line\nfourth test', [[0, 10], [1, 3], [2, 5], [3, 11]]);
  });

  it('will not apply text edits that would overlap after copying', async () => {
    const suggestion = {
      displayText: 'editSuggestion',
      textEdits: [{
        oldRange: new _atom.Range([0, 9], [0, 12]),
        newText: 'test'
      }]
    };
    const resolver = completion => null;
    await runAutocompleteTest([suggestion], resolver, 'first line', [0, 10], [[0, 9]], 'first lin_e_', [[0, 12], [0, 10]]);
  });
}); // eslint-disable-line nuclide-internal/prefer-nuclide-uri


describe('updateAutocompleteResultRanges', () => {
  async function withEditor(callback) {
    const editor = await atom.workspace.open('test.txt');
    await callback(editor);
  }

  function makeRequest(point, editor) {
    return {
      bufferPosition: _atom.Point.fromObject(point),
      editor,
      prefix: '',
      scopeDescriptor: ''
    };
  }

  function makeResult(oldRangesList, sortText) {
    return {
      isIncomplete: false,
      items: oldRangesList.map(oldRanges => {
        if (oldRanges) {
          return {
            textEdits: oldRanges.map(oldRange => ({
              oldRange,
              newText: ''
            })),
            sortText: sortText == null ? undefined : sortText
          };
        } else {
          return {
            insertText: ''
          };
        }
      })
    };
  }

  it('updates ranges that match', async () => await withEditor(editor => {
    expect((0, (_AutocompleteProvider || _load_AutocompleteProvider()).updateAutocompleteResultRanges)(makeRequest([0, 3], editor), makeRequest([0, 5], editor), makeResult([[_atom.Range.fromObject([[0, 0], [0, 3]])]]))).toEqual(makeResult([[_atom.Range.fromObject([[0, 0], [0, 5]])]]));
  }));

  it("ignores ranges that don't", async () => await withEditor(editor => {
    expect((0, (_AutocompleteProvider || _load_AutocompleteProvider()).updateAutocompleteResultRanges)(makeRequest([0, 3], editor), makeRequest([0, 5], editor), makeResult([[_atom.Range.fromObject([[0, 0], [0, 4]])]]))).toEqual(makeResult([[_atom.Range.fromObject([[0, 0], [0, 4]])]]));
  }));

  it('can handle some elements without text edits', async () => await withEditor(editor => {
    expect((0, (_AutocompleteProvider || _load_AutocompleteProvider()).updateAutocompleteResultRanges)(makeRequest([0, 3], editor), makeRequest([0, 5], editor), makeResult([[_atom.Range.fromObject([[0, 0], [0, 3]])], []]))).toEqual(makeResult([[_atom.Range.fromObject([[0, 0], [0, 5]])], []]));
  }));

  it('can handle elements with multiple text edits', async () => await withEditor(editor => {
    expect((0, (_AutocompleteProvider || _load_AutocompleteProvider()).updateAutocompleteResultRanges)(makeRequest([0, 3], editor), makeRequest([0, 5], editor), makeResult([[_atom.Range.fromObject([[0, 0], [0, 3]]), _atom.Range.fromObject([[0, 0], [0, 4]]), _atom.Range.fromObject([[0, 2], [0, 3]])]]))).toEqual(makeResult([[_atom.Range.fromObject([[0, 0], [0, 5]]), _atom.Range.fromObject([[0, 0], [0, 4]]), _atom.Range.fromObject([[0, 2], [0, 5]])]]));
  }));

  it('works with interleaved requests when caching is enabled', async () => await withEditor(async editor => {
    function makeResponsePromise(range) {
      let resolvePromise;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      return {
        promise,
        resolve: () => range == null ? resolvePromise(null) : resolvePromise(makeResult([[range]]))
      };
    }

    const request1 = makeRequest([0, 1], editor);
    const request2 = makeRequest([0, 2], editor);
    const request3 = makeRequest([0, 3], editor);
    const request4 = makeRequest([0, 4], editor);
    let resultValue = null;
    const getSuggestions = jest.fn().mockImplementation(() => resultValue);

    const autocompleteCacher = new (_AutocompleteCacher || _load_AutocompleteCacher()).default(getSuggestions, {
      updateResults: (_ || _load_()).updateAutocompleteResults,
      updateFirstResults: (_ || _load_()).updateAutocompleteFirstResults,
      shouldFilter: () => true
    });

    // Return null from the first request to make sure that we're properly
    // attaching requests to results.
    const response1Promise = makeResponsePromise(null);
    resultValue = response1Promise.promise;
    autocompleteCacher.getSuggestions(request1);

    const response2Promise = makeResponsePromise(_atom.Range.fromObject([[0, 0], [0, 2]]));
    resultValue = response2Promise.promise;
    autocompleteCacher.getSuggestions(request2);
    expect(getSuggestions.mock.calls.length).toBe(2);

    // To hit this behavior we need to make at least two interleaved requests
    // after the most recent request that returned null (or just at least two
    // requests if none of them return null).
    const response3Promise = makeResponsePromise(_atom.Range.fromObject([[0, 0], [0, 3]]));
    resultValue = response3Promise.promise;
    autocompleteCacher.getSuggestions(request3);
    expect(getSuggestions.mock.calls.length).toBe(3);

    response1Promise.resolve();
    response2Promise.resolve();
    response3Promise.resolve();

    resultValue = new Promise((resolve, reject) => {
      reject(new Error('The third result should come from the cache.'));
    });
    const resultsFromUpdatedCache = await autocompleteCacher.getSuggestions(request4);

    expect(resultsFromUpdatedCache).toEqual(makeResult([[_atom.Range.fromObject([[0, 0], [0, 4]])]], ''));
  }));
});