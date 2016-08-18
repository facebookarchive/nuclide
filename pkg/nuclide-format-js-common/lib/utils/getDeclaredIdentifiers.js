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
import type {SourceOptions} from '../options/SourceOptions';

import getNamesFromID from './getNamesFromID';
import jscs from 'jscodeshift';

type ConfigEntry = {
  searchTerms: [any, ?Object],
  getNodes: (path: NodePath) => Array<Node>,
};

/**
 * These are the ways in which an identifier might be declared, note that these
 * identifiers are safe to use in code. They should not include types that have
 * been declared.
 */
const CONFIG: Array<ConfigEntry> = [
  // function foo(...rest) {}
  {
    searchTerms: [jscs.FunctionDeclaration],
    getNodes: path => [path.node.id, path.node.rest].concat(path.node.params),
  },

  // foo(...rest) {}, in a class body for example
  {
    searchTerms: [jscs.FunctionExpression],
    getNodes: path => [path.node.rest].concat(path.node.params),
  },

  // var foo;
  {
    searchTerms: [jscs.VariableDeclaration],
    getNodes: path => path.node.declarations.map(declaration => declaration.id),
  },

  // class foo {}
  {
    searchTerms: [jscs.ClassDeclaration],
    getNodes: path => [path.node.id],
  },

  // (foo, ...rest) => {}
  {
    searchTerms: [jscs.ArrowFunctionExpression],
    getNodes: path => [path.node.rest].concat(path.node.params),
  },

  // try {} catch (foo) {}
  {
    searchTerms: [jscs.CatchClause],
    getNodes: path => [path.node.param],
  },

  // function foo(a = b) {}
  {
    searchTerms: [jscs.AssignmentPattern],
    getNodes: path => [path.node.left],
  },
];

/**
 * This will get a list of all identifiers that are declared within root's AST
 */
function getDeclaredIdentifiers(
  root: Collection,
  options: SourceOptions,
  filters?: ?Array<(path: NodePath) => boolean>,
): Set<string> {
  // Start with the globals since they are always "declared" and safe to use.
  const {moduleMap} = options;
  const ids = new Set(moduleMap.getBuiltIns());
  CONFIG.forEach(config => {
    root
      .find(config.searchTerms[0], config.searchTerms[1])
      .filter(path => (filters ? filters.every(filter => filter(path)) : true))
      .forEach(path => {
        const nodes = config.getNodes(path);
        nodes.forEach(node => {
          const names = getNamesFromID(node);
          for (const name of names) {
            ids.add(name);
          }
        });
      });
  });
  return ids;
}

module.exports = getDeclaredIdentifiers;
