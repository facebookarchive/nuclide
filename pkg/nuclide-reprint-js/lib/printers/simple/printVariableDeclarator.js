

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printVariableDeclarator(print, node) {
  if (node.init) {
    var init = node.init;
    return flatten([print(node.id), markers.space, '=', markers.space, print(init)]);
  } else {
    return flatten(print(node.id));
  }
}

module.exports = printVariableDeclarator;