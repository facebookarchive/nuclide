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
import type {Options} from '../types/options';

var getDeclaredIdentifiers = require('./getDeclaredIdentifiers');
var getNonDeclarationIdentifiers = require('./getNonDeclarationIdentifiers');

/**
 * This will get a list of all identifiers that are used but undeclared.
 */
function getUndeclaredIdentifiers(
  root: Collection,
  options: Options
): Set<string> {
  var declared = getDeclaredIdentifiers(root, options);
  var undeclared = getNonDeclarationIdentifiers(root, options);
  // now remove anything that was declared
  for (var name of declared) {
    undeclared.delete(name);
  }
  return undeclared;
}

module.exports = getUndeclaredIdentifiers;
