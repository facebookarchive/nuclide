'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {addProvider, clearProviders, services} = require('../lib/services/NuclideSearchService');
var HackProvider = require('../lib/services/search/HackProvider');
var NuclideLocalEventBus = require('../lib/NuclideLocalEventbus');
var commons = require('nuclide-commons');

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
    nuclideServer.callService.andCallFake(function(name: string, args) {
      switch (name) {
        case '/hack/getSearchResults':
          return mockResults;
        default:
          throw new Error('not implemented');
      }
    });
  });

  afterEach(() => {
    clearProviders();
  });

  describe('info()', () => {
    it('returns provider info', () => {
      waitsForPromise(async () => {
        spyOn(commons, 'asyncExecute').andReturn({stdout: '/path/to/hhclient'});
        spyOn(commons.fsPromise, 'findNearestFile').andReturn('/path/to/.hhclient');
        var res = await services['/search/listProviders'].handler('/cwd');
        expect(res.length).toEqual(1);
        expect(res[0].name).toEqual('hack');
      });
    });

    it('does not return provider info if isValid returns false', () => {
      waitsForPromise(async () => {
        spyOn(commons, 'asyncExecute').andReturn({stdout: '/path/to/hhclient'});
        spyOn(commons.fsPromise, 'findNearestFile').andReturn(undefined);
        var res = await services['/search/listProviders'].handler('/badcwd');
        expect(res.length).toEqual(0);
      });
    });

    it('does not return provider info if asyncExecute throws', () => {
      waitsForPromise(async () => {
        spyOn(commons, 'asyncExecute').andCallFake(() => {throw new Error();});
        spyOn(commons.fsPromise, 'findNearestFile').andReturn(undefined);
        var res = await services['/search/listProviders'].handler('/badcwd');
        expect(res.length).toEqual(0);
      });
    });
  });

  describe('hack provider', () => {
    describe('query()', () => {
      it('passes thru query with no prefix', () => {
        waitsForPromise(async () => {
          var res = await services['/search/query'].handler('/cwd', 'hack', 'asdf');

          expect(res.results).toEqual(mockResults);
          expect(nuclideServer.callService.calls[0].args[0]).toEqual('/hack/getSearchResults');
          var args = nuclideServer.callService.calls[0].args[1];
          expect(args[0]).toEqual('asdf');
          expect(args[1]).toEqual(undefined);
          expect(args[2]).toEqual(undefined);
          expect(args[3]).toEqual({cwd: '/cwd'});
        });
      });

      it('adds -class if query prefixed by "#"', () => {
        waitsForPromise(async () => {
          var res = await services['/search/query'].handler('/cwd', 'hack', '#asdf');

          expect(res.results).toEqual(mockResults);
          expect(nuclideServer.callService.calls[0].args[0]).toEqual('/hack/getSearchResults');
          var args = nuclideServer.callService.calls[0].args[1];
          expect(args[0]).toEqual('asdf');
          expect(args[1]).toEqual(undefined);
          expect(args[2]).toEqual('-class');
          expect(args[3]).toEqual({cwd: '/cwd'});
        });
      });

      it('adds -constant if query prefixed by "%"', () => {
        waitsForPromise(async () => {
          var res = await services['/search/query'].handler('/cwd', 'hack', '%asdf');

          expect(res.results).toEqual(mockResults);
          expect(nuclideServer.callService.calls[0].args[0]).toEqual('/hack/getSearchResults');
          var args = nuclideServer.callService.calls[0].args[1];
          expect(args[0]).toEqual('asdf');
          expect(args[1]).toEqual(undefined);
          expect(args[2]).toEqual('-constant');
          expect(args[3]).toEqual({cwd: '/cwd'});
        });
      });

      it('adds -constant if query prefixed by "@"', () => {
        waitsForPromise(async () => {
          var res = await services['/search/query'].handler('/cwd', 'hack', '@asdf');

          expect(res.results).toEqual(mockResults);
          expect(nuclideServer.callService.calls[0].args[0]).toEqual('/hack/getSearchResults');
          var args = nuclideServer.callService.calls[0].args[1];
          expect(args[0]).toEqual('asdf');
          expect(args[1]).toEqual(undefined);
          expect(args[2]).toEqual('-function');
          expect(args[3]).toEqual({cwd: '/cwd'});
        });
      });
    });
  });
});
