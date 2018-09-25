"use strict";

function _HackSymbolProvider() {
  const data = require("../lib/HackSymbolProvider");

  _HackSymbolProvider = function () {
    return data;
  };

  return data;
}

function _testUtils() {
  const data = _interopRequireDefault(require("react-dom/test-utils"));

  _testUtils = function () {
    return data;
  };

  return data;
}

var _reactDom = _interopRequireDefault(require("react-dom"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('Result rendering', () => {
  it('should work', () => {
    const mockResult = {
      resultType: 'SYMBOL',
      path: '/some/arbitrary/path',
      name: 'IExampleSymbolInterface',
      icon: 'puzzle',
      hoverText: 'interface',
      column: 1,
      line: 3,
      containerName: 'scope'
    };

    if (!(_HackSymbolProvider().HackSymbolProvider.getComponentForItem != null)) {
      throw new Error("Invariant violation: \"HackSymbolProvider.getComponentForItem != null\"");
    }

    const reactElement = _HackSymbolProvider().HackSymbolProvider.getComponentForItem(mockResult);

    expect(reactElement.props.title).toBe('interface');

    const renderedComponent = _testUtils().default.renderIntoDocument(reactElement);

    const renderedNode = _reactDom.default.findDOMNode(renderedComponent);

    expect( // $FlowFixMe
    renderedNode.querySelectorAll('.omnisearch-symbol-result-filename').length).toBe(1); // $FlowFixMe

    expect(renderedNode.querySelectorAll('.icon-puzzle').length).toBe(1);
  });
});