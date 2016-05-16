'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Definition, HackLanguage} from '../lib/HackLanguage';
import type {HackDefinitionProvider} from '../lib/HackDefinitionProvider';
import {clearRequireCache, uncachedRequire} from '../../nuclide-test-helpers';
import {Point, Range} from 'atom';

function createEditor(path: ?string, contents: string): atom$TextEditor {
  return ({
    getPath() {
      return path;
    },
    getGrammar() {
      return {
        scopeName: 'text.html.hack',
      };
    },
    getText() {
      return contents;
    },
  }: any);
}

describe('HackDefinitionProvider', () => {
  let provider: HackDefinitionProvider = (null: any);
  let hackLanguage: HackLanguage = (null: any);
  const contents = 'lorem ipsut';
  const editor = createEditor('path1', contents);
  const nullEditor = createEditor(null, contents);
  const position = new Point(1, 2);

  beforeEach(() => {
    hackLanguage = (jasmine.createSpyObj('hackLanguage', ['getIdeDefinition']): any);
    spyOn(require('../lib/HackLanguage'), 'getHackLanguageForUri')
      .andCallFake(() => hackLanguage);
    const HackDefinitionProviderCtor
      = (uncachedRequire(require, '../lib/HackDefinitionProvider'): any).HackDefinitionProvider;
    provider = new HackDefinitionProviderCtor();
  });

  afterEach(() => {
    clearRequireCache(require, '../lib/HackDefinitionProvider');
  });

  it('null path', () => {
    waitsForPromise(async () => {
      const result = await provider.getDefinition(nullEditor, position);
      expect(result).toBe(null);
      expect(hackLanguage.getIdeDefinition).not.toHaveBeenCalled();
    });
  });

  it('null HackLanguage', () => {
    waitsForPromise(async () => {
      hackLanguage = (null: any);
      const result = await provider.getDefinition(editor, position);
      expect(result).toBe(null);
    });
  });

  it('null definition', () => {
    waitsForPromise(async () => {
      hackLanguage.getIdeDefinition.andReturn(Promise.resolve(null));
      const result = await provider.getDefinition(editor, position);
      expect(result).toBe(null);
      expect(hackLanguage.getIdeDefinition).toHaveBeenCalledWith(
        'path1',
        contents,
        2,
        3,
      );
    });
  });

  it('valid definition', () => {
    waitsForPromise(async () => {
      const definition: Definition = {
        queryRange: new Range(new Point(1, 1), new Point(1, 5)),
        path: 'def-path',
        line: 42,
        column: 12,
        name: 'symbol-name',
      };
      hackLanguage.getIdeDefinition.andReturn(Promise.resolve(definition));
      const result = await provider.getDefinition(editor, position);
      const expected = {
        queryRange: definition.queryRange,
        definitions: [{
          path: definition.path,
          position: new Point(41, 11),
          id: 'symbol-name',
        }],
      };
      expect(result).toEqual(expected);
      expect(hackLanguage.getIdeDefinition).toHaveBeenCalledWith(
        'path1',
        contents,
        2,
        3,
      );
    });
  });
});
