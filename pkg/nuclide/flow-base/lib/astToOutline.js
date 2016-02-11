'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FlowOutlineTree} from './FlowService';
import {array} from '../../commons';

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
  const location = {
    // It definitely makes sense that the lines we get are 1-based and the columns are
    // 0-based... convert to 0-based all around.
    startLine: item.loc.start.line - 1,
    startColumn: item.loc.start.column,
  };
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
    default:
      return null;
  }
}

function paramsString(params: Array<any>): string {
  return params.map(param => param.name).join(', ');
}
