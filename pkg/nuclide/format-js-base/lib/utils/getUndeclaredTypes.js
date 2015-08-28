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
var getDeclaredTypes = require('./getDeclaredTypes');
var getNonDeclarationTypes = require('./getNonDeclarationTypes');

/**
 * This will get a list of all types that are used but undeclared.
 */
function getUndeclaredTypes(
  root: Collection,
  sourcePath: AbsolutePath
): Set<string> {
  var declaredIdentifiers = getDeclaredIdentifiers(root, sourcePath);
  var declaredTypes = getDeclaredTypes(root, sourcePath);

  var undeclared = getNonDeclarationTypes(root, sourcePath);
  // now remove anything that was declared
  for (var name of declaredIdentifiers) {
    undeclared.delete(name);
  }
  for (var name of declaredTypes) {
    undeclared.delete(name);
  }
  return undeclared;
}

module.exports = getUndeclaredTypes;
