"use strict";

var _atom = require("atom");

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _testHelpers() {
  const data = require("../testHelpers");

  _testHelpers = function () {
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
 * 
 * @format
 * @emails oncall+nuclide
 */
const attachToDom = el => {
  // Attach the workspace to the DOM so focus can be determined in tests below.
  const testContainer = document.createElement('div');

  if (!document.body) {
    throw new Error("Invariant violation: \"document.body\"");
  }

  document.body.appendChild(testContainer);
  testContainer.appendChild(el);
};

describe('dispatchKeyboardEvent', () => {
  it('sends copy and paste', async () => {
    const file = await _fsPromise().default.tempfile();
    const editor = await atom.workspace.open(file);
    attachToDom(atom.views.getView(atom.workspace)); // jasmine.attachToDOM();

    editor.insertText('text');
    const events = [];
    atom.keymaps.onDidMatchBinding(event => events.push(event)); // Copy line.

    (0, _testHelpers().dispatchKeyboardEvent)('c', document.activeElement, {
      cmd: true
    }); // Paste copied line.

    (0, _testHelpers().dispatchKeyboardEvent)('v', document.activeElement, {
      cmd: true
    });
    expect(events.length).toBe(2);
    expect(events[0].keystrokes).toBe('cmd-c');
    expect(events[1].keystrokes).toBe('cmd-v');
    expect(editor.getText()).toBe('texttext');
  });
  it('sends escape', async () => {
    await atom.workspace.open((await _fsPromise().default.tempfile()));
    attachToDom(atom.views.getView(atom.workspace));
    const events = [];
    atom.keymaps.onDidMatchBinding(event => events.push(event)); // Hit escape key.

    (0, _testHelpers().dispatchKeyboardEvent)('escape', document.activeElement);
    expect(events.length).toBe(1);
    expect(events[0].keystrokes).toBe('escape');
  });
});
describe('rangeMatchers', () => {
  describe('toEqualAtomRange', () => {
    it('determines when two Ranges are equal.', () => {
      expect(new _atom.Range([0, 0], [0, 0])).toEqual(new _atom.Range([0, 0], [0, 0]));
      expect(new _atom.Range([0, 0], [0, 0])).not.toEqual(new _atom.Range([1, 0], [0, 0]));
    });
  });
  describe('toEqualAtomRanges', () => {
    it('determines when two arrays of Ranges are equal.', () => {
      const ranges = [new _atom.Range([0, 0], [0, 0]), new _atom.Range([1, 1], [1, 1])];
      const sameRanges = [new _atom.Range([0, 0], [0, 0]), new _atom.Range([1, 1], [1, 1])];
      const differentRanges = [new _atom.Range([0, 0], [0, 0]), new _atom.Range([2, 2], [2, 2])];
      expect(ranges).toEqual(sameRanges);
      expect(ranges).not.toEqual(differentRanges);
    });
  });
});