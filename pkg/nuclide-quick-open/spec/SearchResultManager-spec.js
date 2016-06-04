'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import SearchResultManager from '../lib/SearchResultManager';
import {__test__} from '../lib/SearchResultManager';
const {_getOmniSearchProviderSpec} = __test__;

const FakeProvider = {
  getProviderType: () => 'GLOBAL',
  getName: () => 'FakeProvider',
  isRenderable: () => true,
  getTabTitle: () => 'Nothing to see here',
  executeQuery: query => Promise.resolve([]),
};

const FakeProviderSpec = {
  action: '',
  debounceDelay: 200,
  name: 'FakeProvider',
  prompt: 'Search FakeProvider',
  title: 'Nothing to see here',
};

const TEST_STRINGS = ['yolo', 'foo', 'bar'];
const ExactStringMatchProvider = {
  getProviderType: () => 'GLOBAL',
  getName: () => 'ExactStringMatchProvider',
  isRenderable: () => true,
  getTabTitle: () => 'Nothing to see here',
  executeQuery: query => Promise.resolve(
    TEST_STRINGS.filter(s => s === query).map(s => ({path: s}))
  ),
};

// Promise-ify the flux cycle around SearchResultManager::executeQuery.
function querySingleProvider(
  searchResultManager: any,
  query: string,
  providerName: string,
): Promise<Object> {
  return new Promise((resolve, reject) => {
    searchResultManager.on(searchResultManager.RESULTS_CHANGED, () => {
      resolve(searchResultManager.getResults(query, providerName));
    });
    searchResultManager.executeQuery(query);
  });
}

// Helper to construct expected result objects for a global provider.
function constructSingleProviderResult(provider: Object, result: Object) {
  const wrappedResult = {};
  wrappedResult[provider.getName()] = {
    title: provider.getTabTitle(),
    results: {
      global: {...result},
    },
  };
  return wrappedResult;
}

let searchResultManager: any = null;
describe('SearchResultManager', () => {
  beforeEach(() => {
    searchResultManager = new SearchResultManager();
  });

  describe('getRenderableProviders', () => {
    it('Should return OmniSearchProvider even if no actual providers are available.', () => {
      const renderableProviders = searchResultManager.getRenderableProviders();
      expect(renderableProviders).toEqual([_getOmniSearchProviderSpec()]);

    });
  });

  describe('provider/directory cache', () => {
    it('updates the cache when providers become (un)available', () => {
      waitsForPromise(async () => {
        const fakeProviderDisposable = searchResultManager.registerProvider({...FakeProvider});
        let providersChangedCallCount = 0;
        searchResultManager.on(
          searchResultManager.PROVIDERS_CHANGED,
          () => {
            providersChangedCallCount++;
          }
        );
        await searchResultManager._updateDirectories();
        let renderableProviders = searchResultManager.getRenderableProviders();
        expect(renderableProviders.length).toEqual(2);
        expect(renderableProviders[1]).toEqual(FakeProviderSpec);
        expect(providersChangedCallCount).toEqual(1);

        // Simulate deactivation of FakeProvider
        fakeProviderDisposable.dispose();
        renderableProviders = searchResultManager.getRenderableProviders();
        expect(renderableProviders.length).toEqual(1);
        expect(providersChangedCallCount).toEqual(2);
      });

    });
  });

  describe('querying providers', () => {
    it('queries providers asynchronously, emits change events and returns filtered results', () => {
      waitsForPromise(async () => {
        searchResultManager.registerProvider({...ExactStringMatchProvider});
        expect(await querySingleProvider(searchResultManager, 'yolo', 'ExactStringMatchProvider'))
          .toEqual(constructSingleProviderResult(ExactStringMatchProvider, {
            results: [
              {
                path: 'yolo',
                sourceProvider: 'ExactStringMatchProvider',
              },
            ],
            loading: false,
            error: null,
          }
        ));
      });
    });

    it('ignores trailing whitespace in querystring.', () => {
      waitsForPromise(async () => {
        searchResultManager.registerProvider({...ExactStringMatchProvider});
        await Promise.all([
          '   yolo',
          'yolo   ',
          '   yolo   \n ',
        ].map(async query => {
          expect(await querySingleProvider(searchResultManager, query, 'ExactStringMatchProvider'))
            .toEqual(constructSingleProviderResult(ExactStringMatchProvider, {
              results: [
                {
                  path: query.trim(),
                  sourceProvider: 'ExactStringMatchProvider',
                },
              ],
              loading: false,
              error: null,
            }
          ));
        }));
      });
    });
  });
});
