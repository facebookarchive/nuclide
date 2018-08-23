"use strict";

var _atom = require("atom");

function _nuclideClangRpc() {
  const data = require("../../nuclide-clang-rpc");

  _nuclideClangRpc = function () {
    return data;
  };

  return data;
}

function _tokenizedText() {
  const data = require("../../../modules/nuclide-commons/tokenized-text");

  _tokenizedText = function () {
    return data;
  };

  return data;
}

function _OutlineViewHelpers() {
  const data = require("../lib/OutlineViewHelpers");

  _OutlineViewHelpers = function () {
    return data;
  };

  return data;
}

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
describe('outlineFromClangOutline', () => {
  it('works for a function', () => {
    expect((0, _OutlineViewHelpers().outlineFromClangOutline)([{
      name: 'testFunction',
      extent: new _atom.Range([0, 1], [2, 3]),
      cursor_kind: _nuclideClangRpc().ClangCursorTypes.FUNCTION_DECL,
      params: ['p1', 'p2'],
      tparams: ['tp1', 'tp2']
    }])).toEqual([{
      tokenizedText: [(0, _tokenizedText().method)('testFunction'), (0, _tokenizedText().plain)('<'), (0, _tokenizedText().plain)('tp1'), (0, _tokenizedText().plain)(', '), (0, _tokenizedText().plain)('tp2'), (0, _tokenizedText().plain)('>'), (0, _tokenizedText().plain)('('), (0, _tokenizedText().param)('p1'), (0, _tokenizedText().plain)(', '), (0, _tokenizedText().param)('p2'), (0, _tokenizedText().plain)(')')],
      representativeName: 'testFunction',
      startPosition: new _atom.Point(0, 1),
      endPosition: new _atom.Point(2, 3),
      children: []
    }]);
  });
  it('works for a class with children', () => {
    expect((0, _OutlineViewHelpers().outlineFromClangOutline)([{
      name: 'TestClass',
      extent: new _atom.Range([0, 1], [2, 3]),
      cursor_kind: _nuclideClangRpc().ClangCursorTypes.CLASS_DECL,
      children: [{
        name: 'testMethod',
        extent: new _atom.Range([1, 1], [1, 2]),
        cursor_kind: _nuclideClangRpc().ClangCursorTypes.CXX_METHOD,
        params: []
      }]
    }])).toEqual([{
      tokenizedText: [(0, _tokenizedText().keyword)('class'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().className)('TestClass')],
      representativeName: 'TestClass',
      startPosition: new _atom.Point(0, 1),
      endPosition: new _atom.Point(2, 3),
      children: [{
        tokenizedText: [(0, _tokenizedText().method)('testMethod'), (0, _tokenizedText().plain)('('), (0, _tokenizedText().plain)(')')],
        representativeName: 'testMethod',
        startPosition: new _atom.Point(1, 1),
        endPosition: new _atom.Point(1, 2),
        children: []
      }]
    }]);
  });
  it('works for a global variable', () => {
    expect((0, _OutlineViewHelpers().outlineFromClangOutline)([{
      name: 'testVariable',
      extent: new _atom.Range([0, 1], [2, 3]),
      cursor_kind: _nuclideClangRpc().ClangCursorTypes.VAR_DECL,
      cursor_type: 'std::string'
    }])).toEqual([{
      tokenizedText: [(0, _tokenizedText().plain)('std::string'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().className)('testVariable')],
      representativeName: 'testVariable',
      startPosition: new _atom.Point(0, 1),
      endPosition: new _atom.Point(2, 3),
      children: []
    }]);
  });
  it('collapses very long types', () => {
    expect((0, _OutlineViewHelpers().outlineFromClangOutline)([{
      name: 'testVariable',
      extent: new _atom.Range([0, 1], [2, 3]),
      cursor_kind: _nuclideClangRpc().ClangCursorTypes.VAR_DECL,
      cursor_type: 'std::vector<std::vector<std::vector<std::vector<int>>>>'
    }])).toEqual([{
      tokenizedText: [(0, _tokenizedText().plain)('std::vector<'), (0, _tokenizedText().string)('...'), (0, _tokenizedText().plain)('>'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().className)('testVariable')],
      representativeName: 'testVariable',
      startPosition: new _atom.Point(0, 1),
      endPosition: new _atom.Point(2, 3),
      children: []
    }]);
  });
});