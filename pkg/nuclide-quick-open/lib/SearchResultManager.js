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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideLogging = require('../../nuclide-logging');

var _atom = require('atom');

var _nuclideCommons = require('../../nuclide-commons');

var _QuickSelectionDispatcher = require('./QuickSelectionDispatcher');

var _QuickSelectionDispatcher2 = _interopRequireDefault(_QuickSelectionDispatcher);

var _QuickSelectionActions = require('./QuickSelectionActions');

var _QuickSelectionActions2 = _interopRequireDefault(_QuickSelectionActions);

var assign = Object.assign || require('object-assign');
var performance = global.performance;

function getDefaultResult() {
  return {
    error: null,
    loading: false,
    results: []
  };
}

var AnalyticsEvents = {
  QUERY_SOURCE_PROVIDER: 'quickopen-query-source-provider'
};

var RESULTS_CHANGED = 'results_changed';
var PROVIDERS_CHANGED = 'providers_changed';
var MAX_OMNI_RESULTS_PER_SERVICE = 5;
var DEFAULT_QUERY_DEBOUNCE_DELAY = 200;
var OMNISEARCH_PROVIDER = {
  action: 'nuclide-quick-open:find-anything-via-omni-search',
  debounceDelay: DEFAULT_QUERY_DEBOUNCE_DELAY,
  name: 'OmniSearchResultProvider',
  prompt: 'Search for anything...',
  title: 'OmniSearch'
};
// Number of elements in the cache before periodic cleanup kicks in. Includes partial query strings.
var MAX_CACHED_QUERIES = 100;
var CACHE_CLEAN_DEBOUNCE_DELAY = 5000;
var UPDATE_DIRECTORIES_DEBOUNCE_DELAY = 100;
var GLOBAL_KEY = 'global';
var DIRECTORY_KEY = 'directory';

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
    this._debouncedCleanCache = (0, _nuclideCommons.debounce)(function () {
      return _this._cleanCache();
    }, CACHE_CLEAN_DEBOUNCE_DELAY,
    /* immediate */false);
    // `updateDirectories` joins providers and directories, which don't know anything about each
    // other. Debounce this call to reduce churn at startup, and when new providers get activated or
    // a new directory gets mounted.
    this._debouncedUpdateDirectories = (0, _nuclideCommons.debounce)(function () {
      return _this._updateDirectories();
    }, UPDATE_DIRECTORIES_DEBOUNCE_DELAY,
    /* immediate */false);
    this._queryLruQueue = new Map();
    this._emitter = new _atom.Emitter();
    this._subscriptions = new _atom.CompositeDisposable();
    this._dispatcher = _QuickSelectionDispatcher2['default'].getInstance();
    // Check is required for testing.
    if (atom.project) {
      this._subscriptions.add(atom.project.onDidChangePaths(this._debouncedUpdateDirectories.bind(this)));
      this._debouncedUpdateDirectories();
    }
    this._setUpFlux();
    this._activeProviderName = OMNISEARCH_PROVIDER.name;
  }

  _createClass(SearchResultManager, [{
    key: '_setUpFlux',
    value: function _setUpFlux() {
      var _this2 = this;

      this._dispatcherToken = this._dispatcher.register(function (action) {
        switch (action.actionType) {
          case _QuickSelectionDispatcher2['default'].ActionType.QUERY:
            _this2.executeQuery(action.query);
            break;
          case _QuickSelectionDispatcher2['default'].ActionType.ACTIVE_PROVIDER_CHANGED:
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
          (0, _assert2['default'])(provider.isEligibleForDirectory != null, 'Directory provider ' + provider.getName() + ' must provide `isEligibleForDirectory()`.');
          eligibilities.push(provider.isEligibleForDirectory(directory).then(function (isEligible) {
            return {
              isEligible: isEligible,
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
          (0, _assert2['default'])(providersForDirectory != null, 'Providers for directory ' + directory + ' not defined');
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
        (0, _nuclideLogging.getLogger)().error('Quick-open provider ' + providerName + ' is not a valid provider');
      }
      var isRenderableProvider = typeof service.isRenderable === 'function' && service.isRenderable();
      var isGlobalProvider = service.getProviderType() === 'GLOBAL';
      var targetRegistry = isGlobalProvider ? this._registeredProviders[GLOBAL_KEY] : this._registeredProviders[DIRECTORY_KEY];
      targetRegistry.set(service.getName(), service);
      if (!isGlobalProvider) {
        this._debouncedUpdateDirectories();
      }
      var disposable = new _atom.CompositeDisposable();
      disposable.add(new _atom.Disposable(function () {
        // This may be called after this package has been deactivated
        // and the SearchResultManager has been disposed.
        if (_this4._isDisposed) {
          return;
        }
        var serviceName = service.getName();
        targetRegistry['delete'](serviceName);
        _this4._providersByDirectory.forEach(function (providers, dir) {
          providers['delete'](service);
        });
        _this4._removeResultsForProvider(serviceName);
        _this4._emitter.emit(PROVIDERS_CHANGED);
      }));
      // If the provider is renderable and specifies a keybinding, wire it up with the toggle command.
      if (isRenderableProvider && typeof service.getAction === 'function') {
        var toggleAction = service.getAction();
        // TODO replace with computed property once Flow supports it.
        var actionSpec = {};
        actionSpec[toggleAction] = function () {
          return _QuickSelectionActions2['default'].changeActiveProvider(service.getName());
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
      // Refresh the usage for the current query.
      this._queryLruQueue['delete'](query);
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
        (0, _assert2['default'])(firstEntryKey != null);
        this._queryLruQueue['delete'](firstEntryKey);
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
        globalProvider.executeQuery(query).then(function (result) {
          (0, _nuclideAnalytics.track)(AnalyticsEvents.QUERY_SOURCE_PROVIDER, {
            'quickopen-source-provider': globalProvider.getName(),
            'quickopen-query-duration': (performance.now() - startTime).toString(),
            'quickopen-result-count': result.length.toString()
          });
          _this6.processResult(query, result, GLOBAL_KEY, globalProvider);
        });
        _this6._setLoading(query, GLOBAL_KEY, globalProvider);
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
          directoryProvider.executeQuery(query, directory).then(function (result) {
            (0, _nuclideAnalytics.track)(AnalyticsEvents.QUERY_SOURCE_PROVIDER, {
              'quickopen-source-provider': directoryProvider.getName(),
              'quickopen-query-duration': (performance.now() - startTime).toString(),
              'quickopen-result-count': result.length.toString()
            });
            _this6.processResult(query, result, path, directoryProvider);
          });
          _this6._setLoading(query, path, directoryProvider);
        };

        for (var directoryProvider of providers) {
          _loop4(directoryProvider);
        }
      });
      this._emitter.emit(RESULTS_CHANGED);
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
      (0, _assert2['default'])(dirProviderName != null, 'Provider ' + providerName + ' is not registered with quick-open.');
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
      return {
        title: provider.getTabTitle(),
        results: providerPaths.reduce(function (results, path) {
          var cachedPaths = undefined,
              cachedQueries = undefined,
              cachedResult = undefined;
          if (!((cachedPaths = _this7._cachedResults[providerName]) && (cachedQueries = cachedPaths[path]) && (cachedResult = cachedQueries[query]))) {
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
        return assign.apply({}, omniSearchResults);
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
      return {
        action: provider.getAction && provider.getAction() || '',
        debounceDelay: typeof provider.getDebounceDelay === 'function' ? provider.getDebounceDelay() : DEFAULT_QUERY_DEBOUNCE_DELAY,
        name: providerName,
        prompt: provider.getPromptText && provider.getPromptText() || 'Search ' + providerName,
        title: provider.getTabTitle && provider.getTabTitle() || providerName
      };
    }
  }, {
    key: 'getRenderableProviders',
    value: function getRenderableProviders() {
      var _this8 = this;

      // Only render tabs for providers that are eligible for at least one directory.
      var eligibleDirectoryProviders = _nuclideCommons.array.from(this._registeredProviders[DIRECTORY_KEY].values()).filter(function (provider) {
        for (var providers of _this8._providersByDirectory.values()) {
          if (providers.has(provider)) {
            return true;
          }
        }
        return false;
      });
      var tabs = _nuclideCommons.array.from(this._registeredProviders[GLOBAL_KEY].values()).concat(eligibleDirectoryProviders).filter(function (provider) {
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

exports['default'] = SearchResultManager;
var __test__ = {
  _getOmniSearchProviderSpec: function _getOmniSearchProviderSpec() {
    return OMNISEARCH_PROVIDER;
  }
};
exports.__test__ = __test__;

// List of most recently used query strings, used for pruning the result cache.
// Makes use of `Map`'s insertion ordering, so values are irrelevant and always set to `null`.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlYXJjaFJlc3VsdE1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkF5QnNCLFFBQVE7Ozs7Z0NBQ1YseUJBQXlCOzs4QkFDckIsdUJBQXVCOztvQkFLeEMsTUFBTTs7OEJBSU4sdUJBQXVCOzt3Q0FDTyw0QkFBNEI7Ozs7cUNBQy9CLHlCQUF5Qjs7OztBQUUzRCxJQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNsRCxXQUFXLEdBQUksTUFBTSxDQUFyQixXQUFXOztBQUVsQixTQUFTLGdCQUFnQixHQUFtQjtBQUMxQyxTQUFPO0FBQ0wsU0FBSyxFQUFFLElBQUk7QUFDWCxXQUFPLEVBQUUsS0FBSztBQUNkLFdBQU8sRUFBRSxFQUFFO0dBQ1osQ0FBQztDQUNIOztBQUVELElBQU0sZUFBZSxHQUFHO0FBQ3RCLHVCQUFxQixFQUFFLGlDQUFpQztDQUN6RCxDQUFDOztBQUVGLElBQU0sZUFBZSxHQUFHLGlCQUFpQixDQUFDO0FBQzFDLElBQU0saUJBQWlCLEdBQUcsbUJBQW1CLENBQUM7QUFDOUMsSUFBTSw0QkFBNEIsR0FBRyxDQUFDLENBQUM7QUFDdkMsSUFBTSw0QkFBNEIsR0FBRyxHQUFHLENBQUM7QUFDekMsSUFBTSxtQkFBbUIsR0FBRztBQUMxQixRQUFNLEVBQUUsa0RBQWtEO0FBQzFELGVBQWEsRUFBRSw0QkFBNEI7QUFDM0MsTUFBSSxFQUFFLDBCQUEwQjtBQUNoQyxRQUFNLEVBQUUsd0JBQXdCO0FBQ2hDLE9BQUssRUFBRSxZQUFZO0NBQ3BCLENBQUM7O0FBRUYsSUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUM7QUFDL0IsSUFBTSwwQkFBMEIsR0FBRyxJQUFJLENBQUM7QUFDeEMsSUFBTSxpQ0FBaUMsR0FBRyxHQUFHLENBQUM7QUFDOUMsSUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDO0FBQzVCLElBQU0sYUFBYSxHQUFHLFdB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bUIsQ0FBQyxDQUFDO0FBQ2xDLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztTQWxiRyxtQkFBbUI7OztxQkFzYlYsbUJBQW1CO0FBRTNCLElBQU0sUUFBUSxHQUFHO0FBQ3RCLDRCQUEwQixFQUFBLHNDQUFpQjtBQUN6QyxXQUFPLG1CQUFtQixDQUFDO0dBQzVCO0NBQ0YsQ0FBQyIsImZpbGUiOiJTZWFyY2hSZXN1bHRNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBQcm92aWRlclNwZWMsXG59IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVSZXN1bHQsXG4gIFByb3ZpZGVyLFxuICBQcm92aWRlclJlc3VsdCxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1xdWljay1vcGVuLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5cbnR5cGUgUmVzdWx0UmVuZGVyZXIgPSAoaXRlbTogRmlsZVJlc3VsdCwgc2VydmljZU5hbWU6IHN0cmluZywgZGlyTmFtZTogc3RyaW5nKSA9PiBSZWFjdEVsZW1lbnQ7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHtcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgRGlzcG9zYWJsZSxcbiAgRW1pdHRlcixcbn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBhcnJheSxcbiAgZGVib3VuY2UsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgUXVpY2tTZWxlY3Rpb25EaXNwYXRjaGVyIGZyb20gJy4vUXVpY2tTZWxlY3Rpb25EaXNwYXRjaGVyJztcbmltcG9ydCBRdWlja1NlbGVjdGlvbkFjdGlvbnMgZnJvbSAnLi9RdWlja1NlbGVjdGlvbkFjdGlvbnMnO1xuXG5jb25zdCBhc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IHJlcXVpcmUoJ29iamVjdC1hc3NpZ24nKTtcbmNvbnN0IHtwZXJmb3JtYW5jZX0gPSBnbG9iYWw7XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRSZXN1bHQoKTogUHJvdmlkZXJSZXN1bHQge1xuICByZXR1cm4ge1xuICAgIGVycm9yOiBudWxsLFxuICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgIHJlc3VsdHM6IFtdLFxuICB9O1xufVxuXG5jb25zdCBBbmFseXRpY3NFdmVudHMgPSB7XG4gIFFVRVJZX1NPVVJDRV9QUk9WSURFUjogJ3F1aWNrb3Blbi1xdWVyeS1zb3VyY2UtcHJvdmlkZXInLFxufTtcblxuY29uc3QgUkVTVUxUU19DSEFOR0VEID0gJ3Jlc3VsdHNfY2hhbmdlZCc7XG5jb25zdCBQUk9WSURFUlNfQ0hBTkdFRCA9ICdwcm92aWRlcnNfY2hhbmdlZCc7XG5jb25zdCBNQVhfT01OSV9SRVNVTFRTX1BFUl9TRVJWSUNFID0gNTtcbmNvbnN0IERFRkFVTFRfUVVFUllfREVCT1VOQ0VfREVMQVkgPSAyMDA7XG5jb25zdCBPTU5JU0VBUkNIX1BST1ZJREVSID0ge1xuICBhY3Rpb246ICdudWNsaWRlLXF1aWNrLW9wZW46ZmluZC1hbnl0aGluZy12aWEtb21uaS1zZWFyY2gnLFxuICBkZWJvdW5jZURlbGF5OiBERUZBVUxUX1FVRVJZX0RFQk9VTkNFX0RFTEFZLFxuICBuYW1lOiAnT21uaVNlYXJjaFJlc3VsdFByb3ZpZGVyJyxcbiAgcHJvbXB0OiAnU2VhcmNoIGZvciBhbnl0aGluZy4uLicsXG4gIHRpdGxlOiAnT21uaVNlYXJjaCcsXG59O1xuLy8gTnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoZSBjYWNoZSBiZWZvcmUgcGVyaW9kaWMgY2xlYW51cCBraWNrcyBpbi4gSW5jbHVkZXMgcGFydGlhbCBxdWVyeSBzdHJpbmdzLlxuY29uc3QgTUFYX0NBQ0hFRF9RVUVSSUVTID0gMTAwO1xuY29uc3QgQ0FDSEVfQ0xFQU5fREVCT1VOQ0VfREVMQVkgPSA1MDAwO1xuY29uc3QgVVBEQVRFX0RJUkVDVE9SSUVTX0RFQk9VTkNFX0RFTEFZID0gMTAwO1xuY29uc3QgR0xPQkFMX0tFWSA9ICdnbG9iYWwnO1xuY29uc3QgRElSRUNUT1JZX0tFWSA9ICdkaXJlY3RvcnknO1xuXG5mdW5jdGlvbiBpc1ZhbGlkUHJvdmlkZXIocHJvdmlkZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2YgcHJvdmlkZXIuZ2V0UHJvdmlkZXJUeXBlID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb3ZpZGVyLmdldE5hbWUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHByb3ZpZGVyLmdldE5hbWUoKSA9PT0gJ3N0cmluZycgJiZcbiAgICB0eXBlb2YgcHJvdmlkZXIuaXNSZW5kZXJhYmxlID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb3ZpZGVyLmV4ZWN1dGVRdWVyeSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm92aWRlci5nZXRUYWJUaXRsZSA9PT0gJ2Z1bmN0aW9uJ1xuICApO1xufVxuXG5sZXQgc2VhcmNoUmVzdWx0TWFuYWdlckluc3RhbmNlID0gbnVsbDtcbi8qKlxuICogQSBzaW5nbGV0b24gY2FjaGUgZm9yIHNlYXJjaCBwcm92aWRlcnMgYW5kIHJlc3VsdHMuXG4gKi9cbmNsYXNzIFNlYXJjaFJlc3VsdE1hbmFnZXIge1xuICBfZGlzcGF0Y2hlclRva2VuOiBzdHJpbmc7XG4gIFJFU1VMVFNfQ0hBTkdFRDogc3RyaW5nO1xuICBQUk9WSURFUlNfQ0hBTkdFRDogc3RyaW5nO1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX3Byb3ZpZGVyc0J5RGlyZWN0b3J5OiBNYXA8YXRvbSREaXJlY3RvcnksIFNldDxQcm92aWRlcj4+O1xuICBfZGlyZWN0b3JpZXM6IEFycmF5PGF0b20kRGlyZWN0b3J5PjtcbiAgX2NhY2hlZFJlc3VsdHM6IE9iamVjdDtcbiAgLy8gTGlzdCBvZiBtb3N0IHJlY2VudGx5IHVzZWQgcXVlcnkgc3RyaW5ncywgdXNlZCBmb3IgcHJ1bmluZyB0aGUgcmVzdWx0IGNhY2hlLlxuICAvLyBNYWtlcyB1c2Ugb2YgYE1hcGAncyBpbnNlcnRpb24gb3JkZXJpbmcsIHNvIHZhbHVlcyBhcmUgaXJyZWxldmFudCBhbmQgYWx3YXlzIHNldCB0byBgbnVsbGAuXG4gIF9xdWVyeUxydVF1ZXVlOiBNYXA8c3RyaW5nLCA/TnVtYmVyPjtcbiAgX2RlYm91bmNlZENsZWFuQ2FjaGU6IEZ1bmN0aW9uO1xuICBfZGVib3VuY2VkVXBkYXRlRGlyZWN0b3JpZXM6IEZ1bmN0aW9uO1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9yZWdpc3RlcmVkUHJvdmlkZXJzOiB7W2tleTogc3RyaW5nXTogTWFwPHN0cmluZywgUHJvdmlkZXI+O307XG4gIF9hY3RpdmVQcm92aWRlck5hbWU6IHN0cmluZztcbiAgX2lzRGlzcG9zZWQ6IGJvb2xlYW47XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKCk6IFNlYXJjaFJlc3VsdE1hbmFnZXIge1xuICAgIGlmICghc2VhcmNoUmVzdWx0TWFuYWdlckluc3RhbmNlKSB7XG4gICAgICBzZWFyY2hSZXN1bHRNYW5hZ2VySW5zdGFuY2UgPSBuZXcgU2VhcmNoUmVzdWx0TWFuYWdlcigpO1xuICAgIH1cbiAgICByZXR1cm4gc2VhcmNoUmVzdWx0TWFuYWdlckluc3RhbmNlO1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5faXNEaXNwb3NlZCA9IGZhbHNlO1xuICAgIHRoaXMuUkVTVUxUU19DSEFOR0VEID0gUkVTVUxUU19DSEFOR0VEO1xuICAgIHRoaXMuUFJPVklERVJTX0NIQU5HRUQgPSBQUk9WSURFUlNfQ0hBTkdFRDtcbiAgICB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzID0ge307XG4gICAgdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVyc1tESVJFQ1RPUllfS0VZXSA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzW0dMT0JBTF9LRVldID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3Byb3ZpZGVyc0J5RGlyZWN0b3J5ID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2RpcmVjdG9yaWVzID0gW107XG4gICAgdGhpcy5fY2FjaGVkUmVzdWx0cyA9IHt9O1xuICAgIHRoaXMuX2RlYm91bmNlZENsZWFuQ2FjaGUgPSBkZWJvdW5jZShcbiAgICAgICgpID0+IHRoaXMuX2NsZWFuQ2FjaGUoKSxcbiAgICAgIENBQ0hFX0NMRUFOX0RFQk9VTkNFX0RFTEFZLFxuICAgICAgLyogaW1tZWRpYXRlICovZmFsc2VcbiAgICApO1xuICAgIC8vIGB1cGRhdGVEaXJlY3Rvcmllc2Agam9pbnMgcHJvdmlkZXJzIGFuZCBkaXJlY3Rvcmllcywgd2hpY2ggZG9uJ3Qga25vdyBhbnl0aGluZyBhYm91dCBlYWNoXG4gICAgLy8gb3RoZXIuIERlYm91bmNlIHRoaXMgY2FsbCB0byByZWR1Y2UgY2h1cm4gYXQgc3RhcnR1cCwgYW5kIHdoZW4gbmV3IHByb3ZpZGVycyBnZXQgYWN0aXZhdGVkIG9yXG4gICAgLy8gYSBuZXcgZGlyZWN0b3J5IGdldHMgbW91bnRlZC5cbiAgICB0aGlzLl9kZWJvdW5jZWRVcGRhdGVEaXJlY3RvcmllcyA9IGRlYm91bmNlKFxuICAgICAgKCkgPT4gdGhpcy5fdXBkYXRlRGlyZWN0b3JpZXMoKSxcbiAgICAgIFVQREFURV9ESVJFQ1RPUklFU19ERUJPVU5DRV9ERUxBWSxcbiAgICAgIC8qIGltbWVkaWF0ZSAqL2ZhbHNlXG4gICAgKTtcbiAgICB0aGlzLl9xdWVyeUxydVF1ZXVlID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBRdWlja1NlbGVjdGlvbkRpc3BhdGNoZXIuZ2V0SW5zdGFuY2UoKTtcbiAgICAvLyBDaGVjayBpcyByZXF1aXJlZCBmb3IgdGVzdGluZy5cbiAgICBpZiAoYXRvbS5wcm9qZWN0KSB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyhcbiAgICAgICAgdGhpcy5fZGVib3VuY2VkVXBkYXRlRGlyZWN0b3JpZXMuYmluZCh0aGlzKSlcbiAgICAgICk7XG4gICAgICB0aGlzLl9kZWJvdW5jZWRVcGRhdGVEaXJlY3RvcmllcygpO1xuICAgIH1cbiAgICB0aGlzLl9zZXRVcEZsdXgoKTtcbiAgICB0aGlzLl9hY3RpdmVQcm92aWRlck5hbWUgPSBPTU5JU0VBUkNIX1BST1ZJREVSLm5hbWU7XG4gIH1cblxuICBfc2V0VXBGbHV4KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXJUb2tlbiA9IHRoaXMuX2Rpc3BhdGNoZXIucmVnaXN0ZXIoYWN0aW9uID0+IHtcbiAgICAgIHN3aXRjaCAoYWN0aW9uLmFjdGlvblR5cGUpIHtcbiAgICAgICAgY2FzZSBRdWlja1NlbGVjdGlvbkRpc3BhdGNoZXIuQWN0aW9uVHlwZS5RVUVSWTpcbiAgICAgICAgICB0aGlzLmV4ZWN1dGVRdWVyeShhY3Rpb24ucXVlcnkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlci5BY3Rpb25UeXBlLkFDVElWRV9QUk9WSURFUl9DSEFOR0VEOlxuICAgICAgICAgIHRoaXMuX2FjdGl2ZVByb3ZpZGVyTmFtZSA9IGFjdGlvbi5wcm92aWRlck5hbWU7XG4gICAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KFBST1ZJREVSU19DSEFOR0VEKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldEFjdGl2ZVByb3ZpZGVyTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVQcm92aWRlck5hbWU7XG4gIH1cblxuICBnZXRSZW5kZXJlckZvclByb3ZpZGVyKHByb3ZpZGVyTmFtZTogc3RyaW5nKTogUmVzdWx0UmVuZGVyZXIge1xuICAgIGNvbnN0IHByb3ZpZGVyID0gdGhpcy5fZ2V0UHJvdmlkZXJCeU5hbWUocHJvdmlkZXJOYW1lKTtcbiAgICBpZiAoIXByb3ZpZGVyIHx8ICFwcm92aWRlci5nZXRDb21wb25lbnRGb3JJdGVtKSB7XG4gICAgICByZXR1cm4gcmVxdWlyZSgnLi9GaWxlUmVzdWx0Q29tcG9uZW50JykuZ2V0Q29tcG9uZW50Rm9ySXRlbTtcbiAgICB9XG4gICAgcmV0dXJuIHByb3ZpZGVyLmdldENvbXBvbmVudEZvckl0ZW07XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmV3IHRoZSBjYWNoZWQgbGlzdCBvZiBkaXJlY3RvcmllcywgYXMgd2VsbCBhcyB0aGUgY2FjaGVkIG1hcCBvZiBlbGlnaWJsZSBwcm92aWRlcnNcbiAgICogZm9yIGV2ZXJ5IGRpcmVjdG9yeS5cbiAgICovXG4gIGFzeW5jIF91cGRhdGVEaXJlY3RvcmllcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBuZXdEaXJlY3RvcmllcyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpO1xuICAgIGNvbnN0IG5ld1Byb3ZpZGVyc0J5RGlyZWN0b3JpZXMgPSBuZXcgTWFwKCk7XG4gICAgY29uc3QgZWxpZ2liaWxpdGllcyA9IFtdO1xuICAgIG5ld0RpcmVjdG9yaWVzLmZvckVhY2goZGlyZWN0b3J5ID0+IHtcbiAgICAgIG5ld1Byb3ZpZGVyc0J5RGlyZWN0b3JpZXMuc2V0KGRpcmVjdG9yeSwgbmV3IFNldCgpKTtcbiAgICAgIGZvciAoY29uc3QgcHJvdmlkZXIgb2YgdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVyc1tESVJFQ1RPUllfS0VZXS52YWx1ZXMoKSkge1xuICAgICAgICBpbnZhcmlhbnQoXG4gICAgICAgICAgcHJvdmlkZXIuaXNFbGlnaWJsZUZvckRpcmVjdG9yeSAhPSBudWxsLFxuICAgICAgICAgIGBEaXJlY3RvcnkgcHJvdmlkZXIgJHtwcm92aWRlci5nZXROYW1lKCl9IG11c3QgcHJvdmlkZSBcXGBpc0VsaWdpYmxlRm9yRGlyZWN0b3J5KClcXGAuYFxuICAgICAgICApO1xuICAgICAgICBlbGlnaWJpbGl0aWVzLnB1c2goXG4gICAgICAgICAgcHJvdmlkZXIuaXNFbGlnaWJsZUZvckRpcmVjdG9yeShkaXJlY3RvcnkpLnRoZW4oaXNFbGlnaWJsZSA9PiAoe1xuICAgICAgICAgICAgaXNFbGlnaWJsZSxcbiAgICAgICAgICAgIHByb3ZpZGVyLFxuICAgICAgICAgICAgZGlyZWN0b3J5LFxuICAgICAgICAgIH0pKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IHJlc29sdmVkRWxpZ2liaWxpdGllcyA9IGF3YWl0IFByb21pc2UuYWxsKGVsaWdpYmlsaXRpZXMpO1xuICAgIGZvciAoY29uc3QgZWxpZ2liaWxpdHkgb2YgcmVzb2x2ZWRFbGlnaWJpbGl0aWVzKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHByb3ZpZGVyLFxuICAgICAgICBpc0VsaWdpYmxlLFxuICAgICAgICBkaXJlY3RvcnksXG4gICAgICB9ID0gZWxpZ2liaWxpdHk7XG4gICAgICBpZiAoaXNFbGlnaWJsZSkge1xuICAgICAgICBjb25zdCBwcm92aWRlcnNGb3JEaXJlY3RvcnkgPSBuZXdQcm92aWRlcnNCeURpcmVjdG9yaWVzLmdldChkaXJlY3RvcnkpO1xuICAgICAgICBpbnZhcmlhbnQoXG4gICAgICAgICAgcHJvdmlkZXJzRm9yRGlyZWN0b3J5ICE9IG51bGwsXG4gICAgICAgICAgYFByb3ZpZGVycyBmb3IgZGlyZWN0b3J5ICR7ZGlyZWN0b3J5fSBub3QgZGVmaW5lZGBcbiAgICAgICAgKTtcbiAgICAgICAgcHJvdmlkZXJzRm9yRGlyZWN0b3J5LmFkZChwcm92aWRlcik7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2RpcmVjdG9yaWVzID0gbmV3RGlyZWN0b3JpZXM7XG4gICAgdGhpcy5fcHJvdmlkZXJzQnlEaXJlY3RvcnkgPSBuZXdQcm92aWRlcnNCeURpcmVjdG9yaWVzO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChQUk9WSURFUlNfQ0hBTkdFRCk7XG4gIH1cblxuICBvbigpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oLi4uYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJlZ2lzdGVyUHJvdmlkZXIoc2VydmljZTogUHJvdmlkZXIpOiBJRGlzcG9zYWJsZSB7XG4gICAgaWYgKCFpc1ZhbGlkUHJvdmlkZXIoc2VydmljZSkpIHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyTmFtZSA9IHNlcnZpY2UuZ2V0TmFtZSAmJiBzZXJ2aWNlLmdldE5hbWUoKSB8fCAnPHVua25vd24+JztcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGBRdWljay1vcGVuIHByb3ZpZGVyICR7cHJvdmlkZXJOYW1lfSBpcyBub3QgYSB2YWxpZCBwcm92aWRlcmApO1xuICAgIH1cbiAgICBjb25zdCBpc1JlbmRlcmFibGVQcm92aWRlciA9XG4gICAgICB0eXBlb2Ygc2VydmljZS5pc1JlbmRlcmFibGUgPT09ICdmdW5jdGlvbicgJiYgc2VydmljZS5pc1JlbmRlcmFibGUoKTtcbiAgICBjb25zdCBpc0dsb2JhbFByb3ZpZGVyID0gc2VydmljZS5nZXRQcm92aWRlclR5cGUoKSA9PT0gJ0dMT0JBTCc7XG4gICAgY29uc3QgdGFyZ2V0UmVnaXN0cnkgPSBpc0dsb2JhbFByb3ZpZGVyXG4gICAgICA/IHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnNbR0xPQkFMX0tFWV1cbiAgICAgIDogdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVyc1tESVJFQ1RPUllfS0VZXTtcbiAgICB0YXJnZXRSZWdpc3RyeS5zZXQoc2VydmljZS5nZXROYW1lKCksIHNlcnZpY2UpO1xuICAgIGlmICghaXNHbG9iYWxQcm92aWRlcikge1xuICAgICAgdGhpcy5fZGVib3VuY2VkVXBkYXRlRGlyZWN0b3JpZXMoKTtcbiAgICB9XG4gICAgY29uc3QgZGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgZGlzcG9zYWJsZS5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgLy8gVGhpcyBtYXkgYmUgY2FsbGVkIGFmdGVyIHRoaXMgcGFja2FnZSBoYXMgYmVlbiBkZWFjdGl2YXRlZFxuICAgICAgLy8gYW5kIHRoZSBTZWFyY2hSZXN1bHRNYW5hZ2VyIGhhcyBiZWVuIGRpc3Bvc2VkLlxuICAgICAgaWYgKHRoaXMuX2lzRGlzcG9zZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3Qgc2VydmljZU5hbWUgPSBzZXJ2aWNlLmdldE5hbWUoKTtcbiAgICAgIHRhcmdldFJlZ2lzdHJ5LmRlbGV0ZShzZXJ2aWNlTmFtZSk7XG4gICAgICB0aGlzLl9wcm92aWRlcnNCeURpcmVjdG9yeS5mb3JFYWNoKChwcm92aWRlcnMsIGRpcikgPT4ge1xuICAgICAgICBwcm92aWRlcnMuZGVsZXRlKHNlcnZpY2UpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9yZW1vdmVSZXN1bHRzRm9yUHJvdmlkZXIoc2VydmljZU5hbWUpO1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KFBST1ZJREVSU19DSEFOR0VEKTtcbiAgICB9KSk7XG4gICAgLy8gSWYgdGhlIHByb3ZpZGVyIGlzIHJlbmRlcmFibGUgYW5kIHNwZWNpZmllcyBhIGtleWJpbmRpbmcsIHdpcmUgaXQgdXAgd2l0aCB0aGUgdG9nZ2xlIGNvbW1hbmQuXG4gICAgaWYgKGlzUmVuZGVyYWJsZVByb3ZpZGVyICYmIHR5cGVvZiBzZXJ2aWNlLmdldEFjdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc3QgdG9nZ2xlQWN0aW9uOiBzdHJpbmcgPSBzZXJ2aWNlLmdldEFjdGlvbigpO1xuICAgICAgLy8gVE9ETyByZXBsYWNlIHdpdGggY29tcHV0ZWQgcHJvcGVydHkgb25jZSBGbG93IHN1cHBvcnRzIGl0LlxuICAgICAgY29uc3QgYWN0aW9uU3BlYyA9IHt9O1xuICAgICAgYWN0aW9uU3BlY1t0b2dnbGVBY3Rpb25dID1cbiAgICAgICAgKCkgPT4gUXVpY2tTZWxlY3Rpb25BY3Rpb25zLmNoYW5nZUFjdGl2ZVByb3ZpZGVyKHNlcnZpY2UuZ2V0TmFtZSgpKTtcbiAgICAgIGRpc3Bvc2FibGUuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIGFjdGlvblNwZWMpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRpc3Bvc2FibGU7XG4gIH1cblxuICBfcmVtb3ZlUmVzdWx0c0ZvclByb3ZpZGVyKHByb3ZpZGVyTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NhY2hlZFJlc3VsdHNbcHJvdmlkZXJOYW1lXSkge1xuICAgICAgZGVsZXRlIHRoaXMuX2NhY2hlZFJlc3VsdHNbcHJvdmlkZXJOYW1lXTtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChSRVNVTFRTX0NIQU5HRUQpO1xuICAgIH1cbiAgfVxuXG4gIHNldENhY2hlUmVzdWx0KFxuICAgIHByb3ZpZGVyTmFtZTogc3RyaW5nLFxuICAgIGRpcmVjdG9yeTogc3RyaW5nLFxuICAgIHF1ZXJ5OiBzdHJpbmcsXG4gICAgcmVzdWx0OiBBcnJheTxGaWxlUmVzdWx0PixcbiAgICBsb2FkaW5nOiA/Ym9vbGVhbiA9IGZhbHNlLFxuICAgIGVycm9yOiA/T2JqZWN0ID0gbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuZW5zdXJlQ2FjaGVFbnRyeShwcm92aWRlck5hbWUsIGRpcmVjdG9yeSk7XG4gICAgdGhpcy5fY2FjaGVkUmVzdWx0c1twcm92aWRlck5hbWVdW2RpcmVjdG9yeV1bcXVlcnldID0ge1xuICAgICAgcmVzdWx0LFxuICAgICAgbG9hZGluZyxcbiAgICAgIGVycm9yLFxuICAgIH07XG4gICAgLy8gUmVmcmVzaCB0aGUgdXNhZ2UgZm9yIHRoZSBjdXJyZW50IHF1ZXJ5LlxuICAgIHRoaXMuX3F1ZXJ5THJ1UXVldWUuZGVsZXRlKHF1ZXJ5KTtcbiAgICB0aGlzLl9xdWVyeUxydVF1ZXVlLnNldChxdWVyeSwgbnVsbCk7XG4gICAgc2V0SW1tZWRpYXRlKHRoaXMuX2RlYm91bmNlZENsZWFuQ2FjaGUpO1xuICB9XG5cbiAgZW5zdXJlQ2FjaGVFbnRyeShwcm92aWRlck5hbWU6IHN0cmluZywgZGlyZWN0b3J5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2NhY2hlZFJlc3VsdHNbcHJvdmlkZXJOYW1lXSkge1xuICAgICAgdGhpcy5fY2FjaGVkUmVzdWx0c1twcm92aWRlck5hbWVdID0ge307XG4gICAgfVxuICAgIGlmICghdGhpcy5fY2FjaGVkUmVzdWx0c1twcm92aWRlck5hbWVdW2RpcmVjdG9yeV0pIHtcbiAgICAgIHRoaXMuX2NhY2hlZFJlc3VsdHNbcHJvdmlkZXJOYW1lXVtkaXJlY3RvcnldID0ge307XG4gICAgfVxuICB9XG5cbiAgY2FjaGVSZXN1bHQocXVlcnk6IHN0cmluZywgcmVzdWx0OiBBcnJheTxGaWxlUmVzdWx0PiwgZGlyZWN0b3J5OiBzdHJpbmcsIHByb3ZpZGVyOiBPYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCBwcm92aWRlck5hbWUgPSBwcm92aWRlci5nZXROYW1lKCk7XG4gICAgdGhpcy5zZXRDYWNoZVJlc3VsdChwcm92aWRlck5hbWUsIGRpcmVjdG9yeSwgcXVlcnksIHJlc3VsdCwgZmFsc2UsIG51bGwpO1xuICB9XG5cbiAgX3NldExvYWRpbmcocXVlcnk6IHN0cmluZywgZGlyZWN0b3J5OiBzdHJpbmcsIHByb3ZpZGVyOiBPYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCBwcm92aWRlck5hbWUgPSBwcm92aWRlci5nZXROYW1lKCk7XG4gICAgdGhpcy5lbnN1cmVDYWNoZUVudHJ5KHByb3ZpZGVyTmFtZSwgZGlyZWN0b3J5KTtcbiAgICBjb25zdCBwcmV2aW91c1Jlc3VsdCA9IHRoaXMuX2NhY2hlZFJlc3VsdHNbcHJvdmlkZXJOYW1lXVtkaXJlY3RvcnldW3F1ZXJ5XTtcbiAgICBpZiAoIXByZXZpb3VzUmVzdWx0KSB7XG4gICAgICB0aGlzLl9jYWNoZWRSZXN1bHRzW3Byb3ZpZGVyTmFtZV1bZGlyZWN0b3J5XVtxdWVyeV0gPSB7XG4gICAgICAgIHJlc3VsdDogW10sXG4gICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZSB0aGUgb2xkZXN0IGNhY2hlZCByZXN1bHRzIG9uY2UgdGhlIGNhY2hlIGlzIGZ1bGwuXG4gICAqL1xuICBfY2xlYW5DYWNoZSgpOiB2b2lkIHtcbiAgICBjb25zdCBxdWV1ZVNpemUgPSB0aGlzLl9xdWVyeUxydVF1ZXVlLnNpemU7XG4gICAgaWYgKHF1ZXVlU2l6ZSA8PSBNQVhfQ0FDSEVEX1FVRVJJRVMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gRmlndXJlIG91dCBsZWFzdCByZWNlbnRseSB1c2VkIHF1ZXJpZXMsIGFuZCBwb3AgdGhlbSBvZmYgb2YgdGhlIGBfcXVlcnlMcnVRdWV1ZWAgTWFwLlxuICAgIGNvbnN0IGV4cGlyZWRRdWVyaWVzID0gW107XG4gICAgY29uc3Qga2V5SXRlcmF0b3IgPSB0aGlzLl9xdWVyeUxydVF1ZXVlLmtleXMoKTtcbiAgICBjb25zdCBlbnRyaWVzVG9SZW1vdmUgPSBxdWV1ZVNpemUgLSBNQVhfQ0FDSEVEX1FVRVJJRVM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbnRyaWVzVG9SZW1vdmU7IGkrKykge1xuICAgICAgY29uc3QgZmlyc3RFbnRyeUtleSA9IGtleUl0ZXJhdG9yLm5leHQoKS52YWx1ZTtcbiAgICAgIGV4cGlyZWRRdWVyaWVzLnB1c2goZmlyc3RFbnRyeUtleSk7XG4gICAgICBpbnZhcmlhbnQoZmlyc3RFbnRyeUtleSAhPSBudWxsKTtcbiAgICAgIHRoaXMuX3F1ZXJ5THJ1UXVldWUuZGVsZXRlKGZpcnN0RW50cnlLZXkpO1xuICAgIH1cblxuICAgIC8vIEZvciBlYWNoIChwcm92aWRlcnxkaXJlY3RvcnkpIHBhaXIsIHJlbW92ZSByZXN1bHRzIGZvciBhbGwgZXhwaXJlZCBxdWVyaWVzIGZyb20gdGhlIGNhY2hlLlxuICAgIGZvciAoY29uc3QgcHJvdmlkZXJOYW1lIGluIHRoaXMuX2NhY2hlZFJlc3VsdHMpIHtcbiAgICAgIGZvciAoY29uc3QgZGlyZWN0b3J5IGluIHRoaXMuX2NhY2hlZFJlc3VsdHNbcHJvdmlkZXJOYW1lXSkge1xuICAgICAgICBjb25zdCBxdWVyeVJlc3VsdHMgPSB0aGlzLl9jYWNoZWRSZXN1bHRzW3Byb3ZpZGVyTmFtZV1bZGlyZWN0b3J5XTtcbiAgICAgICAgZXhwaXJlZFF1ZXJpZXMuZm9yRWFjaChxdWVyeSA9PiBkZWxldGUgcXVlcnlSZXN1bHRzW3F1ZXJ5XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChSRVNVTFRTX0NIQU5HRUQpO1xuICB9XG5cbiAgcHJvY2Vzc1Jlc3VsdChcbiAgICBxdWVyeTogc3RyaW5nLFxuICAgIHJlc3VsdDogQXJyYXk8RmlsZVJlc3VsdD4sXG4gICAgZGlyZWN0b3J5OiBzdHJpbmcsXG4gICAgcHJvdmlkZXI6IE9iamVjdFxuICApOiB2b2lkIHtcbiAgICB0aGlzLmNhY2hlUmVzdWx0KC4uLmFyZ3VtZW50cyk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KFJFU1VMVFNfQ0hBTkdFRCk7XG4gIH1cblxuICBzYW5pdGl6ZVF1ZXJ5KHF1ZXJ5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBxdWVyeS50cmltKCk7XG4gIH1cblxuICBhc3luYyBleGVjdXRlUXVlcnkocmF3UXVlcnk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5zYW5pdGl6ZVF1ZXJ5KHJhd1F1ZXJ5KTtcbiAgICBmb3IgKGNvbnN0IGdsb2JhbFByb3ZpZGVyIG9mIHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnNbR0xPQkFMX0tFWV0udmFsdWVzKCkpIHtcbiAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgZ2xvYmFsUHJvdmlkZXIuZXhlY3V0ZVF1ZXJ5KHF1ZXJ5KS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIHRyYWNrKEFuYWx5dGljc0V2ZW50cy5RVUVSWV9TT1VSQ0VfUFJPVklERVIsIHtcbiAgICAgICAgICAncXVpY2tvcGVuLXNvdXJjZS1wcm92aWRlcic6IGdsb2JhbFByb3ZpZGVyLmdldE5hbWUoKSxcbiAgICAgICAgICAncXVpY2tvcGVuLXF1ZXJ5LWR1cmF0aW9uJzogKHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lKS50b1N0cmluZygpLFxuICAgICAgICAgICdxdWlja29wZW4tcmVzdWx0LWNvdW50JzogKHJlc3VsdC5sZW5ndGgpLnRvU3RyaW5nKCksXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByb2Nlc3NSZXN1bHQocXVlcnksIHJlc3VsdCwgR0xPQkFMX0tFWSwgZ2xvYmFsUHJvdmlkZXIpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXRMb2FkaW5nKHF1ZXJ5LCBHTE9CQUxfS0VZLCBnbG9iYWxQcm92aWRlcik7XG4gICAgfVxuICAgIGlmICh0aGlzLl9wcm92aWRlcnNCeURpcmVjdG9yeS5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2RpcmVjdG9yaWVzLmZvckVhY2goZGlyZWN0b3J5ID0+IHtcbiAgICAgIGNvbnN0IHBhdGggPSBkaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICAgICAgY29uc3QgcHJvdmlkZXJzID0gdGhpcy5fcHJvdmlkZXJzQnlEaXJlY3RvcnkuZ2V0KGRpcmVjdG9yeSk7XG4gICAgICBpZiAoIXByb3ZpZGVycykge1xuICAgICAgICAvLyBTcGVjaWFsIGRpcmVjdG9yaWVzIGxpa2UgXCJhdG9tOi8vYWJvdXRcIlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGRpcmVjdG9yeVByb3ZpZGVyIG9mIHByb3ZpZGVycykge1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgZGlyZWN0b3J5UHJvdmlkZXIuZXhlY3V0ZVF1ZXJ5KHF1ZXJ5LCBkaXJlY3RvcnkpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICB0cmFjayhBbmFseXRpY3NFdmVudHMuUVVFUllfU09VUkNFX1BST1ZJREVSLCB7XG4gICAgICAgICAgICAncXVpY2tvcGVuLXNvdXJjZS1wcm92aWRlcic6IGRpcmVjdG9yeVByb3ZpZGVyLmdldE5hbWUoKSxcbiAgICAgICAgICAgICdxdWlja29wZW4tcXVlcnktZHVyYXRpb24nOiAocGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFRpbWUpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAncXVpY2tvcGVuLXJlc3VsdC1jb3VudCc6IChyZXN1bHQubGVuZ3RoKS50b1N0cmluZygpLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMucHJvY2Vzc1Jlc3VsdChxdWVyeSwgcmVzdWx0LCBwYXRoLCBkaXJlY3RvcnlQcm92aWRlcik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9zZXRMb2FkaW5nKHF1ZXJ5LCBwYXRoLCBkaXJlY3RvcnlQcm92aWRlcik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KFJFU1VMVFNfQ0hBTkdFRCk7XG4gIH1cblxuICBfaXNHbG9iYWxQcm92aWRlcihwcm92aWRlck5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzW0dMT0JBTF9LRVldLmhhcyhwcm92aWRlck5hbWUpO1xuICB9XG5cbiAgX2dldFByb3ZpZGVyQnlOYW1lKHByb3ZpZGVyTmFtZTogc3RyaW5nKTogUHJvdmlkZXIge1xuICAgIGxldCBkaXJQcm92aWRlck5hbWU7XG4gICAgaWYgKHRoaXMuX2lzR2xvYmFsUHJvdmlkZXIocHJvdmlkZXJOYW1lKSkge1xuICAgICAgZGlyUHJvdmlkZXJOYW1lID0gdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVyc1tHTE9CQUxfS0VZXS5nZXQocHJvdmlkZXJOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlyUHJvdmlkZXJOYW1lID0gdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVyc1tESVJFQ1RPUllfS0VZXS5nZXQocHJvdmlkZXJOYW1lKTtcbiAgICB9XG4gICAgaW52YXJpYW50KFxuICAgICAgZGlyUHJvdmlkZXJOYW1lICE9IG51bGwsXG4gICAgICBgUHJvdmlkZXIgJHtwcm92aWRlck5hbWV9IGlzIG5vdCByZWdpc3RlcmVkIHdpdGggcXVpY2stb3Blbi5gXG4gICAgKTtcbiAgICByZXR1cm4gZGlyUHJvdmlkZXJOYW1lO1xuICB9XG5cbiAgX2dldFJlc3VsdHNGb3JQcm92aWRlcihxdWVyeTogc3RyaW5nLCBwcm92aWRlck5hbWU6IHN0cmluZyk6IE9iamVjdCB7XG4gICAgY29uc3QgcHJvdmlkZXJQYXRocyA9IHRoaXMuX2lzR2xvYmFsUHJvdmlkZXIocHJvdmlkZXJOYW1lKVxuICAgICAgPyBbR0xPQkFMX0tFWV1cbiAgICAgIDogdGhpcy5fZGlyZWN0b3JpZXMubWFwKGQgPT4gZC5nZXRQYXRoKCkpO1xuICAgIGNvbnN0IHByb3ZpZGVyID0gdGhpcy5fZ2V0UHJvdmlkZXJCeU5hbWUocHJvdmlkZXJOYW1lKTtcbiAgICByZXR1cm4ge1xuICAgICAgdGl0bGU6IHByb3ZpZGVyLmdldFRhYlRpdGxlKCksXG4gICAgICByZXN1bHRzOiBwcm92aWRlclBhdGhzLnJlZHVjZSgocmVzdWx0cywgcGF0aCkgPT4ge1xuICAgICAgICBsZXQgY2FjaGVkUGF0aHMsIGNhY2hlZFF1ZXJpZXMsIGNhY2hlZFJlc3VsdDtcbiAgICAgICAgaWYgKCEoXG4gICAgICAgICAgKGNhY2hlZFBhdGhzID0gdGhpcy5fY2FjaGVkUmVzdWx0c1twcm92aWRlck5hbWVdKSAmJlxuICAgICAgICAgIChjYWNoZWRRdWVyaWVzID0gY2FjaGVkUGF0aHNbcGF0aF0pICYmXG4gICAgICAgICAgKGNhY2hlZFJlc3VsdCA9IGNhY2hlZFF1ZXJpZXNbcXVlcnldKVxuICAgICAgICApKSB7XG4gICAgICAgICAgY2FjaGVkUmVzdWx0ID0ge307XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVmYXVsdFJlc3VsdCA9IGdldERlZmF1bHRSZXN1bHQoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0TGlzdCA9IGNhY2hlZFJlc3VsdC5yZXN1bHQgfHwgZGVmYXVsdFJlc3VsdC5yZXN1bHRzO1xuICAgICAgICByZXN1bHRzW3BhdGhdID0ge1xuICAgICAgICAgIHJlc3VsdHM6IHJlc3VsdExpc3QubWFwKHJlc3VsdCA9PiAoey4uLnJlc3VsdCwgc291cmNlUHJvdmlkZXI6IHByb3ZpZGVyTmFtZX0pKSxcbiAgICAgICAgICBsb2FkaW5nOiBjYWNoZWRSZXN1bHQubG9hZGluZyB8fCBkZWZhdWx0UmVzdWx0LmxvYWRpbmcsXG4gICAgICAgICAgZXJyb3I6IGNhY2hlZFJlc3VsdC5lcnJvciB8fCBkZWZhdWx0UmVzdWx0LmVycm9yLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH0sIHt9KSxcbiAgICB9O1xuICB9XG5cbiAgZ2V0UmVzdWx0cyhxdWVyeTogc3RyaW5nLCBhY3RpdmVQcm92aWRlck5hbWU6IHN0cmluZyk6IE9iamVjdCB7XG4gICAgY29uc3Qgc2FuaXRpemVkUXVlcnkgPSB0aGlzLnNhbml0aXplUXVlcnkocXVlcnkpO1xuICAgIGlmIChhY3RpdmVQcm92aWRlck5hbWUgPT09IE9NTklTRUFSQ0hfUFJPVklERVIubmFtZSkge1xuICAgICAgY29uc3Qgb21uaVNlYXJjaFJlc3VsdHMgPSBbe31dO1xuICAgICAgZm9yIChjb25zdCBwcm92aWRlck5hbWUgaW4gdGhpcy5fY2FjaGVkUmVzdWx0cykge1xuICAgICAgICBjb25zdCByZXN1bHRGb3JQcm92aWRlciA9IHRoaXMuX2dldFJlc3VsdHNGb3JQcm92aWRlcihzYW5pdGl6ZWRRdWVyeSwgcHJvdmlkZXJOYW1lKTtcbiAgICAgICAgLy8gVE9ETyByZXBsYWNlIHRoaXMgd2l0aCBhIHJhbmtpbmcgYWxnb3JpdGhtLlxuICAgICAgICBmb3IgKGNvbnN0IGRpciBpbiByZXN1bHRGb3JQcm92aWRlci5yZXN1bHRzKSB7XG4gICAgICAgICAgcmVzdWx0Rm9yUHJvdmlkZXIucmVzdWx0c1tkaXJdLnJlc3VsdHMgPVxuICAgICAgICAgICAgcmVzdWx0Rm9yUHJvdmlkZXIucmVzdWx0c1tkaXJdLnJlc3VsdHMuc2xpY2UoMCwgTUFYX09NTklfUkVTVUxUU19QRVJfU0VSVklDRSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyByZXBsYWNlIGBwYXJ0aWFsYCB3aXRoIGNvbXB1dGVkIHByb3BlcnR5IHdoZW5ldmVyIEZsb3cgc3VwcG9ydHMgaXQuXG4gICAgICAgIGNvbnN0IHBhcnRpYWwgPSB7fTtcbiAgICAgICAgcGFydGlhbFtwcm92aWRlck5hbWVdID0gcmVzdWx0Rm9yUHJvdmlkZXI7XG4gICAgICAgIG9tbmlTZWFyY2hSZXN1bHRzLnB1c2gocGFydGlhbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXNzaWduLmFwcGx5KHt9LCBvbW5pU2VhcmNoUmVzdWx0cyk7XG4gICAgfVxuICAgIC8vIFRPRE8gcmVwbGFjZSBgcGFydGlhbGAgd2l0aCBjb21wdXRlZCBwcm9wZXJ0eSB3aGVuZXZlciBGbG93IHN1cHBvcnRzIGl0LlxuICAgIGNvbnN0IHBhcnRpYWwgPSB7fTtcbiAgICBwYXJ0aWFsW2FjdGl2ZVByb3ZpZGVyTmFtZV0gPSB0aGlzLl9nZXRSZXN1bHRzRm9yUHJvdmlkZXIoc2FuaXRpemVkUXVlcnksIGFjdGl2ZVByb3ZpZGVyTmFtZSk7XG4gICAgcmV0dXJuIHBhcnRpYWw7XG4gIH1cblxuICBnZXRQcm92aWRlckJ5TmFtZShwcm92aWRlck5hbWU6IHN0cmluZyk6IFByb3ZpZGVyU3BlYyB7XG4gICAgaWYgKHByb3ZpZGVyTmFtZSA9PT0gT01OSVNFQVJDSF9QUk9WSURFUi5uYW1lKSB7XG4gICAgICByZXR1cm4gey4uLk9NTklTRUFSQ0hfUFJPVklERVJ9O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYmFrZVByb3ZpZGVyKHRoaXMuX2dldFByb3ZpZGVyQnlOYW1lKHByb3ZpZGVyTmFtZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFR1cm4gYSBQcm92aWRlciBpbnRvIGEgcGxhaW4gXCJzcGVjXCIgb2JqZWN0IGNvbnN1bWVkIGJ5IFF1aWNrU2VsZWN0aW9uQ29tcG9uZW50LlxuICAgKi9cbiAgX2Jha2VQcm92aWRlcihwcm92aWRlcjogUHJvdmlkZXIpOiBQcm92aWRlclNwZWMge1xuICAgIGNvbnN0IHByb3ZpZGVyTmFtZSA9IHByb3ZpZGVyLmdldE5hbWUoKTtcbiAgICByZXR1cm4ge1xuICAgICAgYWN0aW9uOiBwcm92aWRlci5nZXRBY3Rpb24gJiYgcHJvdmlkZXIuZ2V0QWN0aW9uKCkgfHwgJycsXG4gICAgICBkZWJvdW5jZURlbGF5OiAodHlwZW9mIHByb3ZpZGVyLmdldERlYm91bmNlRGVsYXkgPT09ICdmdW5jdGlvbicpXG4gICAgICAgID8gcHJvdmlkZXIuZ2V0RGVib3VuY2VEZWxheSgpXG4gICAgICAgIDogREVGQVVMVF9RVUVSWV9ERUJPVU5DRV9ERUxBWSxcbiAgICAgIG5hbWU6IHByb3ZpZGVyTmFtZSxcbiAgICAgIHByb21wdDogcHJvdmlkZXIuZ2V0UHJvbXB0VGV4dCAmJiBwcm92aWRlci5nZXRQcm9tcHRUZXh0KCkgfHxcbiAgICAgICAgJ1NlYXJjaCAnICsgcHJvdmlkZXJOYW1lLFxuICAgICAgdGl0bGU6IHByb3ZpZGVyLmdldFRhYlRpdGxlICYmIHByb3ZpZGVyLmdldFRhYlRpdGxlKCkgfHwgcHJvdmlkZXJOYW1lLFxuICAgIH07XG4gIH1cblxuICBnZXRSZW5kZXJhYmxlUHJvdmlkZXJzKCk6IEFycmF5PFByb3ZpZGVyU3BlYz4ge1xuICAgIC8vIE9ubHkgcmVuZGVyIHRhYnMgZm9yIHByb3ZpZGVycyB0aGF0IGFyZSBlbGlnaWJsZSBmb3IgYXQgbGVhc3Qgb25lIGRpcmVjdG9yeS5cbiAgICBjb25zdCBlbGlnaWJsZURpcmVjdG9yeVByb3ZpZGVycyA9IGFycmF5LmZyb20odGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVyc1tESVJFQ1RPUllfS0VZXS52YWx1ZXMoKSlcbiAgICAgIC5maWx0ZXIocHJvdmlkZXIgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHByb3ZpZGVycyBvZiB0aGlzLl9wcm92aWRlcnNCeURpcmVjdG9yeS52YWx1ZXMoKSkge1xuICAgICAgICAgIGlmIChwcm92aWRlcnMuaGFzKHByb3ZpZGVyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgIGNvbnN0IHRhYnMgPSBhcnJheS5mcm9tKHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnNbR0xPQkFMX0tFWV0udmFsdWVzKCkpXG4gICAgICAuY29uY2F0KGVsaWdpYmxlRGlyZWN0b3J5UHJvdmlkZXJzKVxuICAgICAgLmZpbHRlcihwcm92aWRlciA9PiBwcm92aWRlci5pc1JlbmRlcmFibGUoKSlcbiAgICAgIC5tYXAodGhpcy5fYmFrZVByb3ZpZGVyKVxuICAgICAgLnNvcnQoKHAxLCBwMikgPT4gcDEubmFtZS5sb2NhbGVDb21wYXJlKHAyLm5hbWUpKTtcbiAgICB0YWJzLnVuc2hpZnQoT01OSVNFQVJDSF9QUk9WSURFUik7XG4gICAgcmV0dXJuIHRhYnM7XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBTZWFyY2hSZXN1bHRNYW5hZ2VyO1xuXG5leHBvcnQgY29uc3QgX190ZXN0X18gPSB7XG4gIF9nZXRPbW5pU2VhcmNoUHJvdmlkZXJTcGVjKCk6IFByb3ZpZGVyU3BlYyB7XG4gICAgcmV0dXJuIE9NTklTRUFSQ0hfUFJPVklERVI7XG4gIH0sXG59O1xuIl19