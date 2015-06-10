'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {trackTiming} = require('../lib/main');

class Test {

  @trackTiming()
  foo() {
    return 1;
  }

  @trackTiming()
  bar() {
    return Promise.resolve(1);
  }
}

describe('Default analytics implementation', () => {

  it('correctly executes a sync function call', () => {
    var result = (new Test()).foo();
    expect(result).toBe(1);
  });

  it('correctly executes an async function call', () => {
    waitsForPromise(async () => {
      var result = await (new Test()).bar();
      expect(result).toBe(1);
    });
  });

});
