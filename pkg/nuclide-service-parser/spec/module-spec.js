'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getProxy, __test__} from '..';
import {addMatchers} from '../../nuclide-test-helpers';

describe('Module public API.', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  it('Creates a remote proxy for a module, caching the intermediate results.', () => {
    const fakeClient: any = {};
    const defFile = '../spec/fixtures/FunctionService.def';

    expect(__test__.definitionsCache.size).toBe(0);

    const proxy = getProxy('FunctionService', defFile, fakeClient);
    expect(Object.keys(proxy)).diffJson([
      'TestFunctionA', 'TestFunctionB', 'TestFunctionC', 'TestFunctionD', 'ReturnAlias']);

    // Expect that getProxy added files to the cache.
    expect(__test__.definitionsCache.size).toBe(1);
    expect(__test__.proxiesCache.size).toBe(1);
    for (const entry of __test__.proxiesCache) {
      // Check that the fake client has been cached.
      expect(entry[1].proxies.has(fakeClient)).toBe(true);
    }
  });
});
