'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var blocked = require('../lib/blocked');

describe('blocked()', () => {
  var blockHandler;
  var intervalHandler;

  beforeEach(() => {
    blockHandler = jasmine.createSpy();
    // Use spec-helper.coffee utils to test the the heartbeat interval.
    window.setInterval = window.fakeSetInterval;
    window.clearInterval = window.fakeClearInterval;
    spyOn(Date, 'now').andCallFake(() => window.now);

    intervalHandler = blocked(blockHandler, 100, 10);
  });

  afterEach(() => {
    clearInterval(intervalHandler);
  });

  it('reports blocking events over the threshold', () => {
    window.advanceClock(150);
    expect(blockHandler.callCount).toBe(1);
    expect(blockHandler.argsForCall[0][0]).toBe(50);
  });
});
