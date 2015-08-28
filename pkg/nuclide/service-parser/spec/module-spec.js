'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getProxy, __test__} from '../lib/main';
import {matchers} from 'nuclide-test-helpers';

describe('Module public API.', () => {
  beforeEach(function() {
    this.addMatchers(matchers);
  });

  it('Creates a remote proxy for a module, caching the intermediate results.', () => {
    var fakeClient = {};
    var defFile = '../spec/fixtures/FunctionService.def';

    expect(__test__.definitionsCache.size).toBe(0);

    var proxy = getProxy(defFile, fakeClient);
    expect(Object.keys(proxy)).diffJson(['TestFunctionA', 'TestFunctionB', 'TestFunctionC']);

    // Expect that getProxy added files to the cache.
    expect(__test__.definitionsCache.size).toBe(1);
    expect(__test__.proxiesCache.size).toBe(1);
    for (var entry of __test__.proxiesCache) {
      // Check that the fake client has been cached.
      expect(entry[1].proxies.has(fakeClient)).toBe(true);
    }
  });
});
