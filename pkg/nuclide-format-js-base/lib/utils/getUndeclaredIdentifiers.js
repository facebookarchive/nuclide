

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

var _getNonDeclarationIdentifiers2;

function _getNonDeclarationIdentifiers() {
  return _getNonDeclarationIdentifiers2 = _interopRequireDefault(require('./getNonDeclarationIdentifiers'));
}

/**
 * This will get a list of all identifiers that are used but undeclared.
 */
function getUndeclaredIdentifiers(root, options) {
  var declared = (0, (_getDeclaredIdentifiers2 || _getDeclaredIdentifiers()).default)(root, options);
  var undeclared = (0, (_getNonDeclarationIdentifiers2 || _getNonDeclarationIdentifiers()).default)(root);
  // now remove anything that was declared
  for (var _name of declared) {
    undeclared.delete(_name);
  }
  return undeclared;
}

module.exports = getUndeclaredIdentifiers;