'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Node} from '../types/ast';

var {compareStrings} = require('./StringUtils');
var jscs = require('jscodeshift');
var oneLineObjectPattern = require('./oneLineObjectPattern');
var reprintComment = require('./reprintComment');

var {statement} = jscs.template;

/**
 * Thin wrapper to reprint requires, it's wrapped in a new function in order to
 * easily attach comments to the node.
 */
function reprintRequire(node: Node): Node {
  var comments = node.comments;
  var newNode = reprintRequireHelper(node);
  if (comments) {
    newNode.comments = comments.map(comment => reprintComment(comment));
  }
  return newNode;
}

/**
 * This takes in a require node and reprints it. This should remove whitespace
 * and allow us to have a consistent formatting of all requires.
 */
function reprintRequireHelper(node: Node): Node {
   if (jscs.ExpressionStatement.check(node)) {
     return statement`${node.expression}`;
   }

   if (jscs.VariableDeclaration.check(node)) {
     var declaration = node.declarations[0];
     if (jscs.Identifier.check(declaration.id)) {
       return statement`var ${declaration.id} = ${declaration.init};`;
     } else if (jscs.ObjectPattern.check(declaration.id)) {
       // Create a temporary node.
       var tmp = statement`var _ = ${declaration.init};`;

       // Sort the properties.
       declaration.id.properties.sort((prop1, prop2) => {
         return compareStrings(prop1.key.name, prop2.key.name);
       });

       // Make the object pattern one line and update tmp with it.
       tmp.declarations[0].id = oneLineObjectPattern(declaration.id);
       return tmp;
     } else if (jscs.ArrayPattern.check(declaration.id)) {
       return statement`var ${declaration.id} = ${declaration.init}`;
     }
   }

   if (jscs.ImportDeclaration.check(node) && node.importKind === 'type') {
     // Sort the specifiers.
     node.specifiers.sort((one, two) => compareStrings(
       one.local.name,
       two.local.name
     ));
     // TODO: Properly remove new lines from the node.
     return node;
   }
   return node;
 }

module.exports = reprintRequire;
