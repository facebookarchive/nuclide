

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _getNamesFromID2;

function _getNamesFromID() {
  return _getNamesFromID2 = _interopRequireDefault(require('./getNamesFromID'));
}

var _jscodeshift2;

function _jscodeshift() {
  return _jscodeshift2 = _interopRequireDefault(require('jscodeshift'));
}

/**
 * These are the ways in which an identifier might be declared, note that these
 * identifiers are safe to use in code. They should not include types that have
 * been declared.
 */
var CONFIG = [
// function foo(...rest) {}
{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.FunctionDeclaration],
  getNodes: function getNodes(path) {
    return [path.node.id, path.node.rest].concat(path.node.params);
  }
},

// foo(...rest) {}, in a class body for example
{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.FunctionExpression],
  getNodes: function getNodes(path) {
    return [path.node.rest].concat(path.node.params);
  }
},

// var foo;
{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.VariableDeclaration],
  getNodes: function getNodes(path) {
    return path.node.declarations.map(function (declaration) {
      return declaration.id;
    });
  }
},

// class foo {}
{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.ClassDeclaration],
  getNodes: function getNodes(path) {
    return [path.node.id];
  }
},

// (foo, ...rest) => {}
{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.ArrowFunctionExpression],
  getNodes: function getNodes(path) {
    return [path.node.rest].concat(path.node.params);
  }
},

// try {} catch (foo) {}
{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.CatchClause],
  getNodes: function getNodes(path) {
    return [path.node.param];
  }
},

// function foo(a = b) {}
{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.AssignmentPattern],
  getNodes: function getNodes(path) {
    return [path.node.left];
  }
}];

/**
 * This will get a list of all identifiers that are declared within root's AST
 */
function getDeclaredIdentifiers(root, options, filters) {
  // Start with the globals since they are always "declared" and safe to use.
  var moduleMap = options.moduleMap;

  var ids = new Set(moduleMap.getBuiltIns());
  CONFIG.forEach(function (config) {
    root.find(config.searchTerms[0], config.searchTerms[1]).filter(function (path) {
      return filters ? filters.every(function (filter) {
        return filter(path);
      }) : true;
    }).forEach(function (path) {
      var nodes = config.getNodes(path);
      nodes.forEach(function (node) {
        var names = (0, (_getNamesFromID2 || _getNamesFromID()).default)(node);
        for (var _name of names) {
          ids.add(_name);
        }
      });
    });
  });
  return ids;
}

module.exports = getDeclaredIdentifiers;