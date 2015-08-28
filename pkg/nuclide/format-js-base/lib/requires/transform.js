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

var addMissingRequires = require('./addMissingRequires');
var addMissingTypes = require('./addMissingTypes');
var formatRequires = require('./formatRequires');
var removeUnusedRequires = require('./removeUnusedRequires');
var removeUnusedTypes = require('./removeUnusedTypes');

/**
 * This is the collection of transforms that affect requires.
 *
 * TODO: Integrate with flow to ensure modules exist.
 */
function transform(root: Collection, sourcePath: AbsolutePath): void {
  removeUnusedRequires(root, sourcePath);
  addMissingRequires(root, sourcePath);
  removeUnusedTypes(root, sourcePath);
  addMissingTypes(root, sourcePath);
  formatRequires(root, sourcePath);
}

module.exports = transform;
