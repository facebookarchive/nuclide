'use babel';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var main = require('../lib/main');
var startTracking = main.startTracking;

describe('The @trackTiming decorator', () => {
  var trackKey, trackValues;

  beforeEach(() => {
    // Clear intercepted tracking data.
    trackKey = null;
    trackValues = null;

    // Intercept Parse API call.
    spyOn(main, 'track').andCallFake((key, values) => {
      trackKey = key;
      trackValues = values;
      return Promise.resolve();
    });
  });

  it('startTracking - success', () => {
    const timer = startTracking('st-success');
    advanceClock(10);
    timer.onSuccess();
    expect(main.track).toHaveBeenCalled();
    expect(trackKey).toBe('performance');
    expect(trackValues.duration).toBe('10');
    expect(trackValues.eventName).toBe('st-success');
    expect(trackValues.error).toBe('0');
    expect(trackValues.exception).toBe('');
  });

  it('startTracking - error', () => {
    const timer = startTracking('st-error');
    advanceClock(11);
    timer.onError(new Error());
    expect(main.track).toHaveBeenCalled();
    expect(trackKey).toBe('performance');
    expect(trackValues.duration).toBe('11');
    expect(trackValues.eventName).toBe('st-error');
    expect(trackValues.error).toBe('1');
    expect(trackValues.exception).toBe('Error');
  });
});
