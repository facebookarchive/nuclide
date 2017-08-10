'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.astToOutline = astToOutline;

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('nuclide-commons/tokenized-text');
}

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

function astToOutline(ast) {
  return {
    outlineTrees: itemsToTrees(ast.body)
  };
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
    case 'ArrowFunctionExpression':
      return functionOutline(item.id != null ? item.id.name : '', item.params, extent);
    case 'ClassDeclaration':
    case 'ClassExpression':
      const tokenizedText = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('class')];
      let representativeName = undefined;
      if (item.id != null) {
        tokenizedText.push((0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).className)(item.id.name));
        representativeName = item.id.name;
      }
      return Object.assign({
        kind: 'class',
        tokenizedText,
        representativeName,
        children: itemsToTrees(item.body.body)
      }, extent);
    case 'ClassProperty':
      let paramTokens = [];
      if (item.value && item.value.type === 'ArrowFunctionExpression') {
        paramTokens = [(0, (_tokenizedText || _load_tokenizedText()).plain)('('), ...declarationsTokenizedText(item.value.params), (0, (_tokenizedText || _load_tokenizedText()).plain)(')')];
      }
      return Object.assign({
        kind: 'property',
        tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).method)(item.key.name), (0, (_tokenizedText || _load_tokenizedText()).plain)('='), ...paramTokens],
        representativeName: item.key.name,
        children: []
      }, extent);
    case 'MethodDefinition':
      return Object.assign({
        kind: 'method',
        tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).method)(item.key.name), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), ...declarationsTokenizedText(item.value.params), (0, (_tokenizedText || _load_tokenizedText()).plain)(')')],
        representativeName: item.key.name,
        children: []
      }, extent);
    case 'ExportDeclaration':
    case 'ExportNamedDeclaration':
      return exportDeclaration(item, extent, Boolean(item.default));
    case 'ExportDefaultDeclaration':
      return exportDeclaration(item, extent, true);
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

function exportDeclaration(item, extent, isDefault) {
  const tree = itemToTree(item.declaration);
  if (tree == null) {
    return null;
  }
  const tokenizedText = [(0, (_tokenizedText || _load_tokenizedText()).keyword)('export'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' ')];
  if (isDefault) {
    tokenizedText.push((0, (_tokenizedText || _load_tokenizedText()).keyword)('default'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '));
  }
  // Flow always has tokenizedText

  if (!(tree.tokenizedText != null)) {
    throw new Error('Invariant violation: "tree.tokenizedText != null"');
  }

  tokenizedText.push(...tree.tokenizedText);
  return Object.assign({
    kind: tree.kind,
    tokenizedText,
    representativeName: tree.representativeName,
    children: tree.children
  }, extent);
}

function declarationReducer(textElements, p, index, declarations) {
  switch (p.type) {
    case 'Identifier':
      textElements.push((0, (_tokenizedText || _load_tokenizedText()).param)(p.name));
      break;
    case 'ObjectPattern':
      textElements.push((0, (_tokenizedText || _load_tokenizedText()).plain)('{'));
      textElements.push(...declarationsTokenizedText(p.properties.map(obj => obj.key)));
      textElements.push((0, (_tokenizedText || _load_tokenizedText()).plain)('}'));
      break;
    case 'ArrayPattern':
      textElements.push((0, (_tokenizedText || _load_tokenizedText()).plain)('['));
      textElements.push(...declarationsTokenizedText(p.elements));
      textElements.push((0, (_tokenizedText || _load_tokenizedText()).plain)(']'));
      break;
    case 'AssignmentPattern':
      return declarationReducer(textElements, p.left, index, declarations);
    case 'RestElement':
      textElements.push((0, (_tokenizedText || _load_tokenizedText()).plain)('...'));
      return declarationReducer(textElements, p.argument, index, declarations);
    default:
      throw new Error(`encountered unexpected argument type ${p.type}`);
  }
  if (index < declarations.length - 1) {
    textElements.push((0, (_tokenizedText || _load_tokenizedText()).plain)(','));
    textElements.push((0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '));
  }
  return textElements;
}

function declarationsTokenizedText(declarations) {
  return declarations.reduce(declarationReducer, []);
}

function getExtent(item) {
  return {
    startPosition: new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(
    // It definitely makes sense that the lines we get are 1-based and the columns are
    // 0-based... convert to 0-based all around.
    item.loc.start.line - 1, item.loc.start.column),
    endPosition: new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(item.loc.end.line - 1, item.loc.end.column)
  };
}

function functionOutline(name, params, extent) {
  return Object.assign({
    kind: 'function',
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).keyword)('function'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).method)(name), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), ...declarationsTokenizedText(params), (0, (_tokenizedText || _load_tokenizedText()).plain)(')')],
    representativeName: name,
    children: []
  }, extent);
}

function typeAliasOutline(typeAliasExpression) {
  if (!(typeAliasExpression.type === 'TypeAlias')) {
    throw new Error('Invariant violation: "typeAliasExpression.type === \'TypeAlias\'"');
  }

  const name = typeAliasExpression.id.name;
  return Object.assign({
    kind: 'interface',
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
  return Object.assign({
    kind: 'module',
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
    return Object.assign({
      kind: 'method',
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).string)(propName)],
      representativeName: propName,
      children: []
    }, getExtent(property));
  }

  if (property.value.type === 'FunctionExpression' || property.value.type === 'ArrowFunctionExpression') {
    return Object.assign({
      kind: 'method',
      tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).method)(propName), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), ...declarationsTokenizedText(property.value.params), (0, (_tokenizedText || _load_tokenizedText()).plain)(')')],
      representativeName: propName,
      children: []
    }, getExtent(property));
  }

  return Object.assign({
    kind: 'field',
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).string)(propName), (0, (_tokenizedText || _load_tokenizedText()).plain)(':')],
    representativeName: propName,
    children: []
  }, getExtent(property));
}

function specOutline(expressionStatement, describeOnly = false) {
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
  return Object.assign({
    kind: 'function',
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).method)(functionName), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).string)(description)],
    representativeName: description,
    children
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
      return `${callee.object.name}.${callee.property.name}`;
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
    case 'test.cb':
    case 'test.serial':
    case 'test.todo':
    case 'test.failing':
    case 'test':
    case 'test.concurrent':
    case 'test.only':
    case 'test.skip':
    case 'suite':
    case 'suite.only':
    case 'suite.skip':
    case 'xtest':
    case 'xtest.concurrent':
    case 'xtest.only':
    case 'xtest.skip':
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

  const { id } = declarator;

  const tokenizedText = [(0, (_tokenizedText || _load_tokenizedText()).keyword)(kind), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), ...declarationsTokenizedText([id])];
  const representativeName = id.type === 'Identifier' ? id.name : undefined;
  return Object.assign({
    kind: kind === 'const' ? 'constant' : 'variable',
    tokenizedText,
    representativeName,
    children: []
  }, extent);
}