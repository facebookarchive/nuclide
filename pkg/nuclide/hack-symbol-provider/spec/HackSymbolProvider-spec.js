'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var HackSymbolProvider = require('../lib/HackSymbolProvider');
var nuclideClient = require('nuclide-client');
var React = require('react-for-atom');
var {TestUtils} = React.addons;
var mockClient;
var mockDirectory;
var provider;


describe('HackSymbolProvider', () => {
  beforeEach(() => {
    provider = {...HackSymbolProvider};
  });

  describe('executeQuery', () => {
    beforeEach(() => {
      mockClient = jasmine.createSpyObj('NuclideClient', ['getSearchProviders', 'doSearchQuery']);
      mockClient.doSearchQuery.andReturn(Promise.resolve({ results: [{path: '/some/path'}]}));
      spyOn(nuclideClient, 'getClient').andReturn(mockClient);
    });

    describe('local search', () => {
      beforeEach(() => {
        mockDirectory = {
          getPath: () => '/some/local/path',
        };
      });

      it('returns local paths when searching local directories', () => {
        waitsForPromise(async () => {
          mockClient.getSearchProviders.andReturn(Promise.resolve([{name: 'hack'}]));

          var queries = await provider.executeQuery('asdf', mockDirectory);
          expect(mockClient.getSearchProviders).toHaveBeenCalledWith('/some/local/path');
          expect(mockClient.doSearchQuery).toHaveBeenCalledWith('/some/local/path', 'hack', 'asdf');

          expect(Object.keys(queries[0])).toEqual(['path']);
          expect(queries[0].path).toEqual('/some/path');
        });
      });
    });

    describe('remote search', () => {
      beforeEach(() => {
        mockDirectory = {
          getPath: () => 'nuclide://some.host:1234/some/remote/path',
        };
      });

      it('returns remote paths when searching remote directories', () => {
        waitsForPromise(async () => {
          mockClient.getSearchProviders.andReturn(Promise.resolve([{name: 'hack'}]));

          var queries = await provider.executeQuery('asdf', mockDirectory);
          expect(mockClient.getSearchProviders).toHaveBeenCalledWith('/some/remote/path');
          expect(mockClient.doSearchQuery).toHaveBeenCalledWith('/some/remote/path', 'hack', 'asdf');

          expect(Object.keys(queries[0])).toEqual(['path']);
          expect(queries[0].path).toEqual('nuclide://some.host/some/path');
        });
      });
    });

  });

  describe('Result rendering', () => {
    it('should work', () => {

      var mockResult = {
        path: '/some/arbitrary/path',
        name: 'IExampleSymbolInterface',
        additionalInfo: 'interface',
      };
      var reactElement = provider.getComponentForItem(mockResult);
      expect(reactElement.props.title).toBe('interface');
      var renderedComponent = TestUtils.renderIntoDocument(reactElement);
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
