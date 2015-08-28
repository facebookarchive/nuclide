'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AbsolutePath} from '../types/common';
import type {Collection, Node, NodePath} from '../types/ast';

var jscs = require('jscodeshift');

type ConfigEntry = {
  searchTerms: [any, Object],
  getNodes: (path: NodePath) => Array<Node>,
};

/**
 * These are the ways in which one might access an undeclared identifier. This
 * should only apply to actual code, not accessing undeclared types.
 */
var CONFIG: Array<ConfigEntry> = [
  // foo;
  {
    searchTerms: [jscs.ExpressionStatement],
    getNodes: path => [path.node.expression],
  },

  // foo(bar);
  {
    searchTerms: [jscs.CallExpression],
    getNodes: path => [path.node.callee].concat(path.node.arguments),
  },

  // foo.declared;
  {
    searchTerms: [jscs.MemberExpression],
    getNodes: path => [path.node.object],
  },

  // foo = bar;
  {
    searchTerms: [jscs.AssignmentExpression],
    getNodes: path => [path.node.left, path.node.right],
  },

  // class declared extends foo {}
  {
    searchTerms: [jscs.ClassDeclaration],
    getNodes: path => [path.node.superClass],
  },

  // var declared = foo;
  {
    searchTerms: [jscs.VariableDeclarator],
    getNodes: path => [path.node.init],
  },

  // switch (declared) { case foo: break; }
  {
    searchTerms: [jscs.SwitchCase],
    getNodes: path => [path.node.test],
  },

  // {declared: foo}
  {
    searchTerms: [jscs.ObjectExpression],
    getNodes: path => path.node.properties.map(prop => prop.value),
  },

  // return foo;
  {
    searchTerms: [jscs.ReturnStatement],
    getNodes: path => [path.node.argument],
  },

  // if (foo) {}
  {
    searchTerms: [jscs.IfStatement],
    getNodes: path => [path.node.test],
  },

  // switch (foo) {}
  {
    searchTerms: [jscs.SwitchStatement],
    getNodes: path => [path.node.discriminant],
  },

  // !foo;
  {
    searchTerms: [jscs.UnaryExpression],
    getNodes: path => [path.node.argument],
  },

  // foo || bar;
  {
    searchTerms: [jscs.BinaryExpression],
    getNodes: path => [path.node.left, path.node.right],
  },

  // foo < bar;
  {
    searchTerms: [jscs.LogicalExpression],
    getNodes: path => [path.node.left, path.node.right],
  },

  // foo ? bar : baz;
  {
    searchTerms: [jscs.ConditionalExpression],
    getNodes: path => [
      path.node.test,
      path.node.alternate,
      path.node.consequent,
    ],
  },

  // new Foo()
  {
    searchTerms: [jscs.NewExpression],
    getNodes: path => [path.node.callee].concat(path.node.arguments),
  },

  // foo++;
  {
    searchTerms: [jscs.UpdateExpression],
    getNodes: path => [path.node.argument],
  },

  // <Element attribute={foo} />
  {
    searchTerms: [jscs.JSXExpressionContainer],
    getNodes: path => [path.node.expression],
  },

  // for (foo in bar) {}
  {
    searchTerms: [jscs.ForInStatement],
    getNodes: path => [path.node.left, path.node.right],
  },

  // for (foo of bar) {}
  {
    searchTerms: [jscs.ForOfStatement],
    getNodes: path => [path.node.left, path.node.right],
  },

  // for (foo; bar; baz) {}
  {
    searchTerms: [jscs.ForStatement],
    getNodes: path => [path.node.init, path.node.test, path.node.update],
  },

  // while (foo) {}
  {
    searchTerms: [jscs.WhileStatement],
    getNodes: path => [path.node.test],
  },

  // do {} while (foo)
  {
    searchTerms: [jscs.DoWhileStatement],
    getNodes: path => [path.node.test],
  },

  // [foo]
  {
    searchTerms: [jscs.ArrayExpression],
    getNodes: path => path.node.elements,
  },
];

/**
 * This will get a list of all identifiers that are not from a declaration.
 *
 * NOTE: this can get identifiers that are declared, if you want access to
 * identifiers that are access but undeclared see getUndeclaredIdentifiers
 */
function getNonDeclarationIdentifiers(
  root: Collection,
  sourcePath: AbsolutePath
): Set<string> {
  var ids = new Set();
  CONFIG.forEach(config => {
    root
      .find(config.searchTerms[0], config.searchTerms[1])
      .forEach(path => {
        var nodes = config.getNodes(path);
        nodes.forEach(node => {
          if (jscs.Identifier.check(node)) {
            ids.add(node.name);
          }
        });
      });
  });
  return ids;
}

module.exports = getNonDeclarationIdentifiers;
