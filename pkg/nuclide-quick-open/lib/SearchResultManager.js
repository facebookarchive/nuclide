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
} from '../../nuclide-quick-open-interfaces';

import type {Dispatcher} from 'flux';

type ResultRenderer = (item: FileResult, serviceName: string, dirName: string) => ReactElement;

import invariant from 'assert';
import {track} from '../../nuclide-analytics';
import {getLogger} from '../../nuclide-logging';
import {
  CompositeDisposable,
  Disposable,
  Emitter,
} from 'atom';
import {
  debounce,
} from '../../nuclide-commons';
import QuickSelectionDispatcher from './QuickSelectionDispatcher';
import QuickSelectionActions from './QuickSelectionActions';

const {performance} = global;

function getDefaultResult(): ProviderResult {
  return {
    error: null,
    loading: false,
    results: [],
  };
}

const AnalyticsEvents = Object.freeze({
  QUERY_SOURCE_PROVIDER: 'quickopen-query-source-provider',
});

const RESULTS_CHANGED = 'results_changed';
const PROVIDERS_CHANGED = 'providers_changed';
const MAX_OMNI_RESULTS_PER_SERVICE = 5;
const DEFAULT_QUERY_DEBOUNCE_DELAY = 200;
const OMNISEARCH_PROVIDER = {
  action: 'nuclide-quick-open:find-anything-via-omni-search',
  debounceDelay: DEFAULT_QUERY_DEBOUNCE_DELAY,
  name: 'OmniSearchResultProvider',
  prompt: 'Search for anything...',
  title: 'OmniSearch',
};
// Number of elements in the cache before periodic cleanup kicks in. Includes partial query strings.
const MAX_CACHED_QUERIES = 100;
const CACHE_CLEAN_DEBOUNCE_DELAY = 5000;
const UPDATE_DIRECTORIES_DEBOUNCE_DELAY = 100;
const GLOBAL_KEY = 'global';
const DIRECTORY_KEY = 'directory';

function isValidProvider(provider): boolean {
  return (
    typeof provider.getProviderType === 'function' &&
    typeof provider.getName === 'function' && typeof provider.getName() === 'string' &&
    typeof provider.isRenderable === 'function' &&
    typeof provider.executeQuery === 'function' &&
    typeof provider.getTabTitle === 'function'
  );
}

let searchResultManagerInstance = null;
/**
 * A singleton cache for search providers and results.
 */
class SearchResultManager {
  _dispatcherToken: string;
  RESULTS_CHANGED: string;
  PROVIDERS_CHANGED: string;
  _dispatcher: Dispatcher;
  _providersByDirectory: Map<atom$Directory, Set<Provider>>;
  _directories: Array<atom$Directory>;
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

