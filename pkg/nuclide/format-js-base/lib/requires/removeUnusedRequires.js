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

var getNonDeclarationIdentifiers = require('../utils/getNonDeclarationIdentifiers');
var isGlobal = require('../utils/isGlobal');

type ConfigEntry = {
  searchTerms: [any, Object],
  filters: Array<(path: NodePath) => boolean>,
  getNames: (node: Node) => Array<string>,
};

// These are the things we should try to remove.
var CONFIG: Array<ConfigEntry> = [
  // var foo = require('foo');
  {
    searchTerms: [
      jscs.VariableDeclaration,
      {
        declarations: [{
          id: {type: 'Identifier'},
          init: {callee: {name: 'require'}},
        }],
      },
    ],
    filters: [
      isGlobal,
    ],
    getNames: node => [node.declarations[0].id.name],
  },

  // var foo = require('foo')();
  {
    searchTerms: [
      jscs.VariableDeclaration,
      {
        declarations: [{
          id: {type: 'Identifier'},
          init: {callee: {callee: {name: 'require'}}},
        }],
      },
    ],
    filters: [
      isGlobal,
    ],
    getNames: node => [node.declarations[0].id.name],
  },

  // var alias = require('foo').alias;
  {
    searchTerms: [
      jscs.VariableDeclaration,
      {
        declarations: [{
          id: {type: 'Identifier'},
          init: {object: {callee: {name: 'require'}}},
        }],
      },
    ],
    filters: [
      isGlobal,
    ],
    getNames: node => [node.declarations[0].id.name],
  },

  // var {alias} = require('foo');
  {
    searchTerms: [
      jscs.VariableDeclaration,
      {
        declarations: [{
          id: {type: 'ObjectPattern'},
          init: {callee: {name: 'require'}},
        }],
      },
    ],
    filters: [
      isGlobal,
      path => path.node.declarations[0].id.properties.every(
        prop => prop.shorthand && jscs.Identifier.check(prop.key)
      ),
    ],
    getNames: node => {
      return node.declarations[0].id.properties.map(prop => prop.key.name);
    },
  },

  // var [alias] = require('foo');
  {
    searchTerms: [
      jscs.VariableDeclaration,
      {
        declarations: [{
          id: {type: 'ArrayPattern'},
          init: {callee: {name: 'require'}},
        }],
      },
    ],
    filters: [
      isGlobal,
      path => path.node.declarations[0].id.elements.every(
        element => jscs.Identifier.check(element)
      ),
    ],
    getNames: node => {
      return node.declarations[0].id.elements.map(element => element.name);
    },
  },
];

function removeUnusedRequires(
  root: Collection,
  options: SourceOptions,
): void {
  var used = getNonDeclarationIdentifiers(root, options);
  // Remove things based on the config.
  CONFIG.forEach(config => {
    root
      .find(config.searchTerms[0], config.searchTerms[1])
      .filter(path => config.filters.every(filter => filter(path)))
      .filter(path => config.getNames(path.node).every(name => !used.has(name)))
      .remove();
  });
}

module.exports = removeUnusedRequires;
