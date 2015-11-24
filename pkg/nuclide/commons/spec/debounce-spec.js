'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {debounce} = require('../lib/main');

describe('debounce()', () => {
  it('only calls function once after time advances', () => {
    const timerCallback: any = jasmine.createSpy('timerCallback');
    const debouncedFunc = debounce(timerCallback, 100, false);

    debouncedFunc();
    expect(timerCallback).not.toHaveBeenCalled();

    window.advanceClock(101);
    expect(timerCallback).toHaveBeenCalled();
  });
});