  static getInstance(): SearchResultManager {
    if (!searchResultManagerInstance) {
      searchResultManagerInstance = new SearchResultManager();
    }
    return searchResultManagerInstance;
  }

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
    const provider = this._getProviderByName(providerName);
    if (!provider || !provider.getComponentForItem) {
      return require('./FileResultComponent').getComponentForItem;
    }
    return provider.getComponentForItem;
  }

  dispose(): void {
    this._isDisposed = true;
    this._subscriptions.dispose();
  }

  /**
   * Renew the cached list of directories, as well as the cached map of eligible providers
   * for every directory.
   */
  async _updateDirectories(): Promise<void> {
    const newDirectories = atom.project.getDirectories();
    const newProvidersByDirectories = new Map();
    const eligibilities = [];
    newDirectories.forEach(directory => {
      newProvidersByDirectories.set(directory, new Set());
      for (const provider of this._registeredProviders[DIRECTORY_KEY].values()) {
        invariant(
          provider.isEligibleForDirectory != null,
          `Directory provider ${provider.getName()} must provide \`isEligibleForDirectory()\`.`
        );
        eligibilities.push(
          provider.isEligibleForDirectory(directory).then(isEligible => ({
            isEligible,
            provider,
            directory,
          }))
        );
      }
    });
    const resolvedEligibilities = await Promise.all(eligibilities);
    for (const eligibility of resolvedEligibilities) {
      const {
        provider,
        isEligible,
        directory,
      } = eligibility;
      if (isEligible) {
        const providersForDirectory = newProvidersByDirectories.get(directory);
        invariant(
          providersForDirectory != null,
          `Providers for directory ${directory} not defined`
        );
        providersForDirectory.add(provider);
      }
    }
    this._directories = newDirectories;
    this._providersByDirectory = newProvidersByDirectories;
    this._emitter.emit(PROVIDERS_CHANGED);
  }

  on(): IDisposable {
    return this._emitter.on(...arguments);
  }

  registerProvider(service: Provider): IDisposable {
    if (!isValidProvider(service)) {
      const providerName = service.getName && service.getName() || '<unknown>';
      getLogger().error(`Quick-open provider ${providerName} is not a valid provider`);
    }
    const isRenderableProvider =
      typeof service.isRenderable === 'function' && service.isRenderable();
    const isGlobalProvider = service.getProviderType() === 'GLOBAL';
    const targetRegistry = isGlobalProvider
      ? this._registeredProviders[GLOBAL_KEY]
      : this._registeredProviders[DIRECTORY_KEY];
    targetRegistry.set(service.getName(), service);
    if (!isGlobalProvider) {
      this._debouncedUpdateDirectories();
    }
    const disposable = new CompositeDisposable();
    disposable.add(new Disposable(() => {
      // This may be called after this package has been deactivated
      // and the SearchResultManager has been disposed.
      if (this._isDisposed) {
        return;
      }
      const serviceName = service.getName();
      targetRegistry.delete(serviceName);
      this._providersByDirectory.forEach((providers, dir) => {
        providers.delete(service);
      });
      this._removeResultsForProvider(serviceName);
      this._emitter.emit(PROVIDERS_CHANGED);
    }));
    // If the provider is renderable and specifies a keybinding, wire it up with the toggle command.
    if (isRenderableProvider && typeof service.getAction === 'function') {
      const toggleAction: string = service.getAction();
      // TODO replace with computed property once Flow supports it.
      const actionSpec = {};
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
    result: Array<FileResult>,
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

  cacheResult(query: string, result: Array<FileResult>, directory: string, provider: Object): void {
    const providerName = provider.getName();
    this.setCacheResult(providerName, directory, query, result, false, null);
  }

  _setLoading(query: string, directory: string, provider: Object): void {
    const providerName = provider.getName();
    this.ensureCacheEntry(providerName, directory);
    const previousResult = this._cachedResults[providerName][directory][query];
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
  _cleanCache(): void {
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
      expiredQueries.push(firstEntryKey);
      invariant(firstEntryKey != null);
      this._queryLruQueue.delete(firstEntryKey);
    }

    // For each (provider|directory) pair, remove results for all expired queries from the cache.
    for (const providerName in this._cachedResults) {
      for (const directory in this._cachedResults[providerName]) {
        const queryResults = this._cachedResults[providerName][directory];
        expiredQueries.forEach(query => delete queryResults[query]);
      }
    }
    this._emitter.emit(RESULTS_CHANGED);
  }

  processResult(
    query: string,
    result: Array<FileResult>,
    directory: string,
    provider: Object
  ): void {
    this.cacheResult(...arguments);
    this._emitter.emit(RESULTS_CHANGED);
  }

  sanitizeQuery(query: string): string {
    return query.trim();
  }

  async executeQuery(rawQuery: string): Promise<void> {
    const query = this.sanitizeQuery(rawQuery);
    for (const globalProvider of this._registeredProviders[GLOBAL_KEY].values()) {
      const startTime = performance.now();
      globalProvider.executeQuery(query).then(result => {
        track(AnalyticsEvents.QUERY_SOURCE_PROVIDER, {
          'quickopen-source-provider': globalProvider.getName(),
          'quickopen-query-duration': (performance.now() - startTime).toString(),
          'quickopen-result-count': (result.length).toString(),
        });
        this.processResult(query, result, GLOBAL_KEY, globalProvider);
      });
      this._setLoading(query, GLOBAL_KEY, globalProvider);
    }
    if (this._providersByDirectory.size === 0) {
      return;
    }
    this._directories.forEach(directory => {
      const path = directory.getPath();
      const providers = this._providersByDirectory.get(directory);
      if (!providers) {
        // Special directories like "atom://about"
        return;
      }
      for (const directoryProvider of providers) {
        const startTime = performance.now();
        directoryProvider.executeQuery(query, directory).then(result => {
          track(AnalyticsEvents.QUERY_SOURCE_PROVIDER, {
            'quickopen-source-provider': directoryProvider.getName(),
            'quickopen-query-duration': (performance.now() - startTime).toString(),
            'quickopen-result-count': (result.length).toString(),
          });
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
    let dirProviderName;
    if (this._isGlobalProvider(providerName)) {
      dirProviderName = this._registeredProviders[GLOBAL_KEY].get(providerName);
    } else {
      dirProviderName = this._registeredProviders[DIRECTORY_KEY].get(providerName);
    }
    invariant(
      dirProviderName != null,
      `Provider ${providerName} is not registered with quick-open.`
    );
    return dirProviderName;
  }

  _getResultsForProvider(query: string, providerName: string): Object {
    const providerPaths = this._isGlobalProvider(providerName)
      ? [GLOBAL_KEY]
      : this._directories.map(d => d.getPath());
    const provider = this._getProviderByName(providerName);
    return {
      title: provider.getTabTitle(),
      results: providerPaths.reduce((results, path) => {
        let cachedPaths, cachedQueries, cachedResult;
        if (!(
          (cachedPaths = this._cachedResults[providerName]) &&
          (cachedQueries = cachedPaths[path]) &&
          (cachedResult = cachedQueries[query])
        )) {
          cachedResult = {};
        }
        const defaultResult = getDefaultResult();
        const resultList = cachedResult.result || defaultResult.results;
        results[path] = {
          results: resultList.map(result => ({...result, sourceProvider: providerName})),
          loading: cachedResult.loading || defaultResult.loading,
          error: cachedResult.error || defaultResult.error,
        };
        return results;
      }, {}),
    };
  }

  getResults(query: string, activeProviderName: string): Object {
    const sanitizedQuery = this.sanitizeQuery(query);
    if (activeProviderName === OMNISEARCH_PROVIDER.name) {
      const omniSearchResults = [{}];
      for (const providerName in this._cachedResults) {
        const resultForProvider = this._getResultsForProvider(sanitizedQuery, providerName);
        // TODO replace this with a ranking algorithm.
        for (const dir in resultForProvider.results) {
          resultForProvider.results[dir].results =
            resultForProvider.results[dir].results.slice(0, MAX_OMNI_RESULTS_PER_SERVICE);
        }
        // TODO replace `partial` with computed property whenever Flow supports it.
        const partial = {};
        partial[providerName] = resultForProvider;
        omniSearchResults.push(partial);
      }
      return Object.assign.apply(null, omniSearchResults);
    }
    // TODO replace `partial` with computed property whenever Flow supports it.
    const partial = {};
    partial[activeProviderName] = this._getResultsForProvider(sanitizedQuery, activeProviderName);
    return partial;
  }

  getProviderByName(providerName: string): ProviderSpec {
    if (providerName === OMNISEARCH_PROVIDER.name) {
      return {...OMNISEARCH_PROVIDER};
    }
    return this._bakeProvider(this._getProviderByName(providerName));
  }

  /**
   * Turn a Provider into a plain "spec" object consumed by QuickSelectionComponent.
   */
  _bakeProvider(provider: Provider): ProviderSpec {
    const providerName = provider.getName();
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
    const eligibleDirectoryProviders = Array.from(this._registeredProviders[DIRECTORY_KEY].values())
      .filter(provider => {
        for (const providers of this._providersByDirectory.values()) {
          if (providers.has(provider)) {
            return true;
          }
        }
        return false;
      });
    const tabs = Array.from(this._registeredProviders[GLOBAL_KEY].values())
      .concat(eligibleDirectoryProviders)
      .filter(provider => provider.isRenderable())
      .map(this._bakeProvider)
      .sort((p1, p2) => p1.name.localeCompare(p2.name));
    tabs.unshift(OMNISEARCH_PROVIDER);
    return tabs;
  }

}

export default SearchResultManager;

export const __test__ = {
  _getOmniSearchProviderSpec(): ProviderSpec {
    return OMNISEARCH_PROVIDER;
  },
};
