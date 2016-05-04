var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _optionsDefaultOptions = require('./options/DefaultOptions');

var _optionsDefaultOptions2 = _interopRequireDefault(_optionsDefaultOptions);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _babelCore = require('babel-core');

var babel = _interopRequireWildcard(_babelCore);

var _utilsFlatten = require('./utils/flatten');

var _utilsFlatten2 = _interopRequireDefault(_utilsFlatten);

var _utilsGetInvalidLeadingComments = require('./utils/getInvalidLeadingComments');

var _utilsGetInvalidLeadingComments2 = _interopRequireDefault(_utilsGetInvalidLeadingComments);

var _utilsGetInvalidTrailingComments = require('./utils/getInvalidTrailingComments');

var _utilsGetInvalidTrailingComments2 = _interopRequireDefault(_utilsGetInvalidTrailingComments);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _printersSimplePrintAnyTypeAnnotation = require('./printers/simple/printAnyTypeAnnotation');

var _printersSimplePrintAnyTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintAnyTypeAnnotation);

var _printersSimplePrintArrayExpression = require('./printers/simple/printArrayExpression');

var _printersSimplePrintArrayExpression2 = _interopRequireDefault(_printersSimplePrintArrayExpression);

var _printersSimplePrintArrayPattern = require('./printers/simple/printArrayPattern');

var _printersSimplePrintArrayPattern2 = _interopRequireDefault(_printersSimplePrintArrayPattern);

var _printersSimplePrintArrowFunctionExpression = require('./printers/simple/printArrowFunctionExpression');

var _printersSimplePrintArrowFunctionExpression2 = _interopRequireDefault(_printersSimplePrintArrowFunctionExpression);

var _printersSimplePrintAssignmentExpression = require('./printers/simple/printAssignmentExpression');

var _printersSimplePrintAssignmentExpression2 = _interopRequireDefault(_printersSimplePrintAssignmentExpression);

var _printersSimplePrintAssignmentPattern = require('./printers/simple/printAssignmentPattern');

var _printersSimplePrintAssignmentPattern2 = _interopRequireDefault(_printersSimplePrintAssignmentPattern);

var _printersSimplePrintAwaitExpression = require('./printers/simple/printAwaitExpression');

var _printersSimplePrintAwaitExpression2 = _interopRequireDefault(_printersSimplePrintAwaitExpression);

var _printersComplexPrintBinaryExpression = require('./printers/complex/printBinaryExpression');

var _printersComplexPrintBinaryExpression2 = _interopRequireDefault(_printersComplexPrintBinaryExpression);

var _printersSimplePrintBlockStatement = require('./printers/simple/printBlockStatement');

var _printersSimplePrintBlockStatement2 = _interopRequireDefault(_printersSimplePrintBlockStatement);

var _printersSimplePrintBooleanLiteralTypeAnnotation = require('./printers/simple/printBooleanLiteralTypeAnnotation');

var _printersSimplePrintBooleanLiteralTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintBooleanLiteralTypeAnnotation);

var _printersSimplePrintBooleanTypeAnnotation = require('./printers/simple/printBooleanTypeAnnotation');

var _printersSimplePrintBooleanTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintBooleanTypeAnnotation);

var _printersSimplePrintBreakStatement = require('./printers/simple/printBreakStatement');

var _printersSimplePrintBreakStatement2 = _interopRequireDefault(_printersSimplePrintBreakStatement);

var _printersSimplePrintCallExpression = require('./printers/simple/printCallExpression');

var _printersSimplePrintCallExpression2 = _interopRequireDefault(_printersSimplePrintCallExpression);

var _printersSimplePrintCatchClause = require('./printers/simple/printCatchClause');

var _printersSimplePrintCatchClause2 = _interopRequireDefault(_printersSimplePrintCatchClause);

var _printersSimplePrintClassBody = require('./printers/simple/printClassBody');

var _printersSimplePrintClassBody2 = _interopRequireDefault(_printersSimplePrintClassBody);

var _printersSimplePrintClassDeclaration = require('./printers/simple/printClassDeclaration');

var _printersSimplePrintClassDeclaration2 = _interopRequireDefault(_printersSimplePrintClassDeclaration);

var _printersSimplePrintClassProperty = require('./printers/simple/printClassProperty');

var _printersSimplePrintClassProperty2 = _interopRequireDefault(_printersSimplePrintClassProperty);

