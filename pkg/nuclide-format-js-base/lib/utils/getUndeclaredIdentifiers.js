

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var getDeclaredIdentifiers = require('./getDeclaredIdentifiers');
var getNonDeclarationIdentifiers = require('./getNonDeclarationIdentifiers');

/**
 * This will get a list of all identifiers that are used but undeclared.
 */
function getUndeclaredIdentifiers(root, options) {
  var declared = getDeclaredIdentifiers(root, options);
  var undeclared = getNonDeclarationIdentifiers(root);
  // now remove anything that was declared
  for (var _name of declared) {
    undeclared['delete'](_name);
  }
  return undeclared;
}

module.exports = getUndeclaredIdentifiers;