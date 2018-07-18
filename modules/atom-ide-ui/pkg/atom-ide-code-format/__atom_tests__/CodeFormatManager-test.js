"use strict";

var _atom = require("atom");

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
    return data;
  };

  return data;
}

function config() {
  const data = _interopRequireWildcard(require("../lib/config"));

  config = function () {
    return data;
  };

  return data;
}

function _CodeFormatManager() {
  const data = _interopRequireDefault(require("../lib/CodeFormatManager"));

  _CodeFormatManager = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const sleep = n => new Promise(r => setTimeout(r, n));

describe('CodeFormatManager', () => {
  let textEditor;
  beforeEach(async () => {
    _temp().default.track();

    const file = _temp().default.openSync();

    textEditor = await atom.workspace.open(file.path);
  });
  it('formats an editor on request', async () => {
    const manager = new (_CodeFormatManager().default)();
    manager.addRangeProvider({
      grammarScopes: ['text.plain.null-grammar'],
      priority: 1,
      formatCode: () => Promise.resolve([{
        oldRange: new _atom.Range([0, 0], [0, 3]),
        oldText: 'abc',
        newText: 'def'
      }])
    });
    textEditor.setText('abc');
    atom.commands.dispatch(atom.views.getView(textEditor), 'code-format:format-code');
    await (0, _waits_for().default)(() => textEditor.getText() === 'def');
  });
  it('format an editor using formatEntireFile', async () => {
    const manager = new (_CodeFormatManager().default)();
    manager.addFileProvider({
      grammarScopes: ['text.plain.null-grammar'],
      priority: 1,
      formatEntireFile: () => Promise.resolve({
        formatted: 'ghi'
      })
    });
    textEditor.setText('abc');
    atom.commands.dispatch(atom.views.getView(textEditor), 'code-format:format-code');
    await (0, _waits_for().default)(() => textEditor.getText() === 'ghi');
  });
  it('formats an editor on type', async () => {
    jest.spyOn(config(), 'getFormatOnType').mockReturnValue(true);
    const manager = new (_CodeFormatManager().default)();
    const provider = {
      grammarScopes: ['text.plain.null-grammar'],
      priority: 1,
      formatAtPosition: () => Promise.resolve([{
        oldRange: new _atom.Range([0, 0], [0, 3]),
        oldText: 'abc',
        newText: 'def'
      }]),
      keepCursorPosition: false
    };
    const spy = jest.spyOn(provider, 'formatAtPosition');
    manager.addOnTypeProvider(provider);
    textEditor.setText('a');
    textEditor.setCursorBufferPosition([0, 1]);
    textEditor.insertText('b');
    textEditor.insertText('c');
    await (0, _waits_for().default)(() => textEditor.getText() === 'def'); // Debouncing should ensure only one format call.

    expect(spy.mock.calls.length).toBe(1);
  });
  it('formats an editor on save', async () => {
    jest.spyOn(config(), 'getFormatOnSave').mockReturnValue(true);
    const manager = new (_CodeFormatManager().default)();
    manager.addOnSaveProvider({
      grammarScopes: ['text.plain.null-grammar'],
      priority: 1,
      formatOnSave: () => Promise.resolve([{
        oldRange: new _atom.Range([0, 0], [0, 3]),
        oldText: 'abc',
        newText: 'def'
      }])
    });
    textEditor.setText('abc');
    await textEditor.save();
    expect(textEditor.getText()).toBe('def');
  });
  it('should still save on timeout', async () => {
    jest.spyOn(config(), 'getFormatOnSave').mockReturnValue(true);
    const manager = new (_CodeFormatManager().default)();
    manager.addRangeProvider({
      grammarScopes: ['text.plain.null-grammar'],
      priority: 1,
      formatCode: () => new Promise(() => {})
    });
    const spy = jest.spyOn(textEditor.getBuffer(), 'save');
    textEditor.save();
    const savePromise = Promise.resolve(textEditor.save()); // The first save should be pushed through after the 2nd.

    await (0, _waits_for().default)(() => spy.mock.calls.length === 1);
    await sleep(3000); // Hitting the timeout will force the 2nd save through.

    await (0, _waits_for().default)(() => spy.mock.calls.length === 2); // The real save should still go through.

    await (() => savePromise)(); // Sanity check.

    expect(spy.mock.calls.length).toBe(2);
  });
});