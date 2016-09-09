function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utilsFirstNode2;

function _utilsFirstNode() {
  return _utilsFirstNode2 = _interopRequireDefault(require('../utils/FirstNode'));
}

var _utilsNewLine2;

function _utilsNewLine() {
  return _utilsNewLine2 = _interopRequireDefault(require('../utils/NewLine'));
}

var _utilsStringUtils2;

function _utilsStringUtils() {
  return _utilsStringUtils2 = require('../utils/StringUtils');
}

var _utilsHasOneRequireDeclaration2;

function _utilsHasOneRequireDeclaration() {
  return _utilsHasOneRequireDeclaration2 = _interopRequireDefault(require('../utils/hasOneRequireDeclaration'));
}

var _utilsIsGlobal2;

function _utilsIsGlobal() {
  return _utilsIsGlobal2 = _interopRequireDefault(require('../utils/isGlobal'));
}

var _utilsIsRequireExpression2;

function _utilsIsRequireExpression() {
  return _utilsIsRequireExpression2 = _interopRequireDefault(require('../utils/isRequireExpression'));
}

var _jscodeshift2;

function _jscodeshift() {
  return _jscodeshift2 = _interopRequireDefault(require('jscodeshift'));
}

var _utilsReprintRequire2;

function _utilsReprintRequire() {
  return _utilsReprintRequire2 = _interopRequireDefault(require('../utils/reprintRequire'));
}

// Set up a config to easily add require formats
var CONFIG = [
// Handle type imports
{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.ImportDeclaration, { importKind: 'type' }],
  filters: [(_utilsIsGlobal2 || _utilsIsGlobal()).default],
  comparator: function comparator(node1, node2) {
    return (0, (_utilsStringUtils2 || _utilsStringUtils()).compareStrings)(node1.specifiers[0].local.name, node2.specifiers[0].local.name);
  },
  mapper: function mapper(node) {
    return (0, (_utilsReprintRequire2 || _utilsReprintRequire()).default)(node);
  }
},

// Handle side effects, e.g: `require('monkey-patches');`
{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.ExpressionStatement],
  filters: [(_utilsIsGlobal2 || _utilsIsGlobal()).default, function (path) {
    return (0, (_utilsIsRequireExpression2 || _utilsIsRequireExpression()).default)(path.node);
  }],
  comparator: function comparator(node1, node2) {
    return (0, (_utilsStringUtils2 || _utilsStringUtils()).compareStrings)(node1.expression.arguments[0].value, node2.expression.arguments[0].value);
  },
  mapper: function mapper(node) {
    return (0, (_utilsReprintRequire2 || _utilsReprintRequire()).default)(node);
  }
},

// Handle UpperCase requires, e.g: `require('UpperCase');`
{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.VariableDeclaration],
  filters: [(_utilsIsGlobal2 || _utilsIsGlobal()).default, function (path) {
    return isValidRequireDeclaration(path.node);
  }, function (path) {
    return (0, (_utilsStringUtils2 || _utilsStringUtils()).isCapitalized)(getDeclarationName(path.node));
  }],
  comparator: function comparator(node1, node2) {
    return (0, (_utilsStringUtils2 || _utilsStringUtils()).compareStrings)(getDeclarationName(node1), getDeclarationName(node2));
  },
  mapper: function mapper(node) {
    return (0, (_utilsReprintRequire2 || _utilsReprintRequire()).default)(node);
  }
},

// Handle lowerCase requires, e.g: `require('lowerCase');`
{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.VariableDeclaration],
  filters: [(_utilsIsGlobal2 || _utilsIsGlobal()).default, function (path) {
    return isValidRequireDeclaration(path.node);
  }, function (path) {
    return !(0, (_utilsStringUtils2 || _utilsStringUtils()).isCapitalized)(getDeclarationName(path.node));
  }],
  comparator: function comparator(node1, node2) {
    return (0, (_utilsStringUtils2 || _utilsStringUtils()).compareStrings)(getDeclarationName(node1), getDeclarationName(node2));
  },
  mapper: function mapper(node) {
    return (0, (_utilsReprintRequire2 || _utilsReprintRequire()).default)(node);
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
  var first = (_utilsFirstNode2 || _utilsFirstNode()).default.get(root);
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
      return (0, (_jscodeshift2 || _jscodeshift()).default)(path).remove();
    });
    return nodes.map(function (node) {
      return config.mapper(node);
    }).sort(config.comparator);
  });

  // Build all the nodes we want to insert, then add them
  var allGroups = [[(_utilsNewLine2 || _utilsNewLine()).default.statement]];
  nodeGroups.forEach(function (group) {
    return allGroups.push(group, [(_utilsNewLine2 || _utilsNewLine()).default.statement]);
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
  if (!(0, (_utilsHasOneRequireDeclaration2 || _utilsHasOneRequireDeclaration()).default)(node)) {
    return false;
  }
  var declaration = node.declarations[0];
  if ((_jscodeshift2 || _jscodeshift()).default.Identifier.check(declaration.id)) {
    return true;
  }
  if ((_jscodeshift2 || _jscodeshift()).default.ObjectPattern.check(declaration.id)) {
    return declaration.id.properties.every(function (prop) {
      return prop.shorthand && (_jscodeshift2 || _jscodeshift()).default.Identifier.check(prop.key);
    });
  }
  if ((_jscodeshift2 || _jscodeshift()).default.ArrayPattern.check(declaration.id)) {
    return declaration.id.elements.every(function (element) {
      return (_jscodeshift2 || _jscodeshift()).default.Identifier.check(element);
    });
  }
  return false;
}

function getDeclarationName(node) {
  var declaration = node.declarations[0];
  if ((_jscodeshift2 || _jscodeshift()).default.Identifier.check(declaration.id)) {
    return declaration.id.name;
  }
  // Order by the first property name in the object pattern.
  if ((_jscodeshift2 || _jscodeshift()).default.ObjectPattern.check(declaration.id)) {
    return declaration.id.properties[0].key.name;
  }
  // Order by the first element name in the array pattern.
  if ((_jscodeshift2 || _jscodeshift()).default.ArrayPattern.check(declaration.id)) {
    return declaration.id.elements[0].name;
  }
  return '';
}

module.exports = formatRequires;