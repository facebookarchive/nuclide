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
  ProviderSpec,
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
var DEFAULT_QUERY_DEBOUNCE_DELAY = 200;
var OMNISEARCH_PROVIDER = {
  action: 'nuclide-quick-open:toggle-omni-search',
  debounceDelay: DEFAULT_QUERY_DEBOUNCE_DELAY,
  name: 'OmniSearchResultProvider',
  prompt: 'Search for anything...',
  title: 'OmniSearch',
};
// Number of elements in the cache before periodic cleanup kicks in. Includes partial query strings.
var MAX_CACHED_QUERIES = 100;
var CACHE_CLEAN_DEBOUNCE_DELAY = 5000;
var UPDATE_DIRECTORIES_DEBOUNCE_DELAY = 100;
var GLOBAL_KEY = 'global';
var DIRECTORY_KEY = 'directory';

function isValidProvider(provider): boolean {
  return (
    typeof provider.getProviderType === 'function' &&
    typeof provider.getName === 'function' && typeof provider.getName() === 'string' &&
    typeof provider.isRenderable === 'function' &&
    typeof provider.executeQuery === 'function' &&
    typeof provider.getTabTitle === 'function'
  );
}

/**
 * A singleton cache for search providers and results.
 */
class SearchResultManager {
  _dispatcherToken: string;
  RESULTS_CHANGED: string;
  PROVIDERS_CHANGED: string;
  _dispatcher: QuickSelectionDispatcher;
  _providersByDirectory: Map<atom$directory, Set<Provider>>;
  _directories: Array<atom$directory>;
  _cachedResults: Object;
  // List of most recently used query strings, used for pruning the result cache.
  // Makes use of `Map`'s insertion ordering, so values are irrelevant and always set to `null`.
  _queryLruQueue: Map<string, ?Number>;
  _debouncedCleanCache: Function;
  _debouncedUpdateDirectories: Function;
  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _registeredProviders: {[key: string]: Map<string, Provider>;};
  _activeProviderName: string;
  _isDisposed: boolean;

  constructor() {
    this._isDisposed = false;
    this.RESULTS_CHANGED = RESULTS_CHANGED;
    this.PROVIDERS_CHANGED = PROVIDERS_CHANGED;
    this._registeredProviders = {};
    this._registeredProviders[DIRECTORY_KEY] = new Map();
    this._registeredProviders[GLOBAL_KEY] = new Map();
    this._providersByDirectory = new Map();
    this._directories = [];
    this._cachedResults = {};
    this._debouncedCleanCache = debounce(
      () => this._cleanCache(),
      CACHE_CLEAN_DEBOUNCE_DELAY,
      /* immediate */false
    );
    // `updateDirectories` joins providers and directories, which don't know anything about each
    // other. Debounce this call to reduce churn at startup, and when new providers get activated or
    // a new directory gets mounted.
    this._debouncedUpdateDirectories = debounce(
      () => this._updateDirectories(),
      UPDATE_DIRECTORIES_DEBOUNCE_DELAY,
      /* immediate */false
    );
    this._queryLruQueue = new Map();
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._dispatcher = QuickSelectionDispatcher.getInstance();
    // Check is required for testing.
    if (atom.project) {
      this._subscriptions.add(atom.project.onDidChangePaths(
        this._debouncedUpdateDirectories.bind(this))
      );
      this._debouncedUpdateDirectories();
    }
    this._setUpFlux();
    this._activeProviderName = OMNISEARCH_PROVIDER.name;
  }

  _setUpFlux(): void {
    this._dispatcherToken = this._dispatcher.register(action => {
      switch (action.actionType) {
        case QuickSelectionDispatcher.ActionType.QUERY:
          this.executeQuery(action.query);
          break;
        case QuickSelectionDispatcher.ActionType.ACTIVE_PROVIDER_CHANGED:
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

  dispose(): void {
    this._isDisposed = true;
    this._subscriptions.dispose();
  }

  _updateDirectories(): void {
    this._directories = atom.project.getDirectories();
    var directorySet = new Set(this._directories);
    var directoriesToDelete = [];
    for (var dir of this._providersByDirectory.keys()) {
      if (!directorySet.has(dir)) {
        directoriesToDelete.push(dir);
      }
    }
    directoriesToDelete.forEach((directory: atom$directory) => {
      this._providersByDirectory.delete(directory);
    });
    this._directories.forEach(async directory => {
      for (var provider of this._registeredProviders[DIRECTORY_KEY].values()) {
        var providersForDir = this._providersByDirectory.get(directory) || new Set();

        var isEligible = await provider.isEligibleForDirectory(directory);
        if (isEligible) {
          providersForDir.add(provider);
          this._providersByDirectory.set(directory, providersForDir);
          this._emitter.emit(PROVIDERS_CHANGED);
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
    var isRenderableProvider = typeof service.isRenderable === 'function' && service.isRenderable();
    var isGlobalProvider = service.getProviderType() === 'GLOBAL';
    var targetRegistry = isGlobalProvider
      ? this._registeredProviders[GLOBAL_KEY]
      : this._registeredProviders[DIRECTORY_KEY];
    targetRegistry.set(service.getName(), service);
    if (!isGlobalProvider) {
      this._debouncedUpdateDirectories();
    }
    var disposable = new CompositeDisposable();
    disposable.add(new Disposable(() => {
      // This may be called after this package has been deactivated
      // and the SearchResultManager has been disposed.
      if (this._isDisposed) {
        return;
      }
      var serviceName = service.getName();
      targetRegistry.delete(serviceName);
      this._providersByDirectory.forEach((providers, dir) => {
        providers.delete(service);
      });
      this._removeResultsForProvider(serviceName);
      this._emitter.emit(PROVIDERS_CHANGED);
    }));
    // If the provider is renderable and specifies a keybinding, wire it up with the toggle command.
    if (isRenderableProvider && typeof service.getAction === 'function') {
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
    for (let globalProvider of this._registeredProviders[GLOBAL_KEY].values()) {
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
      var providers = this._providersByDirectory.get(directory);
      if (!providers) {
        // Special directories like "atom://about"
        return;
      }
      for (let directoryProvider of providers) {
        directoryProvider.executeQuery(query, directory).then(result => {
          this.processResult(query, result, path, directoryProvider);
        });
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
  _bakeProvider(provider: Provider): ProviderSpec {
    var providerName = provider.getName();
    return {
      action: provider.getAction && provider.getAction() || '',
      debounceDelay: (typeof provider.getDebounceDelay === 'function')
        ? provider.getDebounceDelay()
        : DEFAULT_QUERY_DEBOUNCE_DELAY,
      name: providerName,
      prompt: provider.getPromptText && provider.getPromptText() ||
        'Search ' + providerName,
      title: provider.getTabTitle && provider.getTabTitle() || providerName,
    };
  }

  getRenderableProviders(): Array<ProviderSpec> {
    // Only render tabs for providers that are eligible for at least one directory.
    var eligibleDirectoryProviders = array.from(this._registeredProviders[DIRECTORY_KEY].values())
      .filter(provider => {
        for (var providers of this._providersByDirectory.values()) {
          if (providers.has(provider)) {
            return true;
          }
        }
        return false;
      });
    var tabs = array.from(this._registeredProviders[GLOBAL_KEY].values())
      .concat(eligibleDirectoryProviders)
      .filter(provider => provider.isRenderable())
      .map(this._bakeProvider)
      .sort((p1, p2) => p1.name.localeCompare(p2.name));
    tabs.unshift(OMNISEARCH_PROVIDER);
    return tabs;
  }

}

export type Store = SearchResultManager;

module.exports = new SearchResultManager();
