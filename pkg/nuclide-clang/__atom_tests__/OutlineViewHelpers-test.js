'use strict';

var _atom = require('atom');

var _nuclideClangRpc;

function _load_nuclideClangRpc() {
  return _nuclideClangRpc = require('../../nuclide-clang-rpc');
}

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('../../../modules/nuclide-commons/tokenized-text');
}

var _OutlineViewHelpers;

function _load_OutlineViewHelpers() {
  return _OutlineViewHelpers = require('../lib/OutlineViewHelpers');
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
 */

describe('outlineFromClangOutline', () => {
  it('works for a function', () => {
    expect((0, (_OutlineViewHelpers || _load_OutlineViewHelpers()).outlineFromClangOutline)([{
      name: 'testFunction',
      extent: new _atom.Range([0, 1], [2, 3]),
      cursor_kind: (_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.FUNCTION_DECL,
      params: ['p1', 'p2'],
      tparams: ['tp1', 'tp2']
    }])).toEqual([{
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).method)('testFunction'), (0, (_tokenizedText || _load_tokenizedText()).plain)('<'), (0, (_tokenizedText || _load_tokenizedText()).plain)('tp1'), (0, (_tokenizedText || _load_tokenizedText()).plain)(', '), (0, (_tokenizedText || _load_tokenizedText()).plain)('tp2'), (0, (_tokenizedText || _load_tokenizedText()).plain)('>'), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), (0, (_tokenizedText || _load_tokenizedText()).param)('p1'), (0, (_tokenizedText || _load_tokenizedText()).plain)(', '), (0, (_tokenizedText || _load_tokenizedText()).param)('p2'), (0, (_tokenizedText || _load_tokenizedText()).plain)(')')],
      representativeName: 'testFunction',
      startPosition: new _atom.Point(0, 1),
      endPosition: new _atom.Point(2, 3),
      children: []
    }]);
  });

  it('works for a class with children', () => {
    expect((0, (_OutlineViewHelpers || _load_OutlineViewHelpers()).outlineFromClangOutline)([{
      name: 'TestClass',
      extent: new _atom.Range([0, 1], [2, 3]),
      cursor_kind: (_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.CLASS_DECL,
      children: [{
        name: 'testMethod',
        extent: new _atom.Range([1, 1], [1, 2]),
        cursor_kind: (_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.CXX_METHOD,
        params: []
      }]
    }])).toEqual([{
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).keyword)('class'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).className)('TestClass')],
      representativeName: 'TestClass',
      startPosition: new _atom.Point(0, 1),
      endPosition: new _atom.Point(2, 3),
      children: [{
        tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).method)('testMethod'), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), (0, (_tokenizedText || _load_tokenizedText()).plain)(')')],
        representativeName: 'testMethod',
        startPosition: new _atom.Point(1, 1),
        endPosition: new _atom.Point(1, 2),
        children: []
      }]
    }]);
  });

  it('works for a global variable', () => {
    expect((0, (_OutlineViewHelpers || _load_OutlineViewHelpers()).outlineFromClangOutline)([{
      name: 'testVariable',
      extent: new _atom.Range([0, 1], [2, 3]),
      cursor_kind: (_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.VAR_DECL,
      cursor_type: 'std::string'
    }])).toEqual([{
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).plain)('std::string'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).className)('testVariable')],
      representativeName: 'testVariable',
      startPosition: new _atom.Point(0, 1),
      endPosition: new _atom.Point(2, 3),
      children: []
    }]);
  });

  it('collapses very long types', () => {
    expect((0, (_OutlineViewHelpers || _load_OutlineViewHelpers()).outlineFromClangOutline)([{
      name: 'testVariable',
      extent: new _atom.Range([0, 1], [2, 3]),
      cursor_kind: (_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.VAR_DECL,
      cursor_type: 'std::vector<std::vector<std::vector<std::vector<int>>>>'
    }])).toEqual([{
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).plain)('std::vector<'), (0, (_tokenizedText || _load_tokenizedText()).string)('...'), (0, (_tokenizedText || _load_tokenizedText()).plain)('>'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).className)('testVariable')],
      representativeName: 'testVariable',
      startPosition: new _atom.Point(0, 1),
      endPosition: new _atom.Point(2, 3),
      children: []
    }]);
  });
});