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

var _utilsGetDeclaredTypes = require('../utils/getDeclaredTypes');

var _utilsGetDeclaredTypes2 = _interopRequireDefault(_utilsGetDeclaredTypes);

var _utilsGetNonDeclarationTypes = require('../utils/getNonDeclarationTypes');

var _utilsGetNonDeclarationTypes2 = _interopRequireDefault(_utilsGetNonDeclarationTypes);

var _utilsIsGlobal = require('../utils/isGlobal');

var _utilsIsGlobal2 = _interopRequireDefault(_utilsIsGlobal);

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var match = _jscodeshift2.default.match;

// These are the things we should try to remove.
var CONFIG = [
// import type Foo from 'Foo';
{
  searchTerms: [_jscodeshift2.default.ImportDeclaration, { importKind: 'type' }],
  filters: [_utilsIsGlobal2.default],
  getNames: function getNames(node) {
    return node.specifiers.map(function (specifier) {
      return specifier.local.name;
    });
  }
}];

function removeUnusedTypes(root, options) {
  var declared = (0, _utilsGetDeclaredIdentifiers2.default)(root, options);
  var used = (0, _utilsGetNonDeclarationTypes2.default)(root, options);
  var nonTypeImport = (0, _utilsGetDeclaredTypes2.default)(root, options, [function (path) {
    return !isTypeImportDeclaration(path.node);
  }]);
  // Remove things based on the config.
  CONFIG.forEach(function (config) {
    root.find(config.searchTerms[0], config.searchTerms[1]).filter(function (path) {
      return config.filters.every(function (filter) {
        return filter(path);
      });
    }).filter(function (path) {
      return config.getNames(path.node).every(function (name) {
        return !used.has(name) || declared.has(name) || nonTypeImport.has(name);
      });
    }).remove();
  });
}

function isTypeImportDeclaration(node) {
  return match(node, {
    type: 'ImportDeclaration',
    importKind: 'type'
  });
}

module.exports = removeUnusedTypes;