'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {TabManager} = require('../lib/TabManager');

describe('TabManager', () => {

  var tabManager;
  var getEligibleServicesFn;

  beforeEach(() => {
    getEligibleServicesFn = jasmine.createSpy('dummy');
  });

  afterEach(() => {
    tabManager.dispose();
  });

  describe('before getEligibleServices() fulfills', () => {
    beforeEach(() => {
      var promiseThatDoesNotResolveImmediately = new Promise((resolve, reject) => {});
      getEligibleServicesFn.andReturn(promiseThatDoesNotResolveImmediately);
      tabManager = new TabManager(getEligibleServicesFn);
    });

    it('getTabs() should return the default set of tabs', () => {
      expect(getEligibleServicesFn.callCount).toBe(1);
      expect(tabManager.getTabs().map(tab => tab.providerName)).toEqual([
        'OmniSearchResultProvider',
        'FileListProvider',
        'OpenFileListProvider',
      ]);
    });

    it('getDefaultTab()', () => {
      expect(getEligibleServicesFn.callCount).toBe(1);
      expect(tabManager.getDefaultTab().providerName).toBe('OmniSearchResultProvider');
    });
  });

  describe('after getEligibleServices() fulfills with a new service', () => {
    beforeEach(() => {
      var dummyServicesList = [[{name: 'hack'}], []];
      getEligibleServicesFn.andReturn(Promise.resolve(dummyServicesList));
      tabManager = new TabManager(getEligibleServicesFn);
    });

    it('onDidChangeTabs() should fire and then getTabs() should include SymbolListProvider', () => {
      expect(tabManager.getTabs().map(tab => tab.providerName)).toEqual([
        'OmniSearchResultProvider',
        'FileListProvider',
        'OpenFileListProvider',
      ]);

      var callback = jasmine.createSpy('callback');
      tabManager.onDidChangeTabs(callback);

      waitsFor(() => callback.wasCalled);

      runs(() => {
        expect(getEligibleServicesFn.callCount).toBe(1);

        var expectedTabs = [
          'OmniSearchResultProvider',
          'SymbolListProvider',
          'FileListProvider',
          'OpenFileListProvider',
        ];
        expect(callback.callCount).toBe(1);
        expect(callback.mostRecentCall.args[0].map(tab => tab.providerName)).toEqual(expectedTabs);
        expect(tabManager.getTabs().map(tab => tab.providerName)).toEqual(expectedTabs);
      });
    });
  });
});
