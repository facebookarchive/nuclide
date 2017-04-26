"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class ProviderRegistry {

  constructor() {
    this._providers = new Set();
  }

  addProvider(provider) {
    this._providers.add(provider);
  }

  removeProvider(provider) {
    this._providers.delete(provider);
  }

  getProviderForEditor(editor) {
    const grammar = editor.getGrammar().scopeName;
    return this.findProvider(grammar);
  }

  findProvider(grammar) {
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
exports.default = ProviderRegistry; /**
                                     * Copyright (c) 2015-present, Facebook, Inc.
                                     * All rights reserved.
                                     *
                                     * This source code is licensed under the license found in the LICENSE file in
                                     * the root directory of this source tree.
                                     *
                                     * 
                                     */