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

var _getNonDeclarationIdentifiers = require('./getNonDeclarationIdentifiers');

var _getNonDeclarationIdentifiers2 = _interopRequireDefault(_getNonDeclarationIdentifiers);

/**
 * This will get a list of all identifiers that are used but undeclared.
 */
function getUndeclaredIdentifiers(root, options) {
  var declared = (0, _getDeclaredIdentifiers2.default)(root, options);
  var undeclared = (0, _getNonDeclarationIdentifiers2.default)(root);
  // now remove anything that was declared
  for (var _name of declared) {
    undeclared.delete(_name);
  }
  return undeclared;
}

module.exports = getUndeclaredIdentifiers;