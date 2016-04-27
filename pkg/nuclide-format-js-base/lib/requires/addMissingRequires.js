

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FirstNode = require('../utils/FirstNode');

var getUndeclaredIdentifiers = require('../utils/getUndeclaredIdentifiers');
var getUndeclaredJSXIdentifiers = require('../utils/getUndeclaredJSXIdentifiers');

function addMissingRequires(root, options) {
  var first = FirstNode.get(root);
  if (!first) {
    return;
  }
  var _first = first; // For flow.

  var moduleMap = options.moduleMap;

  // Add the missing requires.
  getUndeclaredIdentifiers(root, options).forEach(function (name) {
    var node = moduleMap.getRequire(name, { sourcePath: options.sourcePath });
    _first.insertBefore(node);
  });

  // Add missing JSX requires.
  getUndeclaredJSXIdentifiers(root, options).forEach(function (name) {
    var node = moduleMap.getRequire(name, {
      sourcePath: options.sourcePath,
      jsxIdentifier: true
    });
    _first.insertBefore(node);
  });
}

module.exports = addMissingRequires;