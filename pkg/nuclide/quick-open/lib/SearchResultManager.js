'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var QuickSelectionProvider = require('./QuickSelectionProvider');

function _loadProvider(providerName: string) {
  var provider = null;
  try {
    // for now, assume that providers are stored in quick-open/lib
    provider = require('./' + providerName);
  } catch (e) {
    throw new Error('Provider "' + providerName + '" not found', e);
  }
  return provider;
}

/**
 * A singleton cache for search providers and results.
 */
class SearchResultManager {
  constructor() {
    this._cachedProviders = {};
  }

  /**
   * Returns a lazily loaded, cached instance of the search provider with the given name.
   *
   * @param providerName Name of the provider to be `require()`d, instantiated and returned.
   * @return cached provider instance.
   */
  getProvider(providerName: string) : QuickSelectionProvider {
    if (!this._cachedProviders[providerName]) {
      var LazyProvider = _loadProvider(providerName);
      this._cachedProviders[providerName] = new LazyProvider();
    }
    return this._cachedProviders[providerName];
  }

}

module.exports = new SearchResultManager();
