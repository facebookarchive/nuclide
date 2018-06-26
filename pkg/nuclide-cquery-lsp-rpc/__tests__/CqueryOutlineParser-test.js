'use strict';

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('../../../modules/nuclide-commons/tokenized-text');
}

var _CqueryOutlineParser;

function _load_CqueryOutlineParser() {
  return _CqueryOutlineParser = require('../lib/outline/CqueryOutlineParser');
}

var _utils;

function _load_utils() {
  return _utils = require('../__mocks__/utils');
}

describe('CqueryOutlineParser', () => {
  it('parses correctly obj-c functions with _nonNull and __strong', () => {
    const containerName = 'Ret * _Nonnull (NSUInteger * _Nonnull __strong) funct';
    const name = 'funct';
    const tokenizedText = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('Ret'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).plain)('*'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).method)('funct'), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), (0, (_tokenizedText || _load_tokenizedText()).keyword)('NSUInteger'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).plain)('*'), (0, (_tokenizedText || _load_tokenizedText()).plain)(')')];

    expect((0, (_utils || _load_utils()).simplifyNodeForTesting)((0, (_CqueryOutlineParser || _load_CqueryOutlineParser()).parseOutlineTree)([(0, (_utils || _load_utils()).createFunction)(name, containerName)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).type)('')],
      children: [{
        kind: 'method',
        tokenizedText,
        children: []
      }]
    });
  });

  it('removes a symbol with a range overlapping a variable', () => {
    // this happens for cases in obj-c like this one
    //   @property (atomic, copy) NSString* threadKey;
    // where the property defines several symbols, e.g. _threadKey, threadKey,
    // setThreadKey, etc. in an overlapping range with the initial symbol

    expect((0, (_utils || _load_utils()).simplifyNodeForTesting)((0, (_CqueryOutlineParser || _load_CqueryOutlineParser()).parseOutlineTree)([(0, (_utils || _load_utils()).createVariable)('_tt', '_tt', 1, 10, 30), (0, (_utils || _load_utils()).createFunction)('fun', 'int fun()', 1, 1, 15, 45), (0, (_utils || _load_utils()).createFunction)('fun2', 'int fun2()', 2, 2, 10, 30), (0, (_utils || _load_utils()).createFunction)('fun3', 'int fun3()', 2, 2, 5, 25)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).type)('')],
      children: [{
        kind: 'constant',
        tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).param)('_tt')],
        children: []
      }, {
        kind: 'method',
        tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).keyword)('int'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).method)('fun2'), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), (0, (_tokenizedText || _load_tokenizedText()).plain)(')')],
        children: []
      }]
    });
  });

  it('removes obj-c method parameters when no parameter nodes are included', () => {
    // we do this because cquery doesn't report type information for these
    // parameters (T25738496)

    const methodContainerName = 'amethod:param:';
    const methodName = 'amethod';
    const methodTokenizedText = [(0, (_tokenizedText || _load_tokenizedText()).method)('amethod')];

    expect((0, (_utils || _load_utils()).simplifyNodeForTesting)((0, (_CqueryOutlineParser || _load_CqueryOutlineParser()).parseOutlineTree)([(0, (_utils || _load_utils()).createFunction)(methodName, methodContainerName)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).type)('')],
      children: [{
        kind: 'method',
        tokenizedText: methodTokenizedText,
        children: []
      }]
    });
  });

  it('parses an obj-c class method along with its parameters', () => {
    // C-query is bugged and doesn't report the first parameter in the method
    // container name
    const methodContainerName = 'AClass::amethod:param2:';
    const paramContainerName1 = 'NSString *param1';
    const paramContainerName2 = 'NSObject *param2';

    const methodName = 'amethod:param2:';
    const paramName1 = 'param1';
    const paramName2 = 'param2';

    const paramTokenizedText1 = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('NSString'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).plain)('*'), (0, (_tokenizedText || _load_tokenizedText()).param)('param1')];
    const paramTokenizedText2 = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('NSObject'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).plain)('*'), (0, (_tokenizedText || _load_tokenizedText()).param)('param2')];
    const methodTokenizedText = [(0, (_tokenizedText || _load_tokenizedText()).method)('amethod'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), ...paramTokenizedText1, (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), ...paramTokenizedText2];

    expect((0, (_utils || _load_utils()).simplifyNodeForTesting)((0, (_CqueryOutlineParser || _load_CqueryOutlineParser()).parseOutlineTree)([(0, (_utils || _load_utils()).createFunction)(methodName, methodContainerName, 1, 10), (0, (_utils || _load_utils()).createVariable)(paramName1, paramContainerName1, 1), (0, (_utils || _load_utils()).createVariable)(paramName2, paramContainerName2, 1)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).type)('')],
      children: [{
        kind: 'module',
        tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).type)('AClass')],
        children: [{
          kind: 'method',
          tokenizedText: methodTokenizedText,
          children: []
        }]
      }]
    });
  });

  it('parses a global C++ function and removes its local variables', () => {
    const functionContainerName = 'int afunction(std::vector<int> x, xtd::std::vector<int> y)';
    const paramContainerName1 = 'std::vector<int> x';
    const paramContainerName2 = 'xtd::std::vector<std::string> y';
    const localVariableContainerName = 'std::string z';

    const functionName = 'afunction';
    const paramName1 = 'x';
    const paramName2 = 'y';
    const localVariableName = 'z';

    const paramTokenizedText1 = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('std'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('vector'), (0, (_tokenizedText || _load_tokenizedText()).plain)('<'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('int'), (0, (_tokenizedText || _load_tokenizedText()).plain)('>'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).keyword)('x')];

    const paramTokenizedText2 = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('xtd'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('std'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('vector'), (0, (_tokenizedText || _load_tokenizedText()).plain)('<'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('int'), (0, (_tokenizedText || _load_tokenizedText()).plain)('>'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).keyword)('y')];

    const functionTokenizedText = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('int'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).method)('afunction'), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), ...paramTokenizedText1, (0, (_tokenizedText || _load_tokenizedText()).plain)(','), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), ...paramTokenizedText2, (0, (_tokenizedText || _load_tokenizedText()).plain)(')')];

    expect((0, (_utils || _load_utils()).simplifyNodeForTesting)((0, (_CqueryOutlineParser || _load_CqueryOutlineParser()).parseOutlineTree)([(0, (_utils || _load_utils()).createFunction)(functionName, functionContainerName, 1, 10), (0, (_utils || _load_utils()).createVariable)(paramName1, paramContainerName1, 1), (0, (_utils || _load_utils()).createVariable)(paramName2, paramContainerName2, 1), (0, (_utils || _load_utils()).createVariable)(localVariableName, localVariableContainerName, 2)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).type)('')],
      children: [{
        kind: 'method',
        tokenizedText: functionTokenizedText,
        children: []
      }]
    });
  });

  it('parses a C++ function inside a namespace and shows its params if the corresponding params nodes are included, also removes its local variables', () => {
    const functionContainerName = 'pp::int aNamespace::afunction(std::vector<int> x, xtd::std::vector<int> y)';
    const paramContainerName1 = 'std::vector<int> x';
    const paramContainerName2 = 'xtd::std::vector<std::string> y';
    const localVariableContainerName = 'std::string z';

    const functionName = 'afunction';
    const paramName1 = 'x';
    const paramName2 = 'y';
    const localVariableName = 'z';

    const paramTokenizedText1 = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('std'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('vector'), (0, (_tokenizedText || _load_tokenizedText()).plain)('<'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('int'), (0, (_tokenizedText || _load_tokenizedText()).plain)('>'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).keyword)('x')];

    const paramTokenizedText2 = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('xtd'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('std'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('vector'), (0, (_tokenizedText || _load_tokenizedText()).plain)('<'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('int'), (0, (_tokenizedText || _load_tokenizedText()).plain)('>'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).keyword)('y')];

    const functionTokenizedText = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('pp'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('int'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).method)('afunction'), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), ...paramTokenizedText1, (0, (_tokenizedText || _load_tokenizedText()).plain)(','), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), ...paramTokenizedText2, (0, (_tokenizedText || _load_tokenizedText()).plain)(')')];

    expect((0, (_utils || _load_utils()).simplifyNodeForTesting)((0, (_CqueryOutlineParser || _load_CqueryOutlineParser()).parseOutlineTree)([(0, (_utils || _load_utils()).createFunction)(functionName, functionContainerName, 1, 10), (0, (_utils || _load_utils()).createVariable)(paramName1, paramContainerName1, 1), (0, (_utils || _load_utils()).createVariable)(paramName2, paramContainerName2, 1), (0, (_utils || _load_utils()).createVariable)(localVariableName, localVariableContainerName, 2)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).type)('')],
      children: [{
        kind: 'module',
        tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).type)('aNamespace')],
        children: [{
          kind: 'method',
          tokenizedText: functionTokenizedText,
          children: []
        }]
      }]
    });
  });

  it('parses a C++ class inside an anonymous namespace inside a named namespace with a method and a member', () => {
    const classContainerName = '(anon)::named::DisClass';
    const memberContainerName = 'xtd::std::vector<std::string> (anon)::named::DisClass::member';
    const methodContainerName = 'std::vector<int> (anon)::named::DisClass::method(int param) const';
    const paramContainerName = 'int param';

    const className = 'DisClass';
    const memberName = 'member';
    const methodName = 'method';
    const paramName = 'param';

    const paramTokenizedText = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('int'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).keyword)('param')];
    const methodTokenizedText = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('std'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('vector'), (0, (_tokenizedText || _load_tokenizedText()).plain)('<'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('int'), (0, (_tokenizedText || _load_tokenizedText()).plain)('>'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).method)('method'), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), ...paramTokenizedText, (0, (_tokenizedText || _load_tokenizedText()).plain)(')'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).keyword)('const')];
    const memberTokenizedText = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('xtd'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('std'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('vector'), (0, (_tokenizedText || _load_tokenizedText()).plain)('<'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('std'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).plain)(':'), (0, (_tokenizedText || _load_tokenizedText()).keyword)('string'), (0, (_tokenizedText || _load_tokenizedText()).plain)('>'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).param)('member')];
    const classTokenizedText = [(0, (_tokenizedText || _load_tokenizedText()).className)('DisClass')];

    expect((0, (_utils || _load_utils()).simplifyNodeForTesting)((0, (_CqueryOutlineParser || _load_CqueryOutlineParser()).parseOutlineTree)([(0, (_utils || _load_utils()).createClass)(className, classContainerName, 1, 10), (0, (_utils || _load_utils()).createFunction)(methodName, methodContainerName, 3, 5), (0, (_utils || _load_utils()).createVariable)(paramName, paramContainerName, 3), (0, (_utils || _load_utils()).createVariable)(memberName, memberContainerName, 6)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).type)('')],
      children: [{
        kind: 'module',
        tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).type)('namespace')],
        children: [{
          kind: 'module',
          tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).type)('named')],
          children: [{
            kind: 'class',
            tokenizedText: classTokenizedText,
            children: [{
              kind: 'method',
              tokenizedText: methodTokenizedText,
              children: []
            }, {
              kind: 'variable',
              tokenizedText: memberTokenizedText,
              children: []
            }]
          }]
        }]
      }]
    });
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */