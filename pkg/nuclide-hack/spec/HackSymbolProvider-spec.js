/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {HackSearchPosition} from '../../nuclide-hack-rpc/lib/HackService-types';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import {HackSymbolProvider} from '../lib/HackSymbolProvider';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import {clearRequireCache, uncachedRequire} from '../../nuclide-test-helpers';
import invariant from 'assert';

describe('HackSymbolProvider', () => {
  // These tests are set up so that calls to getHackLanguageForUri() will delegate to this
  // function, so make sure to define this function at the start of your test to mock out this
  // behavior.
  let getHackLanguageForUri: ?((directory: NuclideUri) => Promise<mixed>);
  let isFileInProject: ?((directory: NuclideUri) => Promise<boolean>);

  beforeEach(() => {
    getHackLanguageForUri = null;
    isFileInProject = null;
    spyOn(require('../lib/HackLanguage'), 'getHackLanguageForUri')
      .andCallFake((directory: NuclideUri) => {
        invariant(getHackLanguageForUri);
        return getHackLanguageForUri(directory);
      });
    spyOn(require('../lib/HackLanguage'), 'isFileInHackProject')
      .andCallFake((directory: NuclideUri) => {
        invariant(isFileInProject);
        return isFileInProject(directory);
      });
    uncachedRequire(require, '../lib/HackSymbolProvider');
  });

  afterEach(() => {
    jasmine.unspy(require('../lib/HackLanguage'), 'isFileInHackProject');
    jasmine.unspy(require('../lib/HackLanguage'), 'getHackLanguageForUri');
    clearRequireCache(require, '../lib/HackSymbolProvider');
  });
  const path = '/some/local/path';

  describe('isEligibleForDirectory()', () => {
    const mockDirectory = {
      getPath() { return path; },
    };

    it(
      'isEligibleForDirectory() should return true when getHackServiceForProject() returns ' +
        'an instance of HackService',
      () => {
        isFileInProject = jasmine.createSpy('isFileInProject').andReturn(true);

        waitsForPromise(async () => {
          invariant(HackSymbolProvider.providerType === 'DIRECTORY');
          const isEligible = await HackSymbolProvider.isEligibleForDirectory((mockDirectory: any));
          expect(isEligible).toBe(true);
          expect(isFileInProject).toHaveBeenCalledWith(path);
        });
      },
    );

    it(
      'isEligibleForDirectory() should return false when getHackServiceForProject() returns ' +
        'null',
      () => {
        isFileInProject = jasmine.createSpy('isFileInProject').andReturn(false);

        waitsForPromise(async () => {
          invariant(HackSymbolProvider.providerType === 'DIRECTORY');
          const isEligible = await HackSymbolProvider.isEligibleForDirectory((mockDirectory: any));
          expect(isEligible).toBe(false);
          expect(isFileInProject).toHaveBeenCalledWith(path);
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
        const queryMethod = spyOn(hackService, 'executeQuery').andReturn(cannedResults);
        getHackLanguageForUri = jasmine.createSpy('getHackLanguageForUri').andReturn(
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
            return 'nuclide://some.host/some/remote/path';
          },
        };
        const cannedResults = [
          {
            path: 'nuclide://some.host/some/local/path/asdf.txt',
            line: 1,
            column: 42,
            context: 'aha',
          },
        ];
        const hackService = createDummyHackService();
        const queryMethod = spyOn(hackService, 'executeQuery').andReturn(cannedResults);
        getHackLanguageForUri = jasmine.createSpy('getHackLanguageForUri').andReturn(
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

      // $FlowFixMe
      expect(renderedNode.querySelectorAll('.omnisearch-symbol-result-filename').length).toBe(1);
      // $FlowFixMe
      expect(renderedNode.querySelectorAll('.icon-puzzle').length).toBe(1);
    });
  });
});

function createDummyHackService(): any {
  return {
    executeQuery(
      rootDirectory: NuclideUri,
      queryString: string,
    ): Promise<Array<HackSearchPosition>> {
      throw new Error('replace with implementation for testing');
    },
  };
}
