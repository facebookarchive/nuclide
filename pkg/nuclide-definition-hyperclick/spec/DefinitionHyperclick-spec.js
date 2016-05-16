'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HyperclickProvider} from '../../hyperclick/lib/types';
import type {DefinitionService} from '../../nuclide-definition-service';
import type {HyperclickSuggestion} from '../../hyperclick/lib/types';

import {clearRequireCache, uncachedRequire} from '../../nuclide-test-helpers';
import {Point, Range} from 'atom';
import invariant from 'assert';

describe('DefinitionHyperclick', () => {
  let provider: HyperclickProvider = (null: any);
  const editor: atom$TextEditor = ({}: any);
  const position: atom$Point = ({}: any);
  let service: DefinitionService = (null: any);
  let consumeDefinitionService;
  let goToLocation;

  beforeEach(() => {
    service = (jasmine.createSpyObj('DefinitionService', ['getDefinition']): any);
    goToLocation = spyOn(require('../../commons-atom/go-to-location'), 'goToLocation');
    const main = (uncachedRequire(require, '../lib/main'): any);
    consumeDefinitionService = main.consumeDefinitionService;
    provider = main.getHyperclickProvider();
  });

  afterEach(() => {
    clearRequireCache(require, '../lib/main');
  });

  it('no definition service', () => {
    waitsForPromise(async () => {
      invariant(provider.getSuggestion != null);
      const result = await provider.getSuggestion(editor, position);

      expect(result).toBe(null);
    });
  });

  it('no definition', () => {
    waitsForPromise(async () => {
      service.getDefinition.andReturn(Promise.resolve(null));
      consumeDefinitionService(service);

      invariant(provider.getSuggestion != null);
      const result = await provider.getSuggestion(editor, position);

      expect(result).toBe(null);
      expect(service.getDefinition).toHaveBeenCalledWith(editor, position);
    });
  });

  it('definition', () => {
    waitsForPromise(async () => {
      const definition = {
        queryRange: new Range(new Point(1, 1), new Point(1, 5)),
        definition: {
          path: 'path1',
          position: new Point(1, 2),
          range: null,
          definition: 'smbol-name',
        },
      };
      service.getDefinition.andReturn(Promise.resolve(definition));
      consumeDefinitionService(service);

      invariant(provider.getSuggestion != null);
      const result: ?HyperclickSuggestion = await provider.getSuggestion(editor, position);

      invariant(result != null);
      expect(result.range).toEqual(definition.queryRange);
      expect(service.getDefinition).toHaveBeenCalledWith(editor, position);
      expect(goToLocation).not.toHaveBeenCalled();

      invariant(result != null);
      invariant(result.callback != null);
      invariant(typeof result.callback === 'function');
      result.callback();
      expect(goToLocation).toHaveBeenCalledWith('path1', 1, 2);
    });
  });
});
