'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');
var {observeLanguageTextEditors} = require('../lib/main');

describe('observeLanguageTextEditors', () => {
  atom.grammars.loadGrammarSync(path.join(__dirname, 'grammars/objective-c.cson'));
  var objcGrammar = atom.grammars.grammarForScopeName('source.objc');
  atom.grammars.loadGrammarSync(path.join(__dirname, 'grammars/java.cson'));
  var javaGrammar = atom.grammars.grammarForScopeName('source.java');
  atom.grammars.loadGrammarSync(path.join(__dirname, 'grammars/javascript.cson'));
  var jsGrammar = atom.grammars.grammarForScopeName('source.js');
  var nullGrammar = atom.grammars.grammarForScopeName('text.plain.null-grammar');

  var grammarScopes = [
    objcGrammar.scopeName,
    javaGrammar.scopeName,
  ];

  describe('without cleanup function', () => {
    it('calls for existing text editors that match the grammars', () => {
      waitsForPromise(async () => {
        var textEditor = await atom.workspace.open('file.m');

        var fn = jasmine.createSpy('fn');
        var subscription = observeLanguageTextEditors(grammarScopes, fn);

        expect(fn).toHaveBeenCalledWith(textEditor);
        expect(fn.callCount).toBe(1);

        subscription.dispose();
      });
    });

    it('calls for new text editors that already match the grammars', () => {
      waitsForPromise(async () => {
        var fn = jasmine.createSpy('fn');
        var subscription = observeLanguageTextEditors(grammarScopes, fn);

        var textEditor = await atom.workspace.open('file.m');

        expect(fn).toHaveBeenCalledWith(textEditor);
        expect(fn.callCount).toBe(1);

        subscription.dispose();
      });
    });

    it('calls for new text editors that change to match the grammars', () => {
      waitsForPromise(async () => {
        var fn = jasmine.createSpy('fn');
        var subscription = observeLanguageTextEditors(grammarScopes, fn);

        var textEditor = await atom.workspace.open();
        textEditor.setGrammar(objcGrammar);

        expect(fn).toHaveBeenCalledWith(textEditor);
        expect(fn.callCount).toBe(1);

        subscription.dispose();
      });
    });

    it('does not call for new text editors that change and still don\'t match the grammars', () => {
      waitsForPromise(async () => {
        var fn = jasmine.createSpy('fn');
        var subscription = observeLanguageTextEditors(grammarScopes, fn);

        var textEditor = await atom.workspace.open();
        textEditor.setGrammar(jsGrammar);

        expect(fn.callCount).toBe(0);

        subscription.dispose();
      });
    });

    it('does not call for text editors whose matching grammar changes but still matches', () => {
      waitsForPromise(async () => {
        var fn = jasmine.createSpy('fn');
        var subscription = observeLanguageTextEditors(grammarScopes, fn);

        var textEditor = await atom.workspace.open('file.m');
        textEditor.setGrammar(javaGrammar);

        expect(fn).toHaveBeenCalledWith(textEditor);
        expect(fn.callCount).toBe(1);

        subscription.dispose();
      });
    });

    it('stops listening to grammar changes on text editors that are destroyed', () => {
      waitsForPromise(async () => {
        var fn = jasmine.createSpy('fn');
        var subscription = observeLanguageTextEditors(grammarScopes, fn);

        var textEditor = await atom.workspace.open('file.m');
        textEditor.destroy();

        subscription.dispose();
      });
    });
  });

  describe('with cleanup function', () => {
    it('does not call for existing text editors that do not match the grammars', () => {
      waitsForPromise(async () => {
        await atom.workspace.open();

        var fn = jasmine.createSpy('fn');
        var cleanupFn = jasmine.createSpy('cleanupFn');
        var subscription = observeLanguageTextEditors(grammarScopes, fn, cleanupFn);

        expect(cleanupFn.callCount).toBe(0);

        subscription.dispose();
      });
    });

    it('does not call for new text editors that never matched the grammars', () => {
      waitsForPromise(async () => {
        var fn = jasmine.createSpy('fn');
        var cleanupFn = jasmine.createSpy('cleanupFn');
        var subscription = observeLanguageTextEditors(grammarScopes, fn, cleanupFn);

        var textEditor = await atom.workspace.open('file.js');
        textEditor.setGrammar(nullGrammar);

        expect(cleanupFn.callCount).toBe(0);

        subscription.dispose();
      });
    });

    it('calls for new text editors that stop matching the grammars', () => {
      waitsForPromise(async () => {
        var fn = jasmine.createSpy('fn');
        var cleanupFn = jasmine.createSpy('cleanupFn');
        var subscription = observeLanguageTextEditors(grammarScopes, fn, cleanupFn);

        var textEditor = await atom.workspace.open('file.m');
        textEditor.setGrammar(nullGrammar);

        expect(cleanupFn).toHaveBeenCalledWith(textEditor);
        expect(cleanupFn.callCount).toBe(1);

        subscription.dispose();
      });
    });

    it('does not call when new text editors that do not match the grammars are destroyed', () => {
      waitsForPromise(async () => {
        var fn = jasmine.createSpy('fn');
        var cleanupFn = jasmine.createSpy('cleanupFn');
        var subscription = observeLanguageTextEditors(grammarScopes, fn, cleanupFn);

        var textEditor = await atom.workspace.open('file.js');
        textEditor.destroy();

        expect(cleanupFn.callCount).toBe(0);

        subscription.dispose();
      });
    });

    it('calls when new text editors matching the grammars are destroyed', () => {
      waitsForPromise(async () => {
        var fn = jasmine.createSpy('fn');
        var cleanupFn = jasmine.createSpy('cleanupFn');
        var subscription = observeLanguageTextEditors(grammarScopes, fn, cleanupFn);

        var textEditor = await atom.workspace.open('file.m');
        textEditor.destroy();

        expect(cleanupFn).toHaveBeenCalledWith(textEditor);
        expect(cleanupFn.callCount).toBe(1);

        subscription.dispose();
      });
    });
  });
});
