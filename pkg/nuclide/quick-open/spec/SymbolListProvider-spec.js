'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

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
        spyOn(atom.project, 'getDirectories').andReturn([{getPath: () => '/'}]);
      });

      it('returns local paths', () => {
        waitsForPromise(async () => {
          mockClient.getSearchProviders.andReturn(Promise.resolve([{name: 'hack'}]));

          var results = await provider.executeQuery('asdf');

          expect(mockClient.getSearchProviders).toHaveBeenCalledWith('/');
          expect(mockClient.doSearchQuery).toHaveBeenCalledWith('/', 'hack', 'asdf');
          expect(results[0].path).toEqual('/some/path');
        });
      });
    });

    describe('remote searching', () => {
      beforeEach(() => {
        spyOn(atom.project, 'getDirectories').andReturn([{getPath: () => 'nuclide://some.host:1234/some/remote/path'}]);
      });

      it('returns remote paths when doing remote search', () => {
        waitsForPromise(async () => {
          mockClient.getSearchProviders.andReturn(Promise.resolve([{name: 'hack'}]));

          var results = await provider.executeQuery('asdf');

          expect(mockClient.getSearchProviders).toHaveBeenCalledWith('/some/remote/path');
          expect(mockClient.doSearchQuery).toHaveBeenCalledWith('/some/remote/path', 'hack', 'asdf');
          expect(results[0].path).toEqual('nuclide://some.host:1234/some/path');
        });
      });

      it('does not call doSearchQuery if hack not available', () => {
        waitsForPromise(async () => {
          mockClient.getSearchProviders.andReturn(Promise.resolve([]));

          var results = await provider.executeQuery('asdf');

          expect(mockClient.getSearchProviders).toHaveBeenCalledWith('/some/remote/path');
          expect(mockClient.doSearchQuery).not.toHaveBeenCalled();
          expect(results.length).toEqual(0);
        });
      });
    });
  });
});
