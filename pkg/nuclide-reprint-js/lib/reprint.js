var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var DefaultOptions = require('./options/DefaultOptions');
var Immutable = require('immutable');

var babel = require('babel-core');
var flatten = require('./utils/flatten');
var getInvalidLeadingComments = require('./utils/getInvalidLeadingComments');
var getInvalidTrailingComments = require('./utils/getInvalidTrailingComments');
var invariant = require('assert');
var printAnyTypeAnnotation = require('./printers/simple/printAnyTypeAnnotation');
var printArrayExpression = require('./printers/simple/printArrayExpression');
var printArrayPattern = require('./printers/simple/printArrayPattern');
var printArrowFunctionExpression = require('./printers/simple/printArrowFunctionExpression');
var printAssignmentExpression = require('./printers/simple/printAssignmentExpression');
var printAssignmentPattern = require('./printers/simple/printAssignmentPattern');
var printAwaitExpression = require('./printers/simple/printAwaitExpression');
var printBinaryExpression = require('./printers/complex/printBinaryExpression');
var printBlockStatement = require('./printers/simple/printBlockStatement');
var printBooleanLiteralTypeAnnotation = require('./printers/simple/printBooleanLiteralTypeAnnotation');
var printBooleanTypeAnnotation = require('./printers/simple/printBooleanTypeAnnotation');
var printBreakStatement = require('./printers/simple/printBreakStatement');
var printCallExpression = require('./printers/simple/printCallExpression');
var printCatchClause = require('./printers/simple/printCatchClause');
var printClassBody = require('./printers/simple/printClassBody');
var printClassDeclaration = require('./printers/simple/printClassDeclaration');
var printClassProperty = require('./printers/simple/printClassProperty');
var printConditionalExpression = require('./printers/simple/printConditionalExpression');
var printContinueStatement = require('./printers/simple/printContinueStatement');
var printDebuggerStatement = require('./printers/simple/printDebuggerStatement');
var printDoWhileStatement = require('./printers/simple/printDoWhileStatement');
var printEmptyStatement = require('./printers/simple/printEmptyStatement');
var printExportDefaultDeclaration = require('./printers/simple/printExportDefaultDeclaration');
var printExportDefaultSpecifier = require('./printers/simple/printExportDefaultSpecifier');
var printExportNamedDeclaration = require('./printers/simple/printExportNamedDeclaration');
var printExportNamespaceSpecifier = require('./printers/simple/printExportNamespaceSpecifier');
var printExportSpecifier = require('./printers/simple/printExportSpecifier');
var printExpressionStatement = require('./printers/simple/printExpressionStatement');
var printFile = require('./printers/simple/printFile');
var printForInStatement = require('./printers/simple/printForInStatement');
var printForOfStatement = require('./printers/simple/printForOfStatement');
var printForStatement = require('./printers/simple/printForStatement');
var printFunctionDeclaration = require('./printers/simple/printFunctionDeclaration');
var printFunctionExpression = require('./printers/complex/printFunctionExpression');
var printFunctionTypeAnnotation = require('./printers/simple/printFunctionTypeAnnotation');
var printFunctionTypeParam = require('./printers/simple/printFunctionTypeParam');
var printGenericTypeAnnotation = require('./printers/simple/printGenericTypeAnnotation');
var printIdentifier = require('./printers/simple/printIdentifier');
var printIfStatement = require('./printers/simple/printIfStatement');
var printImportDeclaration = require('./printers/simple/printImportDeclaration');
var printImportDefaultSpecifier = require('./printers/simple/printImportDefaultSpecifier');
var printImportNamespaceSpecifier = require('./printers/simple/printImportNamespaceSpecifier');
var printImportSpecifier = require('./printers/simple/printImportSpecifier');
var printIntersectionTypeAnnotation = require('./printers/simple/printIntersectionTypeAnnotation');
var printJSXAttribute = require('./printers/simple/printJSXAttribute');
var printJSXClosingElement = require('./printers/simple/printJSXClosingElement');
var printJSXElement = require('./printers/simple/printJSXElement');
var printJSXExpressionContainer = require('./printers/simple/printJSXExpressionContainer');
var printJSXIdentifier = require('./printers/simple/printJSXIdentifier');
var printJSXMemberExpression = require('./printers/simple/printJSXMemberExpression');
var printJSXOpeningElement = require('./printers/simple/printJSXOpeningElement');
var printJSXSpreadAttribute = require('./printers/simple/printJSXSpreadAttribute');
var printLabeledStatement = require('./printers/simple/printLabeledStatement');
var printLiteral = require('./printers/complex/printLiteral');
var printLogicalExpression = require('./printers/complex/printLogicalExpression');
var printMemberExpression = require('./printers/complex/printMemberExpression');
var printMethodDefinition = require('./printers/simple/printMethodDefinition');
var printMixedTypeAnnotation = require('./printers/simple/printMixedTypeAnnotation');
var printNewExpression = require('./printers/simple/printNewExpression');
var printNullableTypeAnnotation = require('./printers/simple/printNullableTypeAnnotation');
var printNumberLiteralTypeAnnotation = require('./printers/simple/printNumberLiteralTypeAnnotation');
var printNumberTypeAnnotation = require('./printers/simple/printNumberTypeAnnotation');
var printObjectExpression = require('./printers/simple/printObjectExpression');
var printObjectPattern = require('./printers/simple/printObjectPattern');
var printObjectTypeAnnotation = require('./printers/simple/printObjectTypeAnnotation');
var printObjectTypeProperty = require('./printers/simple/printObjectTypeProperty');
var printProgram = require('./printers/simple/printProgram');
var printProperty = require('./printers/simple/printProperty');
var printQualifiedTypeIdentifier = require('./printers/simple/printQualifiedTypeIdentifier');
var printRestElement = require('./printers/simple/printRestElement');
var printReturnStatement = require('./printers/simple/printReturnStatement');
var printSpreadElement = require('./printers/simple/printSpreadElement');
var printSpreadProperty = require('./printers/simple/printSpreadProperty');
var printStringLiteralTypeAnnotation = require('./printers/simple/printStringLiteralTypeAnnotation');
var printStringTypeAnnotation = require('./printers/simple/printStringTypeAnnotation');
var printSuper = require('./printers/simple/printSuper');
var printSwitchCase = require('./printers/simple/printSwitchCase');
var printSwitchStatement = require('./printers/simple/printSwitchStatement');
var printTaggedTemplateExpression = require('./printers/simple/printTaggedTemplateExpression');
var printTemplateElement = require('./printers/simple/printTemplateElement');
var printTemplateLiteral = require('./printers/simple/printTemplateLiteral');
var printThisExpression = require('./printers/simple/printThisExpression');
var printThrowStatement = require('./printers/simple/printThrowStatement');
var printTryStatement = require('./printers/simple/printTryStatement');
var printTupleTypeAnnotation = require('./printers/simple/printTupleTypeAnnotation');
var printTypeAlias = require('./printers/simple/printTypeAlias');
var printTypeAnnotation = require('./printers/simple/printTypeAnnotation');
var printTypeofTypeAnnotation = require('./printers/simple/printTypeofTypeAnnotation');
var printTypeParameterDeclaration = require('./printers/simple/printTypeParameterDeclaration');
var printTypeParameterInstantiation = require('./printers/simple/printTypeParameterInstantiation');
var printUnaryExpression = require('./printers/simple/printUnaryExpression');
var printUnionTypeAnnotation = require('./printers/simple/printUnionTypeAnnotation');
var printUpdateExpression = require('./printers/simple/printUpdateExpression');
var printVariableDeclaration = require('./printers/complex/printVariableDeclaration');
var printVariableDeclarator = require('./printers/simple/printVariableDeclarator');
var printVoidTypeAnnotation = require('./printers/simple/printVoidTypeAnnotation');
var printWhileStatement = require('./printers/simple/printWhileStatement');
var printWithStatement = require('./printers/simple/printWithStatement');
var printYieldExpression = require('./printers/simple/printYieldExpression');
var resolveLines = require('./resolvers/resolveLines');
var wrapWithComments = require('./wrappers/complex/wrapWithComments');

