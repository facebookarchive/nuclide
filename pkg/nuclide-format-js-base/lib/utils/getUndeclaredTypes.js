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

var _getDeclaredTypes = require('./getDeclaredTypes');

var _getDeclaredTypes2 = _interopRequireDefault(_getDeclaredTypes);

var _getNonDeclarationTypes = require('./getNonDeclarationTypes');

var _getNonDeclarationTypes2 = _interopRequireDefault(_getNonDeclarationTypes);

/**
 * This will get a list of all types that are used but undeclared.
 */
function getUndeclaredTypes(root, options) {
  var declaredIdentifiers = (0, _getDeclaredIdentifiers2.default)(root, options);
  var declaredTypes = (0, _getDeclaredTypes2.default)(root, options);

  var undeclared = (0, _getNonDeclarationTypes2.default)(root);
  // now remove anything that was declared
  for (var _name of declaredIdentifiers) {
    undeclared.delete(_name);
  }
  for (var _name2 of declaredTypes) {
    undeclared.delete(_name2);
  }
  return undeclared;
}

module.exports = getUndeclaredTypes;