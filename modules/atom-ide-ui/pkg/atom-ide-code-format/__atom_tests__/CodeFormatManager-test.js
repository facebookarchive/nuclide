"use strict";

var _atom = require("atom");

function _FileEventHandlers() {
  const data = require("../../../../nuclide-commons-atom/FileEventHandlers");

  _FileEventHandlers = function () {
    return data;
  };

  return data;
}

function _CodeFormatManager() {
  const data = _interopRequireWildcard(require("../lib/CodeFormatManager"));

  _CodeFormatManager = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

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

function _waits_for() {
  const data = _interopRequireDefault(require("../../../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
 * @emails oncall+nuclide
 */
const sleep = n => new Promise(r => setTimeout(r, n));

describe('CodeFormatManager', () => {
  let textEditor;
  let manager;
  let disposables;
  beforeEach(async () => {
    manager = new (_CodeFormatManager().default)();
    disposables = new (_UniversalDisposable().default)((0, _FileEventHandlers().observeTextEditors)());

    _temp().default.track();

    const file = _temp().default.openSync();

    textEditor = await atom.workspace.open(file.path);
  });
  afterEach(async () => {
    manager.dispose();
    disposables.dispose();
  });
  it('formats an editor on request', async () => {
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
    manager.addRangeProvider({
      grammarScopes: ['text.plain.null-grammar'],
      priority: 1,
      formatCode: async () => {
        await sleep(_CodeFormatManager().SAVE_TIMEOUT + 1000);
        return [];
      }
    });
    const spy = jest.spyOn(textEditor.getBuffer(), 'save');
    textEditor.save(); // Wait until the buffer has been saved and verify it has been saved exactly
    // once.

    await (0, _waits_for().default)(() => spy.mock.calls.length > 0);
    expect(spy.mock.calls.length).toBe(1);
  });
});