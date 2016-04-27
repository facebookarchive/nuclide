

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var wrapStatement = require('../../wrappers/simple/wrapStatement');

function printReturnStatement(print, node) {
  var wrap = function wrap(x) {
    return wrapStatement(print, node, x);
  };

  var parts = ['return'];
  if (node.argument) {
    var argument = node.argument;
    parts = parts.concat([markers.space, print(argument)]);
  }
  return wrap([parts, markers.noBreak, ';']);
}

module.exports = printReturnStatement;