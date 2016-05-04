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

var _utilsGetUndeclaredIdentifiers = require('../utils/getUndeclaredIdentifiers');

var _utilsGetUndeclaredIdentifiers2 = _interopRequireDefault(_utilsGetUndeclaredIdentifiers);

var _utilsGetUndeclaredJSXIdentifiers = require('../utils/getUndeclaredJSXIdentifiers');

var _utilsGetUndeclaredJSXIdentifiers2 = _interopRequireDefault(_utilsGetUndeclaredJSXIdentifiers);

function addMissingRequires(root, options) {
  var first = _utilsFirstNode2.default.get(root);
  if (!first) {
    return;
  }
  var _first = first; // For flow.

  var moduleMap = options.moduleMap;

  // Add the missing requires.
  (0, _utilsGetUndeclaredIdentifiers2.default)(root, options).forEach(function (name) {
    var node = moduleMap.getRequire(name, { sourcePath: options.sourcePath });
    _first.insertBefore(node);
  });

  // Add missing JSX requires.
  (0, _utilsGetUndeclaredJSXIdentifiers2.default)(root, options).forEach(function (name) {
    var node = moduleMap.getRequire(name, {
      sourcePath: options.sourcePath,
      jsxIdentifier: true
    });
    _first.insertBefore(node);
  });
}

module.exports = addMissingRequires;