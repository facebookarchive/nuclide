Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.astToOutline = astToOutline;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideTokenizedText = require('../../nuclide-tokenized-text');

function astToOutline(ast) {
  return itemsToTrees(ast.body);
}

function itemsToTrees(items) {
  return _nuclideCommons.array.compact(items.map(itemToTree));
}

function itemToTree(item) {
  if (item == null) {
    return null;
  }
  var extent = getExtent(item);
  switch (item.type) {
    case 'FunctionDeclaration':
      return _extends({
        tokenizedText: [(0, _nuclideTokenizedText.keyword)('function'), (0, _nuclideTokenizedText.whitespace)(' '), (0, _nuclideTokenizedText.method)(item.id.name), (0, _nuclideTokenizedText.plain)('(')].concat(_toConsumableArray(paramsTokenizedText(item.params)), [(0, _nuclideTokenizedText.plain)(')')]),
        children: []
      }, extent);
    case 'ClassDeclaration':
      return _extends({
        tokenizedText: [(0, _nuclideTokenizedText.keyword)('class'), (0, _nuclideTokenizedText.whitespace)(' '), (0, _nuclideTokenizedText.className)(item.id.name)],
        children: itemsToTrees(item.body.body)
      }, extent);
    case 'ClassProperty':
      var paramTokens = [];
      if (item.value && item.value.type === 'ArrowFunctionExpression') {
        paramTokens = [(0, _nuclideTokenizedText.plain)('(')].concat(_toConsumableArray(paramsTokenizedText(item.value.params)), [(0, _nuclideTokenizedText.plain)(')')]);
      }
      return _extends({
        tokenizedText: [(0, _nuclideTokenizedText.method)(item.key.name), (0, _nuclideTokenizedText.plain)('=')].concat(_toConsumableArray(paramTokens)),
        children: []
      }, extent);
    case 'MethodDefinition':
      return _extends({
        tokenizedText: [(0, _nuclideTokenizedText.method)(item.key.name), (0, _nuclideTokenizedText.plain)('(')].concat(_toConsumableArray(paramsTokenizedText(item.value.params)), [(0, _nuclideTokenizedText.plain)(')')]),
        children: []
      }, extent);
    case 'ExportDeclaration':
      var tree = itemToTree(item.declaration);
      if (tree == null) {
        return null;
      }
      return _extends({
        tokenizedText: [(0, _nuclideTokenizedText.keyword)('export'), (0, _nuclideTokenizedText.whitespace)(' ')].concat(_toConsumableArray(tree.tokenizedText)),
        children: tree.children
      }, extent);
    case 'ExpressionStatement':
      return specOutline(item, /* describeOnly */true);
    default:
      return null;
  }
}

function paramsTokenizedText(params) {
  var textElements = [];
  params.forEach(function (p, index) {
    textElements.push((0, _nuclideTokenizedText.param)(p.name));
    if (index < params.length - 1) {
      textElements.push((0, _nuclideTokenizedText.plain)(','));
      textElements.push((0, _nuclideTokenizedText.whitespace)(' '));
    }
  });

  return textElements;
}

function getExtent(item) {
  return {
    startPosition: {
      // It definitely makes sense that the lines we get are 1-based and the columns are
      // 0-based... convert to 0-based all around.
      line: item.loc.start.line - 1,
      column: item.loc.start.column
    },
    endPosition: {
      line: item.loc.end.line - 1,
      column: item.loc.end.column
    }
  };
}

function specOutline(expressionStatement) {
  var describeOnly = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var expression = expressionStatement.expression;
  if (expression.type !== 'CallExpression') {
    return null;
  }
  var functionName = expression.callee.name;
  if (functionName !== 'describe') {
    if (describeOnly || functionName !== 'it') {
      return null;
    }
  }
  var description = getStringLiteralValue(expression.arguments[0]);
  var specBody = getFunctionBody(expression.arguments[1]);
  if (description == null || specBody == null) {
    return null;
  }
  var children = undefined;
  if (functionName === 'it') {
    children = [];
  } else {
    children = _nuclideCommons.array.compact(specBody.filter(function (item) {
      return item.type === 'ExpressionStatement';
    }).map(function (item) {
      return specOutline(item);
    }));
  }
  return _extends({
    tokenizedText: [(0, _nuclideTokenizedText.method)(expression.callee.name), (0, _nuclideTokenizedText.whitespace)(' '), (0, _nuclideTokenizedText.string)(description)],
    children: children
  }, getExtent(expressionStatement));
}

/** If the given AST Node is a string literal, return its literal value. Otherwise return null */
function getStringLiteralValue(literal) {
  if (literal == null) {
    return null;
  }
  if (literal.type !== 'Literal') {
    return null;
  }
  var value = literal.value;
  if (typeof value !== 'string') {
    return null;
  }
  return value;
}

function getFunctionBody(fn) {
  if (fn == null) {
    return null;
  }
  if (fn.type !== 'ArrowFunctionExpression' && fn.type !== 'FunctionExpression') {
    return null;
  }
  return fn.body.body;
}