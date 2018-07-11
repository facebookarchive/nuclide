"use strict";

var _atom = require("atom");

function _testHelpers() {
  const data = require("../../../../nuclide-commons-atom/test-helpers");

  _testHelpers = function () {
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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
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

var _path = _interopRequireDefault(require("path"));

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
const sleep = n => new Promise(r => setTimeout(r, n));

describe.skip('SignatureHelpManager', () => {
  let disposable;
  let testProvider;
  let mockDatatipService;
  let editor;
  beforeEach(async () => {
    (0, _testHelpers().attachWorkspace)();
    atom.packages.activatePackage(_path.default.resolve(__dirname, '../'));
    editor = await atom.workspace.open();
    testProvider = {
      priority: 1,
      grammarScopes: ['text.plain.null-grammar'],
      triggerCharacters: new Set(['(']),
      getSignatureHelp: jest.fn().mockReturnValue(Promise.resolve({
        signatures: [{
          label: 'test signature'
        }]
      }))
    };
    mockDatatipService = {
      addProvider() {
        throw new Error();
      },

      addModifierProvider() {
        throw new Error();
      },

      createPinnedDataTip: jest.fn().mockReturnValue(new (_UniversalDisposable().default)())
    };
    atom.packages.serviceHub.consume('signature-help', '0.1.0', registry => {
      disposable = registry(testProvider);
    });
    atom.packages.serviceHub.provide('datatip', '0.1.0', mockDatatipService); // Active editor debounce.

    await sleep(500);
  });
  afterEach(() => {
    disposable.dispose();
  });
  it('responds to manual triggers', async () => {
    editor.insertText('test');
    atom.commands.dispatch(editor.getElement(), 'signature-help:show');
    await (0, _waits_for().default)(() => testProvider.getSignatureHelp.mock.calls.length > 0);
    const signatureSpy = testProvider.getSignatureHelp;
    expect(signatureSpy.mock.calls.length).toBe(1);
    expect(signatureSpy.calls[0].args).toEqual([editor, new _atom.Point(0, 4)]); // Wait for promise to be resolved.

    await (0, _promise().nextTick)();
    const datatipSpy = mockDatatipService.createPinnedDataTip;
    expect(datatipSpy.mock.calls.length).toBe(1);
    expect(datatipSpy.calls[0][0].range).toEqual(new _atom.Range([0, 4], [0, 4])); // Moving the cursor should immediately move the datatip and query again.

    editor.setCursorBufferPosition([0, 3]);
    expect(datatipSpy.mock.calls.length).toBe(2);
    expect(datatipSpy.calls[1][0].range).toEqual(new _atom.Range([0, 3], [0, 3])); // Compensate for the debounce.

    await sleep(500);
    expect(signatureSpy.mock.calls.length).toBe(2);
    expect(signatureSpy.calls[1].args).toEqual([editor, new _atom.Point(0, 3)]); // Wait for promise to be resolved.

    await (0, _promise().nextTick)();
    expect(datatipSpy.mock.calls.length).toBe(3); // Once the signature returns null, abort the flow.

    signatureSpy.mockReturnValue(Promise.resolve(null));
    editor.setCursorBufferPosition([0, 0]); // No repositioning when the cursor moves too far.

    expect(datatipSpy.mock.calls.length).toBe(3); // Compensate for the debounce.

    await sleep(500);
    expect(signatureSpy.mock.calls.length).toBe(3);
    await (0, _promise().nextTick)();
    expect(datatipSpy.mock.calls.length).toBe(3);
    editor.setCursorBufferPosition([0, 1]);
    await sleep(500);
    expect(signatureSpy.mock.calls.length).toBe(3);
  });
  it('responds to typing trigger characters', async () => {
    editor.insertText('a');
    await sleep(1); // debounce

    const signatureSpy = testProvider.getSignatureHelp;
    expect(signatureSpy.mock.calls.length).toBe(0);
    editor.insertText('(');
    await sleep(1); // debounce

    expect(signatureSpy.mock.calls.length).toBe(1);
    expect(signatureSpy.calls[0].args).toEqual([editor, new _atom.Point(0, 2)]); // We've tested the regular flow above; test cancellation too.

    /* global KeyboardEvent */

    const escape = new KeyboardEvent('keydown'); // No APi to set keyCode :(

    Object.defineProperty(escape, 'keyCode', {
      value: 27
    });
    editor.getElement().dispatchEvent(escape); // Contains a trigger character, but has the wrong cursor.

    editor.insertText('x(y');
    await sleep(500); // debounce

    expect(signatureSpy.mock.calls.length).toBe(1); // Test the autocomplete-plus scenario: insertion + selection

    const startCol = editor.getCursorBufferPosition().column;
    editor.insertText('abc(arg1, arg2)');
    editor.setSelectedBufferRange([[0, startCol + 4], [0, startCol + 7]]);
    await sleep(1); // debounce

    expect(signatureSpy.mock.calls.length).toBe(2);
  });
  it('responds to typing over a selection', async () => {
    editor.setText('(abcdef');
    await sleep(1); // debounce

    const signatureSpy = testProvider.getSignatureHelp;
    expect(signatureSpy.mock.calls.length).toBe(0);
    editor.setSelectedBufferRange(new _atom.Range([0, 0], [0, 1]));
    editor.insertText('(');
    expect(editor.getText()).toBe('(abcdef');
    await sleep(1); // debounce

    expect(signatureSpy.mock.calls.length).toBe(1);
    expect(signatureSpy.calls[0].args).toEqual([editor, new _atom.Point(0, 1)]);
  });
  it('can be dynamically toggled via config', async () => {
    atom.config.set('atom-ide-signature-help.enable', false);
    editor.setText('test');
    await sleep(1); // debounce

    const signatureSpy = testProvider.getSignatureHelp;
    expect(signatureSpy.mock.calls.length).toBe(0);
    editor.insertText('(');
    expect(editor.getText()).toBe('test(');
    await sleep(1); // debounce

    expect(signatureSpy.mock.calls.length).toBe(0);
    atom.config.set('atom-ide-signature-help.enable', true);
    editor.insertText('(');
    expect(editor.getText()).toBe('test((');
    await sleep(1); // debounce

    expect(signatureSpy.mock.calls.length).toBe(1);
  });
});