'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DefinitionProvider} from '..';
import {Service} from '../lib/main';
import {Point, Range} from 'atom';

function createEditor(scopeName: string): atom$TextEditor {
  return ({
    getGrammar() {
      return {
        scopeName,
      };
    },
  }: any);
}

describe('DefinitionService', () => {
  let service: Service = (null: any);
  let provider: DefinitionProvider = (null: any);
  let subscription: IDisposable = (null: any);
  const editor = createEditor('grammar-1');
  const position = new Point(1, 2);
  const editor2 = createEditor('grammar-2');

  beforeEach(() => {
    service = new Service();
    provider = {
      name: 'test-provider',
      priority: 12,
      grammarScopes: ['grammar-1'],
      getDefinition: jasmine.createSpy('getDefinition'),
      getDefinitionById: jasmine.createSpy('getDefinitionById'),
    };

    subscription = service.consumeDefinitionProvider(provider);
  });

  it('getDefinition - success', () => {
    waitsForPromise(async () => {
      const result = {
        queryRange: [new Range(new Point(1, 1), new Point(1, 5))],
        definitions: [{
          path: 'path',
          position: new Point(42, 43),
          range: null,
          id: null,
          name: null,
          projectRoot: null,
        }],
      };
      provider.getDefinition.andReturn(Promise.resolve(result));

      const actual = await service.getDefinition(editor, position);

      expect(actual).toBe(result);
      expect(provider.getDefinition).toHaveBeenCalledWith(editor, position);
    });
  });

  it('getDefinition - wrong grammar', () => {
    waitsForPromise(async () => {
      const actual = await service.getDefinition(editor2, position);

      expect(actual).toBe(null);
      expect(provider.getDefinition).not.toHaveBeenCalled();
    });
  });

  it('unsubscribe', () => {
    waitsForPromise(async () => {
      subscription.dispose();
      const actual = await service.getDefinition(editor, position);

      expect(actual).toBe(null);
      expect(provider.getDefinition).not.toHaveBeenCalled();
    });
  });
});
