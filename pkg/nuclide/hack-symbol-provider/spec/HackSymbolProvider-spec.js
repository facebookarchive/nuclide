'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HackSearchPosition} from '../../hack-base/lib/HackService';
import type {NuclideUri} from '../../remote-uri';

import {HackSymbolProvider} from '../lib/HackSymbolProvider';
import {
  ReactDOM,
  TestUtils,
} from 'react-for-atom';
import {clearRequireCache, uncachedRequire} from '../../test-helpers';
import invariant from 'assert';

describe('HackSymbolProvider', () => {
  // These tests are set up so that calls to getHackService() will delegate to this
  // function, so make sure to define this function at the start of your test to mock out this
  // behavior.
  let getHackService: ?((directory: atom$Directory) => Promise<mixed>);

  beforeEach(() => {
    getHackService = null;
    spyOn(require('../lib/getHackService'), 'getHackService')
      .andCallFake((directory: atom$Directory) => {
        invariant(getHackService);
        return getHackService(directory);
      });
    uncachedRequire(require, '../lib/HackSymbolProvider');
  });

  afterEach(() => {
    jasmine.unspy(require('../lib/getHackService'), 'getHackService');
    clearRequireCache(require, '../lib/HackSymbolProvider');
  });

  describe('isEligibleForDirectory()', () => {
    const mockDirectory = {
      getPath() { return '/some/local/path'; },
    };

    it(
      'isEligibleForDirectory() should return true when getHackService() returns ' +
        'an instance of HackService',
      () => {
        const hackService = createDummyHackService();
        getHackService = jasmine.createSpy('getHackService').andReturn(
          hackService);

        waitsForPromise(async () => {
          invariant(HackSymbolProvider.isEligibleForDirectory != null);
          const isEligible = await HackSymbolProvider.isEligibleForDirectory((mockDirectory: any));
          expect(isEligible).toBe(true);
          expect(getHackService).toHaveBeenCalledWith(mockDirectory);
        });
      },
    );

    it(
      'isEligibleForDirectory() should return false when getHackService() returns ' +
        'null',
      () => {
        getHackService = jasmine.createSpy('getHackService').andReturn(null);

        waitsForPromise(async () => {
          invariant(HackSymbolProvider.isEligibleForDirectory != null);
          const isEligible = await HackSymbolProvider.isEligibleForDirectory((mockDirectory: any));
          expect(isEligible).toBe(false);
          expect(getHackService).toHaveBeenCalledWith(mockDirectory);
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
        const results = await HackSymbolProvider.executeQuery('', (mockLocalDirectory: any));
        expect(results).toEqual([]);
      });
    });

    it('local search returns local paths when searching local directories', () => {
      waitsForPromise(async () => {
        // Set up the HackService to return some canned results.
        const cannedResults = [
          {path: '/some/local/path/asdf.txt', line: 1, column: 42, context: 'aha'},
        ];
        const hackService = createDummyHackService();
        const queryMethod = spyOn(hackService, 'queryHack').andReturn(cannedResults);
        getHackService = jasmine.createSpy('getHackService').andReturn(
          hackService);

        const query = 'asdf';
        const results = await HackSymbolProvider.executeQuery(query, (mockLocalDirectory: any));

        // Verify the expected results were returned by delegating to the HackService.
        expect(results).toEqual(cannedResults);
        expect(queryMethod.callCount).toBe(1);
        expect(queryMethod.argsForCall[0]).toEqual([mockLocalDirectory.getPath(), query]);
      });
    });

    it('remote search returns remote paths when searching remote directories', () => {
      waitsForPromise(async () => {
        // Set up the HackService to return some canned results.
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
        const hackService = createDummyHackService();
        const queryMethod = spyOn(hackService, 'queryHack').andReturn(cannedResults);
        getHackService = jasmine.createSpy('getHackService').andReturn(
          hackService);

        const query = 'asdf';
        const results = await HackSymbolProvider.executeQuery(query, (mockRemoteDirectory: any));

        // Verify the expected results were returned by delegating to the HackService,
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
        column: 1,
        length: 2,
        line: 3,
        scope: 'scope',
      };
      invariant(HackSymbolProvider.getComponentForItem != null);
      const reactElement = HackSymbolProvider.getComponentForItem(mockResult);
      expect(reactElement.props.title).toBe('interface');
      const renderedComponent = TestUtils.renderIntoDocument(reactElement);
      const renderedNode = ReactDOM.findDOMNode(renderedComponent);

      expect(renderedNode.querySelectorAll('.omnisearch-symbol-result-filename').length).toBe(1);
      expect(renderedNode.querySelectorAll('.icon-puzzle').length).toBe(1);
    });
  });
});

function createDummyHackService(): any {
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
