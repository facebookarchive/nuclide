

var flatten = require('../../utils/flatten');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var printComment = require('./printComment');

function printComments(nodes) {
  if (!Array.isArray(nodes)) {
    return [];
  }
  return flatten(nodes.map(function (n) {
    return printComment(n);
  }));
}

module.exports = printComments;