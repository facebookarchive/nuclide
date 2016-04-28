'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Subject} from 'rxjs';

import {ActiveEditorBasedService} from '..';

type TestProvider = {
  priority: number;
  grammarScopes: Array<string>;
};

describe('ActiveEditorBasedService', () => {
  let activeEditorBasedService: ActiveEditorBasedService<TestProvider, void> = (null: any);

  let activeEditors: Subject<?atom$TextEditor> = (null: any);
  let editorChanges: Subject<void> = (null: any);

  let editor1: atom$TextEditor = (null: any);
  let editor2: atom$TextEditor = (null: any);

  let resultingEventsPromise: Promise<Array<string>> = (null: any);

  let shouldProviderError: boolean = (null: any);

  beforeEach(() => {
    waitsForPromise(async () => {
      activeEditors = new Subject();
      editorChanges = new Subject();
      shouldProviderError = false;

      const eventSources = {
        activeEditors,
        changesForEditor: () => editorChanges,
      };

      activeEditorBasedService = new ActiveEditorBasedService(
        async () => {
          if (shouldProviderError) {
            throw new Error('baaaaad');
          }
        },
        eventSources,
      );

      editor1 = await atom.workspace.open();
      editor2 = await atom.workspace.open();

      resultingEventsPromise = activeEditorBasedService.getResultsStream()
        .map(result => result.kind)
        .toArray()
        .toPromise();
    });
  });

  describe('when there is a provider', () => {
    beforeEach(() => {
      activeEditorBasedService.consumeProvider({
        priority: 10,
        grammarScopes: ['text.plain.null-grammar'],
      });
    });

    it('should create correct event stream during normal use', () => {
      waitsForPromise(async () => {
        activeEditors.next(null);
        await waitForNextTick();

        activeEditors.next(editor1);
        await waitForNextTick();

        editorChanges.next(undefined);
        await waitForNextTick();

        activeEditors.next(editor2);

        // This doesn't happen in normal use but it's useful to be able to truncate the stream for
        // testing.
        activeEditors.complete();
        editorChanges.complete();

        expect(await resultingEventsPromise).toEqual([
          'not-text-editor',
          'pane-change',
          'result',
          'edit',
          'result',
          'pane-change',
          'result',
        ]);
      });
    });

    it("should produce the 'provider-error' event when a provider errors", () => {
      waitsForPromise(async () => {
        shouldProviderError = true;

        activeEditors.next(editor1);
        await waitForNextTick();

        activeEditors.complete();
        editorChanges.complete();

        expect(await resultingEventsPromise).toEqual([
          'pane-change',
          'provider-error',
        ]);
      });
    });
  });

  describe('when there is no provider', () => {
    it("should produce the 'no-provider' result when there is no provider", () => {
      waitsForPromise(async () => {
        activeEditors.next(editor1);
        await waitForNextTick();

        activeEditors.complete();
        editorChanges.complete();

        expect(await resultingEventsPromise).toEqual([
          'pane-change',
          'no-provider',
        ]);
      });
    });
  });
});

function waitForNextTick(): Promise<void> {
  return new Promise(resolve => process.nextTick(resolve));
}
