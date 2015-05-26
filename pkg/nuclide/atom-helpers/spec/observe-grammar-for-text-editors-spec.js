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
var {observeGrammarForTextEditors} = require('../lib/main');

describe('observeGrammarForTextEditors', () => {
  atom.grammars.loadGrammarSync(path.join(__dirname, 'grammars/objective-c.cson'));
  var objcGrammar = atom.grammars.grammarForScopeName('source.objc');
  atom.grammars.loadGrammarSync(path.join(__dirname, 'grammars/javascript.cson'));
  var jsGrammar = atom.grammars.grammarForScopeName('source.js');

  it('calls for existing text editors', () => {
    waitsForPromise(async () => {
      var textEditor = await atom.workspace.open('file.m');

      var fn = jasmine.createSpy('fn');
      var subscription = observeGrammarForTextEditors(fn);
      expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn.callCount).toBe(1);

      subscription.dispose();
    });
  });

  it('calls for new text editors', () => {
    waitsForPromise(async () => {
      var fn = jasmine.createSpy('fn');
      var subscription = observeGrammarForTextEditors(fn);
      var textEditor = await atom.workspace.open('file.m');

      expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn.callCount).toBe(1);

      subscription.dispose();
    });
  });

  it('calls when a text editor changes grammars', () => {
    waitsForPromise(async () => {
      var fn = jasmine.createSpy('fn');
      var subscription = observeGrammarForTextEditors(fn);
      var textEditor = await atom.workspace.open('file.m');
      textEditor.setGrammar(jsGrammar);

      expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn).toHaveBeenCalledWith(textEditor, jsGrammar);
      expect(fn.callCount).toBe(2);

      subscription.dispose();
    });
  });

  it('does not call after the return value is disposed', () => {
    waitsForPromise(async () => {
      var fn = jasmine.createSpy('fn');
      var subscription = observeGrammarForTextEditors(fn);
      var textEditor = await atom.workspace.open('file.m');

      subscription.dispose();
      textEditor.setGrammar(jsGrammar);

      expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn.callCount).toBe(1);

      subscription.dispose();
    });
  });

  it('calls for other clients after another listener is disposed', () => {
    waitsForPromise(async () => {
      var fn = jasmine.createSpy('fn');
      var subscription = observeGrammarForTextEditors(fn);
      var fn2 = jasmine.createSpy('fn2');
      var subscription2 = observeGrammarForTextEditors(fn2);
      var textEditor = await atom.workspace.open('file.m');

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
