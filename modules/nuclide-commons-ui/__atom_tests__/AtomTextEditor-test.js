'use strict';

var _promise;

function _load_promise() {
  return _promise = require('../../nuclide-commons/promise');
}

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('../AtomTextEditor');
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _testUtils;

function _load_testUtils() {
  return _testUtils = _interopRequireDefault(require('react-dom/test-utils'));
}

var _path = _interopRequireDefault(require('path'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

describe('nuclide-ui-atom-text-editor', () => {
  describe('when its `path` is set', () => {
    let grammar;

    beforeEach(() => {
      // Path is relative to the root of this package (where "package.json" lives).
      grammar = atom.grammars.loadGrammarSync(_path.default.resolve(__dirname, '../__mocks__/grammars/test1.cson'));
    });

    afterEach(() => {
      if (grammar) {
        atom.grammars.removeGrammarForScopeName(grammar.scopeName);
      }
    });

    it('loads the desired `Grammar`', () => {
      // $FlowIgnore
      const element = (_testUtils || _load_testUtils()).default.renderIntoDocument(_react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, { path: '.test' }));
      expect(element.getModel().getGrammar().scopeName).toEqual('text.test');
    });
  });

  describe('providing a grammar', () => {
    let grammar1;
    let grammar2;

    beforeEach(() => {
      grammar1 = atom.grammars.loadGrammarSync(_path.default.resolve(__dirname, '../__mocks__/grammars/test1.cson'));
      grammar2 = atom.grammars.loadGrammarSync(_path.default.resolve(__dirname, '../__mocks__/grammars/test2.cson'));
    });

    afterEach(() => {
      if (!(grammar1 != null)) {
        throw new Error('Invariant violation: "grammar1 != null"');
      }

      atom.grammars.removeGrammarForScopeName(grammar1.scopeName);

      if (!(grammar2 != null)) {
        throw new Error('Invariant violation: "grammar2 != null"');
      }

      atom.grammars.removeGrammarForScopeName(grammar2.scopeName);
    });

    it('updates the underlying models grammar', () => {
      // $FlowIgnore
      const element = (_testUtils || _load_testUtils()).default.renderIntoDocument(_react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, { path: '.test', grammar: grammar2 }));
      expect(element.getModel().getGrammar().scopeName).toEqual('text.test2');
    });
  });

  describe('when `readOnly`', () => {
    let element;

    describe('is true', () => {
      beforeEach(() => {
        // $FlowIgnore
        element = (_testUtils || _load_testUtils()).default.renderIntoDocument(_react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, { readOnly: true }));
      });

      it('allows copying', () => {
        if (!element) {
          throw new Error('Invariant violation: "element"');
        }

        const model = element.getModel();
        model.setText('fraggle');
        model.selectAll();
        model.copySelectedText();
        expect(atom.clipboard.read()).toEqual('fraggle');
      });

      it('disallows inserting', () => {
        if (!element) {
          throw new Error('Invariant violation: "element"');
        }

        const model = element.getModel();
        model.setText('foobar');
        model.insertNewline();
        expect(model.getText()).toEqual('foobar');
      });

      it('disallows pasting', () => {
        if (!element) {
          throw new Error('Invariant violation: "element"');
        }

        const model = element.getModel();
        atom.clipboard.write('foo bar baz');
        model.pasteText();
        expect(model.getText()).toEqual('');
      });

      it('disallows deleting text', () => {
        if (!element) {
          throw new Error('Invariant violation: "element"');
        }

        const model = element.getModel();
        model.setText('balloon');
        model.selectAll();
        model.delete();
        expect(model.getText()).toEqual('balloon');
      });

      it('disallows backspace', () => {
        if (!element) {
          throw new Error('Invariant violation: "element"');
        }

        const model = element.getModel();
        model.setText('foobar');
        model.moveToEndOfLine();
        model.backspace();
        expect(model.getText()).toEqual('foobar');
      });
    });

    describe('is undefined', () => {
      beforeEach(() => {
        // $FlowIgnore
        element = (_testUtils || _load_testUtils()).default.renderIntoDocument(_react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, null));
      });

      it('allows copying', () => {
        if (!element) {
          throw new Error('Invariant violation: "element"');
        }

        const model = element.getModel();
        model.setText('fraggle');
        model.selectAll();
        model.copySelectedText();
        expect(atom.clipboard.read()).toEqual('fraggle');
      });

      it('allows inserting', () => {
        if (!element) {
          throw new Error('Invariant violation: "element"');
        }

        const model = element.getModel();
        model.setText('foobar');
        model.insertNewline();
        expect(model.getText()).toEqual('foobar\n');
      });

      it('allows pasting', () => {
        if (!element) {
          throw new Error('Invariant violation: "element"');
        }

        const model = element.getModel();
        atom.clipboard.write('foo bar baz');
        model.pasteText();
        expect(model.getText()).toEqual('foo bar baz');
      });

      it('allows deleting text', () => {
        if (!element) {
          throw new Error('Invariant violation: "element"');
        }

        const model = element.getModel();
        model.setText('balloon');
        model.selectAll();
        model.delete();
        expect(model.getText()).toEqual('');
      });

      it('allows backspace', () => {
        if (!element) {
          throw new Error('Invariant violation: "element"');
        }

        const model = element.getModel();
        model.setText('foobar');
        model.moveToEndOfLine();
        model.backspace();
        expect(model.getText()).toEqual('fooba');
      });
    });
  });

  it('does not leak TextEditorComponent', async () => {
    const hostEl = document.createElement('div');
    const component = _reactDom.default.render(_react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, null), hostEl);
    const textEditor = component.getModel();
    const element = textEditor.getElement();
    _reactDom.default.unmountComponentAtNode(hostEl);

    // Cleanup occurs during the next tick.
    await (0, (_promise || _load_promise()).sleep)(0);
    expect(element.component).toBe(null);
  });
});