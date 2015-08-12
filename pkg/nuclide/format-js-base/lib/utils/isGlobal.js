'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NodePath} from '../types/ast';

/**
 * Tests if a NodePath is in the global scope
 */
function isGlobal(path: NodePath): boolean {
  return !!path.scope.isGlobal;
}

module.exports = isGlobal;
