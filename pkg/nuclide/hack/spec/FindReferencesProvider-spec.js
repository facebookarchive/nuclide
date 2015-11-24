'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {Point} = require('atom');
const {HACK_GRAMMARS} = require('nuclide-hack-common');
const hack = require('../lib/hack');

describe('FindReferencesProvider', () => {
  // Create a fake editor
  const mockEditor = {
    getGrammar() {
      return {scopeName: HACK_GRAMMARS[0]};
    },
    getPath() {
      return '/test/test.php';
    },
  };

  let FindReferencesProvider;
  beforeEach(() => {
    spyOn(hack, 'findReferences').andReturn({
      baseUri: '/test/',
      symbolName: 'TestClass::testFunction',
      references: [
        {
          name: 'TestClass::testFunction',
          filename: '/test/file1.php',
          line: 13,
          char_start: 5,
          char_end: 7,
        },
        {
          name: 'TestClass::testFunction',
          filename: '/test/file2.php',
          line: 11,
          char_start: 1,
          char_end: 3,
        },
      ],
    });

    // Can't load this until `hack` is mocked
    FindReferencesProvider = require('../lib/FindReferencesProvider');
  });

  it('should be able to return references', () => {
    waitsForPromise(async () => {
      const refs = await FindReferencesProvider.findReferences(mockEditor, new Point(1, 1));
      expect(refs).toEqual({
        type: 'data',
        baseUri: '/test/',
        referencedSymbolName: 'TestClass::testFunction',
        references: [
          {
            uri: '/test/file1.php',
            name: null,
            start: {line: 13, column: 5},
            end: {line: 13, column: 7},
          },
          {
            uri: '/test/file2.php',
            name: null,
            start: {line: 11, column: 1},
            end: {line: 11, column: 3},
          },
        ],
      });
    });
  });
});
