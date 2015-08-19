'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

describe('singleton', () => {
  var singleton = require('../lib/singleton');
  var count = 0;
  var field = 'singleton-test-field';

  function get() {
    return singleton.get(field, () => { return count++; });
  }

  function clear() {
    singleton.clear(field);
  }

  function reset() {
    return singleton.reset(field, () => { return count++; });
  }

  it('get', () => {
    var id1 = get();
    var id2 = get();
    expect(id1).toEqual(id2);
  });

  it('clear', () => {
    var id1 = get();

    clear();

    var id2 = get();
    expect(id2 !== id1).toBe(true);
  });

  it('reset', () => {
    var id1 = get();

    var id2 = reset();
    expect(id2).not.toEqual(id1);

    var id3 = get();
    expect(id3).toEqual(id2);
  });
});