var _printersSimplePrintConditionalExpression = require('./printers/simple/printConditionalExpression');

var _printersSimplePrintConditionalExpression2 = _interopRequireDefault(_printersSimplePrintConditionalExpression);

var _printersSimplePrintContinueStatement = require('./printers/simple/printContinueStatement');

var _printersSimplePrintContinueStatement2 = _interopRequireDefault(_printersSimplePrintContinueStatement);

var _printersSimplePrintDebuggerStatement = require('./printers/simple/printDebuggerStatement');

var _printersSimplePrintDebuggerStatement2 = _interopRequireDefault(_printersSimplePrintDebuggerStatement);

var _printersSimplePrintDoWhileStatement = require('./printers/simple/printDoWhileStatement');

var _printersSimplePrintDoWhileStatement2 = _interopRequireDefault(_printersSimplePrintDoWhileStatement);

var _printersSimplePrintEmptyStatement = require('./printers/simple/printEmptyStatement');

var _printersSimplePrintEmptyStatement2 = _interopRequireDefault(_printersSimplePrintEmptyStatement);

var _printersSimplePrintExportDefaultDeclaration = require('./printers/simple/printExportDefaultDeclaration');

var _printersSimplePrintExportDefaultDeclaration2 = _interopRequireDefault(_printersSimplePrintExportDefaultDeclaration);

var _printersSimplePrintExportDefaultSpecifier = require('./printers/simple/printExportDefaultSpecifier');

var _printersSimplePrintExportDefaultSpecifier2 = _interopRequireDefault(_printersSimplePrintExportDefaultSpecifier);

var _printersSimplePrintExportNamedDeclaration = require('./printers/simple/printExportNamedDeclaration');

var _printersSimplePrintExportNamedDeclaration2 = _interopRequireDefault(_printersSimplePrintExportNamedDeclaration);

var _printersSimplePrintExportNamespaceSpecifier = require('./printers/simple/printExportNamespaceSpecifier');

var _printersSimplePrintExportNamespaceSpecifier2 = _interopRequireDefault(_printersSimplePrintExportNamespaceSpecifier);

var _printersSimplePrintExportSpecifier = require('./printers/simple/printExportSpecifier');

var _printersSimplePrintExportSpecifier2 = _interopRequireDefault(_printersSimplePrintExportSpecifier);

var _printersSimplePrintExpressionStatement = require('./printers/simple/printExpressionStatement');

var _printersSimplePrintExpressionStatement2 = _interopRequireDefault(_printersSimplePrintExpressionStatement);

var _printersSimplePrintFile = require('./printers/simple/printFile');

var _printersSimplePrintFile2 = _interopRequireDefault(_printersSimplePrintFile);

var _printersSimplePrintForInStatement = require('./printers/simple/printForInStatement');

var _printersSimplePrintForInStatement2 = _interopRequireDefault(_printersSimplePrintForInStatement);

var _printersSimplePrintForOfStatement = require('./printers/simple/printForOfStatement');

var _printersSimplePrintForOfStatement2 = _interopRequireDefault(_printersSimplePrintForOfStatement);

var _printersSimplePrintForStatement = require('./printers/simple/printForStatement');

var _printersSimplePrintForStatement2 = _interopRequireDefault(_printersSimplePrintForStatement);

var _printersSimplePrintFunctionDeclaration = require('./printers/simple/printFunctionDeclaration');

var _printersSimplePrintFunctionDeclaration2 = _interopRequireDefault(_printersSimplePrintFunctionDeclaration);

var _printersComplexPrintFunctionExpression = require('./printers/complex/printFunctionExpression');

var _printersComplexPrintFunctionExpression2 = _interopRequireDefault(_printersComplexPrintFunctionExpression);

var _printersSimplePrintFunctionTypeAnnotation = require('./printers/simple/printFunctionTypeAnnotation');

var _printersSimplePrintFunctionTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintFunctionTypeAnnotation);

var _printersSimplePrintFunctionTypeParam = require('./printers/simple/printFunctionTypeParam');

var _printersSimplePrintFunctionTypeParam2 = _interopRequireDefault(_printersSimplePrintFunctionTypeParam);

var _printersSimplePrintGenericTypeAnnotation = require('./printers/simple/printGenericTypeAnnotation');

var _printersSimplePrintGenericTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintGenericTypeAnnotation);

