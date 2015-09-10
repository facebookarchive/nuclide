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
var getNamesFromID = require('../utils/getNamesFromID');
var getNonDeclarationIdentifiers = require('../utils/getNonDeclarationIdentifiers');
var hasOneRequireDeclaration = require('../utils/hasOneRequireDeclaration');
var isGlobal = require('../utils/isGlobal');
var jscs = require('jscodeshift');

function removeUnusedRequires(
  root: Collection,
  options: SourceOptions,
): void {
  var used = getNonDeclarationIdentifiers(root, options);
  var nonRequires = getDeclaredIdentifiers(
    root,
    options,
    [path => !hasOneRequireDeclaration(path.node)]
  );

  // Remove unused requires.
  root
    .find(jscs.VariableDeclaration)
    .filter(path => isGlobal(path))
    .filter(path => hasOneRequireDeclaration(path.node))
    .filter(path => {
      var id = path.node.declarations[0].id;
      var names = getNamesFromID(id);
      for (var name of names) {
        if (used.has(name) && !nonRequires.has(name)) {
          return false;
        }
      }
      return true;
    })
    .remove();
}

module.exports = removeUnusedRequires;
