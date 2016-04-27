

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var getDeclaredIdentifiers = require('../utils/getDeclaredIdentifiers');
var getNamesFromID = require('../utils/getNamesFromID');
var getNonDeclarationIdentifiers = require('../utils/getNonDeclarationIdentifiers');
var hasOneRequireDeclaration = require('../utils/hasOneRequireDeclaration');
var isGlobal = require('../utils/isGlobal');
var jscs = require('jscodeshift');

function removeUnusedRequires(root, options) {
  var used = getNonDeclarationIdentifiers(root, options);
  var nonRequires = getDeclaredIdentifiers(root, options, [function (path) {
    return !hasOneRequireDeclaration(path.node);
  }]);

  // Remove unused requires.
  root.find(jscs.VariableDeclaration).filter(function (path) {
    return isGlobal(path);
  }).filter(function (path) {
    return hasOneRequireDeclaration(path.node);
  }).filter(function (path) {
    var id = path.node.declarations[0].id;
    var names = getNamesFromID(id);
    for (var _name of names) {
      if (used.has(_name) && !nonRequires.has(_name)) {
        return false;
      }
    }
    return true;
  }).remove();
}

module.exports = removeUnusedRequires;