var _printersSimplePrintIdentifier = require('./printers/simple/printIdentifier');

var _printersSimplePrintIdentifier2 = _interopRequireDefault(_printersSimplePrintIdentifier);

var _printersSimplePrintIfStatement = require('./printers/simple/printIfStatement');

var _printersSimplePrintIfStatement2 = _interopRequireDefault(_printersSimplePrintIfStatement);

var _printersSimplePrintImportDeclaration = require('./printers/simple/printImportDeclaration');

var _printersSimplePrintImportDeclaration2 = _interopRequireDefault(_printersSimplePrintImportDeclaration);

var _printersSimplePrintImportDefaultSpecifier = require('./printers/simple/printImportDefaultSpecifier');

var _printersSimplePrintImportDefaultSpecifier2 = _interopRequireDefault(_printersSimplePrintImportDefaultSpecifier);

var _printersSimplePrintImportNamespaceSpecifier = require('./printers/simple/printImportNamespaceSpecifier');

var _printersSimplePrintImportNamespaceSpecifier2 = _interopRequireDefault(_printersSimplePrintImportNamespaceSpecifier);

var _printersSimplePrintImportSpecifier = require('./printers/simple/printImportSpecifier');

var _printersSimplePrintImportSpecifier2 = _interopRequireDefault(_printersSimplePrintImportSpecifier);

var _printersSimplePrintIntersectionTypeAnnotation = require('./printers/simple/printIntersectionTypeAnnotation');

var _printersSimplePrintIntersectionTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintIntersectionTypeAnnotation);

var _printersSimplePrintJSXAttribute = require('./printers/simple/printJSXAttribute');

var _printersSimplePrintJSXAttribute2 = _interopRequireDefault(_printersSimplePrintJSXAttribute);

var _printersSimplePrintJSXClosingElement = require('./printers/simple/printJSXClosingElement');

var _printersSimplePrintJSXClosingElement2 = _interopRequireDefault(_printersSimplePrintJSXClosingElement);

var _printersSimplePrintJSXElement = require('./printers/simple/printJSXElement');

var _printersSimplePrintJSXElement2 = _interopRequireDefault(_printersSimplePrintJSXElement);

var _printersSimplePrintJSXExpressionContainer = require('./printers/simple/printJSXExpressionContainer');

var _printersSimplePrintJSXExpressionContainer2 = _interopRequireDefault(_printersSimplePrintJSXExpressionContainer);

var _printersSimplePrintJSXIdentifier = require('./printers/simple/printJSXIdentifier');

var _printersSimplePrintJSXIdentifier2 = _interopRequireDefault(_printersSimplePrintJSXIdentifier);

var _printersSimplePrintJSXMemberExpression = require('./printers/simple/printJSXMemberExpression');

var _printersSimplePrintJSXMemberExpression2 = _interopRequireDefault(_printersSimplePrintJSXMemberExpression);

var _printersSimplePrintJSXOpeningElement = require('./printers/simple/printJSXOpeningElement');

var _printersSimplePrintJSXOpeningElement2 = _interopRequireDefault(_printersSimplePrintJSXOpeningElement);

var _printersSimplePrintJSXSpreadAttribute = require('./printers/simple/printJSXSpreadAttribute');

var _printersSimplePrintJSXSpreadAttribute2 = _interopRequireDefault(_printersSimplePrintJSXSpreadAttribute);

var _printersSimplePrintLabeledStatement = require('./printers/simple/printLabeledStatement');

var _printersSimplePrintLabeledStatement2 = _interopRequireDefault(_printersSimplePrintLabeledStatement);

var _printersComplexPrintLiteral = require('./printers/complex/printLiteral');

var _printersComplexPrintLiteral2 = _interopRequireDefault(_printersComplexPrintLiteral);

var _printersComplexPrintLogicalExpression = require('./printers/complex/printLogicalExpression');

var _printersComplexPrintLogicalExpression2 = _interopRequireDefault(_printersComplexPrintLogicalExpression);

var _printersComplexPrintMemberExpression = require('./printers/complex/printMemberExpression');

var _printersComplexPrintMemberExpression2 = _interopRequireDefault(_printersComplexPrintMemberExpression);

var _printersSimplePrintMethodDefinition = require('./printers/simple/printMethodDefinition');

