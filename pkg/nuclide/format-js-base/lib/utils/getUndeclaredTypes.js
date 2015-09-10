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

var getDeclaredIdentifiers = require('./getDeclaredIdentifiers');
var getDeclaredTypes = require('./getDeclaredTypes');
var getNonDeclarationTypes = require('./getNonDeclarationTypes');

/**
 * This will get a list of all types that are used but undeclared.
 */
function getUndeclaredTypes(
  root: Collection,
  options: SourceOptions
): Set<string> {
  var declaredIdentifiers = getDeclaredIdentifiers(root, options);
  var declaredTypes = getDeclaredTypes(root, options);

  var undeclared = getNonDeclarationTypes(root);
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
