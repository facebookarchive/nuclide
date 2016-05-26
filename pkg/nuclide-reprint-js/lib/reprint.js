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

import DefaultOptions from './options/DefaultOptions';
import Immutable from 'immutable';
import * as babel from 'babel-core';
import flatten from './utils/flatten';
import getInvalidLeadingComments from './utils/getInvalidLeadingComments';
import getInvalidTrailingComments from './utils/getInvalidTrailingComments';
import invariant from 'assert';
import printAnyTypeAnnotation from './printers/simple/printAnyTypeAnnotation';
import printArrayExpression from './printers/simple/printArrayExpression';
import printArrayPattern from './printers/simple/printArrayPattern';
import printArrowFunctionExpression from './printers/simple/printArrowFunctionExpression';
import printAssignmentExpression from './printers/simple/printAssignmentExpression';
import printAssignmentPattern from './printers/simple/printAssignmentPattern';
import printAwaitExpression from './printers/simple/printAwaitExpression';
import printBinaryExpression from './printers/complex/printBinaryExpression';
import printBlockStatement from './printers/simple/printBlockStatement';
import printBooleanLiteralTypeAnnotation from './printers/simple/printBooleanLiteralTypeAnnotation';
import printBooleanTypeAnnotation from './printers/simple/printBooleanTypeAnnotation';
import printBreakStatement from './printers/simple/printBreakStatement';
import printCallExpression from './printers/simple/printCallExpression';
import printCatchClause from './printers/simple/printCatchClause';
import printClassBody from './printers/simple/printClassBody';
import printClassDeclaration from './printers/simple/printClassDeclaration';
import printClassProperty from './printers/simple/printClassProperty';
import printConditionalExpression from './printers/simple/printConditionalExpression';
import printContinueStatement from './printers/simple/printContinueStatement';
import printDebuggerStatement from './printers/simple/printDebuggerStatement';
import printDoWhileStatement from './printers/simple/printDoWhileStatement';
import printEmptyStatement from './printers/simple/printEmptyStatement';
import printExportDefaultDeclaration from './printers/simple/printExportDefaultDeclaration';
import printExportDefaultSpecifier from './printers/simple/printExportDefaultSpecifier';
import printExportNamedDeclaration from './printers/simple/printExportNamedDeclaration';
import printExportNamespaceSpecifier from './printers/simple/printExportNamespaceSpecifier';
import printExportSpecifier from './printers/simple/printExportSpecifier';
import printExpressionStatement from './printers/simple/printExpressionStatement';
import printFile from './printers/simple/printFile';
import printForInStatement from './printers/simple/printForInStatement';
import printForOfStatement from './printers/simple/printForOfStatement';
import printForStatement from './printers/simple/printForStatement';
import printFunctionDeclaration from './printers/simple/printFunctionDeclaration';
import printFunctionExpression from './printers/complex/printFunctionExpression';
import printFunctionTypeAnnotation from './printers/simple/printFunctionTypeAnnotation';
import printFunctionTypeParam from './printers/simple/printFunctionTypeParam';
import printGenericTypeAnnotation from './printers/simple/printGenericTypeAnnotation';
import printIdentifier from './printers/simple/printIdentifier';
import printIfStatement from './printers/simple/printIfStatement';
import printImportDeclaration from './printers/simple/printImportDeclaration';
import printImportDefaultSpecifier from './printers/simple/printImportDefaultSpecifier';
import printImportNamespaceSpecifier from './printers/simple/printImportNamespaceSpecifier';
import printImportSpecifier from './printers/simple/printImportSpecifier';
import printIntersectionTypeAnnotation from './printers/simple/printIntersectionTypeAnnotation';
import printJSXAttribute from './printers/simple/printJSXAttribute';
import printJSXClosingElement from './printers/simple/printJSXClosingElement';
import printJSXElement from './printers/simple/printJSXElement';
import printJSXExpressionContainer from './printers/simple/printJSXExpressionContainer';
import printJSXIdentifier from './printers/simple/printJSXIdentifier';
import printJSXMemberExpression from './printers/simple/printJSXMemberExpression';
import printJSXOpeningElement from './printers/simple/printJSXOpeningElement';
import printJSXSpreadAttribute from './printers/simple/printJSXSpreadAttribute';
import printLabeledStatement from './printers/simple/printLabeledStatement';
import printLiteral from './printers/complex/printLiteral';
import printLogicalExpression from './printers/complex/printLogicalExpression';
import printMemberExpression from './printers/complex/printMemberExpression';
import printMethodDefinition from './printers/simple/printMethodDefinition';
import printMixedTypeAnnotation from './printers/simple/printMixedTypeAnnotation';
import printNewExpression from './printers/simple/printNewExpression';
import printNullableTypeAnnotation from './printers/simple/printNullableTypeAnnotation';
import printNumberLiteralTypeAnnotation from './printers/simple/printNumberLiteralTypeAnnotation';
import printNumberTypeAnnotation from './printers/simple/printNumberTypeAnnotation';
import printObjectExpression from './printers/simple/printObjectExpression';
import printObjectPattern from './printers/simple/printObjectPattern';
import printObjectTypeAnnotation from './printers/simple/printObjectTypeAnnotation';
import printObjectTypeProperty from './printers/simple/printObjectTypeProperty';
import printProgram from './printers/simple/printProgram';
import printProperty from './printers/simple/printProperty';
import printQualifiedTypeIdentifier from './printers/simple/printQualifiedTypeIdentifier';
import printRestElement from './printers/simple/printRestElement';
import printReturnStatement from './printers/simple/printReturnStatement';
import printSpreadElement from './printers/simple/printSpreadElement';
import printSpreadProperty from './printers/simple/printSpreadProperty';
import printStringLiteralTypeAnnotation from './printers/simple/printStringLiteralTypeAnnotation';
import printStringTypeAnnotation from './printers/simple/printStringTypeAnnotation';
import printSuper from './printers/simple/printSuper';
import printSwitchCase from './printers/simple/printSwitchCase';
import printSwitchStatement from './printers/simple/printSwitchStatement';
import printTaggedTemplateExpression from './printers/simple/printTaggedTemplateExpression';
import printTemplateElement from './printers/simple/printTemplateElement';
import printTemplateLiteral from './printers/simple/printTemplateLiteral';
import printThisExpression from './printers/simple/printThisExpression';
import printThrowStatement from './printers/simple/printThrowStatement';
import printTryStatement from './printers/simple/printTryStatement';
import printTupleTypeAnnotation from './printers/simple/printTupleTypeAnnotation';
import printTypeAlias from './printers/simple/printTypeAlias';
import printTypeAnnotation from './printers/simple/printTypeAnnotation';
import printTypeofTypeAnnotation from './printers/simple/printTypeofTypeAnnotation';
import printTypeParameterDeclaration from './printers/simple/printTypeParameterDeclaration';
import printTypeParameterInstantiation from './printers/simple/printTypeParameterInstantiation';
import printUnaryExpression from './printers/simple/printUnaryExpression';
import printUnionTypeAnnotation from './printers/simple/printUnionTypeAnnotation';
import printUpdateExpression from './printers/simple/printUpdateExpression';
import printVariableDeclaration from './printers/complex/printVariableDeclaration';
import printVariableDeclarator from './printers/simple/printVariableDeclarator';
import printVoidTypeAnnotation from './printers/simple/printVoidTypeAnnotation';
import printWhileStatement from './printers/simple/printWhileStatement';
import printWithStatement from './printers/simple/printWithStatement';
import printYieldExpression from './printers/simple/printYieldExpression';
import resolveLines from './resolvers/resolveLines';
import wrapWithComments from './wrappers/complex/wrapWithComments';

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
    options,
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
    /* fallthrough */
    case 'ArrayTypeAnnotation':
    // I think this is a literal within JSXElement's children for certain
    // parsers, but Babylon appears to just use Literal.
    /* fallthrough */
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
