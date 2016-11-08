'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _reactForAtom = require('react-for-atom');

var _atom = require('atom');

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _QuickSelectionDispatcher;

function _load_QuickSelectionDispatcher() {
  return _QuickSelectionDispatcher = _interopRequireDefault(require('./QuickSelectionDispatcher'));
}

var _QuickSelectionDispatcher2;

function _load_QuickSelectionDispatcher2() {
  return _QuickSelectionDispatcher2 = require('./QuickSelectionDispatcher');
}

var _QuickSelectionActions;

function _load_QuickSelectionActions() {
  return _QuickSelectionActions = _interopRequireDefault(require('./QuickSelectionActions'));
}

var _FileResultComponent;

function _load_FileResultComponent() {
  return _FileResultComponent = _interopRequireDefault(require('./FileResultComponent'));
}

var _ResultCache;

function _load_ResultCache() {
  return _ResultCache = _interopRequireDefault(require('./ResultCache'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _global = global;
const performance = _global.performance;


function getDefaultResult() {
  return {
    error: null,
    loading: false,
    results: []
  };
}

const AnalyticsEvents = Object.freeze({
  QUERY_SOURCE_PROVIDER: 'quickopen-query-source-provider'
});

const RESULTS_CHANGED = 'results_changed';
const PROVIDERS_CHANGED = 'providers_changed';
const MAX_OMNI_RESULTS_PER_SERVICE = 5;
const DEFAULT_QUERY_DEBOUNCE_DELAY = 200;
const LOADING_EVENT_DELAY = 200;
const OMNISEARCH_PROVIDER = {
  action: 'nuclide-quick-open:find-anything-via-omni-search',
  debounceDelay: DEFAULT_QUERY_DEBOUNCE_DELAY,
  name: 'OmniSearchResultProvider',
  prompt: 'Search for anything...',
  title: 'OmniSearch',
  priority: 0
};
const UPDATE_DIRECTORIES_DEBOUNCE_DELAY = 100;
const GLOBAL_KEY = 'global';
const DIRECTORY_KEY = 'directory';

function isValidProvider(provider) {
  return typeof provider.getProviderType === 'function' && typeof provider.getName === 'function' && typeof provider.getName() === 'string' && typeof provider.isRenderable === 'function' && typeof provider.executeQuery === 'function' && typeof provider.getTabTitle === 'function';
}

let searchResultManagerInstance = null;
/**
 * A singleton cache for search providers and results.
 */
let SearchResultManager = class SearchResultManager {

  static getInstance() {
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
    this._currentWorkingRoot = null;
    this._resultCache = new (_ResultCache || _load_ResultCache()).default(() => {
      // on result changed
      this._emitter.emit(RESULTS_CHANGED);
    });
    // `updateDirectories` joins providers and directories, which don't know anything about each
    // other. Debounce this call to reduce churn at startup, and when new providers get activated or
    // a new directory gets mounted.
    this._debouncedUpdateDirectories = (0, (_debounce || _load_debounce()).default)(() => this._updateDirectories(), UPDATE_DIRECTORIES_DEBOUNCE_DELAY,
    /* immediate */false);
    this._emitter = new _atom.Emitter();
    this._subscriptions = new _atom.CompositeDisposable();
    this._dispatcher = (_QuickSelectionDispatcher || _load_QuickSelectionDispatcher()).default.getInstance();
    // Check is required for testing.
    if (atom.project) {
      this._subscriptions.add(atom.project.onDidChangePaths(this._debouncedUpdateDirectories.bind(this)));
      this._debouncedUpdateDirectories();
    }
    this._setUpFlux();
    this._activeProviderName = OMNISEARCH_PROVIDER.name;
  }

  _setUpFlux() {
    this._dispatcherToken = this._dispatcher.register(action => {
      switch (action.actionType) {
        case (_QuickSelectionDispatcher2 || _load_QuickSelectionDispatcher2()).ActionTypes.QUERY:
          this.executeQuery(action.query);
          break;
        case (_QuickSelectionDispatcher2 || _load_QuickSelectionDispatcher2()).ActionTypes.ACTIVE_PROVIDER_CHANGED:
          this._activeProviderName = action.providerName;
          this._emitter.emit(PROVIDERS_CHANGED);
          break;
      }
    });
  }

  getActiveProviderName() {
    return this._activeProviderName;
  }

  getRendererForProvider(providerName) {
    const provider = this._getProviderByName(providerName);
    if (!provider || !provider.getComponentForItem) {
      return (_FileResultComponent || _load_FileResultComponent()).default.getComponentForItem;
    }
    return provider.getComponentForItem;
  }

  dispose() {
    this._isDisposed = true;
    this._subscriptions.dispose();
  }

  /**
   * Renew the cached list of directories, as well as the cached map of eligible providers
   * for every directory.
   */
  _updateDirectories() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const newDirectories = atom.project.getDirectories();
      const newProvidersByDirectories = new Map();
      const eligibilities = [];
      newDirectories.forEach(function (directory) {
        newProvidersByDirectories.set(directory, new Set());
        for (const provider of _this._registeredProviders[DIRECTORY_KEY].values()) {
          if (!(provider.isEligibleForDirectory != null)) {
            throw new Error(`Directory provider ${ provider.getName() } must provide \`isEligibleForDirectory()\`.`);
          }

          eligibilities.push(provider.isEligibleForDirectory(directory).then(function (isEligible) {
            return {
              isEligible: isEligible,
              provider: provider,
              directory: directory
            };
          }).catch(function (err) {
            (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn(`isEligibleForDirectory failed for directory provider ${ provider.getName() }`, err);
            return {
              isEligible: false,
              provider: provider,
              directory: directory
            };
          }));
        }
      });
      const resolvedEligibilities = yield Promise.all(eligibilities);
      for (const eligibility of resolvedEligibilities) {
        const provider = eligibility.provider,
              isEligible = eligibility.isEligible,
              directory = eligibility.directory;

        if (isEligible) {
          const providersForDirectory = newProvidersByDirectories.get(directory);

          if (!(providersForDirectory != null)) {
            throw new Error(`Providers for directory ${ directory.getPath() } not defined`);
          }

          providersForDirectory.add(provider);
        }
      }
      _this._directories = newDirectories;
      _this._providersByDirectory = newProvidersByDirectories;
      _this._emitter.emit(PROVIDERS_CHANGED);
    })();
  }

  on(name, callback) {
    return this._emitter.on(name, callback);
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

  registerProvider(service) {
    if (!isValidProvider(service)) {
      const providerName = service.getName && service.getName() || '<unknown>';
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Quick-open provider ${ providerName } is not a valid provider`);
    }
    const isRenderableProvider = typeof service.isRenderable === 'function' && service.isRenderable();
    const isGlobalProvider = service.getProviderType() === 'GLOBAL';
    const targetRegistry = isGlobalProvider ? this._registeredProviders[GLOBAL_KEY] : this._registeredProviders[DIRECTORY_KEY];
    targetRegistry.set(service.getName(), service);
    if (!isGlobalProvider) {
      this._debouncedUpdateDirectories();
    }
    const disposable = new _atom.CompositeDisposable();
    disposable.add(new _atom.Disposable(() => {
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
      // Reset the active provider to omnisearch if the disposed service is
      // the current active provider.
      if (serviceName === this._activeProviderName) {
        this._activeProviderName = OMNISEARCH_PROVIDER.name;
      }
      this._resultCache.removeResultsForProvider(serviceName);
      this._emitter.emit(PROVIDERS_CHANGED);
    }));
    // If the provider is renderable and specifies a keybinding, wire it up with the toggle command.
    if (isRenderableProvider && typeof service.getAction === 'function') {
      const toggleAction = service.getAction();
      // TODO replace with computed property once Flow supports it.
      const actionSpec = {};
      actionSpec[toggleAction] = () => (_QuickSelectionActions || _load_QuickSelectionActions()).default.changeActiveProvider(service.getName());
      disposable.add(atom.commands.add('atom-workspace', actionSpec));
    }
    return disposable;
  }

  cacheResult(query, result, directory, provider) {
    const providerName = provider.getName();
    this._resultCache.setCacheResult(providerName, directory, query, result, false, null);
  }

  _setLoading(query, directory, provider) {
    const providerName = provider.getName();
    const previousResult = this._resultCache.getCacheResult(providerName, directory, query);

    if (!previousResult) {
      this._resultCache.rawSetCacheResult(providerName, directory, query, {
        results: [],
        error: null,
        loading: true
      });
    }
  }

  processResult(query, result, directory, provider) {
    this.cacheResult(query, result, directory, provider);
    this._emitter.emit(RESULTS_CHANGED);
  }

  sanitizeQuery(query) {
    return query.trim();
  }

  executeQuery(rawQuery) {
    const query = this.sanitizeQuery(rawQuery);
    for (const globalProvider of this._registeredProviders[GLOBAL_KEY].values()) {
      const startTime = performance.now();
      const loadingFn = () => {
        this._setLoading(query, GLOBAL_KEY, globalProvider);
        this._emitter.emit(RESULTS_CHANGED);
      };
      (0, (_promise || _load_promise()).triggerAfterWait)(globalProvider.executeQuery(query), LOADING_EVENT_DELAY, loadingFn).then(result => {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.QUERY_SOURCE_PROVIDER, {
          'quickopen-source-provider': globalProvider.getName(),
          'quickopen-query-duration': (performance.now() - startTime).toString(),
          'quickopen-result-count': result.length.toString()
        });
        this.processResult(query, result, GLOBAL_KEY, globalProvider);
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
          this._emitter.emit(RESULTS_CHANGED);
        };
        (0, (_promise || _load_promise()).triggerAfterWait)(directoryProvider.executeQuery(query, directory), LOADING_EVENT_DELAY, loadingFn).then(result => {
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.QUERY_SOURCE_PROVIDER, {
            'quickopen-source-provider': directoryProvider.getName(),
            'quickopen-query-duration': (performance.now() - startTime).toString(),
            'quickopen-result-count': result.length.toString()
          });
          this.processResult(query, result, path, directoryProvider);
        });
      }
    });
  }

  _isGlobalProvider(providerName) {
    return this._registeredProviders[GLOBAL_KEY].has(providerName);
  }

  _getProviderByName(providerName) {
    let dirProviderName;
    if (this._isGlobalProvider(providerName)) {
      dirProviderName = this._registeredProviders[GLOBAL_KEY].get(providerName);
    } else {
      dirProviderName = this._registeredProviders[DIRECTORY_KEY].get(providerName);
    }

    if (!(dirProviderName != null)) {
      throw new Error(`Provider ${ providerName } is not registered with quick-open.`);
    }

    return dirProviderName;
  }

  _getResultsForProvider(query, providerName) {
    const providerPaths = this._isGlobalProvider(providerName) ? [GLOBAL_KEY] : this._sortDirectories().map(d => d.getPath());
    const provider = this._getProviderByName(providerName);
    const lastCachedQuery = this._resultCache.getLastCachedQuery(providerName);
    return {
      title: provider.getTabTitle(),
      results: providerPaths.reduce((results, path) => {
        let cachedPaths;
        let cachedQueries;
        let cachedResult;
        if (!((cachedPaths = this._resultCache.getAllCachedResults()[providerName]) && (cachedQueries = cachedPaths[path]) && ((cachedResult = cachedQueries[query]) ||
        // If the current query hasn't returned anything yet, try the last cached result.
        lastCachedQuery != null && (cachedResult = cachedQueries[lastCachedQuery])))) {
          cachedResult = {};
        }
        const defaultResult = getDefaultResult();
        const resultList = cachedResult.results || defaultResult.results;
        results[path] = {
          results: resultList.map(result => Object.assign({}, result, { sourceProvider: providerName })),
          loading: cachedResult.loading || defaultResult.loading,
          error: cachedResult.error || defaultResult.error
        };
        return results;
      }, {})
    };
  }

  getResults(query, activeProviderName) {
    const sanitizedQuery = this.sanitizeQuery(query);
    if (activeProviderName === OMNISEARCH_PROVIDER.name) {
      const omniSearchResults = [{}];
      for (const providerName in this._resultCache.getAllCachedResults()) {
        const resultForProvider = this._getResultsForProvider(sanitizedQuery, providerName);
        // TODO replace this with a ranking algorithm.
        for (const dir in resultForProvider.results) {
          resultForProvider.results[dir].results = resultForProvider.results[dir].results.slice(0, MAX_OMNI_RESULTS_PER_SERVICE);
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

  getProviderByName(providerName) {
    if (providerName === OMNISEARCH_PROVIDER.name) {
      return Object.assign({}, OMNISEARCH_PROVIDER);
    }
    return this._bakeProvider(this._getProviderByName(providerName));
  }

  /**
   * Turn a Provider into a plain "spec" object consumed by QuickSelectionComponent.
   */
  _bakeProvider(provider) {
    const providerName = provider.getName();
    const providerSpec = {
      action: provider.getAction && provider.getAction() || '',
      debounceDelay: typeof provider.getDebounceDelay === 'function' ? provider.getDebounceDelay() : DEFAULT_QUERY_DEBOUNCE_DELAY,
      name: providerName,
      prompt: provider.getPromptText && provider.getPromptText() || 'Search ' + providerName,
      title: provider.getTabTitle && provider.getTabTitle() || providerName
    };
    // $FlowIssue priority property is optional
    providerSpec.priority = typeof provider.getPriority === 'function' ? provider.getPriority() : Number.POSITIVE_INFINITY;
    return providerSpec;
  }

  getRenderableProviders() {
    // Only render tabs for providers that are eligible for at least one directory.
    const eligibleDirectoryProviders = Array.from(this._registeredProviders[DIRECTORY_KEY].values()).filter(provider => {
      for (const providers of this._providersByDirectory.values()) {
        if (providers.has(provider)) {
          return true;
        }
      }
      return false;
    });
    const tabs = Array.from(this._registeredProviders[GLOBAL_KEY].values()).concat(eligibleDirectoryProviders).filter(provider => provider.isRenderable()).map(this._bakeProvider).sort((p1, p2) => p1.name.localeCompare(p2.name));
    tabs.unshift(OMNISEARCH_PROVIDER);
    return tabs;
  }

};
exports.default = SearchResultManager;
const __test__ = exports.__test__ = {
  _getOmniSearchProviderSpec: function () {
    return OMNISEARCH_PROVIDER;
  }
};