

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printClassProperty(print, node) {
  var parts = [];
  if (node['static']) {
    parts = parts.concat(['static', markers.noBreak, markers.space]);
  }

  // TODO: Computed class properties don't seem to be supported by Babylon yet.

  parts = parts.concat([print(node.key)]);

  if (node.value) {
    parts = parts.concat([markers.noBreak, markers.space, '=', markers.noBreak, markers.space, print(node.value)]);
  }

  if (node.typeAnnotation) {
    parts = parts.concat(print(node.typeAnnotation));
  }

  parts = parts.concat([markers.noBreak, ';', markers.hardBreak]);

  return flatten(parts);
}

module.exports = printClassProperty;