'use strict';

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons-atom/test-helpers');
}

var _trackKeyLatency;

function _load_trackKeyLatency() {
  return _trackKeyLatency = _interopRequireDefault(require('../lib/trackKeyLatency'));
}

var _trackKeyLatency2;

function _load_trackKeyLatency2() {
  return _trackKeyLatency2 = require('../lib/trackKeyLatency');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
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
 *  strict-local
 * @format
 */

/* global requestAnimationFrame */

beforeEach(() => {
  (0, (_testHelpers || _load_testHelpers()).attachWorkspace)();
});

const sleep = n => new Promise(r => setTimeout(r, n));

describe('trackKeyLatency', () => {
  it('is able to measure key latency', async () => {
    const trackSpy = jest.spyOn((_nuclideAnalytics || _load_nuclideAnalytics()).HistogramTracker.prototype, 'track');
    const disposable = (0, (_trackKeyLatency || _load_trackKeyLatency()).default)();

    const editor = await atom.workspace.open();
    await sleep(1000); // trigger the initial delay

    for (let i = 0; i < (_trackKeyLatency2 || _load_trackKeyLatency2()).KEYSTROKES_TO_IGNORE + 1; i++) {
      editor.insertText('x');
    }

    await (0, (_waits_for || _load_waits_for()).default)(() => trackSpy.mock.calls.length === 2);

    expect(trackSpy.mock.calls.length).toBe(2);
    expect(trackSpy.mock.calls[0][0]).toBeLessThan(trackSpy.mock.calls[1][0]);
    disposable.dispose();
  });
});

// This is more of an assertion that the assumptions in trackKeyLatency hold up;
// in particular that an animation frame is enough to flush the DOM update.
describe('TextEditor', () => {
  it('updates the DOM after an animation frame', async () => {
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
    expect((await innerHTMLPromise)).toContain(insertText);
  });
});