Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _commonsNodePassesGK2;

function _commonsNodePassesGK() {
  return _commonsNodePassesGK2 = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _commonsNodeDebounce2;

function _commonsNodeDebounce() {
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _QuickSelectionDispatcher2;

function _QuickSelectionDispatcher() {
  return _QuickSelectionDispatcher2 = _interopRequireDefault(require('./QuickSelectionDispatcher'));
}

var _QuickSelectionActions2;

function _QuickSelectionActions() {
  return _QuickSelectionActions2 = _interopRequireDefault(require('./QuickSelectionActions'));
}

var performance = global.performance;

function getDefaultResult() {
  return {
    error: null,
    loading: false,
    results: []
  };
}

var AnalyticsEvents = Object.freeze({
  QUERY_SOURCE_PROVIDER: 'quickopen-query-source-provider'
});

var RESULTS_CHANGED = 'results_changed';
var PROVIDERS_CHANGED = 'providers_changed';
var MAX_OMNI_RESULTS_PER_SERVICE = 5;
var DEFAULT_QUERY_DEBOUNCE_DELAY = 200;
var LOADING_EVENT_DELAY = 200;
var OMNISEARCH_PROVIDER = {
  action: 'nuclide-quick-open:find-anything-via-omni-search',
  debounceDelay: DEFAULT_QUERY_DEBOUNCE_DELAY,
  name: 'OmniSearchResultProvider',
  prompt: 'Search for anything...',
  title: 'OmniSearch',
  priority: 0
};
// Number of elements in the cache before periodic cleanup kicks in. Includes partial query strings.
var MAX_CACHED_QUERIES = 100;
var CACHE_CLEAN_DEBOUNCE_DELAY = 5000;
var UPDATE_DIRECTORIES_DEBOUNCE_DELAY = 100;
var GLOBAL_KEY = 'global';
var DIRECTORY_KEY = 'directory';
var GK_BASIC_RANKED_OMNISEARCH = 'nuclide_quickopen_basic_ranked_omnisearch';

function isValidProvider(provider) {
  return typeof provider.getProviderType === 'function' && typeof provider.getName === 'function' && typeof provider.getName() === 'string' && typeof provider.isRenderable === 'function' && typeof provider.executeQuery === 'function' && typeof provider.getTabTitle === 'function';
}

var searchResultManagerInstance = null;
/**
 * A singleton cache for search providers and results.
 */

var SearchResultManager = (function () {
  _createClass(SearchResultManager, null, [{
    key: 'getInstance',
    value: function getInstance() {
      if (!searchResultManagerInstance) {
        searchResultManagerInstance = new SearchResultManager();
      }
      return searchResultManagerInstance;
    }
  }]);

  function SearchResultManager() {
    var _this = this;

    _classCallCheck(this, SearchResultManager);

    this._isDisposed = false;
    this.RESULTS_CHANGED = RESULTS_CHANGED;
    this.PROVIDERS_CHANGED = PROVIDERS_CHANGED;
    this._registeredProviders = {};
    this._registeredProviders[DIRECTORY_KEY] = new Map();
    this._registeredProviders[GLOBAL_KEY] = new Map();
    this._providersByDirectory = new Map();
    this._directories = [];
    this._cachedResults = {};
    this._lastCachedQuery = new Map();
    this._debouncedCleanCache = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(function () {
      return _this._cleanCache();
    }, CACHE_CLEAN_DEBOUNCE_DELAY,
    /* immediate */false);
    // `updateDirectories` joins providers and directories, which don't know anything about each
    // other. Debounce this call to reduce churn at startup, and when new providers get activated or
    // a new directory gets mounted.
    this._debouncedUpdateDirectories = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(function () {
      return _this._updateDirectories();
    }, UPDATE_DIRECTORIES_DEBOUNCE_DELAY,
    /* immediate */false);
    this._queryLruQueue = new Map();
    this._emitter = new (_atom2 || _atom()).Emitter();
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._dispatcher = (_QuickSelectionDispatcher2 || _QuickSelectionDispatcher()).default.getInstance();
    // Check is required for testing.
    if (atom.project) {
      this._subscriptions.add(atom.project.onDidChangePaths(this._debouncedUpdateDirectories.bind(this)));
      this._debouncedUpdateDirectories();
    }
    this._setupGkConfig();
    this._setUpFlux();
    this._activeProviderName = OMNISEARCH_PROVIDER.name;
  }

  _createClass(SearchResultManager, [{
    key: '_setupGkConfig',
    value: _asyncToGenerator(function* () {
      this._shouldRankProviders = false;
      this._shouldRankProviders = yield (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)(GK_BASIC_RANKED_OMNISEARCH);
    })
  }, {
    key: '_setUpFlux',
    value: function _setUpFlux() {
      var _this2 = this;

      this._dispatcherToken = this._dispatcher.register(function (action) {
        switch (action.actionType) {
          case (_QuickSelectionDispatcher2 || _QuickSelectionDispatcher()).default.ActionType.QUERY:
            _this2.executeQuery(action.query);
            break;
          case (_QuickSelectionDispatcher2 || _QuickSelectionDispatcher()).default.ActionType.ACTIVE_PROVIDER_CHANGED:
            _this2._activeProviderName = action.providerName;
            _this2._emitter.emit(PROVIDERS_CHANGED);
            break;
        }
      });
    }
  }, {
    key: 'getActiveProviderName',
    value: function getActiveProviderName() {
      return this._activeProviderName;
    }
  }, {
    key: 'getRendererForProvider',
    value: function getRendererForProvider(providerName) {
      var provider = this._getProviderByName(providerName);
      if (!provider || !provider.getComponentForItem) {
        return require('./FileResultComponent').getComponentForItem;
      }
      return provider.getComponentForItem;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._isDisposed = true;
      this._subscriptions.dispose();
    }

    /**
     * Renew the cached list of directories, as well as the cached map of eligible providers
     * for every directory.
     */
  }, {
    key: '_updateDirectories',
    value: _asyncToGenerator(function* () {
      var _this3 = this;

      var newDirectories = atom.project.getDirectories();
      var newProvidersByDirectories = new Map();
      var eligibilities = [];
      newDirectories.forEach(function (directory) {
        newProvidersByDirectories.set(directory, new Set());

        var _loop = function (provider) {
          (0, (_assert2 || _assert()).default)(provider.isEligibleForDirectory != null, 'Directory provider ' + provider.getName() + ' must provide `isEligibleForDirectory()`.');
          eligibilities.push(provider.isEligibleForDirectory(directory).then(function (isEligible) {
            return {
              isEligible: isEligible,
              provider: provider,
              directory: directory
            };
          }).catch(function (err) {
            (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().warn('isEligibleForDirectory failed for directory provider ' + provider.getName(), err);
            return {
              isEligible: false,
              provider: provider,
              directory: directory
            };
          }));
        };

        for (var provider of _this3._registeredProviders[DIRECTORY_KEY].values()) {
          _loop(provider);
        }
      });
      var resolvedEligibilities = yield Promise.all(eligibilities);
      for (var eligibility of resolvedEligibilities) {
        var provider = eligibility.provider;
        var isEligible = eligibility.isEligible;
        var directory = eligibility.directory;

        if (isEligible) {
          var providersForDirectory = newProvidersByDirectories.get(directory);
          (0, (_assert2 || _assert()).default)(providersForDirectory != null, 'Providers for directory ' + directory.getPath() + ' not defined');
          providersForDirectory.add(provider);
        }
      }
      this._directories = newDirectories;
      this._providersByDirectory = newProvidersByDirectories;
      this._emitter.emit(PROVIDERS_CHANGED);
    })
  }, {
    key: 'on',
    value: function on() {
      var _emitter;

      return (_emitter = this._emitter).on.apply(_emitter, arguments);
    }
  }, {
    key: 'registerProvider',
    value: function registerProvider(service) {
      var _this4 = this;

      if (!isValidProvider(service)) {
        var providerName = service.getName && service.getName() || '<unknown>';
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('Quick-open provider ' + providerName + ' is not a valid provider');
      }
      var isRenderableProvider = typeof service.isRenderable === 'function' && service.isRenderable();
      var isGlobalProvider = service.getProviderType() === 'GLOBAL';
      var targetRegistry = isGlobalProvider ? this._registeredProviders[GLOBAL_KEY] : this._registeredProviders[DIRECTORY_KEY];
      targetRegistry.set(service.getName(), service);
      if (!isGlobalProvider) {
        this._debouncedUpdateDirectories();
      }
      var disposable = new (_atom2 || _atom()).CompositeDisposable();
      disposable.add(new (_atom2 || _atom()).Disposable(function () {
        // This may be called after this package has been deactivated
        // and the SearchResultManager has been disposed.
        if (_this4._isDisposed) {
          return;
        }
        var serviceName = service.getName();
        targetRegistry.delete(serviceName);
        _this4._providersByDirectory.forEach(function (providers, dir) {
          providers.delete(service);
        });
        // Reset the active provider to omnisearch if the disposed service is
        // the current active provider.
        if (serviceName === _this4._activeProviderName) {
          _this4._activeProviderName = OMNISEARCH_PROVIDER.name;
        }
        _this4._removeResultsForProvider(serviceName);
        _this4._emitter.emit(PROVIDERS_CHANGED);
      }));
      // If the provider is renderable and specifies a keybinding, wire it up with the toggle command.
      if (isRenderableProvider && typeof service.getAction === 'function') {
        var toggleAction = service.getAction();
        // TODO replace with computed property once Flow supports it.
        var actionSpec = {};
        actionSpec[toggleAction] = function () {
          return (_QuickSelectionActions2 || _QuickSelectionActions()).default.changeActiveProvider(service.getName());
        };
        disposable.add(atom.commands.add('atom-workspace', actionSpec));
      }
      return disposable;
    }
  }, {
    key: '_removeResultsForProvider',
    value: function _removeResultsForProvider(providerName) {
      if (this._cachedResults[providerName]) {
        delete this._cachedResults[providerName];
        this._emitter.emit(RESULTS_CHANGED);
      }
      this._lastCachedQuery.delete(providerName);
    }
  }, {
    key: 'setCacheResult',
    value: function setCacheResult(providerName, directory, query, result) {
      var loading = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];
      var error = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];

      this.ensureCacheEntry(providerName, directory);
      this._cachedResults[providerName][directory][query] = {
        result: result,
        loading: loading,
        error: error
      };
      this._lastCachedQuery.set(providerName, query);
      // Refresh the usage for the current query.
      this._queryLruQueue.delete(query);
      this._queryLruQueue.set(query, null);
      setImmediate(this._debouncedCleanCache);
    }
  }, {
    key: 'ensureCacheEntry',
    value: function ensureCacheEntry(providerName, directory) {
      if (!this._cachedResults[providerName]) {
        this._cachedResults[providerName] = {};
      }
      if (!this._cachedResults[providerName][directory]) {
        this._cachedResults[providerName][directory] = {};
      }
    }
  }, {
    key: 'cacheResult',
    value: function cacheResult(query, result, directory, provider) {
      var providerName = provider.getName();
      this.setCacheResult(providerName, directory, query, result, false, null);
    }
  }, {
    key: '_setLoading',
    value: function _setLoading(query, directory, provider) {
      var providerName = provider.getName();
      this.ensureCacheEntry(providerName, directory);
      var previousResult = this._cachedResults[providerName][directory][query];
      if (!previousResult) {
        this._cachedResults[providerName][directory][query] = {
          result: [],
          error: null,
          loading: true
        };
      }
    }

    /**
     * Release the oldest cached results once the cache is full.
     */
  }, {
    key: '_cleanCache',
    value: function _cleanCache() {
      var _this5 = this;

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
        (0, (_assert2 || _assert()).default)(firstEntryKey != null);
        this._queryLruQueue.delete(firstEntryKey);
      }

      // For each (provider|directory) pair, remove results for all expired queries from the cache.
      for (var providerName in this._cachedResults) {
        var _loop2 = function (directory) {
          var queryResults = _this5._cachedResults[providerName][directory];
          expiredQueries.forEach(function (query) {
            return delete queryResults[query];
          });
        };

        for (var directory in this._cachedResults[providerName]) {
          _loop2(directory);
        }
      }
      this._emitter.emit(RESULTS_CHANGED);
    }
  }, {
    key: 'processResult',
    value: function processResult(query, result, directory, provider) {
      this.cacheResult.apply(this, arguments);
      this._emitter.emit(RESULTS_CHANGED);
    }
  }, {
    key: 'sanitizeQuery',
    value: function sanitizeQuery(query) {
      return query.trim();
    }
  }, {
    key: 'executeQuery',
    value: _asyncToGenerator(function* (rawQuery) {
      var _this6 = this;

      var query = this.sanitizeQuery(rawQuery);

      var _loop3 = function (globalProvider) {
        var startTime = performance.now();
        var loadingFn = function loadingFn() {
          _this6._setLoading(query, GLOBAL_KEY, globalProvider);
          _this6._emitter.emit(RESULTS_CHANGED);
        };
        (0, (_commonsNodePromise2 || _commonsNodePromise()).triggerAfterWait)(globalProvider.executeQuery(query), LOADING_EVENT_DELAY, loadingFn).then(function (result) {
          (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(AnalyticsEvents.QUERY_SOURCE_PROVIDER, {
            'quickopen-source-provider': globalProvider.getName(),
            'quickopen-query-duration': (performance.now() - startTime).toString(),
            'quickopen-result-count': result.length.toString()
          });
          _this6.processResult(query, result, GLOBAL_KEY, globalProvider);
        });
      };

      for (var globalProvider of this._registeredProviders[GLOBAL_KEY].values()) {
        _loop3(globalProvider);
      }
      if (this._providersByDirectory.size === 0) {
        return;
      }
      this._directories.forEach(function (directory) {
        var path = directory.getPath();
        var providers = _this6._providersByDirectory.get(directory);
        if (!providers) {
          // Special directories like "atom://about"
          return;
        }

        var _loop4 = function (directoryProvider) {
          var startTime = performance.now();
          var loadingFn = function loadingFn() {
            _this6._setLoading(query, path, directoryProvider);
            _this6._emitter.emit(RESULTS_CHANGED);
          };
          (0, (_commonsNodePromise2 || _commonsNodePromise()).triggerAfterWait)(directoryProvider.executeQuery(query, directory), LOADING_EVENT_DELAY, loadingFn).then(function (result) {
            (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(AnalyticsEvents.QUERY_SOURCE_PROVIDER, {
              'quickopen-source-provider': directoryProvider.getName(),
              'quickopen-query-duration': (performance.now() - startTime).toString(),
              'quickopen-result-count': result.length.toString()
            });
            _this6.processResult(query, result, path, directoryProvider);
          });
        };

        for (var directoryProvider of providers) {
          _loop4(directoryProvider);
        }
      });
    })
  }, {
    key: '_isGlobalProvider',
    value: function _isGlobalProvider(providerName) {
      return this._registeredProviders[GLOBAL_KEY].has(providerName);
    }
  }, {
    key: '_getProviderByName',
    value: function _getProviderByName(providerName) {
      var dirProviderName = undefined;
      if (this._isGlobalProvider(providerName)) {
        dirProviderName = this._registeredProviders[GLOBAL_KEY].get(providerName);
      } else {
        dirProviderName = this._registeredProviders[DIRECTORY_KEY].get(providerName);
      }
      (0, (_assert2 || _assert()).default)(dirProviderName != null, 'Provider ' + providerName + ' is not registered with quick-open.');
      return dirProviderName;
    }
  }, {
    key: '_getResultsForProvider',
    value: function _getResultsForProvider(query, providerName) {
      var _this7 = this;

      var providerPaths = this._isGlobalProvider(providerName) ? [GLOBAL_KEY] : this._directories.map(function (d) {
        return d.getPath();
      });
      var provider = this._getProviderByName(providerName);
      var lastCachedQuery = this._lastCachedQuery.get(providerName);
      return {
        title: provider.getTabTitle(),
        results: providerPaths.reduce(function (results, path) {
          var cachedPaths = undefined;
          var cachedQueries = undefined;
          var cachedResult = undefined;
          if (!((cachedPaths = _this7._cachedResults[providerName]) && (cachedQueries = cachedPaths[path]) && ((cachedResult = cachedQueries[query]) ||
          // If the current query hasn't returned anything yet, try the last cached result.
          lastCachedQuery != null && (cachedResult = cachedQueries[lastCachedQuery])))) {
            cachedResult = {};
          }
          var defaultResult = getDefaultResult();
          var resultList = cachedResult.result || defaultResult.results;
          results[path] = {
            results: resultList.map(function (result) {
              return _extends({}, result, { sourceProvider: providerName });
            }),
            loading: cachedResult.loading || defaultResult.loading,
            error: cachedResult.error || defaultResult.error
          };
          return results;
        }, {})
      };
    }
  }, {
    key: 'getResults',
    value: function getResults(query, activeProviderName) {
      var sanitizedQuery = this.sanitizeQuery(query);
      if (activeProviderName === OMNISEARCH_PROVIDER.name) {
        var omniSearchResults = [{}];
        for (var providerName in this._cachedResults) {
          var resultForProvider = this._getResultsForProvider(sanitizedQuery, providerName);
          // TODO replace this with a ranking algorithm.
          for (var dir in resultForProvider.results) {
            resultForProvider.results[dir].results = resultForProvider.results[dir].results.slice(0, MAX_OMNI_RESULTS_PER_SERVICE);
          }
          // TODO replace `partial` with computed property whenever Flow supports it.
          var _partial = {};
          _partial[providerName] = resultForProvider;
          omniSearchResults.push(_partial);
        }
        return Object.assign.apply(null, omniSearchResults);
      }
      // TODO replace `partial` with computed property whenever Flow supports it.
      var partial = {};
      partial[activeProviderName] = this._getResultsForProvider(sanitizedQuery, activeProviderName);
      return partial;
    }
  }, {
    key: 'getProviderByName',
    value: function getProviderByName(providerName) {
      if (providerName === OMNISEARCH_PROVIDER.name) {
        return _extends({}, OMNISEARCH_PROVIDER);
      }
      return this._bakeProvider(this._getProviderByName(providerName));
    }

    /**
     * Turn a Provider into a plain "spec" object consumed by QuickSelectionComponent.
     */
  }, {
    key: '_bakeProvider',
    value: function _bakeProvider(provider) {
      var providerName = provider.getName();
      var providerSpec = {
        action: provider.getAction && provider.getAction() || '',
        debounceDelay: typeof provider.getDebounceDelay === 'function' ? provider.getDebounceDelay() : DEFAULT_QUERY_DEBOUNCE_DELAY,
        name: providerName,
        prompt: provider.getPromptText && provider.getPromptText() || 'Search ' + providerName,
        title: provider.getTabTitle && provider.getTabTitle() || providerName
      };
      if (this._shouldRankProviders) {
        // $FlowIssue priority property is optional
        providerSpec.priority = typeof provider.getPriority === 'function' ? provider.getPriority() : Number.POSITIVE_INFINITY;
      }
      return providerSpec;
    }
  }, {
    key: 'getRenderableProviders',
    value: function getRenderableProviders() {
      var _this8 = this;

      // Only render tabs for providers that are eligible for at least one directory.
      var eligibleDirectoryProviders = Array.from(this._registeredProviders[DIRECTORY_KEY].values()).filter(function (provider) {
        for (var providers of _this8._providersByDirectory.values()) {
          if (providers.has(provider)) {
            return true;
          }
        }
        return false;
      });
      var tabs = Array.from(this._registeredProviders[GLOBAL_KEY].values()).concat(eligibleDirectoryProviders).filter(function (provider) {
        return provider.isRenderable();
      }).map(this._bakeProvider).sort(function (p1, p2) {
        return p1.name.localeCompare(p2.name);
      });
      tabs.unshift(OMNISEARCH_PROVIDER);
      return tabs;
    }
  }]);

  return SearchResultManager;
})();

exports.default = SearchResultManager;
var __test__ = {
  _getOmniSearchProviderSpec: function _getOmniSearchProviderSpec() {
    return OMNISEARCH_PROVIDER;
  }
};
exports.__test__ = __test__;

// Cache the last query with results for each provider.
// Display cached results for the last completed query until new data arrives.

// List of most recently used query strings, used for pruning the result cache.
// Makes use of `Map`'s insertion ordering, so values are irrelevant and always set to `null`.