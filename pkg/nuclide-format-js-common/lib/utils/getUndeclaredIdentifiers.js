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

import getDeclaredIdentifiers from './getDeclaredIdentifiers';
import getNonDeclarationIdentifiers from './getNonDeclarationIdentifiers';

/**
 * This will get a list of all identifiers that are used but undeclared.
 */
function getUndeclaredIdentifiers(
  root: Collection,
  options: SourceOptions,
): Set<string> {
  const declared = getDeclaredIdentifiers(root, options);
  const undeclared = getNonDeclarationIdentifiers(root);
  // now remove anything that was declared
  for (const name of declared) {
    undeclared.delete(name);
  }
  return undeclared;
}

module.exports = getUndeclaredIdentifiers;
