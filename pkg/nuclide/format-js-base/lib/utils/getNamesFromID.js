'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Node} from '../types/ast';

var jscs = require('jscodeshift');

function getNamesFromID(node: Node): Set<string> {
  var ids = new Set();
  if (jscs.Identifier.check(node)) {
    ids.add(node.name);
  } else if (jscs.ObjectPattern.check(node)) {
    node.properties.forEach(prop => {
      for (var id of getNamesFromID(prop.value)) {
        ids.add(id);
      }
    });
  } else if (jscs.ArrayPattern.check(node)) {
    node.elements.forEach(element => {
      var arrayIDs = getNamesFromID(element);
      for (var id of arrayIDs) {
        ids.add(id);
      }
    });
  }
  return ids;
}

module.exports = getNamesFromID;
