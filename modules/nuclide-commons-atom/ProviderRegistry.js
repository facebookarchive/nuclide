'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _UniversalDisposable;











function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}








class ProviderRegistry {


  constructor() {
    this._providers = [];
  }

  addProvider(provider) {
    const index = this._providers.findIndex(
    p => provider.priority > p.priority);

    if (index === -1) {
      this._providers.push(provider);
    } else {
      this._providers.splice(index, 0, provider);
    }
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this.removeProvider(provider);
    });
  }

  removeProvider(provider) {
    const index = this._providers.indexOf(provider);
    if (index !== -1) {
      this._providers.splice(index, 1);
    }
  }

  getProviderForEditor(editor) {
    const grammar = editor.getGrammar().scopeName;
    return this.findProvider(grammar);
  }

  getAllProvidersForEditor(editor) {
    const grammar = editor.getGrammar().scopeName;
    return this.findAllProviders(grammar);
  }

  findProvider(grammar) {
    for (const provider of this.findAllProviders(grammar)) {
      return provider;
    }
    return null;
  }

  /**
     * Iterates over all providers matching the grammar, in priority order.
     */
  *findAllProviders(grammar) {
    for (const provider of this._providers) {
      if (
      provider.grammarScopes == null ||
      provider.grammarScopes.indexOf(grammar) !== -1)
      {
        yield provider;
      }
    }
  }}exports.default = ProviderRegistry; /**
                                         * Copyright (c) 2017-present, Facebook, Inc.
                                         * All rights reserved.
                                         *
                                         * This source code is licensed under the BSD-style license found in the
                                         * LICENSE file in the root directory of this source tree. An additional grant
                                         * of patent rights can be found in the PATENTS file in the same directory.
                                         *
                                         * 
                                         * @format
                                         */