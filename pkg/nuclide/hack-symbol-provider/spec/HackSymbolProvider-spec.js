'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HackSearchPosition} from 'nuclide-hack-base/lib/types';
import type {HackSearchService} from 'nuclide-hack-search-service';

import HackSymbolProvider from '../lib/HackSymbolProvider';
import React from 'react-for-atom';
import {clearRequireCache, uncachedRequire} from 'nuclide-test-helpers';
import invariant from 'assert';

const {TestUtils} = React.addons;

describe('HackSymbolProvider', () => {
  // These tests are set up so that calls to getHackSearchService() will delegate to this
  // function, so make sure to define this function at the start of your test to mock out this
  // behavior.
  let getHackSearchService: ?((directory: atom$Directory) => Promise<?HackSearchService>);

  beforeEach(() => {
    getHackSearchService = null;
    spyOn(require('../lib/getHackSearchService'), 'getHackSearchService')
      .andCallFake((directory: atom$Directory) => {
        invariant(getHackSearchService);
        return getHackSearchService(directory);
      });
    uncachedRequire(require, '../lib/HackSymbolProvider');
  });

  afterEach(() => {
    jasmine.unspy(require('../lib/getHackSearchService'), 'getHackSearchService');
    clearRequireCache(require, '../lib/HackSymbolProvider');
  });

  describe('isEligibleForDirectory()', () => {
    const mockDirectory = {
      getPath() { return '/some/local/path'; },
    };

    it(
      'isEligibleForDirectory() should return true when getHackSearchService() returns ' +
        'an instance of HackSearchService',
      () => {
        const hackSearchService = createDummyHackSearchService();
        getHackSearchService = jasmine.createSpy('getHackSearchService').andReturn(
          hackSearchService);

        waitsForPromise(async () => {
          const isEligible = await HackSymbolProvider.isEligibleForDirectory(mockDirectory);
          expect(isEligible).toBe(true);
          expect(getHackSearchService).toHaveBeenCalledWith(mockDirectory);
        });
      },
    );

    it(
      'isEligibleForDirectory() should return false when getHackSearchService() returns ' +
        'null',
      () => {
        getHackSearchService = jasmine.createSpy('getHackSearchService').andReturn(null);

        waitsForPromise(async () => {
          const isEligible = await HackSymbolProvider.isEligibleForDirectory(mockDirectory);
          expect(isEligible).toBe(false);
          expect(getHackSearchService).toHaveBeenCalledWith(mockDirectory);
        });
      },
    );
  });

  describe('executeQuery()', () => {
    const mockLocalDirectory = {
      getPath() {
        return '/some/local/path';
      },
    };

    it('returns an empty array for an empty query', () => {
      waitsForPromise(async () => {
        const results = await HackSymbolProvider.executeQuery('', mockLocalDirectory);
        expect(results).toEqual([]);
      });
    });

    it('local search returns local paths when searching local directories', () => {
      waitsForPromise(async () => {
        // Set up the HackSearchService to return some canned results.
        const cannedResults = [
          {path: '/some/local/path/asdf.txt', line: 1, column: 42, context: 'aha'},
        ];
        const hackSearchService = createDummyHackSearchService();
        const queryMethod = spyOn(hackSearchService, 'queryHack').andReturn(cannedResults);
        getHackSearchService = jasmine.createSpy('getHackSearchService').andReturn(
          hackSearchService);

        const query = 'asdf';
        const results = await HackSymbolProvider.executeQuery(query, mockLocalDirectory);

        // Verify the expected results were returned by delegating to the HackSearchService.
        expect(results).toEqual(cannedResults);
        expect(queryMethod.callCount).toBe(1);
        expect(queryMethod.argsForCall[0]).toEqual([mockLocalDirectory.getPath(), query]);
      });
    });

    it('remote search returns remote paths when searching remote directories', () => {
      waitsForPromise(async () => {
        // Set up the HackSearchService to return some canned results.
        const mockRemoteDirectory = {
          getPath() {
            return 'nuclide://some.host:1234/some/remote/path';
          },
        };
        const cannedResults = [
          {
            path: 'nuclide://some.host:1234/some/local/path/asdf.txt',
            line: 1,
            column: 42,
            context: 'aha',
          },
        ];
        const hackSearchService = createDummyHackSearchService();
        const queryMethod = spyOn(hackSearchService, 'queryHack').andReturn(cannedResults);
        getHackSearchService = jasmine.createSpy('getHackSearchService').andReturn(
          hackSearchService);

        const query = 'asdf';
        const results = await HackSymbolProvider.executeQuery(query, mockRemoteDirectory);

        // Verify the expected results were returned by delegating to the HackSearchService,
        // and that local file paths are converted to NuclideUris.
        expect(results).toEqual(cannedResults);
        expect(queryMethod.callCount).toBe(1);
        expect(queryMethod.argsForCall[0]).toEqual([mockRemoteDirectory.getPath(), query]);
      });
    });
  });

  describe('Result rendering', () => {
    it('should work', () => {
      const mockResult = {
        path: '/some/arbitrary/path',
        name: 'IExampleSymbolInterface',
        additionalInfo: 'interface',
      };
      const reactElement = HackSymbolProvider.getComponentForItem(mockResult);
      expect(reactElement.props.title).toBe('interface');
      const renderedComponent = TestUtils.renderIntoDocument(reactElement);
      TestUtils.findRenderedDOMComponentWithClass(renderedComponent, 'icon-puzzle');
      expect(
        TestUtils.scryRenderedDOMComponentsWithClass(
          renderedComponent,
          'omnisearch-symbol-result-filename'
        ).length
      ).toBe(1);
      expect(
        TestUtils.scryRenderedDOMComponentsWithClass(
          renderedComponent,
          'icon-puzzle'
        ).length
      ).toBe(1);
    });
  });
});

function createDummyHackSearchService(): HackSearchService {
  return {
    queryHack(
      rootDirectory: NuclideUri,
      queryString: string
    ): Promise<Array<HackSearchPosition>> {
      throw new Error('replace with implementation for testing');
    },

    isAvailableForDirectoryHack(rootDirectory: NuclideUri): Promise<boolean> {
      throw new Error('replace with implementation for testing');
    },
  };
}
