

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _getDeclaredIdentifiers2;

function _getDeclaredIdentifiers() {
  return _getDeclaredIdentifiers2 = _interopRequireDefault(require('./getDeclaredIdentifiers'));
}

var _getJSXIdentifiers2;

function _getJSXIdentifiers() {
  return _getJSXIdentifiers2 = _interopRequireDefault(require('./getJSXIdentifiers'));
}

function getUndeclaredJSXIdentifiers(root, options) {
  var declaredIdentifiers = (0, (_getDeclaredIdentifiers2 || _getDeclaredIdentifiers()).default)(root, options);
  var jsxIdentifiers = (0, (_getJSXIdentifiers2 || _getJSXIdentifiers()).default)(root);
  var undeclared = new Set();
  for (var id of jsxIdentifiers) {
    if (!declaredIdentifiers.has(id)) {
      undeclared.add(id);
    }
  }
  return undeclared;
}

module.exports = getUndeclaredJSXIdentifiers;