"use strict";

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _JediServerManager() {
  const data = _interopRequireDefault(require("../lib/JediServerManager"));

  _JediServerManager = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
describe('JediServerManager', () => {
  let jediServerManager;
  beforeEach(() => {
    jediServerManager = new (_JediServerManager().default)();
  });
  it('caches syspaths by file name', async () => {
    const mockPath = '/a/b/c';
    const spy = jest.spyOn(_fsPromise().default, 'findFurthestFile').mockReturnValue(Promise.resolve(mockPath));
    const sysPath = jediServerManager.getSysPath('/test/file.txt');
    expect(sysPath).toEqual([]);
    expect(spy).toHaveBeenCalledWith('__init__.py', '/test', true); // Second call with the same source path should retrieve top-level module path
    // directly from cache.

    _fsPromise().default.findFurthestFile.mockReset();

    expect(spy).not.toHaveBeenCalled();
    await (0, _waits_for().default)(() => jediServerManager.getSysPath('/test/file.txt').includes(mockPath));
  });
});