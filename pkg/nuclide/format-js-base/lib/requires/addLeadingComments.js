'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Collection, Node} from '../types/ast';

var FirstNode = require('../utils/FirstNode');

function addLeadingComments(root: Collection, comments: ?Array<Node>): void {
  if (!comments || comments.length === 0) {
    return;
  }

  var firstPath = FirstNode.get(root);
  if (!firstPath) {
    return;
  }
  var first = firstPath.node;
  first.comments = first.comments ? comments.concat(first.comments) : comments;
  firstPath.replace(first);
}

module.exports = addLeadingComments;
