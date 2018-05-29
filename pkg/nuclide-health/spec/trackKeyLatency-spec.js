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

/* global requestAnimationFrame */

import {jasmineAttachWorkspace} from 'nuclide-commons-atom/test-helpers';
import trackKeyLatency, {KEYSTROKES_TO_IGNORE} from '../lib/trackKeyLatency';
import {HistogramTracker} from '../../nuclide-analytics';

beforeEach(() => {
  jasmineAttachWorkspace();
});

describe('trackKeyLatency', () => {
  it('is able to measure key latency', () => {
    const trackSpy = spyOn(HistogramTracker.prototype, 'track');
    const disposable = trackKeyLatency();

    waitsForPromise(async () => {
      const editor = await atom.workspace.open();
      advanceClock(1000); // trigger the initial delay

      for (let i = 0; i < KEYSTROKES_TO_IGNORE + 1; i++) {
        editor.insertText('x');
      }
    });

    waitsFor(() => trackSpy.callCount === 2);

    runs(() => {
      expect(trackSpy.callCount).toBe(2);
      // $FlowIgnore: mixed types
      expect(trackSpy.calls[0].args[0]).toBeLessThan(trackSpy.calls[1].args[0]);
      disposable.dispose();
    });
  });
});

// This is more of an assertion that the assumptions in trackKeyLatency hold up;
// in particular that an animation frame is enough to flush the DOM update.
describe('TextEditor', () => {
  it('updates the DOM after an animation frame', () => {
    waitsForPromise(async () => {
      const editor = await atom.workspace.open();
      const insertText = '!!!!!';
      const innerHTMLPromise = new Promise(resolve => {
        editor.onDidChange(() => {
          setImmediate(() => {
            requestAnimationFrame(() => {
              resolve(editor.getElement().innerHTML);
            });
          });
        });
      });
      editor.insertText(insertText);
      expect(await innerHTMLPromise).toContain(insertText);
    });
  });
});
