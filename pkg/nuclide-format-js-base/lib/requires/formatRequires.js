

var FirstNode = require('../utils/FirstNode');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var NewLine = require('../utils/NewLine');

var _require = require('../utils/StringUtils');

var compareStrings = _require.compareStrings;
var isCapitalized = _require.isCapitalized;

var hasOneRequireDeclaration = require('../utils/hasOneRequireDeclaration');
var isGlobal = require('../utils/isGlobal');
var isRequireExpression = require('../utils/isRequireExpression');
var jscs = require('jscodeshift');
var reprintRequire = require('../utils/reprintRequire');

// Set up a config to easily add require formats
var CONFIG = [
// Handle type imports
{
  searchTerms: [jscs.ImportDeclaration, { importKind: 'type' }],
  filters: [isGlobal],
  comparator: function comparator(node1, node2) {
    return compareStrings(node1.specifiers[0].local.name, node2.specifiers[0].local.name);
  },
  mapper: function mapper(node) {
    return reprintRequire(node);
  }
},

// Handle side effects, e.g: `require('monkey-patches');`
{
  searchTerms: [jscs.ExpressionStatement],
  filters: [isGlobal, function (path) {
    return isRequireExpression(path.node);
  }],
  comparator: function comparator(node1, node2) {
    return compareStrings(node1.expression.arguments[0].value, node2.expression.arguments[0].value);
  },
  mapper: function mapper(node) {
    return reprintRequire(node);
  }
},

// Handle UpperCase requires, e.g: `require('UpperCase');`
{
  searchTerms: [jscs.VariableDeclaration],
  filters: [isGlobal, function (path) {
    return isValidRequireDeclaration(path.node);
  }, function (path) {
    return isCapitalized(getDeclarationName(path.node));
  }],
  comparator: function comparator(node1, node2) {
    return compareStrings(getDeclarationName(node1), getDeclarationName(node2));
  },
  mapper: function mapper(node) {
    return reprintRequire(node);
  }
},

// Handle lowerCase requires, e.g: `require('lowerCase');`
{
  searchTerms: [jscs.VariableDeclaration],
  filters: [isGlobal, function (path) {
    return isValidRequireDeclaration(path.node);
  }, function (path) {
    return !isCapitalized(getDeclarationName(path.node));
  }],
  comparator: function comparator(node1, node2) {
    return compareStrings(getDeclarationName(node1), getDeclarationName(node2));
  },
  mapper: function mapper(node) {
    return reprintRequire(node);
  }
}];

/**
 * This formats requires based on the left hand side of the require, unless it
 * is a simple require expression in which case there is no left hand side.
 *
 * The groups are:
 *
 *   - import types: import type Foo from 'anything';
 *   - require expressions: require('anything');
 *   - capitalized requires: var Foo = require('anything');
 *   - non-capitalized requires: var foo = require('anything');
 *
 * Array and object destructures are also valid left hand sides. Object patterns
 * are sorted and then the first identifier in each of patterns is used for
 * sorting.
 */
function formatRequires(root) {
  var first = FirstNode.get(root);
  if (!first) {
    return;
  }
  var _first = first; // For flow.

  // Create groups of requires from each config
  var nodeGroups = CONFIG.map(function (config) {
    var paths = root.find(config.searchTerms[0], config.searchTerms[1]).filter(function (path) {
      return config.filters.every(function (filter) {
        return filter(path);
      });
    });

    // Save the underlying nodes before removing the paths
    var nodes = paths.nodes().slice();
    paths.forEach(function (path) {
      return jscs(path).remove();
    });
    return nodes.map(function (node) {
      return config.mapper(node);
    }).sort(config.comparator);
  });

  // Build all the nodes we want to insert, then add them
  var allGroups = [[NewLine.statement]];
  nodeGroups.forEach(function (group) {
    return allGroups.push(group, [NewLine.statement]);
  });
  var nodesToInsert = Array.prototype.concat.apply([], allGroups);
  nodesToInsert.reverse().forEach(function (node) {
    return _first.insertBefore(node);
  });
}

/**
 * Tests if a variable declaration is a valid require declaration.
 */
function isValidRequireDeclaration(node) {
  if (!hasOneRequireDeclaration(node)) {
    return false;
  }
  var declaration = node.declarations[0];
  if (jscs.Identifier.check(declaration.id)) {
    return true;
  }
  if (jscs.ObjectPattern.check(declaration.id)) {
    return declaration.id.properties.every(function (prop) {
      return prop.shorthand && jscs.Identifier.check(prop.key);
    });
  }
  if (jscs.ArrayPattern.check(declaration.id)) {
    return declaration.id.elements.every(function (element) {
      return jscs.Identifier.check(element);
    });
  }
  return false;
}

function getDeclarationName(node) {
  var declaration = node.declarations[0];
  if (jscs.Identifier.check(declaration.id)) {
    return declaration.id.name;
  }
  // Order by the first property name in the object pattern.
  if (jscs.ObjectPattern.check(declaration.id)) {
    return declaration.id.properties[0].key.name;
  }
  // Order by the first element name in the array pattern.
  if (jscs.ArrayPattern.check(declaration.id)) {
    return declaration.id.elements[0].name;
  }
  return '';
}

module.exports = formatRequires;