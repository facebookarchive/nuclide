"use strict";

function _testHelpers() {
  const data = require("../../../modules/nuclide-commons-atom/test-helpers");

  _testHelpers = function () {
    return data;
  };

  return data;
}

function _trackKeyLatency() {
  const data = _interopRequireWildcard(require("../lib/trackKeyLatency"));

  _trackKeyLatency = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/* global requestAnimationFrame */
beforeEach(() => {
  (0, _testHelpers().attachWorkspace)();
});

const sleep = n => new Promise(r => setTimeout(r, n));

describe('trackKeyLatency', () => {
  it('is able to measure key latency', async () => {
    const trackSpy = jest.spyOn(_nuclideAnalytics().HistogramTracker.prototype, 'track');
    const disposable = (0, _trackKeyLatency().default)();
    const editor = await atom.workspace.open();
    await sleep(1000); // trigger the initial delay

    for (let i = 0; i < _trackKeyLatency().KEYSTROKES_TO_IGNORE + 1; i++) {
      editor.insertText('x');
    }

    await (0, _waits_for().default)(() => trackSpy.mock.calls.length === 2);
    expect(trackSpy.mock.calls.length).toBe(2);
    expect(trackSpy.mock.calls[0][0]).toBeLessThan(trackSpy.mock.calls[1][0]);
    disposable.dispose();
  });
}); // This is more of an assertion that the assumptions in trackKeyLatency hold up;
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