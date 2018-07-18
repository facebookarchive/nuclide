"use strict";

function _Model() {
  const data = _interopRequireDefault(require("../Model"));

  _Model = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
describe('Model', () => {
  it('setStates state when setState is called', () => {
    const model = new (_Model().default)({
      count: 0,
      other: true
    });
    model.setState({
      count: 5
    });
    expect(model.state.count).toBe(5);
  });
  it('only changes the provided values when setState is called', () => {
    const model = new (_Model().default)({
      count: 0,
      other: true
    });
    model.setState({
      count: 5
    });
    expect(model.state.other).toBe(true);
  });
  it('can be converted to an observable', async () => {
    const model = new (_Model().default)({
      count: 0,
      other: true
    });
    const states = model.toObservable().take(2).toArray().toPromise();
    model.setState({
      count: 5
    });
    expect((await states)).toEqual([{
      count: 0,
      other: true
    }, {
      count: 5,
      other: true
    }]);
  });
});