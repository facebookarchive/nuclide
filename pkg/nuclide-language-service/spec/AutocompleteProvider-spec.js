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

import type {AutocompleteResult, Completion} from '../lib/LanguageService';

import {Range} from 'atom';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {jasmineAttachWorkspace} from 'nuclide-commons-atom/test-helpers';
import {AutocompleteProvider} from '../lib/AutocompleteProvider';
import {ConnectionCache} from '../../nuclide-remote-connection';
import path from 'path'; // eslint-disable-line rulesdir/prefer-nuclide-uri

describe('AutocompleteProvider', () => {
  let editor: atom$TextEditor;
  let disposables: UniversalDisposable;
  const onDidInsertSuggestionSpy = jasmine.createSpy('onDidInsertSuggestion');
  let calledResolve;

  beforeEach(() => {
    jasmineAttachWorkspace();
    jasmine.useRealClock();
    calledResolve = false;

    const suggestion1 = {
      displayText: 'editSuggestion',
      textEdits: [
        {
          oldRange: new Range([0, 0], [0, 9]),
          newText: "this won't be selected; it'll be replaced in resolving.",
        },
      ],
      // should be ignored
      text: 'blah',
      snippet: 'blah',

      // Add extra data to the completion to make sure that it gets returned as
      // well, rather than Atom making a fresh copy.
      notInSpec: 'blah',
    };
    const suggestion2 = {
      displayText: 'editSuggestion2',
      textEdits: [],
      // should be ignored
      text: 'blah',
      snippet: 'blah',
    };

    const mockCache = new ConnectionCache(connection => {
      return ({
        getAutocompleteSuggestions(): Promise<?AutocompleteResult> {
          return Promise.resolve({
            isIncomplete: false,
            items: [suggestion1, suggestion2],
          });
        },
        resolveAutocompleteSuggestion(
          completion: Completion,
        ): Promise<?Completion> {
          calledResolve = true;
          expect(completion).toBe(suggestion1);
          const result = {
            ...suggestion1,
            textEdits: [
              {
                oldRange: new Range([0, 0], [0, 9]),
                newText: 'replaced line',
              },
              {
                oldRange: new Range([1, 0], [2, 0]),
                newText: '',
              },
            ],
          };

          // Delete the provider to simulate this being an RPC call (since we
          // can't move that across RPC), and text edits aren't applied if there
          // isn't a provider (autocomplete-plus internals, but it's bitten us).
          delete result.provider;
          return Promise.resolve(result);
        },
      }: any);
    });

    disposables = new UniversalDisposable(
      AutocompleteProvider.register(
        'test',
        ['text.plain.null-grammar'],
        {
          inclusionPriority: 99,
          suggestionPriority: 99,
          disableForSelector: null,
          excludeLowerPriority: true,
          analytics: {
            eventName: 'test',
            shouldLogInsertedSuggestion: false,
          },
          autocompleteCacherConfig: null,
          supportsResolve: true,
        },
        onDidInsertSuggestionSpy,
        mockCache,
      ),
    );

    waitsForPromise({timeout: 10000}, async () => {
      editor = await atom.workspace.open('test.txt');
      await atom.packages.activatePackage('autocomplete-plus');
      atom.packages.loadPackage(
        path.join(__dirname, '../../nuclide-autocomplete'),
      );
      await atom.packages.activatePackage('nuclide-autocomplete');
    });
  });

  afterEach(() => {
    disposables.dispose();
  });

  it('works with text edits', () => {
    // Insert some text...
    runs(() => {
      editor.setText('testtest\nsecond line\nthird line\n');
      // Create two cursors to test multi-cursor behavior.
      editor.setCursorBufferPosition([0, 4]);
      editor.addCursorAtBufferPosition([2, 3]);
      editor.insertText('_');
    });

    let suggestionList;
    waitsFor('autocomplete suggestions to appear', () => {
      const view = atom.views.getView(atom.workspace);
      const autocompleteView = view.querySelector('.autocomplete-plus');
      if (autocompleteView == null) {
        return false;
      }
      suggestionList = autocompleteView.querySelectorAll('li');
      return suggestionList.length > 0;
    });

    runs(() => {
      expect(suggestionList[0].innerText).toMatch(/^editSuggestion\s+/);
      expect(suggestionList[1].innerText).toMatch(/^editSuggestion2\s+/);
      expect(calledResolve).toBeTruthy();

      // Confirm the autocomplete suggestion.
      atom.commands.dispatch(
        atom.views.getView(editor),
        'autocomplete-plus:confirm',
      );
      expect(onDidInsertSuggestionSpy).toHaveBeenCalled();
      expect(editor.getText()).toBe('replaced line\nthi_rd line\n');
      expect(
        editor.getCursorBufferPositions().map(point => point.toArray()),
      ).toEqual([
        [0, 13], // First cursor goes to the end of the first line.
        [1, 4], // Second cursor just moves up one line.
      ]);
    });

    // Make sure that the edits were atomic.
    runs(() => {
      atom.commands.dispatch(atom.views.getView(editor), 'core:undo');
      expect(editor.getText()).toBe('test_test\nsecond line\nthi_rd line\n');
    });
  });
});
