"use strict";

function _once() {
  const data = _interopRequireDefault(require("../once"));

  _once = function () {
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
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('once', () => {
  it('correctly calls only once', () => {
    let num = 1;
    const onceFn = (0, _once().default)(n => num += n);
    expect(onceFn(2)).toEqual(3);
    expect(onceFn(2)).toEqual(3);
  });
  it('does not swallow flow types', () => {
    const func = a => 1;

    const onceFn = (0, _once().default)(func);
    const ret = onceFn('bar');
    ret; // $FlowIgnore: func's first param should be a string.

    onceFn(1);
  });
});