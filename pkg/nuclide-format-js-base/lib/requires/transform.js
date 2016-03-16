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
import type {TransformKey} from '../types/transforms';

const addLeadingComments = require('./addLeadingComments');
const addMissingRequires = require('./addMissingRequires');
const addMissingTypes = require('./addMissingTypes');
const formatRequires = require('./formatRequires');
const removeLeadingComments = require('./removeLeadingComments');
const removeUnusedRequires = require('./removeUnusedRequires');
const removeUnusedTypes = require('./removeUnusedTypes');

/**
 * This is the collection of transforms that affect requires.
 */
function transform(root: Collection, options: SourceOptions): void {
  const blacklist: Set<TransformKey> = options.blacklist || new Set();
  let comments;
  if (!blacklist.has('requires.transferComments')) {
    comments = removeLeadingComments(root);
  }
  if (!blacklist.has('requires.removeUnusedRequires')) {
    removeUnusedRequires(root, options);
  }
  if (!blacklist.has('requires.addMissingRequires')) {
    addMissingRequires(root, options);
  }
  if (!blacklist.has('requires.removeUnusedTypes')) {
    removeUnusedTypes(root, options);
  }
  if (!blacklist.has('requires.addMissingTypes')) {
    addMissingTypes(root, options);
  }
  if (!blacklist.has('requires.formatRequires')) {
    formatRequires(root);
  }
  if (!blacklist.has('requires.transferComments')) {
    addLeadingComments(root, comments);
  }
}

module.exports = transform;
