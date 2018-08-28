"use strict";

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _trackNewEditorLatency() {
  const data = _interopRequireDefault(require("../lib/trackNewEditorLatency"));

  _trackNewEditorLatency = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('trackNewEditorLatency', () => {
  it('tracks latency of switching between editors', async () => {
    (0, _trackNewEditorLatency().default)();
    const tracks = [];
    jest.spyOn(_nuclideAnalytics().HistogramTracker.prototype, 'track').mockImplementation(function (value) {
      tracks.push([this._eventName, value]);
    });
    await atom.workspace.open(__filename);
    await atom.workspace.open();
    await (0, _waits_for().default)(() => {
      return tracks.length > 0;
    });
    expect(tracks.length).toBe(2);
    expect(tracks[0][0]).toBe('open-editor');
    expect(tracks[1][0]).toBe('open-editor'); // This needs to be separate (otherwise it blends into the 'add' event).

    await atom.workspace.open(__filename);
    await (0, _waits_for().default)(() => tracks.length > 2);
    expect(tracks.length).toBe(3);
    expect(tracks[2][0]).toBe('switch-editor');
  });
});