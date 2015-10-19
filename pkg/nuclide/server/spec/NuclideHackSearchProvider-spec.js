'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var commons = require('nuclide-commons');
var {addProvider, clearProviders, services} = require('../lib/services/NuclideSearchService');
var HackProvider = require('../lib/services/search/HackProvider');
var NuclideLocalEventBus = require('../lib/NuclideLocalEventbus');
var HackHelpers = require('nuclide-hack-base/lib/HackHelpers');

var mockResults = [{
  line: 0,
  column: 0,
  name: '',
  path: '',
  length: 0,
  scope: '',
  additionalInfo: '',
  action: '',
}];

var nuclideServer;

describe('NuclideHackSearchService local test suite', () => {
  afterEach(() => {
    clearProviders();
  });

  //TODO(mikeo): flesh out when hack works on mac
  it('returns no hack provider for local', () => {
    waitsForPromise(async () => {
      var eventBus = new NuclideLocalEventBus();
      var providers = await eventBus.callService('/search/listProviders', ['/']);
      var {find} = require('nuclide-commons').array;
      expect(find(providers, (p) => p.name === 'hack')).toBe(undefined);
    });
  });
});

describe('NuclideHackSearchService test suite', () => {
  beforeEach(() => {
    nuclideServer = jasmine.createSpyObj('NuclideServer', ['callService']);
    clearProviders();
    addProvider('hack', new HackProvider(nuclideServer));
  });

  afterEach(() => {
    clearProviders();
  });

  describe('info()', () => {
    it('returns provider info', () => {
      waitsForPromise(async () => {
        spyOn(commons, 'checkOutput').andReturn({stdout: '/path/to/hhclient'});
        spyOn(commons.fsPromise, 'findNearestFile').andReturn('/path/to/.hhclient');
        var res = await services['/search/listProviders'].handler('/cwd');
        expect(res.length).toEqual(1);
        expect(res[0].name).toEqual('hack');
      });
    });

    it('does not return provider info if isValid returns false', () => {
      waitsForPromise(async () => {
        spyOn(commons, 'checkOutput').andReturn({stdout: '/path/to/hhclient'});
        spyOn(commons.fsPromise, 'findNearestFile').andReturn(undefined);
        var res = await services['/search/listProviders'].handler('/badcwd');
        expect(res.length).toEqual(0);
      });
    });
  });

  describe('hack provider', () => {
    beforeEach(() => {
      spyOn(HackHelpers, 'getSearchResults').andReturn({result: mockResults});
    });

    describe('query()', () => {
      it('passes thru query with no prefix', () => {
        waitsForPromise(async () => {
          var res = await services['/search/query'].handler('/cwd', 'hack', 'asdf');
          expect(res.results).toEqual(mockResults);
          expect(HackHelpers.getSearchResults).toHaveBeenCalledWith(
            '/cwd', 'asdf', undefined, undefined
          );
        });
      });

      it('adds -class if query prefixed by "#"', () => {
        waitsForPromise(async () => {
          var res = await services['/search/query'].handler('/cwd', 'hack', '#asdf');
          expect(res.results).toEqual(mockResults);
          expect(HackHelpers.getSearchResults).toHaveBeenCalledWith(
            '/cwd', 'asdf', undefined, '-class'
          );
        });
      });

      it('adds -constant if query prefixed by "%"', () => {
        waitsForPromise(async () => {
          var res = await services['/search/query'].handler('/cwd', 'hack', '%asdf');
          expect(res.results).toEqual(mockResults);
          expect(HackHelpers.getSearchResults).toHaveBeenCalledWith(
            '/cwd', 'asdf', undefined, '-constant'
          );
        });
      });

      it('adds -constant if query prefixed by "@"', () => {
        waitsForPromise(async () => {
          var res = await services['/search/query'].handler('/cwd', 'hack', '@asdf');
          expect(res.results).toEqual(mockResults);
          expect(HackHelpers.getSearchResults).toHaveBeenCalledWith(
            '/cwd', 'asdf', undefined, '-function'
          );
        });
      });
    });
  });
});
