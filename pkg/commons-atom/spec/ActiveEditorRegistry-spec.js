'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  Config,
  EventSources,
  ResultFunction,
  Result,
} from '../ActiveEditorRegistry';

import invariant from 'assert';
import {Subject} from 'rxjs';

import ActiveEditorRegistry from '../ActiveEditorRegistry';

type TestProvider = {
  priority: number;
  grammarScopes: Array<string>;
  updateOnEdit?: boolean;
};

describe('ActiveEditorRegistry', () => {
  let activeEditorRegistry: ActiveEditorRegistry<TestProvider, void> = (null: any);

  let activeEditors: Subject<?atom$TextEditor> = (null: any);
  let editorChanges: Subject<void> = (null: any);
  let editorSaves: Subject<void> = (null: any);

  let resultFunction: ResultFunction<TestProvider, void> = (null: any);
  let config: Config = (null: any);
  let eventSources: EventSources = (null: any);

  let editor1: atom$TextEditor = (null: any);
  let editor2: atom$TextEditor = (null: any);

  let resultingEventsPromise: Promise<Array<string>> = (null: any);
  let fullEventsPromise: Promise<Array<Result<TestProvider, void>>> = (null: any);

  let shouldProviderError: boolean = (null: any);

  function initializeService() {
    activeEditorRegistry = new ActiveEditorRegistry(
      resultFunction,
      config,
      eventSources,
    );

    fullEventsPromise = activeEditorRegistry.getResultsStream()
      .toArray()
      .toPromise();
    resultingEventsPromise = fullEventsPromise.then(arr => arr.map(result => result.kind));
  }

  // This doesn't happen in normal use but it's useful to be able to truncate the stream for
  // testing.
  function completeSources() {
    activeEditors.complete();
    editorChanges.complete();
    editorSaves.complete();
  }

  beforeEach(() => {
    waitsForPromise(async () => {
      activeEditors = new Subject();
      editorChanges = new Subject();
      editorSaves = new Subject();
      shouldProviderError = false;

      resultFunction = async () => {
        if (shouldProviderError) {
          throw new Error('baaaaad');
        }
      };
      config = {};
      eventSources = {
        activeEditors,
        changesForEditor: () => editorChanges,
        savesForEditor: () => editorSaves,
      };

      initializeService();

      editor1 = await atom.workspace.open();
      editor2 = await atom.workspace.open();
    });
  });

  describe('when there is a provider', () => {
    let provider: TestProvider = (null: any);
    beforeEach(() => {
      provider = {
        priority: 10,
        grammarScopes: ['text.plain.null-grammar'],
      };
      activeEditorRegistry.consumeProvider(provider);
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

        completeSources();

        expect(await resultingEventsPromise).toEqual([
          'not-text-editor',
          'pane-change',
          'result',
          'edit',
          'result',
          'pane-change',
          'result',
        ]);

        const fullEvents = await fullEventsPromise;
        const firstResult = fullEvents[2];
        invariant(firstResult.kind === 'result');
        expect(firstResult.editor).toBe(editor1);
        expect(firstResult.provider).toBe(provider);
      });
    });

    it('should not emit save events when it is configured to respond to edit events', () => {
      waitsForPromise(async () => {
        activeEditors.next(editor1);
        await waitForNextTick();

        editorChanges.next(undefined);
        await waitForNextTick();

        editorSaves.next(undefined);
        await waitForNextTick();

        completeSources();

        expect(await resultingEventsPromise).toEqual([
          'pane-change',
          'result',
          'edit',
          'result',
        ]);
      });
    });

    describe('when configured to respond to save events', () => {
      beforeEach(() => {
        config.updateOnEdit = false;
        initializeService();
        // Have to re-add this since the re-initialization kills it
        activeEditorRegistry.consumeProvider({
          priority: 10,
          grammarScopes: ['text.plain.null-grammar'],
        });
      });

      it('should generate and respond to save events', () => {
        waitsForPromise(async () => {
          activeEditors.next(editor1);
          await waitForNextTick();

          editorChanges.next(undefined);
          await waitForNextTick();

          editorSaves.next(undefined);
          await waitForNextTick();

          completeSources();

          expect(await resultingEventsPromise).toEqual([
            'pane-change',
            'result',
            'save',
            'result',
          ]);
        });
      });
    });

    describe('when given providers with different updateOnEdit settings', () => {
      beforeEach(() => {
        initializeService();
        // Have to re-add this since the re-initialization kills it
        activeEditorRegistry.consumeProvider({
          priority: 10,
          grammarScopes: ['text.plain.null-grammar'],
        });
        activeEditorRegistry.consumeProvider({
          priority: 10,
          grammarScopes: ['source.cpp'],
          updateOnEdit: false,
        });
        spyOn(editor2, 'getGrammar').andReturn({
          scopeName: 'source.cpp',
        });
      });

      it('should generate and respond to the appropriate event', () => {
        waitsForPromise(async () => {
          activeEditors.next(editor1);
          await waitForNextTick();

          editorChanges.next(undefined);
          await waitForNextTick();

          editorSaves.next(undefined);
          await waitForNextTick();

          activeEditors.next(editor2);
          await waitForNextTick();

          editorChanges.next(undefined);
          await waitForNextTick();

          editorSaves.next(undefined);
          await waitForNextTick();

          completeSources();

          expect(await resultingEventsPromise).toEqual([
            'pane-change',
            'result',
            'edit',
            'result',
            'pane-change',
            'result',
            'save',
            'result',
          ]);
        });
      });
    });

    it("should produce the 'provider-error' event when a provider errors", () => {
      waitsForPromise(async () => {
        shouldProviderError = true;

        activeEditors.next(editor1);
        await waitForNextTick();

        completeSources();

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

        completeSources();

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