var _printersSimplePrintMethodDefinition2 = _interopRequireDefault(_printersSimplePrintMethodDefinition);

var _printersSimplePrintMixedTypeAnnotation = require('./printers/simple/printMixedTypeAnnotation');

var _printersSimplePrintMixedTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintMixedTypeAnnotation);

var _printersSimplePrintNewExpression = require('./printers/simple/printNewExpression');

var _printersSimplePrintNewExpression2 = _interopRequireDefault(_printersSimplePrintNewExpression);

var _printersSimplePrintNullableTypeAnnotation = require('./printers/simple/printNullableTypeAnnotation');

var _printersSimplePrintNullableTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintNullableTypeAnnotation);

var _printersSimplePrintNumberLiteralTypeAnnotation = require('./printers/simple/printNumberLiteralTypeAnnotation');

var _printersSimplePrintNumberLiteralTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintNumberLiteralTypeAnnotation);

var _printersSimplePrintNumberTypeAnnotation = require('./printers/simple/printNumberTypeAnnotation');

var _printersSimplePrintNumberTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintNumberTypeAnnotation);

var _printersSimplePrintObjectExpression = require('./printers/simple/printObjectExpression');

var _printersSimplePrintObjectExpression2 = _interopRequireDefault(_printersSimplePrintObjectExpression);

var _printersSimplePrintObjectPattern = require('./printers/simple/printObjectPattern');

var _printersSimplePrintObjectPattern2 = _interopRequireDefault(_printersSimplePrintObjectPattern);

var _printersSimplePrintObjectTypeAnnotation = require('./printers/simple/printObjectTypeAnnotation');

var _printersSimplePrintObjectTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintObjectTypeAnnotation);

var _printersSimplePrintObjectTypeProperty = require('./printers/simple/printObjectTypeProperty');

var _printersSimplePrintObjectTypeProperty2 = _interopRequireDefault(_printersSimplePrintObjectTypeProperty);

var _printersSimplePrintProgram = require('./printers/simple/printProgram');

var _printersSimplePrintProgram2 = _interopRequireDefault(_printersSimplePrintProgram);

var _printersSimplePrintProperty = require('./printers/simple/printProperty');

var _printersSimplePrintProperty2 = _interopRequireDefault(_printersSimplePrintProperty);

var _printersSimplePrintQualifiedTypeIdentifier = require('./printers/simple/printQualifiedTypeIdentifier');

var _printersSimplePrintQualifiedTypeIdentifier2 = _interopRequireDefault(_printersSimplePrintQualifiedTypeIdentifier);

var _printersSimplePrintRestElement = require('./printers/simple/printRestElement');

var _printersSimplePrintRestElement2 = _interopRequireDefault(_printersSimplePrintRestElement);

var _printersSimplePrintReturnStatement = require('./printers/simple/printReturnStatement');

var _printersSimplePrintReturnStatement2 = _interopRequireDefault(_printersSimplePrintReturnStatement);

var _printersSimplePrintSpreadElement = require('./printers/simple/printSpreadElement');

var _printersSimplePrintSpreadElement2 = _interopRequireDefault(_printersSimplePrintSpreadElement);

var _printersSimplePrintSpreadProperty = require('./printers/simple/printSpreadProperty');

var _printersSimplePrintSpreadProperty2 = _interopRequireDefault(_printersSimplePrintSpreadProperty);

var _printersSimplePrintStringLiteralTypeAnnotation = require('./printers/simple/printStringLiteralTypeAnnotation');

var _printersSimplePrintStringLiteralTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintStringLiteralTypeAnnotation);

var _printersSimplePrintStringTypeAnnotation = require('./printers/simple/printStringTypeAnnotation');

var _printersSimplePrintStringTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintStringTypeAnnotation);

var _printersSimplePrintSuper = require('./printers/simple/printSuper');

var _printersSimplePrintSuper2 = _interopRequireDefault(_printersSimplePrintSuper);

var _printersSimplePrintSwitchCase = require('./printers/simple/printSwitchCase');

var _printersSimplePrintSwitchCase2 = _interopRequireDefault(_printersSimplePrintSwitchCase);

var _printersSimplePrintSwitchStatement = require('./printers/simple/printSwitchStatement');

var _printersSimplePrintSwitchStatement2 = _interopRequireDefault(_printersSimplePrintSwitchStatement);

