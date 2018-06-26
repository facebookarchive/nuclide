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

var _observeLanguageTextEditors;

function _load_observeLanguageTextEditors() {
  return _observeLanguageTextEditors = _interopRequireDefault(require('../observe-language-text-editors'));
}

var _path = _interopRequireDefault(require('path'));

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

const MOCK_DIR = _path.default.resolve(__dirname, '../__mocks__');

describe('observeLanguageTextEditors', () => {
  let objcGrammar = null;
  let javaGrammar = null;
  let jsGrammar = null;
  let nullGrammar = null;
  let grammarScopes = null;
  let tempFilenameJS = null;
  let tempFilenameObjC = null;

  beforeEach(async () => {
    (_observeGrammarForTextEditors || _load_observeGrammarForTextEditors()).default.__reset__();
    atom.grammars.loadGrammarSync((_nuclideUri || _load_nuclideUri()).default.join(MOCK_DIR, 'grammars/objective-c.cson'));
    objcGrammar = (0, (_nullthrows || _load_nullthrows()).default)(atom.grammars.grammarForScopeName('source.objc'));

    atom.grammars.loadGrammarSync((_nuclideUri || _load_nuclideUri()).default.join(MOCK_DIR, 'grammars/java.cson'));
    javaGrammar = (0, (_nullthrows || _load_nullthrows()).default)(atom.grammars.grammarForScopeName('source.java'));

    atom.grammars.loadGrammarSync((_nuclideUri || _load_nuclideUri()).default.join(MOCK_DIR, 'grammars/javascript.cson'));
    jsGrammar = (0, (_nullthrows || _load_nullthrows()).default)(atom.grammars.grammarForScopeName('source.js'));
    nullGrammar = (0, (_nullthrows || _load_nullthrows()).default)(atom.grammars.grammarForScopeName('text.plain.null-grammar'));

    grammarScopes = [objcGrammar.scopeName, javaGrammar.scopeName];

    await (async () => {
      tempFilenameJS = `${await (_fsPromise || _load_fsPromise()).default.tempfile()}.js`;
      tempFilenameObjC = `${await (_fsPromise || _load_fsPromise()).default.tempfile()}.m`;
    })();
  });

  describe('without cleanup function', () => {
    it('calls for existing text editors that match the grammars', async () => {
      await (async () => {
        const textEditor = await atom.workspace.open(tempFilenameObjC);

        const fn = jest.fn();
        const subscription = (0, (_observeLanguageTextEditors || _load_observeLanguageTextEditors()).default)(grammarScopes, fn);

        expect(fn).toHaveBeenCalledWith(textEditor);
        expect(fn.mock.calls.length).toBe(1);

        subscription.dispose();
        textEditor.destroy();
      })();
    });

    it('calls for new text editors that already match the grammars', async () => {
      await (async () => {
        const fn = jest.fn();
        const subscription = (0, (_observeLanguageTextEditors || _load_observeLanguageTextEditors()).default)(grammarScopes, fn);

        const textEditor = await atom.workspace.open(tempFilenameObjC);

        expect(fn).toHaveBeenCalledWith(textEditor);
        expect(fn.mock.calls.length).toBe(1);

        subscription.dispose();
        textEditor.destroy();
      })();
    });

    it('calls for new text editors that change to match the grammars', async () => {
      await (async () => {
        const fn = jest.fn();
        const subscription = (0, (_observeLanguageTextEditors || _load_observeLanguageTextEditors()).default)(grammarScopes, fn);

        const textEditor = await atom.workspace.open();
        textEditor.setGrammar(objcGrammar);

        expect(fn).toHaveBeenCalledWith(textEditor);
        expect(fn.mock.calls.length).toBe(1);

        subscription.dispose();
        textEditor.destroy();
      })();
    });

    it("does not call for new text editors that change and still don't match the grammars", async () => {
      await (async () => {
        const fn = jest.fn();
        const subscription = (0, (_observeLanguageTextEditors || _load_observeLanguageTextEditors()).default)(grammarScopes, fn);

        const textEditor = await atom.workspace.open();
        textEditor.setGrammar(jsGrammar);

        expect(fn.mock.calls.length).toBe(0);

        subscription.dispose();
        textEditor.destroy();
      })();
    });

    it('does not call for text editors whose matching grammar changes but still matches', async () => {
      await (async () => {
        const fn = jest.fn();
        const subscription = (0, (_observeLanguageTextEditors || _load_observeLanguageTextEditors()).default)(grammarScopes, fn);

        const textEditor = await atom.workspace.open(tempFilenameObjC);
        textEditor.setGrammar(javaGrammar);

        expect(fn).toHaveBeenCalledWith(textEditor);
        expect(fn.mock.calls.length).toBe(1);

        subscription.dispose();
        textEditor.destroy();
      })();
    });

    it('stops listening to grammar changes on text editors that are destroyed', async () => {
      await (async () => {
        const fn = jest.fn();
        const subscription = (0, (_observeLanguageTextEditors || _load_observeLanguageTextEditors()).default)(grammarScopes, fn);

        const textEditor = await atom.workspace.open(tempFilenameObjC);
        textEditor.destroy();

        subscription.dispose();
      })();
    });
  });

  describe('with cleanup function', () => {
    it('does not call for existing text editors that do not match the grammars', async () => {
      await (async () => {
        const textEditor = await atom.workspace.open();

        const fn = jest.fn();
        const cleanupFn = jest.fn();
        const subscription = (0, (_observeLanguageTextEditors || _load_observeLanguageTextEditors()).default)(grammarScopes, fn, cleanupFn);

        expect(cleanupFn.mock.calls.length).toBe(0);

        subscription.dispose();
        textEditor.destroy();
      })();
    });

    it('does not call for new text editors that never matched the grammars', async () => {
      await (async () => {
        const fn = jest.fn();
        const cleanupFn = jest.fn();
        const subscription = (0, (_observeLanguageTextEditors || _load_observeLanguageTextEditors()).default)(grammarScopes, fn, cleanupFn);

        const textEditor = await atom.workspace.open(tempFilenameJS);
        textEditor.setGrammar(nullGrammar);

        expect(cleanupFn.mock.calls.length).toBe(0);

        subscription.dispose();
        textEditor.destroy();
      })();
    });

    it('calls for new text editors that stop matching the grammars', async () => {
      await (async () => {
        const fn = jest.fn();
        const cleanupFn = jest.fn();
        const subscription = (0, (_observeLanguageTextEditors || _load_observeLanguageTextEditors()).default)(grammarScopes, fn, cleanupFn);

        const textEditor = await atom.workspace.open(tempFilenameObjC);
        textEditor.setGrammar(nullGrammar);

        expect(cleanupFn).toHaveBeenCalledWith(textEditor);
        expect(cleanupFn.mock.calls.length).toBe(1);

        subscription.dispose();
        textEditor.destroy();
      })();
    });

    it('does not call when new text editors that do not match the grammars are destroyed', async () => {
      await (async () => {
        const fn = jest.fn();
        const cleanupFn = jest.fn();
        const subscription = (0, (_observeLanguageTextEditors || _load_observeLanguageTextEditors()).default)(grammarScopes, fn, cleanupFn);

        const textEditor = await atom.workspace.open(tempFilenameJS);
        textEditor.destroy();

        expect(cleanupFn.mock.calls.length).toBe(0);

        subscription.dispose();
      })();
    });

    it('calls when new text editors matching the grammars are destroyed', async () => {
      await (async () => {
        const fn = jest.fn();
        const cleanupFn = jest.fn();
        const subscription = (0, (_observeLanguageTextEditors || _load_observeLanguageTextEditors()).default)(grammarScopes, fn, cleanupFn);

        const textEditor = await atom.workspace.open(tempFilenameObjC);
        textEditor.destroy();

        expect(cleanupFn).toHaveBeenCalledWith(textEditor);
        expect(cleanupFn.mock.calls.length).toBe(1);

        subscription.dispose();
      })();
    });
  });
});