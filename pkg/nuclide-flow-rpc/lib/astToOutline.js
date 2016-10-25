'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.astToOutline = astToOutline;

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('../../commons-node/tokenizedText');
}

function astToOutline(ast) {
  return itemsToTrees(ast.body);
}

function itemsToTrees(items) {
  return (0, (_collection || _load_collection()).arrayCompact)(items.map(itemToTree));
}

function itemToTree(item) {
  if (item == null) {
    return null;
  }
  const extent = getExtent(item);
  switch (item.type) {
    case 'FunctionDeclaration':
      return functionOutline(item.id.name, item.params, extent);
    case 'ClassDeclaration':
      return _extends({
        tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).keyword)('class'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).className)(item.id.name)],
        representativeName: item.id.name,
        children: itemsToTrees(item.body.body)
      }, extent);
    case 'ClassProperty':
      let paramTokens = [];
      if (item.value && item.value.type === 'ArrowFunctionExpression') {
        paramTokens = [(0, (_tokenizedText || _load_tokenizedText()).plain)('('), ...paramsTokenizedText(item.value.params), (0, (_tokenizedText || _load_tokenizedText()).plain)(')')];
      }
      return _extends({
        tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).method)(item.key.name), (0, (_tokenizedText || _load_tokenizedText()).plain)('='), ...paramTokens],
        representativeName: item.key.name,
        children: []
      }, extent);
    case 'MethodDefinition':
      return _extends({
        tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).method)(item.key.name), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), ...paramsTokenizedText(item.value.params), (0, (_tokenizedText || _load_tokenizedText()).plain)(')')],
        representativeName: item.key.name,
        children: []
      }, extent);
    case 'ExportDeclaration':
    case 'ExportNamedDeclaration':
      const tree = itemToTree(item.declaration);
      if (tree == null) {
        return null;
      }
      return _extends({
        tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).keyword)('export'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), ...tree.tokenizedText],
        representativeName: tree.representativeName,
        children: tree.children
      }, extent);
    case 'ExpressionStatement':
      return topLevelExpressionOutline(item);
    case 'TypeAlias':
      return typeAliasOutline(item);
    case 'VariableDeclaration':
      return variableDeclarationOutline(item);
    default:
      return null;
  }
}

function paramReducer(textElements, p, index, params) {
  switch (p.type) {
    case 'Identifier':
      textElements.push((0, (_tokenizedText || _load_tokenizedText()).param)(p.name));
      break;
    case 'ObjectPattern':
      textElements.push((0, (_tokenizedText || _load_tokenizedText()).plain)('{'));
      textElements.push(...paramsTokenizedText(p.properties.map(obj => obj.key)));
      textElements.push((0, (_tokenizedText || _load_tokenizedText()).plain)('}'));
      break;
    case 'ArrayPattern':
      textElements.push((0, (_tokenizedText || _load_tokenizedText()).plain)('['));
      textElements.push(...paramsTokenizedText(p.elements));
      textElements.push((0, (_tokenizedText || _load_tokenizedText()).plain)(']'));
      break;
    case 'AssignmentPattern':
      return paramReducer(textElements, p.left, index, params);
    case 'RestElement':
      textElements.push((0, (_tokenizedText || _load_tokenizedText()).plain)('...'));
      return paramReducer(textElements, p.argument, index, params);
    default:
      throw new Error(`encountered unexpected argument type ${ p.type }`);
  }
  if (index < params.length - 1) {
    textElements.push((0, (_tokenizedText || _load_tokenizedText()).plain)(','));
    textElements.push((0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '));
  }
  return textElements;
}

function paramsTokenizedText(params) {
  return params.reduce(paramReducer, []);
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

function functionOutline(name, params, extent) {
  return _extends({
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).keyword)('function'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).method)(name), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), ...paramsTokenizedText(params), (0, (_tokenizedText || _load_tokenizedText()).plain)(')')],
    representativeName: name,
    children: []
  }, extent);
}

function typeAliasOutline(typeAliasExpression) {
  if (!(typeAliasExpression.type === 'TypeAlias')) {
    throw new Error('Invariant violation: "typeAliasExpression.type === \'TypeAlias\'"');
  }

  const name = typeAliasExpression.id.name;
  return _extends({
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).keyword)('type'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).type)(name)],
    representativeName: name,
    children: []
  }, getExtent(typeAliasExpression));
}

function topLevelExpressionOutline(expressionStatement) {
  switch (expressionStatement.expression.type) {
    case 'CallExpression':
      return specOutline(expressionStatement, /* describeOnly */true);
    case 'AssignmentExpression':
      return moduleExportsOutline(expressionStatement.expression);
    default:
      return null;
  }
}

