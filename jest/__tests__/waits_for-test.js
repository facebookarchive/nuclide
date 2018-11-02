"use strict";

function _waits_for() {
  const data = _interopRequireWildcard(require("../waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
it('waits', async () => {
  let condition = false;
  Promise.resolve().then(() => condition = true);
  await (0, _waits_for().default)(() => condition);
});
it("can't wait anymore", async () => {
  await expect((0, _waits_for().default)(() => false, undefined, 1)).rejects.toThrow('but it never did');
});
it('gives a message', async () => {
  await expect((0, _waits_for().default)(() => false, 'lol', 1)).rejects.toThrow('lol');
});
it('waits an async predicate', async () => {
  const fn = jest.fn().mockImplementationOnce(() => new Promise(res => setTimeout(() => res(false)))).mockImplementationOnce(() => new Promise(res => setTimeout(() => res(true)))).mockImplementationOnce(() => new Promise(res => setTimeout(() => res(false))));
  await (0, _waits_for().default)(() => fn());
  expect(fn).toHaveBeenCalledTimes(2);
});
it('returns a value', async () => {
  let someVar;
  setTimeout(() => someVar = 'hello', 200);
  const value = await (0, _waits_for().default)(() => someVar);
  expect(value).toBe('hello');
});
it('returns value from a promise', async () => {
  let someVar;
  setTimeout(() => someVar = 'hello', 200);
  const value = await (0, _waits_for().waitsForAsync)(() => Promise.resolve(someVar));
  expect(value).toBe('hello');
});
test('stack trace points to the callsite, not the implementation', async () => {
  const fail = () => (0, _waits_for().default)(() => false, 'yea', 1);

  expect.assertions(1);

  try {
    await fail();
  } catch (e) {
    expect(e.stack).not.toMatch(/waits_for\.js/);
  }
});