/**
 * Entry point into reprint. Parses the source into an AST and then prints it
 * according to the given options.
 */
function reprint(source, nullableOptions) {
  var options = nullableOptions || DefaultOptions;
  var ast = babel.parse(source);
  var lines = flatten(printWithWrappers(ast, {
    invalidLeadingComments: getInvalidLeadingComments(ast),
    invalidTrailingComments: getInvalidTrailingComments(ast),
    options: options,
    path: Immutable.List()
  }));
  return resolveLines(lines, options);
}

/**
 * Helper to build a print function for the given node and context.
 */
function getPrintFn(node, context) {
  var nextContext = _extends({}, context, {
    path: context.path.push(node)
  });
  return function (x) {
    return printWithWrappers(x, nextContext);
  };
}

/**
 * Generic print function that will return an array of strings for the given
 * ast node.
 */
function printWithWrappers(node, context) {
  if (!node) {
    return [];
  }

  var print = getPrintFn(node, context);
  var lines = printWithoutWrappers(node, context);
  lines = wrapWithComments(print, node, context, lines);
  return lines;
}

/**
 * Prints the node ignoring comments.
 */
function printWithoutWrappers(node, context) {
  if (!node) {
    return [];
  }

  var print = getPrintFn(node, context);

  /**
   * Simple printers.
   */
  switch (node.type) {
    case 'ArrayExpression':
      return printArrayExpression(print, node);

    case 'ArrayPattern':
      return printArrayPattern(print, node);

    case 'ArrowFunctionExpression':
      return printArrowFunctionExpression(print, node);

    case 'AssignmentExpression':
      return printAssignmentExpression(print, node);

    case 'AssignmentPattern':
      return printAssignmentPattern(print, node);

    case 'AwaitExpression':
      return printAwaitExpression(print, node);

    case 'BlockStatement':
      return printBlockStatement(print, node);

    case 'BreakStatement':
      return printBreakStatement(print, node);

    case 'CallExpression':
      return printCallExpression(print, node);

    case 'CatchClause':
      return printCatchClause(print, node);

    case 'ClassBody':
      return printClassBody(print, node);

    case 'ClassDeclaration':
      return printClassDeclaration(print, node);

    case 'ClassProperty':
      return printClassProperty(print, node);

    case 'ConditionalExpression':
      return printConditionalExpression(print, node);

    case 'ContinueStatement':
      return printContinueStatement(print, node);

    case 'DebuggerStatement':
      return printDebuggerStatement(print, node);

    case 'DoWhileStatement':
      return printDoWhileStatement(print, node);

    case 'EmptyStatement':
      return printEmptyStatement(print, node);

    case 'ExportDefaultDeclaration':
      return printExportDefaultDeclaration(print, node);

    case 'ExportDefaultSpecifier':
      return printExportDefaultSpecifier(print, node);

    case 'ExportNamedDeclaration':
      return printExportNamedDeclaration(print, node);

    case 'ExportNamespaceSpecifier':
      return printExportNamespaceSpecifier(print, node);

    case 'ExportSpecifier':
      return printExportSpecifier(print, node);

    case 'ExpressionStatement':
      return printExpressionStatement(print, node);

    case 'File':
      return printFile(print, node);

    case 'ForInStatement':
      return printForInStatement(print, node);

    case 'ForOfStatement':
      return printForOfStatement(print, node);

    case 'ForStatement':
      return printForStatement(print, node);

    case 'FunctionDeclaration':
      return printFunctionDeclaration(print, node);

    case 'Identifier':
      return printIdentifier(print, node);

    case 'IfStatement':
      return printIfStatement(print, node);

    case 'ImportDeclaration':
      return printImportDeclaration(print, node);

    case 'ImportDefaultSpecifier':
      return printImportDefaultSpecifier(print, node);

    case 'ImportNamespaceSpecifier':
      return printImportNamespaceSpecifier(print, node);

    case 'ImportSpecifier':
      return printImportSpecifier(print, node);

    case 'LabeledStatement':
      return printLabeledStatement(print, node);

    case 'MethodDefinition':
      return printMethodDefinition(print, node);

    case 'NewExpression':
      return printNewExpression(print, node);

    case 'ObjectExpression':
      return printObjectExpression(print, node);

    case 'ObjectPattern':
      return printObjectPattern(print, node);

    case 'Program':
      return printProgram(print, node);

    case 'Property':
      return printProperty(print, node);

    case 'RestElement':
      return printRestElement(print, node);

    case 'ReturnStatement':
      return printReturnStatement(print, node);

    case 'SpreadElement':
      return printSpreadElement(print, node);

    case 'SpreadProperty':
      return printSpreadProperty(print, node);

    case 'Super':
      return printSuper(print, node);

    case 'SwitchCase':
      return printSwitchCase(print, node);

    case 'SwitchStatement':
      return printSwitchStatement(print, node);

    case 'TaggedTemplateExpression':
      return printTaggedTemplateExpression(print, node);

    case 'TemplateElement':
      return printTemplateElement(print, node);

    case 'TemplateLiteral':
      return printTemplateLiteral(print, node);

    case 'ThisExpression':
      return printThisExpression(print, node);

    case 'ThrowStatement':
      return printThrowStatement(print, node);

    case 'TryStatement':
      return printTryStatement(print, node);

    case 'UnaryExpression':
      return printUnaryExpression(print, node);

    case 'UpdateExpression':
      return printUpdateExpression(print, node);

    case 'VariableDeclarator':
      return printVariableDeclarator(print, node);

    case 'WhileStatement':
      return printWhileStatement(print, node);

    case 'WithStatement':
      return printWithStatement(print, node);

    case 'YieldExpression':
      return printYieldExpression(print, node);
  }

  /**
   * Complex printers -- meaning they require context.
   */
  switch (node.type) {
    case 'BinaryExpression':
      return printBinaryExpression(print, node, context);

    case 'FunctionExpression':
      return printFunctionExpression(print, node, context);

    case 'Literal':
      return printLiteral(print, node, context);

    case 'LogicalExpression':
      return printLogicalExpression(print, node, context);

    case 'MemberExpression':
      return printMemberExpression(print, node, context);

    case 'VariableDeclaration':
      return printVariableDeclaration(print, node, context);
  }

  /**
   * JSX Nodes
   */
  switch (node.type) {
    case 'JSXAttribute':
      return printJSXAttribute(print, node);

    case 'JSXClosingElement':
      return printJSXClosingElement(print, node);

    case 'JSXElement':
      return printJSXElement(print, node);

    case 'JSXExpressionContainer':
      return printJSXExpressionContainer(print, node);

    case 'JSXIdentifier':
      return printJSXIdentifier(print, node);

    case 'JSXMemberExpression':
      return printJSXMemberExpression(print, node);

    case 'JSXOpeningElement':
      return printJSXOpeningElement(print, node);

    case 'JSXSpreadAttribute':
      return printJSXSpreadAttribute(print, node);
  }

  /**
   * Flow types.
   */
  switch (node.type) {
    case 'AnyTypeAnnotation':
      return printAnyTypeAnnotation(print, node);

    case 'BooleanLiteralTypeAnnotation':
      return printBooleanLiteralTypeAnnotation(print, node);

    case 'BooleanTypeAnnotation':
      return printBooleanTypeAnnotation(print, node);

    case 'FunctionTypeAnnotation':
      return printFunctionTypeAnnotation(print, node);

    case 'FunctionTypeParam':
      return printFunctionTypeParam(print, node);

    case 'GenericTypeAnnotation':
      return printGenericTypeAnnotation(print, node);

    case 'IntersectionTypeAnnotation':
      return printIntersectionTypeAnnotation(print, node);

    case 'MixedTypeAnnotation':
      return printMixedTypeAnnotation(print, node);

    case 'NullableTypeAnnotation':
      return printNullableTypeAnnotation(print, node);

    case 'NumberLiteralTypeAnnotation':
      return printNumberLiteralTypeAnnotation(print, node);

    case 'NumberTypeAnnotation':
      return printNumberTypeAnnotation(print, node);

    case 'ObjectTypeAnnotation':
      return printObjectTypeAnnotation(print, node);

    case 'ObjectTypeProperty':
      return printObjectTypeProperty(print, node);

    case 'QualifiedTypeIdentifier':
      return printQualifiedTypeIdentifier(print, node);

    case 'StringLiteralTypeAnnotation':
      return printStringLiteralTypeAnnotation(print, node);

    case 'StringTypeAnnotation':
      return printStringTypeAnnotation(print, node);

    case 'TupleTypeAnnotation':
      return printTupleTypeAnnotation(print, node);

    case 'TypeAlias':
      return printTypeAlias(print, node);

    case 'TypeAnnotation':
      return printTypeAnnotation(print, node);

    case 'TypeofTypeAnnotation':
      return printTypeofTypeAnnotation(print, node);

    case 'TypeParameterDeclaration':
      return printTypeParameterDeclaration(print, node);

    case 'TypeParameterInstantiation':
      return printTypeParameterInstantiation(print, node);

    case 'UnionTypeAnnotation':
      return printUnionTypeAnnotation(print, node);

    case 'VoidTypeAnnotation':
      return printVoidTypeAnnotation(print, node);
  }

  /**
   * I'm not sure what these are. I need to figure that out and implement them!
   */
  switch (node.type) {
    // Not sure how to create any of these.
    case 'ClassExpression':
    case 'ClassPropertyDefinition':
    case 'DeclareClass':
    case 'DeclareModule':
    case 'DeclareVariable':
    case 'InterfaceDeclaration':
    case 'InterfaceExtends':
    case 'JSXEmptyExpression':
    case 'JSXNamespacedName':
    case 'MemberTypeAnnotation':
    case 'ModuleSpecifier':
    case 'ObjectTypeCallProperty':
    case 'ObjectTypeIndexer':
    case 'TypeCaseExpression':
    // I believe this is now replaced with TupleTypeAnnotation: [string].
    case 'ArrayTypeAnnotation':
    // I think this is a literal within JSXElement's children for certain
    // parsers, but Babylon appears to just use Literal.
    case 'JSXText':
      return [];
  }

  /**
   * What these nodes do is not well defined. They may be stage 0 proposals for
   * example.
   */
  switch (node.type) {
    case 'ClassImplements':
    case 'ComprehensionBlock':
    case 'ComprehensionExpression':
    case 'GeneratorExpression':
    case 'SequenceExpression':
      return [];
  }

  invariant(false, 'Unknown node type: %s', node.type);
}

module.exports = reprint;