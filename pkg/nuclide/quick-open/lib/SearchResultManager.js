'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileResult} from './types';

type QueryResult = {
 error: ?Object;
 loading: boolean;
 result: Array<FileResult>;
}

type ResultRenderer = (item: FileResult) => ReactElement;

type ProviderSpec = {
  action: string;
  debounceDelay: number;
  name: string;
  prompt: string;
  title: string;
}

var assert = require('assert');
var {
  CompositeDisposable,
  Disposable,
  Emitter,
} = require('atom');
var {
  array,
} = require('nuclide-commons');

var logger;
function getLogger() {
  if (logger == null) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

function getDefaultResult(): QueryResult {
  return {
    error: null,
    loading: false,
    result: [],
  };
}

var QuickSelectionDispatcher = require('./QuickSelectionDispatcher');
var QuickSelectionActions = require('./QuickSelectionActions');

var assign = Object.assign || require('object-assign');

var RESULTS_CHANGED_EVENT = 'results_changed';
var PROVIDERS_CHANGED = 'providers_changed';
var MAX_OMNI_RESULTS_PER_SERVICE = 5;
var OMNISEARCH_PROVIDER = {
  action: 'nuclide-quick-open:toggle-omni-search',
  debounceDelay: 0,
  name: 'OmniSearchResultProvider',
  prompt: 'Search for anything...',
  title: 'OmniSearch',
};

function isValidProvider(provider): boolean {
  return (
    typeof provider.getProviderType === 'function' &&
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
  _providersByDirectory: Map;
  _directories: Array;
  _cachedResults: Object;
  _registeredProviders: {directory: Map<string, Provider>; global: Map<string, Provider>;};
  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _activeProviderName: string;

  constructor() {
    this.RESULTS_CHANGED = RESULTS_CHANGED_EVENT;
    this.PROVIDERS_CHANGED = PROVIDERS_CHANGED;
    this._registeredProviders = {
      directory: new Map(),
      global: new Map(),
    };
    this._directories = [];
    this._cachedResults = {};
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._dispatcher = QuickSelectionDispatcher;
    // Check is required for testing
    if (atom.project) {
      this._subscriptions.add(atom.project.onDidChangePaths(this._updateDirectories.bind(this)));
      this._updateDirectories();
    }
    this._setUpFlux();
    this._activeProviderName = OMNISEARCH_PROVIDER.name;
  }

  _setUpFlux(): void {
    this._dispatcherToken = QuickSelectionDispatcher.getInstance().register(action => {
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
      for (var provider of this._registeredProviders.directory.values()) {
        if (provider.isEligibleForDirectory(directory)) {
          var providersForDir = this._providersByDirectory.get(directory) || [];
          providersForDir.push(provider);
          this._providersByDirectory.set(directory, providersForDir);
        }
      }
    });
  }

  on() {
    this._emitter.on(...arguments);
  }

  off() {
    this._emitter.off(...arguments);
  }


  registerProvider(service: Provider): Disposable {
    if (!isValidProvider(service)) {
      getLogger().error(`Quick-open provider ${service.constructor.name} is not a valid provider`);
    }
    var isGlobalProvider = service.getProviderType() === 'GLOBAL';
    var targetRegistry = isGlobalProvider
      ? this._registeredProviders.global
      : this._registeredProviders.directory;
    targetRegistry.set(service.constructor.name, service);
    if (!isGlobalProvider) {
      this._updateDirectories();
    }
    return new Disposable(() => {
      targetRegistry.delete(service.constructor.name, service);
      this._providersByDirectory.forEach((dir, providers) => {
        var index = providers.indexOf(service);
        if (index !== -1) {
          providers.splice(index, 1);
        }
      });
    });
  }

  /**
   * Create a `toggle-provider` action on behalf of a provider.
   */
  toggleProvider(service: Provider): void {
    QuickSelectionActions.changeActiveProvider(service.constructor.name);
  }

  cacheResult(query: string, result: Object, directory: string, provider: Object, queryTimestamp: number): void {
    var providerName = provider.constructor.name;
    this._cachedResults[providerName][directory][query] = {
      result,
      loading: false,
      queryTimestamp,
    };
    setImmediate(() => this._cleanCache());
  }

  _setLoading(query: string, directory: string, provider: Object, queryTimestamp: number): void {
    var providerName = provider.constructor.name;
    if (!this._cachedResults[providerName]) {
      this._cachedResults[providerName] = {};
    }
    if (!this._cachedResults[providerName][directory]) {
      this._cachedResults[providerName][directory] = {};
    }
    var previousResult = this._cachedResults[providerName][directory][query];
    if (previousResult) {
      previousResult.loading = true;
    } else {
      this._cachedResults[providerName][directory][query] = {
        result: [],
        error: null,
        loading: true,
        queryTimestamp,
      };
    }
  }

  // release cached results older than <n> MS
  _cleanCache() {
    // TODO
  }

  processResult(
    query: string,
    result: FileResult,
    directory: string,
    provider: Object,
    queryTimestamp: number
  ): void {
    this.cacheResult(...arguments);
    this._emitter.emit(RESULTS_CHANGED_EVENT);
  }

  sanitizeQuery(query: string): string {
    return query.trim();
  }

  async executeQuery(query: string): Promise<void> {
    var query = this.sanitizeQuery(query);
    // Keep track of query timestamp, so we can resolve race conditions.
    var timestamp = Date.now();
    var globalProvider;
    for (globalProvider of this._registeredProviders.global.values()) {
      globalProvider.executeQuery(query).then(result => {
        this.processResult(query, result, 'global', globalProvider, timestamp);
      });
      this._setLoading(query, 'global', globalProvider, timestamp);
    }
    this._directories.forEach(directory => {
      var path = directory.getPath();
      for (var provider of this._providersByDirectory.get(directory)) {
        provider.executeQuery(query, directory).then(((boundProvider, result) => {
          this.processResult(query, result, path, boundProvider, timestamp);
        }).bind(this, provider));
        this._setLoading(query, path, provider, timestamp);
      }
    });
    this._emitter.emit(RESULTS_CHANGED_EVENT);
  }

  _isGlobalProvider(providerName: string): boolean {
    return this._registeredProviders.global.has(providerName);
  }

  _getProviderByName(providerName: string): Provider {
    if (this._isGlobalProvider(providerName)) {
      return this._registeredProviders.global.get(providerName);
    }
    var dirProvider = this._registeredProviders.directory.get(providerName);
    assert(
      dirProvider != null,
      `Provider ${providerName} is not registered with quick-open.`
    );
    return dirProvider;
  }

  _getResultsForProvider(query: string, providerName: string): Object {
    var providerPaths = this._isGlobalProvider(providerName)
      ? ['global']
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
      var omniSearchResults = [];
      for (var providerName in this._cachedResults) {
        var resultForProvider = this._getResultsForProvider(query, providerName);
        // TODO replace this with a ranking algorithm
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
    return {
      action: provider.getAction && provider.getAction() || '',
      debounceDelay: provider.getDebounceDelay && provider.getDebounceDelay() || 200,
      name: provider.constructor.name,
      prompt: provider.getPromptText && provider.getPromptText() || 'Search ' + provider.constructor.name,
      title: provider.getTabTitle && provider.getTabTitle() || provider.constructor.name,
    };
  }

  getRenderableProviders(): Array<ProviderSpec> {
    var tabs = array.from(this._registeredProviders.global.values(), this._bakeProvider)
      .concat(array.from(this._registeredProviders.directory.values(), this._bakeProvider))
      .sort((p1, p2) => p1.name.localeCompare(p2.name));
    tabs.unshift(OMNISEARCH_PROVIDER);
    return tabs;
  }

}

module.exports = new SearchResultManager();
