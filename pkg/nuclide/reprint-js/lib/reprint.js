'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Context, Lines, Output, Print} from './types/common';
import type Options from './options/Options';

const DefaultOptions = require('./options/DefaultOptions');
const Immutable = require('immutable');

const babel = require('babel-core');
const flatten = require('./utils/flatten');
const getInvalidLeadingComments = require('./utils/getInvalidLeadingComments');
const getInvalidTrailingComments = require('./utils/getInvalidTrailingComments');
const invariant = require('assert');
const printAnyTypeAnnotation = require('./printers/simple/printAnyTypeAnnotation');
const printArrayExpression = require('./printers/simple/printArrayExpression');
const printArrayPattern = require('./printers/simple/printArrayPattern');
const printArrowFunctionExpression = require('./printers/simple/printArrowFunctionExpression');
const printAssignmentExpression = require('./printers/simple/printAssignmentExpression');
const printAssignmentPattern = require('./printers/simple/printAssignmentPattern');
const printAwaitExpression = require('./printers/simple/printAwaitExpression');
const printBinaryExpression = require('./printers/complex/printBinaryExpression');
const printBlockStatement = require('./printers/simple/printBlockStatement');
const printBooleanLiteralTypeAnnotation = require('./printers/simple/printBooleanLiteralTypeAnnotation');
const printBooleanTypeAnnotation = require('./printers/simple/printBooleanTypeAnnotation');
const printBreakStatement = require('./printers/simple/printBreakStatement');
const printCallExpression = require('./printers/simple/printCallExpression');
const printCatchClause = require('./printers/simple/printCatchClause');
const printClassBody = require('./printers/simple/printClassBody');
const printClassDeclaration = require('./printers/simple/printClassDeclaration');
const printClassProperty = require('./printers/simple/printClassProperty');
const printConditionalExpression = require('./printers/simple/printConditionalExpression');
const printContinueStatement = require('./printers/simple/printContinueStatement');
const printDebuggerStatement = require('./printers/simple/printDebuggerStatement');
const printDoWhileStatement = require('./printers/simple/printDoWhileStatement');
const printEmptyStatement = require('./printers/simple/printEmptyStatement');
const printExportDefaultDeclaration = require('./printers/simple/printExportDefaultDeclaration');
const printExportDefaultSpecifier = require('./printers/simple/printExportDefaultSpecifier');
const printExportNamedDeclaration = require('./printers/simple/printExportNamedDeclaration');
const printExportNamespaceSpecifier = require('./printers/simple/printExportNamespaceSpecifier');
const printExportSpecifier = require('./printers/simple/printExportSpecifier');
const printExpressionStatement = require('./printers/simple/printExpressionStatement');
const printFile = require('./printers/simple/printFile');
const printForInStatement = require('./printers/simple/printForInStatement');
const printForOfStatement = require('./printers/simple/printForOfStatement');
const printForStatement = require('./printers/simple/printForStatement');
const printFunctionDeclaration = require('./printers/simple/printFunctionDeclaration');
const printFunctionExpression = require('./printers/complex/printFunctionExpression');
const printFunctionTypeAnnotation = require('./printers/simple/printFunctionTypeAnnotation');
const printFunctionTypeParam = require('./printers/simple/printFunctionTypeParam');
const printGenericTypeAnnotation = require('./printers/simple/printGenericTypeAnnotation');
const printIdentifier = require('./printers/simple/printIdentifier');
const printIfStatement = require('./printers/simple/printIfStatement');
const printImportDeclaration = require('./printers/simple/printImportDeclaration');
const printImportDefaultSpecifier = require('./printers/simple/printImportDefaultSpecifier');
const printImportNamespaceSpecifier = require('./printers/simple/printImportNamespaceSpecifier');
const printImportSpecifier = require('./printers/simple/printImportSpecifier');
const printIntersectionTypeAnnotation = require('./printers/simple/printIntersectionTypeAnnotation');
const printJSXAttribute = require('./printers/simple/printJSXAttribute');
const printJSXClosingElement = require('./printers/simple/printJSXClosingElement');
const printJSXElement = require('./printers/simple/printJSXElement');
const printJSXExpressionContainer = require('./printers/simple/printJSXExpressionContainer');
const printJSXIdentifier = require('./printers/simple/printJSXIdentifier');
const printJSXMemberExpression = require('./printers/simple/printJSXMemberExpression');
const printJSXOpeningElement = require('./printers/simple/printJSXOpeningElement');
const printJSXSpreadAttribute = require('./printers/simple/printJSXSpreadAttribute');
const printLabeledStatement = require('./printers/simple/printLabeledStatement');
const printLiteral = require('./printers/complex/printLiteral');
const printLogicalExpression = require('./printers/complex/printLogicalExpression');
const printMemberExpression = require('./printers/complex/printMemberExpression');
const printMethodDefinition = require('./printers/simple/printMethodDefinition');
const printMixedTypeAnnotation = require('./printers/simple/printMixedTypeAnnotation');
const printNewExpression = require('./printers/simple/printNewExpression');
const printNullableTypeAnnotation = require('./printers/simple/printNullableTypeAnnotation');
const printNumberLiteralTypeAnnotation = require('./printers/simple/printNumberLiteralTypeAnnotation');
const printNumberTypeAnnotation = require('./printers/simple/printNumberTypeAnnotation');
const printObjectExpression = require('./printers/simple/printObjectExpression');
const printObjectPattern = require('./printers/simple/printObjectPattern');
const printObjectTypeAnnotation = require('./printers/simple/printObjectTypeAnnotation');
const printObjectTypeProperty = require('./printers/simple/printObjectTypeProperty');
const printProgram = require('./printers/simple/printProgram');
const printProperty = require('./printers/simple/printProperty');
const printQualifiedTypeIdentifier = require('./printers/simple/printQualifiedTypeIdentifier');
const printRestElement = require('./printers/simple/printRestElement');
const printReturnStatement = require('./printers/simple/printReturnStatement');
const printSpreadElement = require('./printers/simple/printSpreadElement');
const printSpreadProperty = require('./printers/simple/printSpreadProperty');
const printStringLiteralTypeAnnotation = require('./printers/simple/printStringLiteralTypeAnnotation');
const printStringTypeAnnotation = require('./printers/simple/printStringTypeAnnotation');
const printSuper = require('./printers/simple/printSuper');
const printSwitchCase = require('./printers/simple/printSwitchCase');
const printSwitchStatement = require('./printers/simple/printSwitchStatement');
const printTaggedTemplateExpression = require('./printers/simple/printTaggedTemplateExpression');
const printTemplateElement = require('./printers/simple/printTemplateElement');
const printTemplateLiteral = require('./printers/simple/printTemplateLiteral');
const printThisExpression = require('./printers/simple/printThisExpression');
const printThrowStatement = require('./printers/simple/printThrowStatement');
const printTryStatement = require('./printers/simple/printTryStatement');
const printTupleTypeAnnotation = require('./printers/simple/printTupleTypeAnnotation');
const printTypeAlias = require('./printers/simple/printTypeAlias');
const printTypeAnnotation = require('./printers/simple/printTypeAnnotation');
const printTypeofTypeAnnotation = require('./printers/simple/printTypeofTypeAnnotation');
const printTypeParameterDeclaration = require('./printers/simple/printTypeParameterDeclaration');
const printTypeParameterInstantiation = require('./printers/simple/printTypeParameterInstantiation');
const printUnaryExpression = require('./printers/simple/printUnaryExpression');
const printUnionTypeAnnotation = require('./printers/simple/printUnionTypeAnnotation');
const printUpdateExpression = require('./printers/simple/printUpdateExpression');
const printVariableDeclaration = require('./printers/complex/printVariableDeclaration');
const printVariableDeclarator = require('./printers/simple/printVariableDeclarator');
const printVoidTypeAnnotation = require('./printers/simple/printVoidTypeAnnotation');
const printWhileStatement = require('./printers/simple/printWhileStatement');
const printWithStatement = require('./printers/simple/printWithStatement');
const printYieldExpression = require('./printers/simple/printYieldExpression');
const resolveLines = require('./resolvers/resolveLines');
const wrapWithComments = require('./wrappers/complex/wrapWithComments');

