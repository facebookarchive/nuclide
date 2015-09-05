'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {
  CompositeDisposable,
  Emitter,
} = require('atom');
var QuickSelectionProvider = require('./QuickSelectionProvider');

function _loadProvider(providerName: string) {
  var provider = null;
  try {
    // For now, assume that providers are stored in quick-open/lib.
    provider = require('./' + providerName);
  } catch (e) {
    var message = `Provider "${providerName}" not found. `;
    e.message = message + e.message;
    throw e;
  }
  return provider;
}

/**
 * A singleton cache for search providers and results.
 */
class SearchResultManager {
  _providersByDirectory: Map;
  _directories: Array;
  _cachedResults: Object;
  _registeredProviders: {directory: Array<Provider>; global: Array<Provider>;};
  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  constructor() {
    this._cachedProviders = {};
    this._registeredProviders = {
      directory: [],
      global: [],
    };
    this._directories = [];
    this._cachedResults = {};
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    // Check is required for testing
    if (atom.project) {
      this._subscriptions.add(atom.project.onDidChangePaths(this._updateDirectories.bind(this)));
      this._updateDirectories();
    }
  }

  destroy(): void {
    this._subscriptions.dispose();
  }

  _updateDirectories(): void {
    this._directories = atom.project.getDirectories();
    this._providersByDirectory = new Map();
    this._directories.forEach(directory => {
      this._registeredProviders.directory.forEach(provider => {
        if (provider.isEligibleForDirectory(directory)) {
          var providersForDir = this._providersByDirectory.get(directory) || [];
          providersForDir.push(provider);
          this._providersByDirectory.set(directory, providersForDir);
        }
      });
    });
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

  on() {
    this._emitter.on(...arguments);
  }

  off() {
    this._emitter.off(...arguments);
  }

}

module.exports = new SearchResultManager();
