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
const registerGrammarForFileExtension =
  require('../lib/register-grammar-for-file-extension');

describe('registerGrammarForFileExtension', () => {
  it('works', () => {
    waitsForPromise(async () => {
      atom.grammars.loadGrammarSync(path.join(__dirname, 'grammars/javascript.cson'));
      registerGrammarForFileExtension('source.js', 'cats');
      const textEditor = await atom.workspace.open('file.cats');
      expect(textEditor.getGrammar().scopeName).toBe('source.js');
      textEditor.destroy();
    });
  });
});
