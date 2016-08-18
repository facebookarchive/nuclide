'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Collection, Node, NodePath} from '../types/ast';

import FirstNode from '../utils/FirstNode';
import NewLine from '../utils/NewLine';
import {compareStrings, isCapitalized} from '../utils/StringUtils';
import hasOneRequireDeclaration from '../utils/hasOneRequireDeclaration';
import isGlobal from '../utils/isGlobal';
import isRequireExpression from '../utils/isRequireExpression';
import jscs from 'jscodeshift';
import reprintRequire from '../utils/reprintRequire';

type ConfigEntry = {
  searchTerms: [any, ?Object],
  filters: Array<(path: NodePath) => boolean>,
  comparator: (node1: Node, node2: Node) => number,
  mapper: (node: Node) => Node,
};

// Set up a config to easily add require formats
const CONFIG: Array<ConfigEntry> = [
  // Handle type imports
  {
    searchTerms: [
      jscs.ImportDeclaration,
      {importKind: 'type'},
    ],
    filters: [
      isGlobal,
    ],
    comparator: (node1, node2) => compareStrings(
      node1.specifiers[0].local.name,
      node2.specifiers[0].local.name,
    ),
    mapper: node => reprintRequire(node),
  },

  // Handle side effects, e.g: `require('monkey-patches');`
  {
    searchTerms: [jscs.ExpressionStatement],
    filters: [
      isGlobal,
      path => isRequireExpression(path.node),
    ],
    comparator: (node1, node2) => compareStrings(
      node1.expression.arguments[0].value,
      node2.expression.arguments[0].value,
    ),
    mapper: node => reprintRequire(node),
  },

  // Handle UpperCase requires, e.g: `require('UpperCase');`
  {
    searchTerms: [jscs.VariableDeclaration],
    filters: [
      isGlobal,
      path => isValidRequireDeclaration(path.node),
      path => isCapitalized(getDeclarationName(path.node)),
    ],
    comparator: (node1, node2) => compareStrings(
      getDeclarationName(node1),
      getDeclarationName(node2),
    ),
    mapper: node => reprintRequire(node),
  },

  // Handle lowerCase requires, e.g: `require('lowerCase');`
  {
    searchTerms: [jscs.VariableDeclaration],
    filters: [
      isGlobal,
      path => isValidRequireDeclaration(path.node),
      path => !isCapitalized(getDeclarationName(path.node)),
    ],
    comparator: (node1, node2) => compareStrings(
      getDeclarationName(node1),
      getDeclarationName(node2),
    ),
    mapper: node => reprintRequire(node),
  },
];

/**
 * This formats requires based on the left hand side of the require, unless it
 * is a simple require expression in which case there is no left hand side.
 *
 * The groups are:
 *
 *   - import types: import type Foo from 'anything';
 *   - require expressions: require('anything');
 *   - capitalized requires: var Foo = require('anything');
 *   - non-capitalized requires: var foo = require('anything');
 *
 * Array and object destructures are also valid left hand sides. Object patterns
 * are sorted and then the first identifier in each of patterns is used for
 * sorting.
 */
function formatRequires(root: Collection): void {
  const first = FirstNode.get(root);
  if (!first) {
    return;
  }
  const _first = first; // For flow.

  // Create groups of requires from each config
  const nodeGroups = CONFIG.map(config => {
    const paths = root
      .find(config.searchTerms[0], config.searchTerms[1])
      .filter(path => config.filters.every(filter => filter(path)));

    // Save the underlying nodes before removing the paths
    const nodes = paths.nodes().slice();
    paths.forEach(path => jscs(path).remove());
    return nodes.map(node => config.mapper(node)).sort(config.comparator);
  });

  // Build all the nodes we want to insert, then add them
  const allGroups = [[NewLine.statement]];
  nodeGroups.forEach(group => allGroups.push(group, [NewLine.statement]));
  const nodesToInsert = Array.prototype.concat.apply([], allGroups);
  nodesToInsert.reverse().forEach(node => _first.insertBefore(node));
}

/**
 * Tests if a variable declaration is a valid require declaration.
 */
function isValidRequireDeclaration(node: Node): boolean {
  if (!hasOneRequireDeclaration(node)) {
    return false;
  }
  const declaration = node.declarations[0];
  if (jscs.Identifier.check(declaration.id)) {
    return true;
  }
  if (jscs.ObjectPattern.check(declaration.id)) {
    return declaration.id.properties.every(
      prop => prop.shorthand && jscs.Identifier.check(prop.key),
    );
  }
  if (jscs.ArrayPattern.check(declaration.id)) {
    return declaration.id.elements.every(
      element => jscs.Identifier.check(element),
    );
  }
  return false;
}

function getDeclarationName(node: Node): string {
  const declaration = node.declarations[0];
  if (jscs.Identifier.check(declaration.id)) {
    return declaration.id.name;
  }
  // Order by the first property name in the object pattern.
  if (jscs.ObjectPattern.check(declaration.id)) {
    return declaration.id.properties[0].key.name;
  }
  // Order by the first element name in the array pattern.
  if (jscs.ArrayPattern.check(declaration.id)) {
    return declaration.id.elements[0].name;
  }
  return '';
}

module.exports = formatRequires;
