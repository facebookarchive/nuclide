'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as FindReferencesProviderType from '../lib/FindReferencesProvider';

import {Point} from 'atom';
import {HACK_GRAMMARS} from '../../nuclide-hack-common';
import {clearRequireCache, uncachedRequire} from '../../nuclide-test-helpers';

describe('FindReferencesProvider', () => {
  const contents = 'contents';
  // Create a fake editor
  const mockEditor = (({
    getGrammar() {
      return {scopeName: HACK_GRAMMARS[0]};
    },
    getPath() {
      return '/test/test.php';
    },
    getText() {
      return contents;
    },
  }: any): atom$TextEditor);

  let FindReferencesProvider: FindReferencesProviderType = (null: any);
  beforeEach(() => {
    const mockLanguage = {
      findReferences: jasmine.createSpy('findReferences').andReturn({
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
      }),
    };
    spyOn(require('../lib/HackLanguage'), 'getHackLanguageForUri')
      .andReturn(mockLanguage);
    FindReferencesProvider = (uncachedRequire(require, '../lib/FindReferencesProvider'): any);
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

  afterEach(() => {
    jasmine.unspy(require('../lib/HackLanguage'), 'getHackLanguageForUri');
    clearRequireCache(require, '../lib/FindReferencesProvider');
  });
});
