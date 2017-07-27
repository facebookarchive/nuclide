'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('nuclide-commons/debounce'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Number of elements in the cache before periodic cleanup kicks in. Includes partial query strings.


// TODO use maps
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const MAX_CACHED_QUERIES = 100;
const CACHE_CLEAN_DEBOUNCE_DELAY = 5000;

class ResultCache {
  // List of most recently used query strings, used for pruning the result cache.
  // Makes use of `Map`'s insertion ordering, so values are irrelevant and always set to `null`.
  constructor(onResultsChanged) {
    this._lastCachedQuery = new Map();
    this._queryLruQueue = new Map();
    this._cachedResults = {};
    this._onResultsChanged = onResultsChanged;
    this._debouncedCleanCache = (0, (_debounce || _load_debounce()).default)(() => this._cleanCache(), CACHE_CLEAN_DEBOUNCE_DELAY,
    /* immediate */false);
  }

  // Return value indicates whether there was a change

  // Cache the last query with results for each provider.
  // Display cached results for the last completed query until new data arrives.
  removeResultsForProvider(providerName) {
    if (this._cachedResults[providerName]) {
      delete this._cachedResults[providerName];
      this._onResultsChanged();
    }
    this._lastCachedQuery.delete(providerName);
  }

  setCacheResult(providerName, directory, query, results, loading = false, error = null) {
    this._ensureCacheEntry(providerName, directory);
    this._cachedResults[providerName][directory][query] = {
      results,
      loading,
      error
    };
    this._lastCachedQuery.set(providerName, query);
    // Refresh the usage for the current query.
    this._queryLruQueue.delete(query);
    this._queryLruQueue.set(query, null);
    setImmediate(this._debouncedCleanCache);
  }

  // Sets the cache result directly without modifying the _lastCachedQuery or _queryLruQueue.
  rawSetCacheResult(providerName, directory, query, result) {
    this._ensureCacheEntry(providerName, directory);
    this._cachedResults[providerName][directory][query] = result;
  }

  getCacheResult(providerName, directory, query) {
    this._ensureCacheEntry(providerName, directory);
    return this._cachedResults[providerName][directory][query];
  }

  // plz don't mutate this
  getAllCachedResults() {
    return this._cachedResults;
  }

  getLastCachedQuery(providerName) {
    return this._lastCachedQuery.get(providerName);
  }

  setLastCachedQuery(providerName, query) {
    this._lastCachedQuery.set(providerName, query);
  }

  _ensureCacheEntry(providerName, directory) {
    if (!this._cachedResults[providerName]) {
      this._cachedResults[providerName] = {};
    }
    if (!this._cachedResults[providerName][directory]) {
      this._cachedResults[providerName][directory] = {};
    }
  }

  /**
   * Release the oldest cached results once the cache is full. Return value indicates whether the
   * cache was changed.
   */
  _cleanCache() {
    const queueSize = this._queryLruQueue.size;
    if (queueSize <= MAX_CACHED_QUERIES) {
      return;
    }
    // Figure out least recently used queries, and pop them off of the `_queryLruQueue` Map.
    const expiredQueries = [];
    const keyIterator = this._queryLruQueue.keys();
    const entriesToRemove = queueSize - MAX_CACHED_QUERIES;
    for (let i = 0; i < entriesToRemove; i++) {
      const firstEntryKey = keyIterator.next().value;

      if (!(firstEntryKey != null)) {
        throw new Error('Invariant violation: "firstEntryKey != null"');
      }

      expiredQueries.push(firstEntryKey);
      this._queryLruQueue.delete(firstEntryKey);
    }

    // For each (provider|directory) pair, remove results for all expired queries from the cache.
    for (const providerName in this._cachedResults) {
      for (const directory in this._cachedResults[providerName]) {
        const queryResults = this._cachedResults[providerName][directory];
        expiredQueries.forEach(query => delete queryResults[query]);
      }
    }
    this._onResultsChanged();
  }
}
exports.default = ResultCache;