/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

/* global performance */

import type {Directory} from '../../nuclide-remote-connection';
import type {FileResult, Provider} from './types';
import type {ProviderResult} from './searchResultHelpers';
import type QuickOpenProviderRegistry from './QuickOpenProviderRegistry';

export type ProviderSpec = {
  action: string,
  canOpenAll: boolean,
  debounceDelay: number,
  name: string,
  prompt: string,
  title: string,
  priority: number,
};

type ResultRenderer =
  (item: FileResult, serviceName: string, dirName: string) => React.Element<any>;

import invariant from 'assert';
import {track} from '../../nuclide-analytics';
import {getLogger} from '../../nuclide-logging';
import {React} from 'react-for-atom';
import {
  CompositeDisposable,
  Emitter,
} from 'atom';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {triggerAfterWait} from '../../commons-node/promise';
import debounce from '../../commons-node/debounce';
import FileResultComponent from './FileResultComponent';
import ResultCache from './ResultCache';

const MAX_OMNI_RESULTS_PER_SERVICE = 5;
const DEFAULT_QUERY_DEBOUNCE_DELAY = 200;
const LOADING_EVENT_DELAY = 200;
const OMNISEARCH_PROVIDER = {
  action: 'nuclide-quick-open:find-anything-via-omni-search',
  canOpenAll: false,
  debounceDelay: DEFAULT_QUERY_DEBOUNCE_DELAY,
  name: 'OmniSearchResultProvider',
  prompt: 'Search for anything...',
  title: 'OmniSearch',
  priority: 0,
};
const UPDATE_DIRECTORIES_DEBOUNCE_DELAY = 100;
const GLOBAL_KEY = 'global';

/**
 * A singleton cache for search providers and results.
 */
export default class SearchResultManager {
  _quickOpenProviderRegistry: QuickOpenProviderRegistry;
  _providersByDirectory: Map<atom$Directory, Set<Provider>>;
  _providerSubscriptions: Map<Provider, IDisposable>;
  _directories: Array<atom$Directory>;
  _resultCache: ResultCache;
  _currentWorkingRoot: ?Directory;
  _debouncedUpdateDirectories: () => mixed;
  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _activeProviderName: string;

  constructor(
    quickOpenProviderRegistry: QuickOpenProviderRegistry,
  ) {
    this._providersByDirectory = new Map();
    this._providerSubscriptions = new Map();
    this._directories = [];
    this._currentWorkingRoot = null;
    this._resultCache = new ResultCache(() => {
      // on result changed
      this._emitter.emit('results-changed');
    });
    // `updateDirectories` joins providers and directories, which don't know anything about each
    // other. Debounce this call to reduce churn at startup, and when new providers get activated or
    // a new directory gets mounted.
    this._debouncedUpdateDirectories = debounce(
      () => this._updateDirectories(),
      UPDATE_DIRECTORIES_DEBOUNCE_DELAY,
      /* immediate */ false,
    );
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._quickOpenProviderRegistry = quickOpenProviderRegistry;
    // Check is required for testing.
    if (atom.project) {
      this._subscriptions.add(atom.project.onDidChangePaths(
        this._debouncedUpdateDirectories.bind(this)),
      );
      this._debouncedUpdateDirectories();
    }
    this._subscriptions.add(
      this._quickOpenProviderRegistry.observeProviders(
        this._registerProvider.bind(this),
      ),
      this._quickOpenProviderRegistry.onDidRemoveProvider(
        this._deregisterProvider.bind(this),
      ),
    );
    this._activeProviderName = OMNISEARCH_PROVIDER.name;
  }

  executeQuery(query: string): void {
    this._executeQuery(query);
  }

  setActiveProvider(providerName: string): void {
    this._activeProviderName = providerName;
    this._emitter.emit('providers-changed');
  }

  onResultsChanged(callback: () => void): IDisposable {
    return this._emitter.on('results-changed', callback);
  }

  onProvidersChanged(callback: () => void): IDisposable {
    return this._emitter.on('providers-changed', callback);
  }

  getActiveProviderName(): string {
    return this._activeProviderName;
  }

  getRendererForProvider(providerName: string): ResultRenderer {
    const provider = this._getProviderByName(providerName);
    if (!provider || !provider.getComponentForItem) {
      return FileResultComponent.getComponentForItem;
    }
    return provider.getComponentForItem;
  }

