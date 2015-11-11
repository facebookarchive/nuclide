'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const path = require('path');
const {observeGrammarForTextEditors} = require('../lib/main');

describe('observeGrammarForTextEditors', () => {
  atom.grammars.loadGrammarSync(path.join(__dirname, 'grammars/objective-c.cson'));
  const objcGrammar = atom.grammars.grammarForScopeName('source.objc');
  atom.grammars.loadGrammarSync(path.join(__dirname, 'grammars/javascript.cson'));
  const jsGrammar = atom.grammars.grammarForScopeName('source.js');

  it('calls for existing text editors', () => {
    waitsForPromise(async () => {
      const textEditor = await atom.workspace.open('file.m');

      const fn: any = jasmine.createSpy('fn');
      const subscription = observeGrammarForTextEditors(fn);
      expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn.callCount).toBe(1);

      subscription.dispose();
    });
  });

  it('calls for new text editors', () => {
    waitsForPromise(async () => {
      const fn: any = jasmine.createSpy('fn');
      const subscription = observeGrammarForTextEditors(fn);
      const textEditor = await atom.workspace.open('file.m');

      expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn.callCount).toBe(1);

      subscription.dispose();
    });
  });

  it('calls when a text editor changes grammars', () => {
    waitsForPromise(async () => {
      const fn: any = jasmine.createSpy('fn');
      const subscription = observeGrammarForTextEditors(fn);
      // $FlowIssue
      const textEditor = await atom.workspace.open('file.m');
      textEditor.setGrammar(jsGrammar);

      expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn).toHaveBeenCalledWith(textEditor, jsGrammar);
      expect(fn.callCount).toBe(2);

      subscription.dispose();
    });
  });

  it('does not call after the return value is disposed', () => {
    waitsForPromise(async () => {
      const fn: any = jasmine.createSpy('fn');
      const subscription = observeGrammarForTextEditors(fn);
      // $FlowIssue
      const textEditor = await atom.workspace.open('file.m');

      subscription.dispose();
      textEditor.setGrammar(jsGrammar);

      expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn.callCount).toBe(1);

      subscription.dispose();
    });
  });

  it('calls for other clients after another listener is disposed', () => {
    waitsForPromise(async () => {
      const fn: any = jasmine.createSpy('fn');
      const subscription = observeGrammarForTextEditors(fn);
      const fn2: any = jasmine.createSpy('fn2');
      const subscription2 = observeGrammarForTextEditors(fn2);
      // $FlowIssue
      const textEditor = await atom.workspace.open('file.m');

      subscription.dispose();

      textEditor.setGrammar(jsGrammar);

      expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn.callCount).toBe(1);
      expect(fn2).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn2).toHaveBeenCalledWith(textEditor, jsGrammar);
      expect(fn2.callCount).toBe(2);

      subscription2.dispose();
    });
  });
});
