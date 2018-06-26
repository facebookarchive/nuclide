'use strict';

var _blocked;

function _load_blocked() {
  return _blocked = _interopRequireDefault(require('../lib/blocked'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let now = 0; /**
              * Copyright (c) 2015-present, Facebook, Inc.
              * All rights reserved.
              *
              * This source code is licensed under the license found in the LICENSE file in
              * the root directory of this source tree.
              *
              *  strict-local
              * @format
              */

describe('blocked()', () => {
  let blockHandler;
  let intervalHandler;

  beforeEach(() => {
    blockHandler = jest.fn();
    jest.useFakeTimers();
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    intervalHandler = (0, (_blocked || _load_blocked()).default)(blockHandler, 100, 10);
  });

  afterEach(() => {
    intervalHandler.dispose();
  });

  it('reports blocking events over the threshold', () => {
    now = 150;
    jest.advanceTimersByTime(150);

    expect(blockHandler.mock.calls.length).toBe(1);
    expect(blockHandler.mock.calls[0][0]).toBe(50);
  });
});