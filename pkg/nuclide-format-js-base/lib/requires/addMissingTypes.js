

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FirstNode = require('../utils/FirstNode');

var getUndeclaredTypes = require('../utils/getUndeclaredTypes');

function addMissingTypes(root, options) {
  var first = FirstNode.get(root);
  if (!first) {
    return;
  }
  var _first = first; // For flow.

  var moduleMap = options.moduleMap;

  var requireOptions = {
    sourcePath: options.sourcePath,
    typeImport: true
  };

  getUndeclaredTypes(root, options).forEach(function (name) {
    var node = moduleMap.getRequire(name, requireOptions);
    _first.insertBefore(node);
  });
}

module.exports = addMissingTypes;