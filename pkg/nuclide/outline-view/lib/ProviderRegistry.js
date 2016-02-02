'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type Provider = { // eslint-disable-line no-unused-vars
  priority: number,
  grammarScopes: Array<string>,
}

export class ProviderRegistry<T: Provider> {
  _providers: Set<T>;

  constructor() {
    this._providers = new Set();
  }

  addProvider(provider: T): void {
    this._providers.add(provider);
  }

  removeProvider(provider: T): void {
    this._providers.delete(provider);
  }

  findProvider(grammar: string): ?T {
    let bestProvider = null;
    let bestPriority = Number.NEGATIVE_INFINITY;
    for (const provider of this._providers) {
      if (provider.grammarScopes.indexOf(grammar) !== -1) {
        if (provider.priority > bestPriority) {
          bestProvider = provider;
          bestPriority = provider.priority;
        }
      }
    }
    return bestProvider;
  }
}
