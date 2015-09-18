'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  quickopen$Dispatcher,
  quickopen$ProviderSpec,
} from './types';

import type {
  FileResult,
  Provider,
  ProviderResult,
} from 'nuclide-quick-open-interfaces';

type ResultRenderer = (item: FileResult) => ReactElement;

var assert = require('assert');

var {
  CompositeDisposable,
  Disposable,
  Emitter,
} = require('atom');
var {
  array,
  debounce,
} = require('nuclide-commons');

var logger;
function getLogger() {
  if (logger == null) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

function getDefaultResult(): ProviderResult {
  return {
    error: null,
    loading: false,
    result: [],
  };
}

var QuickSelectionDispatcher = require('./QuickSelectionDispatcher');
var QuickSelectionActions = require('./QuickSelectionActions');

var assign = Object.assign || require('object-assign');

var RESULTS_CHANGED = 'results_changed';
var PROVIDERS_CHANGED = 'providers_changed';
var MAX_OMNI_RESULTS_PER_SERVICE = 5;
var OMNISEARCH_PROVIDER = {
  action: 'nuclide-quick-open:toggle-omni-search',
  debounceDelay: 0,
  name: 'OmniSearchResultProvider',
  prompt: 'Search for anything...',
  title: 'OmniSearch',
};
// Number of elements in the cache before periodic cleanup kicks in. Includes partial query strings.
var MAX_CACHED_QUERIES = 100;
var CACHE_CLEAN_DEBOUNCE_DELAY = 5000;
var GLOBAL_KEY = 'global';
var DIRECTORY_KEY = 'directory';

function isValidProvider(provider): boolean {
  return (
    typeof provider.getProviderType === 'function' &&
    typeof provider.executeQuery === 'function' &&
    typeof provider.getTabTitle === 'function' &&
    typeof provider.getName === 'function' && typeof provider.getName() === 'string'
  );
}

/**
 * A singleton cache for search providers and results.
 */
class SearchResultManager {
  _dispatcherToken: string;
  RESULTS_CHANGED: string;
  PROVIDERS_CHANGED: string;
  _dispatcher: quickopen$Dispatcher;
  _providersByDirectory: Map;
  _directories: Array<Object>;
  _cachedResults: Object;
  // List of most recently used query strings, used for pruning the result cache.
  // Makes use of `Map`'s insertion ordering, so values are irrelevant and always set to `null`.
  _queryLruQueue: Map<string, ?Number>;
  _debouncedCleanCache: Function;
  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _registeredProviders: {[key: string]: Map<string, Provider>;};
  _activeProviderName: string;

  constructor() {
    this.RESULTS_CHANGED = RESULTS_CHANGED;
    this.PROVIDERS_CHANGED = PROVIDERS_CHANGED;
    this._registeredProviders = {};
    this._registeredProviders[DIRECTORY_KEY] = new Map();
    this._registeredProviders[GLOBAL_KEY] = new Map();
    this._directories = [];
    this._cachedResults = {};
    this._debouncedCleanCache = debounce(
      () => this._cleanCache(),
      CACHE_CLEAN_DEBOUNCE_DELAY,
      false
    );
    this._queryLruQueue = new Map();
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._dispatcher = QuickSelectionDispatcher.getInstance();
    // Check is required for testing.
    if (atom.project) {
      this._subscriptions.add(atom.project.onDidChangePaths(this._updateDirectories.bind(this)));
      this._updateDirectories();
    }
    this._setUpFlux();
    this._activeProviderName = OMNISEARCH_PROVIDER.name;
  }

  _setUpFlux(): void {
    this._dispatcherToken = this._dispatcher.register(action => {
      switch (action.actionType) {
      case QuickSelectionDispatcher.ActionTypes.QUERY:
        this.executeQuery(action.query);
        break;
      case QuickSelectionDispatcher.ActionTypes.ACTIVE_PROVIDER_CHANGED:
        this._activeProviderName = action.providerName;
        this._emitter.emit(PROVIDERS_CHANGED);
        break;
      }
    });
  }

  getActiveProviderName(): string {
    return this._activeProviderName;
  }

  getRendererForProvider(providerName: string): ResultRenderer {
    var provider = this._getProviderByName(providerName);
    if (!provider || !provider.getComponentForItem) {
      return require('./FileResultComponent').getComponentForItem;
    }
    return provider.getComponentForItem;
  }

  destroy(): void {
    this._subscriptions.dispose();
  }

  _updateDirectories(): void {
    this._directories = atom.project.getDirectories();
    this._providersByDirectory = new Map();
    this._directories.forEach(directory => {
      for (var provider of this._registeredProviders[DIRECTORY_KEY].values()) {
        if (provider.isEligibleForDirectory(directory)) {
          var providersForDir = this._providersByDirectory.get(directory) || [];
          providersForDir.push(provider);
          this._providersByDirectory.set(directory, providersForDir);
        }
      }
    });
  }

  on(): atom$Disposable {
    return this._emitter.on(...arguments);
  }

  registerProvider(service: Provider): Disposable {
    if (!isValidProvider(service)) {
      var providerName = service.getName && service.getName() || '<unknown>';
      getLogger().error(`Quick-open provider ${providerName} is not a valid provider`);
    }
    var isGlobalProvider = service.getProviderType() === 'GLOBAL';
    var targetRegistry = isGlobalProvider
      ? this._registeredProviders[GLOBAL_KEY]
      : this._registeredProviders[DIRECTORY_KEY];
    targetRegistry.set(service.getName(), service);
    if (!isGlobalProvider) {
      this._updateDirectories();
    }
    var disposable = new CompositeDisposable();
    disposable.add(new Disposable(() => {
      var serviceName = service.getName();
      targetRegistry.delete(serviceName);
      this._providersByDirectory.forEach((providers, dir) => {
        var index = providers.indexOf(service);
        if (index !== -1) {
          providers.splice(index, 1);
        }
      });
      this._removeResultsForProvider(serviceName);
      this._emitter.emit(PROVIDERS_CHANGED);
    }));
    // If the provider specifies a keybinding, wire it up with the toggle command.
    if (typeof service.getAction === 'function') {
      var toggleAction: string = service.getAction();
      // TODO replace with computed property once Flow supports it.
      var actionSpec = {};
      actionSpec[toggleAction] =
        () => QuickSelectionActions.changeActiveProvider(service.getName());
      disposable.add(atom.commands.add('atom-workspace', actionSpec));
    }
    return disposable;
  }

  _removeResultsForProvider(providerName: string): void {
    if (this._cachedResults[providerName]) {
      delete this._cachedResults[providerName];
      this._emitter.emit(RESULTS_CHANGED);
    }
  }

  setCacheResult(
    providerName: string,
    directory: string,
    query: string,
    result: Object,
    loading: ?boolean = false,
    error: ?Object = null): void {
    this.ensureCacheEntry(providerName, directory);
    this._cachedResults[providerName][directory][query] = {
      result,
      loading,
      error,
    };
    // Refresh the usage for the current query.
    this._queryLruQueue.delete(query);
    this._queryLruQueue.set(query, null);
    setImmediate(this._debouncedCleanCache);
  }

  ensureCacheEntry(providerName: string, directory: string): void {
    if (!this._cachedResults[providerName]) {
      this._cachedResults[providerName] = {};
    }
    if (!this._cachedResults[providerName][directory]) {
      this._cachedResults[providerName][directory] = {};
    }
  }

  cacheResult(query: string, result: Object, directory: string, provider: Object): void {
    var providerName = provider.getName();
    this.setCacheResult(providerName, directory, query, result, false, null);
  }

  _setLoading(query: string, directory: string, provider: Object): void {
    var providerName = provider.getName();
    this.ensureCacheEntry(providerName, directory);
    var previousResult = this._cachedResults[providerName][directory][query];
    if (!previousResult) {
      this._cachedResults[providerName][directory][query] = {
        result: [],
        error: null,
        loading: true,
      };
    }
  }

  /**
   * Release the oldest cached results once the cache is full.
   */
  _cleanCache() {
    var queueSize = this._queryLruQueue.size;
    if (queueSize <= MAX_CACHED_QUERIES) {
      return;
    }
    // Figure out least recently used queries, and pop them off of the `_queryLruQueue` Map.
    var expiredQueries = [];
    var keyIterator = this._queryLruQueue.keys();
    var entriesToRemove = queueSize - MAX_CACHED_QUERIES;
    for (var i = 0; i < entriesToRemove; i++) {
      var firstEntryKey = keyIterator.next().value;
      expiredQueries.push(firstEntryKey);
      this._queryLruQueue.delete(firstEntryKey);
    }

    // For each (provider|directory) pair, remove results for all expired queries from the cache.
    for (var providerName in this._cachedResults) {
      for (var directory in this._cachedResults[providerName]) {
        var queryResults = this._cachedResults[providerName][directory];
        expiredQueries.forEach(query => delete queryResults[query]);
      }
    }
    this._emitter.emit(RESULTS_CHANGED);
  }

  processResult(
    query: string,
    result: FileResult,
    directory: string,
    provider: Object
  ): void {
    this.cacheResult(...arguments);
    this._emitter.emit(RESULTS_CHANGED);
  }

  sanitizeQuery(query: string): string {
    return query.trim();
  }

  async executeQuery(query: string): Promise<void> {
    var query = this.sanitizeQuery(query);
    for (var globalProvider of this._registeredProviders[GLOBAL_KEY].values()) {
      globalProvider.executeQuery(query).then(result => {
        this.processResult(query, result, GLOBAL_KEY, globalProvider);
      });
      this._setLoading(query, GLOBAL_KEY, globalProvider);
    }
    if (this._providersByDirectory.size === 0) {
      return;
    }
    this._directories.forEach(directory => {
      var path = directory.getPath();
      for (var directoryProvider of this._providersByDirectory.get(directory)) {
        directoryProvider.executeQuery(query, directory).then(((boundProvider, result) => {
          this.processResult(query, result, path, boundProvider);
        }).bind(this, directoryProvider));
        this._setLoading(query, path, directoryProvider);
      }
    });
    this._emitter.emit(RESULTS_CHANGED);
  }

  _isGlobalProvider(providerName: string): boolean {
    return this._registeredProviders[GLOBAL_KEY].has(providerName);
  }

  _getProviderByName(providerName: string): Provider {
    if (this._isGlobalProvider(providerName)) {
      return this._registeredProviders[GLOBAL_KEY].get(providerName);
    }
    var dirProvider = this._registeredProviders[DIRECTORY_KEY].get(providerName);
    assert(
      dirProvider != null,
      `Provider ${providerName} is not registered with quick-open.`
    );
    return dirProvider;
  }

  _getResultsForProvider(query: string, providerName: string): Object {
    var providerPaths = this._isGlobalProvider(providerName)
      ? [GLOBAL_KEY]
      : this._directories.map(d => d.getPath());
    var provider = this._getProviderByName(providerName);
    return {
      title: provider.getTabTitle(),
      results: providerPaths.reduce((results, path) => {
        var cachedPaths, cachedQueries, cachedResult;
        if (!(
          (cachedPaths = this._cachedResults[providerName]) &&
          (cachedQueries = cachedPaths[path]) &&
          (cachedResult = cachedQueries[query])
        )) {
          cachedResult = {};
        }
        var defaultResult = getDefaultResult();
        results[path] = {
          results: cachedResult.result || defaultResult.result,
          loading: cachedResult.loading || defaultResult.loading,
          error: cachedResult.error || defaultResult.error,
        };
        return results;
      }, {}),
    };
  }

  getResults(query: string, activeProviderName: string): Object {
    if (activeProviderName === OMNISEARCH_PROVIDER.name) {
      var omniSearchResults = [{}];
      for (var providerName in this._cachedResults) {
        var resultForProvider = this._getResultsForProvider(query, providerName);
        // TODO replace this with a ranking algorithm.
        for (var dir in resultForProvider.results) {
          resultForProvider.results[dir].results =
            resultForProvider.results[dir].results.slice(0, MAX_OMNI_RESULTS_PER_SERVICE);
        }
        // TODO replace `partial` with computed property whenever Flow supports it.
        var partial = {};
        partial[providerName] = resultForProvider;
        omniSearchResults.push(partial);
      }
      return assign.apply({}, omniSearchResults);
    }
    // TODO replace `partial` with computed property whenever Flow supports it.
    var partial = {};
    partial[activeProviderName] = this._getResultsForProvider(query, activeProviderName);
    return partial;
  }

  getProviderByName(providerName: string): Provider {
    if (providerName === OMNISEARCH_PROVIDER.name) {
      return {...OMNISEARCH_PROVIDER};
    }
    return this._bakeProvider(this._getProviderByName(providerName));
  }

  /**
   * Turn a Provider into a plain "spec" object consumed by QuickSelectionComponent.
   */
  _bakeProvider(provider: Provider): quickopen$ProviderSpec {
    var providerName = provider.getName();
    return {
      action: provider.getAction && provider.getAction() || '',
      debounceDelay: provider.getDebounceDelay && provider.getDebounceDelay() || 200,
      name: providerName,
      prompt: provider.getPromptText && provider.getPromptText() ||
        'Search ' + providerName,
      title: provider.getTabTitle && provider.getTabTitle() || providerName,
    };
  }

  getRenderableProviders(): Array<quickopen$ProviderSpec> {
    var tabs = array.from(this._registeredProviders[GLOBAL_KEY].values(), this._bakeProvider)
      .concat(array.from(this._registeredProviders[DIRECTORY_KEY].values(), this._bakeProvider))
      .sort((p1, p2) => p1.name.localeCompare(p2.name));
    tabs.unshift(OMNISEARCH_PROVIDER);
    return tabs;
  }

}

export type Store = SearchResultManager;

module.exports = new SearchResultManager();
