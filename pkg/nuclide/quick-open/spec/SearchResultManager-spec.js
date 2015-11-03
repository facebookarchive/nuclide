'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import SearchResultManager from '../lib/SearchResultManager';
import {__test__} from '../lib/SearchResultManager';
const {_getOmniSearchProviderSpec} =  __test__;

let searchResultManager: any = null;
describe('SearchResultManager', () => {
  beforeEach(() => {
    searchResultManager = new SearchResultManager();
  });

  describe('getRenderableProviders', () => {
    it('Should return OmniSearchProvider even if no actual providers are available.', () => {
      const renderableProviders = searchResultManager.getRenderableProviders();
      expect(renderableProviders).toEqual([_getOmniSearchProviderSpec()]);

    });
  });
});
