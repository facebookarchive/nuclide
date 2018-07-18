"use strict";

function _testHelpers() {
  const data = require("../../nuclide-commons/test-helpers");

  _testHelpers = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _ActiveEditorRegistry() {
  const data = _interopRequireDefault(require("../ActiveEditorRegistry"));

  _ActiveEditorRegistry = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
describe('ActiveEditorRegistry', () => {
  let activeEditorRegistry = null;
  let activeEditors = null;
  let editorChanges = null;
  let editorSaves = null;
  let resultFunction = null;
  let config = null;
  let eventSources = null;
  let editor1 = null;
  let editor2 = null;
  let events = null;
  let eventNames = null;
  let shouldProviderError = null;

  function initializeService() {
    activeEditorRegistry = new (_ActiveEditorRegistry().default)(resultFunction, config, eventSources);
    events = activeEditorRegistry.getResultsStream().publishReplay();
    eventNames = events.map(event => event.kind);
    events.connect();
  }

  beforeEach(async () => {
    activeEditors = new _RxMin.Subject();
    editorChanges = new _RxMin.Subject();
    editorSaves = new _RxMin.Subject();
    shouldProviderError = false;
    resultFunction = jest.fn().mockImplementation(async () => {
      if (shouldProviderError) {
        throw new Error('baaaaad');
      }
    });
    config = {};
    eventSources = {
      activeEditors,
      changesForEditor: () => editorChanges,
      savesForEditor: () => editorSaves
    };
    initializeService();
    editor1 = await atom.workspace.open();
    editor2 = await atom.workspace.open();
  });
  describe('when there is a provider', () => {
    let provider = null;
    beforeEach(() => {
      provider = {
        priority: 10,
        grammarScopes: ['text.plain.null-grammar']
      };
      activeEditorRegistry.consumeProvider(provider);
    });
    it('should create correct event stream during normal use', async () => {
      activeEditors.next(null);
      await waitForNextTick();
      activeEditors.next(editor1);
      await waitForNextTick();
      editorChanges.next(undefined);
      await waitForNextTick();
      activeEditors.next(editor2);
      await (0, _testHelpers().expectObservableToStartWith)(eventNames, ['not-text-editor', 'pane-change', 'result', 'edit', 'result', 'pane-change', 'result']);
      const fullEvents = await events.take(4).toArray().toPromise();
      expect(fullEvents[1]).toEqual({
        kind: 'pane-change',
        editor: editor1
      });
      expect(fullEvents[2]).toEqual({
        kind: 'result',
        editor: editor1,
        provider,
        result: undefined
      });
      expect(fullEvents[3]).toEqual({
        kind: 'edit',
        editor: editor1
      });
    });
    it('should not emit save events when it is configured to respond to edit events', async () => {
      activeEditors.next(editor1);
      await waitForNextTick();
      editorChanges.next(undefined);
      await waitForNextTick();
      editorSaves.next(undefined);
      await waitForNextTick();
      await (0, _testHelpers().expectObservableToStartWith)(eventNames, ['pane-change', 'result', 'edit', 'result']);
    });
    describe('when configured to respond to save events', () => {
      beforeEach(() => {
        config.updateOnEdit = false;
        initializeService(); // Have to re-add this since the re-initialization kills it

        activeEditorRegistry.consumeProvider({
          priority: 10,
          grammarScopes: ['text.plain.null-grammar']
        });
      });
      it('should generate and respond to save events', async () => {
        activeEditors.next(editor1);
        await waitForNextTick();
        editorChanges.next(undefined);
        await waitForNextTick();
        editorSaves.next(undefined);
        await waitForNextTick();
        await (0, _testHelpers().expectObservableToStartWith)(eventNames, ['pane-change', 'result', 'save', 'result']);
        const fullEvents = await events.take(3).toArray().toPromise();
        expect(fullEvents[2]).toEqual({
          kind: 'save',
          editor: editor1
        });
      });
    });
    describe('when given providers with different updateOnEdit settings', () => {
      beforeEach(() => {
        initializeService(); // Have to re-add this since the re-initialization kills it

        activeEditorRegistry.consumeProvider({
          priority: 10,
          grammarScopes: ['text.plain.null-grammar']
        });
        activeEditorRegistry.consumeProvider({
          priority: 10,
          grammarScopes: ['source.cpp'],
          updateOnEdit: false
        });
        jest.spyOn(editor2, 'getGrammar').mockReturnValue({
          scopeName: 'source.cpp'
        });
      });
      it('should generate and respond to the appropriate event', async () => {
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
        await (0, _testHelpers().expectObservableToStartWith)(eventNames, ['pane-change', 'result', 'edit', 'result', 'pane-change', 'result', 'save', 'result']);
      });
    });
    it("should produce the 'provider-error' event when a provider errors", async () => {
      shouldProviderError = true;
      activeEditors.next(editor1);
      await waitForNextTick();
      await (0, _testHelpers().expectObservableToStartWith)(eventNames, ['pane-change', 'provider-error']);
      expect((await events.elementAt(1).toPromise())).toEqual({
        kind: 'provider-error',
        provider
      });
    });
    it('should immediately query a better provider', () => {
      const betterProvider = {
        priority: 20,
        grammarScopes: ['text.plain.null-grammar']
      };
      activeEditors.next(editor1);
      expect(resultFunction).toHaveBeenCalledWith(provider, editor1);
      activeEditorRegistry.consumeProvider(betterProvider);
      expect(resultFunction).toHaveBeenCalledWith(betterProvider, editor1);
    });
  });
  describe('when there is no provider', () => {
    it("should produce the 'no-provider' result when there is no provider", async () => {
      activeEditors.next(editor1);
      await waitForNextTick();
      await (0, _testHelpers().expectObservableToStartWith)(eventNames, ['pane-change', 'no-provider']);
    });
  });
});

function waitForNextTick() {
  return new Promise(resolve => process.nextTick(resolve));
}