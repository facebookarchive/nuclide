/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import {HistogramTracker} from '../../nuclide-analytics';
import trackNewEditorLatency from '../lib/trackNewEditorLatency';

describe('trackNewEditorLatency', () => {
  it('tracks latency of switching between editors', () => {
    trackNewEditorLatency();
    const tracks = [];
    spyOn(HistogramTracker.prototype, 'track').andCallFake(function(value) {
      tracks.push([this._eventName, value]);
    });
    waitsForPromise(async () => {
      await atom.workspace.open(__filename);
      await atom.workspace.open();
    });
    waitsFor(() => {
      return tracks.length > 0;
    });
    runs(() => {
      expect(tracks.length).toBe(2);
      expect(tracks[0][0]).toBe('open-editor');
      expect(tracks[1][0]).toBe('open-editor');
    });
    // This needs to be separate (otherwise it blends into the 'add' event).
    waitsForPromise(async () => {
      await atom.workspace.open(__filename);
    });
    waitsFor(() => {
      return tracks.length > 2;
    });
    runs(() => {
      expect(tracks.length).toBe(3);
      expect(tracks[2][0]).toBe('switch-editor');
    });
  });
});
