'use strict';

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _JediServerManager;

function _load_JediServerManager() {
  return _JediServerManager = _interopRequireDefault(require('../lib/JediServerManager'));
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('JediServerManager', () => {
  let jediServerManager;

  beforeEach(() => {
    jediServerManager = new (_JediServerManager || _load_JediServerManager()).default();
  });

  it('caches syspaths by file name', async () => {
    const mockPath = '/a/b/c';
    const spy = jest.spyOn((_fsPromise || _load_fsPromise()).default, 'findFurthestFile').mockReturnValue(Promise.resolve(mockPath));

    const sysPath = jediServerManager.getSysPath('/test/file.txt');
    expect(sysPath).toEqual([]);
    expect(spy).toHaveBeenCalledWith('__init__.py', '/test', true);

    // Second call with the same source path should retrieve top-level module path
    // directly from cache.
    (_fsPromise || _load_fsPromise()).default.findFurthestFile.mockReset();
    expect(spy).not.toHaveBeenCalled();

    await (0, (_waits_for || _load_waits_for()).default)(() => jediServerManager.getSysPath('/test/file.txt').includes(mockPath));
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