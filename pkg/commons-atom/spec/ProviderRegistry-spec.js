/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Provider} from '../ProviderRegistry';

import ProviderRegistry from '../ProviderRegistry';

describe('ProviderRegistry', () => {
  let providerRegistry: ProviderRegistry<Provider> = (null: any);
  let provider1: Provider = (null: any);
  let provider2: Provider = (null: any);

  beforeEach(() => {
    providerRegistry = new ProviderRegistry();
    provider1 = {
      priority: 10,
      grammarScopes: ['foo', 'bar'],
    };
    provider2 = {
      priority: 9,
      grammarScopes: ['bar', 'baz'],
    };
    providerRegistry.addProvider(provider1);
    providerRegistry.addProvider(provider2);
  });

  it('should return the highest-priority provider', () => {
    expect(providerRegistry.findProvider('foo')).toBe(provider1);
    expect(providerRegistry.findProvider('bar')).toBe(provider1);
    expect(providerRegistry.findProvider('baz')).toBe(provider2);
  });

  it('should return the provider for an editor', () => {
    const editor: any = {
      getGrammar() {
        return {
          scopeName: 'foo',
        };
      },
    };
    expect(providerRegistry.getProviderForEditor(editor)).toBe(provider1);
  });

  it('should return null if there is no provider', () => {
    expect(providerRegistry.findProvider('42')).toBeNull();
  });

  it('should correctly remove a provider', () => {
    providerRegistry.removeProvider(provider1);
    expect(providerRegistry.findProvider('foo')).toBe(null);
    expect(providerRegistry.findProvider('bar')).toBe(provider2);
  });
});
