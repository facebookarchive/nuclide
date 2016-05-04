function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utilsGetDeclaredIdentifiers = require('../utils/getDeclaredIdentifiers');

var _utilsGetDeclaredIdentifiers2 = _interopRequireDefault(_utilsGetDeclaredIdentifiers);

var _utilsGetNamesFromID = require('../utils/getNamesFromID');

var _utilsGetNamesFromID2 = _interopRequireDefault(_utilsGetNamesFromID);

var _utilsGetNonDeclarationIdentifiers = require('../utils/getNonDeclarationIdentifiers');

var _utilsGetNonDeclarationIdentifiers2 = _interopRequireDefault(_utilsGetNonDeclarationIdentifiers);

var _utilsHasOneRequireDeclaration = require('../utils/hasOneRequireDeclaration');

var _utilsHasOneRequireDeclaration2 = _interopRequireDefault(_utilsHasOneRequireDeclaration);

var _utilsIsGlobal = require('../utils/isGlobal');

var _utilsIsGlobal2 = _interopRequireDefault(_utilsIsGlobal);

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

function removeUnusedRequires(root, options) {
  var used = (0, _utilsGetNonDeclarationIdentifiers2.default)(root, options);
  var nonRequires = (0, _utilsGetDeclaredIdentifiers2.default)(root, options, [function (path) {
    return !(0, _utilsHasOneRequireDeclaration2.default)(path.node);
  }]);

  // Remove unused requires.
  root.find(_jscodeshift2.default.VariableDeclaration).filter(function (path) {
    return (0, _utilsIsGlobal2.default)(path);
  }).filter(function (path) {
    return (0, _utilsHasOneRequireDeclaration2.default)(path.node);
  }).filter(function (path) {
    var id = path.node.declarations[0].id;
    var names = (0, _utilsGetNamesFromID2.default)(id);
    for (var _name of names) {
      if (used.has(_name) && !nonRequires.has(_name)) {
        return false;
      }
    }
    return true;
  }).remove();
}

module.exports = removeUnusedRequires;