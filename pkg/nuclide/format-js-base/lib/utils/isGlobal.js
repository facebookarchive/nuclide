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
 *
 * TODO: This doesn't quite do what I expect, e.g. if (x) { var foo = 4; }; will
 * cause foo to be in the global scope due to hoisting.
 */
function isGlobal(path: NodePath): boolean {
  return !!path.scope.isGlobal;
}

module.exports = isGlobal;
