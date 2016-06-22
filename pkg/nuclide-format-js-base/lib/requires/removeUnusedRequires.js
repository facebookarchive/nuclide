

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsGetDeclaredIdentifiers2;

function _utilsGetDeclaredIdentifiers() {
  return _utilsGetDeclaredIdentifiers2 = _interopRequireDefault(require('../utils/getDeclaredIdentifiers'));
}

var _utilsGetNamesFromID2;

function _utilsGetNamesFromID() {
  return _utilsGetNamesFromID2 = _interopRequireDefault(require('../utils/getNamesFromID'));
}

var _utilsGetNonDeclarationIdentifiers2;

function _utilsGetNonDeclarationIdentifiers() {
  return _utilsGetNonDeclarationIdentifiers2 = _interopRequireDefault(require('../utils/getNonDeclarationIdentifiers'));
}

var _utilsHasOneRequireDeclaration2;

function _utilsHasOneRequireDeclaration() {
  return _utilsHasOneRequireDeclaration2 = _interopRequireDefault(require('../utils/hasOneRequireDeclaration'));
}

var _utilsIsGlobal2;

function _utilsIsGlobal() {
  return _utilsIsGlobal2 = _interopRequireDefault(require('../utils/isGlobal'));
}

var _jscodeshift2;

function _jscodeshift() {
  return _jscodeshift2 = _interopRequireDefault(require('jscodeshift'));
}

function removeUnusedRequires(root, options) {
  var used = (0, (_utilsGetNonDeclarationIdentifiers2 || _utilsGetNonDeclarationIdentifiers()).default)(root, options);
  var nonRequires = (0, (_utilsGetDeclaredIdentifiers2 || _utilsGetDeclaredIdentifiers()).default)(root, options, [function (path) {
    return !(0, (_utilsHasOneRequireDeclaration2 || _utilsHasOneRequireDeclaration()).default)(path.node);
  }]);

  // Remove unused requires.
  root.find((_jscodeshift2 || _jscodeshift()).default.VariableDeclaration).filter(function (path) {
    return (0, (_utilsIsGlobal2 || _utilsIsGlobal()).default)(path);
  }).filter(function (path) {
    return (0, (_utilsHasOneRequireDeclaration2 || _utilsHasOneRequireDeclaration()).default)(path.node);
  }).filter(function (path) {
    var id = path.node.declarations[0].id;
    var names = (0, (_utilsGetNamesFromID2 || _utilsGetNamesFromID()).default)(id);
    for (var _name of names) {
      if (used.has(_name) && !nonRequires.has(_name)) {
        return false;
      }
    }
    return true;
  }).remove();
}

module.exports = removeUnusedRequires;