'use strict';

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

it('waits', async () => {
  let condition = false;
  Promise.resolve().then(() => condition = true);
  await (0, (_waits_for || _load_waits_for()).default)(() => condition);
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict
     * @format
     */

it("can't wait anymore", async () => {
  await expect((0, (_waits_for || _load_waits_for()).default)(() => false, undefined, 1)).rejects.toThrow('but it never did');
});

it('gives a message', async () => {
  await expect((0, (_waits_for || _load_waits_for()).default)(() => false, 'lol', 1)).rejects.toThrow('lol');
});