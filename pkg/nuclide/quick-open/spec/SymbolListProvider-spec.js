'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var SymbolListProvider = require('../lib/SymbolListProvider');
var nuclideClient = require('nuclide-client');
var mockClient;
var provider;

describe('SymbolListProvider', () => {
  describe('executeQuery', () => {
    beforeEach(() => {
      mockClient = jasmine.createSpyObj('NuclideClient', ['getSearchProviders', 'doSearchQuery']);
      mockClient.doSearchQuery.andReturn(Promise.resolve({ results: [{path: '/some/path'}]}));
      spyOn(nuclideClient, 'getClient').andReturn(mockClient);
      provider = new SymbolListProvider();
    });

    describe('local searching', () => {
      beforeEach(() => {
        spyOn(atom.project, 'getDirectories').andReturn([{
          getPath: () => '/',
          getBaseName: () => 'base',
        }]);
      });

      it('returns local paths', () => {
        waitsForPromise(async () => {
          mockClient.getSearchProviders.andReturn(Promise.resolve([{name: 'hack'}]));

          var queries = await provider.executeQuery('asdf');
          expect(mockClient.getSearchProviders).toHaveBeenCalledWith('/');
          expect(mockClient.doSearchQuery).toHaveBeenCalledWith('/', 'hack', 'asdf');
          expect(Object.keys(queries)).toEqual(['base']);
          expect(Object.keys(queries.base)).toEqual(['hack']);

          var result = await queries.base.hack;

          expect(result.results[0].path).toEqual('/some/path');
        });
      });
    });

    describe('remote searching', () => {
      beforeEach(() => {
        spyOn(atom.project, 'getDirectories').andReturn([{
          getPath: () => 'nuclide://some.host:1234/some/remote/path',
          getBaseName: () => 'path',
        }]);
      });

      it('returns remote paths when doing remote search', () => {
        waitsForPromise(async () => {
          mockClient.getSearchProviders.andReturn(Promise.resolve([{name: 'hack'}]));

          var queries = await provider.executeQuery('asdf');
          expect(mockClient.getSearchProviders).toHaveBeenCalledWith('/some/remote/path');
          expect(mockClient.doSearchQuery).toHaveBeenCalledWith('/some/remote/path', 'hack', 'asdf');

          expect(Object.keys(queries)).toEqual(['path']);
          expect(Object.keys(queries.path)).toEqual(['hack']);

          var result = await queries.path.hack;
          expect(result.results[0].path).toEqual('nuclide://some.host:1234/some/path');
        });
      });

      it('does not call doSearchQuery if hack not available', () => {
        waitsForPromise(async () => {
          mockClient.getSearchProviders.andReturn(Promise.resolve([]));

          var queries = await provider.executeQuery('asdf');
          expect(mockClient.getSearchProviders).toHaveBeenCalledWith('/some/remote/path');
          expect(mockClient.doSearchQuery).not.toHaveBeenCalled();
          expect(queries).toEqual({});
        });
      });
    });
  });
});
