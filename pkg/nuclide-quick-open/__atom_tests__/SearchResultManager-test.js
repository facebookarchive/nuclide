"use strict";

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _SearchResultManager() {
  const data = _interopRequireWildcard(require("../lib/SearchResultManager"));

  _SearchResultManager = function () {
    return data;
  };

  return data;
}

function _QuickOpenProviderRegistry() {
  const data = _interopRequireDefault(require("../lib/QuickOpenProviderRegistry"));

  _QuickOpenProviderRegistry = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
const {
  _getOmniSearchProviderSpec
} = _SearchResultManager().__test__;

const PROJECT_ROOT1 = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures/root1');

const PROJECT_ROOT2 = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures/root2');

const PROJECT_ROOT3 = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures/root3');

const FakeProvider = {
  providerType: 'GLOBAL',
  name: 'FakeProvider',
  display: {
    title: 'Fake',
    prompt: 'Search FakeProvider',
    canOpenAll: false
  },
  isEligibleForDirectories: directories => Promise.resolve(true),
  executeQuery: (query, directories) => Promise.resolve([])
};
const FakeProviderSpec = Object.freeze({
  action: '',
  canOpenAll: false,
  debounceDelay: 200,
  name: 'FakeProvider',
  prompt: 'Search FakeProvider',
  title: 'Fake',
  priority: Number.POSITIVE_INFINITY
});
const TEST_STRINGS = ['yolo', 'foo', 'bar'];
const ExactStringMatchProvider = Object.freeze({
  providerType: 'GLOBAL',
  name: 'ExactStringMatchProvider',
  display: {
    title: 'ExactString',
    prompt: 'Nothing to see here'
  },
  isEligibleForDirectories: directories => Promise.resolve(true),
  executeQuery: (query, directories) => Promise.resolve(TEST_STRINGS.filter(s => s === query).map(s => ({
    resultType: 'FILE',
    path: s
  })))
}); // Promise-ify the flux cycle around SearchResultManager::executeQuery.

function querySingleProvider(searchResultManager, query, providerName) {
  return new Promise((resolve, reject) => {
    searchResultManager.onResultsChanged(() => {
      resolve(searchResultManager.getResults(query, providerName));
    });
    searchResultManager.executeQuery(query);
  });
}

function queryOmniSearchProvider(quickOpenProviderRegistry, searchResultManager, query) {
  return new Promise((resolve, reject) => {
    let pendingUpdates = quickOpenProviderRegistry.getProviders().length;
    searchResultManager.onResultsChanged(() => {
      if (--pendingUpdates === 0) {
        resolve(searchResultManager.getResults(query, 'OmniSearchResultProvider'));
      }
    });
    searchResultManager.executeQuery(query);
  });
} // Helper to construct expected result objects for a global provider.


function constructSingleProviderResult(provider, result) {
  const groupResult = {
    priority: provider.priority != null ? provider.priority : Number.POSITIVE_INFINITY,
    title: provider.display != null ? provider.display.title : provider.name,
    results: {
      global: Object.assign({}, result)
    },
    totalResults: 0
  };
  return {
    [provider.name]: groupResult
  };
}

describe('SearchResultManager', () => {
  let searchResultManager = null;
  let quickOpenProviderRegistry = null;
  let providersChanged;
  beforeEach(() => {
    quickOpenProviderRegistry = new (_QuickOpenProviderRegistry().default)();
    searchResultManager = new (_SearchResultManager().default)(quickOpenProviderRegistry);
    providersChanged = new Promise(resolve => {
      return searchResultManager.onProvidersChanged(resolve);
    });
  });
  afterEach(() => {
    searchResultManager.dispose();
  });
  describe('getLastQuery', () => {
    it('should store the raw query', () => {
      expect(searchResultManager.getLastQuery()).toBe(null);
      searchResultManager.executeQuery('aaa');
      expect(searchResultManager.getLastQuery()).toBe('aaa');
      searchResultManager.executeQuery('  aaa  ');
      expect(searchResultManager.getLastQuery()).toBe('  aaa  ');
    });
  });
  describe('getRenderableProviders', () => {
    it('Should return OmniSearchProvider even if no actual providers are available.', () => {
      const renderableProviders = searchResultManager.getRenderableProviders();
      expect(renderableProviders).toEqual([_getOmniSearchProviderSpec()]);
    });
  });
  describe('provider/directory cache', () => {
    it('updates the cache when providers become (un)available', async () => {
      await (async () => {
        let providersChangedCallCount = 0;
        searchResultManager.onProvidersChanged(() => {
          providersChangedCallCount++;
        });
        const fakeProviderDisposable = quickOpenProviderRegistry.addProvider(FakeProvider); // We want to await until updateDirectories has finished, but we don't
        // have access to its returned Promise. So instead we'll await until
        // it finally emits 'providers-changed'.

        await providersChanged;
        let renderableProviders = searchResultManager.getRenderableProviders();
        expect(renderableProviders.length).toEqual(2);
        expect(renderableProviders[1]).toEqual(FakeProviderSpec);
        expect(providersChangedCallCount).toEqual(1); // Simulate deactivation of FakeProvider
        // The dispose method has immediate effect: no debouncing, no need to await.

        fakeProviderDisposable.dispose();
        renderableProviders = searchResultManager.getRenderableProviders();
        expect(renderableProviders.length).toEqual(1);
        expect(providersChangedCallCount).toEqual(2);
      })();
    });
  });
  describe.skip('querying providers', () => {
    it('queries providers asynchronously, emits change events and returns filtered results', async () => {
      quickOpenProviderRegistry.addProvider(ExactStringMatchProvider);
      await providersChanged;
      expect((await querySingleProvider(searchResultManager, 'yolo', 'ExactStringMatchProvider'))).toEqual(constructSingleProviderResult(ExactStringMatchProvider, {
        results: [{
          resultType: 'FILE',
          path: 'yolo',
          sourceProvider: 'ExactStringMatchProvider'
        }],
        loading: false,
        error: null
      }));
    });
    it('ignores trailing whitespace in querystring.', async () => {
      quickOpenProviderRegistry.addProvider(ExactStringMatchProvider);
      await providersChanged;
      await Promise.all(['   yolo', 'yolo   ', '   yolo   \n '].map(async query => {
        expect((await querySingleProvider(searchResultManager, query, 'ExactStringMatchProvider'))).toEqual(constructSingleProviderResult(ExactStringMatchProvider, {
          results: [{
            resultType: 'FILE',
            path: query.trim(),
            sourceProvider: 'ExactStringMatchProvider'
          }],
          loading: false,
          error: null
        }));
      }));
    });
  });
  describe.skip('OmniSearch provider sorting', () => {
    const FirstProvider = {
      providerType: 'GLOBAL',
      name: 'FirstProvider',
      priority: 1,
      isEligibleForDirectories: directories => Promise.resolve(true),
      executeQuery: (query, directories) => Promise.resolve([])
    };
    const SecondProvider = {
      providerType: 'GLOBAL',
      name: 'SecondProvider',
      priority: 2,
      isEligibleForDirectories: directories => Promise.resolve(true),
      executeQuery: (query, directories) => Promise.resolve([])
    };
    const ThirdProvider = {
      providerType: 'GLOBAL',
      name: 'ThirdProvider',
      priority: 3,
      isEligibleForDirectories: directories => Promise.resolve(true),
      executeQuery: (query, directories) => Promise.resolve([])
    };
    const allResults = {
      FirstProvider: {
        title: 'FirstProvider',
        priority: 1,
        results: {
          global: {
            results: [],
            loading: false,
            error: null
          }
        },
        totalResults: 0
      },
      SecondProvider: {
        title: 'SecondProvider',
        priority: 2,
        results: {
          global: {
            results: [],
            loading: false,
            error: null
          }
        },
        totalResults: 0
      },
      ThirdProvider: {
        title: 'ThirdProvider',
        priority: 3,
        results: {
          global: {
            results: [],
            loading: false,
            error: null
          }
        },
        totalResults: 0
      }
    };
    it('returns results sorted by priority (1, 3, 2)', async () => {
      quickOpenProviderRegistry.addProvider(FirstProvider);
      quickOpenProviderRegistry.addProvider(ThirdProvider);
      quickOpenProviderRegistry.addProvider(SecondProvider);
      await providersChanged;
      expect((await queryOmniSearchProvider(quickOpenProviderRegistry, searchResultManager, ''))).toEqual(allResults);
    });
    it('returns results sorted by priority (3, 2, 1)', async () => {
      quickOpenProviderRegistry.addProvider(ThirdProvider);
      quickOpenProviderRegistry.addProvider(SecondProvider);
      quickOpenProviderRegistry.addProvider(FirstProvider);
      await providersChanged;
      expect((await queryOmniSearchProvider(quickOpenProviderRegistry, searchResultManager, ''))).toEqual(allResults);
    });
  });
  describe('directory sorting', () => {
    beforeEach(async () => {
      // Something adds paths automatically. I've seen both the `fixtures` directory and the
      // `spec` directory. Remove them here so they don't pollute the tests below.
      atom.project.getPaths().forEach(path => atom.project.removePath(path));
      atom.project.addPath(PROJECT_ROOT1);
      atom.project.addPath(PROJECT_ROOT2);
      atom.project.addPath(PROJECT_ROOT3);
      await providersChanged;
    });
    describe('with no current working root', () => {
      it('should return the same order as Atom', () => {
        const sortedPaths = searchResultManager._sortDirectories().map(dir => dir.getPath());

        expect(sortedPaths).toEqual([PROJECT_ROOT1, PROJECT_ROOT2, PROJECT_ROOT3]);
      });
    });
    describe('with a current working root', () => {
      beforeEach(() => {
        // mocking the directory -- if this becomes a problem it shouldn't be too hard to get the
        // actual Directory object from Atom
        searchResultManager.setCurrentWorkingRoot(PROJECT_ROOT3);
      });
      it('should put that root first, without disturbing the relative order of other roots', () => {
        const sortedPaths = searchResultManager._sortDirectories().map(dir => dir.getPath());

        expect(sortedPaths).toEqual([PROJECT_ROOT3, PROJECT_ROOT1, PROJECT_ROOT2]);
      });
    });
  });
});