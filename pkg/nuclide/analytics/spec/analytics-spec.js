'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

describe('Default analytics implementation', () => {
  var eventName = 'TEST';

  it('correctly executes a sync function call', () => {
    var {trackTimingAndCall} = require('../lib/main');
    var result = trackTimingAndCall(eventName, () => 1);
    expect(result).toBe(1);
  });

  it('correctly executes an async function call', () => {
    waitsForPromise(async () => {
      var {trackTimingAndCallAsync} = require('../lib/main');
      var result = await trackTimingAndCallAsync(eventName, () => Promise.resolve(1));
      expect(result).toBe(1);
    });
  });

});
