function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utilsFirstNode = require('../utils/FirstNode');

var _utilsFirstNode2 = _interopRequireDefault(_utilsFirstNode);

var _utilsGetUndeclaredTypes = require('../utils/getUndeclaredTypes');

var _utilsGetUndeclaredTypes2 = _interopRequireDefault(_utilsGetUndeclaredTypes);

function addMissingTypes(root, options) {
  var first = _utilsFirstNode2.default.get(root);
  if (!first) {
    return;
  }
  var _first = first; // For flow.

  var moduleMap = options.moduleMap;

  var requireOptions = {
    sourcePath: options.sourcePath,
    typeImport: true
  };

  (0, _utilsGetUndeclaredTypes2.default)(root, options).forEach(function (name) {
    var node = moduleMap.getRequire(name, requireOptions);
    _first.insertBefore(node);
  });
}

module.exports = addMissingTypes;