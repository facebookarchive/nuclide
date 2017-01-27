/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {parse} from 'graphql';
import {getDefinitionQueryResultForFragmentSpread} from '../lib/interfaces/getDefinition';

describe('getDefinitionQueryResultForFragmentSpread', () => {
  it('returns correct Position', () => {
    waitsForPromise(async () => {
      const query = `query A {
        ...Duck
      }`;
      const fragment = `# Fragment goes here
      fragment Duck on Duck {
        cuack
      }`;
      const fragmentSpread = parse(query).definitions[0].selectionSet.selections[0];
      const fragmentDefinition = parse(fragment).definitions[0];
      const result = await getDefinitionQueryResultForFragmentSpread(
        query,
        fragmentSpread,
        [{file: 'someFile', content: fragment, definition: fragmentDefinition}],
      );
      expect(result.definitions.length).toEqual(1);
      expect(result.definitions[0].position.row).toEqual(1);
      expect(result.definitions[0].position.column).toEqual(15);
    });
  });
});
