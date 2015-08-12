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

var addMissingRequires = require('./addMissingRequires');
var addMissingTypes = require('./addMissingTypes');
var formatRequires = require('./formatRequires');
var removeUnusedRequires = require('./removeUnusedRequires');
var removeUnusedTypes = require('./removeUnusedTypes');

/**
 * This is the collection of transforms that affect requires.
 *
 * TODO: Integrate with flow to ensure modules exist.
 * TODO: Add a more cental place to resolve a require's name that can take into
 * account aliases, known modules, if it's a react module, etc.
 */
function transform(root: Collection, options: Options): void {
  removeUnusedRequires(root, options);
  addMissingRequires(root, options);
  removeUnusedTypes(root, options);
  addMissingTypes(root, options);
  formatRequires(root, options);
}

module.exports = transform;
