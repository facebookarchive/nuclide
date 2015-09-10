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

var jscs = require('jscodeshift');

var getFirstNodePath = require('../utils/getFirstNodePath');
var {compareStrings, isCapitalized} = require('../utils/StringUtils');
var isGlobal = require('../utils/isGlobal');
var newLine = require('../constants/newLine');
var reprintRequire = require('../utils/reprintRequire');

type ConfigEntry = {
  searchTerms: [any, Object],
  filters: Array<(path: NodePath) => boolean>,
  comparator: (node1: Node, node2: Node) => number,
  mapper: (node: Node) => Node,
};

// Set up a config to easily add require formats
var CONFIG: Array<ConfigEntry> = [
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
      node2.specifiers[0].local.name
    ),
    mapper: node => reprintRequire(node),
  },

  // Handle side effects, e.g: `require('monkey-patches');`
  {
    searchTerms: [
      jscs.ExpressionStatement,
      {expression: {callee: {name: 'require'}}},
    ],
    filters: [
      isGlobal,
    ],
    comparator: (node1, node2) => compareStrings(
      node1.expression.arguments[0].value,
      node2.expression.arguments[0].value
    ),
    mapper: node => reprintRequire(node),
  },

  // Handle UpperCase requires, e.g: `require('UpperCase');`
  {
    searchTerms: [
      jscs.VariableDeclaration,
      {declarations: [{init: {callee: {name: 'require'}}}]},
    ],
    filters: [
      isGlobal,
      isSafeVariableDeclaration,
      path => isCapitalized(getDeclarationName(path.node)),
    ],
    comparator: (node1, node2) => compareStrings(
      getDeclarationName(node1),
      getDeclarationName(node2)
    ),
    mapper: node => reprintRequire(node),
  },

  // Handle lowerCase requires, e.g: `require('lowerCase');`
  {
    searchTerms: [
      jscs.VariableDeclaration,
      {declarations: [{init: {callee: {name: 'require'}}}]},
    ],
    filters: [
      isGlobal,
      isSafeVariableDeclaration,
      path => !isCapitalized(getDeclarationName(path.node)),
    ],
    comparator: (node1, node2) => compareStrings(
      getDeclarationName(node1),
      getDeclarationName(node2)
    ),
    mapper: node => reprintRequire(node),
  },
];

function formatRequires(root: Collection): void {
  var first = getFirstNodePath(root);
  if (!first) {
    return;
  }

  // Create groups of requires from each config
  var nodeGroups = CONFIG.map(config => {
    var paths = root
      .find(config.searchTerms[0], config.searchTerms[1])
      .filter(path => config.filters.every(filter => filter(path)));

    // Save the underlying nodes before removing the paths
    var nodes = paths.nodes().slice();
    paths.forEach(path => jscs(path).remove());
    return nodes.map(node => config.mapper(node)).sort(config.comparator);
  });

  // Build all the nodes we want to insert, then add them
  var allGroups = [[newLine.statement]];
  nodeGroups.forEach(group => allGroups.push(group, [newLine.statement]));
  var nodesToInsert = Array.prototype.concat.apply([], allGroups);
  nodesToInsert.reverse().forEach(node => first.insertAfter(node));
}

// Helper functions that need api access

function isSafeVariableDeclaration(path: NodePath): boolean {
  if (path.node.declarations.length !== 1) {
    return false;
  }
  var declaration = path.node.declarations[0];
  if (jscs.Identifier.check(declaration.id)) {
    return true;
  }
  if (jscs.ObjectPattern.check(declaration.id)) {
    return declaration.id.properties.every(
      prop => prop.shorthand && jscs.Identifier.check(prop.key)
    );
  }
  return false;
}

function getDeclarationName(node: Node): string {
  var declaration = node.declarations[0];
  if (jscs.Identifier.check(declaration.id)) {
    return declaration.id.name;
  }
  // Order by the first property name in the object pattern
  if (jscs.ObjectPattern.check(declaration.id)) {
    return declaration.id.properties[0].key.name;
  }
  return '';
}

module.exports = formatRequires;
