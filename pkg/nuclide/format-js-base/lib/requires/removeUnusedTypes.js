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

var getDeclaredIdentifiers = require('../utils/getDeclaredIdentifiers');
var getDeclaredTypes = require('../utils/getDeclaredTypes');
var getNonDeclarationTypes = require('../utils/getNonDeclarationTypes');
var isGlobal = require('../utils/isGlobal');
var jscs = require('jscodeshift');

var {match} = jscs;

type ConfigEntry = {
  searchTerms: [any, Object],
  filters: Array<(path: NodePath) => boolean>,
  getNames: (node: Node) => Array<string>,
};

// These are the things we should try to remove.
var CONFIG: Array<ConfigEntry> = [
  // import type Foo from 'Foo';
  {
    searchTerms: [
      jscs.ImportDeclaration,
      {importKind: 'type'},
    ],
    filters: [isGlobal],
    getNames: node => node.specifiers.map(specifier => specifier.local.name),
  },
];

function removeUnusedTypes(root: Collection, options: SourceOptions): void {
  var declared = getDeclaredIdentifiers(root, options);
  var used = getNonDeclarationTypes(root, options);
  var nonTypeImport = getDeclaredTypes(
    root,
    options,
    [path => !isTypeImportDeclaration(path.node)]
  );
  // Remove things based on the config.
  CONFIG.forEach(config => {
    root
      .find(config.searchTerms[0], config.searchTerms[1])
      .filter(path => config.filters.every(filter => filter(path)))
      .filter(path => config.getNames(path.node).every(
        name => !used.has(name) || declared.has(name) || nonTypeImport.has(name)
      ))
      .remove();
  });
}

function isTypeImportDeclaration(node: NodePath): boolean {
  return match(node, {
    type: 'ImportDeclaration',
    importKind: 'type',
  });
}

module.exports = removeUnusedTypes;
