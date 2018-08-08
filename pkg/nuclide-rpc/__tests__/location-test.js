"use strict";

function _builtinTypes() {
  const data = require("../lib/builtin-types");

  _builtinTypes = function () {
    return data;
  };

  return data;
}

function _location() {
  const data = require("../lib/location");

  _location = function () {
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
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
const builtin2 = {
  type: 'builtin'
};
const loc1 = {
  type: 'source',
  fileName: 'file1',
  line: 42
};
const loc2 = {
  type: 'source',
  fileName: 'file1',
  line: 42
};
const loc3 = {
  type: 'source',
  fileName: 'file2',
  line: 42
};
const loc4 = {
  type: 'source',
  fileName: 'file1',
  line: 43
};
const loc5 = {
  type: 'source',
  fileName: 'file2',
  line: 43
};
describe('Location', () => {
  it('toString', () => {
    expect((0, _location().locationToString)(_builtinTypes().builtinLocation)).toBe('<builtin>');
    expect((0, _location().locationToString)(loc1)).toBe('file1(42)');
  });
  it('equals', () => {
    expect((0, _location().locationsEqual)(_builtinTypes().builtinLocation, builtin2)).toBe(true);
    expect((0, _location().locationsEqual)(_builtinTypes().builtinLocation, loc1)).toBe(false);
    expect((0, _location().locationsEqual)(loc1, loc2)).toBe(true);
    expect((0, _location().locationsEqual)(loc1, loc3)).toBe(false);
    expect((0, _location().locationsEqual)(loc1, loc4)).toBe(false);
    expect((0, _location().locationsEqual)(loc1, loc5)).toBe(false);
  });
});