  dispose(): void {
    this._subscriptions.dispose();
    this._providerSubscriptions.forEach(subscriptions => {
      subscriptions.dispose();
    });
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
      for (const provider of this._quickOpenProviderRegistry.getDirectoryProviders()) {
        invariant(
          provider.isEligibleForDirectory != null,
          `Directory provider ${provider.getName()} must provide \`isEligibleForDirectory()\`.`,
        );
        eligibilities.push(
          provider.isEligibleForDirectory(directory).then(isEligible => ({
            isEligible,
            provider,
            directory,
          })).catch(err => {
            getLogger().warn(
              `isEligibleForDirectory failed for directory provider ${provider.getName()}`,
              err,
            );
            return {
              isEligible: false,
              provider,
              directory,
            };
          }),
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
          `Providers for directory ${directory.getPath()} not defined`,
        );
        providersForDirectory.add(provider);
      }
    }
    this._directories = newDirectories;
    this._providersByDirectory = newProvidersByDirectories;
    this._emitter.emit('providers-changed');
  }

  setCurrentWorkingRoot(newRoot: ?Directory): void {
    this._currentWorkingRoot = newRoot;
  }

  _sortDirectories(): Array<atom$Directory> {
    const currentWorkingRoot = this._currentWorkingRoot;
    if (currentWorkingRoot == null) {
      // Don't sort
      return this._directories;
    }
    let topDir = null;
    for (const dir of this._directories) {
      // The current working root can be a subdirectory of an open project. For now, we'll only sort
      // if the current working root is actually a project root. Otherwise we fall through so that
      // no sorting takes place. It would be nice to the project root that contains the current
      // working root on top. But Directory::contains includes code that synchronously queries the
      // filesystem so I want to avoid it for now.
      if (dir.getPath() === currentWorkingRoot.getPath()) {
        // This *not* currentWorkingRoot. It's the directory from this._directories. That's because
        // currentWorkingRoot uses the Directory type (which explicitly includes remote directory
        // objects), whereas this module uses atom$Directory. That should probably be addressed.
        topDir = dir;
      }
    }
    if (topDir == null) {
      return this._directories;
    }
    // Unfortunately we can't easily use Array::sort here because it is not guaranteed to be a
    // stable sort. The comparison function would probably end up being more complicated than this.
    const directories = [topDir];
    for (const dir of this._directories) {
      if (dir !== topDir) {
        directories.push(dir);
      }
    }
    return directories;
  }

  _registerProvider(service: Provider): void {
    if (this._providerSubscriptions.get(service)) {
      const serviceName = service.getName();
      throw new Error(`${serviceName} has already been registered.`);
    }

    const subscriptions = new UniversalDisposable();
    this._providerSubscriptions.set(service, subscriptions);

    if (service.getProviderType() === 'DIRECTORY') {
      this._debouncedUpdateDirectories();
    }
  }

  _deregisterProvider(service: Provider): void {
    const serviceName = service.getName();
    const subscriptions = this._providerSubscriptions.get(service);
    if (subscriptions == null) {
      throw new Error(`${serviceName} has already been deregistered.`);
    }

    subscriptions.dispose();
    this._providerSubscriptions.delete(service);

    this._providersByDirectory.forEach(providers => {
      providers.delete(service);
    });

    if (serviceName === this._activeProviderName) {
      this._activeProviderName = OMNISEARCH_PROVIDER.name;
    }

    this._resultCache.removeResultsForProvider(serviceName);
    this._emitter.emit('providers-changed');
  }

  _cacheResult(
    query: string,
    result: Array<FileResult>,
    directory: string,
    provider: Provider,
  ): void {
    const providerName = provider.getName();
    this._resultCache.setCacheResult(providerName, directory, query, result, false, null);
  }

  _setLoading(query: string, directory: string, provider: Provider): void {
    const providerName = provider.getName();
    const previousResult = this._resultCache.getCacheResult(providerName, directory, query);

    if (!previousResult) {
      this._resultCache.rawSetCacheResult(providerName, directory, query, {
        results: [],
        error: null,
        loading: true,
      });
    }
  }

  _processResult(
    query: string,
    result: Array<FileResult>,
    directory: string,
    provider: Provider,
  ): void {
    this._cacheResult(query, result, directory, provider);
    this._emitter.emit('results-changed');
  }

  _sanitizeQuery(query: string): string {
    return query.trim();
  }

  _executeQuery(rawQuery: string): void {
    const query = this._sanitizeQuery(rawQuery);
    for (const globalProvider of this._quickOpenProviderRegistry.getGlobalProviders()) {
      const startTime = performance.now();
      const loadingFn = () => {
        this._setLoading(query, GLOBAL_KEY, globalProvider);
        this._emitter.emit('results-changed');
      };
      triggerAfterWait(
        globalProvider.executeQuery(query),
        LOADING_EVENT_DELAY,
        loadingFn,
      ).then(result => {
        track('quickopen-query-source-provider', {
          'quickopen-source-provider': globalProvider.getName(),
          'quickopen-query-duration': (performance.now() - startTime).toString(),
          'quickopen-result-count': (result.length).toString(),
        });
        this._processResult(query, result, GLOBAL_KEY, globalProvider);
      });
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
        const loadingFn = () => {
          this._setLoading(query, path, directoryProvider);
          this._emitter.emit('results-changed');
        };
        triggerAfterWait(
          directoryProvider.executeQuery(query, directory),
          LOADING_EVENT_DELAY,
          loadingFn,
        ).then(result => {
          track('quickopen-query-source-provider', {
            'quickopen-source-provider': directoryProvider.getName(),
            'quickopen-query-duration': (performance.now() - startTime).toString(),
            'quickopen-result-count': (result.length).toString(),
          });
          this._processResult(query, result, path, directoryProvider);
        });
      }
    });
  }

  _getProviderByName(providerName: string): Provider {
    const dirProvider =
      this._quickOpenProviderRegistry.getProviderByName(providerName);
    invariant(
      dirProvider != null,
      `Provider ${providerName} is not registered with quick-open.`,
    );
    return dirProvider;
  }

  _getResultsForProvider(query: string, providerName: string): Object {
    const providerPaths = this._quickOpenProviderRegistry.isProviderGlobal(providerName)
      ? [GLOBAL_KEY]
      : this._sortDirectories().map(d => d.getPath());
    const provider = this._getProviderByName(providerName);
    const lastCachedQuery = this._resultCache.getLastCachedQuery(providerName);
    return {
      title: provider.getTabTitle(),
      results: providerPaths.reduce((results, path) => {
        let cachedPaths;
        let cachedQueries;
        let cachedResult;
        if (!(
          (cachedPaths = this._resultCache.getAllCachedResults()[providerName]) &&
          (cachedQueries = cachedPaths[path]) &&
          (
            (cachedResult = cachedQueries[query]) ||
            // If the current query hasn't returned anything yet, try the last cached result.
            lastCachedQuery != null && (cachedResult = cachedQueries[lastCachedQuery])
          )
        )) {
          cachedResult = {};
        }
        const defaultResult: ProviderResult = {
          error: null,
          loading: false,
          results: [],
        };
        const resultList = cachedResult.results || defaultResult.results;
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
    const sanitizedQuery = this._sanitizeQuery(query);
    if (activeProviderName === OMNISEARCH_PROVIDER.name) {
      const omniSearchResults = [{}];
      for (const providerName in this._resultCache.getAllCachedResults()) {
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
    const providerSpec = {
      action: provider.getAction ? provider.getAction() : '',
      canOpenAll: provider.getCanOpenAll ? provider.getCanOpenAll() : true,
      debounceDelay: provider.getDebounceDelay
        ? provider.getDebounceDelay()
        : DEFAULT_QUERY_DEBOUNCE_DELAY,
      name: providerName,
      prompt: provider.getPromptText && provider.getPromptText() ||
        'Search ' + providerName,
      title: provider.getTabTitle && provider.getTabTitle() || providerName,
      priority: provider.getPriority
        ? provider.getPriority()
        : Number.POSITIVE_INFINITY,
    };
    return providerSpec;
  }

  getRenderableProviders(): Array<ProviderSpec> {
    // Only render tabs for providers that are eligible for at least one directory.
    const eligibleDirectoryProviders =
      this._quickOpenProviderRegistry.getDirectoryProviders()
      .filter(provider => {
        for (const providers of this._providersByDirectory.values()) {
          if (providers.has(provider)) {
            return true;
          }
        }
        return false;
      });
    const tabs = this._quickOpenProviderRegistry.getGlobalProviders()
      .concat(eligibleDirectoryProviders)
      .filter(provider => provider.isRenderable())
      .map(this._bakeProvider)
      .sort((p1, p2) => p1.name.localeCompare(p2.name));
    tabs.unshift(OMNISEARCH_PROVIDER);
    return tabs;
  }
}

export const __test__ = {
  _getOmniSearchProviderSpec(): ProviderSpec {
    return OMNISEARCH_PROVIDER;
  },
};
