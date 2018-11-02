"use strict";

function _promise() {
  const data = require("../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _AtomTextEditor() {
  const data = require("../AtomTextEditor");

  _AtomTextEditor = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _testUtils() {
  const data = _interopRequireDefault(require("react-dom/test-utils"));

  _testUtils = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

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
 *  strict-local
 * @format
 * @emails oncall+nuclide
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
      const element = _testUtils().default.renderIntoDocument(React.createElement(_AtomTextEditor().AtomTextEditor, {
        path: ".test"
      }));

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
        throw new Error("Invariant violation: \"grammar1 != null\"");
      }

      atom.grammars.removeGrammarForScopeName(grammar1.scopeName);

      if (!(grammar2 != null)) {
        throw new Error("Invariant violation: \"grammar2 != null\"");
      }

      atom.grammars.removeGrammarForScopeName(grammar2.scopeName);
    });
    it('updates the underlying models grammar', () => {
      // $FlowIgnore
      const element = _testUtils().default.renderIntoDocument(React.createElement(_AtomTextEditor().AtomTextEditor, {
        path: ".test",
        grammar: grammar2
      }));

      expect(element.getModel().getGrammar().scopeName).toEqual('text.test2');
    });
  });
  it('does not leak TextEditorComponent', async () => {
    const hostEl = document.createElement('div');

    const component = _reactDom.default.render(React.createElement(_AtomTextEditor().AtomTextEditor, null), hostEl);

    const textEditor = component.getModel();
    const element = textEditor.getElement();

    _reactDom.default.unmountComponentAtNode(hostEl); // Cleanup occurs during the next tick.


    await (0, _promise().sleep)(0);
    expect(element.component).toBe(null);
  });
});