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

var jscs = require('jscodeshift');

type ConfigEntry = {
  searchTerms: [any, Object],
  getNodes: (path: NodePath) => Array<Node>,
};

/**
 * These are the ways in which an identifier might be declared, note that these
 * identifiers are safe to use in code. They should not include types that have
 * been declared.
 */
var CONFIG: Array<ConfigEntry> = [
  // function foo() {}
  {
    searchTerms: [jscs.FunctionDeclaration],
    getNodes: path => [path.node.id].concat(path.node.params),
  },

  // foo() {}, in a class body for example
  {
    searchTerms: [jscs.FunctionExpression],
    getNodes: path => path.node.params,
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

  // (foo) => {}
  {
    searchTerms: [jscs.ArrowFunctionExpression],
    getNodes: path => path.node.params,
  },

  // try {} catch (foo) {}
  {
    searchTerms: [jscs.CatchClause],
    getNodes: path => [path.node.param],
  },
];

/**
 * This will get a list of all identifiers that are declared within root's AST
 */
function getDeclaredIdentifiers(
  root: Collection,
  options: SourceOptions
): Set<string> {
  // Start with the globals since they are always "declared" and safe to use.
  var {moduleMap} = options;
  var ids = new Set(moduleMap.getBuiltIns());
  CONFIG.forEach(config => {
    root
      .find(config.searchTerms[0], config.searchTerms[1])
      .forEach(path => {
        var nodes = config.getNodes(path);
        nodes.forEach(node => {
          // Each node can generally be an Identifier, ObjectPattern, or
          // ArrayPattern. Sometimes an ObjectPattern or ArrayPattern should
          // not be allowed in a location, but it shouldn't hurt to always test
          // for it.
          if (jscs.Identifier.check(node)) {
            ids.add(node.name);
          } else if (jscs.ObjectPattern.check(node)) {
            node.properties.forEach(prop => {
              if (jscs.Identifier.check(prop.key)) {
                ids.add(prop.key.name);
              }
            });
          } else if (jscs.ArrayPattern.check(node)) {
            node.elements.forEach(element => {
              if (jscs.Identifier.check(element)) {
                ids.add(element.name);
              }
            });
          }
        });
      });
  });
  return ids;
}

module.exports = getDeclaredIdentifiers;