function moduleExportsOutline(assignmentStatement) {
  if (!(assignmentStatement.type === 'AssignmentExpression')) {
    throw new Error('Invariant violation: "assignmentStatement.type === \'AssignmentExpression\'"');
  }

  const left = assignmentStatement.left;
  if (!isModuleExports(left)) {
    return null;
  }

  const right = assignmentStatement.right;
  if (right.type !== 'ObjectExpression') {
    return null;
  }
  const properties = right.properties;
  return _extends({
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).plain)('module.exports')],
    children: (0, (_collection || _load_collection()).arrayCompact)(properties.map(moduleExportsPropertyOutline))
  }, getExtent(assignmentStatement));
}

function isModuleExports(left) {
  return left.type === 'MemberExpression' && left.object.type === 'Identifier' && left.object.name === 'module' && left.property.type === 'Identifier' && left.property.name === 'exports';
}

function moduleExportsPropertyOutline(property) {
  if (!(property.type === 'Property')) {
    throw new Error('Invariant violation: "property.type === \'Property\'"');
  }

  if (property.key.type !== 'Identifier') {
    return null;
  }
  const propName = property.key.name;

  if (property.shorthand) {
    // This happens when the shorthand `{ foo }` is used for `{ foo: foo }`
    return _extends({
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).string)(propName)],
      representativeName: propName,
      children: []
    }, getExtent(property));
  }

  if (property.value.type === 'FunctionExpression' || property.value.type === 'ArrowFunctionExpression') {
    return _extends({
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).method)(propName), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), ...paramsTokenizedText(property.value.params), (0, (_tokenizedText || _load_tokenizedText()).plain)(')')],
      representativeName: propName,
      children: []
    }, getExtent(property));
  }

  return _extends({
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).string)(propName), (0, (_tokenizedText || _load_tokenizedText()).plain)(':')],
    representativeName: propName,
    children: []
  }, getExtent(property));
}

function specOutline(expressionStatement) {
  let describeOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  const expression = expressionStatement.expression;
  if (expression.type !== 'CallExpression') {
    return null;
  }
  const functionName = getFunctionName(expression.callee);
  if (functionName == null) {
    return null;
  }
  if (!isDescribe(functionName)) {
    if (describeOnly || !isIt(functionName)) {
      return null;
    }
  }
  const description = getStringLiteralValue(expression.arguments[0]);
  const specBody = getFunctionBody(expression.arguments[1]);
  if (description == null || specBody == null) {
    return null;
  }
  let children;
  if (isIt(functionName)) {
    children = [];
  } else {
    children = (0, (_collection || _load_collection()).arrayCompact)(specBody.filter(item => item.type === 'ExpressionStatement').map(item => specOutline(item)));
  }
  return _extends({
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).method)(functionName), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).string)(description)],
    representativeName: description,
    children: children
  }, getExtent(expressionStatement));
}

// Return the function name as written as a string. Intended to stringify patterns like `describe`
// and `describe.only` even though `describe.only` is a MemberExpression rather than an Identifier.
function getFunctionName(callee) {
  switch (callee.type) {
    case 'Identifier':
      return callee.name;
    case 'MemberExpression':
      if (callee.object.type !== 'Identifier' || callee.property.type !== 'Identifier') {
        return null;
      }
      return `${ callee.object.name }.${ callee.property.name }`;
    default:
      return null;
  }
}

function isDescribe(functionName) {
  switch (functionName) {
    case 'describe':
    case 'fdescribe':
    case 'ddescribe':
    case 'xdescribe':
    case 'describe.only':
    case 'describe.skip':
      return true;
    default:
      return false;
  }
}

function isIt(functionName) {
  switch (functionName) {
    case 'it':
    case 'fit':
    case 'iit':
    case 'pit':
    case 'xit':
    case 'it.only':
    case 'it.skip':
      return true;
    default:
      return false;
  }
}

/** If the given AST Node is a string literal, return its literal value. Otherwise return null */
function getStringLiteralValue(literal) {
  if (literal == null) {
    return null;
  }
  if (literal.type !== 'Literal') {
    return null;
  }
  const value = literal.value;
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

function variableDeclarationOutline(declaration) {
  // If there are multiple var declarations in one line, just take the first.
  return variableDeclaratorOutline(declaration.declarations[0], declaration.kind, getExtent(declaration));
}

function variableDeclaratorOutline(declarator, kind, extent) {
  if (declarator.init != null && (declarator.init.type === 'FunctionExpression' || declarator.init.type === 'ArrowFunctionExpression')) {
    return functionOutline(declarator.id.name, declarator.init.params, extent);
  }

  return _extends({
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).keyword)(kind), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).param)(declarator.id.name)],
    representativeName: declarator.id.name,
    children: []
  }, extent);
}