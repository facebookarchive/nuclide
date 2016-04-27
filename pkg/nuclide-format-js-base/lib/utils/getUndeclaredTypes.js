

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var getDeclaredIdentifiers = require('./getDeclaredIdentifiers');
var getDeclaredTypes = require('./getDeclaredTypes');
var getNonDeclarationTypes = require('./getNonDeclarationTypes');

/**
 * This will get a list of all types that are used but undeclared.
 */
function getUndeclaredTypes(root, options) {
  var declaredIdentifiers = getDeclaredIdentifiers(root, options);
  var declaredTypes = getDeclaredTypes(root, options);

  var undeclared = getNonDeclarationTypes(root);
  // now remove anything that was declared
  for (var _name of declaredIdentifiers) {
    undeclared['delete'](_name);
  }
  for (var _name2 of declaredTypes) {
    undeclared['delete'](_name2);
  }
  return undeclared;
}

module.exports = getUndeclaredTypes;