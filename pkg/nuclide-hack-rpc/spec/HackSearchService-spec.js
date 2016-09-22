'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HackSearchPosition} from '../lib/HackService';
import type {SearchResultTypeValue} from '../../nuclide-hack-common';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import {clearRequireCache, uncachedRequire} from '../../nuclide-test-helpers';
import invariant from 'assert';
import {initialize} from '../lib/HackService';

async function executeQuery(
  rootDirectory: NuclideUri,
  queryString: string,
): Promise<Array<HackSearchPosition>> {
  return await (await initialize('', false, 'OFF')).executeQuery(rootDirectory, queryString);
}

describe('executeQuery()', () => {
  let getSearchResults: ?((
    filePath: string,
    search: string,
    filterTypes?: ?Array<SearchResultTypeValue>,
    searchPostfix?: string,
  ) => Promise<Array<HackSearchPosition>>) = null;

  beforeEach(() => {
    spyOn(require('../lib/HackHelpers'), 'getSearchResults')
      .andCallFake((
        filePath: string,
        search: string,
        filterTypes: ?Array<SearchResultTypeValue>,
        searchPostfix: string,
      ) => {
        invariant(getSearchResults);
        return getSearchResults(filePath, search, filterTypes, searchPostfix);
      });
    uncachedRequire(require, '../lib/HackService');
  });

  afterEach(() => {
    jasmine.unspy(require('../lib/HackHelpers'), 'getSearchResults');
    clearRequireCache(require, '../lib/HackService');
  });

  it('empty results are returned when getSearchResults() returns null', () => {
    getSearchResults = jasmine.createSpy('getSearchResults').andReturn(null);

    waitsForPromise(async () => {
      const results = await executeQuery('/some/local/path', 'asdf');
      expect(results).toEqual([]);
      expect(getSearchResults).toHaveBeenCalledWith(
        '/some/local/path', 'asdf', null, undefined,
      );
    });
  });

  it('the appropriate arguments are passed to getSearchResults() for a normal query', () => {
    getSearchResults = jasmine.createSpy('getSearchResults').andReturn({
      result: [
        {path: '/some/local/path'},
      ],
    });

    waitsForPromise(async () => {
      const results = await executeQuery('/some/local/path', 'asdf');
      expect(results).toEqual([{path: '/some/local/path'}]);
      expect(getSearchResults).toHaveBeenCalledWith(
        '/some/local/path', 'asdf', null, undefined,
      );
    });
  });

  it('the appropriate arguments are passed to getSearchResults() for a function query', () => {
    getSearchResults = jasmine.createSpy('getSearchResults').andReturn({
      result: [
        {path: '/some/local/path'},
      ],
    });

    waitsForPromise(async () => {
      const results = await executeQuery('/some/local/path', '@asdf');
      expect(results).toEqual([{path: '/some/local/path'}]);
      expect(getSearchResults).toHaveBeenCalledWith(
        '/some/local/path', 'asdf', null, '-function',
      );
    });
  });

  it('the appropriate arguments are passed to getSearchResults() for a class query', () => {
    getSearchResults = jasmine.createSpy('getSearchResults').andReturn({
      result: [
        {path: '/some/local/path'},
      ],
    });

    waitsForPromise(async () => {
      const results = await executeQuery('/some/local/path', '#asdf');
      expect(results).toEqual([{path: '/some/local/path'}]);
      expect(getSearchResults).toHaveBeenCalledWith(
        '/some/local/path', 'asdf', null, '-class',
      );
    });
  });

  it('the appropriate arguments are passed to getSearchResults() for a constant query', () => {
    getSearchResults = jasmine.createSpy('getSearchResults').andReturn({
      result: [
        {path: '/some/local/path'},
      ],
    });

    waitsForPromise(async () => {
      const results = await executeQuery('/some/local/path', '%asdf');
      expect(results).toEqual([{path: '/some/local/path'}]);
      expect(getSearchResults).toHaveBeenCalledWith(
        '/some/local/path', 'asdf', null, '-constant',
      );
    });
  });
});
