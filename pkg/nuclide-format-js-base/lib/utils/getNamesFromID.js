

var jscs = require('jscodeshift');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function getNamesFromID(node) {
  var ids = new Set();
  if (jscs.Identifier.check(node)) {
    ids.add(node.name);
  } else if (jscs.RestElement.check(node) || jscs.SpreadElement.check(node) || jscs.SpreadProperty.check(node)) {
    for (var id of getNamesFromID(node.argument)) {
      ids.add(id);
    }
  } else if (jscs.ObjectPattern.check(node)) {
    node.properties.forEach(function (prop) {
      // Generally props have a value, if it is a spread property it doesn't.
      for (var id of getNamesFromID(prop.value || prop)) {
        ids.add(id);
      }
    });
  } else if (jscs.ArrayPattern.check(node)) {
    node.elements.forEach(function (element) {
      for (var id of getNamesFromID(element)) {
        ids.add(id);
      }
    });
  }
  return ids;
}

module.exports = getNamesFromID;