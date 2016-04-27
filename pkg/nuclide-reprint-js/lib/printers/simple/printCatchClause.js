

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printCatchClause(print, node) {
  return flatten(['catch (', markers.openScope, markers.scopeIndent, markers.scopeBreak, print(node.param), markers.scopeBreak, markers.scopeDedent, markers.closeScope, ')', markers.noBreak, markers.space, print(node.body)]);
}

module.exports = printCatchClause;