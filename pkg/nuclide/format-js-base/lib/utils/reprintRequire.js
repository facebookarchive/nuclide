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

var jscs = require('jscodeshift');

var oneLineObjectPattern = require('./oneLineObjectPattern');

/**
 * This takes in a require node and reprints it. This should remove whitespace
 * and allow us to have a consistent formatting of all requires.
 *
 * TODO: This trashes comments on requires, fix that!
 */
 function reprintRequire(node: Node): Node {
   var {statement} = jscs.template;

   if (jscs.ExpressionStatement.check(node)) {
     return statement`${node.expression}`;
   }

   if (jscs.VariableDeclaration.check(node)) {
     var declaration = node.declarations[0];
     if (jscs.Identifier.check(declaration.id)) {
       return statement`var ${declaration.id} = ${declaration.init};`;
     }
     if (jscs.ObjectPattern.check(declaration.id)) {
       // create a temporary node
       var tmp = statement`var _ = ${declaration.init};`;

       // sort the properties
       declaration.id.properties.sort((prop1, prop2) => {
         if (prop1.key.name < prop2.key.name) {
           return -1;
         } else if (prop1.key.name > prop2.key.name) {
           return 1;
         } else {
           return 0;
         }
       });

       // make the object pattern one line and update tmp with it
       tmp.declarations[0].id = oneLineObjectPattern(declaration.id);
       return tmp;
     }
   }

   if (jscs.ImportDeclaration.check(node) && node.importKind === 'type') {
     // We only handle re-printing default specifier for now
     // TODO: handle namespace, and standard specifiers
     if (
       node.specifiers.length === 1 &&
       jscs.ImportDefaultSpecifier.check(node.specifiers[0])
     ) {
       var specifier = node.specifiers[0];
       var tmp = statement`import type _ from '_'`;
       tmp.specifiers[0].id = jscs.identifier(specifier.local.name);
       tmp.specifiers[0].local = jscs.identifier(specifier.local.name);
       tmp.source = jscs.literal(node.source.value);
       return tmp;
     }
   }

   return node;
 }

module.exports = reprintRequire;
