"use strict";

function _jest_mock_utils() {
  const data = require("../jest_mock_utils");

  _jest_mock_utils = function () {
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
test('mocks function', () => {
  const obj = {
    a: () => 'hey'
  };
  expect(obj.a()).toBe('hey');
  (0, _jest_mock_utils().mockFunction)(obj, 'a', () => 'pizza');
  expect(obj.a()).toBe('pizza');
});
test('get mock', () => {
  const obj = {
    a: arg => 'hey'
  };
  (0, _jest_mock_utils().mockFunction)(obj, 'a', () => 'pizza');
  const mock = (0, _jest_mock_utils().getMock)(obj.a);
  expect(mock).toHaveProperty('_isMockFunction', true);
  mock.mockImplementation(() => 'whiskey');
  expect(obj.a('taco')).toBe('whiskey');
  expect(mock.mock.calls[0][0]).toBe('taco');
});
test('get mock throws when used on a non-mock fn', () => {
  const obj = {
    a: () => {}
  };
  expect(() => (0, _jest_mock_utils().getMock)(obj.a)).toThrowError('is not a mock');
});