var _printersSimplePrintTaggedTemplateExpression = require('./printers/simple/printTaggedTemplateExpression');

var _printersSimplePrintTaggedTemplateExpression2 = _interopRequireDefault(_printersSimplePrintTaggedTemplateExpression);

var _printersSimplePrintTemplateElement = require('./printers/simple/printTemplateElement');

var _printersSimplePrintTemplateElement2 = _interopRequireDefault(_printersSimplePrintTemplateElement);

var _printersSimplePrintTemplateLiteral = require('./printers/simple/printTemplateLiteral');

var _printersSimplePrintTemplateLiteral2 = _interopRequireDefault(_printersSimplePrintTemplateLiteral);

var _printersSimplePrintThisExpression = require('./printers/simple/printThisExpression');

var _printersSimplePrintThisExpression2 = _interopRequireDefault(_printersSimplePrintThisExpression);

var _printersSimplePrintThrowStatement = require('./printers/simple/printThrowStatement');

var _printersSimplePrintThrowStatement2 = _interopRequireDefault(_printersSimplePrintThrowStatement);

var _printersSimplePrintTryStatement = require('./printers/simple/printTryStatement');

var _printersSimplePrintTryStatement2 = _interopRequireDefault(_printersSimplePrintTryStatement);

var _printersSimplePrintTupleTypeAnnotation = require('./printers/simple/printTupleTypeAnnotation');

var _printersSimplePrintTupleTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintTupleTypeAnnotation);

var _printersSimplePrintTypeAlias = require('./printers/simple/printTypeAlias');

var _printersSimplePrintTypeAlias2 = _interopRequireDefault(_printersSimplePrintTypeAlias);

var _printersSimplePrintTypeAnnotation = require('./printers/simple/printTypeAnnotation');

var _printersSimplePrintTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintTypeAnnotation);

var _printersSimplePrintTypeofTypeAnnotation = require('./printers/simple/printTypeofTypeAnnotation');

var _printersSimplePrintTypeofTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintTypeofTypeAnnotation);

var _printersSimplePrintTypeParameterDeclaration = require('./printers/simple/printTypeParameterDeclaration');

var _printersSimplePrintTypeParameterDeclaration2 = _interopRequireDefault(_printersSimplePrintTypeParameterDeclaration);

var _printersSimplePrintTypeParameterInstantiation = require('./printers/simple/printTypeParameterInstantiation');

var _printersSimplePrintTypeParameterInstantiation2 = _interopRequireDefault(_printersSimplePrintTypeParameterInstantiation);

var _printersSimplePrintUnaryExpression = require('./printers/simple/printUnaryExpression');

var _printersSimplePrintUnaryExpression2 = _interopRequireDefault(_printersSimplePrintUnaryExpression);

var _printersSimplePrintUnionTypeAnnotation = require('./printers/simple/printUnionTypeAnnotation');

var _printersSimplePrintUnionTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintUnionTypeAnnotation);

var _printersSimplePrintUpdateExpression = require('./printers/simple/printUpdateExpression');

var _printersSimplePrintUpdateExpression2 = _interopRequireDefault(_printersSimplePrintUpdateExpression);

var _printersComplexPrintVariableDeclaration = require('./printers/complex/printVariableDeclaration');

var _printersComplexPrintVariableDeclaration2 = _interopRequireDefault(_printersComplexPrintVariableDeclaration);

var _printersSimplePrintVariableDeclarator = require('./printers/simple/printVariableDeclarator');

var _printersSimplePrintVariableDeclarator2 = _interopRequireDefault(_printersSimplePrintVariableDeclarator);

var _printersSimplePrintVoidTypeAnnotation = require('./printers/simple/printVoidTypeAnnotation');

var _printersSimplePrintVoidTypeAnnotation2 = _interopRequireDefault(_printersSimplePrintVoidTypeAnnotation);

var _printersSimplePrintWhileStatement = require('./printers/simple/printWhileStatement');

var _printersSimplePrintWhileStatement2 = _interopRequireDefault(_printersSimplePrintWhileStatement);

var _printersSimplePrintWithStatement = require('./printers/simple/printWithStatement');

var _printersSimplePrintWithStatement2 = _interopRequireDefault(_printersSimplePrintWithStatement);

var _printersSimplePrintYieldExpression = require('./printers/simple/printYieldExpression');

