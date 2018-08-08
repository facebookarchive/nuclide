"use strict";

function _tokenizedText() {
  const data = require("../../../modules/nuclide-commons/tokenized-text");

  _tokenizedText = function () {
    return data;
  };

  return data;
}

function _CqueryOutlineParser() {
  const data = require("../lib/outline/CqueryOutlineParser");

  _CqueryOutlineParser = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("../__mocks__/utils");

  _utils = function () {
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
describe('CqueryOutlineParser', () => {
  it('parses correctly obj-c functions with _nonNull and __strong', () => {
    const containerName = 'Ret * _Nonnull (NSUInteger * _Nonnull __strong) funct';
    const name = 'funct';
    const tokenizedText = [(0, _tokenizedText().keyword)('Ret'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().plain)('*'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().method)('funct'), (0, _tokenizedText().plain)('('), (0, _tokenizedText().keyword)('NSUInteger'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().plain)('*'), (0, _tokenizedText().plain)(')')];
    expect((0, _utils().simplifyNodeForTesting)((0, _CqueryOutlineParser().parseOutlineTree)([(0, _utils().createFunction)(name, containerName)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, _tokenizedText().type)('')],
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
    expect((0, _utils().simplifyNodeForTesting)((0, _CqueryOutlineParser().parseOutlineTree)([(0, _utils().createVariable)('_tt', '_tt', 1, 10, 30), (0, _utils().createFunction)('fun', 'int fun()', 1, 1, 15, 45), (0, _utils().createFunction)('fun2', 'int fun2()', 2, 2, 10, 30), (0, _utils().createFunction)('fun3', 'int fun3()', 2, 2, 5, 25)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, _tokenizedText().type)('')],
      children: [{
        kind: 'constant',
        tokenizedText: [(0, _tokenizedText().param)('_tt')],
        children: []
      }, {
        kind: 'method',
        tokenizedText: [(0, _tokenizedText().keyword)('int'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().method)('fun2'), (0, _tokenizedText().plain)('('), (0, _tokenizedText().plain)(')')],
        children: []
      }]
    });
  });
  it('removes obj-c method parameters when no parameter nodes are included', () => {
    // we do this because cquery doesn't report type information for these
    // parameters (T25738496)
    const methodContainerName = 'amethod:param:';
    const methodName = 'amethod';
    const methodTokenizedText = [(0, _tokenizedText().method)('amethod')];
    expect((0, _utils().simplifyNodeForTesting)((0, _CqueryOutlineParser().parseOutlineTree)([(0, _utils().createFunction)(methodName, methodContainerName)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, _tokenizedText().type)('')],
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
    const paramTokenizedText1 = [(0, _tokenizedText().keyword)('NSString'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().plain)('*'), (0, _tokenizedText().param)('param1')];
    const paramTokenizedText2 = [(0, _tokenizedText().keyword)('NSObject'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().plain)('*'), (0, _tokenizedText().param)('param2')];
    const methodTokenizedText = [(0, _tokenizedText().method)('amethod'), (0, _tokenizedText().plain)(':'), ...paramTokenizedText1, (0, _tokenizedText().plain)(':'), ...paramTokenizedText2];
    expect((0, _utils().simplifyNodeForTesting)((0, _CqueryOutlineParser().parseOutlineTree)([(0, _utils().createFunction)(methodName, methodContainerName, 1, 10), (0, _utils().createVariable)(paramName1, paramContainerName1, 1), (0, _utils().createVariable)(paramName2, paramContainerName2, 1)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, _tokenizedText().type)('')],
      children: [{
        kind: 'module',
        tokenizedText: [(0, _tokenizedText().type)('AClass')],
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
    const paramTokenizedText1 = [(0, _tokenizedText().keyword)('std'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().keyword)('vector'), (0, _tokenizedText().plain)('<'), (0, _tokenizedText().keyword)('int'), (0, _tokenizedText().plain)('>'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().keyword)('x')];
    const paramTokenizedText2 = [(0, _tokenizedText().keyword)('xtd'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().keyword)('std'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().keyword)('vector'), (0, _tokenizedText().plain)('<'), (0, _tokenizedText().keyword)('int'), (0, _tokenizedText().plain)('>'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().keyword)('y')];
    const functionTokenizedText = [(0, _tokenizedText().keyword)('int'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().method)('afunction'), (0, _tokenizedText().plain)('('), ...paramTokenizedText1, (0, _tokenizedText().plain)(','), (0, _tokenizedText().whitespace)(' '), ...paramTokenizedText2, (0, _tokenizedText().plain)(')')];
    expect((0, _utils().simplifyNodeForTesting)((0, _CqueryOutlineParser().parseOutlineTree)([(0, _utils().createFunction)(functionName, functionContainerName, 1, 10), (0, _utils().createVariable)(paramName1, paramContainerName1, 1), (0, _utils().createVariable)(paramName2, paramContainerName2, 1), (0, _utils().createVariable)(localVariableName, localVariableContainerName, 2)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, _tokenizedText().type)('')],
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
    const paramTokenizedText1 = [(0, _tokenizedText().keyword)('std'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().keyword)('vector'), (0, _tokenizedText().plain)('<'), (0, _tokenizedText().keyword)('int'), (0, _tokenizedText().plain)('>'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().keyword)('x')];
    const paramTokenizedText2 = [(0, _tokenizedText().keyword)('xtd'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().keyword)('std'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().keyword)('vector'), (0, _tokenizedText().plain)('<'), (0, _tokenizedText().keyword)('int'), (0, _tokenizedText().plain)('>'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().keyword)('y')];
    const functionTokenizedText = [(0, _tokenizedText().keyword)('pp'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().keyword)('int'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().method)('afunction'), (0, _tokenizedText().plain)('('), ...paramTokenizedText1, (0, _tokenizedText().plain)(','), (0, _tokenizedText().whitespace)(' '), ...paramTokenizedText2, (0, _tokenizedText().plain)(')')];
    expect((0, _utils().simplifyNodeForTesting)((0, _CqueryOutlineParser().parseOutlineTree)([(0, _utils().createFunction)(functionName, functionContainerName, 1, 10), (0, _utils().createVariable)(paramName1, paramContainerName1, 1), (0, _utils().createVariable)(paramName2, paramContainerName2, 1), (0, _utils().createVariable)(localVariableName, localVariableContainerName, 2)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, _tokenizedText().type)('')],
      children: [{
        kind: 'module',
        tokenizedText: [(0, _tokenizedText().type)('aNamespace')],
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
    const paramTokenizedText = [(0, _tokenizedText().keyword)('int'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().keyword)('param')];
    const methodTokenizedText = [(0, _tokenizedText().keyword)('std'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().keyword)('vector'), (0, _tokenizedText().plain)('<'), (0, _tokenizedText().keyword)('int'), (0, _tokenizedText().plain)('>'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().method)('method'), (0, _tokenizedText().plain)('('), ...paramTokenizedText, (0, _tokenizedText().plain)(')'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().keyword)('const')];
    const memberTokenizedText = [(0, _tokenizedText().keyword)('xtd'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().keyword)('std'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().keyword)('vector'), (0, _tokenizedText().plain)('<'), (0, _tokenizedText().keyword)('std'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().plain)(':'), (0, _tokenizedText().keyword)('string'), (0, _tokenizedText().plain)('>'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().param)('member')];
    const classTokenizedText = [(0, _tokenizedText().className)('DisClass')];
    expect((0, _utils().simplifyNodeForTesting)((0, _CqueryOutlineParser().parseOutlineTree)([(0, _utils().createClass)(className, classContainerName, 1, 10), (0, _utils().createFunction)(methodName, methodContainerName, 3, 5), (0, _utils().createVariable)(paramName, paramContainerName, 3), (0, _utils().createVariable)(memberName, memberContainerName, 6)]))).toEqual({
      kind: 'module',
      tokenizedText: [(0, _tokenizedText().type)('')],
      children: [{
        kind: 'module',
        tokenizedText: [(0, _tokenizedText().type)('namespace')],
        children: [{
          kind: 'module',
          tokenizedText: [(0, _tokenizedText().type)('named')],
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
});