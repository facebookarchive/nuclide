'use strict';

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _trackNewEditorLatency;

function _load_trackNewEditorLatency() {
  return _trackNewEditorLatency = _interopRequireDefault(require('../lib/trackNewEditorLatency'));
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('trackNewEditorLatency', () => {
  it('tracks latency of switching between editors', async () => {
    (0, (_trackNewEditorLatency || _load_trackNewEditorLatency()).default)();
    const tracks = [];
    jest.spyOn((_nuclideAnalytics || _load_nuclideAnalytics()).HistogramTracker.prototype, 'track').mockImplementation(function (value) {
      tracks.push([this._eventName, value]);
    });
    await atom.workspace.open(__filename);
    await atom.workspace.open();
    await (0, (_waits_for || _load_waits_for()).default)(() => {
      return tracks.length > 0;
    });
    expect(tracks.length).toBe(2);
    expect(tracks[0][0]).toBe('open-editor');
    expect(tracks[1][0]).toBe('open-editor');
    // This needs to be separate (otherwise it blends into the 'add' event).
    await atom.workspace.open(__filename);
    await (0, (_waits_for || _load_waits_for()).default)(() => tracks.length > 2);
    expect(tracks.length).toBe(3);
    expect(tracks[2][0]).toBe('switch-editor');
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */