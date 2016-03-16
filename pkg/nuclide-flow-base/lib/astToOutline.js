'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FlowOutlineTree, FlowStartLocation} from '..';
import {array} from '../../nuclide-commons';

export function astToOutline(ast: any): Array<FlowOutlineTree> {
  return itemsToTrees(ast.body);
}

function itemsToTrees(items: Array<any>): Array<FlowOutlineTree> {
  return array.compact(items.map(itemToTree));
}

function itemToTree(item: any): ?FlowOutlineTree {
  if (item == null) {
    return null;
  }
  const location = getLocation(item);
  switch (item.type) {
    case 'FunctionDeclaration':
      return {
        displayText: `function ${item.id.name}(${paramsString(item.params)})`,
        children: [],
        ...location,
      };
    case 'ClassDeclaration':
      return {
        displayText: `class ${item.id.name}`,
        children: itemsToTrees(item.body.body),
        ...location,
      };
    case 'MethodDefinition':
      return {
        displayText: `${item.key.name}(${paramsString(item.value.params)})`,
        children: [],
        ...location,
      };
    case 'ExportDeclaration':
      const tree = itemToTree(item.declaration);
      if (tree == null) {
        return null;
      }
      return {
        displayText: `export ${tree.displayText}`,
        children: tree.children,
        ...location,
      };
    case 'ExpressionStatement':
      return specOutline(item, /* describeOnly */ true);
    default:
      return null;
  }
}

function getLocation(item: any): FlowStartLocation {
  return {
    // It definitely makes sense that the lines we get are 1-based and the columns are
    // 0-based... convert to 0-based all around.
    startLine: item.loc.start.line - 1,
    startColumn: item.loc.start.column,
  };
}

function paramsString(params: Array<any>): string {
  return params.map(param => param.name).join(', ');
}

function specOutline(expressionStatement: any, describeOnly: boolean = false): ?FlowOutlineTree {
  const expression = expressionStatement.expression;
  if (expression.type !== 'CallExpression') {
    return null;
  }
  const functionName = expression.callee.name;
  if (functionName !== 'describe') {
    if (describeOnly || functionName !== 'it') {
      return null;
    }
  }
  const description = getStringLiteralValue(expression.arguments[0]);
  const specBody = getFunctionBody(expression.arguments[1]);
  if (description == null || specBody == null) {
    return null;
  }
  let children;
  if (functionName === 'it') {
    children = [];
  } else {
    children = array.compact(
      specBody
      .filter(item => item.type === 'ExpressionStatement')
      .map(item => specOutline(item)));
  }
  return {
    displayText: `${expression.callee.name} ${description}`,
    children,
    ...getLocation(expressionStatement),
  };
}

/** If the given AST Node is a string literal, return its literal value. Otherwise return null */
function getStringLiteralValue(literal: ?any): ?string {
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

function getFunctionBody(fn: ?any): ?Array<any> {
  if (fn == null) {
    return null;
  }
  if (fn.type !== 'ArrowFunctionExpression' && fn.type !== 'FunctionExpression') {
    return null;
  }
  return fn.body.body;
}
