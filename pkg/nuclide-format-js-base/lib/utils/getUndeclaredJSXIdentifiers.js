function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _getDeclaredIdentifiers = require('./getDeclaredIdentifiers');

var _getDeclaredIdentifiers2 = _interopRequireDefault(_getDeclaredIdentifiers);

var _getJSXIdentifiers = require('./getJSXIdentifiers');

var _getJSXIdentifiers2 = _interopRequireDefault(_getJSXIdentifiers);

function getUndeclaredJSXIdentifiers(root, options) {
  var declaredIdentifiers = (0, _getDeclaredIdentifiers2.default)(root, options);
  var jsxIdentifiers = (0, _getJSXIdentifiers2.default)(root);
  var undeclared = new Set();
  for (var id of jsxIdentifiers) {
    if (!declaredIdentifiers.has(id)) {
      undeclared.add(id);
    }
  }
  return undeclared;
}

module.exports = getUndeclaredJSXIdentifiers;