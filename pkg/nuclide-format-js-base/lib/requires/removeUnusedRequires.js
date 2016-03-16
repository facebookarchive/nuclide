'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Collection} from '../types/ast';
import type {SourceOptions} from '../options/SourceOptions';

const getDeclaredIdentifiers = require('../utils/getDeclaredIdentifiers');
const getNamesFromID = require('../utils/getNamesFromID');
const getNonDeclarationIdentifiers = require('../utils/getNonDeclarationIdentifiers');
const hasOneRequireDeclaration = require('../utils/hasOneRequireDeclaration');
const isGlobal = require('../utils/isGlobal');
const jscs = require('jscodeshift');

function removeUnusedRequires(
  root: Collection,
  options: SourceOptions,
): void {
  const used = getNonDeclarationIdentifiers(root, options);
  const nonRequires = getDeclaredIdentifiers(
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
      const id = path.node.declarations[0].id;
      const names = getNamesFromID(id);
      for (const name of names) {
        if (used.has(name) && !nonRequires.has(name)) {
          return false;
        }
      }
      return true;
    })
    .remove();
}

module.exports = removeUnusedRequires;
