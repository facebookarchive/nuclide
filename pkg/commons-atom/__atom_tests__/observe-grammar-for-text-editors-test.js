'use strict';

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _observeGrammarForTextEditors;

function _load_observeGrammarForTextEditors() {
  return _observeGrammarForTextEditors = _interopRequireDefault(require('../observe-grammar-for-text-editors'));
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
 */

describe('observeGrammarForTextEditors', () => {
  let objcGrammar = null;
  let jsGrammar = null;
  let tempFilename = null;

  beforeEach(async () => {
    (_observeGrammarForTextEditors || _load_observeGrammarForTextEditors()).default.__reset__();
    // The grammar registry is cleared automatically after Atom 1.3.0+
    atom.grammars.clear();
    atom.grammars.loadGrammarSync((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/grammars/objective-c.cson'));
    objcGrammar = (0, (_nullthrows || _load_nullthrows()).default)(atom.grammars.grammarForScopeName('source.objc'));
    atom.grammars.loadGrammarSync((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/grammars/javascript.cson'));
    jsGrammar = (0, (_nullthrows || _load_nullthrows()).default)(atom.grammars.grammarForScopeName('source.js'));
    await (async () => {
      tempFilename = `${await (_fsPromise || _load_fsPromise()).default.tempfile()}.m`;
    })();
  });

  it('calls for existing text editors', async () => {
    await (async () => {
      const textEditor = await atom.workspace.open(tempFilename);

      const fn = jest.fn();
      const subscription = (0, (_observeGrammarForTextEditors || _load_observeGrammarForTextEditors()).default)(fn);
      expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn.mock.calls.length).toBe(1);

      subscription.dispose();
      textEditor.destroy();
    })();
  });

  it('calls for new text editors', async () => {
    await (async () => {
      const fn = jest.fn();
      const subscription = (0, (_observeGrammarForTextEditors || _load_observeGrammarForTextEditors()).default)(fn);
      const textEditor = await atom.workspace.open(tempFilename);

      expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn.mock.calls.length).toBe(1);

      subscription.dispose();
      textEditor.destroy();
    })();
  });

  it('calls when a text editor changes grammars', async () => {
    await (async () => {
      const fn = jest.fn();
      const subscription = (0, (_observeGrammarForTextEditors || _load_observeGrammarForTextEditors()).default)(fn);
      const textEditor = await atom.workspace.open(tempFilename);
      textEditor.setGrammar(jsGrammar);

      expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn).toHaveBeenCalledWith(textEditor, jsGrammar);
      expect(fn.mock.calls.length).toBe(2);

      subscription.dispose();
      textEditor.destroy();
    })();
  });

  it('does not call after the return value is disposed', async () => {
    await (async () => {
      const fn = jest.fn();
      const subscription = (0, (_observeGrammarForTextEditors || _load_observeGrammarForTextEditors()).default)(fn);
      const textEditor = await atom.workspace.open(tempFilename);

      subscription.dispose();
      textEditor.setGrammar(jsGrammar);

      expect(fn).toHaveBeenCalledWith(textEditor, objcGrammar);
      expect(fn.mock.calls.length).toBe(1);

      subscription.dispose();
      textEditor.destroy();
    })();
  });

  it('calls for other clients after another listener is disposed', async () => {
    await (async () => {
      const fn = jest.fn();
      const subscription = (0, (_observeGrammarForTextEditors || _load_observeGrammarForTextEditors()).default)(fn);
      const fn2 = jest.fn();
      const subscription2 = (0, (_observeGrammarForTextEditors || _load_observeGrammarForTextEditors()).default)(fn2);
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
    })();
  });
});