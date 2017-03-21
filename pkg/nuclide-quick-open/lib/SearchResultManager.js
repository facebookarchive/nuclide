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
import type {FileResult, Provider, DirectoryProviderType} from './types';
import type {GroupedResult, GroupedResults, ProviderResult} from './searchResultHelpers';
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
import React from 'react';
import {
  CompositeDisposable,
  Emitter,
} from 'atom';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {triggerAfterWait} from '../../commons-node/promise';
import debounce from '../../commons-node/debounce';
import FileResultComponent from './FileResultComponent';
import ResultCache from './ResultCache';
import {arrayEqual, mapEqual} from '../../commons-node/collection';

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
  _providersByDirectory: Map<atom$Directory, Set<DirectoryProviderType>>;
  _providerSubscriptions: Map<Provider, IDisposable>;
  _directories: Array<atom$Directory>;
  _resultCache: ResultCache;
  _currentWorkingRoot: ?Directory;
  _debouncedUpdateDirectories: {(): Promise<void> | void} & IDisposable;
  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _activeProviderName: string;
  _lastRawQuery: ?string;

  constructor(
    quickOpenProviderRegistry: QuickOpenProviderRegistry,
  ) {
    this._activeProviderName = OMNISEARCH_PROVIDER.name;
    this._lastRawQuery = null;
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
      this._updateDirectories.bind(this),
      UPDATE_DIRECTORIES_DEBOUNCE_DELAY,
      /* immediate */ false,
    );
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._quickOpenProviderRegistry = quickOpenProviderRegistry;
    this._subscriptions.add(
      this._debouncedUpdateDirectories,
      atom.project.onDidChangePaths(
        this._debouncedUpdateDirectories,
      ),
      this._quickOpenProviderRegistry.observeProviders(
        this._registerProvider.bind(this),
      ),
      this._quickOpenProviderRegistry.onDidRemoveProvider(
        this._deregisterProvider.bind(this),
      ),
    );
    this._debouncedUpdateDirectories();
  }

  executeQuery(query: string): void {
    this._executeQuery(query);
  }

  setActiveProvider(providerName: string): void {
    if (this._activeProviderName !== providerName) {
      this._activeProviderName = providerName;
      this._emitter.emit('providers-changed');
    }
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

  getLastQuery(): ?string {
    return this._lastRawQuery;
  }

  getRendererForProvider(providerName: string): ResultRenderer {
    const provider = this._getProviderByName(providerName);
    return provider.getComponentForItem != null
      ? provider.getComponentForItem
      : FileResultComponent.getComponentForItem;
  }

  dispose(): void {
    this._emitter.dispose();
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
    const directories = atom.project.getDirectories();
    const providersByDirectories = new Map();
    const eligibilities = [];

    directories.forEach(directory => {
      const providersForDirectory = new Set();
      providersByDirectories.set(directory, providersForDirectory);
      for (const provider of this._quickOpenProviderRegistry.getDirectoryProviders()) {
        eligibilities.push(
          provider.isEligibleForDirectory(directory)
            .catch(err => {
              getLogger().warn(
                `isEligibleForDirectory failed for directory provider ${provider.name}`,
                err,
              );
              return false;
            })
            .then(isEligible => {
              if (isEligible) {
                providersForDirectory.add(provider);
              }
            }),
        );
      }
    });

    await Promise.all(eligibilities);

    if (!(
      arrayEqual(this._directories, directories) &&
      mapEqual(this._providersByDirectory, providersByDirectories)
    )) {
      this._directories = directories;
      this._providersByDirectory = providersByDirectories;
      this._emitter.emit('providers-changed');
    }
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
      throw new Error(`${service.name} has already been registered.`);
    }

    const subscriptions = new UniversalDisposable();
    this._providerSubscriptions.set(service, subscriptions);

    if (service.providerType === 'DIRECTORY') {
      this._debouncedUpdateDirectories();
    }
  }

  _deregisterProvider(service: Provider): void {
    const subscriptions = this._providerSubscriptions.get(service);
    if (subscriptions == null) {
      throw new Error(`${service.name} has already been deregistered.`);
    }

    subscriptions.dispose();
    this._providerSubscriptions.delete(service);

    if (service.providerType === 'DIRECTORY') {
      this._providersByDirectory.forEach(providers => {
        providers.delete(service);
      });
    }

    if (service.name === this._activeProviderName) {
      this._activeProviderName = OMNISEARCH_PROVIDER.name;
    }

    this._resultCache.removeResultsForProvider(service.name);
    this._emitter.emit('providers-changed');
  }

  _cacheResult(
    query: string,
    result: Array<FileResult>,
    directory: string,
    provider: Provider,
  ): void {
    this._resultCache.setCacheResult(provider.name, directory, query, result, false, null);
  }

  _setLoading(query: string, directory: string, provider: Provider): void {
    const previousResult = this._resultCache.getCacheResult(provider.name, directory, query);

    if (!previousResult) {
      this._resultCache.rawSetCacheResult(provider.name, directory, query, {
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
    this._lastRawQuery = rawQuery;
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
          'quickopen-source-provider': globalProvider.name,
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
            'quickopen-source-provider': directoryProvider.name,
            'quickopen-query-duration': (performance.now() - startTime).toString(),
            'quickopen-result-count': (result.length).toString(),
          });
          this._processResult(query, result, path, directoryProvider);
        });
      }
    });
  }

  _getProviderByName(providerName: string): Provider {
    const provider = this._quickOpenProviderRegistry.getProviderByName(providerName);
    invariant(provider != null, `Provider ${providerName} is not registered with quick-open.`);
    return provider;
  }

  _getResultsForProvider(query: string, providerName: string): GroupedResult {
    const providerPaths = this._quickOpenProviderRegistry.isProviderGlobal(providerName)
      ? [GLOBAL_KEY]
      : this._sortDirectories().map(d => d.getPath());
    const providerSpec = this.getProviderSpecByName(providerName);
    const lastCachedQuery = this._resultCache.getLastCachedQuery(providerName);
    return {
      priority: providerSpec.priority,
      title: providerSpec.title,
      results: providerPaths.reduce((results, path) => {
        let cachedResult = {};
        const cachedPaths = this._resultCache.getAllCachedResults()[providerName];
        if (cachedPaths) {
          const cachedQueries = cachedPaths[path];
          if (cachedQueries) {
            if (cachedQueries[query]) {
              cachedResult = cachedQueries[query];
            } else if (lastCachedQuery != null && cachedQueries[lastCachedQuery]) {
              cachedResult = cachedQueries[lastCachedQuery];
            }
          }
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

  getResults(query: string, activeProviderName: string): GroupedResults {
    const sanitizedQuery = this._sanitizeQuery(query);
    if (activeProviderName === OMNISEARCH_PROVIDER.name) {
      const omniSearchResults = {};
      Object.keys(this._resultCache.getAllCachedResults())
        .map(providerName => {
          const resultForProvider = this._getResultsForProvider(sanitizedQuery, providerName);
          // TODO replace this with a ranking algorithm.
          for (const dir in resultForProvider.results) {
            resultForProvider.results[dir].results =
              resultForProvider.results[dir].results.slice(0, MAX_OMNI_RESULTS_PER_SERVICE);
          }
          return [providerName, resultForProvider];
        })
        .sort(([name1, result1], [name2, result2]) => {
          return result1.priority === result2.priority
            ? name1.localeCompare(name2)
            : result1.priority - result2.priority;
        })
        .forEach(([providerName, resultForProvider]) => {
          omniSearchResults[providerName] = resultForProvider;
        });
      return omniSearchResults;
    } else {
      const resultForProvider = this._getResultsForProvider(sanitizedQuery, activeProviderName);
      return {[activeProviderName]: resultForProvider};
    }
  }

  getProviderSpecByName(providerName: string): ProviderSpec {
    if (providerName === OMNISEARCH_PROVIDER.name) {
      return {...OMNISEARCH_PROVIDER};
    }
    return this._bakeProvider(this._getProviderByName(providerName));
  }

  /**
   * Turn a Provider into a plain "spec" object consumed by QuickSelectionComponent.
   */
  _bakeProvider(provider: Provider): ProviderSpec {
    const {display} = provider;
    const providerSpec = {
      name: provider.name,
      debounceDelay: provider.debounceDelay != null
        ? provider.debounceDelay
        : DEFAULT_QUERY_DEBOUNCE_DELAY,
      title: display != null
        ? display.title
        : provider.name,
      prompt: display != null
        ? display.prompt
        : `Search ${provider.name}`,
      action: display != null && display.action != null
        ? display.action
        : '',
      canOpenAll: display != null && display.canOpenAll != null
        ? display.canOpenAll
        : true,
      priority: provider.priority != null
        ? provider.priority
        : Number.POSITIVE_INFINITY,
    };
    return providerSpec;
  }

  getRenderableProviders(): Array<ProviderSpec> {
    // Only render tabs for providers that are eligible for at least one directory.
    const eligibleDirectoryProviders =
      this._quickOpenProviderRegistry.getDirectoryProviders()
        .filter(eligibleProvider => {
          for (const [, directoryProviders] of this._providersByDirectory) {
            if (directoryProviders.has(eligibleProvider)) {
              return true;
            }
          }
          return false;
        });
    const tabs = this._quickOpenProviderRegistry.getGlobalProviders()
      .concat(eligibleDirectoryProviders)
      .filter(provider => (provider.display != null))
      .map(provider => this._bakeProvider(provider))
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
