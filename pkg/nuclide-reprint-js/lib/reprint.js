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

var _optionsDefaultOptions2;

function _optionsDefaultOptions() {
  return _optionsDefaultOptions2 = _interopRequireDefault(require('./options/DefaultOptions'));
}

var _immutable2;

function _immutable() {
  return _immutable2 = _interopRequireDefault(require('immutable'));
}

var _babelCore2;

function _babelCore() {
  return _babelCore2 = _interopRequireWildcard(require('babel-core'));
}

var _utilsFlatten2;

function _utilsFlatten() {
  return _utilsFlatten2 = _interopRequireDefault(require('./utils/flatten'));
}

var _utilsGetInvalidLeadingComments2;

function _utilsGetInvalidLeadingComments() {
  return _utilsGetInvalidLeadingComments2 = _interopRequireDefault(require('./utils/getInvalidLeadingComments'));
}

var _utilsGetInvalidTrailingComments2;

function _utilsGetInvalidTrailingComments() {
  return _utilsGetInvalidTrailingComments2 = _interopRequireDefault(require('./utils/getInvalidTrailingComments'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _printersSimplePrintAnyTypeAnnotation2;

function _printersSimplePrintAnyTypeAnnotation() {
  return _printersSimplePrintAnyTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printAnyTypeAnnotation'));
}

var _printersSimplePrintArrayExpression2;

function _printersSimplePrintArrayExpression() {
  return _printersSimplePrintArrayExpression2 = _interopRequireDefault(require('./printers/simple/printArrayExpression'));
}

var _printersSimplePrintArrayPattern2;

function _printersSimplePrintArrayPattern() {
  return _printersSimplePrintArrayPattern2 = _interopRequireDefault(require('./printers/simple/printArrayPattern'));
}

var _printersSimplePrintArrowFunctionExpression2;

function _printersSimplePrintArrowFunctionExpression() {
  return _printersSimplePrintArrowFunctionExpression2 = _interopRequireDefault(require('./printers/simple/printArrowFunctionExpression'));
}

var _printersSimplePrintAssignmentExpression2;

function _printersSimplePrintAssignmentExpression() {
  return _printersSimplePrintAssignmentExpression2 = _interopRequireDefault(require('./printers/simple/printAssignmentExpression'));
}

var _printersSimplePrintAssignmentPattern2;

function _printersSimplePrintAssignmentPattern() {
  return _printersSimplePrintAssignmentPattern2 = _interopRequireDefault(require('./printers/simple/printAssignmentPattern'));
}

var _printersSimplePrintAwaitExpression2;

function _printersSimplePrintAwaitExpression() {
  return _printersSimplePrintAwaitExpression2 = _interopRequireDefault(require('./printers/simple/printAwaitExpression'));
}

var _printersComplexPrintBinaryExpression2;

function _printersComplexPrintBinaryExpression() {
  return _printersComplexPrintBinaryExpression2 = _interopRequireDefault(require('./printers/complex/printBinaryExpression'));
}

var _printersSimplePrintBlockStatement2;

function _printersSimplePrintBlockStatement() {
  return _printersSimplePrintBlockStatement2 = _interopRequireDefault(require('./printers/simple/printBlockStatement'));
}

var _printersSimplePrintBooleanLiteralTypeAnnotation2;

function _printersSimplePrintBooleanLiteralTypeAnnotation() {
  return _printersSimplePrintBooleanLiteralTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printBooleanLiteralTypeAnnotation'));
}

var _printersSimplePrintBooleanTypeAnnotation2;

function _printersSimplePrintBooleanTypeAnnotation() {
  return _printersSimplePrintBooleanTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printBooleanTypeAnnotation'));
}

var _printersSimplePrintBreakStatement2;

function _printersSimplePrintBreakStatement() {
  return _printersSimplePrintBreakStatement2 = _interopRequireDefault(require('./printers/simple/printBreakStatement'));
}

var _printersSimplePrintCallExpression2;

function _printersSimplePrintCallExpression() {
  return _printersSimplePrintCallExpression2 = _interopRequireDefault(require('./printers/simple/printCallExpression'));
}

var _printersSimplePrintCatchClause2;

function _printersSimplePrintCatchClause() {
  return _printersSimplePrintCatchClause2 = _interopRequireDefault(require('./printers/simple/printCatchClause'));
}

var _printersSimplePrintClassBody2;

function _printersSimplePrintClassBody() {
  return _printersSimplePrintClassBody2 = _interopRequireDefault(require('./printers/simple/printClassBody'));
}

var _printersSimplePrintClassDeclaration2;

function _printersSimplePrintClassDeclaration() {
  return _printersSimplePrintClassDeclaration2 = _interopRequireDefault(require('./printers/simple/printClassDeclaration'));
}

var _printersSimplePrintClassProperty2;

function _printersSimplePrintClassProperty() {
  return _printersSimplePrintClassProperty2 = _interopRequireDefault(require('./printers/simple/printClassProperty'));
}

var _printersSimplePrintConditionalExpression2;

function _printersSimplePrintConditionalExpression() {
  return _printersSimplePrintConditionalExpression2 = _interopRequireDefault(require('./printers/simple/printConditionalExpression'));
}

var _printersSimplePrintContinueStatement2;

function _printersSimplePrintContinueStatement() {
  return _printersSimplePrintContinueStatement2 = _interopRequireDefault(require('./printers/simple/printContinueStatement'));
}

var _printersSimplePrintDebuggerStatement2;

function _printersSimplePrintDebuggerStatement() {
  return _printersSimplePrintDebuggerStatement2 = _interopRequireDefault(require('./printers/simple/printDebuggerStatement'));
}

var _printersSimplePrintDoWhileStatement2;

function _printersSimplePrintDoWhileStatement() {
  return _printersSimplePrintDoWhileStatement2 = _interopRequireDefault(require('./printers/simple/printDoWhileStatement'));
}

var _printersSimplePrintEmptyStatement2;

function _printersSimplePrintEmptyStatement() {
  return _printersSimplePrintEmptyStatement2 = _interopRequireDefault(require('./printers/simple/printEmptyStatement'));
}

var _printersSimplePrintExportDefaultDeclaration2;

function _printersSimplePrintExportDefaultDeclaration() {
  return _printersSimplePrintExportDefaultDeclaration2 = _interopRequireDefault(require('./printers/simple/printExportDefaultDeclaration'));
}

var _printersSimplePrintExportDefaultSpecifier2;

function _printersSimplePrintExportDefaultSpecifier() {
  return _printersSimplePrintExportDefaultSpecifier2 = _interopRequireDefault(require('./printers/simple/printExportDefaultSpecifier'));
}

var _printersSimplePrintExportNamedDeclaration2;

function _printersSimplePrintExportNamedDeclaration() {
  return _printersSimplePrintExportNamedDeclaration2 = _interopRequireDefault(require('./printers/simple/printExportNamedDeclaration'));
}

var _printersSimplePrintExportNamespaceSpecifier2;

function _printersSimplePrintExportNamespaceSpecifier() {
  return _printersSimplePrintExportNamespaceSpecifier2 = _interopRequireDefault(require('./printers/simple/printExportNamespaceSpecifier'));
}

var _printersSimplePrintExportSpecifier2;

function _printersSimplePrintExportSpecifier() {
  return _printersSimplePrintExportSpecifier2 = _interopRequireDefault(require('./printers/simple/printExportSpecifier'));
}

var _printersSimplePrintExpressionStatement2;

function _printersSimplePrintExpressionStatement() {
  return _printersSimplePrintExpressionStatement2 = _interopRequireDefault(require('./printers/simple/printExpressionStatement'));
}

var _printersSimplePrintFile2;

function _printersSimplePrintFile() {
  return _printersSimplePrintFile2 = _interopRequireDefault(require('./printers/simple/printFile'));
}

var _printersSimplePrintForInStatement2;

function _printersSimplePrintForInStatement() {
  return _printersSimplePrintForInStatement2 = _interopRequireDefault(require('./printers/simple/printForInStatement'));
}

var _printersSimplePrintForOfStatement2;

function _printersSimplePrintForOfStatement() {
  return _printersSimplePrintForOfStatement2 = _interopRequireDefault(require('./printers/simple/printForOfStatement'));
}

var _printersSimplePrintForStatement2;

function _printersSimplePrintForStatement() {
  return _printersSimplePrintForStatement2 = _interopRequireDefault(require('./printers/simple/printForStatement'));
}

var _printersSimplePrintFunctionDeclaration2;

function _printersSimplePrintFunctionDeclaration() {
  return _printersSimplePrintFunctionDeclaration2 = _interopRequireDefault(require('./printers/simple/printFunctionDeclaration'));
}

var _printersComplexPrintFunctionExpression2;

function _printersComplexPrintFunctionExpression() {
  return _printersComplexPrintFunctionExpression2 = _interopRequireDefault(require('./printers/complex/printFunctionExpression'));
}

var _printersSimplePrintFunctionTypeAnnotation2;

function _printersSimplePrintFunctionTypeAnnotation() {
  return _printersSimplePrintFunctionTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printFunctionTypeAnnotation'));
}

var _printersSimplePrintFunctionTypeParam2;

function _printersSimplePrintFunctionTypeParam() {
  return _printersSimplePrintFunctionTypeParam2 = _interopRequireDefault(require('./printers/simple/printFunctionTypeParam'));
}

var _printersSimplePrintGenericTypeAnnotation2;

function _printersSimplePrintGenericTypeAnnotation() {
  return _printersSimplePrintGenericTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printGenericTypeAnnotation'));
}

var _printersSimplePrintIdentifier2;

function _printersSimplePrintIdentifier() {
  return _printersSimplePrintIdentifier2 = _interopRequireDefault(require('./printers/simple/printIdentifier'));
}

var _printersSimplePrintIfStatement2;

function _printersSimplePrintIfStatement() {
  return _printersSimplePrintIfStatement2 = _interopRequireDefault(require('./printers/simple/printIfStatement'));
}

var _printersSimplePrintImportDeclaration2;

function _printersSimplePrintImportDeclaration() {
  return _printersSimplePrintImportDeclaration2 = _interopRequireDefault(require('./printers/simple/printImportDeclaration'));
}

var _printersSimplePrintImportDefaultSpecifier2;

function _printersSimplePrintImportDefaultSpecifier() {
  return _printersSimplePrintImportDefaultSpecifier2 = _interopRequireDefault(require('./printers/simple/printImportDefaultSpecifier'));
}

var _printersSimplePrintImportNamespaceSpecifier2;

function _printersSimplePrintImportNamespaceSpecifier() {
  return _printersSimplePrintImportNamespaceSpecifier2 = _interopRequireDefault(require('./printers/simple/printImportNamespaceSpecifier'));
}

var _printersSimplePrintImportSpecifier2;

function _printersSimplePrintImportSpecifier() {
  return _printersSimplePrintImportSpecifier2 = _interopRequireDefault(require('./printers/simple/printImportSpecifier'));
}

var _printersSimplePrintIntersectionTypeAnnotation2;

function _printersSimplePrintIntersectionTypeAnnotation() {
  return _printersSimplePrintIntersectionTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printIntersectionTypeAnnotation'));
}

var _printersSimplePrintJSXAttribute2;

function _printersSimplePrintJSXAttribute() {
  return _printersSimplePrintJSXAttribute2 = _interopRequireDefault(require('./printers/simple/printJSXAttribute'));
}

var _printersSimplePrintJSXClosingElement2;

function _printersSimplePrintJSXClosingElement() {
  return _printersSimplePrintJSXClosingElement2 = _interopRequireDefault(require('./printers/simple/printJSXClosingElement'));
}

var _printersSimplePrintJSXElement2;

function _printersSimplePrintJSXElement() {
  return _printersSimplePrintJSXElement2 = _interopRequireDefault(require('./printers/simple/printJSXElement'));
}

var _printersSimplePrintJSXExpressionContainer2;

function _printersSimplePrintJSXExpressionContainer() {
  return _printersSimplePrintJSXExpressionContainer2 = _interopRequireDefault(require('./printers/simple/printJSXExpressionContainer'));
}

var _printersSimplePrintJSXIdentifier2;

function _printersSimplePrintJSXIdentifier() {
  return _printersSimplePrintJSXIdentifier2 = _interopRequireDefault(require('./printers/simple/printJSXIdentifier'));
}

var _printersSimplePrintJSXMemberExpression2;

function _printersSimplePrintJSXMemberExpression() {
  return _printersSimplePrintJSXMemberExpression2 = _interopRequireDefault(require('./printers/simple/printJSXMemberExpression'));
}

var _printersSimplePrintJSXOpeningElement2;

function _printersSimplePrintJSXOpeningElement() {
  return _printersSimplePrintJSXOpeningElement2 = _interopRequireDefault(require('./printers/simple/printJSXOpeningElement'));
}

var _printersSimplePrintJSXSpreadAttribute2;

function _printersSimplePrintJSXSpreadAttribute() {
  return _printersSimplePrintJSXSpreadAttribute2 = _interopRequireDefault(require('./printers/simple/printJSXSpreadAttribute'));
}

var _printersSimplePrintLabeledStatement2;

function _printersSimplePrintLabeledStatement() {
  return _printersSimplePrintLabeledStatement2 = _interopRequireDefault(require('./printers/simple/printLabeledStatement'));
}

var _printersComplexPrintLiteral2;

function _printersComplexPrintLiteral() {
  return _printersComplexPrintLiteral2 = _interopRequireDefault(require('./printers/complex/printLiteral'));
}

var _printersComplexPrintLogicalExpression2;

function _printersComplexPrintLogicalExpression() {
  return _printersComplexPrintLogicalExpression2 = _interopRequireDefault(require('./printers/complex/printLogicalExpression'));
}

var _printersComplexPrintMemberExpression2;

function _printersComplexPrintMemberExpression() {
  return _printersComplexPrintMemberExpression2 = _interopRequireDefault(require('./printers/complex/printMemberExpression'));
}

var _printersSimplePrintMethodDefinition2;

function _printersSimplePrintMethodDefinition() {
  return _printersSimplePrintMethodDefinition2 = _interopRequireDefault(require('./printers/simple/printMethodDefinition'));
}

var _printersSimplePrintMixedTypeAnnotation2;

function _printersSimplePrintMixedTypeAnnotation() {
  return _printersSimplePrintMixedTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printMixedTypeAnnotation'));
}

var _printersSimplePrintNewExpression2;

function _printersSimplePrintNewExpression() {
  return _printersSimplePrintNewExpression2 = _interopRequireDefault(require('./printers/simple/printNewExpression'));
}

var _printersSimplePrintNullableTypeAnnotation2;

function _printersSimplePrintNullableTypeAnnotation() {
  return _printersSimplePrintNullableTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printNullableTypeAnnotation'));
}

var _printersSimplePrintNumberLiteralTypeAnnotation2;

function _printersSimplePrintNumberLiteralTypeAnnotation() {
  return _printersSimplePrintNumberLiteralTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printNumberLiteralTypeAnnotation'));
}

var _printersSimplePrintNumberTypeAnnotation2;

function _printersSimplePrintNumberTypeAnnotation() {
  return _printersSimplePrintNumberTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printNumberTypeAnnotation'));
}

var _printersSimplePrintObjectExpression2;

function _printersSimplePrintObjectExpression() {
  return _printersSimplePrintObjectExpression2 = _interopRequireDefault(require('./printers/simple/printObjectExpression'));
}

var _printersSimplePrintObjectPattern2;

function _printersSimplePrintObjectPattern() {
  return _printersSimplePrintObjectPattern2 = _interopRequireDefault(require('./printers/simple/printObjectPattern'));
}

var _printersSimplePrintObjectTypeAnnotation2;

function _printersSimplePrintObjectTypeAnnotation() {
  return _printersSimplePrintObjectTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printObjectTypeAnnotation'));
}

var _printersSimplePrintObjectTypeProperty2;

function _printersSimplePrintObjectTypeProperty() {
  return _printersSimplePrintObjectTypeProperty2 = _interopRequireDefault(require('./printers/simple/printObjectTypeProperty'));
}

var _printersSimplePrintProgram2;

function _printersSimplePrintProgram() {
  return _printersSimplePrintProgram2 = _interopRequireDefault(require('./printers/simple/printProgram'));
}

var _printersSimplePrintProperty2;

function _printersSimplePrintProperty() {
  return _printersSimplePrintProperty2 = _interopRequireDefault(require('./printers/simple/printProperty'));
}

var _printersSimplePrintQualifiedTypeIdentifier2;

function _printersSimplePrintQualifiedTypeIdentifier() {
  return _printersSimplePrintQualifiedTypeIdentifier2 = _interopRequireDefault(require('./printers/simple/printQualifiedTypeIdentifier'));
}

var _printersSimplePrintRestElement2;

function _printersSimplePrintRestElement() {
  return _printersSimplePrintRestElement2 = _interopRequireDefault(require('./printers/simple/printRestElement'));
}

var _printersSimplePrintReturnStatement2;

function _printersSimplePrintReturnStatement() {
  return _printersSimplePrintReturnStatement2 = _interopRequireDefault(require('./printers/simple/printReturnStatement'));
}

var _printersSimplePrintSpreadElement2;

function _printersSimplePrintSpreadElement() {
  return _printersSimplePrintSpreadElement2 = _interopRequireDefault(require('./printers/simple/printSpreadElement'));
}

var _printersSimplePrintSpreadProperty2;

function _printersSimplePrintSpreadProperty() {
  return _printersSimplePrintSpreadProperty2 = _interopRequireDefault(require('./printers/simple/printSpreadProperty'));
}

var _printersSimplePrintStringLiteralTypeAnnotation2;

function _printersSimplePrintStringLiteralTypeAnnotation() {
  return _printersSimplePrintStringLiteralTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printStringLiteralTypeAnnotation'));
}

var _printersSimplePrintStringTypeAnnotation2;

function _printersSimplePrintStringTypeAnnotation() {
  return _printersSimplePrintStringTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printStringTypeAnnotation'));
}

var _printersSimplePrintSuper2;

function _printersSimplePrintSuper() {
  return _printersSimplePrintSuper2 = _interopRequireDefault(require('./printers/simple/printSuper'));
}

var _printersSimplePrintSwitchCase2;

function _printersSimplePrintSwitchCase() {
  return _printersSimplePrintSwitchCase2 = _interopRequireDefault(require('./printers/simple/printSwitchCase'));
}

var _printersSimplePrintSwitchStatement2;

function _printersSimplePrintSwitchStatement() {
  return _printersSimplePrintSwitchStatement2 = _interopRequireDefault(require('./printers/simple/printSwitchStatement'));
}

var _printersSimplePrintTaggedTemplateExpression2;

function _printersSimplePrintTaggedTemplateExpression() {
  return _printersSimplePrintTaggedTemplateExpression2 = _interopRequireDefault(require('./printers/simple/printTaggedTemplateExpression'));
}

var _printersSimplePrintTemplateElement2;

function _printersSimplePrintTemplateElement() {
  return _printersSimplePrintTemplateElement2 = _interopRequireDefault(require('./printers/simple/printTemplateElement'));
}

var _printersSimplePrintTemplateLiteral2;

function _printersSimplePrintTemplateLiteral() {
  return _printersSimplePrintTemplateLiteral2 = _interopRequireDefault(require('./printers/simple/printTemplateLiteral'));
}

var _printersSimplePrintThisExpression2;

function _printersSimplePrintThisExpression() {
  return _printersSimplePrintThisExpression2 = _interopRequireDefault(require('./printers/simple/printThisExpression'));
}

var _printersSimplePrintThrowStatement2;

function _printersSimplePrintThrowStatement() {
  return _printersSimplePrintThrowStatement2 = _interopRequireDefault(require('./printers/simple/printThrowStatement'));
}

var _printersSimplePrintTryStatement2;

function _printersSimplePrintTryStatement() {
  return _printersSimplePrintTryStatement2 = _interopRequireDefault(require('./printers/simple/printTryStatement'));
}

var _printersSimplePrintTupleTypeAnnotation2;

function _printersSimplePrintTupleTypeAnnotation() {
  return _printersSimplePrintTupleTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printTupleTypeAnnotation'));
}

var _printersSimplePrintTypeAlias2;

function _printersSimplePrintTypeAlias() {
  return _printersSimplePrintTypeAlias2 = _interopRequireDefault(require('./printers/simple/printTypeAlias'));
}

var _printersSimplePrintTypeAnnotation2;

function _printersSimplePrintTypeAnnotation() {
  return _printersSimplePrintTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printTypeAnnotation'));
}

var _printersSimplePrintTypeofTypeAnnotation2;

function _printersSimplePrintTypeofTypeAnnotation() {
  return _printersSimplePrintTypeofTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printTypeofTypeAnnotation'));
}

var _printersSimplePrintTypeParameterDeclaration2;

function _printersSimplePrintTypeParameterDeclaration() {
  return _printersSimplePrintTypeParameterDeclaration2 = _interopRequireDefault(require('./printers/simple/printTypeParameterDeclaration'));
}

var _printersSimplePrintTypeParameterInstantiation2;

function _printersSimplePrintTypeParameterInstantiation() {
  return _printersSimplePrintTypeParameterInstantiation2 = _interopRequireDefault(require('./printers/simple/printTypeParameterInstantiation'));
}

var _printersSimplePrintUnaryExpression2;

function _printersSimplePrintUnaryExpression() {
  return _printersSimplePrintUnaryExpression2 = _interopRequireDefault(require('./printers/simple/printUnaryExpression'));
}

var _printersSimplePrintUnionTypeAnnotation2;

function _printersSimplePrintUnionTypeAnnotation() {
  return _printersSimplePrintUnionTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printUnionTypeAnnotation'));
}

var _printersSimplePrintUpdateExpression2;

function _printersSimplePrintUpdateExpression() {
  return _printersSimplePrintUpdateExpression2 = _interopRequireDefault(require('./printers/simple/printUpdateExpression'));
}

var _printersComplexPrintVariableDeclaration2;

function _printersComplexPrintVariableDeclaration() {
  return _printersComplexPrintVariableDeclaration2 = _interopRequireDefault(require('./printers/complex/printVariableDeclaration'));
}

var _printersSimplePrintVariableDeclarator2;

function _printersSimplePrintVariableDeclarator() {
  return _printersSimplePrintVariableDeclarator2 = _interopRequireDefault(require('./printers/simple/printVariableDeclarator'));
}

var _printersSimplePrintVoidTypeAnnotation2;

function _printersSimplePrintVoidTypeAnnotation() {
  return _printersSimplePrintVoidTypeAnnotation2 = _interopRequireDefault(require('./printers/simple/printVoidTypeAnnotation'));
}

var _printersSimplePrintWhileStatement2;

function _printersSimplePrintWhileStatement() {
  return _printersSimplePrintWhileStatement2 = _interopRequireDefault(require('./printers/simple/printWhileStatement'));
}

var _printersSimplePrintWithStatement2;

function _printersSimplePrintWithStatement() {
  return _printersSimplePrintWithStatement2 = _interopRequireDefault(require('./printers/simple/printWithStatement'));
}

var _printersSimplePrintYieldExpression2;

function _printersSimplePrintYieldExpression() {
  return _printersSimplePrintYieldExpression2 = _interopRequireDefault(require('./printers/simple/printYieldExpression'));
}

var _resolversResolveLines2;

function _resolversResolveLines() {
  return _resolversResolveLines2 = _interopRequireDefault(require('./resolvers/resolveLines'));
}

var _wrappersComplexWrapWithComments2;

function _wrappersComplexWrapWithComments() {
  return _wrappersComplexWrapWithComments2 = _interopRequireDefault(require('./wrappers/complex/wrapWithComments'));
}

/**
 * Entry point into reprint. Parses the source into an AST and then prints it
 * according to the given options.
 */
function reprint(source, nullableOptions) {
  var options = nullableOptions || (_optionsDefaultOptions2 || _optionsDefaultOptions()).default;
  var ast = (_babelCore2 || _babelCore()).parse(source);
  var lines = (0, (_utilsFlatten2 || _utilsFlatten()).default)(printWithWrappers(ast, {
    invalidLeadingComments: (0, (_utilsGetInvalidLeadingComments2 || _utilsGetInvalidLeadingComments()).default)(ast),
    invalidTrailingComments: (0, (_utilsGetInvalidTrailingComments2 || _utilsGetInvalidTrailingComments()).default)(ast),
    options: options,
    path: (_immutable2 || _immutable()).default.List()
  }));
  return (0, (_resolversResolveLines2 || _resolversResolveLines()).default)(lines, options);
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
  lines = (0, (_wrappersComplexWrapWithComments2 || _wrappersComplexWrapWithComments()).default)(print, node, context, lines);
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
      return (0, (_printersSimplePrintArrayExpression2 || _printersSimplePrintArrayExpression()).default)(print, node);

    case 'ArrayPattern':
      return (0, (_printersSimplePrintArrayPattern2 || _printersSimplePrintArrayPattern()).default)(print, node);

    case 'ArrowFunctionExpression':
      return (0, (_printersSimplePrintArrowFunctionExpression2 || _printersSimplePrintArrowFunctionExpression()).default)(print, node);

    case 'AssignmentExpression':
      return (0, (_printersSimplePrintAssignmentExpression2 || _printersSimplePrintAssignmentExpression()).default)(print, node);

    case 'AssignmentPattern':
      return (0, (_printersSimplePrintAssignmentPattern2 || _printersSimplePrintAssignmentPattern()).default)(print, node);

    case 'AwaitExpression':
      return (0, (_printersSimplePrintAwaitExpression2 || _printersSimplePrintAwaitExpression()).default)(print, node);

    case 'BlockStatement':
      return (0, (_printersSimplePrintBlockStatement2 || _printersSimplePrintBlockStatement()).default)(print, node);

    case 'BreakStatement':
      return (0, (_printersSimplePrintBreakStatement2 || _printersSimplePrintBreakStatement()).default)(print, node);

    case 'CallExpression':
      return (0, (_printersSimplePrintCallExpression2 || _printersSimplePrintCallExpression()).default)(print, node);

    case 'CatchClause':
      return (0, (_printersSimplePrintCatchClause2 || _printersSimplePrintCatchClause()).default)(print, node);

    case 'ClassBody':
      return (0, (_printersSimplePrintClassBody2 || _printersSimplePrintClassBody()).default)(print, node);

    case 'ClassDeclaration':
      return (0, (_printersSimplePrintClassDeclaration2 || _printersSimplePrintClassDeclaration()).default)(print, node);

    case 'ClassProperty':
      return (0, (_printersSimplePrintClassProperty2 || _printersSimplePrintClassProperty()).default)(print, node);

    case 'ConditionalExpression':
      return (0, (_printersSimplePrintConditionalExpression2 || _printersSimplePrintConditionalExpression()).default)(print, node);

    case 'ContinueStatement':
      return (0, (_printersSimplePrintContinueStatement2 || _printersSimplePrintContinueStatement()).default)(print, node);

    case 'DebuggerStatement':
      return (0, (_printersSimplePrintDebuggerStatement2 || _printersSimplePrintDebuggerStatement()).default)(print, node);

    case 'DoWhileStatement':
      return (0, (_printersSimplePrintDoWhileStatement2 || _printersSimplePrintDoWhileStatement()).default)(print, node);

    case 'EmptyStatement':
      return (0, (_printersSimplePrintEmptyStatement2 || _printersSimplePrintEmptyStatement()).default)(print, node);

    case 'ExportDefaultDeclaration':
      return (0, (_printersSimplePrintExportDefaultDeclaration2 || _printersSimplePrintExportDefaultDeclaration()).default)(print, node);

    case 'ExportDefaultSpecifier':
      return (0, (_printersSimplePrintExportDefaultSpecifier2 || _printersSimplePrintExportDefaultSpecifier()).default)(print, node);

    case 'ExportNamedDeclaration':
      return (0, (_printersSimplePrintExportNamedDeclaration2 || _printersSimplePrintExportNamedDeclaration()).default)(print, node);

    case 'ExportNamespaceSpecifier':
      return (0, (_printersSimplePrintExportNamespaceSpecifier2 || _printersSimplePrintExportNamespaceSpecifier()).default)(print, node);

    case 'ExportSpecifier':
      return (0, (_printersSimplePrintExportSpecifier2 || _printersSimplePrintExportSpecifier()).default)(print, node);

    case 'ExpressionStatement':
      return (0, (_printersSimplePrintExpressionStatement2 || _printersSimplePrintExpressionStatement()).default)(print, node);

    case 'File':
      return (0, (_printersSimplePrintFile2 || _printersSimplePrintFile()).default)(print, node);

    case 'ForInStatement':
      return (0, (_printersSimplePrintForInStatement2 || _printersSimplePrintForInStatement()).default)(print, node);

    case 'ForOfStatement':
      return (0, (_printersSimplePrintForOfStatement2 || _printersSimplePrintForOfStatement()).default)(print, node);

    case 'ForStatement':
      return (0, (_printersSimplePrintForStatement2 || _printersSimplePrintForStatement()).default)(print, node);

    case 'FunctionDeclaration':
      return (0, (_printersSimplePrintFunctionDeclaration2 || _printersSimplePrintFunctionDeclaration()).default)(print, node);

    case 'Identifier':
      return (0, (_printersSimplePrintIdentifier2 || _printersSimplePrintIdentifier()).default)(print, node);

    case 'IfStatement':
      return (0, (_printersSimplePrintIfStatement2 || _printersSimplePrintIfStatement()).default)(print, node);

    case 'ImportDeclaration':
      return (0, (_printersSimplePrintImportDeclaration2 || _printersSimplePrintImportDeclaration()).default)(print, node);

    case 'ImportDefaultSpecifier':
      return (0, (_printersSimplePrintImportDefaultSpecifier2 || _printersSimplePrintImportDefaultSpecifier()).default)(print, node);

    case 'ImportNamespaceSpecifier':
      return (0, (_printersSimplePrintImportNamespaceSpecifier2 || _printersSimplePrintImportNamespaceSpecifier()).default)(print, node);

    case 'ImportSpecifier':
      return (0, (_printersSimplePrintImportSpecifier2 || _printersSimplePrintImportSpecifier()).default)(print, node);

    case 'LabeledStatement':
      return (0, (_printersSimplePrintLabeledStatement2 || _printersSimplePrintLabeledStatement()).default)(print, node);

    case 'MethodDefinition':
      return (0, (_printersSimplePrintMethodDefinition2 || _printersSimplePrintMethodDefinition()).default)(print, node);

    case 'NewExpression':
      return (0, (_printersSimplePrintNewExpression2 || _printersSimplePrintNewExpression()).default)(print, node);

    case 'ObjectExpression':
      return (0, (_printersSimplePrintObjectExpression2 || _printersSimplePrintObjectExpression()).default)(print, node);

    case 'ObjectPattern':
      return (0, (_printersSimplePrintObjectPattern2 || _printersSimplePrintObjectPattern()).default)(print, node);

    case 'Program':
      return (0, (_printersSimplePrintProgram2 || _printersSimplePrintProgram()).default)(print, node);

    case 'Property':
      return (0, (_printersSimplePrintProperty2 || _printersSimplePrintProperty()).default)(print, node);

    case 'RestElement':
      return (0, (_printersSimplePrintRestElement2 || _printersSimplePrintRestElement()).default)(print, node);

    case 'ReturnStatement':
      return (0, (_printersSimplePrintReturnStatement2 || _printersSimplePrintReturnStatement()).default)(print, node);

    case 'SpreadElement':
      return (0, (_printersSimplePrintSpreadElement2 || _printersSimplePrintSpreadElement()).default)(print, node);

    case 'SpreadProperty':
      return (0, (_printersSimplePrintSpreadProperty2 || _printersSimplePrintSpreadProperty()).default)(print, node);

    case 'Super':
      return (0, (_printersSimplePrintSuper2 || _printersSimplePrintSuper()).default)(print, node);

    case 'SwitchCase':
      return (0, (_printersSimplePrintSwitchCase2 || _printersSimplePrintSwitchCase()).default)(print, node);

    case 'SwitchStatement':
      return (0, (_printersSimplePrintSwitchStatement2 || _printersSimplePrintSwitchStatement()).default)(print, node);

    case 'TaggedTemplateExpression':
      return (0, (_printersSimplePrintTaggedTemplateExpression2 || _printersSimplePrintTaggedTemplateExpression()).default)(print, node);

    case 'TemplateElement':
      return (0, (_printersSimplePrintTemplateElement2 || _printersSimplePrintTemplateElement()).default)(print, node);

    case 'TemplateLiteral':
      return (0, (_printersSimplePrintTemplateLiteral2 || _printersSimplePrintTemplateLiteral()).default)(print, node);

    case 'ThisExpression':
      return (0, (_printersSimplePrintThisExpression2 || _printersSimplePrintThisExpression()).default)(print, node);

    case 'ThrowStatement':
      return (0, (_printersSimplePrintThrowStatement2 || _printersSimplePrintThrowStatement()).default)(print, node);

    case 'TryStatement':
      return (0, (_printersSimplePrintTryStatement2 || _printersSimplePrintTryStatement()).default)(print, node);

    case 'UnaryExpression':
      return (0, (_printersSimplePrintUnaryExpression2 || _printersSimplePrintUnaryExpression()).default)(print, node);

    case 'UpdateExpression':
      return (0, (_printersSimplePrintUpdateExpression2 || _printersSimplePrintUpdateExpression()).default)(print, node);

    case 'VariableDeclarator':
      return (0, (_printersSimplePrintVariableDeclarator2 || _printersSimplePrintVariableDeclarator()).default)(print, node);

    case 'WhileStatement':
      return (0, (_printersSimplePrintWhileStatement2 || _printersSimplePrintWhileStatement()).default)(print, node);

    case 'WithStatement':
      return (0, (_printersSimplePrintWithStatement2 || _printersSimplePrintWithStatement()).default)(print, node);

    case 'YieldExpression':
      return (0, (_printersSimplePrintYieldExpression2 || _printersSimplePrintYieldExpression()).default)(print, node);
  }

  /**
   * Complex printers -- meaning they require context.
   */
  switch (node.type) {
    case 'BinaryExpression':
      return (0, (_printersComplexPrintBinaryExpression2 || _printersComplexPrintBinaryExpression()).default)(print, node, context);

    case 'FunctionExpression':
      return (0, (_printersComplexPrintFunctionExpression2 || _printersComplexPrintFunctionExpression()).default)(print, node, context);

    case 'Literal':
      return (0, (_printersComplexPrintLiteral2 || _printersComplexPrintLiteral()).default)(print, node, context);

    case 'LogicalExpression':
      return (0, (_printersComplexPrintLogicalExpression2 || _printersComplexPrintLogicalExpression()).default)(print, node, context);

    case 'MemberExpression':
      return (0, (_printersComplexPrintMemberExpression2 || _printersComplexPrintMemberExpression()).default)(print, node, context);

    case 'VariableDeclaration':
      return (0, (_printersComplexPrintVariableDeclaration2 || _printersComplexPrintVariableDeclaration()).default)(print, node, context);
  }

  /**
   * JSX Nodes
   */
  switch (node.type) {
    case 'JSXAttribute':
      return (0, (_printersSimplePrintJSXAttribute2 || _printersSimplePrintJSXAttribute()).default)(print, node);

    case 'JSXClosingElement':
      return (0, (_printersSimplePrintJSXClosingElement2 || _printersSimplePrintJSXClosingElement()).default)(print, node);

    case 'JSXElement':
      return (0, (_printersSimplePrintJSXElement2 || _printersSimplePrintJSXElement()).default)(print, node);

    case 'JSXExpressionContainer':
      return (0, (_printersSimplePrintJSXExpressionContainer2 || _printersSimplePrintJSXExpressionContainer()).default)(print, node);

    case 'JSXIdentifier':
      return (0, (_printersSimplePrintJSXIdentifier2 || _printersSimplePrintJSXIdentifier()).default)(print, node);

    case 'JSXMemberExpression':
      return (0, (_printersSimplePrintJSXMemberExpression2 || _printersSimplePrintJSXMemberExpression()).default)(print, node);

    case 'JSXOpeningElement':
      return (0, (_printersSimplePrintJSXOpeningElement2 || _printersSimplePrintJSXOpeningElement()).default)(print, node);

    case 'JSXSpreadAttribute':
      return (0, (_printersSimplePrintJSXSpreadAttribute2 || _printersSimplePrintJSXSpreadAttribute()).default)(print, node);
  }

  /**
   * Flow types.
   */
  switch (node.type) {
    case 'AnyTypeAnnotation':
      return (0, (_printersSimplePrintAnyTypeAnnotation2 || _printersSimplePrintAnyTypeAnnotation()).default)(print, node);

    case 'BooleanLiteralTypeAnnotation':
      return (0, (_printersSimplePrintBooleanLiteralTypeAnnotation2 || _printersSimplePrintBooleanLiteralTypeAnnotation()).default)(print, node);

    case 'BooleanTypeAnnotation':
      return (0, (_printersSimplePrintBooleanTypeAnnotation2 || _printersSimplePrintBooleanTypeAnnotation()).default)(print, node);

    case 'FunctionTypeAnnotation':
      return (0, (_printersSimplePrintFunctionTypeAnnotation2 || _printersSimplePrintFunctionTypeAnnotation()).default)(print, node);

    case 'FunctionTypeParam':
      return (0, (_printersSimplePrintFunctionTypeParam2 || _printersSimplePrintFunctionTypeParam()).default)(print, node);

    case 'GenericTypeAnnotation':
      return (0, (_printersSimplePrintGenericTypeAnnotation2 || _printersSimplePrintGenericTypeAnnotation()).default)(print, node);

    case 'IntersectionTypeAnnotation':
      return (0, (_printersSimplePrintIntersectionTypeAnnotation2 || _printersSimplePrintIntersectionTypeAnnotation()).default)(print, node);

    case 'MixedTypeAnnotation':
      return (0, (_printersSimplePrintMixedTypeAnnotation2 || _printersSimplePrintMixedTypeAnnotation()).default)(print, node);

    case 'NullableTypeAnnotation':
      return (0, (_printersSimplePrintNullableTypeAnnotation2 || _printersSimplePrintNullableTypeAnnotation()).default)(print, node);

    case 'NumberLiteralTypeAnnotation':
      return (0, (_printersSimplePrintNumberLiteralTypeAnnotation2 || _printersSimplePrintNumberLiteralTypeAnnotation()).default)(print, node);

    case 'NumberTypeAnnotation':
      return (0, (_printersSimplePrintNumberTypeAnnotation2 || _printersSimplePrintNumberTypeAnnotation()).default)(print, node);

    case 'ObjectTypeAnnotation':
      return (0, (_printersSimplePrintObjectTypeAnnotation2 || _printersSimplePrintObjectTypeAnnotation()).default)(print, node);

    case 'ObjectTypeProperty':
      return (0, (_printersSimplePrintObjectTypeProperty2 || _printersSimplePrintObjectTypeProperty()).default)(print, node);

    case 'QualifiedTypeIdentifier':
      return (0, (_printersSimplePrintQualifiedTypeIdentifier2 || _printersSimplePrintQualifiedTypeIdentifier()).default)(print, node);

    case 'StringLiteralTypeAnnotation':
      return (0, (_printersSimplePrintStringLiteralTypeAnnotation2 || _printersSimplePrintStringLiteralTypeAnnotation()).default)(print, node);

    case 'StringTypeAnnotation':
      return (0, (_printersSimplePrintStringTypeAnnotation2 || _printersSimplePrintStringTypeAnnotation()).default)(print, node);

    case 'TupleTypeAnnotation':
      return (0, (_printersSimplePrintTupleTypeAnnotation2 || _printersSimplePrintTupleTypeAnnotation()).default)(print, node);

    case 'TypeAlias':
      return (0, (_printersSimplePrintTypeAlias2 || _printersSimplePrintTypeAlias()).default)(print, node);

    case 'TypeAnnotation':
      return (0, (_printersSimplePrintTypeAnnotation2 || _printersSimplePrintTypeAnnotation()).default)(print, node);

    case 'TypeofTypeAnnotation':
      return (0, (_printersSimplePrintTypeofTypeAnnotation2 || _printersSimplePrintTypeofTypeAnnotation()).default)(print, node);

    case 'TypeParameterDeclaration':
      return (0, (_printersSimplePrintTypeParameterDeclaration2 || _printersSimplePrintTypeParameterDeclaration()).default)(print, node);

    case 'TypeParameterInstantiation':
      return (0, (_printersSimplePrintTypeParameterInstantiation2 || _printersSimplePrintTypeParameterInstantiation()).default)(print, node);

    case 'UnionTypeAnnotation':
      return (0, (_printersSimplePrintUnionTypeAnnotation2 || _printersSimplePrintUnionTypeAnnotation()).default)(print, node);

    case 'VoidTypeAnnotation':
      return (0, (_printersSimplePrintVoidTypeAnnotation2 || _printersSimplePrintVoidTypeAnnotation()).default)(print, node);
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

  (0, (_assert2 || _assert()).default)(false, 'Unknown node type: %s', node.type);
}

module.exports = reprint;