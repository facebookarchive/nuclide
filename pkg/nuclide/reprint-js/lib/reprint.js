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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcHJpbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQWNBLElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQzNELElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFdkMsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzNDLElBQU0seUJBQXlCLEdBQUcsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7QUFDL0UsSUFBTSwwQkFBMEIsR0FBRyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQztBQUNqRixJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEMsSUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsMENBQTBDLENBQUMsQ0FBQztBQUNuRixJQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQy9FLElBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7QUFDekUsSUFBTSw0QkFBNEIsR0FBRyxPQUFPLENBQUMsZ0RBQWdELENBQUMsQ0FBQztBQUMvRixJQUFNLHlCQUF5QixHQUFHLE9BQU8sQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0FBQ3pGLElBQU0sc0JBQXNCLEdBQUcsT0FBTyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7QUFDbkYsSUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsd0NBQXdDLENBQUMsQ0FBQztBQUMvRSxJQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0FBQ2xGLElBQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7QUFDN0UsSUFBTSxpQ0FBaUMsR0FBRyxPQUFPLENBQUMscURBQXFELENBQUMsQ0FBQztBQUN6RyxJQUFNLDBCQUEwQixHQUFHLE9BQU8sQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0FBQzNGLElBQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7QUFDN0UsSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsdUNBQXVDLENBQUMsQ0FBQztBQUM3RSxJQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3ZFLElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0FBQ25FLElBQU0scUJBQXFCLEdBQUcsT0FBTyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7QUFDakYsSUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztBQUMzRSxJQUFNLDBCQUEwQixHQUFHLE9BQU8sQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0FBQzNGLElBQU0sc0JBQXNCLEdBQUcsT0FBTyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7QUFDbkYsSUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsMENBQTBDLENBQUMsQ0FBQztBQUNuRixJQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO0FBQ2pGLElBQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7QUFDN0UsSUFBTSw2QkFBNkIsR0FBRyxPQUFPLENBQUMsaURBQWlELENBQUMsQ0FBQztBQUNqRyxJQUFNLDJCQUEyQixHQUFHLE9BQU8sQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO0FBQzdGLElBQU0sMkJBQTJCLEdBQUcsT0FBTyxDQUFDLCtDQUErQyxDQUFDLENBQUM7QUFDN0YsSUFBTSw2QkFBNkIsR0FBRyxPQUFPLENBQUMsaURBQWlELENBQUMsQ0FBQztBQUNqRyxJQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQy9FLElBQU0sd0JBQXdCLEdBQUcsT0FBTyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7QUFDdkYsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDekQsSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsdUNBQXVDLENBQUMsQ0FBQztBQUM3RSxJQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0FBQzdFLElBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7QUFDekUsSUFBTSx3QkFBd0IsR0FBRyxPQUFPLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUN2RixJQUFNLHVCQUF1QixHQUFHLE9BQU8sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0FBQ3RGLElBQU0sMkJBQTJCLEdBQUcsT0FBTyxDQUFDLCtDQUErQyxDQUFDLENBQUM7QUFDN0YsSUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsMENBQTBDLENBQUMsQ0FBQztBQUNuRixJQUFNLDBCQUEwQixHQUFHLE9BQU8sQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0FBQzNGLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0FBQ3JFLElBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFDdkUsSUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsMENBQTBDLENBQUMsQ0FBQztBQUNuRixJQUFNLDJCQUEyQixHQUFHLE9BQU8sQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO0FBQzdGLElBQU0sNkJBQTZCLEdBQUcsT0FBTyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7QUFDakcsSUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsd0NBQXdDLENBQUMsQ0FBQztBQUMvRSxJQUFNLCtCQUErQixHQUFHLE9BQU8sQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO0FBQ3JHLElBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7QUFDekUsSUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsMENBQTBDLENBQUMsQ0FBQztBQUNuRixJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUNBQW1DLENBQUMsQ0FBQztBQUNyRSxJQUFNLDJCQUEyQixHQUFHLE9BQU8sQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO0FBQzdGLElBQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7QUFDM0UsSUFBTSx3QkFBd0IsR0FBRyxPQUFPLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUN2RixJQUFNLHNCQUFzQixHQUFHLE9BQU8sQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0FBQ25GLElBQU0sdUJBQXVCLEdBQUcsT0FBTyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7QUFDckYsSUFBTSxxQkFBcUIsR0FBRyxPQUFPLENBQUMseUNBQXlDLENBQUMsQ0FBQztBQUNqRixJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQztBQUNoRSxJQUFNLHNCQUFzQixHQUFHLE9BQU8sQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO0FBQ3BGLElBQU0scUJBQXFCLEdBQUcsT0FBTyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7QUFDbEYsSUFBTSxxQkFBcUIsR0FBRyxPQUFPLENBQUMseUNBQXlDLENBQUMsQ0FBQztBQUNqRixJQUFNLHdCQUF3QixHQUFHLE9BQU8sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0FBQ3ZGLElBQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7QUFDM0UsSUFBTSwyQkFBMkIsR0FBRyxPQUFPLENBQUMsK0NBQStDLENBQUMsQ0FBQztBQUM3RixJQUFNLGdDQUFnQyxHQUFHLE9BQU8sQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO0FBQ3ZHLElBQU0seUJBQXlCLEdBQUcsT0FBTyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7QUFDekYsSUFBTSxxQkFBcUIsR0FBRyxPQUFPLENBQUMseUNBQXlDLENBQUMsQ0FBQztBQUNqRixJQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0FBQzNFLElBQU0seUJBQXlCLEdBQUcsT0FBTyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7QUFDekYsSUFBTSx1QkFBdUIsR0FBRyxPQUFPLENBQUMsMkNBQTJDLENBQUMsQ0FBQztBQUNyRixJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUMvRCxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQztBQUNqRSxJQUFNLDRCQUE0QixHQUFHLE9BQU8sQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO0FBQy9GLElBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFDdkUsSUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsd0NBQXdDLENBQUMsQ0FBQztBQUMvRSxJQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0FBQzNFLElBQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7QUFDN0UsSUFBTSxnQ0FBZ0MsR0FBRyxPQUFPLENBQUMsb0RBQW9ELENBQUMsQ0FBQztBQUN2RyxJQUFNLHlCQUF5QixHQUFHLE9BQU8sQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0FBQ3pGLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQzNELElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0FBQ3JFLElBQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7QUFDL0UsSUFBTSw2QkFBNkIsR0FBRyxPQUFPLENBQUMsaURBQWlELENBQUMsQ0FBQztBQUNqRyxJQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQy9FLElBQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7QUFDL0UsSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsdUNBQXVDLENBQUMsQ0FBQztBQUM3RSxJQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0FBQzdFLElBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7QUFDekUsSUFBTSx3QkFBd0IsR0FBRyxPQUFPLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUN2RixJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsa0NBQWtDLENBQUMsQ0FBQztBQUNuRSxJQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0FBQzdFLElBQU0seUJBQXlCLEdBQUcsT0FBTyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7QUFDekYsSUFBTSw2QkFBNkIsR0FBRyxPQUFPLENBQUMsaURBQWlELENBQUMsQ0FBQztBQUNqRyxJQUFNLCtCQUErQixHQUFHLE9BQU8sQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO0FBQ3JHLElBQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7QUFDL0UsSUFBTSx3QkFBd0IsR0FBRyxPQUFPLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUN2RixJQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO0FBQ2pGLElBQU0sd0JBQXdCLEdBQUcsT0FBTyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7QUFDeEYsSUFBTSx1QkFBdUIsR0FBRyxPQUFPLENBQUMsMkNBQTJDLENBQUMsQ0FBQztBQUNyRixJQUFNLHVCQUF1QixHQUFHLE9BQU8sQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO0FBQ3JGLElBQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7QUFDN0UsSUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztBQUMzRSxJQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQy9FLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ3pELElBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7Ozs7OztBQU14RSxTQUFTLE9BQU8sQ0FBQyxNQUFjLEVBQUUsZUFBeUIsRUFBVTtBQUNsRSxNQUFNLE9BQU8sR0FBRyxlQUFlLElBQUksY0FBYyxDQUFDO0FBQ2xELE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtBQUMzQywwQkFBc0IsRUFBRSx5QkFBeUIsQ0FBQyxHQUFHLENBQUM7QUFDdEQsMkJBQXVCLEVBQUUsMEJBQTBCLENBQUMsR0FBRyxDQUFDO0FBQ3hELFdBQU8sRUFBRSxPQUFPO0FBQ2hCLFFBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFO0dBQ3ZCLENBQUMsQ0FBQyxDQUFDO0FBQ0osU0FBTyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ3JDOzs7OztBQUtELFNBQVMsVUFBVSxDQUFDLElBQVMsRUFBRSxPQUFnQixFQUFTO0FBQ3RELE1BQU0sV0FBVyxnQkFDWixPQUFPO0FBQ1YsUUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUM5QixDQUFDO0FBQ0YsU0FBTyxVQUFBLENBQUM7V0FBSSxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDO0dBQUEsQ0FBQztDQUMvQzs7Ozs7O0FBTUQsU0FBUyxpQkFBaUIsQ0FBQyxJQUFVLEVBQUUsT0FBZ0IsRUFBUztBQUM5RCxNQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1QsV0FBTyxFQUFFLENBQUM7R0FDWDs7QUFFRCxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3hDLE1BQUksS0FBSyxHQUFHLG9CQUFvQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoRCxPQUFLLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDdEQsU0FBTyxLQUFLLENBQUM7Q0FDZDs7Ozs7QUFLRCxTQUFTLG9CQUFvQixDQUFDLElBQVUsRUFBRSxPQUFnQixFQUFTO0FBQ2pFLE1BQUksQ0FBQyxJQUFJLEVBQUU7QUFDVCxXQUFPLEVBQUUsQ0FBQztHQUNYOztBQUVELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Ozs7O0FBS3hDLFVBQVEsSUFBSSxDQUFDLElBQUk7QUFDZixTQUFLLGlCQUFpQjtBQUNwQixhQUFPLG9CQUFvQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFBQSxBQUUzQyxTQUFLLGNBQWM7QUFDakIsYUFBTyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFeEMsU0FBSyx5QkFBeUI7QUFDNUIsYUFBTyw0QkFBNEIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFbkQsU0FBSyxzQkFBc0I7QUFDekIsYUFBTyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFaEQsU0FBSyxtQkFBbUI7QUFDdEIsYUFBTyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFN0MsU0FBSyxpQkFBaUI7QUFDcEIsYUFBTyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFM0MsU0FBSyxnQkFBZ0I7QUFDbkIsYUFBTyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFMUMsU0FBSyxnQkFBZ0I7QUFDbkIsYUFBTyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFMUMsU0FBSyxnQkFBZ0I7QUFDbkIsYUFBTyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFMUMsU0FBSyxhQUFhO0FBQ2hCLGFBQU8sZ0JBQWdCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRXZDLFNBQUssV0FBVztBQUNkLGFBQU8sY0FBYyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFBQSxBQUVyQyxTQUFLLGtCQUFrQjtBQUNyQixhQUFPLHFCQUFxQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFBQSxBQUU1QyxTQUFLLGVBQWU7QUFDbEIsYUFBTyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFekMsU0FBSyx1QkFBdUI7QUFDMUIsYUFBTywwQkFBMEIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFakQsU0FBSyxtQkFBbUI7QUFDdEIsYUFBTyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFN0MsU0FBSyxtQkFBbUI7QUFDdEIsYUFBTyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFN0MsU0FBSyxrQkFBa0I7QUFDckIsYUFBTyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFNUMsU0FBSyxnQkFBZ0I7QUFDbkIsYUFBTyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFMUMsU0FBSywwQkFBMEI7QUFDN0IsYUFBTyw2QkFBNkIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFcEQsU0FBSyx3QkFBd0I7QUFDM0IsYUFBTywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFbEQsU0FBSyx3QkFBd0I7QUFDM0IsYUFBTywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFbEQsU0FBSywwQkFBMEI7QUFDN0IsYUFBTyw2QkFBNkIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFcEQsU0FBSyxpQkFBaUI7QUFDcEIsYUFBTyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFM0MsU0FBSyxxQkFBcUI7QUFDeEIsYUFBTyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFL0MsU0FBSyxNQUFNO0FBQ1QsYUFBTyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRWhDLFNBQUssZ0JBQWdCO0FBQ25CLGFBQU8sbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRTFDLFNBQUssZ0JBQWdCO0FBQ25CLGFBQU8sbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRTFDLFNBQUssY0FBYztBQUNqQixhQUFPLGlCQUFpQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFBQSxBQUV4QyxTQUFLLHFCQUFxQjtBQUN4QixhQUFPLHdCQUF3QixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFBQSxBQUUvQyxTQUFLLFlBQVk7QUFDZixhQUFPLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFdEMsU0FBSyxhQUFhO0FBQ2hCLGFBQU8sZ0JBQWdCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRXZDLFNBQUssbUJBQW1CO0FBQ3RCLGFBQU8sc0JBQXNCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRTdDLFNBQUssd0JBQXdCO0FBQzNCLGFBQU8sMkJBQTJCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRWxELFNBQUssMEJBQTBCO0FBQzdCLGFBQU8sNkJBQTZCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRXBELFNBQUssaUJBQWlCO0FBQ3BCLGFBQU8sb0JBQW9CLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRTNDLFNBQUssa0JBQWtCO0FBQ3JCLGFBQU8scUJBQXFCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRTVDLFNBQUssa0JBQWtCO0FBQ3JCLGFBQU8scUJBQXFCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRTVDLFNBQUssZUFBZTtBQUNsQixhQUFPLGtCQUFrQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFBQSxBQUV6QyxTQUFLLGtCQUFrQjtBQUNyQixhQUFPLHFCQUFxQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFBQSxBQUU1QyxTQUFLLGVBQWU7QUFDbEIsYUFBTyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFekMsU0FBSyxTQUFTO0FBQ1osYUFBTyxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRW5DLFNBQUssVUFBVTtBQUNiLGFBQU8sYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFBQSxBQUVwQyxTQUFLLGFBQWE7QUFDaEIsYUFBTyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFdkMsU0FBSyxpQkFBaUI7QUFDcEIsYUFBTyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFM0MsU0FBSyxlQUFlO0FBQ2xCLGFBQU8sa0JBQWtCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRXpDLFNBQUssZ0JBQWdCO0FBQ25CLGFBQU8sbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRTFDLFNBQUssT0FBTztBQUNWLGFBQU8sVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFBQSxBQUVqQyxTQUFLLFlBQVk7QUFDZixhQUFPLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFdEMsU0FBSyxpQkFBaUI7QUFDcEIsYUFBTyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFM0MsU0FBSywwQkFBMEI7QUFDN0IsYUFBTyw2QkFBNkIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFcEQsU0FBSyxpQkFBaUI7QUFDcEIsYUFBTyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFM0MsU0FBSyxpQkFBaUI7QUFDcEIsYUFBTyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFM0MsU0FBSyxnQkFBZ0I7QUFDbkIsYUFBTyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFMUMsU0FBSyxnQkFBZ0I7QUFDbkIsYUFBTyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFMUMsU0FBSyxjQUFjO0FBQ2pCLGFBQU8saUJBQWlCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRXhDLFNBQUssaUJBQWlCO0FBQ3BCLGFBQU8sb0JBQW9CLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRTNDLFNBQUssa0JBQWtCO0FBQ3JCLGFBQU8scUJBQXFCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRTVDLFNBQUssb0JBQW9CO0FBQ3ZCLGFBQU8sdUJBQXVCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRTlDLFNBQUssZ0JBQWdCO0FBQ25CLGFBQU8sbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRTFDLFNBQUssZUFBZTtBQUNsQixhQUFPLGtCQUFrQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFBQSxBQUV6QyxTQUFLLGlCQUFpQjtBQUNwQixhQUFPLG9CQUFvQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUFBLEdBQzVDOzs7OztBQUtELFVBQVEsSUFBSSxDQUFDLElBQUk7QUFDZixTQUFLLGtCQUFrQjtBQUNyQixhQUFPLHFCQUFxQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBQUEsQUFFckQsU0FBSyxvQkFBb0I7QUFDdkIsYUFBTyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUFBLEFBRXZELFNBQUssU0FBUztBQUNaLGFBQU8sWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBQUEsQUFFNUMsU0FBSyxtQkFBbUI7QUFDdEIsYUFBTyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUFBLEFBRXRELFNBQUssa0JBQWtCO0FBQ3JCLGFBQU8scUJBQXFCLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFBQSxBQUVyRCxTQUFLLHFCQUFxQjtBQUN4QixhQUFPLHdCQUF3QixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFBQSxHQUN6RDs7Ozs7QUFLRCxVQUFRLElBQUksQ0FBQyxJQUFJO0FBQ2YsU0FBSyxjQUFjO0FBQ2pCLGFBQU8saUJBQWlCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRXhDLFNBQUssbUJBQW1CO0FBQ3RCLGFBQU8sc0JBQXNCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRTdDLFNBQUssWUFBWTtBQUNmLGFBQU8sZUFBZSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFBQSxBQUV0QyxTQUFLLHdCQUF3QjtBQUMzQixhQUFPLDJCQUEyQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFBQSxBQUVsRCxTQUFLLGVBQWU7QUFDbEIsYUFBTyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFekMsU0FBSyxxQkFBcUI7QUFDeEIsYUFBTyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFL0MsU0FBSyxtQkFBbUI7QUFDdEIsYUFBTyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFN0MsU0FBSyxvQkFBb0I7QUFDdkIsYUFBTyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFBQSxHQUMvQzs7Ozs7QUFLRCxVQUFRLElBQUksQ0FBQyxJQUFJO0FBQ2YsU0FBSyxtQkFBbUI7QUFDdEIsYUFBTyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFN0MsU0FBSyw4QkFBOEI7QUFDakMsYUFBTyxpQ0FBaUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFeEQsU0FBSyx1QkFBdUI7QUFDMUIsYUFBTywwQkFBMEIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFakQsU0FBSyx3QkFBd0I7QUFDM0IsYUFBTywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFbEQsU0FBSyxtQkFBbUI7QUFDdEIsYUFBTyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFN0MsU0FBSyx1QkFBdUI7QUFDMUIsYUFBTywwQkFBMEIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFakQsU0FBSyw0QkFBNEI7QUFDL0IsYUFBTywrQkFBK0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFdEQsU0FBSyxxQkFBcUI7QUFDeEIsYUFBTyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFL0MsU0FBSyx3QkFBd0I7QUFDM0IsYUFBTywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFbEQsU0FBSyw2QkFBNkI7QUFDaEMsYUFBTyxnQ0FBZ0MsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFdkQsU0FBSyxzQkFBc0I7QUFDekIsYUFBTyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFaEQsU0FBSyxzQkFBc0I7QUFDekIsYUFBTyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFaEQsU0FBSyxvQkFBb0I7QUFDdkIsYUFBTyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFOUMsU0FBSyx5QkFBeUI7QUFDNUIsYUFBTyw0QkFBNEIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFbkQsU0FBSyw2QkFBNkI7QUFDaEMsYUFBTyxnQ0FBZ0MsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFdkQsU0FBSyxzQkFBc0I7QUFDekIsYUFBTyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFaEQsU0FBSyxxQkFBcUI7QUFDeEIsYUFBTyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBQUEsQUFFL0MsU0FBSyxXQUFXO0FBQ2QsYUFBTyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRXJDLFNBQUssZ0JBQWdCO0FBQ25CLGFBQU8sbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRTFDLFNBQUssc0JBQXNCO0FBQ3pCLGFBQU8seUJBQXlCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRWhELFNBQUssMEJBQTBCO0FBQzdCLGFBQU8sNkJBQTZCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRXBELFNBQUssNEJBQTRCO0FBQy9CLGFBQU8sK0JBQStCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRXRELFNBQUsscUJBQXFCO0FBQ3hCLGFBQU8sd0JBQXdCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUFBLEFBRS9DLFNBQUssb0JBQW9CO0FBQ3ZCLGFBQU8sdUJBQXVCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQUEsR0FDL0M7Ozs7O0FBS0QsVUFBUSxJQUFJLENBQUMsSUFBSTs7QUFFZixTQUFLLGlCQUFpQixDQUFDO0FBQ3ZCLFNBQUsseUJBQXlCLENBQUM7QUFDL0IsU0FBSyxjQUFjLENBQUM7QUFDcEIsU0FBSyxlQUFlLENBQUM7QUFDckIsU0FBSyxpQkFBaUIsQ0FBQztBQUN2QixTQUFLLHNCQUFzQixDQUFDO0FBQzVCLFNBQUssa0JBQWtCLENBQUM7QUFDeEIsU0FBSyxvQkFBb0IsQ0FBQztBQUMxQixTQUFLLG1CQUFtQixDQUFDO0FBQ3pCLFNBQUssc0JBQXNCLENBQUM7QUFDNUIsU0FBSyxpQkFBaUIsQ0FBQztBQUN2QixTQUFLLHdCQUF3QixDQUFDO0FBQzlCLFNBQUssbUJBQW1CLENBQUM7QUFDekIsU0FBSyxvQkFBb0IsQ0FBQzs7QUFFMUIsU0FBSyxxQkFBcUIsQ0FBQzs7O0FBRzNCLFNBQUssU0FBUztBQUNaLGFBQU8sRUFBRSxDQUFDO0FBQUEsR0FDYjs7Ozs7O0FBTUQsVUFBUSxJQUFJLENBQUMsSUFBSTtBQUNmLFNBQUssaUJBQWlCLENBQUM7QUFDdkIsU0FBSyxvQkFBb0IsQ0FBQztBQUMxQixTQUFLLHlCQUF5QixDQUFDO0FBQy9CLFNBQUsscUJBQXFCLENBQUM7QUFDM0IsU0FBSyxvQkFBb0I7QUFDdkIsYUFBTyxFQUFFLENBQUM7QUFBQSxHQUNiOztBQUVELFdBQVMsQ0FBQyxLQUFLLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3REOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDIiwiZmlsZSI6InJlcHJpbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Q29udGV4dCwgTGluZXMsIE91dHB1dCwgUHJpbnR9IGZyb20gJy4vdHlwZXMvY29tbW9uJztcbmltcG9ydCB0eXBlIE9wdGlvbnMgZnJvbSAnLi9vcHRpb25zL09wdGlvbnMnO1xuXG5jb25zdCBEZWZhdWx0T3B0aW9ucyA9IHJlcXVpcmUoJy4vb3B0aW9ucy9EZWZhdWx0T3B0aW9ucycpO1xuY29uc3QgSW1tdXRhYmxlID0gcmVxdWlyZSgnaW1tdXRhYmxlJyk7XG5cbmNvbnN0IGJhYmVsID0gcmVxdWlyZSgnYmFiZWwtY29yZScpO1xuY29uc3QgZmxhdHRlbiA9IHJlcXVpcmUoJy4vdXRpbHMvZmxhdHRlbicpO1xuY29uc3QgZ2V0SW52YWxpZExlYWRpbmdDb21tZW50cyA9IHJlcXVpcmUoJy4vdXRpbHMvZ2V0SW52YWxpZExlYWRpbmdDb21tZW50cycpO1xuY29uc3QgZ2V0SW52YWxpZFRyYWlsaW5nQ29tbWVudHMgPSByZXF1aXJlKCcuL3V0aWxzL2dldEludmFsaWRUcmFpbGluZ0NvbW1lbnRzJyk7XG5jb25zdCBpbnZhcmlhbnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcbmNvbnN0IHByaW50QW55VHlwZUFubm90YXRpb24gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEFueVR5cGVBbm5vdGF0aW9uJyk7XG5jb25zdCBwcmludEFycmF5RXhwcmVzc2lvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50QXJyYXlFeHByZXNzaW9uJyk7XG5jb25zdCBwcmludEFycmF5UGF0dGVybiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50QXJyYXlQYXR0ZXJuJyk7XG5jb25zdCBwcmludEFycm93RnVuY3Rpb25FeHByZXNzaW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbicpO1xuY29uc3QgcHJpbnRBc3NpZ25tZW50RXhwcmVzc2lvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50QXNzaWdubWVudEV4cHJlc3Npb24nKTtcbmNvbnN0IHByaW50QXNzaWdubWVudFBhdHRlcm4gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEFzc2lnbm1lbnRQYXR0ZXJuJyk7XG5jb25zdCBwcmludEF3YWl0RXhwcmVzc2lvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50QXdhaXRFeHByZXNzaW9uJyk7XG5jb25zdCBwcmludEJpbmFyeUV4cHJlc3Npb24gPSByZXF1aXJlKCcuL3ByaW50ZXJzL2NvbXBsZXgvcHJpbnRCaW5hcnlFeHByZXNzaW9uJyk7XG5jb25zdCBwcmludEJsb2NrU3RhdGVtZW50ID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRCbG9ja1N0YXRlbWVudCcpO1xuY29uc3QgcHJpbnRCb29sZWFuTGl0ZXJhbFR5cGVBbm5vdGF0aW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRCb29sZWFuTGl0ZXJhbFR5cGVBbm5vdGF0aW9uJyk7XG5jb25zdCBwcmludEJvb2xlYW5UeXBlQW5ub3RhdGlvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50Qm9vbGVhblR5cGVBbm5vdGF0aW9uJyk7XG5jb25zdCBwcmludEJyZWFrU3RhdGVtZW50ID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRCcmVha1N0YXRlbWVudCcpO1xuY29uc3QgcHJpbnRDYWxsRXhwcmVzc2lvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50Q2FsbEV4cHJlc3Npb24nKTtcbmNvbnN0IHByaW50Q2F0Y2hDbGF1c2UgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludENhdGNoQ2xhdXNlJyk7XG5jb25zdCBwcmludENsYXNzQm9keSA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50Q2xhc3NCb2R5Jyk7XG5jb25zdCBwcmludENsYXNzRGVjbGFyYXRpb24gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludENsYXNzRGVjbGFyYXRpb24nKTtcbmNvbnN0IHByaW50Q2xhc3NQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50Q2xhc3NQcm9wZXJ0eScpO1xuY29uc3QgcHJpbnRDb25kaXRpb25hbEV4cHJlc3Npb24gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludENvbmRpdGlvbmFsRXhwcmVzc2lvbicpO1xuY29uc3QgcHJpbnRDb250aW51ZVN0YXRlbWVudCA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50Q29udGludWVTdGF0ZW1lbnQnKTtcbmNvbnN0IHByaW50RGVidWdnZXJTdGF0ZW1lbnQgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludERlYnVnZ2VyU3RhdGVtZW50Jyk7XG5jb25zdCBwcmludERvV2hpbGVTdGF0ZW1lbnQgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludERvV2hpbGVTdGF0ZW1lbnQnKTtcbmNvbnN0IHByaW50RW1wdHlTdGF0ZW1lbnQgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEVtcHR5U3RhdGVtZW50Jyk7XG5jb25zdCBwcmludEV4cG9ydERlZmF1bHREZWNsYXJhdGlvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50RXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uJyk7XG5jb25zdCBwcmludEV4cG9ydERlZmF1bHRTcGVjaWZpZXIgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEV4cG9ydERlZmF1bHRTcGVjaWZpZXInKTtcbmNvbnN0IHByaW50RXhwb3J0TmFtZWREZWNsYXJhdGlvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50RXhwb3J0TmFtZWREZWNsYXJhdGlvbicpO1xuY29uc3QgcHJpbnRFeHBvcnROYW1lc3BhY2VTcGVjaWZpZXIgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEV4cG9ydE5hbWVzcGFjZVNwZWNpZmllcicpO1xuY29uc3QgcHJpbnRFeHBvcnRTcGVjaWZpZXIgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEV4cG9ydFNwZWNpZmllcicpO1xuY29uc3QgcHJpbnRFeHByZXNzaW9uU3RhdGVtZW50ID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRFeHByZXNzaW9uU3RhdGVtZW50Jyk7XG5jb25zdCBwcmludEZpbGUgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEZpbGUnKTtcbmNvbnN0IHByaW50Rm9ySW5TdGF0ZW1lbnQgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEZvckluU3RhdGVtZW50Jyk7XG5jb25zdCBwcmludEZvck9mU3RhdGVtZW50ID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRGb3JPZlN0YXRlbWVudCcpO1xuY29uc3QgcHJpbnRGb3JTdGF0ZW1lbnQgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEZvclN0YXRlbWVudCcpO1xuY29uc3QgcHJpbnRGdW5jdGlvbkRlY2xhcmF0aW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRGdW5jdGlvbkRlY2xhcmF0aW9uJyk7XG5jb25zdCBwcmludEZ1bmN0aW9uRXhwcmVzc2lvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvY29tcGxleC9wcmludEZ1bmN0aW9uRXhwcmVzc2lvbicpO1xuY29uc3QgcHJpbnRGdW5jdGlvblR5cGVBbm5vdGF0aW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRGdW5jdGlvblR5cGVBbm5vdGF0aW9uJyk7XG5jb25zdCBwcmludEZ1bmN0aW9uVHlwZVBhcmFtID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRGdW5jdGlvblR5cGVQYXJhbScpO1xuY29uc3QgcHJpbnRHZW5lcmljVHlwZUFubm90YXRpb24gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEdlbmVyaWNUeXBlQW5ub3RhdGlvbicpO1xuY29uc3QgcHJpbnRJZGVudGlmaWVyID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRJZGVudGlmaWVyJyk7XG5jb25zdCBwcmludElmU3RhdGVtZW50ID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRJZlN0YXRlbWVudCcpO1xuY29uc3QgcHJpbnRJbXBvcnREZWNsYXJhdGlvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50SW1wb3J0RGVjbGFyYXRpb24nKTtcbmNvbnN0IHByaW50SW1wb3J0RGVmYXVsdFNwZWNpZmllciA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50SW1wb3J0RGVmYXVsdFNwZWNpZmllcicpO1xuY29uc3QgcHJpbnRJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXIgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEltcG9ydE5hbWVzcGFjZVNwZWNpZmllcicpO1xuY29uc3QgcHJpbnRJbXBvcnRTcGVjaWZpZXIgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEltcG9ydFNwZWNpZmllcicpO1xuY29uc3QgcHJpbnRJbnRlcnNlY3Rpb25UeXBlQW5ub3RhdGlvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50SW50ZXJzZWN0aW9uVHlwZUFubm90YXRpb24nKTtcbmNvbnN0IHByaW50SlNYQXR0cmlidXRlID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRKU1hBdHRyaWJ1dGUnKTtcbmNvbnN0IHByaW50SlNYQ2xvc2luZ0VsZW1lbnQgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEpTWENsb3NpbmdFbGVtZW50Jyk7XG5jb25zdCBwcmludEpTWEVsZW1lbnQgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEpTWEVsZW1lbnQnKTtcbmNvbnN0IHByaW50SlNYRXhwcmVzc2lvbkNvbnRhaW5lciA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50SlNYRXhwcmVzc2lvbkNvbnRhaW5lcicpO1xuY29uc3QgcHJpbnRKU1hJZGVudGlmaWVyID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRKU1hJZGVudGlmaWVyJyk7XG5jb25zdCBwcmludEpTWE1lbWJlckV4cHJlc3Npb24gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEpTWE1lbWJlckV4cHJlc3Npb24nKTtcbmNvbnN0IHByaW50SlNYT3BlbmluZ0VsZW1lbnQgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludEpTWE9wZW5pbmdFbGVtZW50Jyk7XG5jb25zdCBwcmludEpTWFNwcmVhZEF0dHJpYnV0ZSA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50SlNYU3ByZWFkQXR0cmlidXRlJyk7XG5jb25zdCBwcmludExhYmVsZWRTdGF0ZW1lbnQgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludExhYmVsZWRTdGF0ZW1lbnQnKTtcbmNvbnN0IHByaW50TGl0ZXJhbCA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvY29tcGxleC9wcmludExpdGVyYWwnKTtcbmNvbnN0IHByaW50TG9naWNhbEV4cHJlc3Npb24gPSByZXF1aXJlKCcuL3ByaW50ZXJzL2NvbXBsZXgvcHJpbnRMb2dpY2FsRXhwcmVzc2lvbicpO1xuY29uc3QgcHJpbnRNZW1iZXJFeHByZXNzaW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9jb21wbGV4L3ByaW50TWVtYmVyRXhwcmVzc2lvbicpO1xuY29uc3QgcHJpbnRNZXRob2REZWZpbml0aW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRNZXRob2REZWZpbml0aW9uJyk7XG5jb25zdCBwcmludE1peGVkVHlwZUFubm90YXRpb24gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludE1peGVkVHlwZUFubm90YXRpb24nKTtcbmNvbnN0IHByaW50TmV3RXhwcmVzc2lvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50TmV3RXhwcmVzc2lvbicpO1xuY29uc3QgcHJpbnROdWxsYWJsZVR5cGVBbm5vdGF0aW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnROdWxsYWJsZVR5cGVBbm5vdGF0aW9uJyk7XG5jb25zdCBwcmludE51bWJlckxpdGVyYWxUeXBlQW5ub3RhdGlvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50TnVtYmVyTGl0ZXJhbFR5cGVBbm5vdGF0aW9uJyk7XG5jb25zdCBwcmludE51bWJlclR5cGVBbm5vdGF0aW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnROdW1iZXJUeXBlQW5ub3RhdGlvbicpO1xuY29uc3QgcHJpbnRPYmplY3RFeHByZXNzaW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRPYmplY3RFeHByZXNzaW9uJyk7XG5jb25zdCBwcmludE9iamVjdFBhdHRlcm4gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludE9iamVjdFBhdHRlcm4nKTtcbmNvbnN0IHByaW50T2JqZWN0VHlwZUFubm90YXRpb24gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludE9iamVjdFR5cGVBbm5vdGF0aW9uJyk7XG5jb25zdCBwcmludE9iamVjdFR5cGVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50T2JqZWN0VHlwZVByb3BlcnR5Jyk7XG5jb25zdCBwcmludFByb2dyYW0gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludFByb2dyYW0nKTtcbmNvbnN0IHByaW50UHJvcGVydHkgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludFByb3BlcnR5Jyk7XG5jb25zdCBwcmludFF1YWxpZmllZFR5cGVJZGVudGlmaWVyID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRRdWFsaWZpZWRUeXBlSWRlbnRpZmllcicpO1xuY29uc3QgcHJpbnRSZXN0RWxlbWVudCA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50UmVzdEVsZW1lbnQnKTtcbmNvbnN0IHByaW50UmV0dXJuU3RhdGVtZW50ID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRSZXR1cm5TdGF0ZW1lbnQnKTtcbmNvbnN0IHByaW50U3ByZWFkRWxlbWVudCA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50U3ByZWFkRWxlbWVudCcpO1xuY29uc3QgcHJpbnRTcHJlYWRQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50U3ByZWFkUHJvcGVydHknKTtcbmNvbnN0IHByaW50U3RyaW5nTGl0ZXJhbFR5cGVBbm5vdGF0aW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRTdHJpbmdMaXRlcmFsVHlwZUFubm90YXRpb24nKTtcbmNvbnN0IHByaW50U3RyaW5nVHlwZUFubm90YXRpb24gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludFN0cmluZ1R5cGVBbm5vdGF0aW9uJyk7XG5jb25zdCBwcmludFN1cGVyID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRTdXBlcicpO1xuY29uc3QgcHJpbnRTd2l0Y2hDYXNlID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRTd2l0Y2hDYXNlJyk7XG5jb25zdCBwcmludFN3aXRjaFN0YXRlbWVudCA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50U3dpdGNoU3RhdGVtZW50Jyk7XG5jb25zdCBwcmludFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50VGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uJyk7XG5jb25zdCBwcmludFRlbXBsYXRlRWxlbWVudCA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50VGVtcGxhdGVFbGVtZW50Jyk7XG5jb25zdCBwcmludFRlbXBsYXRlTGl0ZXJhbCA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50VGVtcGxhdGVMaXRlcmFsJyk7XG5jb25zdCBwcmludFRoaXNFeHByZXNzaW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRUaGlzRXhwcmVzc2lvbicpO1xuY29uc3QgcHJpbnRUaHJvd1N0YXRlbWVudCA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50VGhyb3dTdGF0ZW1lbnQnKTtcbmNvbnN0IHByaW50VHJ5U3RhdGVtZW50ID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRUcnlTdGF0ZW1lbnQnKTtcbmNvbnN0IHByaW50VHVwbGVUeXBlQW5ub3RhdGlvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50VHVwbGVUeXBlQW5ub3RhdGlvbicpO1xuY29uc3QgcHJpbnRUeXBlQWxpYXMgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludFR5cGVBbGlhcycpO1xuY29uc3QgcHJpbnRUeXBlQW5ub3RhdGlvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50VHlwZUFubm90YXRpb24nKTtcbmNvbnN0IHByaW50VHlwZW9mVHlwZUFubm90YXRpb24gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludFR5cGVvZlR5cGVBbm5vdGF0aW9uJyk7XG5jb25zdCBwcmludFR5cGVQYXJhbWV0ZXJEZWNsYXJhdGlvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvc2ltcGxlL3ByaW50VHlwZVBhcmFtZXRlckRlY2xhcmF0aW9uJyk7XG5jb25zdCBwcmludFR5cGVQYXJhbWV0ZXJJbnN0YW50aWF0aW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRUeXBlUGFyYW1ldGVySW5zdGFudGlhdGlvbicpO1xuY29uc3QgcHJpbnRVbmFyeUV4cHJlc3Npb24gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludFVuYXJ5RXhwcmVzc2lvbicpO1xuY29uc3QgcHJpbnRVbmlvblR5cGVBbm5vdGF0aW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRVbmlvblR5cGVBbm5vdGF0aW9uJyk7XG5jb25zdCBwcmludFVwZGF0ZUV4cHJlc3Npb24gPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludFVwZGF0ZUV4cHJlc3Npb24nKTtcbmNvbnN0IHByaW50VmFyaWFibGVEZWNsYXJhdGlvbiA9IHJlcXVpcmUoJy4vcHJpbnRlcnMvY29tcGxleC9wcmludFZhcmlhYmxlRGVjbGFyYXRpb24nKTtcbmNvbnN0IHByaW50VmFyaWFibGVEZWNsYXJhdG9yID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRWYXJpYWJsZURlY2xhcmF0b3InKTtcbmNvbnN0IHByaW50Vm9pZFR5cGVBbm5vdGF0aW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRWb2lkVHlwZUFubm90YXRpb24nKTtcbmNvbnN0IHByaW50V2hpbGVTdGF0ZW1lbnQgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludFdoaWxlU3RhdGVtZW50Jyk7XG5jb25zdCBwcmludFdpdGhTdGF0ZW1lbnQgPSByZXF1aXJlKCcuL3ByaW50ZXJzL3NpbXBsZS9wcmludFdpdGhTdGF0ZW1lbnQnKTtcbmNvbnN0IHByaW50WWllbGRFeHByZXNzaW9uID0gcmVxdWlyZSgnLi9wcmludGVycy9zaW1wbGUvcHJpbnRZaWVsZEV4cHJlc3Npb24nKTtcbmNvbnN0IHJlc29sdmVMaW5lcyA9IHJlcXVpcmUoJy4vcmVzb2x2ZXJzL3Jlc29sdmVMaW5lcycpO1xuY29uc3Qgd3JhcFdpdGhDb21tZW50cyA9IHJlcXVpcmUoJy4vd3JhcHBlcnMvY29tcGxleC93cmFwV2l0aENvbW1lbnRzJyk7XG5cbi8qKlxuICogRW50cnkgcG9pbnQgaW50byByZXByaW50LiBQYXJzZXMgdGhlIHNvdXJjZSBpbnRvIGFuIEFTVCBhbmQgdGhlbiBwcmludHMgaXRcbiAqIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAqL1xuZnVuY3Rpb24gcmVwcmludChzb3VyY2U6IHN0cmluZywgbnVsbGFibGVPcHRpb25zPzogT3B0aW9ucyk6IE91dHB1dCB7XG4gIGNvbnN0IG9wdGlvbnMgPSBudWxsYWJsZU9wdGlvbnMgfHwgRGVmYXVsdE9wdGlvbnM7XG4gIGNvbnN0IGFzdCA9IGJhYmVsLnBhcnNlKHNvdXJjZSk7XG4gIGNvbnN0IGxpbmVzID0gZmxhdHRlbihwcmludFdpdGhXcmFwcGVycyhhc3QsIHtcbiAgICBpbnZhbGlkTGVhZGluZ0NvbW1lbnRzOiBnZXRJbnZhbGlkTGVhZGluZ0NvbW1lbnRzKGFzdCksXG4gICAgaW52YWxpZFRyYWlsaW5nQ29tbWVudHM6IGdldEludmFsaWRUcmFpbGluZ0NvbW1lbnRzKGFzdCksXG4gICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICBwYXRoOiBJbW11dGFibGUuTGlzdCgpLFxuICB9KSk7XG4gIHJldHVybiByZXNvbHZlTGluZXMobGluZXMsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIEhlbHBlciB0byBidWlsZCBhIHByaW50IGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gbm9kZSBhbmQgY29udGV4dC5cbiAqL1xuZnVuY3Rpb24gZ2V0UHJpbnRGbihub2RlOiBhbnksIGNvbnRleHQ6IENvbnRleHQpOiBQcmludCB7XG4gIGNvbnN0IG5leHRDb250ZXh0ID0ge1xuICAgIC4uLmNvbnRleHQsXG4gICAgcGF0aDogY29udGV4dC5wYXRoLnB1c2gobm9kZSksXG4gIH07XG4gIHJldHVybiB4ID0+IHByaW50V2l0aFdyYXBwZXJzKHgsIG5leHRDb250ZXh0KTtcbn1cblxuLyoqXG4gKiBHZW5lcmljIHByaW50IGZ1bmN0aW9uIHRoYXQgd2lsbCByZXR1cm4gYW4gYXJyYXkgb2Ygc3RyaW5ncyBmb3IgdGhlIGdpdmVuXG4gKiBhc3Qgbm9kZS5cbiAqL1xuZnVuY3Rpb24gcHJpbnRXaXRoV3JhcHBlcnMobm9kZTogP2FueSwgY29udGV4dDogQ29udGV4dCk6IExpbmVzIHtcbiAgaWYgKCFub2RlKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29uc3QgcHJpbnQgPSBnZXRQcmludEZuKG5vZGUsIGNvbnRleHQpO1xuICBsZXQgbGluZXMgPSBwcmludFdpdGhvdXRXcmFwcGVycyhub2RlLCBjb250ZXh0KTtcbiAgbGluZXMgPSB3cmFwV2l0aENvbW1lbnRzKHByaW50LCBub2RlLCBjb250ZXh0LCBsaW5lcyk7XG4gIHJldHVybiBsaW5lcztcbn1cblxuLyoqXG4gKiBQcmludHMgdGhlIG5vZGUgaWdub3JpbmcgY29tbWVudHMuXG4gKi9cbmZ1bmN0aW9uIHByaW50V2l0aG91dFdyYXBwZXJzKG5vZGU6ID9hbnksIGNvbnRleHQ6IENvbnRleHQpOiBMaW5lcyB7XG4gIGlmICghbm9kZSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGNvbnN0IHByaW50ID0gZ2V0UHJpbnRGbihub2RlLCBjb250ZXh0KTtcblxuICAvKipcbiAgICogU2ltcGxlIHByaW50ZXJzLlxuICAgKi9cbiAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICBjYXNlICdBcnJheUV4cHJlc3Npb24nOlxuICAgICAgcmV0dXJuIHByaW50QXJyYXlFeHByZXNzaW9uKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0FycmF5UGF0dGVybic6XG4gICAgICByZXR1cm4gcHJpbnRBcnJheVBhdHRlcm4ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24nOlxuICAgICAgcmV0dXJuIHByaW50QXJyb3dGdW5jdGlvbkV4cHJlc3Npb24ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnQXNzaWdubWVudEV4cHJlc3Npb24nOlxuICAgICAgcmV0dXJuIHByaW50QXNzaWdubWVudEV4cHJlc3Npb24ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnQXNzaWdubWVudFBhdHRlcm4nOlxuICAgICAgcmV0dXJuIHByaW50QXNzaWdubWVudFBhdHRlcm4ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnQXdhaXRFeHByZXNzaW9uJzpcbiAgICAgIHJldHVybiBwcmludEF3YWl0RXhwcmVzc2lvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdCbG9ja1N0YXRlbWVudCc6XG4gICAgICByZXR1cm4gcHJpbnRCbG9ja1N0YXRlbWVudChwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdCcmVha1N0YXRlbWVudCc6XG4gICAgICByZXR1cm4gcHJpbnRCcmVha1N0YXRlbWVudChwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdDYWxsRXhwcmVzc2lvbic6XG4gICAgICByZXR1cm4gcHJpbnRDYWxsRXhwcmVzc2lvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdDYXRjaENsYXVzZSc6XG4gICAgICByZXR1cm4gcHJpbnRDYXRjaENsYXVzZShwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdDbGFzc0JvZHknOlxuICAgICAgcmV0dXJuIHByaW50Q2xhc3NCb2R5KHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0NsYXNzRGVjbGFyYXRpb24nOlxuICAgICAgcmV0dXJuIHByaW50Q2xhc3NEZWNsYXJhdGlvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdDbGFzc1Byb3BlcnR5JzpcbiAgICAgIHJldHVybiBwcmludENsYXNzUHJvcGVydHkocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnQ29uZGl0aW9uYWxFeHByZXNzaW9uJzpcbiAgICAgIHJldHVybiBwcmludENvbmRpdGlvbmFsRXhwcmVzc2lvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdDb250aW51ZVN0YXRlbWVudCc6XG4gICAgICByZXR1cm4gcHJpbnRDb250aW51ZVN0YXRlbWVudChwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdEZWJ1Z2dlclN0YXRlbWVudCc6XG4gICAgICByZXR1cm4gcHJpbnREZWJ1Z2dlclN0YXRlbWVudChwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdEb1doaWxlU3RhdGVtZW50JzpcbiAgICAgIHJldHVybiBwcmludERvV2hpbGVTdGF0ZW1lbnQocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnRW1wdHlTdGF0ZW1lbnQnOlxuICAgICAgcmV0dXJuIHByaW50RW1wdHlTdGF0ZW1lbnQocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uJzpcbiAgICAgIHJldHVybiBwcmludEV4cG9ydERlZmF1bHREZWNsYXJhdGlvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdFeHBvcnREZWZhdWx0U3BlY2lmaWVyJzpcbiAgICAgIHJldHVybiBwcmludEV4cG9ydERlZmF1bHRTcGVjaWZpZXIocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbic6XG4gICAgICByZXR1cm4gcHJpbnRFeHBvcnROYW1lZERlY2xhcmF0aW9uKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0V4cG9ydE5hbWVzcGFjZVNwZWNpZmllcic6XG4gICAgICByZXR1cm4gcHJpbnRFeHBvcnROYW1lc3BhY2VTcGVjaWZpZXIocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnRXhwb3J0U3BlY2lmaWVyJzpcbiAgICAgIHJldHVybiBwcmludEV4cG9ydFNwZWNpZmllcihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdFeHByZXNzaW9uU3RhdGVtZW50JzpcbiAgICAgIHJldHVybiBwcmludEV4cHJlc3Npb25TdGF0ZW1lbnQocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnRmlsZSc6XG4gICAgICByZXR1cm4gcHJpbnRGaWxlKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0ZvckluU3RhdGVtZW50JzpcbiAgICAgIHJldHVybiBwcmludEZvckluU3RhdGVtZW50KHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0Zvck9mU3RhdGVtZW50JzpcbiAgICAgIHJldHVybiBwcmludEZvck9mU3RhdGVtZW50KHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0ZvclN0YXRlbWVudCc6XG4gICAgICByZXR1cm4gcHJpbnRGb3JTdGF0ZW1lbnQocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnRnVuY3Rpb25EZWNsYXJhdGlvbic6XG4gICAgICByZXR1cm4gcHJpbnRGdW5jdGlvbkRlY2xhcmF0aW9uKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0lkZW50aWZpZXInOlxuICAgICAgcmV0dXJuIHByaW50SWRlbnRpZmllcihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdJZlN0YXRlbWVudCc6XG4gICAgICByZXR1cm4gcHJpbnRJZlN0YXRlbWVudChwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdJbXBvcnREZWNsYXJhdGlvbic6XG4gICAgICByZXR1cm4gcHJpbnRJbXBvcnREZWNsYXJhdGlvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJzpcbiAgICAgIHJldHVybiBwcmludEltcG9ydERlZmF1bHRTcGVjaWZpZXIocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyJzpcbiAgICAgIHJldHVybiBwcmludEltcG9ydE5hbWVzcGFjZVNwZWNpZmllcihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdJbXBvcnRTcGVjaWZpZXInOlxuICAgICAgcmV0dXJuIHByaW50SW1wb3J0U3BlY2lmaWVyKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0xhYmVsZWRTdGF0ZW1lbnQnOlxuICAgICAgcmV0dXJuIHByaW50TGFiZWxlZFN0YXRlbWVudChwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdNZXRob2REZWZpbml0aW9uJzpcbiAgICAgIHJldHVybiBwcmludE1ldGhvZERlZmluaXRpb24ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnTmV3RXhwcmVzc2lvbic6XG4gICAgICByZXR1cm4gcHJpbnROZXdFeHByZXNzaW9uKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ09iamVjdEV4cHJlc3Npb24nOlxuICAgICAgcmV0dXJuIHByaW50T2JqZWN0RXhwcmVzc2lvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdPYmplY3RQYXR0ZXJuJzpcbiAgICAgIHJldHVybiBwcmludE9iamVjdFBhdHRlcm4ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnUHJvZ3JhbSc6XG4gICAgICByZXR1cm4gcHJpbnRQcm9ncmFtKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ1Byb3BlcnR5JzpcbiAgICAgIHJldHVybiBwcmludFByb3BlcnR5KHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ1Jlc3RFbGVtZW50JzpcbiAgICAgIHJldHVybiBwcmludFJlc3RFbGVtZW50KHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ1JldHVyblN0YXRlbWVudCc6XG4gICAgICByZXR1cm4gcHJpbnRSZXR1cm5TdGF0ZW1lbnQocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnU3ByZWFkRWxlbWVudCc6XG4gICAgICByZXR1cm4gcHJpbnRTcHJlYWRFbGVtZW50KHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ1NwcmVhZFByb3BlcnR5JzpcbiAgICAgIHJldHVybiBwcmludFNwcmVhZFByb3BlcnR5KHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ1N1cGVyJzpcbiAgICAgIHJldHVybiBwcmludFN1cGVyKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ1N3aXRjaENhc2UnOlxuICAgICAgcmV0dXJuIHByaW50U3dpdGNoQ2FzZShwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdTd2l0Y2hTdGF0ZW1lbnQnOlxuICAgICAgcmV0dXJuIHByaW50U3dpdGNoU3RhdGVtZW50KHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ1RhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbic6XG4gICAgICByZXR1cm4gcHJpbnRUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnVGVtcGxhdGVFbGVtZW50JzpcbiAgICAgIHJldHVybiBwcmludFRlbXBsYXRlRWxlbWVudChwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdUZW1wbGF0ZUxpdGVyYWwnOlxuICAgICAgcmV0dXJuIHByaW50VGVtcGxhdGVMaXRlcmFsKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ1RoaXNFeHByZXNzaW9uJzpcbiAgICAgIHJldHVybiBwcmludFRoaXNFeHByZXNzaW9uKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ1Rocm93U3RhdGVtZW50JzpcbiAgICAgIHJldHVybiBwcmludFRocm93U3RhdGVtZW50KHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ1RyeVN0YXRlbWVudCc6XG4gICAgICByZXR1cm4gcHJpbnRUcnlTdGF0ZW1lbnQocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnVW5hcnlFeHByZXNzaW9uJzpcbiAgICAgIHJldHVybiBwcmludFVuYXJ5RXhwcmVzc2lvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdVcGRhdGVFeHByZXNzaW9uJzpcbiAgICAgIHJldHVybiBwcmludFVwZGF0ZUV4cHJlc3Npb24ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnVmFyaWFibGVEZWNsYXJhdG9yJzpcbiAgICAgIHJldHVybiBwcmludFZhcmlhYmxlRGVjbGFyYXRvcihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdXaGlsZVN0YXRlbWVudCc6XG4gICAgICByZXR1cm4gcHJpbnRXaGlsZVN0YXRlbWVudChwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdXaXRoU3RhdGVtZW50JzpcbiAgICAgIHJldHVybiBwcmludFdpdGhTdGF0ZW1lbnQocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnWWllbGRFeHByZXNzaW9uJzpcbiAgICAgIHJldHVybiBwcmludFlpZWxkRXhwcmVzc2lvbihwcmludCwgbm9kZSk7XG4gIH1cblxuICAvKipcbiAgICogQ29tcGxleCBwcmludGVycyAtLSBtZWFuaW5nIHRoZXkgcmVxdWlyZSBjb250ZXh0LlxuICAgKi9cbiAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICBjYXNlICdCaW5hcnlFeHByZXNzaW9uJzpcbiAgICAgIHJldHVybiBwcmludEJpbmFyeUV4cHJlc3Npb24ocHJpbnQsIG5vZGUsIGNvbnRleHQpO1xuXG4gICAgY2FzZSAnRnVuY3Rpb25FeHByZXNzaW9uJzpcbiAgICAgIHJldHVybiBwcmludEZ1bmN0aW9uRXhwcmVzc2lvbihwcmludCwgbm9kZSwgY29udGV4dCk7XG5cbiAgICBjYXNlICdMaXRlcmFsJzpcbiAgICAgIHJldHVybiBwcmludExpdGVyYWwocHJpbnQsIG5vZGUsIGNvbnRleHQpO1xuXG4gICAgY2FzZSAnTG9naWNhbEV4cHJlc3Npb24nOlxuICAgICAgcmV0dXJuIHByaW50TG9naWNhbEV4cHJlc3Npb24ocHJpbnQsIG5vZGUsIGNvbnRleHQpO1xuXG4gICAgY2FzZSAnTWVtYmVyRXhwcmVzc2lvbic6XG4gICAgICByZXR1cm4gcHJpbnRNZW1iZXJFeHByZXNzaW9uKHByaW50LCBub2RlLCBjb250ZXh0KTtcblxuICAgIGNhc2UgJ1ZhcmlhYmxlRGVjbGFyYXRpb24nOlxuICAgICAgcmV0dXJuIHByaW50VmFyaWFibGVEZWNsYXJhdGlvbihwcmludCwgbm9kZSwgY29udGV4dCk7XG4gIH1cblxuICAvKipcbiAgICogSlNYIE5vZGVzXG4gICAqL1xuICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgIGNhc2UgJ0pTWEF0dHJpYnV0ZSc6XG4gICAgICByZXR1cm4gcHJpbnRKU1hBdHRyaWJ1dGUocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnSlNYQ2xvc2luZ0VsZW1lbnQnOlxuICAgICAgcmV0dXJuIHByaW50SlNYQ2xvc2luZ0VsZW1lbnQocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnSlNYRWxlbWVudCc6XG4gICAgICByZXR1cm4gcHJpbnRKU1hFbGVtZW50KHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0pTWEV4cHJlc3Npb25Db250YWluZXInOlxuICAgICAgcmV0dXJuIHByaW50SlNYRXhwcmVzc2lvbkNvbnRhaW5lcihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdKU1hJZGVudGlmaWVyJzpcbiAgICAgIHJldHVybiBwcmludEpTWElkZW50aWZpZXIocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnSlNYTWVtYmVyRXhwcmVzc2lvbic6XG4gICAgICByZXR1cm4gcHJpbnRKU1hNZW1iZXJFeHByZXNzaW9uKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0pTWE9wZW5pbmdFbGVtZW50JzpcbiAgICAgIHJldHVybiBwcmludEpTWE9wZW5pbmdFbGVtZW50KHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0pTWFNwcmVhZEF0dHJpYnV0ZSc6XG4gICAgICByZXR1cm4gcHJpbnRKU1hTcHJlYWRBdHRyaWJ1dGUocHJpbnQsIG5vZGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZsb3cgdHlwZXMuXG4gICAqL1xuICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgIGNhc2UgJ0FueVR5cGVBbm5vdGF0aW9uJzpcbiAgICAgIHJldHVybiBwcmludEFueVR5cGVBbm5vdGF0aW9uKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0Jvb2xlYW5MaXRlcmFsVHlwZUFubm90YXRpb24nOlxuICAgICAgcmV0dXJuIHByaW50Qm9vbGVhbkxpdGVyYWxUeXBlQW5ub3RhdGlvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdCb29sZWFuVHlwZUFubm90YXRpb24nOlxuICAgICAgcmV0dXJuIHByaW50Qm9vbGVhblR5cGVBbm5vdGF0aW9uKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0Z1bmN0aW9uVHlwZUFubm90YXRpb24nOlxuICAgICAgcmV0dXJuIHByaW50RnVuY3Rpb25UeXBlQW5ub3RhdGlvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdGdW5jdGlvblR5cGVQYXJhbSc6XG4gICAgICByZXR1cm4gcHJpbnRGdW5jdGlvblR5cGVQYXJhbShwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdHZW5lcmljVHlwZUFubm90YXRpb24nOlxuICAgICAgcmV0dXJuIHByaW50R2VuZXJpY1R5cGVBbm5vdGF0aW9uKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ0ludGVyc2VjdGlvblR5cGVBbm5vdGF0aW9uJzpcbiAgICAgIHJldHVybiBwcmludEludGVyc2VjdGlvblR5cGVBbm5vdGF0aW9uKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ01peGVkVHlwZUFubm90YXRpb24nOlxuICAgICAgcmV0dXJuIHByaW50TWl4ZWRUeXBlQW5ub3RhdGlvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdOdWxsYWJsZVR5cGVBbm5vdGF0aW9uJzpcbiAgICAgIHJldHVybiBwcmludE51bGxhYmxlVHlwZUFubm90YXRpb24ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnTnVtYmVyTGl0ZXJhbFR5cGVBbm5vdGF0aW9uJzpcbiAgICAgIHJldHVybiBwcmludE51bWJlckxpdGVyYWxUeXBlQW5ub3RhdGlvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdOdW1iZXJUeXBlQW5ub3RhdGlvbic6XG4gICAgICByZXR1cm4gcHJpbnROdW1iZXJUeXBlQW5ub3RhdGlvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdPYmplY3RUeXBlQW5ub3RhdGlvbic6XG4gICAgICByZXR1cm4gcHJpbnRPYmplY3RUeXBlQW5ub3RhdGlvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdPYmplY3RUeXBlUHJvcGVydHknOlxuICAgICAgcmV0dXJuIHByaW50T2JqZWN0VHlwZVByb3BlcnR5KHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ1F1YWxpZmllZFR5cGVJZGVudGlmaWVyJzpcbiAgICAgIHJldHVybiBwcmludFF1YWxpZmllZFR5cGVJZGVudGlmaWVyKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ1N0cmluZ0xpdGVyYWxUeXBlQW5ub3RhdGlvbic6XG4gICAgICByZXR1cm4gcHJpbnRTdHJpbmdMaXRlcmFsVHlwZUFubm90YXRpb24ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnU3RyaW5nVHlwZUFubm90YXRpb24nOlxuICAgICAgcmV0dXJuIHByaW50U3RyaW5nVHlwZUFubm90YXRpb24ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnVHVwbGVUeXBlQW5ub3RhdGlvbic6XG4gICAgICByZXR1cm4gcHJpbnRUdXBsZVR5cGVBbm5vdGF0aW9uKHByaW50LCBub2RlKTtcblxuICAgIGNhc2UgJ1R5cGVBbGlhcyc6XG4gICAgICByZXR1cm4gcHJpbnRUeXBlQWxpYXMocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnVHlwZUFubm90YXRpb24nOlxuICAgICAgcmV0dXJuIHByaW50VHlwZUFubm90YXRpb24ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnVHlwZW9mVHlwZUFubm90YXRpb24nOlxuICAgICAgcmV0dXJuIHByaW50VHlwZW9mVHlwZUFubm90YXRpb24ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnVHlwZVBhcmFtZXRlckRlY2xhcmF0aW9uJzpcbiAgICAgIHJldHVybiBwcmludFR5cGVQYXJhbWV0ZXJEZWNsYXJhdGlvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdUeXBlUGFyYW1ldGVySW5zdGFudGlhdGlvbic6XG4gICAgICByZXR1cm4gcHJpbnRUeXBlUGFyYW1ldGVySW5zdGFudGlhdGlvbihwcmludCwgbm9kZSk7XG5cbiAgICBjYXNlICdVbmlvblR5cGVBbm5vdGF0aW9uJzpcbiAgICAgIHJldHVybiBwcmludFVuaW9uVHlwZUFubm90YXRpb24ocHJpbnQsIG5vZGUpO1xuXG4gICAgY2FzZSAnVm9pZFR5cGVBbm5vdGF0aW9uJzpcbiAgICAgIHJldHVybiBwcmludFZvaWRUeXBlQW5ub3RhdGlvbihwcmludCwgbm9kZSk7XG4gIH1cblxuICAvKipcbiAgICogSSdtIG5vdCBzdXJlIHdoYXQgdGhlc2UgYXJlLiBJIG5lZWQgdG8gZmlndXJlIHRoYXQgb3V0IGFuZCBpbXBsZW1lbnQgdGhlbSFcbiAgICovXG4gIHN3aXRjaCAobm9kZS50eXBlKSB7XG4gICAgLy8gTm90IHN1cmUgaG93IHRvIGNyZWF0ZSBhbnkgb2YgdGhlc2UuXG4gICAgY2FzZSAnQ2xhc3NFeHByZXNzaW9uJzpcbiAgICBjYXNlICdDbGFzc1Byb3BlcnR5RGVmaW5pdGlvbic6XG4gICAgY2FzZSAnRGVjbGFyZUNsYXNzJzpcbiAgICBjYXNlICdEZWNsYXJlTW9kdWxlJzpcbiAgICBjYXNlICdEZWNsYXJlVmFyaWFibGUnOlxuICAgIGNhc2UgJ0ludGVyZmFjZURlY2xhcmF0aW9uJzpcbiAgICBjYXNlICdJbnRlcmZhY2VFeHRlbmRzJzpcbiAgICBjYXNlICdKU1hFbXB0eUV4cHJlc3Npb24nOlxuICAgIGNhc2UgJ0pTWE5hbWVzcGFjZWROYW1lJzpcbiAgICBjYXNlICdNZW1iZXJUeXBlQW5ub3RhdGlvbic6XG4gICAgY2FzZSAnTW9kdWxlU3BlY2lmaWVyJzpcbiAgICBjYXNlICdPYmplY3RUeXBlQ2FsbFByb3BlcnR5JzpcbiAgICBjYXNlICdPYmplY3RUeXBlSW5kZXhlcic6XG4gICAgY2FzZSAnVHlwZUNhc2VFeHByZXNzaW9uJzpcbiAgICAvLyBJIGJlbGlldmUgdGhpcyBpcyBub3cgcmVwbGFjZWQgd2l0aCBUdXBsZVR5cGVBbm5vdGF0aW9uOiBbc3RyaW5nXS5cbiAgICBjYXNlICdBcnJheVR5cGVBbm5vdGF0aW9uJzpcbiAgICAvLyBJIHRoaW5rIHRoaXMgaXMgYSBsaXRlcmFsIHdpdGhpbiBKU1hFbGVtZW50J3MgY2hpbGRyZW4gZm9yIGNlcnRhaW5cbiAgICAvLyBwYXJzZXJzLCBidXQgQmFieWxvbiBhcHBlYXJzIHRvIGp1c3QgdXNlIExpdGVyYWwuXG4gICAgY2FzZSAnSlNYVGV4dCc6XG4gICAgICByZXR1cm4gW107XG4gIH1cblxuICAvKipcbiAgICogV2hhdCB0aGVzZSBub2RlcyBkbyBpcyBub3Qgd2VsbCBkZWZpbmVkLiBUaGV5IG1heSBiZSBzdGFnZSAwIHByb3Bvc2FscyBmb3JcbiAgICogZXhhbXBsZS5cbiAgICovXG4gIHN3aXRjaCAobm9kZS50eXBlKSB7XG4gICAgY2FzZSAnQ2xhc3NJbXBsZW1lbnRzJzpcbiAgICBjYXNlICdDb21wcmVoZW5zaW9uQmxvY2snOlxuICAgIGNhc2UgJ0NvbXByZWhlbnNpb25FeHByZXNzaW9uJzpcbiAgICBjYXNlICdHZW5lcmF0b3JFeHByZXNzaW9uJzpcbiAgICBjYXNlICdTZXF1ZW5jZUV4cHJlc3Npb24nOlxuICAgICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgaW52YXJpYW50KGZhbHNlLCAnVW5rbm93biBub2RlIHR5cGU6ICVzJywgbm9kZS50eXBlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZXByaW50O1xuIl19