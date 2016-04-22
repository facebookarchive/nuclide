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

var _reactForAtom = require('react-for-atom');

var _atom = require('atom');

var _nuclideCommons = require('../../nuclide-commons');

var _QuickSelectionDispatcher = require('./QuickSelectionDispatcher');

var _QuickSelectionDispatcher2 = _interopRequireDefault(_QuickSelectionDispatcher);

var _QuickSelectionActions = require('./QuickSelectionActions');

var _QuickSelectionActions2 = _interopRequireDefault(_QuickSelectionActions);

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

exports['default'] = SearchResultManager;
var __test__ = {
  _getOmniSearchProviderSpec: function _getOmniSearchProviderSpec() {
    return OMNISEARCH_PROVIDER;
  }
};
exports.__test__ = __test__;

// List of most recently used query strings, used for pruning the result cache.
// Makes use of `Map`'s insertion ordering, so values are irrelevant and always set to `null`.
//# sourceMappingURL=data:application/json;base64,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Q0FBQztBQUNsQyxhQUFPLElBQUksQ0FBQztLQUNiOzs7U0FsYkcsbUJBQW1COzs7cUJBc2JWLG1CQUFtQjtBQUUzQixJQUFNLFFBQVEsR0FBRztBQUN0Qiw0QkFBMEIsRUFBQSxzQ0FBaUI7QUFDekMsV0FBTyxtQkFBbUIsQ0FBQztHQUM1QjtDQUNGLENBQUMiLCJmaWxlIjoiU2VhcmNoUmVzdWx0TWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgUHJvdmlkZXJTcGVjLFxufSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHR5cGUge1xuICBGaWxlUmVzdWx0LFxuICBQcm92aWRlcixcbiAgUHJvdmlkZXJSZXN1bHQsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtcXVpY2stb3Blbi1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHR5cGUge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuXG50eXBlIFJlc3VsdFJlbmRlcmVyID1cbiAgKGl0ZW06IEZpbGVSZXN1bHQsIHNlcnZpY2VOYW1lOiBzdHJpbmcsIGRpck5hbWU6IHN0cmluZykgPT4gUmVhY3QuRWxlbWVudDtcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge1xuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBEaXNwb3NhYmxlLFxuICBFbWl0dGVyLFxufSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIGRlYm91bmNlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IFF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlciBmcm9tICcuL1F1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlcic7XG5pbXBvcnQgUXVpY2tTZWxlY3Rpb25BY3Rpb25zIGZyb20gJy4vUXVpY2tTZWxlY3Rpb25BY3Rpb25zJztcblxuY29uc3Qge3BlcmZvcm1hbmNlfSA9IGdsb2JhbDtcblxuZnVuY3Rpb24gZ2V0RGVmYXVsdFJlc3VsdCgpOiBQcm92aWRlclJlc3VsdCB7XG4gIHJldHVybiB7XG4gICAgZXJyb3I6IG51bGwsXG4gICAgbG9hZGluZzogZmFsc2UsXG4gICAgcmVzdWx0czogW10sXG4gIH07XG59XG5cbmNvbnN0IEFuYWx5dGljc0V2ZW50cyA9IE9iamVjdC5mcmVlemUoe1xuICBRVUVSWV9TT1VSQ0VfUFJPVklERVI6ICdxdWlja29wZW4tcXVlcnktc291cmNlLXByb3ZpZGVyJyxcbn0pO1xuXG5jb25zdCBSRVNVTFRTX0NIQU5HRUQgPSAncmVzdWx0c19jaGFuZ2VkJztcbmNvbnN0IFBST1ZJREVSU19DSEFOR0VEID0gJ3Byb3ZpZGVyc19jaGFuZ2VkJztcbmNvbnN0IE1BWF9PTU5JX1JFU1VMVFNfUEVSX1NFUlZJQ0UgPSA1O1xuY29uc3QgREVGQVVMVF9RVUVSWV9ERUJPVU5DRV9ERUxBWSA9IDIwMDtcbmNvbnN0IE9NTklTRUFSQ0hfUFJPVklERVIgPSB7XG4gIGFjdGlvbjogJ251Y2xpZGUtcXVpY2stb3BlbjpmaW5kLWFueXRoaW5nLXZpYS1vbW5pLXNlYXJjaCcsXG4gIGRlYm91bmNlRGVsYXk6IERFRkFVTFRfUVVFUllfREVCT1VOQ0VfREVMQVksXG4gIG5hbWU6ICdPbW5pU2VhcmNoUmVzdWx0UHJvdmlkZXInLFxuICBwcm9tcHQ6ICdTZWFyY2ggZm9yIGFueXRoaW5nLi4uJyxcbiAgdGl0bGU6ICdPbW5pU2VhcmNoJyxcbn07XG4vLyBOdW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlIGNhY2hlIGJlZm9yZSBwZXJpb2RpYyBjbGVhbnVwIGtpY2tzIGluLiBJbmNsdWRlcyBwYXJ0aWFsIHF1ZXJ5IHN0cmluZ3MuXG5jb25zdCBNQVhfQ0FDSEVEX1FVRVJJRVMgPSAxMDA7XG5jb25zdCBDQUNIRV9DTEVBTl9ERUJPVU5DRV9ERUxBWSA9IDUwMDA7XG5jb25zdCBVUERBVEVfRElSRUNUT1JJRVNfREVCT1VOQ0VfREVMQVkgPSAxMDA7XG5jb25zdCBHTE9CQUxfS0VZID0gJ2dsb2JhbCc7XG5jb25zdCBESVJFQ1RPUllfS0VZID0gJ2RpcmVjdG9yeSc7XG5cbmZ1bmN0aW9uIGlzVmFsaWRQcm92aWRlcihwcm92aWRlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiBwcm92aWRlci5nZXRQcm92aWRlclR5cGUgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvdmlkZXIuZ2V0TmFtZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgcHJvdmlkZXIuZ2V0TmFtZSgpID09PSAnc3RyaW5nJyAmJlxuICAgIHR5cGVvZiBwcm92aWRlci5pc1JlbmRlcmFibGUgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvdmlkZXIuZXhlY3V0ZVF1ZXJ5ID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb3ZpZGVyLmdldFRhYlRpdGxlID09PSAnZnVuY3Rpb24nXG4gICk7XG59XG5cbmxldCBzZWFyY2hSZXN1bHRNYW5hZ2VySW5zdGFuY2UgPSBudWxsO1xuLyoqXG4gKiBBIHNpbmdsZXRvbiBjYWNoZSBmb3Igc2VhcmNoIHByb3ZpZGVycyBhbmQgcmVzdWx0cy5cbiAqL1xuY2xhc3MgU2VhcmNoUmVzdWx0TWFuYWdlciB7XG4gIF9kaXNwYXRjaGVyVG9rZW46IHN0cmluZztcbiAgUkVTVUxUU19DSEFOR0VEOiBzdHJpbmc7XG4gIFBST1ZJREVSU19DSEFOR0VEOiBzdHJpbmc7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfcHJvdmlkZXJzQnlEaXJlY3Rvcnk6IE1hcDxhdG9tJERpcmVjdG9yeSwgU2V0PFByb3ZpZGVyPj47XG4gIF9kaXJlY3RvcmllczogQXJyYXk8YXRvbSREaXJlY3Rvcnk+O1xuICBfY2FjaGVkUmVzdWx0czogT2JqZWN0O1xuICAvLyBMaXN0IG9mIG1vc3QgcmVjZW50bHkgdXNlZCBxdWVyeSBzdHJpbmdzLCB1c2VkIGZvciBwcnVuaW5nIHRoZSByZXN1bHQgY2FjaGUuXG4gIC8vIE1ha2VzIHVzZSBvZiBgTWFwYCdzIGluc2VydGlvbiBvcmRlcmluZywgc28gdmFsdWVzIGFyZSBpcnJlbGV2YW50IGFuZCBhbHdheXMgc2V0IHRvIGBudWxsYC5cbiAgX3F1ZXJ5THJ1UXVldWU6IE1hcDxzdHJpbmcsID9OdW1iZXI+O1xuICBfZGVib3VuY2VkQ2xlYW5DYWNoZTogRnVuY3Rpb247XG4gIF9kZWJvdW5jZWRVcGRhdGVEaXJlY3RvcmllczogRnVuY3Rpb247XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3JlZ2lzdGVyZWRQcm92aWRlcnM6IHtba2V5OiBzdHJpbmddOiBNYXA8c3RyaW5nLCBQcm92aWRlcj47fTtcbiAgX2FjdGl2ZVByb3ZpZGVyTmFtZTogc3RyaW5nO1xuICBfaXNEaXNwb3NlZDogYm9vbGVhbjtcblxuICBzdGF0aWMgZ2V0SW5zdGFuY2UoKTogU2VhcmNoUmVzdWx0TWFuYWdlciB7XG4gICAgaWYgKCFzZWFyY2hSZXN1bHRNYW5hZ2VySW5zdGFuY2UpIHtcbiAgICAgIHNlYXJjaFJlc3VsdE1hbmFnZXJJbnN0YW5jZSA9IG5ldyBTZWFyY2hSZXN1bHRNYW5hZ2VyKCk7XG4gICAgfVxuICAgIHJldHVybiBzZWFyY2hSZXN1bHRNYW5hZ2VySW5zdGFuY2U7XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gZmFsc2U7XG4gICAgdGhpcy5SRVNVTFRTX0NIQU5HRUQgPSBSRVNVTFRTX0NIQU5HRUQ7XG4gICAgdGhpcy5QUk9WSURFUlNfQ0hBTkdFRCA9IFBST1ZJREVSU19DSEFOR0VEO1xuICAgIHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMgPSB7fTtcbiAgICB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzW0RJUkVDVE9SWV9LRVldID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnNbR0xPQkFMX0tFWV0gPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fcHJvdmlkZXJzQnlEaXJlY3RvcnkgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZGlyZWN0b3JpZXMgPSBbXTtcbiAgICB0aGlzLl9jYWNoZWRSZXN1bHRzID0ge307XG4gICAgdGhpcy5fZGVib3VuY2VkQ2xlYW5DYWNoZSA9IGRlYm91bmNlKFxuICAgICAgKCkgPT4gdGhpcy5fY2xlYW5DYWNoZSgpLFxuICAgICAgQ0FDSEVfQ0xFQU5fREVCT1VOQ0VfREVMQVksXG4gICAgICAvKiBpbW1lZGlhdGUgKi9mYWxzZVxuICAgICk7XG4gICAgLy8gYHVwZGF0ZURpcmVjdG9yaWVzYCBqb2lucyBwcm92aWRlcnMgYW5kIGRpcmVjdG9yaWVzLCB3aGljaCBkb24ndCBrbm93IGFueXRoaW5nIGFib3V0IGVhY2hcbiAgICAvLyBvdGhlci4gRGVib3VuY2UgdGhpcyBjYWxsIHRvIHJlZHVjZSBjaHVybiBhdCBzdGFydHVwLCBhbmQgd2hlbiBuZXcgcHJvdmlkZXJzIGdldCBhY3RpdmF0ZWQgb3JcbiAgICAvLyBhIG5ldyBkaXJlY3RvcnkgZ2V0cyBtb3VudGVkLlxuICAgIHRoaXMuX2RlYm91bmNlZFVwZGF0ZURpcmVjdG9yaWVzID0gZGVib3VuY2UoXG4gICAgICAoKSA9PiB0aGlzLl91cGRhdGVEaXJlY3RvcmllcygpLFxuICAgICAgVVBEQVRFX0RJUkVDVE9SSUVTX0RFQk9VTkNFX0RFTEFZLFxuICAgICAgLyogaW1tZWRpYXRlICovZmFsc2VcbiAgICApO1xuICAgIHRoaXMuX3F1ZXJ5THJ1UXVldWUgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IFF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlci5nZXRJbnN0YW5jZSgpO1xuICAgIC8vIENoZWNrIGlzIHJlcXVpcmVkIGZvciB0ZXN0aW5nLlxuICAgIGlmIChhdG9tLnByb2plY3QpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKFxuICAgICAgICB0aGlzLl9kZWJvdW5jZWRVcGRhdGVEaXJlY3Rvcmllcy5iaW5kKHRoaXMpKVxuICAgICAgKTtcbiAgICAgIHRoaXMuX2RlYm91bmNlZFVwZGF0ZURpcmVjdG9yaWVzKCk7XG4gICAgfVxuICAgIHRoaXMuX3NldFVwRmx1eCgpO1xuICAgIHRoaXMuX2FjdGl2ZVByb3ZpZGVyTmFtZSA9IE9NTklTRUFSQ0hfUFJPVklERVIubmFtZTtcbiAgfVxuXG4gIF9zZXRVcEZsdXgoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlclRva2VuID0gdGhpcy5fZGlzcGF0Y2hlci5yZWdpc3RlcihhY3Rpb24gPT4ge1xuICAgICAgc3dpdGNoIChhY3Rpb24uYWN0aW9uVHlwZSkge1xuICAgICAgICBjYXNlIFF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlci5BY3Rpb25UeXBlLlFVRVJZOlxuICAgICAgICAgIHRoaXMuZXhlY3V0ZVF1ZXJ5KGFjdGlvbi5xdWVyeSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUXVpY2tTZWxlY3Rpb25EaXNwYXRjaGVyLkFjdGlvblR5cGUuQUNUSVZFX1BST1ZJREVSX0NIQU5HRUQ6XG4gICAgICAgICAgdGhpcy5fYWN0aXZlUHJvdmlkZXJOYW1lID0gYWN0aW9uLnByb3ZpZGVyTmFtZTtcbiAgICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoUFJPVklERVJTX0NIQU5HRUQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0QWN0aXZlUHJvdmlkZXJOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZVByb3ZpZGVyTmFtZTtcbiAgfVxuXG4gIGdldFJlbmRlcmVyRm9yUHJvdmlkZXIocHJvdmlkZXJOYW1lOiBzdHJpbmcpOiBSZXN1bHRSZW5kZXJlciB7XG4gICAgY29uc3QgcHJvdmlkZXIgPSB0aGlzLl9nZXRQcm92aWRlckJ5TmFtZShwcm92aWRlck5hbWUpO1xuICAgIGlmICghcHJvdmlkZXIgfHwgIXByb3ZpZGVyLmdldENvbXBvbmVudEZvckl0ZW0pIHtcbiAgICAgIHJldHVybiByZXF1aXJlKCcuL0ZpbGVSZXN1bHRDb21wb25lbnQnKS5nZXRDb21wb25lbnRGb3JJdGVtO1xuICAgIH1cbiAgICByZXR1cm4gcHJvdmlkZXIuZ2V0Q29tcG9uZW50Rm9ySXRlbTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5faXNEaXNwb3NlZCA9IHRydWU7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZXcgdGhlIGNhY2hlZCBsaXN0IG9mIGRpcmVjdG9yaWVzLCBhcyB3ZWxsIGFzIHRoZSBjYWNoZWQgbWFwIG9mIGVsaWdpYmxlIHByb3ZpZGVyc1xuICAgKiBmb3IgZXZlcnkgZGlyZWN0b3J5LlxuICAgKi9cbiAgYXN5bmMgX3VwZGF0ZURpcmVjdG9yaWVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG5ld0RpcmVjdG9yaWVzID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCk7XG4gICAgY29uc3QgbmV3UHJvdmlkZXJzQnlEaXJlY3RvcmllcyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBlbGlnaWJpbGl0aWVzID0gW107XG4gICAgbmV3RGlyZWN0b3JpZXMuZm9yRWFjaChkaXJlY3RvcnkgPT4ge1xuICAgICAgbmV3UHJvdmlkZXJzQnlEaXJlY3Rvcmllcy5zZXQoZGlyZWN0b3J5LCBuZXcgU2V0KCkpO1xuICAgICAgZm9yIChjb25zdCBwcm92aWRlciBvZiB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzW0RJUkVDVE9SWV9LRVldLnZhbHVlcygpKSB7XG4gICAgICAgIGludmFyaWFudChcbiAgICAgICAgICBwcm92aWRlci5pc0VsaWdpYmxlRm9yRGlyZWN0b3J5ICE9IG51bGwsXG4gICAgICAgICAgYERpcmVjdG9yeSBwcm92aWRlciAke3Byb3ZpZGVyLmdldE5hbWUoKX0gbXVzdCBwcm92aWRlIFxcYGlzRWxpZ2libGVGb3JEaXJlY3RvcnkoKVxcYC5gXG4gICAgICAgICk7XG4gICAgICAgIGVsaWdpYmlsaXRpZXMucHVzaChcbiAgICAgICAgICBwcm92aWRlci5pc0VsaWdpYmxlRm9yRGlyZWN0b3J5KGRpcmVjdG9yeSkudGhlbihpc0VsaWdpYmxlID0+ICh7XG4gICAgICAgICAgICBpc0VsaWdpYmxlLFxuICAgICAgICAgICAgcHJvdmlkZXIsXG4gICAgICAgICAgICBkaXJlY3RvcnksXG4gICAgICAgICAgfSkpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc3QgcmVzb2x2ZWRFbGlnaWJpbGl0aWVzID0gYXdhaXQgUHJvbWlzZS5hbGwoZWxpZ2liaWxpdGllcyk7XG4gICAgZm9yIChjb25zdCBlbGlnaWJpbGl0eSBvZiByZXNvbHZlZEVsaWdpYmlsaXRpZXMpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcHJvdmlkZXIsXG4gICAgICAgIGlzRWxpZ2libGUsXG4gICAgICAgIGRpcmVjdG9yeSxcbiAgICAgIH0gPSBlbGlnaWJpbGl0eTtcbiAgICAgIGlmIChpc0VsaWdpYmxlKSB7XG4gICAgICAgIGNvbnN0IHByb3ZpZGVyc0ZvckRpcmVjdG9yeSA9IG5ld1Byb3ZpZGVyc0J5RGlyZWN0b3JpZXMuZ2V0KGRpcmVjdG9yeSk7XG4gICAgICAgIGludmFyaWFudChcbiAgICAgICAgICBwcm92aWRlcnNGb3JEaXJlY3RvcnkgIT0gbnVsbCxcbiAgICAgICAgICBgUHJvdmlkZXJzIGZvciBkaXJlY3RvcnkgJHtkaXJlY3Rvcnl9IG5vdCBkZWZpbmVkYFxuICAgICAgICApO1xuICAgICAgICBwcm92aWRlcnNGb3JEaXJlY3RvcnkuYWRkKHByb3ZpZGVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fZGlyZWN0b3JpZXMgPSBuZXdEaXJlY3RvcmllcztcbiAgICB0aGlzLl9wcm92aWRlcnNCeURpcmVjdG9yeSA9IG5ld1Byb3ZpZGVyc0J5RGlyZWN0b3JpZXM7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KFBST1ZJREVSU19DSEFOR0VEKTtcbiAgfVxuXG4gIG9uKCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbiguLi5hcmd1bWVudHMpO1xuICB9XG5cbiAgcmVnaXN0ZXJQcm92aWRlcihzZXJ2aWNlOiBQcm92aWRlcik6IElEaXNwb3NhYmxlIHtcbiAgICBpZiAoIWlzVmFsaWRQcm92aWRlcihzZXJ2aWNlKSkge1xuICAgICAgY29uc3QgcHJvdmlkZXJOYW1lID0gc2VydmljZS5nZXROYW1lICYmIHNlcnZpY2UuZ2V0TmFtZSgpIHx8ICc8dW5rbm93bj4nO1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoYFF1aWNrLW9wZW4gcHJvdmlkZXIgJHtwcm92aWRlck5hbWV9IGlzIG5vdCBhIHZhbGlkIHByb3ZpZGVyYCk7XG4gICAgfVxuICAgIGNvbnN0IGlzUmVuZGVyYWJsZVByb3ZpZGVyID1cbiAgICAgIHR5cGVvZiBzZXJ2aWNlLmlzUmVuZGVyYWJsZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXJ2aWNlLmlzUmVuZGVyYWJsZSgpO1xuICAgIGNvbnN0IGlzR2xvYmFsUHJvdmlkZXIgPSBzZXJ2aWNlLmdldFByb3ZpZGVyVHlwZSgpID09PSAnR0xPQkFMJztcbiAgICBjb25zdCB0YXJnZXRSZWdpc3RyeSA9IGlzR2xvYmFsUHJvdmlkZXJcbiAgICAgID8gdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVyc1tHTE9CQUxfS0VZXVxuICAgICAgOiB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzW0RJUkVDVE9SWV9LRVldO1xuICAgIHRhcmdldFJlZ2lzdHJ5LnNldChzZXJ2aWNlLmdldE5hbWUoKSwgc2VydmljZSk7XG4gICAgaWYgKCFpc0dsb2JhbFByb3ZpZGVyKSB7XG4gICAgICB0aGlzLl9kZWJvdW5jZWRVcGRhdGVEaXJlY3RvcmllcygpO1xuICAgIH1cbiAgICBjb25zdCBkaXNwb3NhYmxlID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBkaXNwb3NhYmxlLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAvLyBUaGlzIG1heSBiZSBjYWxsZWQgYWZ0ZXIgdGhpcyBwYWNrYWdlIGhhcyBiZWVuIGRlYWN0aXZhdGVkXG4gICAgICAvLyBhbmQgdGhlIFNlYXJjaFJlc3VsdE1hbmFnZXIgaGFzIGJlZW4gZGlzcG9zZWQuXG4gICAgICBpZiAodGhpcy5faXNEaXNwb3NlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBzZXJ2aWNlTmFtZSA9IHNlcnZpY2UuZ2V0TmFtZSgpO1xuICAgICAgdGFyZ2V0UmVnaXN0cnkuZGVsZXRlKHNlcnZpY2VOYW1lKTtcbiAgICAgIHRoaXMuX3Byb3ZpZGVyc0J5RGlyZWN0b3J5LmZvckVhY2goKHByb3ZpZGVycywgZGlyKSA9PiB7XG4gICAgICAgIHByb3ZpZGVycy5kZWxldGUoc2VydmljZSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3JlbW92ZVJlc3VsdHNGb3JQcm92aWRlcihzZXJ2aWNlTmFtZSk7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoUFJPVklERVJTX0NIQU5HRUQpO1xuICAgIH0pKTtcbiAgICAvLyBJZiB0aGUgcHJvdmlkZXIgaXMgcmVuZGVyYWJsZSBhbmQgc3BlY2lmaWVzIGEga2V5YmluZGluZywgd2lyZSBpdCB1cCB3aXRoIHRoZSB0b2dnbGUgY29tbWFuZC5cbiAgICBpZiAoaXNSZW5kZXJhYmxlUHJvdmlkZXIgJiYgdHlwZW9mIHNlcnZpY2UuZ2V0QWN0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zdCB0b2dnbGVBY3Rpb246IHN0cmluZyA9IHNlcnZpY2UuZ2V0QWN0aW9uKCk7XG4gICAgICAvLyBUT0RPIHJlcGxhY2Ugd2l0aCBjb21wdXRlZCBwcm9wZXJ0eSBvbmNlIEZsb3cgc3VwcG9ydHMgaXQuXG4gICAgICBjb25zdCBhY3Rpb25TcGVjID0ge307XG4gICAgICBhY3Rpb25TcGVjW3RvZ2dsZUFjdGlvbl0gPVxuICAgICAgICAoKSA9PiBRdWlja1NlbGVjdGlvbkFjdGlvbnMuY2hhbmdlQWN0aXZlUHJvdmlkZXIoc2VydmljZS5nZXROYW1lKCkpO1xuICAgICAgZGlzcG9zYWJsZS5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgYWN0aW9uU3BlYykpO1xuICAgIH1cbiAgICByZXR1cm4gZGlzcG9zYWJsZTtcbiAgfVxuXG4gIF9yZW1vdmVSZXN1bHRzRm9yUHJvdmlkZXIocHJvdmlkZXJOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY2FjaGVkUmVzdWx0c1twcm92aWRlck5hbWVdKSB7XG4gICAgICBkZWxldGUgdGhpcy5fY2FjaGVkUmVzdWx0c1twcm92aWRlck5hbWVdO1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KFJFU1VMVFNfQ0hBTkdFRCk7XG4gICAgfVxuICB9XG5cbiAgc2V0Q2FjaGVSZXN1bHQoXG4gICAgcHJvdmlkZXJOYW1lOiBzdHJpbmcsXG4gICAgZGlyZWN0b3J5OiBzdHJpbmcsXG4gICAgcXVlcnk6IHN0cmluZyxcbiAgICByZXN1bHQ6IEFycmF5PEZpbGVSZXN1bHQ+LFxuICAgIGxvYWRpbmc6ID9ib29sZWFuID0gZmFsc2UsXG4gICAgZXJyb3I6ID9PYmplY3QgPSBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5lbnN1cmVDYWNoZUVudHJ5KHByb3ZpZGVyTmFtZSwgZGlyZWN0b3J5KTtcbiAgICB0aGlzLl9jYWNoZWRSZXN1bHRzW3Byb3ZpZGVyTmFtZV1bZGlyZWN0b3J5XVtxdWVyeV0gPSB7XG4gICAgICByZXN1bHQsXG4gICAgICBsb2FkaW5nLFxuICAgICAgZXJyb3IsXG4gICAgfTtcbiAgICAvLyBSZWZyZXNoIHRoZSB1c2FnZSBmb3IgdGhlIGN1cnJlbnQgcXVlcnkuXG4gICAgdGhpcy5fcXVlcnlMcnVRdWV1ZS5kZWxldGUocXVlcnkpO1xuICAgIHRoaXMuX3F1ZXJ5THJ1UXVldWUuc2V0KHF1ZXJ5LCBudWxsKTtcbiAgICBzZXRJbW1lZGlhdGUodGhpcy5fZGVib3VuY2VkQ2xlYW5DYWNoZSk7XG4gIH1cblxuICBlbnN1cmVDYWNoZUVudHJ5KHByb3ZpZGVyTmFtZTogc3RyaW5nLCBkaXJlY3Rvcnk6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fY2FjaGVkUmVzdWx0c1twcm92aWRlck5hbWVdKSB7XG4gICAgICB0aGlzLl9jYWNoZWRSZXN1bHRzW3Byb3ZpZGVyTmFtZV0gPSB7fTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9jYWNoZWRSZXN1bHRzW3Byb3ZpZGVyTmFtZV1bZGlyZWN0b3J5XSkge1xuICAgICAgdGhpcy5fY2FjaGVkUmVzdWx0c1twcm92aWRlck5hbWVdW2RpcmVjdG9yeV0gPSB7fTtcbiAgICB9XG4gIH1cblxuICBjYWNoZVJlc3VsdChxdWVyeTogc3RyaW5nLCByZXN1bHQ6IEFycmF5PEZpbGVSZXN1bHQ+LCBkaXJlY3Rvcnk6IHN0cmluZywgcHJvdmlkZXI6IE9iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IHByb3ZpZGVyTmFtZSA9IHByb3ZpZGVyLmdldE5hbWUoKTtcbiAgICB0aGlzLnNldENhY2hlUmVzdWx0KHByb3ZpZGVyTmFtZSwgZGlyZWN0b3J5LCBxdWVyeSwgcmVzdWx0LCBmYWxzZSwgbnVsbCk7XG4gIH1cblxuICBfc2V0TG9hZGluZyhxdWVyeTogc3RyaW5nLCBkaXJlY3Rvcnk6IHN0cmluZywgcHJvdmlkZXI6IE9iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IHByb3ZpZGVyTmFtZSA9IHByb3ZpZGVyLmdldE5hbWUoKTtcbiAgICB0aGlzLmVuc3VyZUNhY2hlRW50cnkocHJvdmlkZXJOYW1lLCBkaXJlY3RvcnkpO1xuICAgIGNvbnN0IHByZXZpb3VzUmVzdWx0ID0gdGhpcy5fY2FjaGVkUmVzdWx0c1twcm92aWRlck5hbWVdW2RpcmVjdG9yeV1bcXVlcnldO1xuICAgIGlmICghcHJldmlvdXNSZXN1bHQpIHtcbiAgICAgIHRoaXMuX2NhY2hlZFJlc3VsdHNbcHJvdmlkZXJOYW1lXVtkaXJlY3RvcnldW3F1ZXJ5XSA9IHtcbiAgICAgICAgcmVzdWx0OiBbXSxcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlIHRoZSBvbGRlc3QgY2FjaGVkIHJlc3VsdHMgb25jZSB0aGUgY2FjaGUgaXMgZnVsbC5cbiAgICovXG4gIF9jbGVhbkNhY2hlKCk6IHZvaWQge1xuICAgIGNvbnN0IHF1ZXVlU2l6ZSA9IHRoaXMuX3F1ZXJ5THJ1UXVldWUuc2l6ZTtcbiAgICBpZiAocXVldWVTaXplIDw9IE1BWF9DQUNIRURfUVVFUklFUykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBGaWd1cmUgb3V0IGxlYXN0IHJlY2VudGx5IHVzZWQgcXVlcmllcywgYW5kIHBvcCB0aGVtIG9mZiBvZiB0aGUgYF9xdWVyeUxydVF1ZXVlYCBNYXAuXG4gICAgY29uc3QgZXhwaXJlZFF1ZXJpZXMgPSBbXTtcbiAgICBjb25zdCBrZXlJdGVyYXRvciA9IHRoaXMuX3F1ZXJ5THJ1UXVldWUua2V5cygpO1xuICAgIGNvbnN0IGVudHJpZXNUb1JlbW92ZSA9IHF1ZXVlU2l6ZSAtIE1BWF9DQUNIRURfUVVFUklFUztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVudHJpZXNUb1JlbW92ZTsgaSsrKSB7XG4gICAgICBjb25zdCBmaXJzdEVudHJ5S2V5ID0ga2V5SXRlcmF0b3IubmV4dCgpLnZhbHVlO1xuICAgICAgZXhwaXJlZFF1ZXJpZXMucHVzaChmaXJzdEVudHJ5S2V5KTtcbiAgICAgIGludmFyaWFudChmaXJzdEVudHJ5S2V5ICE9IG51bGwpO1xuICAgICAgdGhpcy5fcXVlcnlMcnVRdWV1ZS5kZWxldGUoZmlyc3RFbnRyeUtleSk7XG4gICAgfVxuXG4gICAgLy8gRm9yIGVhY2ggKHByb3ZpZGVyfGRpcmVjdG9yeSkgcGFpciwgcmVtb3ZlIHJlc3VsdHMgZm9yIGFsbCBleHBpcmVkIHF1ZXJpZXMgZnJvbSB0aGUgY2FjaGUuXG4gICAgZm9yIChjb25zdCBwcm92aWRlck5hbWUgaW4gdGhpcy5fY2FjaGVkUmVzdWx0cykge1xuICAgICAgZm9yIChjb25zdCBkaXJlY3RvcnkgaW4gdGhpcy5fY2FjaGVkUmVzdWx0c1twcm92aWRlck5hbWVdKSB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5UmVzdWx0cyA9IHRoaXMuX2NhY2hlZFJlc3VsdHNbcHJvdmlkZXJOYW1lXVtkaXJlY3RvcnldO1xuICAgICAgICBleHBpcmVkUXVlcmllcy5mb3JFYWNoKHF1ZXJ5ID0+IGRlbGV0ZSBxdWVyeVJlc3VsdHNbcXVlcnldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KFJFU1VMVFNfQ0hBTkdFRCk7XG4gIH1cblxuICBwcm9jZXNzUmVzdWx0KFxuICAgIHF1ZXJ5OiBzdHJpbmcsXG4gICAgcmVzdWx0OiBBcnJheTxGaWxlUmVzdWx0PixcbiAgICBkaXJlY3Rvcnk6IHN0cmluZyxcbiAgICBwcm92aWRlcjogT2JqZWN0XG4gICk6IHZvaWQge1xuICAgIHRoaXMuY2FjaGVSZXN1bHQoLi4uYXJndW1lbnRzKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoUkVTVUxUU19DSEFOR0VEKTtcbiAgfVxuXG4gIHNhbml0aXplUXVlcnkocXVlcnk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHF1ZXJ5LnRyaW0oKTtcbiAgfVxuXG4gIGFzeW5jIGV4ZWN1dGVRdWVyeShyYXdRdWVyeTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcXVlcnkgPSB0aGlzLnNhbml0aXplUXVlcnkocmF3UXVlcnkpO1xuICAgIGZvciAoY29uc3QgZ2xvYmFsUHJvdmlkZXIgb2YgdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVyc1tHTE9CQUxfS0VZXS52YWx1ZXMoKSkge1xuICAgICAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBnbG9iYWxQcm92aWRlci5leGVjdXRlUXVlcnkocXVlcnkpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgdHJhY2soQW5hbHl0aWNzRXZlbnRzLlFVRVJZX1NPVVJDRV9QUk9WSURFUiwge1xuICAgICAgICAgICdxdWlja29wZW4tc291cmNlLXByb3ZpZGVyJzogZ2xvYmFsUHJvdmlkZXIuZ2V0TmFtZSgpLFxuICAgICAgICAgICdxdWlja29wZW4tcXVlcnktZHVyYXRpb24nOiAocGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFRpbWUpLnRvU3RyaW5nKCksXG4gICAgICAgICAgJ3F1aWNrb3Blbi1yZXN1bHQtY291bnQnOiAocmVzdWx0Lmxlbmd0aCkudG9TdHJpbmcoKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucHJvY2Vzc1Jlc3VsdChxdWVyeSwgcmVzdWx0LCBHTE9CQUxfS0VZLCBnbG9iYWxQcm92aWRlcik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3NldExvYWRpbmcocXVlcnksIEdMT0JBTF9LRVksIGdsb2JhbFByb3ZpZGVyKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3Byb3ZpZGVyc0J5RGlyZWN0b3J5LnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fZGlyZWN0b3JpZXMuZm9yRWFjaChkaXJlY3RvcnkgPT4ge1xuICAgICAgY29uc3QgcGF0aCA9IGRpcmVjdG9yeS5nZXRQYXRoKCk7XG4gICAgICBjb25zdCBwcm92aWRlcnMgPSB0aGlzLl9wcm92aWRlcnNCeURpcmVjdG9yeS5nZXQoZGlyZWN0b3J5KTtcbiAgICAgIGlmICghcHJvdmlkZXJzKSB7XG4gICAgICAgIC8vIFNwZWNpYWwgZGlyZWN0b3JpZXMgbGlrZSBcImF0b206Ly9hYm91dFwiXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgZGlyZWN0b3J5UHJvdmlkZXIgb2YgcHJvdmlkZXJzKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICBkaXJlY3RvcnlQcm92aWRlci5leGVjdXRlUXVlcnkocXVlcnksIGRpcmVjdG9yeSkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgIHRyYWNrKEFuYWx5dGljc0V2ZW50cy5RVUVSWV9TT1VSQ0VfUFJPVklERVIsIHtcbiAgICAgICAgICAgICdxdWlja29wZW4tc291cmNlLXByb3ZpZGVyJzogZGlyZWN0b3J5UHJvdmlkZXIuZ2V0TmFtZSgpLFxuICAgICAgICAgICAgJ3F1aWNrb3Blbi1xdWVyeS1kdXJhdGlvbic6IChwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZSkudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICdxdWlja29wZW4tcmVzdWx0LWNvdW50JzogKHJlc3VsdC5sZW5ndGgpLnRvU3RyaW5nKCksXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5wcm9jZXNzUmVzdWx0KHF1ZXJ5LCByZXN1bHQsIHBhdGgsIGRpcmVjdG9yeVByb3ZpZGVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3NldExvYWRpbmcocXVlcnksIHBhdGgsIGRpcmVjdG9yeVByb3ZpZGVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoUkVTVUxUU19DSEFOR0VEKTtcbiAgfVxuXG4gIF9pc0dsb2JhbFByb3ZpZGVyKHByb3ZpZGVyTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnNbR0xPQkFMX0tFWV0uaGFzKHByb3ZpZGVyTmFtZSk7XG4gIH1cblxuICBfZ2V0UHJvdmlkZXJCeU5hbWUocHJvdmlkZXJOYW1lOiBzdHJpbmcpOiBQcm92aWRlciB7XG4gICAgbGV0IGRpclByb3ZpZGVyTmFtZTtcbiAgICBpZiAodGhpcy5faXNHbG9iYWxQcm92aWRlcihwcm92aWRlck5hbWUpKSB7XG4gICAgICBkaXJQcm92aWRlck5hbWUgPSB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzW0dMT0JBTF9LRVldLmdldChwcm92aWRlck5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaXJQcm92aWRlck5hbWUgPSB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzW0RJUkVDVE9SWV9LRVldLmdldChwcm92aWRlck5hbWUpO1xuICAgIH1cbiAgICBpbnZhcmlhbnQoXG4gICAgICBkaXJQcm92aWRlck5hbWUgIT0gbnVsbCxcbiAgICAgIGBQcm92aWRlciAke3Byb3ZpZGVyTmFtZX0gaXMgbm90IHJlZ2lzdGVyZWQgd2l0aCBxdWljay1vcGVuLmBcbiAgICApO1xuICAgIHJldHVybiBkaXJQcm92aWRlck5hbWU7XG4gIH1cblxuICBfZ2V0UmVzdWx0c0ZvclByb3ZpZGVyKHF1ZXJ5OiBzdHJpbmcsIHByb3ZpZGVyTmFtZTogc3RyaW5nKTogT2JqZWN0IHtcbiAgICBjb25zdCBwcm92aWRlclBhdGhzID0gdGhpcy5faXNHbG9iYWxQcm92aWRlcihwcm92aWRlck5hbWUpXG4gICAgICA/IFtHTE9CQUxfS0VZXVxuICAgICAgOiB0aGlzLl9kaXJlY3Rvcmllcy5tYXAoZCA9PiBkLmdldFBhdGgoKSk7XG4gICAgY29uc3QgcHJvdmlkZXIgPSB0aGlzLl9nZXRQcm92aWRlckJ5TmFtZShwcm92aWRlck5hbWUpO1xuICAgIHJldHVybiB7XG4gICAgICB0aXRsZTogcHJvdmlkZXIuZ2V0VGFiVGl0bGUoKSxcbiAgICAgIHJlc3VsdHM6IHByb3ZpZGVyUGF0aHMucmVkdWNlKChyZXN1bHRzLCBwYXRoKSA9PiB7XG4gICAgICAgIGxldCBjYWNoZWRQYXRocywgY2FjaGVkUXVlcmllcywgY2FjaGVkUmVzdWx0O1xuICAgICAgICBpZiAoIShcbiAgICAgICAgICAoY2FjaGVkUGF0aHMgPSB0aGlzLl9jYWNoZWRSZXN1bHRzW3Byb3ZpZGVyTmFtZV0pICYmXG4gICAgICAgICAgKGNhY2hlZFF1ZXJpZXMgPSBjYWNoZWRQYXRoc1twYXRoXSkgJiZcbiAgICAgICAgICAoY2FjaGVkUmVzdWx0ID0gY2FjaGVkUXVlcmllc1txdWVyeV0pXG4gICAgICAgICkpIHtcbiAgICAgICAgICBjYWNoZWRSZXN1bHQgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWZhdWx0UmVzdWx0ID0gZ2V0RGVmYXVsdFJlc3VsdCgpO1xuICAgICAgICBjb25zdCByZXN1bHRMaXN0ID0gY2FjaGVkUmVzdWx0LnJlc3VsdCB8fCBkZWZhdWx0UmVzdWx0LnJlc3VsdHM7XG4gICAgICAgIHJlc3VsdHNbcGF0aF0gPSB7XG4gICAgICAgICAgcmVzdWx0czogcmVzdWx0TGlzdC5tYXAocmVzdWx0ID0+ICh7Li4ucmVzdWx0LCBzb3VyY2VQcm92aWRlcjogcHJvdmlkZXJOYW1lfSkpLFxuICAgICAgICAgIGxvYWRpbmc6IGNhY2hlZFJlc3VsdC5sb2FkaW5nIHx8IGRlZmF1bHRSZXN1bHQubG9hZGluZyxcbiAgICAgICAgICBlcnJvcjogY2FjaGVkUmVzdWx0LmVycm9yIHx8IGRlZmF1bHRSZXN1bHQuZXJyb3IsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgfSwge30pLFxuICAgIH07XG4gIH1cblxuICBnZXRSZXN1bHRzKHF1ZXJ5OiBzdHJpbmcsIGFjdGl2ZVByb3ZpZGVyTmFtZTogc3RyaW5nKTogT2JqZWN0IHtcbiAgICBjb25zdCBzYW5pdGl6ZWRRdWVyeSA9IHRoaXMuc2FuaXRpemVRdWVyeShxdWVyeSk7XG4gICAgaWYgKGFjdGl2ZVByb3ZpZGVyTmFtZSA9PT0gT01OSVNFQVJDSF9QUk9WSURFUi5uYW1lKSB7XG4gICAgICBjb25zdCBvbW5pU2VhcmNoUmVzdWx0cyA9IFt7fV07XG4gICAgICBmb3IgKGNvbnN0IHByb3ZpZGVyTmFtZSBpbiB0aGlzLl9jYWNoZWRSZXN1bHRzKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdEZvclByb3ZpZGVyID0gdGhpcy5fZ2V0UmVzdWx0c0ZvclByb3ZpZGVyKHNhbml0aXplZFF1ZXJ5LCBwcm92aWRlck5hbWUpO1xuICAgICAgICAvLyBUT0RPIHJlcGxhY2UgdGhpcyB3aXRoIGEgcmFua2luZyBhbGdvcml0aG0uXG4gICAgICAgIGZvciAoY29uc3QgZGlyIGluIHJlc3VsdEZvclByb3ZpZGVyLnJlc3VsdHMpIHtcbiAgICAgICAgICByZXN1bHRGb3JQcm92aWRlci5yZXN1bHRzW2Rpcl0ucmVzdWx0cyA9XG4gICAgICAgICAgICByZXN1bHRGb3JQcm92aWRlci5yZXN1bHRzW2Rpcl0ucmVzdWx0cy5zbGljZSgwLCBNQVhfT01OSV9SRVNVTFRTX1BFUl9TRVJWSUNFKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPIHJlcGxhY2UgYHBhcnRpYWxgIHdpdGggY29tcHV0ZWQgcHJvcGVydHkgd2hlbmV2ZXIgRmxvdyBzdXBwb3J0cyBpdC5cbiAgICAgICAgY29uc3QgcGFydGlhbCA9IHt9O1xuICAgICAgICBwYXJ0aWFsW3Byb3ZpZGVyTmFtZV0gPSByZXN1bHRGb3JQcm92aWRlcjtcbiAgICAgICAgb21uaVNlYXJjaFJlc3VsdHMucHVzaChwYXJ0aWFsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduLmFwcGx5KG51bGwsIG9tbmlTZWFyY2hSZXN1bHRzKTtcbiAgICB9XG4gICAgLy8gVE9ETyByZXBsYWNlIGBwYXJ0aWFsYCB3aXRoIGNvbXB1dGVkIHByb3BlcnR5IHdoZW5ldmVyIEZsb3cgc3VwcG9ydHMgaXQuXG4gICAgY29uc3QgcGFydGlhbCA9IHt9O1xuICAgIHBhcnRpYWxbYWN0aXZlUHJvdmlkZXJOYW1lXSA9IHRoaXMuX2dldFJlc3VsdHNGb3JQcm92aWRlcihzYW5pdGl6ZWRRdWVyeSwgYWN0aXZlUHJvdmlkZXJOYW1lKTtcbiAgICByZXR1cm4gcGFydGlhbDtcbiAgfVxuXG4gIGdldFByb3ZpZGVyQnlOYW1lKHByb3ZpZGVyTmFtZTogc3RyaW5nKTogUHJvdmlkZXJTcGVjIHtcbiAgICBpZiAocHJvdmlkZXJOYW1lID09PSBPTU5JU0VBUkNIX1BST1ZJREVSLm5hbWUpIHtcbiAgICAgIHJldHVybiB7Li4uT01OSVNFQVJDSF9QUk9WSURFUn07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9iYWtlUHJvdmlkZXIodGhpcy5fZ2V0UHJvdmlkZXJCeU5hbWUocHJvdmlkZXJOYW1lKSk7XG4gIH1cblxuICAvKipcbiAgICogVHVybiBhIFByb3ZpZGVyIGludG8gYSBwbGFpbiBcInNwZWNcIiBvYmplY3QgY29uc3VtZWQgYnkgUXVpY2tTZWxlY3Rpb25Db21wb25lbnQuXG4gICAqL1xuICBfYmFrZVByb3ZpZGVyKHByb3ZpZGVyOiBQcm92aWRlcik6IFByb3ZpZGVyU3BlYyB7XG4gICAgY29uc3QgcHJvdmlkZXJOYW1lID0gcHJvdmlkZXIuZ2V0TmFtZSgpO1xuICAgIHJldHVybiB7XG4gICAgICBhY3Rpb246IHByb3ZpZGVyLmdldEFjdGlvbiAmJiBwcm92aWRlci5nZXRBY3Rpb24oKSB8fCAnJyxcbiAgICAgIGRlYm91bmNlRGVsYXk6ICh0eXBlb2YgcHJvdmlkZXIuZ2V0RGVib3VuY2VEZWxheSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgPyBwcm92aWRlci5nZXREZWJvdW5jZURlbGF5KClcbiAgICAgICAgOiBERUZBVUxUX1FVRVJZX0RFQk9VTkNFX0RFTEFZLFxuICAgICAgbmFtZTogcHJvdmlkZXJOYW1lLFxuICAgICAgcHJvbXB0OiBwcm92aWRlci5nZXRQcm9tcHRUZXh0ICYmIHByb3ZpZGVyLmdldFByb21wdFRleHQoKSB8fFxuICAgICAgICAnU2VhcmNoICcgKyBwcm92aWRlck5hbWUsXG4gICAgICB0aXRsZTogcHJvdmlkZXIuZ2V0VGFiVGl0bGUgJiYgcHJvdmlkZXIuZ2V0VGFiVGl0bGUoKSB8fCBwcm92aWRlck5hbWUsXG4gICAgfTtcbiAgfVxuXG4gIGdldFJlbmRlcmFibGVQcm92aWRlcnMoKTogQXJyYXk8UHJvdmlkZXJTcGVjPiB7XG4gICAgLy8gT25seSByZW5kZXIgdGFicyBmb3IgcHJvdmlkZXJzIHRoYXQgYXJlIGVsaWdpYmxlIGZvciBhdCBsZWFzdCBvbmUgZGlyZWN0b3J5LlxuICAgIGNvbnN0IGVsaWdpYmxlRGlyZWN0b3J5UHJvdmlkZXJzID0gQXJyYXkuZnJvbSh0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzW0RJUkVDVE9SWV9LRVldLnZhbHVlcygpKVxuICAgICAgLmZpbHRlcihwcm92aWRlciA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgcHJvdmlkZXJzIG9mIHRoaXMuX3Byb3ZpZGVyc0J5RGlyZWN0b3J5LnZhbHVlcygpKSB7XG4gICAgICAgICAgaWYgKHByb3ZpZGVycy5oYXMocHJvdmlkZXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgY29uc3QgdGFicyA9IEFycmF5LmZyb20odGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVyc1tHTE9CQUxfS0VZXS52YWx1ZXMoKSlcbiAgICAgIC5jb25jYXQoZWxpZ2libGVEaXJlY3RvcnlQcm92aWRlcnMpXG4gICAgICAuZmlsdGVyKHByb3ZpZGVyID0+IHByb3ZpZGVyLmlzUmVuZGVyYWJsZSgpKVxuICAgICAgLm1hcCh0aGlzLl9iYWtlUHJvdmlkZXIpXG4gICAgICAuc29ydCgocDEsIHAyKSA9PiBwMS5uYW1lLmxvY2FsZUNvbXBhcmUocDIubmFtZSkpO1xuICAgIHRhYnMudW5zaGlmdChPTU5JU0VBUkNIX1BST1ZJREVSKTtcbiAgICByZXR1cm4gdGFicztcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaFJlc3VsdE1hbmFnZXI7XG5cbmV4cG9ydCBjb25zdCBfX3Rlc3RfXyA9IHtcbiAgX2dldE9tbmlTZWFyY2hQcm92aWRlclNwZWMoKTogUHJvdmlkZXJTcGVjIHtcbiAgICByZXR1cm4gT01OSVNFQVJDSF9QUk9WSURFUjtcbiAgfSxcbn07XG4iXX0=