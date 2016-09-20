

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _jscodeshift2;

function _jscodeshift() {
  return _jscodeshift2 = _interopRequireDefault(require('jscodeshift'));
}

var CONFIG = [{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.ImportDeclaration, { importKind: 'type' }],
  filters: [],
  getNodes: function getNodes(path) {
    return path.node.specifiers.map(function (specifier) {
      return specifier.local;
    });
  }
}, {
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.TypeAlias],
  filters: [],
  getNodes: function getNodes(path) {
    return [path.node.id];
  }
}, {
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.TypeParameterDeclaration],
  filters: [],
  getNodes: function getNodes(path) {
    return path.node.params;
  }
},

// TODO: remove these, they should be covered by TypeParameterDeclaration
// but there is a bug in jscodeshift
{
  searchTerms: [(_jscodeshift2 || _jscodeshift()).default.ClassDeclaration],
  filters: [function (path) {
    return path.node.typeParameters && Array.isArray(path.node.typeParameters.params);
  }],
  getNodes: function getNodes(path) {
    return path.node.typeParameters.params;
  }
}];

/**
 * This will get a list of all flow types that are declared within root's AST
 */
function getDeclaredTypes(root, options, filters) {
  // Start with the built in types that are always declared.
  var moduleMap = options.moduleMap;

  var ids = new Set(moduleMap.getBuiltInTypes());
  CONFIG.forEach(function (config) {
    root.find(config.searchTerms[0], config.searchTerms[1]).filter(function (path) {
      return filters ? filters.every(function (filter) {
        return filter(path);
      }) : true;
    }).filter(function (path) {
      return config.filters.every(function (filter) {
        return filter(path);
      });
    }).forEach(function (path) {
      var nodes = config.getNodes(path);
      nodes.forEach(function (node) {
        if ((_jscodeshift2 || _jscodeshift()).default.Identifier.check(node)) {
          ids.add(node.name);
        }
      });
    });
  });
  return ids;
}

module.exports = getDeclaredTypes;