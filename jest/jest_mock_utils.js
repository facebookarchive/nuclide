/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMock = exports.mockFunction = void 0;

const mockFunction = (obj, propName, mockImplementation) => {
  const mock = jest.fn(mockImplementation);
  obj[propName] = mock;
  return mock;
};

exports.mockFunction = mockFunction;

const getMock = fn => {
  if (!fn._isMockFunction) {
    throw new Error('Passed function is not a mock');
  }

  return fn;
};

exports.getMock = getMock;