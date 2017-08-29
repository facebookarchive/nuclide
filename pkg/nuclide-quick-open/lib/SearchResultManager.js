'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _atom = require('atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('nuclide-commons/debounce'));
}

var _FileResultComponent;

function _load_FileResultComponent() {
  return _FileResultComponent = _interopRequireDefault(require('./FileResultComponent'));
}

var _ResultCache;

function _load_ResultCache() {
  return _ResultCache = _interopRequireDefault(require('./ResultCache'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MAX_OMNI_RESULTS_PER_SERVICE = 5; /**
                                         * Copyright (c) 2015-present, Facebook, Inc.
                                         * All rights reserved.
                                         *
                                         * This source code is licensed under the license found in the LICENSE file in
                                         * the root directory of this source tree.
                                         *
                                         * 
                                         * @format
                                         */

/* global performance */

const DEFAULT_QUERY_DEBOUNCE_DELAY = 200;
const LOADING_EVENT_DELAY = 200;
const OMNISEARCH_PROVIDER = {
  action: 'nuclide-quick-open:find-anything-via-omni-search',
  canOpenAll: false,
  name: 'OmniSearchResultProvider',
  prompt: 'Search for anything...',
  title: 'OmniSearch',
  priority: 0
};
const UPDATE_DIRECTORIES_DEBOUNCE_DELAY = 100;
const GLOBAL_KEY = 'global';

function getQueryDebounceDelay(provider) {
  return provider.debounceDelay != null ? provider.debounceDelay : DEFAULT_QUERY_DEBOUNCE_DELAY;
}

/**
 * A singleton cache for search providers and results.
 */
class SearchResultManager {

  constructor(quickOpenProviderRegistry) {
    this._activeProviderName = OMNISEARCH_PROVIDER.name;
    this._lastRawQuery = null;
    this._directoryEligibleProviders = new Map();
    this._globalEligibleProviders = new Set();
    this._providerSubscriptions = new Map();
    this._directories = [];
    this._currentWorkingRoot = null;
    this._resultCache = new (_ResultCache || _load_ResultCache()).default(() => {
      // on result changed
      this._emitter.emit('results-changed');
    });
    // `updateDirectories` joins providers and directories, which don't know anything about each
    // other. Debounce this call to reduce churn at startup, and when new providers get activated or
    // a new directory gets mounted.
    this._debouncedUpdateDirectories = (0, (_debounce || _load_debounce()).default)(this._updateDirectories.bind(this), UPDATE_DIRECTORIES_DEBOUNCE_DELAY,
    /* immediate */false);
    this._emitter = new _atom.Emitter();
    this._subscriptions = new _atom.CompositeDisposable();
    this._querySubscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._quickOpenProviderRegistry = quickOpenProviderRegistry;
    this._queryStream = new _rxjsBundlesRxMinJs.Subject();
    this._subscriptions.add(this._debouncedUpdateDirectories, atom.project.onDidChangePaths(this._debouncedUpdateDirectories), this._quickOpenProviderRegistry.observeProviders(this._registerProvider.bind(this)), this._quickOpenProviderRegistry.onDidRemoveProvider(this._deregisterProvider.bind(this)));
    this._debouncedUpdateDirectories();
  }

  executeQuery(query) {
    this._lastRawQuery = query;
    this._queryStream.next(this._sanitizeQuery(query));
  }

  setActiveProvider(providerName) {
    if (this._activeProviderName !== providerName) {
      this._activeProviderName = providerName;
      this._emitter.emit('providers-changed');
    }
  }

  onResultsChanged(callback) {
    return this._emitter.on('results-changed', callback);
  }

  onProvidersChanged(callback) {
    return this._emitter.on('providers-changed', callback);
  }

  getActiveProviderName() {
    return this._activeProviderName;
  }

  getLastQuery() {
    return this._lastRawQuery;
  }

  getRendererForProvider(providerName) {
    const provider = this._getProviderByName(providerName);
    return provider.getComponentForItem != null ? provider.getComponentForItem : (_FileResultComponent || _load_FileResultComponent()).default.getComponentForItem;
  }

  dispose() {
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
  _updateDirectories() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const directories = atom.project.getDirectories();
      const directoryEligibleProviders = new Map();
      const globalEligibleProviders = new Set();
      const eligibilities = [];

      directories.forEach(function (directory) {
        const providersForDirectory = new Set();
        directoryEligibleProviders.set(directory, providersForDirectory);
        for (const provider of _this._quickOpenProviderRegistry.getDirectoryProviders()) {
          eligibilities.push(provider.isEligibleForDirectory(directory).catch(function (err) {
            (0, (_log4js || _load_log4js()).getLogger)('nuclide-quick-open').warn(`isEligibleForDirectory failed for directory provider ${provider.name}`, err);
            return false;
          }).then(function (isEligible) {
            if (isEligible) {
              providersForDirectory.add(provider);
            }
          }));
        }
      });

      for (const provider of _this._quickOpenProviderRegistry.getGlobalProviders()) {
        eligibilities.push(provider.isEligibleForDirectories(directories).catch(function (err) {
          (0, (_log4js || _load_log4js()).getLogger)('nuclide-quick-open').warn(`isEligibleForDirectories failed for ${provider.name}`, err);
          return false;
        }).then(function (isEligible) {
          if (isEligible) {
            globalEligibleProviders.add(provider);
          }
        }));
      }

      yield Promise.all(eligibilities);

      if (!((0, (_collection || _load_collection()).arrayEqual)(_this._directories, directories) && (0, (_collection || _load_collection()).mapEqual)(_this._directoryEligibleProviders, directoryEligibleProviders) && (0, (_collection || _load_collection()).areSetsEqual)(_this._globalEligibleProviders, globalEligibleProviders))) {
        _this._directories = directories;
        _this._directoryEligibleProviders = directoryEligibleProviders;
        _this._globalEligibleProviders = globalEligibleProviders;
        _this._emitter.emit('providers-changed');

        // Providers can have a very wide range of debounce delays.
        // Debounce queries on a per-provider basis to ensure that the default Cmd-T is snappy.
        _this._querySubscriptions.dispose();
        _this._querySubscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
        for (const [directory, providers] of _this._directoryEligibleProviders) {
          for (const provider of providers) {
            _this._querySubscriptions.add(_this._queryStream.debounceTime(getQueryDebounceDelay(provider)).subscribe(function (query) {
              return _this._executeDirectoryQuery(directory, provider, query);
            }));
          }
        }
        for (const provider of _this._globalEligibleProviders) {
          _this._querySubscriptions.add(_this._queryStream.debounceTime(getQueryDebounceDelay(provider)).subscribe(function (query) {
            return _this._executeGlobalQuery(provider, query);
          }));
        }
      }
    })();
  }

  setCurrentWorkingRoot(newRoot) {
    this._currentWorkingRoot = newRoot;
  }

  _sortDirectories() {
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

  _registerProvider(service) {
    if (this._providerSubscriptions.get(service)) {
      throw new Error(`${service.name} has already been registered.`);
    }

    const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._providerSubscriptions.set(service, subscriptions);

    this._debouncedUpdateDirectories();
  }

  _deregisterProvider(service) {
    const subscriptions = this._providerSubscriptions.get(service);
    if (subscriptions == null) {
      throw new Error(`${service.name} has already been deregistered.`);
    }

    subscriptions.dispose();
    this._providerSubscriptions.delete(service);

    if (service.providerType === 'GLOBAL') {
      this._globalEligibleProviders.delete(service);
    } else if (service.providerType === 'DIRECTORY') {
      this._directoryEligibleProviders.forEach(providers => {
        providers.delete(service);
      });
    }

    if (service.name === this._activeProviderName) {
      this._activeProviderName = OMNISEARCH_PROVIDER.name;
    }

    this._resultCache.removeResultsForProvider(service.name);
    this._emitter.emit('providers-changed');
  }

  _cacheResult(query, result, directory, provider) {
    this._resultCache.setCacheResult(provider.name, directory, query, result, false, null);
  }

  _setLoading(query, directory, provider) {
    const previousResult = this._resultCache.getCacheResult(provider.name, directory, query);

    if (!previousResult) {
      this._resultCache.rawSetCacheResult(provider.name, directory, query, {
        results: [],
        error: null,
        loading: true
      });
    }
  }

  _processResult(query, result, directory, provider) {
    this._cacheResult(query, result, directory, provider);
    this._emitter.emit('results-changed');
  }

  _sanitizeQuery(query) {
    return query.trim();
  }

  _executeGlobalQuery(provider, query) {
    for (const globalProvider of this._globalEligibleProviders) {
      const startTime = performance.now();
      const loadingFn = () => {
        this._setLoading(query, GLOBAL_KEY, globalProvider);
        this._emitter.emit('results-changed');
      };
      (0, (_promise || _load_promise()).triggerAfterWait)(globalProvider.executeQuery(query, this._directories), LOADING_EVENT_DELAY, loadingFn).then(result => {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('quickopen-query-source-provider', {
          'quickopen-source-provider': globalProvider.name,
          'quickopen-query-duration': (performance.now() - startTime).toString(),
          'quickopen-result-count': result.length.toString()
        });
        this._processResult(query, result, GLOBAL_KEY, globalProvider);
      });
    }
  }

  _executeDirectoryQuery(directory, provider, query) {
    const path = directory.getPath();
    const startTime = performance.now();
    const loadingFn = () => {
      this._setLoading(query, path, provider);
      this._emitter.emit('results-changed');
    };
    (0, (_promise || _load_promise()).triggerAfterWait)(provider.executeQuery(query, directory), LOADING_EVENT_DELAY, loadingFn).then(result => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('quickopen-query-source-provider', {
        'quickopen-source-provider': provider.name,
        'quickopen-query-duration': (performance.now() - startTime).toString(),
        'quickopen-result-count': result.length.toString()
      });
      this._processResult(query, result, path, provider);
    });
  }

  _getProviderByName(providerName) {
    const provider = this._quickOpenProviderRegistry.getProviderByName(providerName);

    if (!(provider != null)) {
      throw new Error(`Provider ${providerName} is not registered with quick-open.`);
    }

    return provider;
  }

  _getResultsForProvider(query, providerName) {
    let providerPaths;
    if (this._quickOpenProviderRegistry.isProviderGlobal(providerName)) {
      const provider = this._quickOpenProviderRegistry.getGlobalProviderByName(providerName);
      providerPaths = provider && this._globalEligibleProviders.has(provider) ? [GLOBAL_KEY] : [];
    } else {
      providerPaths = this._sortDirectories().map(d => d.getPath());
    }
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
              // It's important to ensure that we update lastCachedQuery here.
              // Consider the case where we enter "abc", then "abcd",
              // then correct back to "abc" and finally enter "abce".
              // We need to ensure that "abce" displays the results for "abc"
              // while loading rather than the results for "abcd".
              this._resultCache.setLastCachedQuery(providerName, query);
            } else if (lastCachedQuery != null && cachedQueries[lastCachedQuery]) {
              cachedResult = cachedQueries[lastCachedQuery];
            }
          }
        }
        const defaultResult = {
          error: null,
          loading: false,
          results: []
        };
        const resultList = cachedResult.results || defaultResult.results;
        results[path] = {
          results: resultList.map(result => Object.assign({}, result, {
            sourceProvider: providerName
          })),
          loading: cachedResult.loading || defaultResult.loading,
          error: cachedResult.error || defaultResult.error
        };
        return results;
      }, {}),
      totalResults: 0
    };
  }

  getResults(query, activeProviderName) {
    const sanitizedQuery = this._sanitizeQuery(query);
    if (activeProviderName === OMNISEARCH_PROVIDER.name) {
      const omniSearchResults = {};
      Object.keys(this._resultCache.getAllCachedResults()).map(providerName => {
        const resultForProvider = this._getResultsForProvider(sanitizedQuery, providerName);
        // TODO replace this with a ranking algorithm.
        for (const dir in resultForProvider.results) {
          resultForProvider.totalResults += resultForProvider.results[dir].results.length;
          resultForProvider.results[dir].results = resultForProvider.results[dir].results.slice(0, MAX_OMNI_RESULTS_PER_SERVICE);
        }
        return [providerName, resultForProvider];
      }).sort(([name1, result1], [name2, result2]) => {
        return result1.priority === result2.priority ? name1.localeCompare(name2) : result1.priority - result2.priority;
      }).forEach(([providerName, resultForProvider]) => {
        omniSearchResults[providerName] = resultForProvider;
      });
      return omniSearchResults;
    } else {
      const resultForProvider = this._getResultsForProvider(sanitizedQuery, activeProviderName);
      return { [activeProviderName]: resultForProvider };
    }
  }

  getProviderSpecByName(providerName) {
    if (providerName === OMNISEARCH_PROVIDER.name) {
      return Object.assign({}, OMNISEARCH_PROVIDER);
    }
    return this._bakeProvider(this._getProviderByName(providerName));
  }

  /**
   * Turn a Provider into a plain "spec" object consumed by QuickSelectionComponent.
   */
  _bakeProvider(provider) {
    const { display } = provider;
    const providerSpec = {
      name: provider.name,
      debounceDelay: getQueryDebounceDelay(provider),
      title: display != null ? display.title : provider.name,
      prompt: display != null ? display.prompt : `Search ${provider.name}`,
      action: display != null && display.action != null ? display.action : '',
      canOpenAll: display != null && display.canOpenAll != null ? display.canOpenAll : true,
      priority: provider.priority != null ? provider.priority : Number.POSITIVE_INFINITY
    };
    return providerSpec;
  }

  getRenderableProviders() {
    // Only render tabs for providers that are eligible for at least one directory.
    const eligibleDirectoryProviders = this._quickOpenProviderRegistry.getDirectoryProviders().filter(directoryProvider => {
      for (const [, directoryEligibleProviders] of this._directoryEligibleProviders) {
        if (directoryEligibleProviders.has(directoryProvider)) {
          return true;
        }
      }
      return false;
    });
    const tabs = Array.from(this._globalEligibleProviders).concat(eligibleDirectoryProviders).filter(provider => provider.display != null).map(provider => this._bakeProvider(provider)).sort((p1, p2) => p1.name.localeCompare(p2.name));
    tabs.unshift(OMNISEARCH_PROVIDER);
    return tabs;
  }
}

exports.default = SearchResultManager;
const __test__ = exports.__test__ = {
  _getOmniSearchProviderSpec() {
    return OMNISEARCH_PROVIDER;
  },
  UPDATE_DIRECTORIES_DEBOUNCE_DELAY
};