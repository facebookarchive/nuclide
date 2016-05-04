function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utilsFirstNode = require('../utils/FirstNode');

var _utilsFirstNode2 = _interopRequireDefault(_utilsFirstNode);

var _utilsNewLine = require('../utils/NewLine');

var _utilsNewLine2 = _interopRequireDefault(_utilsNewLine);

var _utilsStringUtils = require('../utils/StringUtils');

var _utilsHasOneRequireDeclaration = require('../utils/hasOneRequireDeclaration');

var _utilsHasOneRequireDeclaration2 = _interopRequireDefault(_utilsHasOneRequireDeclaration);

var _utilsIsGlobal = require('../utils/isGlobal');

var _utilsIsGlobal2 = _interopRequireDefault(_utilsIsGlobal);

var _utilsIsRequireExpression = require('../utils/isRequireExpression');

var _utilsIsRequireExpression2 = _interopRequireDefault(_utilsIsRequireExpression);

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var _utilsReprintRequire = require('../utils/reprintRequire');

var _utilsReprintRequire2 = _interopRequireDefault(_utilsReprintRequire);

// Set up a config to easily add require formats
var CONFIG = [
// Handle type imports
{
  searchTerms: [_jscodeshift2.default.ImportDeclaration, { importKind: 'type' }],
  filters: [_utilsIsGlobal2.default],
  comparator: function comparator(node1, node2) {
    return (0, _utilsStringUtils.compareStrings)(node1.specifiers[0].local.name, node2.specifiers[0].local.name);
  },
  mapper: function mapper(node) {
    return (0, _utilsReprintRequire2.default)(node);
  }
},

// Handle side effects, e.g: `require('monkey-patches');`
{
  searchTerms: [_jscodeshift2.default.ExpressionStatement],
  filters: [_utilsIsGlobal2.default, function (path) {
    return (0, _utilsIsRequireExpression2.default)(path.node);
  }],
  comparator: function comparator(node1, node2) {
    return (0, _utilsStringUtils.compareStrings)(node1.expression.arguments[0].value, node2.expression.arguments[0].value);
  },
  mapper: function mapper(node) {
    return (0, _utilsReprintRequire2.default)(node);
  }
},

// Handle UpperCase requires, e.g: `require('UpperCase');`
{
  searchTerms: [_jscodeshift2.default.VariableDeclaration],
  filters: [_utilsIsGlobal2.default, function (path) {
    return isValidRequireDeclaration(path.node);
  }, function (path) {
    return (0, _utilsStringUtils.isCapitalized)(getDeclarationName(path.node));
  }],
  comparator: function comparator(node1, node2) {
    return (0, _utilsStringUtils.compareStrings)(getDeclarationName(node1), getDeclarationName(node2));
  },
  mapper: function mapper(node) {
    return (0, _utilsReprintRequire2.default)(node);
  }
},

// Handle lowerCase requires, e.g: `require('lowerCase');`
{
  searchTerms: [_jscodeshift2.default.VariableDeclaration],
  filters: [_utilsIsGlobal2.default, function (path) {
    return isValidRequireDeclaration(path.node);
  }, function (path) {
    return !(0, _utilsStringUtils.isCapitalized)(getDeclarationName(path.node));
  }],
  comparator: function comparator(node1, node2) {
    return (0, _utilsStringUtils.compareStrings)(getDeclarationName(node1), getDeclarationName(node2));
  },
  mapper: function mapper(node) {
    return (0, _utilsReprintRequire2.default)(node);
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
  var first = _utilsFirstNode2.default.get(root);
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
      return (0, _jscodeshift2.default)(path).remove();
    });
    return nodes.map(function (node) {
      return config.mapper(node);
    }).sort(config.comparator);
  });

  // Build all the nodes we want to insert, then add them
  var allGroups = [[_utilsNewLine2.default.statement]];
  nodeGroups.forEach(function (group) {
    return allGroups.push(group, [_utilsNewLine2.default.statement]);
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
  if (!(0, _utilsHasOneRequireDeclaration2.default)(node)) {
    return false;
  }
  var declaration = node.declarations[0];
  if (_jscodeshift2.default.Identifier.check(declaration.id)) {
    return true;
  }
  if (_jscodeshift2.default.ObjectPattern.check(declaration.id)) {
    return declaration.id.properties.every(function (prop) {
      return prop.shorthand && _jscodeshift2.default.Identifier.check(prop.key);
    });
  }
  if (_jscodeshift2.default.ArrayPattern.check(declaration.id)) {
    return declaration.id.elements.every(function (element) {
      return _jscodeshift2.default.Identifier.check(element);
    });
  }
  return false;
}

function getDeclarationName(node) {
  var declaration = node.declarations[0];
  if (_jscodeshift2.default.Identifier.check(declaration.id)) {
    return declaration.id.name;
  }
  // Order by the first property name in the object pattern.
  if (_jscodeshift2.default.ObjectPattern.check(declaration.id)) {
    return declaration.id.properties[0].key.name;
  }
  // Order by the first element name in the array pattern.
  if (_jscodeshift2.default.ArrayPattern.check(declaration.id)) {
    return declaration.id.elements[0].name;
  }
  return '';
}

module.exports = formatRequires;