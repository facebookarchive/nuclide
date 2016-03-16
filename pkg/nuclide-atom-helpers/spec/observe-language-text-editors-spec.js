'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const invariant = require('assert');
const path = require('path');
const {observeLanguageTextEditors, observeGrammarForTextEditors} = require('..');

describe('observeLanguageTextEditors', () => {
  let objcGrammar;
  let javaGrammar;
  let jsGrammar;
  let nullGrammar;
  let grammarScopes;

  beforeEach(() => {
    observeGrammarForTextEditors.__reset__();
    atom.grammars.loadGrammarSync(path.join(__dirname, 'grammars/objective-c.cson'));
    objcGrammar = atom.grammars.grammarForScopeName('source.objc');
    invariant(objcGrammar);
    atom.grammars.loadGrammarSync(path.join(__dirname, 'grammars/java.cson'));
    javaGrammar = atom.grammars.grammarForScopeName('source.java');
    invariant(javaGrammar);
    atom.grammars.loadGrammarSync(path.join(__dirname, 'grammars/javascript.cson'));
    jsGrammar = atom.grammars.grammarForScopeName('source.js');
    nullGrammar = atom.grammars.grammarForScopeName('text.plain.null-grammar');

    grammarScopes = [
      objcGrammar.scopeName,
      javaGrammar.scopeName,
    ];
  });

  describe('without cleanup function', () => {
    it('calls for existing text editors that match the grammars', () => {
      waitsForPromise(async () => {
        const textEditor = await atom.workspace.open('file.m');

        const fn: any = jasmine.createSpy('fn');
        const subscription = observeLanguageTextEditors(grammarScopes, fn);

        expect(fn).toHaveBeenCalledWith(textEditor);
        expect(fn.callCount).toBe(1);

        subscription.dispose();
      });
    });

    it('calls for new text editors that already match the grammars', () => {
      waitsForPromise(async () => {
        const fn: any = jasmine.createSpy('fn');
        const subscription = observeLanguageTextEditors(grammarScopes, fn);

        const textEditor = await atom.workspace.open('file.m');

        expect(fn).toHaveBeenCalledWith(textEditor);
        expect(fn.callCount).toBe(1);

        subscription.dispose();
      });
    });

    it('calls for new text editors that change to match the grammars', () => {
      waitsForPromise(async () => {
        const fn: any = jasmine.createSpy('fn');
        const subscription = observeLanguageTextEditors(grammarScopes, fn);

        // $FlowIssue
        const textEditor = await atom.workspace.open();
        textEditor.setGrammar(objcGrammar);

        expect(fn).toHaveBeenCalledWith(textEditor);
        expect(fn.callCount).toBe(1);

        subscription.dispose();
      });
    });

    it('does not call for new text editors that change and still don\'t match the grammars', () => {
      waitsForPromise(async () => {
        const fn: any = jasmine.createSpy('fn');
        const subscription = observeLanguageTextEditors(grammarScopes, fn);

        // $FlowIssue
        const textEditor = await atom.workspace.open();
        textEditor.setGrammar(jsGrammar);

        expect(fn.callCount).toBe(0);

        subscription.dispose();
      });
    });

    it('does not call for text editors whose matching grammar changes but still matches', () => {
      waitsForPromise(async () => {
        const fn: any = jasmine.createSpy('fn');
        const subscription = observeLanguageTextEditors(grammarScopes, fn);

        // $FlowIssue
        const textEditor = await atom.workspace.open('file.m');
        textEditor.setGrammar(javaGrammar);

        expect(fn).toHaveBeenCalledWith(textEditor);
        expect(fn.callCount).toBe(1);

        subscription.dispose();
      });
    });

    it('stops listening to grammar changes on text editors that are destroyed', () => {
      waitsForPromise(async () => {
        const fn: any = jasmine.createSpy('fn');
        const subscription = observeLanguageTextEditors(grammarScopes, fn);

        const textEditor = await atom.workspace.open('file.m');
        textEditor.destroy();

        subscription.dispose();
      });
    });
  });

  describe('with cleanup function', () => {
    it('does not call for existing text editors that do not match the grammars', () => {
      waitsForPromise(async () => {
        await atom.workspace.open();

        const fn: any = jasmine.createSpy('fn');
        const cleanupFn: any = jasmine.createSpy('cleanupFn');
        const subscription = observeLanguageTextEditors(grammarScopes, fn, cleanupFn);

        expect(cleanupFn.callCount).toBe(0);

        subscription.dispose();
      });
    });

    it('does not call for new text editors that never matched the grammars', () => {
      waitsForPromise(async () => {
        const fn: any = jasmine.createSpy('fn');
        const cleanupFn: any = jasmine.createSpy('cleanupFn');
        const subscription = observeLanguageTextEditors(grammarScopes, fn, cleanupFn);

        // $FlowIssue
        const textEditor = await atom.workspace.open('file.js');
        textEditor.setGrammar(nullGrammar);

        expect(cleanupFn.callCount).toBe(0);

        subscription.dispose();
      });
    });

    it('calls for new text editors that stop matching the grammars', () => {
      waitsForPromise(async () => {
        const fn: any = jasmine.createSpy('fn');
        const cleanupFn: any = jasmine.createSpy('cleanupFn');
        const subscription = observeLanguageTextEditors(grammarScopes, fn, cleanupFn);

        // $FlowIssue
        const textEditor = await atom.workspace.open('file.m');
        textEditor.setGrammar(nullGrammar);

        expect(cleanupFn).toHaveBeenCalledWith(textEditor);
        expect(cleanupFn.callCount).toBe(1);

        subscription.dispose();
      });
    });

    it('does not call when new text editors that do not match the grammars are destroyed', () => {
      waitsForPromise(async () => {
        const fn: any = jasmine.createSpy('fn');
        const cleanupFn: any = jasmine.createSpy('cleanupFn');
        const subscription = observeLanguageTextEditors(grammarScopes, fn, cleanupFn);

        const textEditor = await atom.workspace.open('file.js');
        textEditor.destroy();

        expect(cleanupFn.callCount).toBe(0);

        subscription.dispose();
      });
    });

    it('calls when new text editors matching the grammars are destroyed', () => {
      waitsForPromise(async () => {
        const fn: any = jasmine.createSpy('fn');
        const cleanupFn: any = jasmine.createSpy('cleanupFn');
        const subscription = observeLanguageTextEditors(grammarScopes, fn, cleanupFn);

        const textEditor = await atom.workspace.open('file.m');
        textEditor.destroy();

        expect(cleanupFn).toHaveBeenCalledWith(textEditor);
        expect(cleanupFn.callCount).toBe(1);

        subscription.dispose();
      });
    });
  });
});
