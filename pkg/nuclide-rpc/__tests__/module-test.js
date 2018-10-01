"use strict";

function _main() {
  const data = require("../lib/main");

  _main = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('Module public API.', () => {
  beforeEach(() => {
    _main().__test__.proxiesCache.clear();
  });
  it('Creates a remote proxy for a module, caching the intermediate results.', () => {
    const fakeClient = {};

    const defFile = require.resolve("../__mocks__/fixtures/FunctionService.def");

    expect(_main().__test__.proxiesCache.size).toBe(0);
    const factory = (0, _main().createProxyFactory)('FunctionService', false, defFile, []);
    const proxy = factory(fakeClient);
    expect(Object.keys(proxy)).toEqual(['TestFunctionA', 'TestFunctionB', 'TestFunctionC', 'TestFunctionD', 'ReturnAlias']); // Expect that createProxyFactory added files to the cache.

    expect(_main().__test__.proxiesCache.size).toBe(1);
  });
});