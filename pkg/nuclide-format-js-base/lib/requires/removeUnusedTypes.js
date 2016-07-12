

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

var _utilsGetDeclaredTypes2;

function _utilsGetDeclaredTypes() {
  return _utilsGetDeclaredTypes2 = _interopRequireDefault(require('../utils/getDeclaredTypes'));
}

var _utilsGetNonDeclarationTypes2;

function _utilsGetNonDeclarationTypes() {
  return _utilsGetNonDeclarationTypes2 = _interopRequireDefault(require('../utils/getNonDeclarationTypes'));
}

var _utilsIsGlobal2;

function _utilsIsGlobal() {
  return _utilsIsGlobal2 = _interopRequireDefault(require('../utils/isGlobal'));
}

var _jscodeshift2;

function _jscodeshift() {
  return _jscodeshift2 = _interopRequireDefault(require('jscodeshift'));
}

var match = (_jscodeshift2 || _jscodeshift()).default.match;

// These are the things we should try to remove.
var CONFIG = [
// import type Foo from 'Foo';
{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.ImportDeclaration, { importKind: 'type' }],
  filters: [(_utilsIsGlobal2 || _utilsIsGlobal()).default],
  getNames: function getNames(node) {
    return node.specifiers.map(function (specifier) {
      return specifier.local.name;
    });
  }
}];

function removeUnusedTypes(root, options) {
  var declared = (0, (_utilsGetDeclaredIdentifiers2 || _utilsGetDeclaredIdentifiers()).default)(root, options);
  var used = (0, (_utilsGetNonDeclarationTypes2 || _utilsGetNonDeclarationTypes()).default)(root, options);
  var nonTypeImport = (0, (_utilsGetDeclaredTypes2 || _utilsGetDeclaredTypes()).default)(root, options, [function (path) {
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