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
import type {Collection} from '../types/ast';

var getDeclaredIdentifiers = require('./getDeclaredIdentifiers');
var getNonDeclarationIdentifiers = require('./getNonDeclarationIdentifiers');

/**
 * This will get a list of all identifiers that are used but undeclared.
 */
function getUndeclaredIdentifiers(
  root: Collection,
  sourcePath: AbsolutePath
): Set<string> {
  var declared = getDeclaredIdentifiers(root, sourcePath);
  var undeclared = getNonDeclarationIdentifiers(root, sourcePath);
  // now remove anything that was declared
  for (var name of declared) {
    undeclared.delete(name);
  }
  return undeclared;
}

module.exports = getUndeclaredIdentifiers;
