"use strict";

function _fsPromise() {
  const data = _interopRequireDefault(require("../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _observeGrammarForTextEditors() {
  const data = _interopRequireDefault(require("../observe-grammar-for-text-editors"));

  _observeGrammarForTextEditors = function () {
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
 * 
 * @format
 */
describe('observeGrammarForTextEditors', () => {
  let objcGrammar = null;
  let jsGrammar = null;
  let tempFilename = null;
  beforeEach(async () => {
    _observeGrammarForTextEditors().default.__reset__(); // The grammar registry is cleared automatically after Atom 1.3.0+


    atom.grammars.clear();
    atom.grammars.loadGrammarSync(_nuclideUri().default.join(__dirname, '../__mocks__/grammars/objective-c.cson'));
    objcGrammar = (0, _nullthrows().default)(atom.grammars.grammarForScopeName('source.objc'));
    atom.grammars.loadGrammarSync(_nuclideUri().default.join(__dirname, '../__mocks__/grammars/javascript.cson'));
    jsGrammar = (0, _nullthrows().default)(atom.grammars.grammarForScopeName('source.js'));
    tempFilename = `${await _fsPromise().default.tempfile()}.m`;
  });
  it('calls for existing text editors', async () => {
    const textEditor = await atom.workspace.open(tempFilename);
    const fn = jest.fn();
    const subscription = (0, _observeGrammarForTextEditors().default)(fn);
    expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
    expect(fn.mock.calls.length).toBe(1);
    subscription.dispose();
    textEditor.destroy();
  });
  it('calls for new text editors', async () => {
    const fn = jest.fn();
    const subscription = (0, _observeGrammarForTextEditors().default)(fn);
    const textEditor = await atom.workspace.open(tempFilename);
    expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
    expect(fn.mock.calls.length).toBe(1);
    subscription.dispose();
    textEditor.destroy();
  });
  it('calls when a text editor changes grammars', async () => {
    const fn = jest.fn();
    const subscription = (0, _observeGrammarForTextEditors().default)(fn);
    const textEditor = await atom.workspace.open(tempFilename);
    textEditor.setGrammar(jsGrammar);
    expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
    expect(fn).toHaveBeenCalledWith(textEditor, jsGrammar);
    expect(fn.mock.calls.length).toBe(2);
    subscription.dispose();
    textEditor.destroy();
  });
  it('does not call after the return value is disposed', async () => {
    const fn = jest.fn();
    const subscription = (0, _observeGrammarForTextEditors().default)(fn);
    const textEditor = await atom.workspace.open(tempFilename);
    subscription.dispose();
    textEditor.setGrammar(jsGrammar);
    expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
    expect(fn.mock.calls.length).toBe(1);
    subscription.dispose();
    textEditor.destroy();
  });
  it('calls for other clients after another listener is disposed', async () => {
    const fn = jest.fn();
    const subscription = (0, _observeGrammarForTextEditors().default)(fn);
    const fn2 = jest.fn();
    const subscription2 = (0, _observeGrammarForTextEditors().default)(fn2);
    const textEditor = await atom.workspace.open(tempFilename);
    subscription.dispose();
    textEditor.setGrammar(jsGrammar);
    expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
    expect(fn.mock.calls.length).toBe(1);
    expect(fn2).toHaveBeenCalledWith(textEditor, objcGrammar);
    expect(fn2).toHaveBeenCalledWith(textEditor, jsGrammar);
    expect(fn2.mock.calls.length).toBe(2);
    subscription2.dispose();
    textEditor.destroy();
  });
});