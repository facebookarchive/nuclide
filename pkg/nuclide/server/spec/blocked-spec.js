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

var now = 0;

describe('blocked()', () => {
  var blockHandler;
  var intervalHandler;

  beforeEach(() => {
    blockHandler = jasmine.createSpy();
    jasmine.Clock.useMock();
    unspy(Date, 'now');
    spyOn(Date, 'now').andCallFake(() => now);

    intervalHandler = blocked(blockHandler, 100, 10);
  });

  afterEach(() => {
    clearInterval(intervalHandler);
  });

  it('reports blocking events over the threshold', () => {
    now = 150;
    jasmine.Clock.tick(150);

    expect(blockHandler.callCount).toBe(1);
    expect(blockHandler.argsForCall[0][0]).toBe(50);
  });
});