var _printersSimplePrintYieldExpression2 = _interopRequireDefault(_printersSimplePrintYieldExpression);

var _resolversResolveLines = require('./resolvers/resolveLines');

var _resolversResolveLines2 = _interopRequireDefault(_resolversResolveLines);

var _wrappersComplexWrapWithComments = require('./wrappers/complex/wrapWithComments');

var _wrappersComplexWrapWithComments2 = _interopRequireDefault(_wrappersComplexWrapWithComments);

/**
 * Entry point into reprint. Parses the source into an AST and then prints it
 * according to the given options.
 */
function reprint(source, nullableOptions) {
  var options = nullableOptions || _optionsDefaultOptions2.default;
  var ast = babel.parse(source);
  var lines = (0, _utilsFlatten2.default)(printWithWrappers(ast, {
    invalidLeadingComments: (0, _utilsGetInvalidLeadingComments2.default)(ast),
    invalidTrailingComments: (0, _utilsGetInvalidTrailingComments2.default)(ast),
    options: options,
    path: _immutable2.default.List()
  }));
  return (0, _resolversResolveLines2.default)(lines, options);
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
  lines = (0, _wrappersComplexWrapWithComments2.default)(print, node, context, lines);
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
      return (0, _printersSimplePrintArrayExpression2.default)(print, node);

    case 'ArrayPattern':
      return (0, _printersSimplePrintArrayPattern2.default)(print, node);

    case 'ArrowFunctionExpression':
      return (0, _printersSimplePrintArrowFunctionExpression2.default)(print, node);

    case 'AssignmentExpression':
      return (0, _printersSimplePrintAssignmentExpression2.default)(print, node);

    case 'AssignmentPattern':
      return (0, _printersSimplePrintAssignmentPattern2.default)(print, node);

    case 'AwaitExpression':
      return (0, _printersSimplePrintAwaitExpression2.default)(print, node);

    case 'BlockStatement':
      return (0, _printersSimplePrintBlockStatement2.default)(print, node);

    case 'BreakStatement':
      return (0, _printersSimplePrintBreakStatement2.default)(print, node);

    case 'CallExpression':
      return (0, _printersSimplePrintCallExpression2.default)(print, node);

    case 'CatchClause':
      return (0, _printersSimplePrintCatchClause2.default)(print, node);

    case 'ClassBody':
      return (0, _printersSimplePrintClassBody2.default)(print, node);

    case 'ClassDeclaration':
      return (0, _printersSimplePrintClassDeclaration2.default)(print, node);

    case 'ClassProperty':
      return (0, _printersSimplePrintClassProperty2.default)(print, node);

    case 'ConditionalExpression':
      return (0, _printersSimplePrintConditionalExpression2.default)(print, node);

    case 'ContinueStatement':
      return (0, _printersSimplePrintContinueStatement2.default)(print, node);

    case 'DebuggerStatement':
      return (0, _printersSimplePrintDebuggerStatement2.default)(print, node);

    case 'DoWhileStatement':
      return (0, _printersSimplePrintDoWhileStatement2.default)(print, node);

    case 'EmptyStatement':
      return (0, _printersSimplePrintEmptyStatement2.default)(print, node);

    case 'ExportDefaultDeclaration':
      return (0, _printersSimplePrintExportDefaultDeclaration2.default)(print, node);

    case 'ExportDefaultSpecifier':
      return (0, _printersSimplePrintExportDefaultSpecifier2.default)(print, node);

    case 'ExportNamedDeclaration':
      return (0, _printersSimplePrintExportNamedDeclaration2.default)(print, node);

    case 'ExportNamespaceSpecifier':
      return (0, _printersSimplePrintExportNamespaceSpecifier2.default)(print, node);

    case 'ExportSpecifier':
      return (0, _printersSimplePrintExportSpecifier2.default)(print, node);

    case 'ExpressionStatement':
      return (0, _printersSimplePrintExpressionStatement2.default)(print, node);

    case 'File':
      return (0, _printersSimplePrintFile2.default)(print, node);

    case 'ForInStatement':
      return (0, _printersSimplePrintForInStatement2.default)(print, node);

    case 'ForOfStatement':
      return (0, _printersSimplePrintForOfStatement2.default)(print, node);

    case 'ForStatement':
      return (0, _printersSimplePrintForStatement2.default)(print, node);

    case 'FunctionDeclaration':
      return (0, _printersSimplePrintFunctionDeclaration2.default)(print, node);

    case 'Identifier':
      return (0, _printersSimplePrintIdentifier2.default)(print, node);

    case 'IfStatement':
      return (0, _printersSimplePrintIfStatement2.default)(print, node);

    case 'ImportDeclaration':
      return (0, _printersSimplePrintImportDeclaration2.default)(print, node);

    case 'ImportDefaultSpecifier':
      return (0, _printersSimplePrintImportDefaultSpecifier2.default)(print, node);

    case 'ImportNamespaceSpecifier':
      return (0, _printersSimplePrintImportNamespaceSpecifier2.default)(print, node);

    case 'ImportSpecifier':
      return (0, _printersSimplePrintImportSpecifier2.default)(print, node);

    case 'LabeledStatement':
      return (0, _printersSimplePrintLabeledStatement2.default)(print, node);

    case 'MethodDefinition':
      return (0, _printersSimplePrintMethodDefinition2.default)(print, node);

    case 'NewExpression':
      return (0, _printersSimplePrintNewExpression2.default)(print, node);

    case 'ObjectExpression':
      return (0, _printersSimplePrintObjectExpression2.default)(print, node);

    case 'ObjectPattern':
      return (0, _printersSimplePrintObjectPattern2.default)(print, node);

    case 'Program':
      return (0, _printersSimplePrintProgram2.default)(print, node);

    case 'Property':
      return (0, _printersSimplePrintProperty2.default)(print, node);

    case 'RestElement':
      return (0, _printersSimplePrintRestElement2.default)(print, node);

    case 'ReturnStatement':
      return (0, _printersSimplePrintReturnStatement2.default)(print, node);

    case 'SpreadElement':
      return (0, _printersSimplePrintSpreadElement2.default)(print, node);

    case 'SpreadProperty':
      return (0, _printersSimplePrintSpreadProperty2.default)(print, node);

    case 'Super':
      return (0, _printersSimplePrintSuper2.default)(print, node);

    case 'SwitchCase':
      return (0, _printersSimplePrintSwitchCase2.default)(print, node);

    case 'SwitchStatement':
      return (0, _printersSimplePrintSwitchStatement2.default)(print, node);

    case 'TaggedTemplateExpression':
      return (0, _printersSimplePrintTaggedTemplateExpression2.default)(print, node);

    case 'TemplateElement':
      return (0, _printersSimplePrintTemplateElement2.default)(print, node);

    case 'TemplateLiteral':
      return (0, _printersSimplePrintTemplateLiteral2.default)(print, node);

    case 'ThisExpression':
      return (0, _printersSimplePrintThisExpression2.default)(print, node);

    case 'ThrowStatement':
      return (0, _printersSimplePrintThrowStatement2.default)(print, node);

    case 'TryStatement':
      return (0, _printersSimplePrintTryStatement2.default)(print, node);

    case 'UnaryExpression':
      return (0, _printersSimplePrintUnaryExpression2.default)(print, node);

    case 'UpdateExpression':
      return (0, _printersSimplePrintUpdateExpression2.default)(print, node);

    case 'VariableDeclarator':
      return (0, _printersSimplePrintVariableDeclarator2.default)(print, node);

    case 'WhileStatement':
      return (0, _printersSimplePrintWhileStatement2.default)(print, node);

    case 'WithStatement':
      return (0, _printersSimplePrintWithStatement2.default)(print, node);

    case 'YieldExpression':
      return (0, _printersSimplePrintYieldExpression2.default)(print, node);
  }

  /**
   * Complex printers -- meaning they require context.
   */
  switch (node.type) {
    case 'BinaryExpression':
      return (0, _printersComplexPrintBinaryExpression2.default)(print, node, context);

    case 'FunctionExpression':
      return (0, _printersComplexPrintFunctionExpression2.default)(print, node, context);

    case 'Literal':
      return (0, _printersComplexPrintLiteral2.default)(print, node, context);

    case 'LogicalExpression':
      return (0, _printersComplexPrintLogicalExpression2.default)(print, node, context);

    case 'MemberExpression':
      return (0, _printersComplexPrintMemberExpression2.default)(print, node, context);

    case 'VariableDeclaration':
      return (0, _printersComplexPrintVariableDeclaration2.default)(print, node, context);
  }

  /**
   * JSX Nodes
   */
  switch (node.type) {
    case 'JSXAttribute':
      return (0, _printersSimplePrintJSXAttribute2.default)(print, node);

    case 'JSXClosingElement':
      return (0, _printersSimplePrintJSXClosingElement2.default)(print, node);

    case 'JSXElement':
      return (0, _printersSimplePrintJSXElement2.default)(print, node);

    case 'JSXExpressionContainer':
      return (0, _printersSimplePrintJSXExpressionContainer2.default)(print, node);

    case 'JSXIdentifier':
      return (0, _printersSimplePrintJSXIdentifier2.default)(print, node);

    case 'JSXMemberExpression':
      return (0, _printersSimplePrintJSXMemberExpression2.default)(print, node);

    case 'JSXOpeningElement':
      return (0, _printersSimplePrintJSXOpeningElement2.default)(print, node);

    case 'JSXSpreadAttribute':
      return (0, _printersSimplePrintJSXSpreadAttribute2.default)(print, node);
  }

  /**
   * Flow types.
   */
  switch (node.type) {
    case 'AnyTypeAnnotation':
      return (0, _printersSimplePrintAnyTypeAnnotation2.default)(print, node);

    case 'BooleanLiteralTypeAnnotation':
      return (0, _printersSimplePrintBooleanLiteralTypeAnnotation2.default)(print, node);

    case 'BooleanTypeAnnotation':
      return (0, _printersSimplePrintBooleanTypeAnnotation2.default)(print, node);

    case 'FunctionTypeAnnotation':
      return (0, _printersSimplePrintFunctionTypeAnnotation2.default)(print, node);

    case 'FunctionTypeParam':
      return (0, _printersSimplePrintFunctionTypeParam2.default)(print, node);

    case 'GenericTypeAnnotation':
      return (0, _printersSimplePrintGenericTypeAnnotation2.default)(print, node);

    case 'IntersectionTypeAnnotation':
      return (0, _printersSimplePrintIntersectionTypeAnnotation2.default)(print, node);

    case 'MixedTypeAnnotation':
      return (0, _printersSimplePrintMixedTypeAnnotation2.default)(print, node);

    case 'NullableTypeAnnotation':
      return (0, _printersSimplePrintNullableTypeAnnotation2.default)(print, node);

    case 'NumberLiteralTypeAnnotation':
      return (0, _printersSimplePrintNumberLiteralTypeAnnotation2.default)(print, node);

    case 'NumberTypeAnnotation':
      return (0, _printersSimplePrintNumberTypeAnnotation2.default)(print, node);

    case 'ObjectTypeAnnotation':
      return (0, _printersSimplePrintObjectTypeAnnotation2.default)(print, node);

    case 'ObjectTypeProperty':
      return (0, _printersSimplePrintObjectTypeProperty2.default)(print, node);

    case 'QualifiedTypeIdentifier':
      return (0, _printersSimplePrintQualifiedTypeIdentifier2.default)(print, node);

    case 'StringLiteralTypeAnnotation':
      return (0, _printersSimplePrintStringLiteralTypeAnnotation2.default)(print, node);

    case 'StringTypeAnnotation':
      return (0, _printersSimplePrintStringTypeAnnotation2.default)(print, node);

    case 'TupleTypeAnnotation':
      return (0, _printersSimplePrintTupleTypeAnnotation2.default)(print, node);

    case 'TypeAlias':
      return (0, _printersSimplePrintTypeAlias2.default)(print, node);

    case 'TypeAnnotation':
      return (0, _printersSimplePrintTypeAnnotation2.default)(print, node);

    case 'TypeofTypeAnnotation':
      return (0, _printersSimplePrintTypeofTypeAnnotation2.default)(print, node);

    case 'TypeParameterDeclaration':
      return (0, _printersSimplePrintTypeParameterDeclaration2.default)(print, node);

    case 'TypeParameterInstantiation':
      return (0, _printersSimplePrintTypeParameterInstantiation2.default)(print, node);

    case 'UnionTypeAnnotation':
      return (0, _printersSimplePrintUnionTypeAnnotation2.default)(print, node);

    case 'VoidTypeAnnotation':
      return (0, _printersSimplePrintVoidTypeAnnotation2.default)(print, node);
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

  (0, _assert2.default)(false, 'Unknown node type: %s', node.type);
}

module.exports = reprint;