'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Provider} from '../lib/types';

import nuclideUri from '../../commons-node/nuclideUri';

import SearchResultManager from '../lib/SearchResultManager';
import {__test__} from '../lib/SearchResultManager';
const {_getOmniSearchProviderSpec} = __test__;

const PROJECT_ROOT1 = nuclideUri.join(__dirname, 'fixtures/root1');
const PROJECT_ROOT2 = nuclideUri.join(__dirname, 'fixtures/root2');
const PROJECT_ROOT3 = nuclideUri.join(__dirname, 'fixtures/root3');

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
  priority: Number.POSITIVE_INFINITY,
};

const TEST_STRINGS = ['yolo', 'foo', 'bar'];
const ExactStringMatchProvider = {
  getProviderType: () => 'GLOBAL',
  getName: () => 'ExactStringMatchProvider',
  isRenderable: () => true,
  getTabTitle: () => 'Nothing to see here',
  executeQuery: query => Promise.resolve(
    TEST_STRINGS.filter(s => s === query).map(s => ({path: s})),
  ),
};

// Promise-ify the flux cycle around SearchResultManager::executeQuery.
function querySingleProvider(
  searchResultManager: SearchResultManager,
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
function constructSingleProviderResult(provider: Provider, result: Object) {
  const wrappedResult = {};
  wrappedResult[provider.getName()] = {
    title: provider.getTabTitle(),
    results: {
      global: {...result},
    },
  };
  return wrappedResult;
}

describe('SearchResultManager', () => {
  let searchResultManager: SearchResultManager = (null: any);
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
          },
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
          },
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
            },
          ));
        }));
      });
    });
  });

  describe('directory sorting', () => {
    beforeEach(() => {
      waitsForPromise(async () => {
        // Something adds paths automatically. I've seen both the `fixtures` directory and the
        // `spec` directory. Remove them here so they don't pollute the tests below.
        atom.project.getPaths().forEach(path => atom.project.removePath(path));

        atom.project.addPath(PROJECT_ROOT1);
        atom.project.addPath(PROJECT_ROOT2);
        atom.project.addPath(PROJECT_ROOT3);

        // Call _updateDirectories immediately here because it is debounced by default, so it won't
        // execute for a little while.
        await searchResultManager._updateDirectories();
      });
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
        const fakeDir: any = {getPath: () => PROJECT_ROOT3};
        searchResultManager.setCurrentWorkingRoot(fakeDir);
      });
      it('should put that root first, without disturbing the relative order of other roots', () => {
        const sortedPaths = searchResultManager._sortDirectories().map(dir => dir.getPath());
        expect(sortedPaths).toEqual([PROJECT_ROOT3, PROJECT_ROOT1, PROJECT_ROOT2]);
      });
    });
  });
});
