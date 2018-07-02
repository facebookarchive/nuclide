"use strict";

var _os = _interopRequireDefault(require("os"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

function _waits_for() {
  const data = _interopRequireDefault(require("../../../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _CodeHighlightManager() {
  const data = _interopRequireDefault(require("../lib/CodeHighlightManager"));

  _CodeHighlightManager = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
describe('CodeHighlightManager', () => {
  let manager;
  let provider;
  let editor;
  beforeEach(async () => {
    jest.restoreAllMocks();
    editor = await atom.workspace.open(_nuclideUri().default.join(_os.default.tmpdir(), 'test.txt'));
    editor.setText('abc\ndef\nghi');
    manager = new (_CodeHighlightManager().default)();
    provider = {
      priority: 1,
      grammarScopes: ['text.plain.null-grammar'],
      highlight: (_editor, position) => Promise.resolve([])
    };
    manager.addProvider(provider);
  });
  it.skip('updates highlights on cursor move', async () => {
    const ranges = [new _atom.Range([0, 0], [0, 3])];
    const spy = jest.spyOn(provider, 'highlight').mockReturnValue(ranges); // Just opening the editor should trigger highlights.

    await (0, _promise().sleep)(1); // editor debounce

    expect(spy).toHaveBeenCalled(); // (once the promise resolves).

    await (0, _waits_for().default)(() => manager._markers.length === 1);
    ranges[0] = new _atom.Range([1, 0], [1, 3]);
    editor.setCursorBufferPosition(new _atom.Point(1, 0));
    await (0, _promise().sleep)(300); // trigger debounce
    // Old markers should be cleared immediately.

    expect(manager._markers.length).toBe(0);
    expect(spy.mock.calls.length).toBe(2);
    await (0, _waits_for().default)(() => manager._markers.length === 1); // If we're still inside the range, don't fire a new event.

    editor.setCursorBufferPosition(new _atom.Point(1, 1));
    expect(spy.mock.calls.length).toBe(2);
    atom.workspace.open(_nuclideUri().default.join(_os.default.tmpdir(), 'test2.txt')); // Opening a new editor should clear out old markers.

    await (0, _promise().sleep)(1);
    expect(manager._markers.length).toBe(0);
  });
  it('updates highlights on change', async () => {
    const ranges = [new _atom.Range([0, 0], [0, 1])];
    const spy = jest.spyOn(provider, 'highlight').mockReturnValue(ranges);
    await (0, _promise().sleep)(1);
    editor.insertText('a');
    await (0, _promise().sleep)(3000); // trigger typing debounce

    expect(spy).toHaveBeenCalled(); // Wait for the promise to resolve.

    await (0, _waits_for().default)(() => manager._markers.length === 1);
    editor.insertText('b'); // Clear out immediately.

    expect(manager._markers.length).toBe(0);
  });
});