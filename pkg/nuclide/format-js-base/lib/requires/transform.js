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

var addMissingRequires = require('./addMissingRequires');
var addMissingTypes = require('./addMissingTypes');
var formatRequires = require('./formatRequires');
var removeUnusedRequires = require('./removeUnusedRequires');
var removeUnusedTypes = require('./removeUnusedTypes');

/**
 * This is the collection of transforms that affect requires.
 */
function transform(root: Collection, options: SourceOptions): void {
  removeUnusedRequires(root, options);
  addMissingRequires(root, options);
  removeUnusedTypes(root, options);
  addMissingTypes(root, options);
  formatRequires(root);
}

module.exports = transform;
