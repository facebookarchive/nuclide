'use strict';

var _main;

function _load_main() {
  return _main = require('../lib/main');
}

describe('Module public API.', () => {
  beforeEach(() => {
    (_main || _load_main()).__test__.proxiesCache.clear();
  });

  it('Creates a remote proxy for a module, caching the intermediate results.', () => {
    const fakeClient = {};
    const defFile = require.resolve('../__mocks__/fixtures/FunctionService.def');

    expect((_main || _load_main()).__test__.proxiesCache.size).toBe(0);

    const factory = (0, (_main || _load_main()).createProxyFactory)('FunctionService', false, defFile, []);
    const proxy = factory(fakeClient);

    expect(Object.keys(proxy)).toEqual(['TestFunctionA', 'TestFunctionB', 'TestFunctionC', 'TestFunctionD', 'ReturnAlias']);

    // Expect that createProxyFactory added files to the cache.
    expect((_main || _load_main()).__test__.proxiesCache.size).toBe(1);
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */