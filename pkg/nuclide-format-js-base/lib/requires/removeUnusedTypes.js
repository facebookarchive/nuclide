

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var getDeclaredIdentifiers = require('../utils/getDeclaredIdentifiers');
var getDeclaredTypes = require('../utils/getDeclaredTypes');
var getNonDeclarationTypes = require('../utils/getNonDeclarationTypes');
var isGlobal = require('../utils/isGlobal');
var jscs = require('jscodeshift');

var match = jscs.match;

// These are the things we should try to remove.
var CONFIG = [
// import type Foo from 'Foo';
{
  searchTerms: [jscs.ImportDeclaration, { importKind: 'type' }],
  filters: [isGlobal],
  getNames: function getNames(node) {
    return node.specifiers.map(function (specifier) {
      return specifier.local.name;
    });
  }
}];

function removeUnusedTypes(root, options) {
  var declared = getDeclaredIdentifiers(root, options);
  var used = getNonDeclarationTypes(root, options);
  var nonTypeImport = getDeclaredTypes(root, options, [function (path) {
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