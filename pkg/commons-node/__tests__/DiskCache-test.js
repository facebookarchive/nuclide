"use strict";

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
    return data;
  };

  return data;
}

function _DiskCache() {
  const data = _interopRequireDefault(require("../DiskCache"));

  _DiskCache = function () {
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
_temp().default.track();

describe('DiskCache', () => {
  let tempFile;
  beforeEach(() => {
    tempFile = _temp().default.openSync();
  });
  it('is able to save and load values from disk', async () => {
    const cache = new (_DiskCache().default)(tempFile.path, key => `k${key}`);
    expect((await cache.load())).toBe(false);
    expect(cache.getPath()).toBe(tempFile.path);
    expect(cache.getByteSize()).toBe(0);
    expect(cache.get(1)).toBe(undefined);
    cache.set(1, 2);
    cache.set(3, 4);
    expect(cache.get(1)).toBe(2);
    expect(cache.get(3)).toBe(4);
    expect((await cache.save())).toBe(true);
    expect(cache.getByteSize()).toBe(15);
    const restore = new (_DiskCache().default)(tempFile.path, key => `k${key}`);
    expect((await restore.load())).toBe(true);
    expect(restore.getByteSize()).toBe(15);
    expect(restore.get(1)).toBe(2);
    expect(restore.get(3)).toBe(4);
  });
  it('does not leak Object methods', async () => {
    const cache = new (_DiskCache().default)(tempFile.path, x => x);
    expect(cache.get('hasOwnProperty')).toBe(undefined);
    expect((await cache.save())).toBe(true);
    expect((await cache.load())).toBe(true);
    expect(cache.get('hasOwnProperty')).toBe(undefined);
  });
});