/**
 * Entry point into reprint. Parses the source into an AST and then prints it
 * according to the given options.
 */
function reprint(source: string, nullableOptions?: Options): Output {
  const options = nullableOptions || DefaultOptions;
  const ast = babel.parse(source);
  const lines = flatten(printWithWrappers(ast, {
    invalidLeadingComments: getInvalidLeadingComments(ast),
    invalidTrailingComments: getInvalidTrailingComments(ast),
    options: options,
    path: Immutable.List(),
  }));
  return resolveLines(lines, options);
}

/**
 * Helper to build a print function for the given node and context.
 */
function getPrintFn(node: any, context: Context): Print {
  const nextContext = {
    ...context,
    path: context.path.push(node),
  };
  return x => printWithWrappers(x, nextContext);
}

/**
 * Generic print function that will return an array of strings for the given
 * ast node.
 */
function printWithWrappers(node: ?any, context: Context): Lines {
  if (!node) {
    return [];
  }

  const print = getPrintFn(node, context);
  let lines = printWithoutWrappers(node, context);
  lines = wrapWithComments(print, node, context, lines);
  return lines;
}

/**
 * Prints the node ignoring comments.
 */
function printWithoutWrappers(node: ?any, context: Context): Lines {
  if (!node) {
    return [];
  }

  const print = getPrintFn(node, context);

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
