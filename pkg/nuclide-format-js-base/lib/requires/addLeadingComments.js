

var FirstNode = require('../utils/FirstNode');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var reprintComment = require('../utils/reprintComment');

function addLeadingComments(root, comments) {
  if (!comments || comments.length === 0) {
    return;
  }

  var firstPath = FirstNode.get(root);
  if (!firstPath) {
    return;
  }
  var first = firstPath.node;
  first.comments = first.comments ? comments.concat(first.comments) : comments;
  first.comments = first.comments.map(function (comment) {
    return reprintComment(comment);
  });
  firstPath.replace(first);
}

module.exports = addLeadingComments;