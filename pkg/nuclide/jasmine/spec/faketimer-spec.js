'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

describe('Fake timer test suite', () => {
  it('test setTimeout and clearTimeout', () => {
    var firstExecuted = false;

    setTimeout(() => {firstExecuted = true}, 10);

    window.advanceClock(9);

    expect(firstExecuted).toBe(false);
    window.advanceClock(1);
    expect(firstExecuted).toBe(true);

    var secondExecuted = false;
    var thirdExecuted = false;

    var secondId = setTimeout(() => {secondExecuted = true}, 20);
    setTimeout(() => {thirdExecuted = true}, 30);

    window.advanceClock(19);
    clearTimeout(secondId);

    expect(secondExecuted).toBe(false);
    expect(thirdExecuted).toBe(false);

    window.advanceClock(20);

    expect(secondExecuted).toBe(false);
    expect(thirdExecuted).toBe(true);
  });

  it('test fakeSetTimeout triggered in expected order', () => {
    var firstExecuted = false;
    var secondExecuted = false;

    setTimeout(() => {
      firstExecuted = true;
      expect(secondExecuted).toBe(false);
    }, 10);

    setTimeout(() => {
      secondExecuted = true;
      expect(firstExecuted).toBe(true);
    }, 20);

    window.advanceClock(20);

    expect(firstExecuted).toBe(true);
    expect(secondExecuted).toBe(true);
  });

  it('test fakeSetInterval and fakeClearInterval', () => {
    var firstExecutedCount = 0;
    var secondExecutedCount = 0;

    window.fakeSetInterval(() => firstExecutedCount++, 10);
    window.advanceClock(5);
    var secondId = window.fakeSetInterval(() => secondExecutedCount++, 10);

    window.advanceClock(15);

    expect(firstExecutedCount).toBe(2);
    expect(secondExecutedCount).toBe(1);

    window.fakeClearInterval(secondId);

    window.advanceClock(20);

    expect(firstExecutedCount).toBe(4);
    expect(secondExecutedCount).toBe(1);
  });

  // Atom's implementation will fail at this test case. (https://github.com/atom/atom/issues/6627)
  it('test fakeSetInterval triggered in expected order', () => {
    var firstExecutedCount = 0;
    var secondExecutedCount = 0;

    window.fakeSetInterval(() => {
      firstExecutedCount++;
      expect(secondExecutedCount < firstExecutedCount).toBe(true);
    }, 10);

    window.advanceClock(5);

    window.fakeSetInterval(() => secondExecutedCount++, 10);

    window.advanceClock(40);

    expect(firstExecutedCount).toBe(4);
    expect(secondExecutedCount).toBe(4);
  });
});
