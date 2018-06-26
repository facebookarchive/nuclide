'use strict';

var _analytics;

function _load_analytics() {
  return _analytics = require('../../../modules/nuclide-commons/analytics');
}

var _track;

function _load_track() {
  return _track = _interopRequireDefault(require('../lib/track'));
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

jest.unmock('../../../modules/nuclide-commons/analytics');
jest.mock('../lib/track', () => {
  return {
    track: jest.fn(() => Promise.resolve(1))
  };
});

const sleep = n => new Promise(r => setTimeout(r, n));

beforeEach(() => {
  jest.restoreAllMocks();
  (0, (_analytics || _load_analytics()).setRawAnalyticsService)((_track || _load_track()).default);
});

describe('startTracking', () => {
  let trackKey;
  let trackValues;
  let startTime;

  beforeEach(() => {
    jest.spyOn(process, 'hrtime').mockImplementation(() => {
      if (startTime == null) {
        startTime = Date.now();
      }
      const milliseconds = Date.now() - startTime;
      const seconds = Math.floor(milliseconds / 1000);
      const nanoseconds = (milliseconds - seconds * 1000) * 1000000;
      return [seconds, nanoseconds];
    });

    // Clear intercepted tracking data.
    trackKey = null;
    trackValues = null;

    (_track || _load_track()).default.track.mockImplementation((key, values) => {
      trackKey = key;
      trackValues = values;
      return Promise.resolve(1);
    });
  });

  it('startTracking - success', async () => {
    const timer = (0, (_analytics || _load_analytics()).startTracking)('st-success');
    await sleep(10);
    timer.onSuccess();
    expect((_track || _load_track()).default.track).toHaveBeenCalled();
    expect(trackKey).toBe('performance');

    if (!(trackValues != null)) {
      throw new Error('Invariant violation: "trackValues != null"');
    }

    expect(Number(trackValues.duration)).toBeGreaterThanOrEqual(10);
    expect(trackValues.eventName).toBe('st-success');
    expect(trackValues.error).toBe('0');
    expect(trackValues.exception).toBe('');
  });

  it('startTracking - success with values', async () => {
    const timer = (0, (_analytics || _load_analytics()).startTracking)('st-success', { newValue: 'value' });
    await sleep(10);
    timer.onSuccess();
    expect((_track || _load_track()).default.track).toHaveBeenCalled();
    expect(trackKey).toBe('performance');

    if (!(trackValues != null)) {
      throw new Error('Invariant violation: "trackValues != null"');
    }

    expect(Number(trackValues.duration)).toBeGreaterThanOrEqual(10);
    expect(trackValues.eventName).toBe('st-success');
    expect(trackValues.error).toBe('0');
    expect(trackValues.exception).toBe('');
    expect(trackValues.newValue).toBe('value');
  });

  it('startTracking - error', async () => {
    const timer = (0, (_analytics || _load_analytics()).startTracking)('st-error');
    await sleep(11);
    timer.onError(new Error());
    expect((_track || _load_track()).default.track).toHaveBeenCalled();
    expect(trackKey).toBe('performance');

    if (!(trackValues != null)) {
      throw new Error('Invariant violation: "trackValues != null"');
    }

    expect(Number(trackValues.duration)).toBeGreaterThanOrEqual(11);
    expect(trackValues.eventName).toBe('st-error');
    expect(trackValues.error).toBe('1');
    expect(trackValues.exception).toBe('Error');
  });

  it('startTracking - error with values', async () => {
    const timer = (0, (_analytics || _load_analytics()).startTracking)('st-error', { newValue: 'value' });
    await sleep(11);
    timer.onError(new Error());
    expect((_track || _load_track()).default.track).toHaveBeenCalled();
    expect(trackKey).toBe('performance');

    if (!(trackValues != null)) {
      throw new Error('Invariant violation: "trackValues != null"');
    }

    expect(Number(trackValues.duration)).toBeGreaterThanOrEqual(11);
    expect(trackValues.eventName).toBe('st-error');
    expect(trackValues.error).toBe('1');
    expect(trackValues.exception).toBe('Error');
    expect(trackValues.newValue).toBe('value');
  });
});

describe('trackImmediate', () => {
  it('calls track with immediate = true', async () => {
    const result = await (0, (_analytics || _load_analytics()).trackImmediate)('test', {});
    expect(result).toBe(1);
    expect((_track || _load_track()).default.track).toHaveBeenCalledWith('test', {}, true);
  });
});